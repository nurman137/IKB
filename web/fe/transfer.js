import {validateBendingFE} from './bending-case.js';
const fields=['load','P_N','w_N_per_mm','L_mm','b_mm','h_mm','E_MPa','Sy_MPa'];
export function saveBendingTransfer(session,context,input){
 if(!['mesin','kapal'].includes(context)||validateBendingFE(input).status==='invalid_input')return false;
 const data=Object.fromEntries(fields.filter(k=>input[k]!==undefined).map(k=>[k,input[k]]));
 session.set(`ikb-fe-transfer-06-${context}`,JSON.stringify({version:1,module:'06',context,data}));return true;
}
export function readBendingTransfer(session,context){
 try{const s=JSON.parse(session.get(`ikb-fe-transfer-06-${context}`));if(s?.version!==1||s.module!=='06'||s.context!==context||validateBendingFE(s.data).status==='invalid_input')return null;return Object.fromEntries(fields.filter(k=>s.data[k]!==undefined).map(k=>[k,s.data[k]]));}catch{return null;}
}
