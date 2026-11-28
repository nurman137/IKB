import {familyAvailable,familyFields,validateFamily} from './beam-family.js';
const storageKey=(id,context)=>`ikb-fe-family-v1-${id}-${context}`;
export function saveFamilyTransfer(session,id,context,input){
 if(!familyAvailable(id,context)||validateFamily(id,input).status!=='ready')return false;
 const keys=[...Object.keys(familyFields(id)),...id==='07'?['shape']:[]],data=Object.fromEntries(keys.filter(k=>input[k]!==undefined).map(k=>[k,input[k]]));
 session.set(storageKey(id,context),JSON.stringify({version:1,id,context,data}));return true;
}
export function readFamilyTransfer(session,id,context){
 if(!familyAvailable(id,context))return null;
 try{const s=JSON.parse(session.get(storageKey(id,context)));return s?.version===1&&s.id===id&&s.context===context&&validateFamily(id,s.data).status==='ready'?s.data:null;}catch{return null;}
}
