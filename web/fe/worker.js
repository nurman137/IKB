import {solveFE} from './solver.js';
// Browser module Worker. F1 controller owns cancellation by Worker.terminate().
self.onmessage=async({data})=>{if(data?.kind!=='solve'||typeof data.runId!=='string')return;try{const result=await solveFE(data.model,{progress:p=>self.postMessage({kind:'progress',runId:data.runId,...p})});self.postMessage({kind:'result',runId:data.runId,result});}catch{self.postMessage({kind:'result',runId:data.runId,result:{status:'solver_failed',message:'Analisis gagal; hasil tidak digunakan.'}});}};
