import {fmt as f} from './lab-core.js';
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
const svg=(body,label,h=330)=>`<svg class="foundation-svg" viewBox="0 0 590 ${h}" role="img" aria-label="${label}">${body}</svg>`;
const empty='<p class="visual-empty">Perbaiki input untuk menampilkan gambar dan hasil yang baru.</p>';
const fill='fill="#99ae8d" stroke="#405d4c" stroke-width="2"';
export const verdict=v=>v===null?'— tidak dihitung':v?'✓ memenuhi':'✗ belum memenuhi';

export function alternativesDrawing(e){
  if(e.status==='invalid')return empty;
  const r=e.result,A=r.alternative_A,B=r.alternative_B,shaft=r.kind==='shaft';
  let shapes,k;
  if(shaft){
    k=150/e.data.d_mm;const R=e.data.d_mm*k/2;
    shapes=[A,B].map((a,i)=>{const cx=150+i*290;return `<circle cx="${cx}" cy="125" r="${R}" ${fill}/>${a.di_mm>0?`<circle cx="${cx}" cy="125" r="${a.di_mm*k/2}" fill="#fff" stroke="#405d4c" stroke-width="2"/>`:''}`;});
  }else{
    const span=Math.max(A.b_mm,A.h_mm,B.b_mm,B.h_mm);k=160/span;
    shapes=[A,B].map((a,i)=>{const cx=150+i*290;return `<rect x="${cx-a.b_mm*k/2}" y="${205-a.h_mm*k}" width="${a.b_mm*k}" height="${a.h_mm*k}" ${fill}/>`;});
  }
  const label=(a,i)=>{const cx=150+i*290,lines=shaft?[`m = ${f(a.mass_kg,4)} kg`,`τmax = ${f(a.tauMax_MPa,4)} MPa`,`θ = ${a.theta_deg===null?'—':f(a.theta_deg,4)+'°'}`]:[`m = ${f(a.mass_kg,4)} kg`,`σmax = ${f(a.sigmaMax_MPa,4)} MPa`,`δ = ${a.deltaMax_mm===null?'—':f(a.deltaMax_mm,4)+' mm'}`];
    return `${text(cx,30,`Alternatif ${a.key}${shaft?(a.di_mm>0?' · berongga':' · pejal'):` · ${f(a.b_mm)} × ${f(a.h_mm)} mm`}`,'text-anchor="middle"')}${lines.map((l,j)=>text(cx,240+j*22,l,'text-anchor="middle" class="diagram-small"')).join('')}${text(cx,312,a.allMet?'✓ semua kriteria latihan':'✗ ada kriteria belum terpenuhi','text-anchor="middle" class="diagram-small"')}`;};
  return svg(`${shapes.join('')}${[A,B].map(label).join('')}<path d="M295 45V300" stroke="#d6dfcd"/>`,
    `Alternatif A dan B digambar dengan skala sama. A: massa ${f(A.mass_kg)} kg; B: massa ${f(B.mass_kg)} kg. ${A.allMet?'A memenuhi semua kriteria.':'A belum memenuhi semua kriteria.'} ${B.allMet?'B memenuhi semua kriteria.':'B belum memenuhi semua kriteria.'}`,325)+
    `<p class="figure-caption">${shaft?'Penampang poros dengan diameter luar sama. Rongga mengurangi massa banyak, tetapi J hanya turun sedikit karena material dekat sumbu menyumbang sedikit kekakuan puntir.':'Penampang balok dengan luas (dan massa) sama, beban vertikal. Orientasi menentukan I, sehingga kekuatan dan kekakuan berbeda walaupun massanya sama.'} Skala sama untuk kedua gambar.</p>`;
}

