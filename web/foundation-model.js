import {readNumber} from './model.js';
import {evaluateAxial} from './axial-model.js';

const field=(label,units,positive=false,max=1e7)=>({label,units,positive,max});
const length=(label)=>field(label,{mm:1,m:1000},true);
const force=(label)=>field(label,{kN:1000,N:1});
export const foundationFields={
  '01':{P_N:force('Beban titik P'),L_mm:length('Bentang L'),a_mm:field('Posisi beban a',{mm:1,m:1000}),x_mm:field('Posisi potongan x',{mm:1,m:1000})},
  '03':{F_N:force('Gaya tarik F'),d_mm:length('Diameter awal d'),L_mm:length('Panjang awal L₀'),E_MPa:field('Modulus elastisitas E',{GPa:1000,MPa:1},true),nu:field('Rasio Poisson ν',{'tanpa satuan':1}),Sy_MPa:field('Batas luluh latihan Sᵧ',{MPa:1},true)},
  '04':{F_N:force('Gaya sambungan F'),d_mm:length('Diameter pin d'),n_planes:field('Jumlah bidang geser',{'bidang':1}),t_center_mm:length('Tebal pelat tengah / pelat t'),t_each_outer_mm:length('Tebal tiap pelat luar')},
};
export function canonicalFoundation(id,raw,units){
  return Object.fromEntries(Object.entries(foundationFields[id]).map(([k,f])=>[k,f.units[units[k]]===undefined?NaN:readNumber(raw[k])*f.units[units[k]]]));
}
export function convertFoundationUnit(id,key,value,from,to){
  const units=foundationFields[id]?.[key]?.units,n=readNumber(value);
  return units&&units[from]&&units[to]&&Number.isFinite(n)?n*units[from]/units[to]:null;
}
function validate(id,input){
  const d={...input},errors={};
  if(id==='01')d.x_mm??=d.L_mm/2;
  if(id==='03')d.Sy_MPa??=250;
  for(const [k,f] of Object.entries(foundationFields[id])){
    if(id==='04'&&k==='t_each_outer_mm'&&readNumber(d.n_planes)===1)continue;
    d[k]=readNumber(d[k]);
    if(!Number.isFinite(d[k]))errors[k]='Masukkan angka yang sah tanpa pemisah ribuan.';
    else if(d[k]<0||(f.positive&&d[k]===0))errors[k]=f.positive?'Nilai harus lebih besar dari nol.':'Gunakan nol atau nilai positif.';
    else if(d[k]>f.max)errors[k]='Angka melampaui rentang numerik latihan.';
  }
  if(id==='01')for(const k of ['a_mm','x_mm'])if(d[k]>d.L_mm)errors[k]='Posisi harus berada antara 0 dan L.';
  if(id==='03'&&(d.nu<0||d.nu>=.5))errors.nu='Gunakan 0 ≤ ν < 0,5 untuk material latihan isotropik ini.';
  if(id==='04'&&![1,2].includes(d.n_planes))errors.n_planes='Pilih satu atau dua bidang geser.';
  return {data:d,errors};
}
const invalid=(data,errors)=>({status:'invalid',data,errors,result:null});

export function evaluateBeam(input){
  const {data:d,errors}=validate('01',input);
  if(Object.keys(errors).length)return invalid(d,errors);
  const {P_N:P,L_mm:L,a_mm:a,x_mm:x}=d;
  const RB=P*a/L,RA=P-RB,Mpeak=RA*a;
  const atLoad=Math.abs(x-a)<=8*Number.EPSILON*Math.max(L,Math.abs(x),Math.abs(a));
  let Vleft=RA-(x>a&&!atLoad?P:0),Vright=RA-(x>a||atLoad?P:0);
  if(x===0)Vleft=0;
  if(x===L)Vright=0;
  const location=atLoad?a:x;
  const M=x===0||x===L?0:RA*location-P*Math.max(0,location-a);
  const result={RA_N:RA,RB_N:RB,M_at_load_Nmm:Mpeak,N_at_x_N:0,V_left_N:Vleft,V_right_N:Vright,M_at_x_Nmm:M,at_load:atLoad};
  if(!Object.values(result).every(v=>typeof v==='boolean'||Number.isFinite(v)))return invalid(d,{numeric:'Kombinasi angka terlalu ekstrem.'});
  return {status:'valid',data:d,errors:{},result};
}

