import {FEError,fail,sparse,multiply,dot,norm,pcg,denseCholesky,tick} from './algebra.js';
import {triangle6Element,t6Point,T6_QUADRATURE} from './triangle6.js';
export const TOR_VERSION='F4-0.1';
export function torsionElement(points){
 triangle6Element(points,{E:1,nu:0,t:1});
 const K=Array.from({length:6},()=>new Float64Array(6)),f=new Float64Array(6),mass=new Float64Array(6),quadrature=[];
 for(const [xi,eta,w] of T6_QUADRATURE){const q=t6Point(points,{E:1,nu:0},xi,eta),dx=Array.from({length:6},(_,i)=>q.B[0][2*i]),dy=Array.from({length:6},(_,i)=>q.B[1][2*i+1]),weight=w*q.det;quadrature.push({x:q.x,y:q.y,N:q.N,dx,dy,weight,xi,eta});
  for(let i=0;i<6;i++){mass[i]+=weight*q.N[i];f[i]+=weight*(q.y*dx[i]-q.x*dy[i]);for(let j=0;j<6;j++)K[i][j]+=weight*(dx[i]*dx[j]+dy[i]*dy[j]);}
 }return {K,f,mass,quadrature};
}
export function validateTorsionModel(m){
 if(!m||m.kernel!=='TOR2')fail('invalid_input','Model TOR2 diperlukan.');
 if(!Number.isFinite(m.G_MPa)||m.G_MPa<=0||!Number.isFinite(m.L_mm)||m.L_mm<=0||!Number.isFinite(m.T_Nmm))fail('invalid_input','G, L atau torsi tidak sah.');
 for(const k of ['loads','constraints','distributedLoads','linearConstraints'])if(m[k]!==undefined&&(!Array.isArray(m[k])||m[k].length))fail('invalid_input','TOR2 memakai semua tepi natural dan satu gauge, bukan kendala/beban nodal tambahan.');
 if(!Array.isArray(m.nodes)||m.nodes.length<6||m.nodes.length>10000||!Array.isArray(m.elements)||!m.elements.length||m.elements.length>8000)fail('invalid_mesh','Batas TOR2: 10.000 node/DOF, 8.000 elemen.');
 if(m.nodes.some(p=>!Array.isArray(p)||p.length!==2||p.some(x=>!Number.isFinite(x)||Math.abs(x)>1e7)))fail('invalid_mesh','Koordinat penampang tidak sah.');
 if(new Set(m.nodes.map(p=>p.join(','))).size!==m.nodes.length)fail('invalid_mesh','Node duplikat.');
 const used=new Set(),edges=new Map(),keys=new Set(),graph=m.elements.map(()=>new Set());
 m.elements.forEach((e,i)=>{if(!e||e.type!=='T6'||!Array.isArray(e.nodes)||e.nodes.length!==6||new Set(e.nodes).size!==6||e.nodes.some(j=>!Number.isInteger(j)||j<0||j>=m.nodes.length))fail('invalid_mesh','TOR2 memerlukan konektivitas T6 yang sah.');const key=[...e.nodes].sort((a,b)=>a-b).join(',');if(keys.has(key))fail('invalid_mesh','Elemen duplikat.');keys.add(key);e.nodes.forEach(j=>used.add(j));
  for(let j=0;j<3;j++){const key=[e.nodes[j],e.nodes[(j+1)%3]].sort((a,b)=>a-b).join(','),owners=edges.get(key)||[];if(owners.length>=2||owners.some(o=>o.mid!==e.nodes[j+3]))fail('invalid_mesh','Edge non-manifold atau midpoint tidak konform.');for(const o of owners){graph[i].add(o.i);graph[o.i].add(i);}owners.push({i,mid:e.nodes[j+3]});edges.set(key,owners);}
 });
 if(used.size!==m.nodes.length)fail('invalid_mesh','Ada node lepas.');const visited=new Set([0]),stack=[0];while(stack.length)for(const j of graph[stack.pop()])if(!visited.has(j)){visited.add(j);stack.push(j);}if(visited.size!==m.elements.length)fail('invalid_mesh','TOR2 memerlukan satu domain terhubung lewat edge; rongga tetap boleh.');
 const gauge=m.gaugeNode??0;if(!Number.isInteger(gauge)||gauge<0||gauge>=m.nodes.length)fail('invalid_input','Node gauge tidak sah.');return {gauge};
}
export async function solveTorsionFE(model,options={}){
 const start=performance.now();try{
  const {gauge}=validateTorsionModel(model),cancel=options.cancel||(()=>false),progress=options.progress||(()=>{});if(cancel())fail('cancelled','Analisis dibatalkan.');if(options.method!==undefined&&!['dense','pcg'].includes(options.method))fail('invalid_input','Metode solver tidak dikenal.');
  const n=model.nodes.length,rows=Array.from({length:n},()=>new Map()),f=new Float64Array(n),mass=new Float64Array(n),cache=[],length=Math.max(...model.nodes.map(p=>Math.hypot(...p)));if(!(length>0))fail('invalid_mesh','Penampang tanpa bentang.');
  for(let index=0;index<model.elements.length;index++){const e=model.elements[index],c=torsionElement(e.nodes.map(i=>model.nodes[i]));cache.push(c);for(let i=0;i<6;i++){const a=e.nodes[i];f[a]+=c.f[i];mass[a]+=c.mass[i];for(let j=0;j<6;j++){const b=e.nodes[j];rows[a].set(b,(rows[a].get(b)||0)+c.K[i][j]);}}
   if(index%128===127){progress({phase:'assembly',elements:index+1});await tick();if(cancel())fail('cancelled','Analisis dibatalkan.');}
  }
  const scale=length*length,area=mass.reduce((s,x)=>s+x,0);if(!(area>0)||!Number.isFinite(area))fail('invalid_mesh','Luas tidak positif.');
  const free=Array.from({length:n},(_,i)=>i).filter(i=>i!==gauge),reverse=new Map(free.map((i,j)=>[i,j])),reduced=free.map(i=>new Map([...rows[i]].filter(([j])=>j!==gauge).map(([j,v])=>[reverse.get(j),v]))),A=sparse(reduced),b=Float64Array.from(free,i=>f[i]/scale);
  const compatibility=Math.abs(f.reduce((s,x)=>s+x,0))/Math.max(scale,1e-30);if(compatibility>1e-9)fail('solver_failed','RHS Neumann tidak kompatibel dengan mode konstanta.');
  let symmetry=0,matrixScale=0;for(let i=0;i<n;i++)for(const [j,v] of rows[i]){symmetry=Math.max(symmetry,Math.abs(v-(rows[j].get(i)||0)));matrixScale=Math.max(matrixScale,Math.abs(v));}symmetry/=Math.max(matrixScale,1);if(symmetry>1e-12)fail('solver_failed','Matriks TOR2 tidak simetris.');
  let dense=null;if(A.n<=256)dense=denseCholesky(A,b);const solution=options.method==='dense'?{x:dense||denseCholesky(A,b),iterations:0}:await pcg(A,b,{tolerance:1e-11,...options,cancel,progress});
  const psi=new Float64Array(n);free.forEach((i,j)=>psi[i]=solution.x[j]*scale);const mean=dot(mass,psi)/area;for(let i=0;i<n;i++)psi[i]-=mean;
  const product=multiply(sparse(rows),psi),residual=norm(Float64Array.from(product,(x,i)=>(x-f[i])/scale))/Math.max(norm(b),1),gaugeResidual=Math.abs(dot(mass,psi)/(area*scale));
  if(residual>1e-8||gaugeResidual>1e-8||![...psi].every(Number.isFinite))fail('solver_failed','Residual atau gauge TOR2 gagal.');
  let Jt=0,Jtorque=0,polar=0,areaIntegral=0;const unitFields=cache.map((c,index)=>{const local=Float64Array.from(model.elements[index].nodes,i=>psi[i]);return c.quadrature.map(q=>{const gx=dot(q.dx,local),gy=dot(q.dy,local),qx=gx-q.y,qy=gy+q.x;Jt+=q.weight*(qx*qx+qy*qy);Jtorque+=q.weight*(q.x*qy-q.y*qx);polar+=q.weight*(q.x*q.x+q.y*q.y);areaIntegral+=q.weight;return {...q,gradient:[gx,gy],psi:dot(q.N,local),unitShear:[qx,qy]};});});
  if(!(Jt>0)||!Number.isFinite(Jt)||Math.abs(Jt-Jtorque)/Jt>.005)fail('solver_failed','Jt dari energi dan integral torsi tidak konsisten.');
  const denominator=model.G_MPa*Jt,kappa=model.T_Nmm/denominator,theta=kappa*model.L_mm;if(![denominator,kappa,theta].every(Number.isFinite)||denominator<=0)fail('invalid_input','Skala torsi/material melampaui jangkauan numerik.');const fields=unitFields.map((qs,index)=>{const local=Float64Array.from(model.elements[index].nodes,i=>psi[i]),centroidPsi=(-local[0]-local[1]-local[2]+4*local[3]+4*local[4]+4*local[5])/9;return {element:index,centroid:{x:qs.reduce((s,q)=>s+q.x,0)/3,y:qs.reduce((s,q)=>s+q.y,0)/3,psi:centroidPsi,shearStress:[0,1].map(i=>qs.reduce((s,q)=>s+q.unitShear[i],0)/3*kappa*model.G_MPa)},integrationPoints:qs.map(q=>({x:q.x,y:q.y,xi:q.xi,eta:q.eta,weight:q.weight,psi:q.psi,gradient:q.gradient,shearStrain:q.unitShear.map(v=>v*kappa),shearStress:q.unitShear.map(v=>v*kappa*model.G_MPa)}))};});
  const energy=.5*model.G_MPa*kappa*kappa*Jt*model.L_mm,work=.5*model.T_Nmm*theta,torque=model.G_MPa*kappa*Jtorque,resultant=[0,0];for(const field of fields)for(const q of field.integrationPoints)for(let i=0;i<2;i++)resultant[i]+=q.weight*q.shearStress[i];
  if(![energy,work,torque].every(Number.isFinite)||Math.abs(torque-model.T_Nmm)>.005*Math.max(1,Math.abs(model.T_Nmm)))fail('solver_failed','Torsi/energi tidak konsisten atau tidak finite.');
  const forceScale=Math.max(1,Math.abs(model.G_MPa*kappa)*length*areaIntegral);if(Math.max(...resultant.map(Math.abs))>1e-6*forceScale)fail('solver_failed','Resultan gaya geser penampang tidak seimbang.');
  if(cancel())fail('cancelled','Analisis dibatalkan.');
  return {status:'solved_unverified',modelVersion:TOR_VERSION,warping:psi,Jt_mm4:Jt,Jtorque_mm4:Jtorque,polarMoment_mm4:polar,area_mm2:areaIntegral,kappa_per_mm:kappa,theta_rad:theta,torque_Nmm:torque,fields,diagnostics:{freeDofs:free.length,totalDofs:n,nonzeros:sparse(rows).values.length,iterations:solution.iterations,solverMethod:options.method==='dense'?'dense-cholesky':'pcg',symmetry,residual,gaugeResidual,compatibility,shearResultant_N:resultant,energy_Nmm:energy,halfWork_Nmm:work,torqueRelativeDifference:Math.abs(Jt-Jtorque)/Jt,elapsedMs:performance.now()-start}};
 }catch(e){if(e instanceof FEError)return {status:e.status,message:e.message,modelVersion:TOR_VERSION};throw e;}
}
export function torsionSample(model,result,x,y){
 const samples=[];for(const e of model.elements){const [a,b,c]=e.nodes.slice(0,3).map(i=>model.nodes[i]),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]),xi=((x-a[0])*(c[1]-a[1])-(c[0]-a[0])*(y-a[1]))/det,eta=((b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]))/det;
  if(xi>=-1e-8&&eta>=-1e-8&&xi+eta<=1+1e-8){const q=t6Point(e.nodes.map(i=>model.nodes[i]),{E:1,nu:0},xi,eta),local=Float64Array.from(e.nodes,i=>result.warping[i]),gx=q.B[0].reduce((s,v,i)=>s+(i%2===0?v*local[i/2]:0),0),gy=q.B[1].reduce((s,v,i)=>s+(i%2?v*local[(i-1)/2]:0),0);samples.push({psi:dot(q.N,local),shearStrain:[(gx-y)*result.kappa_per_mm,(gy+x)*result.kappa_per_mm]});}}
 if(!samples.length)return null;const strain=[0,1].map(i=>samples.reduce((s,q)=>s+q.shearStrain[i],0)/samples.length);return {count:samples.length,psi:samples.reduce((s,q)=>s+q.psi,0)/samples.length,shearStrain:strain,shearStress:strain.map(v=>v*model.G_MPa)};
}
