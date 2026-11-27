import {axialFields} from '../axial-model.js';
import {foundationFields} from '../foundation-model.js';
import {thermalFields} from '../thermal-model.js';
import {field,validateFields} from '../lab-core.js';
import {AX_GAUSS,axisPoint,axisStress} from './axisymmetric-element.js';
export const AX_VERSION='F3-0.1';
export const AX_LEVELS={coarse:1,medium:2,fine:3};
const poisson=field('Rasio Poisson ν',{'tanpa satuan':1},{max:.45});
export const axisAvailable=(id,context)=>['02','03','08'].includes(id)&&['mesin','kapal'].includes(context);
export const axisFields=id=>id==='08'?{...thermalFields,nu:poisson}:id==='03'?{...foundationFields['03'],nu:poisson}:{...axialFields,nu:poisson};
export function axisPreset(id,context,dataset){if(!axisAvailable(id,context))throw new Error('Kasus AX2 belum tersedia.');return {nu:.3,Sy_MPa:250,...dataset.cases.find(c=>c.id===`${id}-${context==='mesin'?'M':'K'}`).input};}
export function validateAxis(id,input){
 if(!['02','03','08'].includes(id)||!input||typeof input!=='object'||Array.isArray(input))return {status:'invalid_input',errors:{input:'Data AX2 tidak sah.'}};
 const d={...input},errors=validateFields(axisFields(id),d);for(const k of Object.keys(axisFields(id)))if(typeof input[k]!=='number'||!Number.isFinite(input[k]))errors[k]='Masukkan angka yang sah.';
 for(const k of ['d_mm','L_mm'])if(d[k]<.1||d[k]>1e5)errors[k]='Dimensi AX2 0,1–100.000 mm.';
 const ri=id==='08'?d.di_mm/2:0,ro=d.d_mm/2,wall=ro-ri;
 if(id==='08'&&(d.di_mm<0||wall<.01||wall<.001*ro))errors.di_mm='Tebal radial ≥0,01 mm dan ≥0,001 radius luar; diameter dalam harus lebih kecil.';
 if(Object.keys(errors).length)return {status:'invalid_input',errors};return {status:'ready',data:d,ri,ro,area:Math.PI*(ro*ro-ri*ri)};
}
export function axisMesh(ri,ro,L,nr,nz,material){
 const estimate=2*(2*nr+1)*(2*nz+1);if(![ri,ro,L,nr,nz].every(Number.isFinite)||ri<0||ro<=ri||L<=0||!Number.isInteger(nr)||!Number.isInteger(nz)||nr<1||nz<1||estimate>10000||2*nr*nz>8000)return {status:'invalid_mesh',message:'Mesh AX2 melewati batas 10.000 DOF / 8.000 elemen. Pilih mesh lebih kasar atau kurangi panjang/ketipisan.'};
 const nodes=[],elements=[],midpoints=new Map(),node=(i,j)=>j*(nr+1)+i;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nr;i++)nodes.push([ri+(ro-ri)*i/nr,L*j/nz]);
 function mid(a,b){const key=[a,b].sort((x,y)=>x-y).join(',');if(!midpoints.has(key)){midpoints.set(key,nodes.length);nodes.push(nodes[a].map((x,i)=>(x+nodes[b][i])/2));}return midpoints.get(key);}
 function add(a,b,c){elements.push({...material,type:'T6',nodes:[a,b,c,mid(a,b),mid(b,c),mid(c,a)]});}
 for(let j=0;j<nz;j++)for(let i=0;i<nr;i++){const a=node(i,j),b=node(i+1,j),c=node(i+1,j+1),d=node(i,j+1);add(a,b,c);add(a,c,d);}
 // Axial-major ordering keeps the reduced AX2 matrix narrow-banded for a direct SPD solve.
 const order=nodes.map((p,i)=>i).sort((a,b)=>nodes[a][1]-nodes[b][1]||nodes[a][0]-nodes[b][0]),map=new Map(order.map((i,j)=>[i,j]));
 return {status:'ready',model:{kernel:'AX2',nodes:order.map(i=>nodes[i]),elements:elements.map(e=>({...e,nodes:e.nodes.map(i=>map.get(i))})),constraints:[],loads:[]}};
}
export function axisFaceWeights(model,z){
 const span=Math.max(...model.nodes.map(p=>p[1]))||1,ids=model.nodes.map((p,i)=>({r:p[0],z:p[1],i})).filter(p=>Math.abs(p.z-z)<1e-10*span).sort((a,b)=>a.r-b.r),weights=new Map();
 for(let i=0;i<ids.length-2;i+=2){const trip=ids.slice(i,i+3),a=trip[0].r,b=trip[2].r;for(const [g,w] of AX_GAUSS){const q=(g+1)/2,r=a+(b-a)*q,N=[(1-q)*(1-2*q),4*q*(1-q),q*(2*q-1)],factor=w/2*(b-a)*2*Math.PI*r;trip.forEach((p,j)=>weights.set(p.i,(weights.get(p.i)||0)+N[j]*factor));}}
 return [...weights].map(([node,weight])=>({node,weight}));
}
export function prepareAxis(id,input,level='coarse',support='free'){
 const v=validateAxis(id,input);if(v.status!=='ready')return v;if(!Object.hasOwn(AX_LEVELS,level)||!['free','fixed'].includes(support))return {status:'invalid_input',errors:{model:'Pilih mesh/kondisi yang tersedia.'}};
 const p=v.data,beta=id==='08'?p.alpha_per_C*p.deltaT_C:0,stress=id==='08'?(support==='fixed'?-p.E_MPa*beta:0):p.F_N/v.area,ez=stress/p.E_MPa+beta,er=-p.nu*stress/p.E_MPa+beta;
 const reference={delta_mm:ez*p.L_mm,urOuter_mm:er*v.ro,sigmaZZ_MPa:stress,epsilonZZ:ez,epsilonRR:er,reactionBottom_N:-stress*v.area,reactionTop_N:id==='08'?stress*v.area:0,volume_mm3:v.area*p.L_mm,elasticEnergy_Nmm:stress*stress/(2*p.E_MPa)*v.area*p.L_mm};
 const reasons=[];if(Math.abs(stress)>=p.Sy_MPa*(1-1e-12))reasons.push('Tegangan nominal mencapai Sy latihan.');if(Math.max(Math.abs(ez),Math.abs(er),Math.abs(beta))>.01*(1+1e-12))reasons.push('Regangan total/termal melebihi 1%.');
 if(reasons.length)return {status:'outside_model',message:reasons.join(' '),reference,data:p};
 const nr=AX_LEVELS[level],nz=Math.max(2,2*Math.ceil(p.L_mm*nr/(5*(v.ro-v.ri))/2)),mesh=axisMesh(v.ri,v.ro,p.L_mm,nr,nz,{E:p.E_MPa,nu:p.nu,thermalStrain:beta});if(mesh.status!=='ready')return mesh;
 const aspect=Math.max(p.L_mm/nz/((v.ro-v.ri)/nr),((v.ro-v.ri)/nr)/(p.L_mm/nz));if(aspect>5*(1+1e-12))return {status:'invalid_mesh',message:'Rasio sisi sel AX2 melebihi 5; geometri terlalu pendek/lebar untuk mesh ini.'};
 const model=mesh.model,bottom=axisFaceWeights(model,0),top=axisFaceWeights(model,p.L_mm);
 model.nodes.forEach(([r,z],node)=>{if(r===0)model.constraints.push({node,dof:0,value:0});if(z===0||id==='08'&&support==='fixed'&&z===p.L_mm)model.constraints.push({node,dof:1,value:0});});
 if(id!=='08')model.loads=top.map(({node,weight})=>({node,dof:1,value:p.F_N/v.area*weight}));
 return {...v,model,reference,support,level,meta:{nr,nz,aspect,bottom,top,beta,id}};
}
export function axisSample(model,result,r,z){
 const samples=[];for(const e of model.elements){const [a,b,c]=e.nodes.slice(0,3).map(i=>model.nodes[i]),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]),xi=((r-a[0])*(c[1]-a[1])-(c[0]-a[0])*(z-a[1]))/det,eta=((b[0]-a[0])*(z-a[1])-(r-a[0])*(b[1]-a[1]))/det;
  if(xi>=-1e-8&&eta>=-1e-8&&xi+eta<=1+1e-8){const q=axisPoint(e.nodes.map(i=>model.nodes[i]),e,xi,eta),u=e.nodes.flatMap(i=>[result.displacements[2*i],result.displacements[2*i+1]]);samples.push({...axisStress(q.B,q.D,u,e.thermalStrain||0),ur:q.N.reduce((s,n,i)=>s+n*u[2*i],0),uz:q.N.reduce((s,n,i)=>s+n*u[2*i+1],0)});}}
 if(!samples.length)return null;return {stress:[0,1,2,3].map(i=>samples.reduce((s,q)=>s+q.stress[i],0)/samples.length),strain:[0,1,2,3].map(i=>samples.reduce((s,q)=>s+q.strain[i],0)/samples.length),ur:samples.reduce((s,q)=>s+q.ur,0)/samples.length,uz:samples.reduce((s,q)=>s+q.uz,0)/samples.length};
}
export function summarizeAxis(prepared,result){
 if(prepared.status!=='ready')return prepared;if(result.status!=='solved_unverified')return result;
 const p=prepared.data,a=prepared.reference,m=prepared.model,mid=axisSample(m,result,(prepared.ri+prepared.ro)/2,p.L_mm/2),outer=axisSample(m,result,prepared.ro,p.L_mm/2);
 let maxVM=0,maxStrain=0,volume=0;for(const f of result.fields){volume+=f.volume;for(const q of f.integrationPoints){maxVM=Math.max(maxVM,q.vonMises);maxStrain=Math.max(maxStrain,...q.principalStrain.map(Math.abs));}}
 if(maxVM>=p.Sy_MPa*(1-1e-12)||maxStrain>.01*(1+1e-10))return {status:'outside_model',message:'Hasil AX2 melampaui batas luluh/regangan kecil.',maxVM,maxStrain};
 if(!mid||!outer)return {status:'solver_failed',message:'Titik pembanding AX2 tidak tersedia.'};
 const faceAverage=face=>face.reduce((s,t)=>s+t.weight*result.displacements[2*t.node+1],0)/prepared.area,delta=faceAverage(prepared.meta.top)-faceAverage(prepared.meta.bottom),reaction=face=>face.reduce((s,t)=>s+result.reactions[2*t.node+1],0);
 const stiffness=prepared.meta.id!=='08'&&Math.abs(delta)>1e-12?p.F_N/delta:null;
 const rows=[['Perubahan panjang rata-rata ΔL',delta,a.delta_mm,'mm'],['ur luar pada z=L/2',outer.ur,a.urOuter_mm,'mm'],['Perubahan diameter luar',2*outer.ur,2*a.urOuter_mm,'mm'],['εrr total di ROI',mid.strain[0],a.epsilonRR,''],['σzz di ROI',mid.stress[1],a.sigmaZZ_MPa,'MPa'],['σrr di ROI',mid.stress[0],0,'MPa'],['σθθ di ROI',mid.stress[2],0,'MPa'],['τrz di ROI',mid.stress[3],0,'MPa'],['εzz total di ROI',mid.strain[1],a.epsilonZZ,''],['Reaksi muka z=0',reaction(prepared.meta.bottom),a.reactionBottom_N,'N'],['Reaksi muka z=L',reaction(prepared.meta.top),a.reactionTop_N,'N'],['Energi regangan elastis',result.diagnostics.elasticEnergy_Nmm,a.elasticEnergy_Nmm,'N·mm']];
 if(prepared.meta.id==='03'&&stiffness!==null)rows.push(['Kekakuan aksial F/ΔL',stiffness,p.E_MPa*prepared.area/p.L_mm,'N/mm']);
 return {status:'solved_unverified',epsilonZZ:mid.strain[1],epsilonRR:mid.strain[0],deltaDiameter_mm:2*outer.ur,k_N_per_mm:stiffness,delta_mm:delta,ur_mm:outer.ur,sigmaZZ_MPa:mid.stress[1],energy_Nmm:result.diagnostics.elasticEnergy_Nmm,maxVM_MPa:maxVM,maxStrain,volume_mm3:volume,diagnostics:result.diagnostics,comparisons:rows.map(([name,value,reference,unit])=>({name,value,reference,unit,absolute:Math.abs(value-reference),relative:Math.abs(reference)>(unit==='N'?1e-6:1e-8)?Math.abs(value-reference)/Math.abs(reference):null}))};
}
export function axisConvergence(runs){if(runs.length!==3||runs.some(r=>r.status!=='solved_unverified'))return {converged:false,message:'Memerlukan tiga run AX2 dalam domain.'};const [a,b]=runs.slice(1),diff=(x,y,eps)=>Math.abs(y)>eps?Math.abs(x-y)/Math.abs(y):Math.abs(x-y)<=eps?0:Infinity,displacement=Math.max(diff(a.delta_mm,b.delta_mm,1e-8),diff(a.ur_mm,b.ur_mm,1e-8)),stress=diff(a.sigmaZZ_MPa,b.sigmaZZ_MPa,1e-7),energy=diff(a.energy_Nmm,b.energy_Nmm,1e-6);return {converged:displacement<=.01&&stress<=.03&&energy<=.01,displacement,stress,energy,message:displacement<=.01&&stress<=.03&&energy<=.01?'Perubahan sedang–halus memenuhi ambang latihan. Medan homogen dapat tepat pada semua mesh.':'Belum memenuhi ambang konvergensi; hasil tidak dianggap tervalidasi.'};}
