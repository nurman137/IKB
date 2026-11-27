import {evaluateBending} from '../bending-model.js';
import {t6Point,stressAt} from './triangle6.js';
export const BENDING_FE_VERSION='F2a-0.1';
export const LEVELS={coarse:{beam:4,layers:4},medium:{beam:8,layers:6},fine:{beam:16,layers:8}};
export function validateBendingFE(input){
 const p={nu:.3,stripFactor:.5,...input},a=evaluateBending(p),errors={...a.errors};
 if(!Number.isFinite(p.nu)||p.nu<0||p.nu>.45)errors.nu='Gunakan 0 ≤ ν ≤ 0,45 untuk FE ini.';
 if(![.5,1,2].includes(p.stripFactor))errors.stripFactor='Faktor strip harus 0,5; 1; atau 2.';
 for(const k of ['L_mm','b_mm','h_mm'])if(Number.isFinite(p[k])&&(p[k]<.1||p[k]>1e5))errors[k]='Dimensi FE 0,1–100.000 mm.';
 if(Object.keys(errors).length)return {status:'invalid_input',errors};
 if(a.status==='outside')return {status:'outside_model',message:a.reason,analytic:a,data:p};
 return {status:'ready',data:p,analytic:a};
}
export function makeBendingModel(input,kernel='BEAM2',level='coarse'){
 const v=validateBendingFE(input);if(v.status!=='ready')return v;
 if(!['BEAM2','PS2'].includes(kernel)||!Object.hasOwn(LEVELS,level))return {status:'invalid_input',errors:{model:'Pilih model dan mesh yang tersedia.'}};
 const p=v.data,L=p.L_mm,h=p.h_mm,b=p.b_mm,n=LEVELS[level].beam,A=b*h,I=b*h**3/12;
 if(kernel==='BEAM2'){
  const nodes=Array.from({length:n+1},(_,i)=>[L*i/n,0]),elements=Array.from({length:n},(_,i)=>({nodes:[i,i+1],E:p.E_MPa,A,I}));
  return {...v,model:{kernel,nodes,elements,constraints:[{node:0,dof:0,value:0},{node:0,dof:1,value:0},{node:n,dof:1,value:0}],loads:p.load==='point'?[{node:n/2,dof:1,value:-p.P_N}]:[],distributedLoads:p.load==='udl'?elements.map((_,element)=>({element,qx:0,qy:-p.w_N_per_mm})):[]},meta:{level,kernel,strip_mm:0,probe_x_mm:L/4}};
 }
 const s=Math.min(.02*L,.25*h)*p.stripFactor,ny=LEVELS[level].layers,nx=Math.ceil(L/h*ny/2)*2;
 if(nx>400)return {status:'invalid_mesh',message:'Mesh melampaui batas peramban; kurangi L/h atau pilih mesh lebih kasar.'};
 const coordinates=Array.from({length:nx+1},(_,i)=>L*i/nx).concat([s,L-s,L/2-s/2,L/2+s/2,L/4,L/2,3*L/4]).sort((a,b)=>a-b),xs=coordinates.filter((x,i)=>i===0||x-coordinates[i-1]>1e-9*L);
 if(nx>400||2*ny*(xs.length-1)>8000||2*(2*ny+1)*(2*xs.length-1)-3>10000)return {status:'invalid_mesh',message:'Mesh melampaui batas 10.000 DOF; kurangi L/h atau pilih mesh lebih kasar.'};
 const nodes=[],elements=[],nx2=xs.length-1,node=(i,j)=>j*xs.length+i;
 for(let j=0;j<=ny;j++)for(const x of xs)nodes.push([x,-h/2+h*j/ny]);
 const midpoint=new Map();function mid(a,b){const key=[a,b].sort((x,y)=>x-y).join(',');if(!midpoint.has(key)){midpoint.set(key,nodes.length);nodes.push([(nodes[a][0]+nodes[b][0])/2,(nodes[a][1]+nodes[b][1])/2]);}return midpoint.get(key);}
 function add(a,b,c){elements.push({type:'T6',nodes:[a,b,c,mid(a,b),mid(b,c),mid(c,a)],E:p.E_MPa,nu:p.nu,t:p.b_mm});}
 for(let j=0;j<ny;j++)for(let i=0;i<nx2;i++){const a=node(i,j),bb=node(i+1,j),c=node(i+1,j+1),d=node(i,j+1);add(a,bb,c);add(a,c,d);}
 const weights=(j,left,right)=>{const map=new Map();for(let i=0;i<nx2;i++)if(xs[i]>=left-1e-8*L&&xs[i+1]<=right+1e-8*L){const a=node(i,j),bb=node(i+1,j),m=mid(a,bb),length=xs[i+1]-xs[i];for(const [k,w] of [[a,1/6],[bb,1/6],[m,2/3]])map.set(k,(map.get(k)||0)+w*length);}return [...map];};
 const left=weights(0,0,s),right=weights(0,L-s,L),average=(entries,dof)=>({value:0,terms:entries.map(([node,w])=>({node,dof,coefficient:w/s}))}),loads=[];
 const top=p.load==='point'?weights(ny,L/2-s/2,L/2+s/2):weights(ny,0,L),intensity=p.load==='point'?-p.P_N/s:-p.w_N_per_mm;for(const [node,w] of top)loads.push({node,dof:1,value:intensity*w});
 const model={kernel,nodes,elements,loads,constraints:[],linearConstraints:[average(left,0),average(left,1),average(right,1)]};
 return {...v,model,meta:{level,kernel,strip_mm:s,layers:ny,probe_x_mm:L/4,loadCentroid_mm:loads.reduce((sum,l)=>sum+nodes[l.node][0]*l.value,0)/(loads.reduce((sum,l)=>sum+l.value,0)||1),supportCentroids_mm:[s/2,L-s/2]}};
}
function beamSample(model,result,x){
 const index=model.elements.findIndex(e=>model.nodes[e.nodes[0]][0]<=x+1e-8&&model.nodes[e.nodes[1]][0]>=x-1e-8),e=model.elements[index],field=result.fields[index],a=model.nodes[e.nodes[0]][0],l=model.nodes[e.nodes[1]][0]-a,q=(x-a)/l,u=field.localDisplacements,qy=(model.distributedLoads||[]).find(q=>q.element===index)?.qy||0;
 return {uy:(1-3*q*q+2*q**3)*u[1]+l*(q-2*q*q+q**3)*u[2]+(3*q*q-2*q**3)*u[4]+l*(-q*q+q**3)*u[5],M:-field.endForces[2]+field.endForces[1]*(x-a)+qy*(x-a)**2/2};
}
export function sampleSolid(model,result,x,y){
 const samples=[];for(const e of model.elements){const [a,b,c]=e.nodes.slice(0,3).map(i=>model.nodes[i]),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]),xi=((x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(y-a[1]))/det,eta=((b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]))/det;
 if(xi>=-1e-7&&eta>=-1e-7&&xi+eta<=1+1e-7){const q=t6Point(e.nodes.map(i=>model.nodes[i]),e,xi,eta),u=e.nodes.flatMap(i=>[result.displacements[2*i],result.displacements[2*i+1]]);samples.push(stressAt(q.B,q.D,u).stress[0]);}}
 return samples.length?{sigma: samples.reduce((s,x)=>s+x,0)/samples.length,count:samples.length}:null;
}
export function summarizeBending(prepared,result){
 if(prepared.status!=='ready')return prepared;if(result.status!=='solved_unverified')return {...result};
 const p=prepared.data,model=prepared.model,r=prepared.analytic.result,L=p.L_mm,h=p.h_mm,I=r.I_mm4,probeX=L/4,isBeam=model.kernel==='BEAM2';let delta,top,bottom,rotation=0,maxStrain=0,maxVM=0;
 if(isBeam){delta=-beamSample(model,result,L/2).uy;const m=beamSample(model,result,probeX).M;top=-m*h/(2*I);bottom=-top;for(let i=2;i<result.displacements.length;i+=3)rotation=Math.max(rotation,Math.abs(result.displacements[i]));maxVM=Math.max(...model.nodes.map(([x])=>Math.abs(beamSample(model,result,x).M)*h/(2*I)));maxStrain=maxVM/p.E_MPa;}
 else{const mid=model.nodes.findIndex(([x,y])=>Math.abs(x-L/2)<1e-8*L&&Math.abs(y)<1e-8*h);delta=-result.displacements[2*mid+1];const a=sampleSolid(model,result,probeX,h/2),b=sampleSolid(model,result,probeX,-h/2);if(!a||!b)return {status:'solver_failed',message:'ROI tidak tersedia.'};top=a.sigma;bottom=b.sigma;
 for(const field of result.fields)for(const q of field.integrationPoints){maxVM=Math.max(maxVM,q.vonMises);const [ex,ey,gamma]=q.strain,mean=(ex+ey)/2,radius=Math.hypot((ex-ey)/2,gamma/2);maxStrain=Math.max(maxStrain,Math.abs(mean+radius),Math.abs(mean-radius));}
 // Centerline finite-difference slope is a separately labelled small-rotation diagnostic.
 const center=model.nodes.map(([x,y],i)=>({x,y,i})).filter(n=>Math.abs(n.y)<1e-8*h).sort((a,b)=>a.x-b.x);for(let j=1;j<center.length;j++){const a=center[j-1],b=center[j];rotation=Math.max(rotation,Math.abs((result.displacements[2*b.i+1]-result.displacements[2*a.i+1])/(b.x-a.x)));}
 }
 const outside=[];if(maxVM>=p.Sy_MPa*(1-1e-12))outside.push('Tegangan von Mises prediksi linier mencapai Sy latihan.');if(maxStrain>.01)outside.push('Regangan utama >1%.');if(Math.abs(delta)/L>.02)outside.push('δ/L >2%.');if(rotation>.05)outside.push('Rotasi/kemiringan >0,05 rad.');
 const Mprobe=p.load==='point'?p.P_N*L/8:3*p.w_N_per_mm*L*L/32,analyticTop=-Mprobe*h/(2*I),absdiff=(a,b)=>Math.abs(a-b),relative=(a,b)=>Math.abs(b)>1e-8?Math.abs(a-b)/Math.abs(b):null;
 const comparisons=[['Lendutan tengah',delta,r.deltaMax_mm,'mm'],['σxx atas pada x=L/4',top,analyticTop,'MPa'],['σxx bawah pada x=L/4',bottom,-analyticTop,'MPa']].map(([name,value,reference,unit])=>({name,value:outside.length?null:value,reference,unit,absolute:outside.length?null:absdiff(value,reference),relative:outside.length?null:relative(value,reference)}));
 return {status:outside.length?'outside_model':'solved_unverified',message:outside.join(' '),comparisons,delta_mm:outside.length?null:delta,sigmaTop_MPa:outside.length?null:top,sigmaBottom_MPa:outside.length?null:bottom,maxVM_MPa:maxVM,maxStrain,rotation,energy_Nmm:result.diagnostics.energy_Nmm,diagnostics:result.diagnostics,probeX_mm:probeX};
}
export function meshConvergence(runs){
 if(runs.length!==3||runs.some(r=>r.status!=='solved_unverified'))return {converged:false,message:'Tiga run sah diperlukan; tidak memakai hasil gagal/di luar domain.'};
 const [a,b]=runs.slice(1),change=(x,y)=>Math.abs(y)>1e-8?Math.abs(x-y)/Math.abs(y):Math.abs(x-y)<=1e-8?0:Infinity,delta=change(a.delta_mm,b.delta_mm),stress=Math.max(change(a.sigmaTop_MPa,b.sigmaTop_MPa),change(a.sigmaBottom_MPa,b.sigmaBottom_MPa)),energy=change(a.energy_Nmm,b.energy_Nmm),converged=delta<=.01&&stress<=.03&&energy<=.01;
 return {converged,delta,stress,energy,message:converged?'Perubahan sedang–halus memenuhi ambang latihan. Ini bukan verifikasi kelayakan komponen.':'Belum konvergen: perlu penghalusan atau tinjauan model; tidak menghaluskan warna untuk menyatakan lulus.'};
}
