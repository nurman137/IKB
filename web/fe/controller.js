// One dedicated Worker per active run. Cancel terminates it immediately; old messages cannot win.
export class FEController {
 constructor({createWorker=()=>new Worker(new URL('./worker.js',import.meta.url),{type:'module'}),onProgress=()=>{}}={}){this.createWorker=createWorker;this.onProgress=onProgress;this.current=null;this.sequence=0;}
 cancel(){if(!this.current)return;const current=this.current;this.current=null;current.worker.terminate();current.resolve({status:'cancelled',runId:current.runId,message:'Analisis dibatalkan; hasil lama tidak digunakan.'});}
 async run(model){this.cancel();const runId=String(++this.sequence),inputSnapshot=JSON.stringify(model);return new Promise(resolve=>{let worker;try{worker=this.createWorker();}catch{resolve({status:'solver_failed',message:'Web Worker tidak dapat dimulai.',runId});return;}
 const current={worker,runId,resolve,inputSnapshot};this.current=current;
 worker.onmessage=({data})=>{if(this.current!==current||data?.runId!==runId)return;if(data.kind==='progress'){this.onProgress(data);return;}if(data.kind==='result'){this.current=null;worker.terminate();resolve({...data.result,runId,inputSnapshot});}};
 worker.onerror=()=>{if(this.current!==current)return;this.current=null;worker.terminate();resolve({status:'solver_failed',message:'Worker gagal. Hasil tidak digunakan.',runId});};
 worker.postMessage({kind:'solve',runId,model:JSON.parse(inputSnapshot)});
 });}
}
