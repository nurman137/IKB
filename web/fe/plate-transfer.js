import {plateFields,validatePlate} from './plate-case.js';
const key=c=>`ikb-fe-plate-v1-${c}`;
export function savePlateTransfer(s,c,p){if(!['mesin','kapal'].includes(c)||validatePlate(p).status!=='ready')return false;s.set(key(c),JSON.stringify({version:1,context:c,data:Object.fromEntries(Object.keys(plateFields).map(k=>[k,p[k]]))}));return true;}
export function readPlateTransfer(s,c){try{const x=JSON.parse(s.get(key(c)));return x?.version===1&&x.context===c&&validatePlate(x.data).status==='ready'?x.data:null;}catch{return null;}}
