"""Generate F0 specification data and independent analytic SI oracles. No FE solver."""
from pathlib import Path
import json, math, hashlib
from collections import Counter
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent
source=ROOT/'docs/m0/reference_cases.json'
m0=json.loads(source.read_text())
BASE='8aa939defe0b41d832186b6b7eeece6477ad1568'
def write(name,data): (HERE/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def beam(P,L,b,h,E,a=None):
    # SI N,m,Pa, return N,mm,MPa.
    I=b*h**3/12; A=b*h; a=L/2 if a is None else a
    ra=P*(L-a)/L; rb=P*a/L; M=ra*a
    # Deflection at applied force, arbitrary a, simply-supported beam.
    delta=P*a*a*(L-a)**2/(3*E*I*L)
    return dict(A_mm2=A*1e6,I_mm4=I*1e12,R_N=ra,RB_N=rb,Mmax_Nmm=M*1000,sigmaMax_MPa=M*h/(2*I)/1e6,delta_at_load_mm=delta*1000,**({'deltaMax_mm':delta*1000} if a==L/2 else {}))
def torsion(T,do,di,L,E,nu):
    J=math.pi*(do**4-di**4)/32;G=E/(2*(1+nu));tau=T*do/(2*J);theta=T*L/(G*J)
    return dict(J_mm4=J*1e12,tauMax_MPa=tau/1e6,theta_rad=theta,theta_deg=math.degrees(theta))
def reference(c):
    i=c['input'];mod=c['id'][:2]; get=lambda k:i[k]; out={};supp={}
    if mod=='01':
        P=get('P_N');L=get('L_mm')/1000;a=get('a_mm')/1000;b,h=((.06,.12) if c['id'].endswith('M') else (.1,.2))
        r=beam(P,L,b,h,200e9,a);out=dict(RA_N=r['R_N'],RB_N=r['RB_N'],M_at_load_Nmm=r['Mmax_Nmm']);supp={'delta_at_load_mm':r['delta_at_load_mm'],'A_mm2':r['A_mm2'],'I_mm4':r['I_mm4']}
    if mod in ['02','03']:
        d=get('d_mm')/1000;L=get('L_mm')/1000;E=get('E_MPa')*1e6;F=get('F_N');A=math.pi*d*d/4;s=F/A;ep=s/E;delta=ep*L
        out=dict(A_mm2=A*1e6,sigma_MPa=s/1e6,epsilon=ep,delta_mm=delta*1000)
        if mod=='03':
            nu=get('nu');out.update(k_N_per_mm=A*E/L/1000,epsilon_lateral=-nu*ep,delta_d_mm=-nu*ep*d*1000,G_MPa=E/(2*(1+nu))/1e6,delta_if_E70000_mm=F*L/(A*70e9)*1000)
            supp={'U_J':F*delta/2}
    if mod=='04':
        d=get('d_mm')/1000;F=get('F_N');t=get('t_center_mm')/1000;Ap=math.pi*d*d/4
        out=dict(A_pin_mm2=Ap*1e6,tau_avg_MPa=F/(get('n_planes')*Ap)/1e6,bearing_center_MPa=F/(t*d)/1e6)
        supp={'center_force_N':F,'center_p0_MPa':2*F/(math.pi*(d/2)*t)/1e6,'center_sigma_net_MPa':F/((6*d-d)*t)/1e6}
        if get('n_planes')==2:
            to=get('t_each_outer_mm')/1000;out['bearing_each_outer_MPa']=(F/2)/(to*d)/1e6
            supp.update(outer_each_force_N=F/2,outer_each_p0_MPa=2*(F/2)/(math.pi*(d/2)*to)/1e6)
    if mod=='05': out=torsion(get('T_Nmm')/1000,get('d_mm')/1000,get('di_mm')/1000,get('L_mm')/1000,get('E_MPa')*1e6,get('nu'))
    if mod=='06':
        r=beam(get('P_N'),get('L_mm')/1000,get('b_mm')/1000,get('h_mm')/1000,get('E_MPa')*1e6);out={k:r[k] for k in c['expected']}
    if mod=='07':
        out={}
        for name,b,h in [('orientation_A',get('b_mm'),get('h_mm')),('orientation_B',get('h_mm'),get('b_mm'))]:
            r=beam(get('P_N'),get('L_mm')/1000,b/1000,h/1000,get('E_MPa')*1e6);out[name]={k:r[k] for k in c['expected'][name]}
    if mod=='08':
        d=get('d_mm')/1000;di=get('di_mm')/1000;L=get('L_mm')/1000;A=math.pi*(d*d-di*di)/4;eps=get('alpha_per_C')*get('deltaT_C');s=-get('E_MPa')*1e6*eps
        out=dict(A_mm2=A*1e6,delta_free_mm=eps*L*1000,sigma_fully_fixed_MPa=s/1e6,reactionMagnitude_N=abs(s)*A,delta_fully_fixed_mm=0)
    if mod=='09':
        d=get('d_mm')/1000;A=math.pi*d*d/4;I=math.pi*d**4/64;J=2*I;sa=get('F_N')/A;sb=(get('M_Nmm')/1000)*d/(2*I);tau=(get('T_Nmm')/1000)*d/(2*J);a=sa+sb;b=sa-sb;vm=max(math.sqrt(a*a+3*tau*tau),math.sqrt(b*b+3*tau*tau))
        out=dict(A_mm2=A*1e6,I_mm4=I*1e12,J_mm4=J*1e12,sigma_edge_A_MPa=a/1e6,sigma_edge_B_MPa=b/1e6,tau_surface_MPa=tau/1e6,sigma_vm_max_MPa=vm/1e6,n_yield=get('Sy_MPa')*1e6/vm)
    if mod=='10' and c['id'].endswith('M'):
        out={}
        for key in ['A','B']:
            d=get('d_mm')/1000;di=get(f'di_{key}_mm')/1000;L=get('L_mm')/1000
            r=torsion(get('T_Nmm')/1000,d,di,L,get('E_MPa')*1e6,get('nu'));r['mass_kg']=get('rho_kg_m3')*math.pi*(d*d-di*di)/4*L;r['n_yield']=get('Sy_MPa')/(math.sqrt(3)*r['tauMax_MPa']);out[f'alternative_{key}']=r
    if c['id']=='10-K':
        out={}
        for key in ['A','B']:
            r=beam(get('P_N'),get('L_mm')/1000,get(f'b_{key}_mm')/1000,get(f'h_{key}_mm')/1000,get('E_MPa')*1e6);out[f'alternative_{key}']={k:r[k] for k in c['expected'][f'alternative_{key}']}
    return out,supp
names={1:('Penyangga alat produksi','Balok geladak penyangga peralatan'),2:('Batang pengikat mesin','Tie rod struktur kapal'),3:('Batang penarik mekanisme','Batang penggantung platform'),4:('Pin mekanisme pengangkat','Pin clevis padeye ideal'),5:('Poros transmisi','Segmen poros propeler'),6:('Balok penyangga mesin','Balok geladak'),7:('Orientasi profil rangka','Orientasi penegar geladak'),8:('Pipa instalasi mesin','Pipa kamar mesin kapal'),9:('Poros lentur–torsi','Poros dorong–torsi'),10:('Poros pejal–berongga','Orientasi balok geladak')}
groups={1:'beam',2:'axisymmetric',3:'axisymmetric',4:'pin_plate',5:'torsion',6:'beam',7:'beam',8:'axisymmetric',9:'combined'}
contracts={
'beam':('F2','BEAM2','ux(0)=uy(0)=uy(L)=0; rotasi bebas; node pada beban','Beban ke bawah pada x=a atau L/2; 06 UDL alternatif eksklusif','PS2 hanya persegi panjang; resultan strip dan ROI harus dicatat','03_validasi_dan_toleransi.md#daftar-fixture-wajib'),
'axisymmetric':('F3','AX2','uz(0)=0; ur bebas kecuali sumbu; 08 fixed menambah uz(L)=0','Tarik F total lingkaran pada muka z=L atau εth=αΔT','Bobot 2πr; bukan plane stress; tanpa tekanan internal','03_validasi_dan_toleransi.md#daftar-fixture-wajib'),
'pin_plate':('F6','PS2','Pelat x=0 ux=uy=0; tepi selain arc tumpu bebas','Traction cosinus radial pada setengah kanan lubang, resultan Fplate','Hanya pelat; pin/dua bidang geser tetap hitungan nominal terpisah; tanpa kontak','03_validasi_dan_toleransi.md#daftar-fixture-wajib'),
'torsion':('F4','TOR2','Natural pada semua batas luar/dalam; mean ψ=0','T/G menghasilkan κ dari Jt; input daya/rpm dikonversi ke T aktif','Prismatik Saint-Venant; tidak memodelkan ujung/keyway/fatigue','03_validasi_dan_toleransi.md#daftar-fixture-wajib'),
'combined':('F5','COMB','BEAM2 kantilever untuk normal; TOR2 penampang natural/gauge','Gaya aksial F dan kopel M ujung, torsi T; titik penampang z=L/2','Superposisi/pemulihan tegangan; bukan solid 3D; tegangan nominal jauh dari ujung','03_validasi_dan_toleransi.md#daftar-fixture-wajib')}
def flat(d,p=''):
    for k,v in d.items():
        path=p+'.'+k if p else k
        if isinstance(v,dict): yield from flat(v,path)
        else: yield path,v
rows=[];fixtures=[];checks=0
for c in m0['cases']:
    n=int(c['id'][:2]);isM=c['id'].endswith('M');group=('torsion' if isM else 'beam') if n==10 else groups[n]
    stage,kernel,bc,load,limit,validation=contracts[group];extra={};provenance={}
    if n==1:extra.update(b_mm=60 if isM else 100,h_mm=120 if isM else 200,E_MPa=200000,nu=.3,Sy_MPa=250)
    if n in [2,6,7,8]:extra['nu']=.3
    if n in [2,3,5,6,7,8]:extra['Sy_MPa']=250
    if n==4:extra.update(plate_length_mm=8*c['input']['d_mm'],plate_width_mm=6*c['input']['d_mm'],hole_center_x_mm=3*c['input']['d_mm'],hole_center_y_mm=0,hole_d_mm=c['input']['d_mm'],E_MPa=200000,nu=.3,Sy_MPa=250)
    if n==9:extra.update(L_mm=1000 if isM else 2000,E_MPa=200000,nu=.3)
    if n==10 and not isM:extra.update(nu=.3,rho_kg_m3=7850)
    for key in extra:provenance[key]='Asumsi tambahan F0 untuk FE; bukan data RPS/material bersertifikat.'
    ref,supp=reference(c)
    got=dict(flat(ref));want=dict(flat(c['expected']))
    assert set(got)==set(want),(c['id'],set(got)^set(want))
    for key,v in want.items():assert abs(got[key]-v)<=1e-9+1e-6*abs(v),(c['id'],key,got[key],v)
    checks+=len(want)
    rows.append(dict(id=c['id'],name=names[n][0 if isM else 1],context='mesin' if isM else 'kapal',stage=stage,family=group,kernel=kernel,status='planned',baseline_input=c['input'],additional_input=extra,additional_input_origin=provenance,boundary_conditions=bc,loading=load,limits=limit,validation_contract=validation,analytic_comparison_fields=list(want),comparison_roles={k:('analytic_only_not_FE_pin' if n==4 else 'derived_material' if k=='G_MPa' else 'geometry_or_section_integral' if k.split('.')[-1] in ['A_mm2','I_mm4','J_mm4','mass_kg'] else 'matched_FE_quantity') for k in want},fe_comparison_scope='subset_nominal_only' if n==4 else 'matched_quantities_only',route=f"/modul/{n:02d}/fe/{'mesin' if isM else 'kapal'}/"))
    fixtures.append(dict(id=c['id'],status='analytic_reference_only_not_fe',expected=ref,supplemental_analytic=supp))
assert checks==133
counts=Counter(r['family'] for r in rows);assert counts==dict(beam=7,axisymmetric=6,torsion=3,combined=2,pin_plate=2)
sha=hashlib.sha256(source.read_bytes()).hexdigest()
write('case_matrix.json',dict(version='0.1',date_wib='2026-11-27',baseline_commit=BASE,m0_sha256=sha,status='F0_specification_only',cases=rows))
write('analytic_fixtures.json',dict(version='0.1',units='N, mm, MPa, rad, kg; derived independently in SI',generator='prepare_f0.py; no production model imports and no FE assembly',status='analytic_reference_only_not_fe',cases=fixtures))
lines=['# F0 — Matriks 20 kasus','', 'Semua status FE: **planned**. Angka awal M0 dipertahankan; nilai tambahan di bawah adalah asumsi latihan F0. Ini bukan hasil solver.','', '| Kasus | Nama | Tahap / kernel | Tambahan input | Batas khusus |','| --- | --- | --- | --- | --- |']
for r in rows:
    extra='; '.join(f'{k}={v}' for k,v in r['additional_input'].items()) or 'Tidak ada angka utama baru; kontrak geometri/BC/mesh tetap ditambahkan.'
    lines.append(f"| {r['id']} | {r['name']} | {r['stage']} / {r['kernel']} | {extra} | {r['limits']} |")
lines+=['','Detail kondisi batas, beban, field pembanding dan rute terdapat pada `case_matrix.json`.','', '## Aturan penambahan data','', '- 01: b/h hanya memungkinkan pembanding deformasi baru; reaksi M0 tidak bergantung pada asumsi kekakuan ini. δ_at_load berbeda dari δ maksimum untuk beban eksentris.','- 04: diameter lubang sama dengan pin untuk geometri submodel tanpa kontak. Pada 04-K jalankan pelat tengah F penuh dan pelat luar masing-masing F/2, dengan tebal masing-masing. Tegangan bearing nominal dan puncak FE adalah besaran berbeda.','- 09: panjang tambahan menentukan deformasi submodel, bukan mengubah tegangan nominal M0 pada F/M/T tetap.','- 07 dan 10 mempunyai subrun A/B; 08 bebas/terkekang; 04-K tengah/luar. Subrun bukan kasus kurikulum baru.','- 07 profil I/T/pipa menggunakan elemen balok dengan properti penampang; mesh PS2 persegi panjang tidak dipakai diam-diam untuk seluruh profil.','- 10-K massa memakai ρ tambahan sebagai asumsi latihan dan tidak menambahkannya ke target numerik M0 yang tidak memuat massa.']
(HERE/'02_matriks_20_kasus.md').write_text('\n'.join(lines)+'\n')
report=dict(status='F0_data_checks_passed_not_FE_validation',cases=len(rows),numeric_m0_outputs=checks,families=dict(counts),m0_sha256=sha,checks=['20 unique IDs exactly match M0','7+6+3+2+2 case coverage','baseline inputs preserved','133 independently recomputed analytic outputs match M0','extra input provenance explicit','routes unique','no solver result claimed'])
assert len({r['route'] for r in rows})==20
write('verification_f0.json',report)
print(json.dumps(report,indent=2))
