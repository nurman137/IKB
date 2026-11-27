import {torsionFields,evaluateTorsion,powerPresets,inactiveFields} from '../torsion-model.js';
import {shaftDesignFields,evaluateShaftDesign} from '../design-model.js';
import {polarT6Mesh,TOR_LEVELS} from './torsion-mesh.js';
import {torsionSample} from './torsion-solver.js';
export {TOR_LEVELS};
export const torAvailable=(id,context)=>id==='05'&&['mesin','kapal'].includes(context)||id==='10'&&context==='mesin';
export const torFields=id=>id==='05'?torsionFields:shaftDesignFields;
export function torPreset(id,context,dataset){if(!torAvailable(id,context))throw new Error('Kasus TOR2 tidak tersedia.');return {mode:'torque',direction:1,Sy_MPa:250,...powerPresets[context],...dataset.cases.find(c=>c.id===`${id}-${context==='mesin'?'M':'K'}`).input};}
export function validateTor(id,input){
 if(!['05','10'].includes(id)||!input||typeof input!=='object'||Array.isArray(input))return {status:'invalid_input',errors:{input:'Data torsi tidak sah.'}};
 const d={mode:'torque',direction:1,...input},e=id==='05'?evaluateTorsion(d):evaluateShaftDesign(d),errors={...e.errors},skip=new Set(id==='05'?inactiveFields(d.mode):[]);
 for(const k of Object.keys(torFields(id)))if(!skip.has(k)&&(!Number.isFinite(d[k])||typeof d[k]!=='number'))errors[k]='Masukkan angka yang sah.';
 if(![1,-1].includes(d.direction))errors.direction='Pilih arah torsi.';
 if(d.nu<0||d.nu>.45)errors.nu='FE memakai 0 ≤ ν ≤ 0,45.';
 for(const k of ['d_mm','L_mm'])if(d[k]<.1||d[k]>1e5)errors[k]='Dimensi FE 0,1–100.000 mm.';
 for(const k of id==='05'?['di_mm']:['di_A_mm','di_B_mm'])if(d[k]>0&&((d.d_mm-d[k])/2<.01||(d.d_mm-d[k])/2<.001*d.d_mm/2))errors[k]='Dinding radial ≥0,01 mm dan ≥0,001 radius luar.';
 return Object.keys(errors).length?{status:'invalid_input',errors}:{status:'ready',data:d,analytic:e};
}
export function prepareTor(id,input,level='coarse'){
 const v=validateTor(id,input);if(v.status!=='ready')return v;if(!Object.hasOwn(TOR_LEVELS,level))return {status:'invalid_input',errors:{mesh:'Pilih mesh yang tersedia.'}};
 const p=v.data,T=id==='05'?v.analytic.result.T_Nmm:p.T_Nmm,G=p.E_MPa/(2*(1+p.nu));
 const runs=(id==='05'?['A']:['A','B']).map(key=>{const di=id==='05'?p.di_mm:p[`di_${key}_mm`],ro=p.d_mm/2,ri=di/2,J=Math.PI*(p.d_mm**4-di**4)/32,tau=T*ro/J,theta=T*p.L_mm/(G*J),reference={Jt_mm4:J,area_mm2:Math.PI*(ro*ro-ri*ri),tauOuter_MPa:tau,tauInner_MPa:T*ri/J,theta_rad:theta*p.direction,torque_Nmm:T*p.direction,energy_Nmm:T*theta/2},data={...p,di_mm:di,T_Nmm:T*p.direction,G_MPa:G},meta={key,ro,ri,level};
  const reasons=[];if(Math.sqrt(3)*tau>=p.Sy_MPa*(1-1e-12))reasons.push('√3 |τ| mencapai Sy latihan.');if(tau/G>.01)reasons.push('Regangan geser >1%.');if(theta>.05)reasons.push('|θ| >0,05 rad.');if(reasons.length)return {status:'outside_model',message:reasons.join(' '),data,reference,meta};
  const mesh=polarT6Mesh({ro,ri,...TOR_LEVELS[level]});if(mesh.status!=='ready')return {...mesh,meta};
  return {status:'ready',model:{kernel:'TOR2',nodes:mesh.nodes,elements:mesh.elements,G_MPa:G,L_mm:p.L_mm,T_Nmm:T*p.direction},data,reference,meta:{...mesh.meta,...meta}};
 });return {...v,runs,id,level};
}
export function summarizeTor(run,result){
 if(run.status!=='ready')return run;if(result.status!=='solved_unverified')return result;
 const p=run.data,a=run.reference,ro=run.meta.ro,ri=run.meta.ri,outer=torsionSample(run.model,result,ro,0),inner=ri?torsionSample(run.model,result,ri,0):null;if(!outer||ri&&!inner)return {status:'solver_failed',message:'Titik perbandingan permukaan tidak tersedia.'};
 let maxTau=0;const surfaceSamples=[];for(const f of result.fields)for(const q of f.integrationPoints)maxTau=Math.max(maxTau,Math.hypot(...q.shearStress));for(let k=0;k<8;k++){const angle=k*Math.PI/4,s=torsionSample(run.model,result,ro*Math.cos(angle),ro*Math.sin(angle));if(s){maxTau=Math.max(maxTau,Math.hypot(...s.shearStress));surfaceSamples.push({x:ro*Math.cos(angle),y:ro*Math.sin(angle),shearStress:s.shearStress});}}
 const areaError=Math.abs(result.area_mm2-a.area_mm2)/a.area_mm2,polarError=Math.abs(result.polarMoment_mm4-a.Jt_mm4)/a.Jt_mm4;
 if(areaError>.002||polarError>.002)return {status:'invalid_mesh',message:'Galat geometri area/momen polar >0,2%; perlu keliling lebih halus.'};
 if(Math.sqrt(3)*maxTau>=p.Sy_MPa*(1-1e-12)||maxTau/p.G_MPa>.01||Math.abs(result.theta_rad)>.05)return {status:'outside_model',message:'Hasil TOR2 melampaui batas luluh, regangan geser atau sudut kecil.'};
 const tauOuter=Math.hypot(...outer.shearStress),tauInner=inner?Math.hypot(...inner.shearStress):0,rows=[['Jt dari energi',result.Jt_mm4,a.Jt_mm4,'mm⁴'],['|τ| di permukaan luar (ro,0)',tauOuter,a.tauOuter_MPa,'MPa'],['|τ| di permukaan dalam (ri,0)',tauInner,a.tauInner_MPa,'MPa'],['Sudut puntir θ',result.theta_rad,a.theta_rad,'rad'],['Torsi dari integral tegangan',result.torque_Nmm,a.torque_Nmm,'N·mm'],['Energi elastis',result.diagnostics.energy_Nmm,a.energy_Nmm,'N·mm']];
 return {status:'solved_unverified',surfaceSamples,key:run.meta.key,Jt_mm4:result.Jt_mm4,theta_rad:result.theta_rad,theta_deg:result.theta_rad*180/Math.PI,tauOuter_MPa:tauOuter,tauInner_MPa:tauInner,maxTau_MPa:maxTau,gammaMax:maxTau/p.G_MPa,energy_Nmm:result.diagnostics.energy_Nmm,areaError,polarError,diagnostics:result.diagnostics,comparisons:rows.map(([name,value,reference,unit])=>({name,value,reference,unit,absolute:Math.abs(value-reference),relative:Math.abs(reference)>1e-8?Math.abs(value-reference)/Math.abs(reference):null}))};
}
export function torConvergence(runs){if(runs.length!==3||runs.some(r=>r.status!=='solved_unverified'))return {converged:false,message:'Tiga run dalam domain diperlukan.'};const [a,b]=runs.slice(1),diff=(x,y)=>Math.abs(y)>1e-8?Math.abs(x-y)/Math.abs(y):Math.abs(x-y)<=1e-8?0:Infinity,twist=diff(a.theta_rad,b.theta_rad),stress=diff(a.tauOuter_MPa,b.tauOuter_MPa),energy=diff(a.energy_Nmm,b.energy_Nmm),Jt=diff(a.Jt_mm4,b.Jt_mm4);return {converged:twist<=.01&&stress<=.03&&energy<=.01&&Jt<=.01,twist,stress,energy,Jt,message:twist<=.01&&stress<=.03&&energy<=.01&&Jt<=.01?'Perubahan sedang–halus memenuhi ambang latihan.':'Belum memenuhi ambang konvergensi.'};}
export function shaftDecisionFE(input,summaries){if(summaries.length!==2||summaries.some(s=>s.status!=='solved_unverified'))return {available:false,choice:null,message:'Keputusan memerlukan dua subrun TOR2 dalam domain.'};const alternatives=summaries.map((s,i)=>{const key=i===0?'A':'B',A=Math.PI*(input.d_mm**2-input[`di_${key}_mm`]**2)/4,mass=input.rho_kg_m3*A*input.L_mm*1e-9,n=s.maxTau_MPa>1e-8?input.Sy_MPa/(Math.sqrt(3)*s.maxTau_MPa):null,strength=n===null||n>=input.n_required*(1-1e-12),stiffness=Math.abs(s.theta_deg)<=input.theta_limit_deg*(1+1e-12);return {key,mass_kg:mass,n_yield:n,theta_deg:s.theta_deg,strength,stiffness,allMet:strength&&stiffness};}),passing=alternatives.filter(a=>a.allMet).sort((a,b)=>Math.abs(a.mass_kg-b.mass_kg)>1e-9*Math.max(a.mass_kg,b.mass_kg)?a.mass_kg-b.mass_kg:(b.n_yield??0)-(a.n_yield??0));return {available:true,alternatives,choice:passing[0]?.key||null,message:'Pilih massa lebih kecil di antara yang memenuhi n dan |θ|; jika massa sama, pilih margin kekuatan lebih besar. Bukan pernyataan aman.'};}
