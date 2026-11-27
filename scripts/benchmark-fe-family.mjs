import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {familyPreset,prepareFamily,summarizeFamilyRun,designFromFE} from '../web/fe/beam-family.js';
import {solveFE} from '../web/fe/solver.js';
import {meshConvergence} from '../web/fe/bending-case.js';
const dataset=JSON.parse(await readFile(new URL('../docs/m0/reference_cases.json',import.meta.url))),rows=[];
for(const [id,context] of [['01','mesin'],['01','kapal'],['07','mesin'],['07','kapal'],['10','kapal']]){
 const input=familyPreset(id,context,dataset);
 for(const kernel of id==='01'?['BEAM2']:['BEAM2','PS2']){
  const series=[];
  for(const level of ['coarse','medium','fine']){
   const group=prepareFamily(id,input,kernel,level),summaries=[];
   for(const run of group.runs){const fe=run.status==='ready'?await solveFE(run.model):run,s=summarizeFamilyRun(run,fe,id);if(s.status!=='solved_unverified')throw new Error(JSON.stringify(s));summaries.push(s);
    rows.push({caseId:`${id}-${context==='mesin'?'M':'K'}`,kernel,level,subrun:run.meta.key,freeDofs:s.diagnostics.freeDofs,elements:run.model.elements.length,delta_mm:s.delta_mm,xMax_mm:s.xMax_mm??null,sigmaTop_MPa:s.sigmaTop_MPa,sigmaBottom_MPa:s.sigmaBottom_MPa,maxRelativeDifference:Math.max(...s.comparisons.map(c=>c.relative??0)),energy_Nmm:s.energy_Nmm,residual:s.diagnostics.residual,elapsedMs:s.diagnostics.elapsedMs});
   }series.push(summaries);if(id==='10'&&kernel==='BEAM2'&&level==='fine')rows.push({caseId:'10-K',decision:designFromFE(input,summaries)});
  }
  for(let i=0;i<series[0].length;i++)rows.push({caseId:`${id}-${context==='mesin'?'M':'K'}`,kernel,subrun:i===0?'A':'B',convergence:meshConvergence(series.map(s=>s[i]))});
 }
}
await mkdir(new URL('../docs/fe/f2b/',import.meta.url),{recursive:true});await writeFile(new URL('../docs/fe/f2b/benchmark.json',import.meta.url),JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify({runs:rows.filter(r=>r.level).length,maxDofs:Math.max(...rows.filter(r=>r.level).map(r=>r.freeDofs)),maxElapsedMs:Math.max(...rows.filter(r=>r.level).map(r=>r.elapsedMs)),allConverged:rows.filter(r=>r.convergence).every(r=>r.convergence.converged)}));