export function utilizationBars(e){
  if(e.status==='invalid')return empty;
  const r=e.result,d=e.data,shaft=r.kind==='shaft';
  const rows=[r.alternative_A,r.alternative_B].flatMap(a=>[
    [`${a.key} · kekuatan (n target / n)`,a.n_yield===null?0:d.n_required/a.n_yield],
    [`${a.key} · ${shaft?'puntiran (θ / batas)':'lendutan (δ / batas)'}`,shaft?(a.theta_deg===null?null:a.theta_deg/d.theta_limit_deg):(a.deltaMax_mm===null?null:a.deltaMax_mm/d.deflection_limit_mm)],
  ]);
  const top=Math.max(1.25,...rows.map(([,v])=>(v??0)*1.1)),X=v=>250+v/top*300;
  return svg(`${text(20,26,'Pemakaian kriteria (≤ 100% berarti memenuhi)')}${rows.map(([label,v],i)=>{const y=48+i*48;return `${text(20,y+17,label,'class="diagram-small"')}${v===null?text(250,y+17,'tidak dihitung','class="diagram-small"'):`<rect x="250" y="${y}" width="${Math.max(2,X(v)-250)}" height="24" rx="3" fill="${v<=1+1e-12?'#405d4c':'#c85d35'}"/>${X(v)+60>580?text(X(v)-8,y+17,`${f(v*100,3)}%`,'class="diagram-small" text-anchor="end" style="fill:#fff"'):text(X(v)+8,y+17,`${f(v*100,3)}%`,'class="diagram-small"')}`}`;}).join('')}
    <path d="M${X(1)} 40V${48+rows.length*48}" stroke="#263e34" stroke-dasharray="5 4"/>${text(X(1),48+rows.length*48+20,'100%','text-anchor="middle" class="diagram-small"')}`,
    `Pemakaian kriteria kekuatan dan ${shaft?'puntiran':'lendutan'} untuk alternatif A dan B dibandingkan batas 100 persen.`,48+rows.length*48+40)+
    `<p class="figure-caption">Kekuatan: n target dibagi n aktual. ${shaft?'Puntiran: θ dibagi batas θ.':'Lendutan: δ dibagi batas δ.'} Batang oranye melewati 100% berarti kriteria itu belum terpenuhi. Kekuatan dan kekakuan dinilai terpisah; satu label hijau tidak menyembunyikan kegagalan lain.</p>`;
}

