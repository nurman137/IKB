import {evaluateBeam,foundationFields} from '../foundation-model.js';
import {sectionProperties,evaluateSection,sectionFields,profilePresets,inactiveSectionFields} from '../section-model.js';
import {evaluateBeamDesign,beamDesignFields} from '../design-model.js';
import {beamDomain} from '../beam-domain.js';
import {makeBendingModel,summarizeBending,LEVELS} from './bending-case.js';
export const FAMILY_VERSION='F2b-0.1';
export const familyAvailable=(id,context)=>['01','07'].includes(id)&&['mesin','kapal'].includes(context)||id==='10'&&context==='kapal';
export function familyFields(id){return id==='01'?{...foundationFields['01'],b_mm:sectionFields.b_mm,h_mm:sectionFields.h_mm,E_MPa:sectionFields.E_MPa,Sy_MPa:sectionFields.Sy_MPa}:id==='07'?sectionFields:beamDesignFields;}
export function familyPreset(id,context,dataset){
 if(!familyAvailable(id,context))throw new Error('Kasus FE belum tersedia.');
 const input=dataset.cases.find(c=>c.id===`${id}-${context==='mesin'?'M':'K'}`).input;
 if(id==='01')return {b_mm:context==='mesin'?60:100,h_mm:context==='mesin'?120:200,E_MPa:200000,Sy_MPa:250,...input,x_mm:input.x_mm??input.L_mm/2};
 if(id==='07')return {...profilePresets[context],shape:'rect',Sy_MPa:250,...input};
 const {deflection_limit_basis,...p}=input;return {rho_kg_m3:7850,...p};
}
export function validateFamily(id,input){
 if(!input||typeof input!=='object'||Array.isArray(input))return {status:'invalid_input',errors:{input:'Data kasus tidak sah.'}};
 if(!['01','07','10'].includes(id))return {status:'invalid_input',errors:{case:'Modul FE tidak tersedia.'}};
 const e=id==='01'?evaluateBeam(input):id==='07'?evaluateSection(input):evaluateBeamDesign(input),errors={...e.errors},fields=familyFields(id),skip=new Set(id==='07'?inactiveSectionFields(input.shape||'rect'):[]);
 for(const [k,f] of Object.entries(fields))if(!skip.has(k)){
  const v=input[k];if(typeof v!=='number'||!Number.isFinite(v))errors[k]='Masukkan angka yang sah.';
  else if(v<0||(f.positive&&v===0)||v>f.max)errors[k]='Nilai di luar rentang input latihan.';
  if(k.endsWith('_mm')&&!['a_mm','x_mm','deflection_limit_mm','di_mm'].includes(k)&&!skip.has(k)&&Number.isFinite(v)&&(v<.1||v>1e5))errors[k]='Dimensi FE 0,1–100.000 mm.';
 }
 return Object.keys(errors).length?{status:'invalid_input',errors}:{status:'ready',data:{...input},analytic:e};
}
export function pointDeflection(p,x){const {P_N:P,L_mm:L,a_mm:a,E_MPa:E,I_mm4:I}=p,b=L-a;return x<=a?P*b*x*(L*L-b*b-x*x)/(6*L*E*I):P*a*(L-x)*(L*L-a*a-(L-x)**2)/(6*L*E*I);}
export function pointMaximum(p){const {L_mm:L,a_mm:a}=p,x=p.P_N===0||a===0||a===L?L/2:a<=L/2?L-Math.sqrt((L*L-a*a)/3):Math.sqrt((L*L-(L-a)**2)/3);return {x_mm:x,delta_mm:pointDeflection(p,x)};}
function makeRun(input,props,key,level,kernel){
 const L=input.L_mm,a=input.a_mm??L/2,p={...input,...props,key,a_mm:a},max=pointMaximum(p),M=input.P_N*a*(L-a)/L,sigma=M*Math.max(props.ctop_mm,props.cbot_mm)/props.I_mm4,domain=beamDomain(sigma,input.E_MPa,max.delta_mm,L),reasons=[];
 if(L/props.depth_mm<10)reasons.push('L/tinggi < 10.');if(sigma>=input.Sy_MPa*(1-1e-12))reasons.push('Tegangan nominal mencapai Sy latihan.');if(!domain.smallStrain)reasons.push('Regangan nominal >1%.');if(!domain.smallDeflection)reasons.push('Lendutan nominal/L >2%.');
 const analytic={RA_N:input.P_N*(L-a)/L,RB_N:input.P_N*a/L,M_at_load_Nmm:M,delta_at_load_mm:pointDeflection(p,a),deltaMax_mm:max.delta_mm,xMax_mm:max.x_mm,sigmaTop_MPa:-M*props.ctop_mm/props.I_mm4,sigmaBottom_MPa:M*props.cbot_mm/props.I_mm4};
 const meta={key,kernel,level,...props};
 if(reasons.length)return {status:'outside_model',message:reasons.join(' '),data:p,analytic,meta};
 if(kernel==='PS2'){
  if(L/props.depth_mm>100)return {status:'invalid_mesh',message:'Solid pengayaan dibatasi L/tinggi ≤ 100; pilih BEAM2 untuk balok lebih ramping.',meta};
  const axialDivisions=Math.min(Math.ceil(L/props.depth_mm*LEVELS[level].layers/2)*2,{coarse:64,medium:96,fine:128}[level]);
  const solid=makeBendingModel({...input,load:'point',b_mm:props.width_mm,h_mm:props.depth_mm,nu:.3,stripFactor:.5},'PS2',level,{axialDivisions});
  return {...solid,data:{...solid.data,...p},analytic,solidPrepared:solid,meta:{...solid.meta,...meta}};
 }
 const n=LEVELS[level].beam,breaks=[0,...a>0&&a<L?[a]:[],L],nodes=[];
 for(let j=0;j<breaks.length-1;j++)for(let i=0;i<n;i++)nodes.push([breaks[j]+(breaks[j+1]-breaks[j])*i/n,0]);nodes.push([L,0]);
 const loadNode=nodes.findIndex(([x])=>x===a);if(loadNode<0||nodes.some(([x],i)=>i&&x-nodes[i-1][0]<=1e-10*L))return {status:'invalid_mesh',message:'Beban terlalu dekat tumpuan untuk mesh numerik; gunakan tepat a=0 atau a=L.',meta};
 const model={kernel:'BEAM2',nodes,elements:nodes.slice(1).map((_,i)=>({nodes:[i,i+1],E:input.E_MPa,A:props.A_mm2,I:props.I_mm4})),constraints:[{node:0,dof:0,value:0},{node:0,dof:1,value:0},{node:nodes.length-1,dof:1,value:0}],loads:[{node:loadNode,dof:1,value:-input.P_N}]};
 return {status:'ready',model,data:p,analytic,meta};
}
export function prepareFamily(id,input,kernel='BEAM2',level='coarse'){
 const v=validateFamily(id,input);if(v.status!=='ready')return v;if(!['BEAM2','PS2'].includes(kernel)||!Object.hasOwn(LEVELS,level))return {status:'invalid_input',errors:{model:'Model atau mesh tidak tersedia.'}};
 if(kernel==='PS2'&&(id==='01'||id==='07'&&(input.shape||'rect')!=='rect'))return {status:'invalid_input',errors:{model:'Solid T6 tersedia untuk persegi panjang modul 07 dan 10-K. Profil lain memakai properti BEAM2; modul 01 memakai BEAM2 untuk beban eksentris.'}};
 const keys=id==='01'?['A']:['A','B'];
 const runs=keys.map(key=>{
  const shape=id==='07'?(input.shape||'rect'):'rect',d=id==='10'?{...input,b_mm:input[`b_${key}_mm`],h_mm:input[`h_${key}_mm`]}:input,props=sectionProperties(shape,d,id==='07'&&key==='B'?'weak':'strong');
  return makeRun({...input,a_mm:id==='01'?input.a_mm:input.L_mm/2},{A_mm2:props.A,I_mm4:props.I,ctop_mm:props.depth-props.yc,cbot_mm:props.yc,depth_mm:props.depth,width_mm:props.width},key,level,kernel);
 });return {...v,id,kernel,level,runs};
}
export function sampleBeam(run,result,x,side='left'){
 const m=run.model,tol=1e-10*run.data.L_mm;let i=side==='right'?m.elements.findIndex(e=>m.nodes[e.nodes[0]][0]<=x+tol&&m.nodes[e.nodes[1]][0]>x+tol):m.elements.findIndex(e=>m.nodes[e.nodes[0]][0]<x-tol&&m.nodes[e.nodes[1]][0]>=x-tol);
 if(i<0)i=x<=0?0:m.elements.length-1;const e=m.elements[i],a=m.nodes[e.nodes[0]][0],l=m.nodes[e.nodes[1]][0]-a,q=(x-a)/l,f=result.fields[i],u=f.localDisplacements;
 return {uy:(1-3*q*q+2*q**3)*u[1]+l*(q-2*q*q+q**3)*u[2]+(3*q*q-2*q**3)*u[4]+l*(-q*q+q**3)*u[5],M:-f.endForces[2]+f.endForces[1]*(x-a),V:f.endForces[1]};
}
function feMaximum(run,result){let max={delta_mm:0,x_mm:0},rotation=0;for(let i=0;i<run.model.elements.length;i++){
 const e=run.model.elements[i],[x0]=run.model.nodes[e.nodes[0]],[x1]=run.model.nodes[e.nodes[1]],l=x1-x0,u=result.fields[i].localDisplacements,c=[u[1],l*u[2],-3*u[1]-2*l*u[2]+3*u[4]-l*u[5],2*u[1]+l*u[2]-2*u[4]+l*u[5]],aa=3*c[3],bb=2*c[2],cc=c[1],qs=[0,1];
 if(Math.abs(aa)>1e-14*Math.max(...c.map(Math.abs))){const disc=bb*bb-4*aa*cc;if(disc>=0)qs.push((-bb+Math.sqrt(disc))/(2*aa),(-bb-Math.sqrt(disc))/(2*aa));}else if(Math.abs(bb)>1e-14)qs.push(-cc/bb);
 for(const q of qs)if(q>=0&&q<=1){const v=c[0]+c[1]*q+c[2]*q*q+c[3]*q**3;if(Math.abs(v)>Math.abs(max.delta_mm))max={delta_mm:-v,x_mm:x0+q*l};}
 const slopes=[0,1];if(Math.abs(c[3])>1e-15)slopes.push(-c[2]/(3*c[3]));for(const q of slopes)if(q>=0&&q<=1)rotation=Math.max(rotation,Math.abs((c[1]+2*c[2]*q+3*c[3]*q*q)/l));
 }return {...max,x_mm:max.delta_mm===0?null:max.x_mm,rotation};}
