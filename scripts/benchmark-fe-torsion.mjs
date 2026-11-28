import {readFile,writeFile} from 'node:fs/promises';
import {torPreset,prepareTor,summarizeTor,torConvergence,shaftDecisionFE,TOR_LEVELS} from '../web/fe/torsion-case.js';
import {polarT6Mesh} from '../web/fe/torsion-mesh.js';
import {solveFE} from '../web/fe/solver.js';
const ds=JSON.parse(await readFile(new URL('../docs/m0/reference_cases.json',import.meta.url))),rows=[];
for(const [id,context,hollow] of [['05','mesin',false],['05','kapal',false],['10','mesin',false],['05','mesin',true],['05','kapal',true]]){
 const p=torPreset(id,context,ds);if(hollow)p.di_mm=.6*p.d_mm;const series=id==='10'?[[],[]]:[[]];
 for(const level of Object.keys(TOR_LEVELS)){const g=prepareTor(id,p,level),summaries=[];
  for(const [i,a] of g.runs.entries()){if(a.status!=='ready')throw new Error(JSON.stringify(a));const r=await solveFE(a.model),s=summarizeTor(a,r);if(s.status!=='solved_unverified')throw new Error(JSON.stringify(s));summaries.push(s);series[i].push(s);
   rows.push({caseId:`${id}-${context==='mesin'?'M':'K'}${hollow?'-hollow':''}`,subrun:a.meta.key,level,nodes:a.model.nodes.length,elements:a.model.elements.length,freeDofs:s.diagnostics.freeDofs,Jt_mm4:s.Jt_mm4,Jtorque_mm4:r.Jtorque_mm4,theta_rad:s.theta_rad,tauOuter_MPa:s.tauOuter_MPa,tauInner_MPa:s.tauInner_MPa,energy_Nmm:s.energy_Nmm,areaError:s.areaError,polarError:s.polarError,maxRelativeDifference:Math.max(...s.comparisons.map(c=>c.relative??0)),residual:s.diagnostics.residual,gaugeResidual:s.diagnostics.gaugeResidual,torqueRelativeDifference:s.diagnostics.torqueRelativeDifference,iterations:s.diagnostics.iterations,elapsedMs:s.diagnostics.elapsedMs});
  }if(id==='10'&&level==='fine')rows.push({caseId:'10-M',decision:shaftDecisionFE(p,summaries)});
 }
 for(const [i,ss] of series.entries())rows.push({caseId:`${id}-${context==='mesin'?'M':'K'}${hollow?'-hollow':''}`,subrun:i===0?'A':'B',convergence:torConvergence(ss)});
}
for(const [level,spec] of Object.entries(TOR_LEVELS)){const m={...polarT6Mesh({ro:2,stretchY:.5,...spec}),kernel:'TOR2',G_MPa:70000,L_mm:100,T_Nmm:100},r=await solveFE(m);if(r.status!=='solved_unverified')throw new Error(JSON.stringify(r));rows.push({caseId:'ellipse-validation',level,nodes:m.nodes.length,Jt_mm4:r.Jt_mm4,referenceJt_mm4:Math.PI*8/5,relativeDifference:Math.abs(r.Jt_mm4-Math.PI*8/5)/(Math.PI*8/5),polarMoment_mm4:r.polarMoment_mm4,warpingMax_mm2:Math.max(...r.warping.map(Math.abs)),residual:r.diagnostics.residual,iterations:r.diagnostics.iterations,elapsedMs:r.diagnostics.elapsedMs});}
await writeFile(new URL('../docs/fe/f4/benchmark.json',import.meta.url),JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify({runs:rows.filter(r=>r.level).length,maxDofs:Math.max(...rows.filter(r=>r.freeDofs).map(r=>r.freeDofs)),maxElapsedMs:Math.max(...rows.filter(r=>r.level).map(r=>r.elapsedMs)),allConverged:rows.filter(r=>r.convergence).every(r=>r.convergence.converged)}));
