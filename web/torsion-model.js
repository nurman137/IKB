import {readNumber} from './model.js';

// Canonical units: N·mm, W, rpm, mm, MPa. Defaults are teaching assumptions, not certified shaft data.
const field=(label,units,{positive=false,max=1e7}={})=>({label,units,positive,max});
export const torsionFields={
  T_Nmm:field('Torsi T',{'N·m':1000,'N·mm':1,'kN·m':1e6},{max:1e10}),
  P_W:field('Daya P',{kW:1000,W:1},{max:1e9}),
  n_rpm:field('Putaran n',{rpm:1},{positive:true,max:1e6}),
  d_mm:field('Diameter luar d',{mm:1,m:1000},{positive:true,max:1e5}),
  di_mm:field('Diameter dalam dᵢ',{mm:1,m:1000},{max:1e5}),
  L_mm:field('Panjang poros L',{mm:1,m:1000},{positive:true}),
  E_MPa:field('Modulus elastisitas E',{GPa:1000,MPa:1},{positive:true}),
  nu:field('Rasio Poisson ν',{'tanpa satuan':1}),
  Sy_MPa:field('Batas luluh latihan Sᵧ',{MPa:1},{positive:true,max:1e6}),
};
export const torsionModes={torque:'Torsi langsung',power:'Daya dan putaran'};
const modeFields={torque:['T_Nmm'],power:['P_W','n_rpm']};
export const inactiveFields=mode=>mode==='power'?modeFields.torque:modeFields.power;
export const shearStrainLimit=0.01; // Same pedagogical small-strain cutoff as M2; not a material limit.

// Explicit power–rpm presets: the M0 dataset only defines direct torque for 05.
export const powerPresets={mesin:{P_W:30000,n_rpm:1450},kapal:{P_W:90000,n_rpm:600}};

export function canonicalTorsion(raw,units){
  const out={mode:raw.mode};
  for(const [k,f] of Object.entries(torsionFields))out[k]=f.units[units[k]]===undefined?NaN:readNumber(raw[k])*f.units[units[k]];
  return out;
}
export function convertTorsionUnit(key,value,from,to){
  const units=torsionFields[key]?.units,n=readNumber(value);
  return units&&units[from]&&units[to]&&Number.isFinite(n)?n*units[from]/units[to]:null;
}

function validate(input){
  const d={...input,mode:input.mode??'torque',Sy_MPa:input.Sy_MPa??250},errors={};
  if(!(d.mode in torsionModes))errors.mode='Pilih torsi langsung atau daya dan putaran.';
  const skip=new Set(inactiveFields(d.mode));
  for(const [k,f] of Object.entries(torsionFields)){
    if(skip.has(k))continue;
    d[k]=readNumber(d[k]);
    if(!Number.isFinite(d[k]))errors[k]='Masukkan angka yang sah tanpa pemisah ribuan.';
    else if(d[k]<0||(f.positive&&d[k]===0))errors[k]=f.positive?'Nilai harus lebih besar dari nol.':'Gunakan nol atau nilai positif.';
    else if(d[k]>f.max)errors[k]='Angka melampaui rentang numerik latihan.';
  }
  if(!errors.di_mm&&!errors.d_mm&&d.di_mm>=d.d_mm)errors.di_mm='Diameter dalam harus ≥ 0 dan lebih kecil dari diameter luar.';
  if(!errors.nu&&d.nu>=.5)errors.nu='Gunakan 0 ≤ ν < 0,5 untuk material latihan isotropik ini.';
  return {data:d,errors};
}
const invalid=(data,errors)=>({status:'invalid',data,errors,result:null});

export function evaluateTorsion(input){
  const {data:d,errors}=validate(input);
  if(Object.keys(errors).length)return invalid(d,errors);
  const power=d.mode==='power';
  const omega=power?2*Math.PI*d.n_rpm/60:null;
  const T=power?d.P_W/omega*1000:d.T_Nmm;
  const c=d.d_mm/2,G=d.E_MPa/(2*(1+d.nu));
  const J=Math.PI*(d.d_mm**4-d.di_mm**4)/32;
  const tauMax=T*c/J,tauInner=T*(d.di_mm/2)/J,gamma=tauMax/G,theta=T*d.L_mm/(G*J);
  const base={mode:d.mode,omega_rad_s:omega,T_Nmm:T,T_Nm:T/1000,G_MPa:G,J_mm4:J,Zp_mm3:J/c,tauMax_MPa:tauMax,tauInner_MPa:tauInner,tauYieldShear_MPa:d.Sy_MPa/Math.sqrt(3)};
  if(!(J>0)||![T,G,tauMax,tauInner,gamma,theta].every(Number.isFinite))return invalid(d,{numeric:'Kombinasi angka terlalu ekstrem.'});
  // Pure shear: von Mises equivalent = √3·τ. Used only as an elastic-domain boundary, never as a safety verdict.
  const reachedYield=Math.sqrt(3)*tauMax>=d.Sy_MPa*(1-1e-12),largeStrain=gamma>shearStrainLimit;
  const outside=reachedYield||largeStrain;
  const deformation=outside?{gammaMax:null,theta_rad:null,theta_deg:null,theta_deg_per_m:null}:{gammaMax:gamma,theta_rad:theta,theta_deg:theta*180/Math.PI,theta_deg_per_m:theta*180/Math.PI/(d.L_mm/1000)};
  return {status:outside?'outside':'valid',data:d,errors:{},reason:reachedYield?'Tegangan ekuivalen murni geser √3·τmax mencapai atau melampaui batas luluh latihan.':largeStrain?'Regangan geser permukaan melewati batas regangan kecil latihan (1%).':'',result:{...base,...deformation}};
}

// Parameter studies always hold the active torque fixed, so P/rpm doubling semantics never leak in.
export function torsionVariants(e){
  if(e.status==='invalid')return null;
  const d={...e.data,mode:'torque',T_Nmm:e.result.T_Nmm};
  return [
    ['Aktif',evaluateTorsion(d)],
    ['L × 2',evaluateTorsion({...d,L_mm:d.L_mm*2})],
    ['T × 2',evaluateTorsion({...d,T_Nmm:d.T_Nmm*2})],
    ['d dan dᵢ × 2',evaluateTorsion({...d,d_mm:d.d_mm*2,di_mm:d.di_mm*2})],
  ];
}

export const torsionExercises={
  mesin:{mode:'power',P_W:7500,n_rpm:1450,T_Nmm:0,d_mm:25,di_mm:0,L_mm:500,E_MPa:200000,nu:.3,Sy_MPa:250},
  kapal:{mode:'torque',T_Nmm:2500000,P_W:0,n_rpm:600,d_mm:80,di_mm:50,L_mm:3000,E_MPa:200000,nu:.3,Sy_MPa:250},
};
export function torsionTargets(context){
  const r=evaluateTorsion(torsionExercises[context]).result;
  return {first:r.tauMax_MPa,second:r.theta_deg};
}
export function gradeTorsion(context,answers){
  return Object.fromEntries(Object.entries(torsionTargets(context)).map(([k,target])=>{
    const n=readNumber(answers[k]);return [k,{valid:Number.isFinite(n),correct:Number.isFinite(n)&&Math.abs(n-target)<=Math.max(1e-6,.01*Math.abs(target))}];
  }));
}
