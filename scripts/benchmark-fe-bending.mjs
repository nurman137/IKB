import {makeBendingModel,summarizeBending,meshConvergence} from '../web/fe/bending-case.js';
import {solveFE} from '../web/fe/solver.js';
import {writeFile} from 'node:fs/promises';
const rows=[];
for(const context of ['mesin','kapal'])for(const load of ['point','udl']){
 const p={load,P_N:8000,w_N_per_mm:5,L_mm:1500,b_mm:60,h_mm:120,E_MPa:200000,Sy_MPa:250,...context==='kapal'?{P_N:20000,w_N_per_mm:6,L_mm:3000,b_mm:100,h_mm:200}:{}};
 const runs=[];
 for(const level of ['coarse','medium','fine']){
  const a=makeBendingModel(p,'PS2',level);if(a.status!=='ready')throw new Error(JSON.stringify(a));
  const r=await solveFE(a.model),s=summarizeBending(a,r);if(s.status!=='solved_unverified')throw new Error(JSON.stringify(s));runs.push(s);
  rows.push({context,load,level,nodes:a.model.nodes.length,elements:a.model.elements.length,freeDofs:r.diagnostics.freeDofs,status:s.status,delta_mm:s.delta_mm,relative:s.comparisons.map(c=>c.relative),energy_Nmm:s.energy_Nmm,residual:s.diagnostics.residual,iterations:s.diagnostics.iterations});
 }
 rows.push({context,load,convergence:meshConvergence(runs)});
}
await writeFile(new URL('../docs/fe/f2a/benchmark.json',import.meta.url),JSON.stringify(rows,null,2)+'\n');
console.log('Saved 12 solid runs and 4 convergence checks.');
