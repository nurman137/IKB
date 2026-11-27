import {readNumber} from './model.js';

// Shared helpers for the configurable M4/M5 learning labs. Canonical units are N, mm, MPa unless a field says otherwise.
export const field=(label,units,{positive=false,signed=false,max=1e7,canonical=''}={})=>({label,units,positive,signed,max,canonical});

export function canonicalFrom(fields,raw,units,modeKey){
  const out=modeKey?{[modeKey]:raw[modeKey]}:{};
  for(const [k,f] of Object.entries(fields))out[k]=f.units[units[k]]===undefined?NaN:readNumber(raw[k])*f.units[units[k]];
  return out;
}
export function convertFrom(fields,key,value,from,to){
  const units=fields[key]?.units,n=readNumber(value);
  return units&&units[from]&&units[to]&&Number.isFinite(n)?n*units[from]/units[to]:null;
}
// Validates active fields in place; skipped (inactive-mode) fields are left untouched and never block a result.
export function validateFields(fields,d,skip=new Set()){
  const errors={};
  for(const [k,f] of Object.entries(fields)){
    if(skip.has(k))continue;
    d[k]=readNumber(d[k]);
    if(!Number.isFinite(d[k]))errors[k]='Masukkan angka yang sah tanpa pemisah ribuan.';
    else if(!f.signed&&(d[k]<0||(f.positive&&d[k]===0)))errors[k]=f.positive?'Nilai harus lebih besar dari nol.':'Gunakan nol atau nilai positif.';
    else if(Math.abs(d[k])>f.max)errors[k]='Angka melampaui rentang numerik latihan.';
  }
  return errors;
}
export const allFinite=values=>values.every(v=>v===null||Number.isFinite(v));
export function gradeAgainst(targets,answers){
  return Object.fromEntries(Object.entries(targets).map(([k,target])=>{
    const n=readNumber(answers[k]);return [k,{valid:Number.isFinite(n),correct:Number.isFinite(n)&&Math.abs(n-target)<=Math.max(1e-6,.01*Math.abs(target))}];
  }));
}
export const fmt=(n,d=7)=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:d}).format(n);
