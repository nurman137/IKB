import {FEError,fail,sparse,multiply,dot,norm,pcg,denseCholesky,bandedCholesky,tick} from './algebra.js';
import {beamElement,triangleElement,beamDistributed} from './elements.js';
import {triangle6Element,stressAt} from './triangle6.js';
export const F1_LIMITS={freeDofs:10000,beamFreeDofs:384,elements:8000,nodes:10000};
export const MODEL_VERSION='F2a-0.1';
const validNumber=v=>typeof v==='number'&&Number.isFinite(v);
function rank3(rows){const a=rows.map(r=>[...r]);let rank=0;for(let col=0;col<3;col++){let p=rank;for(let j=rank;j<a.length;j++)if(Math.abs(a[j][col])>Math.abs(a[p]?.[col]||0))p=j;if(Math.abs(a[p]?.[col]||0)<1e-10)continue;[a[rank],a[p]]=[a[p],a[rank]];const v=a[rank][col];for(let k=col;k<3;k++)a[rank][k]/=v;for(let j=0;j<a.length;j++)if(j!==rank){const v=a[j][col];for(let k=col;k<3;k++)a[j][k]-=v*a[rank][k];}rank++;}return rank;}
export function validateModel(model){
 if(!model||!['BEAM2','PS2'].includes(model.kernel))fail('invalid_input','Solver mendukung BEAM2 dan PS2 T3/T6.');
 for(const k of ['loads','constraints','distributedLoads','linearConstraints'])if(model[k]!==undefined&&!Array.isArray(model[k]))fail('invalid_input','Daftar beban/kendala harus berupa array.');
 const {nodes,elements}=model,d=model.kernel==='BEAM2'?3:2;
 if(!Array.isArray(nodes)||nodes.length<2||nodes.length>F1_LIMITS.nodes||!Array.isArray(elements)||!elements.length||elements.length>F1_LIMITS.elements)fail('invalid_mesh','Jumlah node/elemen kosong atau melewati batas F1.');
 if(nodes.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!validNumber(v)||Math.abs(v)>1e7)))fail('invalid_mesh','Koordinat node tidak sah.');
 const seenPoints=new Set();for(const p of nodes){const key=p.join(',');if(seenPoints.has(key))fail('invalid_mesh','Node duplikat secara geometris.');seenPoints.add(key);}
 const xs=nodes.map(p=>p[0]),ys=nodes.map(p=>p[1]),cx=(Math.max(...xs)+Math.min(...xs))/2,cy=(Math.max(...ys)+Math.min(...ys))/2,L=Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));if(!(L>0))fail('invalid_mesh','Geometri tidak mempunyai bentang.');
 const used=new Set(),links=nodes.map(()=>new Set()),edgeOwners=new Map(),elementNeighbors=elements.map(()=>new Set()),elementKeys=new Set();
 elements.forEach((e,index)=>{if(!e||typeof e!=='object')fail('invalid_mesh','Definisi elemen tidak sah.');const n=model.kernel==='BEAM2'?2:e.type==='T6'?6:3;if(!Array.isArray(e.nodes)||e.nodes.length!==n||new Set(e.nodes).size!==n||e.nodes.some(i=>!Number.isInteger(i)||i<0||i>=nodes.length))fail('invalid_mesh','Konektivitas elemen tidak sah.');const key=[...e.nodes].sort((a,b)=>a-b).join(',');if(elementKeys.has(key))fail('invalid_mesh','Elemen duplikat.');elementKeys.add(key);for(const i of e.nodes){used.add(i);e.nodes.forEach(j=>links[i].add(j));}
 if(n===3||n===6)for(let k=0;k<3;k++){const edge=[e.nodes[k],e.nodes[(k+1)%3]].sort((a,b)=>a-b).join(',');const owners=edgeOwners.get(edge)||[];if(owners.length){const previous=elements[owners[0]],pn=previous.nodes.length;if(pn!==n||(n===6&&previous.nodes[(previous.nodes.slice(0,3).findIndex((v,j)=>[v,previous.nodes[(j+1)%3]].sort((a,b)=>a-b).join(',')===edge))+3]!==e.nodes[k+3]))fail('invalid_mesh','Edge T6 tidak konform atau node tengah tidak sama.');}if(owners.length>=2)fail('invalid_mesh','Edge non-manifold.');owners.forEach(j=>{elementNeighbors[index].add(j);elementNeighbors[j].add(index);});owners.push(index);edgeOwners.set(edge,owners);}
 });
 if(used.size!==nodes.length)fail('invalid_mesh','Ada node tidak terhubung elemen.');
 const visit=(graph)=>{const seen=new Set([0]),stack=[0];while(stack.length)for(const j of graph[stack.pop()])if(!seen.has(j)){seen.add(j);stack.push(j);}return seen.size;};
 if(visit(links)!==nodes.length)fail('invalid_mesh','Mesh terputus: F1 memerlukan satu komponen.');
 if(model.kernel==='PS2'&&visit(elementNeighbors)!==elements.length)fail('invalid_mesh','Elemen solid harus terhubung melalui edge, bukan hanya satu titik.');
 const fixed=new Map(),rigid=[];
 for(const c of model.constraints||[]){if(!c||!Number.isInteger(c.node)||c.node<0||c.node>=nodes.length||!Number.isInteger(c.dof)||c.dof<0||c.dof>=d||!validNumber(c.value))fail('invalid_input','Kendala DOF tidak sah.');const k=c.node*d+c.dof;if(fixed.has(k))fail('invalid_input','Kendala DOF duplikat.');fixed.set(k,c.value);const p=nodes[c.node];rigid.push(c.dof===0?[1,0,-(p[1]-cy)/L]:c.dof===1?[0,1,(p[0]-cx)/L]:[0,0,1]);}
 const mpcs=model.linearConstraints||[],occupied=new Set();
 for(const bc of mpcs){if(model.kernel!=='PS2'||!bc||!Array.isArray(bc.terms)||bc.terms.length<2||!validNumber(bc.value))fail('invalid_input','Kendala rata-rata PS2 tidak sah.');const axis=bc.terms[0]?.dof,row=[0,0,0];for(const t of bc.terms){if(!t||!Number.isInteger(t.node)||t.node<0||t.node>=nodes.length||![0,1].includes(t.dof)||t.dof!==axis||!validNumber(t.coefficient)||t.coefficient===0)fail('invalid_input','Term kendala linier tidak sah.');const key=t.node*d+t.dof;if(occupied.has(key)||fixed.has(key))fail('invalid_input','F2a memerlukan kelompok kendala linier yang terpisah dari kendala lain.');occupied.add(key);const [x,y]=nodes[t.node],mode=t.dof===0?[1,0,-(y-cy)/L]:[0,1,(x-cx)/L];for(let k=0;k<3;k++)row[k]+=t.coefficient*mode[k];}rigid.push(row);}
 if(rank3(rigid)<3)fail('underconstrained','Tumpuan belum menghilangkan dua translasi dan satu rotasi benda tegar.');
 const free=nodes.length*d-fixed.size-mpcs.length;if(free>(model.kernel==='BEAM2'?F1_LIMITS.beamFreeDofs:F1_LIMITS.freeDofs))fail('invalid_mesh','DOF bebas melewati batas F1. Pilih mesh lebih kasar.');
 for(const l of model.loads||[])if(!l||!Number.isInteger(l.node)||l.node<0||l.node>=nodes.length||!Number.isInteger(l.dof)||l.dof<0||l.dof>=d||!validNumber(l.value))fail('invalid_input','Beban nodal tidak sah.');
 for(const q of model.distributedLoads||[])if(!q||model.kernel!=='BEAM2'||!Number.isInteger(q.element)||q.element<0||q.element>=elements.length||!validNumber(q.qx??0)||!validNumber(q.qy??0))fail('invalid_input','Beban merata lokal hanya untuk elemen BEAM2 yang sah.');
 return {d,L,fixed,mpcs};
}
export async function solveFE(model,options={}){
 const start=performance.now();try{
 if(options.method!==undefined&&!['dense','pcg'].includes(options.method))fail('invalid_input','Metode solver tidak dikenal.');
 const {d,L,fixed,mpcs}=validateModel(model),cancel=options.cancel||(()=>false),progress=options.progress||(()=>{});if(cancel())fail('cancelled','Analisis dibatalkan.');
 const n=model.nodes.length*d,rows=Array.from({length:n},()=>new Map()),f=new Float64Array(n),cache=[];
 for(const l of model.loads||[])f[l.node*d+l.dof]+=l.value;
 for(let index=0;index<model.elements.length;index++){
  const e=model.elements[index],points=e.nodes.map(i=>model.nodes[i]),element=model.kernel==='BEAM2'?beamElement(...points,e):(e.type==='T6'?triangle6Element(points,e):triangleElement(points,e)),dofs=e.nodes.flatMap(i=>Array.from({length:d},(_,k)=>i*d+k));
  element.loadLocal=new Float64Array(dofs.length);
  for(const q of (model.distributedLoads||[]).filter(q=>q.element===index)){const qf=beamDistributed(element,q.qx??0,q.qy??0);qf.global.forEach((v,i)=>f[dofs[i]]+=v);qf.local.forEach((v,i)=>element.loadLocal[i]+=v);}
  for(let i=0;i<dofs.length;i++)for(let j=0;j<dofs.length;j++){const row=rows[dofs[i]],k=dofs[j],v=element.K[i][j];row.set(k,(row.get(k)||0)+v);}
  if(model.kernel==='BEAM2'&&element.L<=1e-10*L)fail('invalid_mesh','Elemen garis terlalu pendek terhadap bentang model.');
  cache.push({...element,dofs});
  if(index%256===255){progress({phase:'assembly',elements:index+1});await tick();if(cancel())fail('cancelled','Analisis dibatalkan.');}
 }
 if(![...f].every(Number.isFinite))fail('invalid_input','Jumlah beban di luar jangkauan numerik.');
 let symmetry=0,maxRow=0;for(let i=0;i<n;i++){let sum=0;for(const [j,v] of rows[i]){if(!Number.isFinite(v))fail('invalid_input','Kekakuan di luar jangkauan numerik.');sum+=Math.abs(v);symmetry=Math.max(symmetry,Math.abs(v-(rows[j].get(i)||0)));}maxRow=Math.max(maxRow,sum);}
 if(symmetry/Math.max(maxRow,1)>1e-12)fail('solver_failed','Matriks tidak simetris.');
 const pivots=new Map(),constrained=new Set(fixed.keys());
 for(const bc of mpcs){const terms=bc.terms.map(t=>({index:t.node*d+t.dof,c:t.coefficient})),pivot=terms.reduce((a,b)=>Math.abs(a.c)>Math.abs(b.c)?a:b);pivots.set(pivot.index,{shift:bc.value/pivot.c,terms:terms.filter(t=>t!==pivot).map(t=>[t.index,-t.c/pivot.c])});constrained.add(pivot.index);}
 const free=[];for(let i=0;i<n;i++)if(!constrained.has(i))free.push(i);const reverse=new Map(free.map((k,i)=>[k,i]));
 const representations=Array.from({length:n},(_,i)=>fixed.has(i)?{shift:fixed.get(i),terms:[]}:pivots.has(i)?{shift:pivots.get(i).shift,terms:pivots.get(i).terms.map(([j,c])=>[reverse.get(j),c])}:{shift:0,terms:[[reverse.get(i),1]]});
 const scale=Float64Array.from(free,i=>d===3&&i%3===2?1/L:1),u=new Float64Array(n),g=Float64Array.from(representations,r=>r.shift),reducedRows=free.map(()=>new Map()),b=new Float64Array(free.length);
 for(let i=0;i<n;i++){let rhs=f[i];for(const [j,v] of rows[i])rhs-=v*g[j];for(const [ii,ci] of representations[i].terms){b[ii]+=ci*rhs*scale[ii];for(const [j,v] of rows[i])for(const [jj,cj] of representations[j].terms){const row=reducedRows[ii];row.set(jj,(row.get(jj)||0)+ci*v*cj*scale[ii]*scale[jj]);}}}
 const A=sparse(reducedRows);if(cancel())fail('cancelled','Analisis dibatalkan.');
 // Small dense factorization also diagnoses mechanisms even when the RHS is zero.
 let dense=null;if(A.n&&A.n<=256)dense=denseCholesky(A,b);
 let solution,solverMethod='pcg';const bandSolution=model.kernel==='BEAM2'&&!options.method?bandedCholesky(A,b):null;if(bandSolution){solution={x:bandSolution,iterations:0};solverMethod='banded-cholesky';}else if(options.method==='dense'){if(A.n>256)fail('invalid_input','Metode dense dibatasi 256 DOF.');solution={x:dense||new Float64Array(0),iterations:0};solverMethod='dense-cholesky';}else{solution=await pcg(A,b,{tolerance:model.elements.some(e=>e.type==='T6')?1e-9:1e-10,...options,cancel,progress});}
 for(let i=0;i<n;i++){u[i]=g[i];for(const [j,c] of representations[i].terms)u[i]+=c*solution.x[j]*scale[j];}
 const K=sparse(rows),ku=multiply(K,u),reactions=new Float64Array(n),reactionDofs=new Set(fixed.keys());for(const bc of mpcs)for(const t of bc.terms)reactionDofs.add(t.node*d+t.dof);for(const i of reactionDofs)reactions[i]=ku[i]-f[i];
 const residualVector=multiply(A,solution.x),forceScale=Math.max(1,norm(b),norm(residualVector));for(let i=0;i<residualVector.length;i++)residualVector[i]-=b[i];const residual=norm(residualVector)/forceScale;
 if(!Number.isFinite(residual)||residual>1e-8||![...u,...reactions].every(Number.isFinite))fail('solver_failed','Residual akhir gagal atau hasil tidak finite.');
 const constraintResidual=Math.max(0,...mpcs.map(bc=>Math.abs(bc.terms.reduce((sum,t)=>sum+t.coefficient*u[t.node*d+t.dof],0)-bc.value)));
 if(constraintResidual>1e-8)fail('solver_failed','Kendala linier tidak terpenuhi.');
 const balance={Fx:0,Fy:0,Mz:0};for(let node=0;node<model.nodes.length;node++){const [x,y]=model.nodes[node],fx=f[node*d]+reactions[node*d],fy=f[node*d+1]+reactions[node*d+1];balance.Fx+=fx;balance.Fy+=fy;balance.Mz+=x*fy-y*fx+(d===3?f[node*d+2]+reactions[node*d+2]:0);}
 let forceReference=0,momentReference=0;for(let node=0;node<model.nodes.length;node++){const [x,y]=model.nodes[node];for(const values of [f,reactions]){forceReference+=Math.abs(values[node*d])+Math.abs(values[node*d+1]);momentReference+=Math.abs(x*values[node*d+1])+Math.abs(y*values[node*d])+(d===3?Math.abs(values[node*d+2]):0);}}
 const balanceTolerance={force:Math.max(1e-6,1e-6*forceReference),moment:Math.max(1e-6,1e-6*momentReference)};
 if(Math.max(Math.abs(balance.Fx),Math.abs(balance.Fy))>balanceTolerance.force||Math.abs(balance.Mz)>balanceTolerance.moment)fail('solver_failed','Keseimbangan gaya/momen gagal; hasil tidak digunakan.');
 const fields=cache.map((c,index)=>{
  const ue=Float64Array.from(c.dofs,i=>u[i]);if(model.kernel==='BEAM2'){const local=c.T.map(row=>dot(row,ue)),forces=c.localK.map((row,i)=>dot(row,local)-c.loadLocal[i]);return {element:index,localDisplacements:local,endForces:forces};}
  const point=stressAt(c.B,c.D,ue);return {element:index,...point,area:c.area,integrationPoints:c.quadrature?.map(q=>({x:q.x,y:q.y,xi:q.xi,eta:q.eta,...stressAt(q.B,q.D,ue)}))};
 });
 const energy=dot(u,ku)/2,work=dot(u,Float64Array.from(f,(v,i)=>v+reactions[i]))/2;
 const diagnostics={solverMethod,constraintResidual,freeDofs:free.length,totalDofs:n,nonzeros:K.values.length,iterations:solution.iterations,balanceTolerance,residual,symmetry:symmetry/Math.max(maxRow,1),balance,energy_Nmm:energy,halfWork_Nmm:work,denseDifference:dense?norm(Float64Array.from(dense,(v,i)=>v-solution.x[i])):null,elapsedMs:performance.now()-start};
 if(cancel())fail('cancelled','Analisis dibatalkan.');
 return {status:'solved_unverified',modelVersion:MODEL_VERSION,displacements:u,reactions,appliedLoads:f,fields,diagnostics};
 }catch(e){if(e instanceof FEError)return {status:e.status,message:e.message,modelVersion:MODEL_VERSION};throw e;}
}
