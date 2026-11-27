import {readNumber} from './model.js';

// Canonical units: N, mm, MPa. These are teaching presets, not certified material data.
export const axialFields = {
  F_N: {label:'Gaya tarik F',units:{N:1,kN:1000},min:0,max:1e7},
  d_mm: {label:'Diameter batang d',units:{mm:1,m:1000},min:0,max:1e5,positive:true},
  L_mm: {label:'Panjang awal L₀',units:{mm:1,m:1000},min:0,max:1e7,positive:true},
  E_MPa: {label:'Modulus elastisitas E',units:{MPa:1,GPa:1000},min:0,max:1e7,positive:true},
  Sy_MPa: {label:'Batas luluh latihan Sᵧ',units:{MPa:1},min:0,max:1e6,positive:true},
};
export const defaultUnits={F_N:'kN',d_mm:'mm',L_mm:'mm',E_MPa:'GPa',Sy_MPa:'MPa'};
export const strainLimit=0.01; // Explicit pedagogical small-strain cutoff, not a universal material limit.

export function toCanonical(raw,units=defaultUnits){
  return Object.fromEntries(Object.entries(axialFields).map(([key,f])=>{
    const scale=f.units[units[key]];
    return [key,scale===undefined?NaN:readNumber(raw[key])*scale];
  }));
}
export function convertUnit(value,key,from,to){
  const n=readNumber(value),field=axialFields[key];
  if(!field||!Number.isFinite(n)||!field.units[from]||!field.units[to])return null;
  return n*field.units[from]/field.units[to];
}
export function evaluateAxial(input){
  const data={...input,Sy_MPa:input.Sy_MPa??250};
  const errors={};
  for(const [key,field] of Object.entries(axialFields)){
    const n=readNumber(data[key]);data[key]=n;
    if(!Number.isFinite(n))errors[key]='Masukkan angka yang sah, tanpa pemisah ribuan.';
    else if(n<field.min||(field.positive&&n===0))errors[key]=field.positive?'Nilai harus lebih besar dari nol.':'Gunakan nol atau nilai positif untuk gaya tarik.';
    else if(n>field.max)errors[key]='Nilai melampaui rentang numerik latihan. Lihat batas input.';
  }
  if(Object.keys(errors).length)return {status:'invalid',errors,data,result:null};
  const {F_N:F,d_mm:d,L_mm:L,E_MPa:E,Sy_MPa:Sy}=data;
  const A=Math.PI*d*d/4,sigma=F/A,epsilon=sigma/E,delta=epsilon*L;
  if(A<=0||![A,sigma,epsilon,delta,L+delta].every(Number.isFinite)){
    return {status:'invalid',errors:{numeric:'Kombinasi angka terlalu ekstrem untuk dihitung. Gunakan skala latihan yang wajar.'},data,result:null};
  }
  // A relative roundoff guard keeps an exactly-at-yield input outside the elastic domain.
  const reachedYield=sigma>=Sy*(1-1e-12);
  const outside=reachedYield||epsilon>strainLimit;
  return {
    status:outside?'outside':'valid',errors:{},data,
    reason:reachedYield?'Tegangan nominal mencapai atau melampaui batas luluh latihan.':epsilon>strainLimit?'Regangan melewati batas regangan kecil latihan (1%).':'',
    result:{A_mm2:A,sigma_MPa:sigma,epsilon:outside?null:epsilon,epsilon_percent:outside?null:epsilon*100,delta_mm:outside?null:delta,final_length_mm:outside?null:L+delta},
  };
}

export const exercises={
  mesin:{F_N:15000,d_mm:16,L_mm:400,E_MPa:200000,Sy_MPa:250},
  kapal:{F_N:25000,d_mm:20,L_mm:1500,E_MPa:200000,Sy_MPa:250},
};
export function gradeExercise(context,answer){
  const r=evaluateAxial(exercises[context]);
  if(r.status!=='valid')throw new Error('Invalid exercise');
  const expected={sigma:r.result.sigma_MPa,delta:r.result.delta_mm};
  return Object.fromEntries(Object.entries(expected).map(([key,value])=>{
    const n=readNumber(answer[key]);
    return [key,{correct:Number.isFinite(n)&&Math.abs(n-value)<=Math.max(1e-6,0.01*Math.abs(value)),valid:Number.isFinite(n),expected:value}];
  }));
}
export function prediction(context,choice){
  const correct=context==='mesin'?'quarter':'double-length';
  return {correct:choice===correct,explanation:context==='mesin'?'A = πd²/4. Diameter dua kali lipat memberi luas empat kali lipat; pada F, L₀ dan E tetap, tegangan dan pertambahan panjang menjadi seperempat.':'Pada F, d dan E tetap, σ = F/A tidak berubah. Karena δ = FL₀/(AE), panjang awal dua kali lipat memberi pertambahan panjang dua kali lipat.'};
}