export function evaluateHooke(input){
  const {data:d,errors}=validate('03',input);
  if(Object.keys(errors).length)return invalid(d,errors);
  const axial=evaluateAxial(d);
  if(axial.status==='invalid')return axial;
  const {result:a}=axial;
  const k=a.A_mm2*d.E_MPa/d.L_mm,G=d.E_MPa/(2*(1+d.nu));
  const lateral=a.epsilon===null?null:(-d.nu*a.epsilon||0);
  const result={...a,k_N_per_mm:k,G_MPa:G,epsilon_lateral:lateral,delta_d_mm:lateral===null?null:(lateral*d.d_mm||0),U_Nmm:a.delta_mm===null?null:d.F_N*a.delta_mm/2,U_J:a.delta_mm===null?null:d.F_N*a.delta_mm/2000};
  const compare=evaluateAxial({...d,E_MPa:70000});
  const kB=a.A_mm2*70000/d.L_mm;
  if(!Number.isFinite(kB))return invalid(d,{numeric:'Kombinasi angka pembanding terlalu ekstrem.'});
  result.delta_if_E70000_mm=compare.result?.delta_mm??null;
  if(!Object.values(result).every(v=>v===null||Number.isFinite(v)))return invalid(d,{numeric:'Kombinasi angka terlalu ekstrem.'});
  return {status:axial.status,data:d,errors:{},reason:axial.reason,result,comparison:compare,comparisonData:{status:compare.status,k_N_per_mm:kB,sigma_MPa:compare.result?.sigma_MPa??null,delta_mm:compare.result?.delta_mm??null,U_J:compare.status==='valid'?d.F_N*compare.result.delta_mm/2000:null}};
}

export function evaluatePin(input){
  const {data:d,errors}=validate('04',input);
  if(Object.keys(errors).length)return invalid(d,errors);
  const A=Math.PI*d.d_mm**2/4;
  const r={A_pin_mm2:A,force_per_plane_N:d.F_N/d.n_planes,tau_avg_MPa:d.F_N/(d.n_planes*A),bearing_center_MPa:d.F_N/(d.t_center_mm*d.d_mm),bearing_each_outer_MPa:d.n_planes===2?d.F_N/(2*d.t_each_outer_mm*d.d_mm):null};
  if(A<=0||!Object.values(r).every(v=>v===null||Number.isFinite(v)))return invalid(d,{numeric:'Kombinasi angka terlalu ekstrem.'});
  return {status:'valid',data:d,errors:{},result:r};
}
export function evaluateFoundation(id,input){return id==='01'?evaluateBeam(input):id==='03'?evaluateHooke(input):evaluatePin(input);}

export const foundationExercises={
  '01':{mesin:{P_N:12000,L_mm:1600,a_mm:400,x_mm:800},kapal:{P_N:18000,L_mm:2400,a_mm:1600,x_mm:1200}},
  '03':{mesin:{F_N:8000,d_mm:16,L_mm:400,E_MPa:200000,nu:.3,Sy_MPa:250},kapal:{F_N:12000,d_mm:20,L_mm:800,E_MPa:200000,nu:.3,Sy_MPa:250}},
  '04':{mesin:{F_N:9000,d_mm:10,n_planes:1,t_center_mm:6,t_each_outer_mm:6},kapal:{F_N:30000,d_mm:16,n_planes:2,t_center_mm:10,t_each_outer_mm:8}},
};
export function exerciseTargets(id,context){
  const r=evaluateFoundation(id,foundationExercises[id][context]).result;
  return id==='01'?{first:r.RA_N/1000,second:r.RB_N/1000}:id==='03'?{first:r.delta_mm,second:r.U_J}:{first:r.tau_avg_MPa,second:r.bearing_center_MPa};
}
export function gradeFoundation(id,context,answers){
  return Object.fromEntries(Object.entries(exerciseTargets(id,context)).map(([k,target])=>{
    const n=readNumber(answers[k]);return [k,{valid:Number.isFinite(n),correct:Number.isFinite(n)&&Math.abs(n-target)<=Math.max(1e-6,.01*Math.abs(target))}];
  }));
}
