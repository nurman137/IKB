import {combFields,validateComb} from './combined-case.js';
const key=context=>`ikb-fe-comb-v1-${context}`;
export function saveCombTransfer(session,context,input){if(!['mesin','kapal'].includes(context)||validateComb(input).status!=='ready')return false;const data=Object.fromEntries(Object.keys(combFields).map(k=>[k,input[k]]));session.set(key(context),JSON.stringify({version:1,context,data}));return true;}
export function readCombTransfer(session,context){if(!['mesin','kapal'].includes(context))return null;try{const s=JSON.parse(session.get(key(context)));return s?.version===1&&s.context===context&&validateComb(s.data).status==='ready'?Object.fromEntries(Object.keys(combFields).map(k=>[k,s.data[k]])):null;}catch{return null;}}
