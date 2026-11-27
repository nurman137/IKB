import {axisAvailable,axisFields,validateAxis} from './axisymmetric-case.js';
const key=(id,context)=>`ikb-fe-axis-v1-${id}-${context}`;
export function saveAxisTransfer(session,id,context,input){if(!axisAvailable(id,context)||validateAxis(id,input).status!=='ready')return false;const data=Object.fromEntries(Object.keys(axisFields(id)).map(k=>[k,input[k]]));session.set(key(id,context),JSON.stringify({version:1,id,context,data}));return true;}
export function readAxisTransfer(session,id,context){if(!axisAvailable(id,context))return null;try{const x=JSON.parse(session.get(key(id,context)));return x?.version===1&&x.id===id&&x.context===context&&validateAxis(id,x.data).status==='ready'?x.data:null;}catch{return null;}}