export function decisionMatrix(e){
  if(e.status==='invalid')return empty;
  const r=e.result,d=e.data,shaft=r.kind==='shaft',[A,B]=[r.alternative_A,r.alternative_B];
  const rows=[
    ['Massa',`${f(A.mass_kg,5)} kg`,`${f(B.mass_kg,5)} kg`],
    [`Kekuatan: n ≥ ${f(d.n_required)}`,`n = ${A.n_yield===null?'tak terdefinisi':f(A.n_yield,4)} · ${verdict(A.strength)}`,`n = ${B.n_yield===null?'tak terdefinisi':f(B.n_yield,4)} · ${verdict(B.strength)}`],
    shaft?[`Kekakuan: θ ≤ ${f(d.theta_limit_deg)}°`,`θ = ${A.theta_deg===null?'—':f(A.theta_deg,4)+'°'} · ${verdict(A.stiffness)}`,`θ = ${B.theta_deg===null?'—':f(B.theta_deg,4)+'°'} · ${verdict(B.stiffness)}`]
      :[`Kekakuan: δ ≤ ${f(d.deflection_limit_mm)} mm`,`δ = ${A.deltaMax_mm===null?'—':f(A.deltaMax_mm,4)+' mm'} · ${verdict(A.stiffness)}`,`δ = ${B.deltaMax_mm===null?'—':f(B.deltaMax_mm,4)+' mm'} · ${verdict(B.stiffness)}`],
    ['Semua kriteria latihan',A.allMet?'✓ ya':'✗ tidak',B.allMet?'✓ ya':'✗ tidak'],
  ];
  const dec=r.decision,why=dec.rule==='only'?'satu-satunya alternatif yang memenuhi semua kriteria':dec.rule==='mass'?'keduanya memenuhi; dipilih yang lebih ringan':dec.rule==='margin'?'keduanya memenuhi dengan massa sama; dipilih yang margin kekuatannya lebih besar':'';
  return `<div class="table-scroll"><table><thead><tr><th>Kriteria latihan</th><th>Alternatif A</th><th>Alternatif B</th></tr></thead><tbody>${rows.map(([k,a,b])=>`<tr><th>${k}</th><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody></table></div>
    <p class="decision-line"><strong>${dec.choice?`Rekomendasi latihan: alternatif ${dec.choice}`:'Belum ada alternatif yang memenuhi semua kriteria'}</strong>${dec.choice?` — ${why}.`:'. Ubah dimensi atau tinjau kembali kriterianya, lalu jelaskan alasanmu.'}</p>
    <p class="small muted">Aturan keputusan latihan: hanya alternatif yang memenuhi semua kriteria yang dipertimbangkan; lalu pilih yang lebih ringan, dan jika massanya sama, yang margin kekuatannya lebih besar. Kamu boleh berargumen lain (biaya, ketersediaan, getaran, sambungan) asal alasannya dinyatakan.</p>`;
}

export function designSummary(e,context){
  if(e.status==='invalid')return '<p class="empty-result">Ringkasan muncul setelah input valid.</p>';
  const r=e.result,d=e.data,shaft=r.kind==='shaft',[A,B]=[r.alternative_A,r.alternative_B];
  const saving=r.massSaving===null?'':Math.abs(r.massSaving)<1e-9?'Massa A dan B sama':`B ${r.massSaving>0?'lebih ringan':'lebih berat'} ${f(Math.abs(r.massSaving)*100,3)}% daripada A`;
  const swGeom=shaft?`poros lurus Ø${f(d.d_mm)} mm (A pejal, B dengan lubang Ø${f(d.di_B_mm)} mm), panjang ${f(d.L_mm)} mm`:`balok prismatik ${f(A.b_mm)}×${f(A.h_mm)} mm (A) dan ${f(B.b_mm)}×${f(B.h_mm)} mm (B), panjang ${f(d.L_mm)} mm`;
  const swBC=shaft?`satu ujung fixed, torsi ${f(d.T_Nmm/1000)} N·m pada muka ujung lainnya`:'tumpuan sendi di satu ujung dan rol di ujung lain (garis tumpuan), gaya terpisah pada garis tengah bentang';
  const swRead=shaft?'baca τ (atau σ_vm) di permukaan pada tengah panjang, jauh dari muka yang dijepit dan dibebani; bandingkan juga rotasi ujung':'baca σ serat atas/bawah di dekat tengah bentang tetapi tidak tepat di titik gaya, serta lendutan vertikal di tengah';
  return `<div class="summary-sheet"><h3>Ringkasan rancangan · ${context==='mesin'?'Mesin':'Kapal'}</h3>
    <p><strong>Tujuan:</strong> ${shaft?`memilih poros untuk torsi ${f(d.T_Nmm/1000)} N·m dengan diameter luar tetap ${f(d.d_mm)} mm`:`memilih orientasi balok untuk beban ${f(d.P_N/1000)} kN di tengah bentang ${f(d.L_mm)} mm`}.</p>
    <p><strong>Kriteria latihan:</strong> n luluh ≥ ${f(d.n_required)} dan ${shaft?`θ ≤ ${f(d.theta_limit_deg)}°`:`δ ≤ ${f(d.deflection_limit_mm)} mm`}. Kriteria ini dipilih untuk latihan, bukan kutipan standar atau aturan kelas.</p>
    <p><strong>Hasil:</strong> A ${A.allMet?'memenuhi':'belum memenuhi'} semua kriteria; B ${B.allMet?'memenuhi':'belum memenuhi'} semua kriteria. ${saving}. ${shaft?`J_B/J_A = ${f(r.stiffnessRatio,4)}`:`I_B/I_A = ${f(r.stiffnessRatio,4)}`}.${!shaft&&!B.stiffness&&B.stiffness!==null?` Agar B memenuhi batas lendutan pada lebar ${f(B.b_mm)} mm, tinggi minimum ≈ ${f(r.hMinB_mm,4)} mm (luas dan massa ikut bertambah).`:''}</p>
    <p><strong>Keputusan:</strong> ${r.decision.choice?`alternatif ${r.decision.choice} menurut aturan keputusan latihan`:'belum ada alternatif yang memenuhi semua kriteria'}.</p>
    <p><strong>Batas kesimpulan:</strong> model analitis elastis ideal; belum memeriksa ${shaft?'alur pasak, bahu poros, lentur akibat puli/bantalan, fatigue, getaran torsional dan putaran kritis':'tegangan geser, tekuk lateral-torsional, pelat geladak yang ikut bekerja, sambungan, berat sendiri dan beban dinamis'}. Bukan pernyataan aman.</p></div>
    <details class="sw-companion"><summary>Pendamping SolidWorks: rencana pembandingan</summary><ol>
    <li><strong>Geometri:</strong> ${swGeom}. Gunakan ukuran yang sama persis dengan input aktif, tanpa fillet atau lubang tambahan.</li>
    <li><strong>Material:</strong> isotropik linier, E = ${f(d.E_MPa/1000)} GPa${shaft?`, ν = ${f(d.nu)}`:''}, ρ = ${f(d.rho_kg_m3)} kg/m³. Catat bila memakai material pustaka dengan nilai berbeda.</li>
    <li><strong>Tumpuan dan beban:</strong> ${swBC}. Catat bahwa tumpuan ideal di model FEA dapat menimbulkan tegangan lokal tinggi.</li>
    <li><strong>Mesh:</strong> mulai dari mesh standar, lalu perhalus minimal dua kali; hasil dianggap konvergen bila nilai yang dibandingkan berubah kurang dari ±2%.</li>
    <li><strong>Pembacaan:</strong> ${swRead}. Jangan memakai tegangan puncak di titik tumpuan atau titik gaya (singularitas) untuk memvalidasi tegangan nominal.</li>
    <li><strong>Laporan:</strong> tabel nilai analitis situs vs SolidWorks, selisih (%), ukuran mesh, dan penjelasan sumber selisih (kondisi batas, singularitas, ${shaft?'deformasi muka ujung':'deformasi geser pada balok pendek'}).</li></ol></details>`;
}
