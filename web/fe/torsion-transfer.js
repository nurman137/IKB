import {torAvailable,torFields,validateTor} from './torsion-case.js';
const key=(id,context)=>`ikb-fe-tor-v1-${id}-${context}`;
export function saveTorTransfer(session,id,context,input){if(!torAvailable(id,context)||validateTor(id,input).status!=='ready')return false;const keys=[...Object.keys(torFields(id)),'direction',...id==='05'?['mode']:[]],data=Object.fromEntries(keys.filter(k=>input[k]!==undefined).map(k=>[k,input[k]]));session.set(key(id,context),JSON.stringify({version:1,id,context,data}));return true;}
export function readTorTransfer(session,id,context){if(!torAvailable(id,context))return null;try{const s=JSON.parse(session.get(key(id,context)));return s?.version===1&&s.id===id&&s.context===context&&validateTor(id,s.data).status==='ready'?s.data:null;}catch{return null;}}
