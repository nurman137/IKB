import {field,validateFields,allFinite,gradeAgainst} from './lab-core.js';

// Canonical units: mm, °C, MPa, 1/°C. Straight pipe, no internal pressure; teaching assumptions only.
export const thermalFields={
  d_mm:field('Diameter luar d',{mm:1,m:1000},{positive:true,max:1e5}),
  di_mm:field('Diameter dalam dᵢ',{mm:1,m:1000},{max:1e5}),
  L_mm:field('Panjang pipa L',{mm:1,m:1000},{positive:true}),
  deltaT_C:field('Perubahan temperatur ΔT',{'°C':1},{signed:true,max:2000}),
  E_MPa:field('Modulus elastisitas E',{GPa:1000,MPa:1},{positive:true}),
  alpha_per_C:field('Koefisien muai α',{'×10⁻⁶/°C':1e-6,'/°C':1},{positive:true,max:1e-3}),
  Sy_MPa:field('Batas luluh latihan Sᵧ',{MPa:1},{positive:true,max:1e6}),
};
export const supports={free:'Bebas memuai (satu ujung bebas)',fixed:'Terkekang penuh (kedua ujung ditahan)'};
export const aluminium={E_MPa:70000,alpha_per_C:23e-6}; // Teaching values for a material comparison, not a specification.

export function evaluateThermal(input){
  const d={...input,support:input.support??'fixed',Sy_MPa:input.Sy_MPa??250};
  if(!(d.support in supports))return {status:'invalid',data:d,errors:{support:'Pilih kondisi tumpuan.'},result:null};
  const errors=validateFields(thermalFields,d);
  if(!errors.di_mm&&!errors.d_mm&&d.di_mm>=d.d_mm)errors.di_mm='Diameter dalam harus ≥ 0 dan lebih kecil dari diameter luar.';
  if(Object.keys(errors).length)return {status:'invalid',data:d,errors,result:null};
  const A=Math.PI*(d.d_mm**2-d.di_mm**2)/4,strain=d.alpha_per_C*d.deltaT_C;
  const deltaFree=strain*d.L_mm;
  // Full restraint keeps total strain zero: mechanical strain = −αΔT, so σ = −EαΔT (heating → compression).
  const sigmaFixed=strain===0?0:-d.E_MPa*strain,R=Math.abs(sigmaFixed)*A;
  if(!(A>0)||!allFinite([A,strain,deltaFree,sigmaFixed,R]))return {status:'invalid',data:d,errors:{numeric:'Kombinasi angka terlalu ekstrem.'},result:null};
  const fixedElastic=Math.abs(sigmaFixed)<d.Sy_MPa*(1-1e-12);
  const fixed=d.support==='fixed',outside=fixed&&!fixedElastic;
  return {status:outside?'outside':'valid',data:d,errors:{},fixedElastic,
    reason:outside?'|σ| terkekang mencapai atau melampaui Sᵧ latihan; hubungan elastis σ = −EαΔT tidak lagi berlaku.':'',
    result:{support:d.support,A_mm2:A,thermal_strain:strain,delta_free_mm:deltaFree,sigma_free_MPa:0,delta_fully_fixed_mm:0,
      sigma_fully_fixed_MPa:sigmaFixed,reactionMagnitude_N:R,
      // The pipe pushes on the supports when heated (compression) and pulls when cooled (tension).
      reactionSense:sigmaFixed<0?'push':sigmaFixed>0?'pull':'none',
      sigma_active_MPa:fixed?(fixedElastic?sigmaFixed:null):0,delta_active_mm:fixed?0:deltaFree,reaction_active_N:fixed?(fixedElastic?R:null):0}};
}

export function thermalVariants(e){
  if(e.status==='invalid')return null;
  const d=e.data,t=(d.d_mm-d.di_mm)/2;
  return [
    ['Aktif',e],
    ['ΔT × 2',evaluateThermal({...d,deltaT_C:d.deltaT_C*2})],
    ['ΔT berbalik tanda',evaluateThermal({...d,deltaT_C:-d.deltaT_C})],
    ['L × 2',evaluateThermal({...d,L_mm:d.L_mm*2})],
    ['Dinding 2× lebih tebal',evaluateThermal({...d,di_mm:Math.max(0,d.d_mm-4*t)})],
    ['Aluminium latihan (E 70 GPa, α 23×10⁻⁶)',evaluateThermal({...d,...aluminium})],
  ];
}

export const thermalExercises={
  mesin:{support:'fixed',d_mm:50,di_mm:42,L_mm:2500,deltaT_C:60,E_MPa:200000,alpha_per_C:12e-6,Sy_MPa:250},
  kapal:{support:'fixed',d_mm:89,di_mm:77,L_mm:4000,deltaT_C:-30,E_MPa:200000,alpha_per_C:12e-6,Sy_MPa:250},
};
export function thermalTargets(context){
  const r=evaluateThermal(thermalExercises[context]).result;
  return context==='mesin'?{first:r.delta_free_mm,second:r.sigma_fully_fixed_MPa}:{first:r.sigma_fully_fixed_MPa,second:r.reactionMagnitude_N/1000};
}
export const gradeThermal=(context,answers)=>gradeAgainst(thermalTargets(context),answers);
