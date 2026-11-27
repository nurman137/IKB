import {field,validateFields,allFinite,gradeAgainst} from './lab-core.js';

// Canonical units: N, N·mm, mm, MPa. Solid round shaft, surface plane stress, ductile teaching material.
export const combinedFields={
  F_N:field('Gaya aksial F (tarik +, tekan −)',{kN:1000,N:1},{signed:true,max:1e8}),
  M_Nmm:field('Momen lentur M',{'N·m':1000,'N·mm':1,'kN·m':1e6},{max:1e10}),
  T_Nmm:field('Torsi T',{'N·m':1000,'N·mm':1,'kN·m':1e6},{max:1e10}),
  d_mm:field('Diameter poros d',{mm:1,m:1000},{positive:true,max:1e5}),
  Sy_MPa:field('Batas luluh latihan Sᵧ',{MPa:1},{positive:true,max:1e6}),
  n_required:field('Target faktor keamanan n',{'tanpa satuan':1},{positive:true,max:100}),
};

const vonMises=(s,t)=>Math.sqrt(s*s+3*t*t);
const principal=(s,t)=>{const r=Math.hypot(s/2,t);return [s/2+r,s/2-r];};

export function evaluateCombined(input){
  const d={...input,Sy_MPa:input.Sy_MPa??250,n_required:input.n_required??2};
  const errors=validateFields(combinedFields,d);
  if(!errors.n_required&&d.n_required<=1)errors.n_required='Target faktor keamanan latihan harus lebih besar dari 1.';
  if(Object.keys(errors).length)return {status:'invalid',data:d,errors,result:null};
  const c=d.d_mm/2,A=Math.PI*d.d_mm**2/4,I=Math.PI*d.d_mm**4/64,J=2*I;
  const sAx=d.F_N/A,sB=d.M_Nmm*c/I,tau=d.T_Nmm*c/J;
  // A = top surface (bending tension for positive M), B = bottom surface. Both lie on the surface, so τ from torsion is the same.
  const sigmaA=sAx+sB,sigmaB=sAx-sB,vmA=vonMises(sigmaA,tau),vmB=vonMises(sigmaB,tau),vmMax=Math.max(vmA,vmB);
  const n=vmMax===0?null:d.Sy_MPa/vmMax;
  const result={A_mm2:A,I_mm4:I,J_mm4:J,sigma_axial_MPa:sAx,sigma_bending_MPa:sB,sigma_edge_A_MPa:sigmaA,sigma_edge_B_MPa:sigmaB,tau_surface_MPa:tau,
    vm_A_MPa:vmA,vm_B_MPa:vmB,sigma_vm_max_MPa:vmMax,critical:vmMax===0?'none':Math.abs(vmA-vmB)<=1e-12*vmMax?'both':vmA>vmB?'A':'B',
    principal_A_MPa:principal(sigmaA,tau),principal_B_MPa:principal(sigmaB,tau),n_yield:n,allowable_MPa:d.Sy_MPa/d.n_required};
  if(!allFinite([A,I,sAx,sB,tau,vmMax,n])||!(A>0))return {status:'invalid',data:d,errors:{numeric:'Kombinasi angka terlalu ekstrem.'},result:null};
  const yielded=n!==null&&n<=1+1e-12,meets=n===null||n>=d.n_required*(1-1e-12);
  return {status:yielded?'outside':'valid',data:d,errors:{},checks:{meets,yielded,compression:d.F_N<0},
    reason:yielded?'Tegangan ekuivalen von Mises mencapai atau melampaui Sᵧ latihan; model elastis tidak berlaku dan n ≤ 1.':'',result};
}

export function combinedVariants(e){
  if(e.status==='invalid')return null;
  const d=e.data;
  return [['Aktif',e],['Tanpa torsi (T = 0)',evaluateCombined({...d,T_Nmm:0})],['Tanpa lentur (M = 0)',evaluateCombined({...d,M_Nmm:0})],['Tanpa gaya aksial (F = 0)',evaluateCombined({...d,F_N:0})],['Diameter × 1,2',evaluateCombined({...d,d_mm:d.d_mm*1.2})]];
}

export const combinedExercises={
  mesin:{F_N:0,M_Nmm:450000,T_Nmm:300000,d_mm:45,Sy_MPa:250,n_required:2},
  kapal:{F_N:-80000,M_Nmm:200000,T_Nmm:3000000,d_mm:80,Sy_MPa:250,n_required:2},
};
export function combinedTargets(context){
  const r=evaluateCombined(combinedExercises[context]).result;
  return {first:r.sigma_vm_max_MPa,second:r.n_yield};
}
export const gradeCombined=(context,answers)=>gradeAgainst(combinedTargets(context),answers);