export function summarizeFamilyRun(run,result,id){
 if(run.status!=='ready')return {...run};if(result.status!=='solved_unverified')return {...result,key:run.meta.key};
 if(run.model.kernel==='PS2'){
  const s=summarizeBending(run.solidPrepared,result);if(s.status==='solved_unverified')for(const [i,bc] of run.model.linearConstraints.filter(c=>c.terms[0].dof===1).entries()){
   const value=bc.terms.reduce((sum,t)=>sum+result.reactions[2*t.node+1],0),reference=run.data.P_N/2;
   s.comparisons.push({name:i===0?'Reaksi kiri strip':'Reaksi kanan strip',value,reference,unit:'N',absolute:Math.abs(value-reference),relative:Math.abs(reference)>1e-8?Math.abs(value-reference)/Math.abs(reference):null});
  }return {...s,key:run.meta.key,kernel:'PS2'};
 }
 const p=run.data,L=p.L_mm,a=p.a_mm,meta=run.meta,maximum=feMaximum(run,result),M=sampleBeam(run,result,a).M,sigmaTop=-M*meta.ctop_mm/meta.I_mm4,sigmaBottom=M*meta.cbot_mm/meta.I_mm4,sigmaMax=Math.max(Math.abs(sigmaTop),Math.abs(sigmaBottom)),domain=beamDomain(sigmaMax,p.E_MPa,maximum.delta_mm,L),outside=sigmaMax>=p.Sy_MPa*(1-1e-12)||!domain.smallStrain||!domain.smallDeflection||maximum.rotation>.05;
 if(outside)return {status:'outside_model',message:'Hasil FE melampaui batas elastis/regangan/lendutan/rotasi kecil.',key:meta.key};
 const x=id==='01'?p.x_mm:a,rows=[['Reaksi kiri',result.reactions[1],run.analytic.RA_N,'N'],['Reaksi kanan',result.reactions.at(-2),run.analytic.RB_N,'N'],['M pada beban',M,run.analytic.M_at_load_Nmm,'N·mm'],['δ pada beban',-sampleBeam(run,result,a).uy,run.analytic.delta_at_load_mm,'mm'],['δ maksimum',maximum.delta_mm,run.analytic.deltaMax_mm,'mm'],['σxx atas pada beban',sigmaTop,run.analytic.sigmaTop_MPa,'MPa'],['σxx bawah pada beban',sigmaBottom,run.analytic.sigmaBottom_MPa,'MPa']];
 if(id==='01'){const r=evaluateBeam(p).result;rows.push(['M pada potongan x',sampleBeam(run,result,x).M,r.M_at_x_Nmm,'N·mm'],['V kiri potongan',x===0?0:sampleBeam(run,result,x,'left').V,r.V_left_N,'N'],['V kanan potongan',x===L?0:sampleBeam(run,result,x,'right').V,r.V_right_N,'N']);}
 return {status:'solved_unverified',key:meta.key,kernel:'BEAM2',comparisons:rows.map(([name,value,reference,unit])=>({name,value,reference,unit,absolute:Math.abs(value-reference),relative:Math.abs(reference)>1e-8?Math.abs(value-reference)/Math.abs(reference):null})),delta_mm:maximum.delta_mm,xMax_mm:maximum.x_mm,sigmaTop_MPa:sigmaTop,sigmaBottom_MPa:sigmaBottom,sigmaMax_MPa:sigmaMax,energy_Nmm:result.diagnostics.energy_Nmm,diagnostics:result.diagnostics,rotation:maximum.rotation};
}
export function designFromFE(input,runs){
 if(runs.length!==2||runs.some(r=>r.status!=='solved_unverified'||r.kernel!=='BEAM2'))return {available:false,choice:null,message:'Keputusan latihan memerlukan dua solusi BEAM2 dalam domain. Solid T6 adalah pengayaan ROI, bukan pengganti tegangan nominal untuk keputusan ini.'};
 const alternatives=runs.map((r,i)=>{const key=i===0?'A':'B',mass=input.rho_kg_m3*input[`b_${key}_mm`]*input[`h_${key}_mm`]*input.L_mm*1e-9,n=r.sigmaMax_MPa>1e-8?input.Sy_MPa/r.sigmaMax_MPa:null,strength=n===null||n>=input.n_required*(1-1e-12),stiffness=r.delta_mm<=input.deflection_limit_mm*(1+1e-12);return {key,mass_kg:mass,n_yield:n,delta_mm:r.delta_mm,strength,stiffness,allMet:strength&&stiffness};});
 const passing=alternatives.filter(a=>a.allMet).sort((a,b)=>Math.abs(a.mass_kg-b.mass_kg)>1e-9*Math.max(a.mass_kg,b.mass_kg)?a.mass_kg-b.mass_kg:(b.n_yield??0)-(a.n_yield??0));return {available:true,alternatives,choice:passing[0]?.key||null,message:passing.length?'Di antara yang memenuhi kedua kriteria, pilih massa lebih kecil; jika massa sama, pilih margin kekuatan lebih besar. Seri penuh mempertahankan urutan A.':'Belum ada alternatif yang memenuhi kedua kriteria latihan.'};
}
