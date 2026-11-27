// Per-device learning progress (M7). Stored only in this browser's localStorage; never sent anywhere.
// It records what was attempted, not grades: no class records, no account, no sync.
export const PROGRESS_KEY='ikb-progress-v1';
const empty=()=>({version:1,items:{}});

export function createProgressStore(storage){
  const read=()=>{try{const v=JSON.parse(storage?.getItem(PROGRESS_KEY)||'null');return v&&v.version===1&&v.items&&typeof v.items==='object'?v:empty();}catch{return empty();}};
  const write=v=>{try{storage.setItem(PROGRESS_KEY,JSON.stringify(v));return true;}catch{return false;}};
  return {
    available(){try{const k='ikb-progress-probe';storage.setItem(k,'1');storage.removeItem(k);return true;}catch{return false;}},
    all:read,
    record(module,context,kind,value){
      if(!/^(0[1-9]|10)$/.test(module)||!['mesin','kapal'].includes(context))return false;
      const p=read(),key=`${module}-${context}`,it=p.items[key]||{};
      if(kind==='visit')it.visited=true;
      else if(kind==='calculation')it.calculation=true;
      else if(kind==='prediction'){it.predictionAnswered=true;it.predictionCorrect=Boolean(it.predictionCorrect||value);}
      else if(kind==='exercise'){const n=Math.max(0,Math.min(2,Math.trunc(Number(value)||0)));it.exerciseAttempted=true;it.exerciseBest=Math.max(it.exerciseBest||0,n);}
      else if(kind==='reflection')it.reflection=Boolean(value);
      else return false;
      it.updated=new Date().toISOString();p.items[key]=it;return write(p);
    },
    module(module){
      const p=read(),ctx=['mesin','kapal'].map(c=>({context:c,...(p.items[`${module}-${c}`]||{})}));
      const any=k=>ctx.some(x=>x[k]);
      const best=Math.max(0,...ctx.map(x=>x.exerciseBest||0));
      return {contexts:ctx,visited:any('visited'),calculation:any('calculation'),predictionAnswered:any('predictionAnswered'),predictionCorrect:any('predictionCorrect'),exerciseBest:best,exerciseAttempted:any('exerciseAttempted'),reflection:any('reflection'),
        // "Tuntas" = prediction answered and both exercise answers correct in at least one context. A study marker, not a grade.
        complete:any('predictionAnswered')&&best===2};
    },
    clear(){try{storage.removeItem(PROGRESS_KEY);return true;}catch{return false;}},
  };
}

let defaultStorage=null;try{defaultStorage=globalThis.localStorage??null;}catch{defaultStorage=null;}
export const progress=createProgressStore(defaultStorage);
export function progressLabel(m){
  if(!m.visited&&!m.predictionAnswered&&!m.exerciseAttempted)return 'Belum dibuka';
  if(m.complete)return 'Tuntas dipelajari';
  const parts=[];if(m.predictionAnswered)parts.push('prediksi ✓');if(m.exerciseAttempted)parts.push(`latihan ${m.exerciseBest}/2`);
  return parts.length?`Sedang dipelajari · ${parts.join(' · ')}`:'Sudah dibuka';
}
