import {combinedFields} from '../combined-model.js';
import {field} from '../lab-core.js';
import {polarT6Mesh,TOR_LEVELS} from './torsion-mesh.js';
import {torsionSample} from './torsion-solver.js';
import {solveFE} from './solver.js';
export {TOR_LEVELS};
export const COMB_VERSION='F5-0.1';
export const combFields={...combinedFields,M_Nmm:{...combinedFields.M_Nmm,label:'Momen M (positif membuat A tarik)',signed:true},T_Nmm:{...combinedFields.T_Nmm,label:'Torsi T terhadap +z',signed:true},L_mm:field('Panjang submodel L',{mm:1,m:1000},{positive:true,max:1e5}),E_MPa:field('Modulus elastisitas E',{GPa:1000,MPa:1},{positive:true,max:1e6}),nu:field('Rasio Poisson ν',{'tanpa satuan':1},{max:.45})};
export function combPreset(context,dataset){if(!['mesin','kapal'].includes(context))throw new Error('Konteks tidak sah.');return {L_mm:context==='mesin'?1000:2000,E_MPa:200000,nu:.3,...dataset.cases.find(c=>c.id===`09-${context==='mesin'?'M':'K'}`).input};}
export function validateComb(p){
 if(!p||typeof p!=='object'||Array.isArray(p))return {status:'invalid_input',errors:{input:'Data gabungan tidak sah.'}};
 const errors={};for(const [k,f] of Object.entries(combFields)){const v=p[k];if(typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>f.max||!f.signed&&(v<0||f.positive&&v===0))errors[k]='Nilai tidak sah atau di luar rentang latihan.';}
 for(const k of ['L_mm','d_mm'])if(p[k]<.1||p[k]>1e5)errors[k]='Dimensi FE 0,1–100.000 mm.';if(p.n_required<=1)errors.n_required='Target n harus >1.';
 return Object.keys(errors).length?{status:'invalid_input',errors}:{status:'ready',data:{...p}};
}
export function stressTensor(sigma,tx,ty){return [[0,0,tx],[0,0,ty],[tx,ty,sigma]];}
export function tensorVM(t){const [a,b,c]=[t[0][0],t[1][1],t[2][2]];return Math.sqrt(((a-b)**2+(b-c)**2+(c-a)**2)/2+3*(t[0][1]**2+t[0][2]**2+t[1][2]**2));}
export function stressPoint(key,x,y,z,sigma,tx,ty,E,nu){const tensor=stressTensor(sigma,tx,ty),h=Math.hypot(sigma/2,tx,ty),principal=[sigma/2+h,0,sigma/2-h].sort((a,b)=>b-a),strain=principal.map((s,i)=>(s-nu*principal.reduce((sum,v,j)=>sum+(i===j?0:v),0))/E);return {key,x_mm:x,y_mm:y,z_mm:z,sigma_MPa:sigma,tauXZ_MPa:tx,tauYZ_MPa:ty,tensor,vm_MPa:tensorVM(tensor),principal_MPa:principal,principalStrain:strain};}
function references(p){const {F_N:F,M_Nmm:M,T_Nmm:T,d_mm:d,L_mm:L,E_MPa:E,nu}=p,c=d/2,A=Math.PI*d*d/4,I=Math.PI*d**4/64,J=2*I,G=E/(2*(1+nu)),points=[stressPoint('A',0,c,L/2,F/A+M*c/I,-T*c/J,0,E,nu),stressPoint('B',0,-c,L/2,F/A-M*c/I,T*c/J,0,E,nu)];return {A_mm2:A,I_mm4:I,Jt_mm4:J,G_MPa:G,points,axialTip_mm:F*L/(E*A),deflectionTip_mm:-M*L*L/(2*E*I),rotationTip_rad:-M*L/(E*I),theta_rad:T*L/(G*J),energy_Nmm:F*F*L/(2*E*A)+M*M*L/(2*E*I)+T*T*L/(2*G*J)};}
function domain(p,points,deflection,rotation,theta){const reasons=[];if(p.L_mm/p.d_mm<10)reasons.push('L/d <10.');if(points.some(q=>q.vm_MPa>=p.Sy_MPa*(1-1e-12)))reasons.push('von Mises mencapai Sy latihan.');if(points.some(q=>q.principalStrain.some(e=>Math.abs(e)>.01)))reasons.push('Regangan utama >1%.');if(Math.abs(deflection)/p.L_mm>.02)reasons.push('|δ ujung|/L >2%.');if(Math.abs(rotation)>.05)reasons.push('|rotasi lentur| >0,05 rad.');if(Math.abs(theta)>.05)reasons.push('|θ puntir| >0,05 rad.');const G=p.E_MPa/(2*(1+p.nu));if(points.some(q=>Math.hypot(q.tauXZ_MPa,q.tauYZ_MPa)/G>.01))reasons.push('Regangan geser >1%.');return reasons;}
export function prepareComb(input,level='coarse'){
 const v=validateComb(input);if(v.status!=='ready')return v;if(!Object.hasOwn(TOR_LEVELS,level))return {status:'invalid_input',errors:{mesh:'Mesh tidak tersedia.'}};
 const p=v.data,reference=references(p),reasons=domain(p,reference.points,reference.deflectionTip_mm,reference.rotationTip_rad,reference.theta_rad),meta={level,station_mm:p.L_mm/2};
 if(reasons.length)return {...v,status:'outside_model',message:reasons.join(' '),reference,meta};
 const n={coarse:4,medium:8,fine:16}[level],nodes=Array.from({length:n+1},(_,i)=>[i*p.L_mm/n,0]),beam={kernel:'BEAM2',nodes,elements:nodes.slice(1).map((_,i)=>({nodes:[i,i+1],E:p.E_MPa,A:reference.A_mm2,I:reference.I_mm4})),constraints:[0,1,2].map(dof=>({node:0,dof,value:0})),loads:[{node:n,dof:0,value:p.F_N},{node:n,dof:2,value:-p.M_Nmm}]},mesh=polarT6Mesh({ro:p.d_mm/2,...TOR_LEVELS[level]});
 if(mesh.status!=='ready')return mesh;
 const tor={kernel:'TOR2',nodes:mesh.nodes,elements:mesh.elements,G_MPa:reference.G_MPa,L_mm:p.L_mm,T_Nmm:p.T_Nmm};
 return {...v,reference,meta,beam,tor};
}
function pointDecision(p,points){const max=Math.max(...points.map(q=>q.vm_MPa)),critical=max<1e-10?'none':Math.abs(points[0].vm_MPa-points[1].vm_MPa)<=1e-9*max?'both':points[0].vm_MPa>points[1].vm_MPa?'A':'B',n=max<1e-10?null:p.Sy_MPa/max;return {maxVM_MPa:max,critical,n_yield:n,meets:n===null?null:n>=p.n_required*(1-1e-12)};}
export function summarizeComb(g,beam,tor){
 if(g.status!=='ready')return g;for(const r of [beam,tor])if(r?.status!=='solved_unverified')return {status:r?.status||'solver_failed',message:r?.message||'Dua submodel lengkap diperlukan.'};
 const p=g.data,a=g.reference,L=p.L_mm,c=p.d_mm/2,station=L/2,i=g.beam.elements.findIndex(e=>{const [x0]=g.beam.nodes[e.nodes[0]],[x1]=g.beam.nodes[e.nodes[1]];return x0<station&&x1>=station;}),f=beam.fields[i]?.endForces;
 if(!f)return {status:'solver_failed',message:'Gaya dalam di potongan tidak tersedia.'};
 // BEAM local axis s maps to global z, transverse v maps to global y. Local applied moment −M gives top-surface tension.
 const N=-f[0],M=-(-f[2]+f[1]*(station-g.beam.nodes[g.beam.elements[i].nodes[0]][0])),points=[];
 for(const [key,y] of [['A',c],['B',-c]]){const q=torsionSample(g.tor,tor,0,y);if(!q)return {status:'solver_failed',message:'Titik fisik TOR2 tidak ditemukan.'};points.push(stressPoint(key,0,y,station,N/a.A_mm2+M*y/a.I_mm4,...q.shearStress,p.E_MPa,p.nu));}
 const tip=beam.fields.at(-1).localDisplacements,axialTip=tip[3],deflectionTip=tip[4],rotationTip=tip[5],energy=beam.diagnostics.energy_Nmm+tor.diagnostics.energy_Nmm,areaError=Math.abs(tor.area_mm2-a.A_mm2)/a.A_mm2,polarError=Math.abs(tor.polarMoment_mm4-a.Jt_mm4)/a.Jt_mm4;
 if(areaError>.002||polarError>.002)return {status:'invalid_mesh',message:'Galat geometri penampang >0,2%.'};
 const reasons=domain(p,points,deflectionTip,rotationTip,tor.theta_rad);if(reasons.length)return {status:'outside_model',message:reasons.join(' ')};
 const rows=[['N pada z=L/2',N,p.F_N,'N'],['M kasus pada z=L/2',M,p.M_Nmm,'N·mm'],['Reaksi aksial pangkal',beam.reactions[0],-p.F_N,'N'],['Reaksi kopel pangkal',beam.reactions[2],p.M_Nmm,'N·mm'],['Perpindahan aksial ujung',axialTip,a.axialTip_mm,'mm'],['Lendutan ujung',deflectionTip,a.deflectionTip_mm,'mm'],['Rotasi lentur ujung',rotationTip,a.rotationTip_rad,'rad'],['Sudut puntir ujung',tor.theta_rad,a.theta_rad,'rad'],['Jt',tor.Jt_mm4,a.Jt_mm4,'mm⁴'],['Energi total',energy,a.energy_Nmm,'N·mm']];
 for(let j=0;j<2;j++){const q=points[j],ref=a.points[j];for(const [name,k] of [['σzz','sigma_MPa'],['τxz','tauXZ_MPa'],['τyz','tauYZ_MPa'],['von Mises','vm_MPa']])rows.push([`${name} ${q.key}`,q[k],ref[k],'MPa']);}
 const decision=pointDecision(p,points),refDecision=pointDecision(p,a.points);if(decision.n_yield!==null&&refDecision.n_yield!==null)rows.push(['Faktor keamanan luluh',decision.n_yield,refDecision.n_yield,'']);
 if(![N,M,axialTip,deflectionTip,rotationTip,tor.theta_rad,energy,...points.flatMap(q=>[q.vm_MPa,...q.tensor.flat()])].every(Number.isFinite))return {status:'solver_failed',message:'Hasil numerik tidak berhingga.'};
 return {status:'solved_unverified',points,...decision,N_N:N,M_Nmm:M,axialTip_mm:axialTip,deflectionTip_mm:deflectionTip,rotationTip_rad:rotationTip,theta_rad:tor.theta_rad,energy_Nmm:energy,areaError,polarError,beamDiagnostics:beam.diagnostics,torDiagnostics:tor.diagnostics,comparisons:rows.map(([name,value,reference,unit])=>({name,value,reference,unit,absolute:Math.abs(value-reference),relative:Math.abs(reference)>1e-8?Math.abs(value-reference)/Math.abs(reference):null}))};
}
export async function solveCombined(g,run=solveFE){if(g.status!=='ready')return {summary:g};const beam=await run(g.beam);if(beam.status!=='solved_unverified')return {beam,summary:{status:beam.status,message:beam.message}};const tor=await run(g.tor);return {beam,tor,summary:summarizeComb(g,beam,tor)};}
export function combConvergence(ss){if(ss.length!==3||ss.some(s=>s.status!=='solved_unverified'))return {converged:false,message:'Diperlukan tiga solusi lengkap dalam domain.'};const [a,b]=ss.slice(1),diff=(x,y)=>Math.abs(y)>1e-8?Math.abs(x-y)/Math.abs(y):Math.abs(x-y)<=1e-8?0:Infinity,stress=Math.max(...a.points.map((q,i)=>diff(q.vm_MPa,b.points[i].vm_MPa))),twist=diff(a.theta_rad,b.theta_rad),energy=diff(a.energy_Nmm,b.energy_Nmm);return {converged:stress<=.03&&twist<=.01&&energy<=.01,stress,twist,energy,message:stress<=.03&&twist<=.01&&energy<=.01?'Perubahan sedang–halus memenuhi ambang latihan.':'Belum memenuhi ambang konvergensi.'};}
