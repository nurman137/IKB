import {readFile,writeFile} from 'node:fs/promises';
import {axisPreset,prepareAxis,summarizeAxis,axisConvergence} from '../web/fe/axisymmetric-case.js';
import {solveFE} from '../web/fe/solver.js';
const ds=JSON.parse(await readFile(new URL('../docs/m0/reference_cases.json',import.meta.url))),records=[];
for(const id of ['02','03','08'])for(const context of ['mesin','kapal'])for(const support of id==='08'?['free','fixed']:['free']){
 const runs=[];for(const level of ['coarse','medium','fine']){
  const prepared=prepareAxis(id,axisPreset(id,context,ds),level,support);if(prepared.status!=='ready')throw new Error(JSON.stringify(prepared));
  const result=await solveFE(prepared.model),s=summarizeAxis(prepared,result);if(s.status!=='solved_unverified')throw new Error(JSON.stringify(s));runs.push(s);
  records.push({caseId:`${id}-${context==='mesin'?'M':'K'}`,support,level,radialCells:prepared.meta.nr,axialCells:prepared.meta.nz,cellAspect:prepared.meta.aspect,nodes:prepared.model.nodes.length,elements:prepared.model.elements.length,freeDofs:s.diagnostics.freeDofs,delta_mm:s.delta_mm,ur_mm:s.ur_mm,sigmaZZ_MPa:s.sigmaZZ_MPa,elasticEnergy_Nmm:s.energy_Nmm,kinematicEnergy_Nmm:s.diagnostics.energy_Nmm,volume_mm3:s.volume_mm3,residual:s.diagnostics.residual,axialBalance_N:s.diagnostics.balance.Fz,balanceTolerance_N:s.diagnostics.balanceTolerance.force,elapsedMs:s.diagnostics.elapsedMs,reactionBottom_N:s.comparisons.find(c=>c.name==='Reaksi muka z=0').value,reactionTop_N:s.comparisons.find(c=>c.name==='Reaksi muka z=L').value,errors:{maxRelative:Math.max(0,...s.comparisons.map(c=>c.relative??0)),zeroStressAbs_MPa:Math.max(0,...s.comparisons.filter(c=>c.reference===0&&c.unit==='MPa').map(c=>c.absolute)),zeroForceAbs_N:Math.max(0,...s.comparisons.filter(c=>c.reference===0&&c.unit==='N').map(c=>c.absolute))}});
 }records.push({caseId:`${id}-${context==='mesin'?'M':'K'}`,support,convergence:axisConvergence(runs)});
}
await writeFile(new URL('../docs/fe/f3/benchmark.json',import.meta.url),JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify({runs:records.filter(r=>r.level).length,maxDofs:Math.max(...records.filter(r=>r.level).map(r=>r.freeDofs)),maxElapsedMs:Math.max(...records.filter(r=>r.level).map(r=>r.elapsedMs)),allConverged:records.filter(r=>r.convergence).every(r=>r.convergence.converged)}));
