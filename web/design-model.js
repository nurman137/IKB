import {field,validateFields,allFinite,gradeAgainst} from './lab-core.js';
import {evaluateTorsion} from './torsion-model.js';
import {evaluateBending} from './bending-model.js';

// Module 10 reuses the torsion (05) and bending (06) models so results stay identical across modules.
// All criteria are training criteria chosen for this exercise, not standards or class rules.
const len=(label,opts={})=>field(label,{mm:1,m:1000},{positive:true,max:1e5,...opts});
const common={
  E_MPa:field('Modulus elastisitas E',{GPa:1000,MPa:1},{positive:true}),
  rho_kg_m3:field('Massa jenis latihan ρ',{'kg/m³':1},{positive:true,max:1e5}),
  Sy_MPa:field('Batas luluh latihan Sᵧ',{MPa:1},{positive:true,max:1e6}),
  n_required:field('Target faktor keamanan n',{'tanpa satuan':1},{positive:true,max:100}),
};
export const shaftDesignFields={
  T_Nmm:field('Torsi T',{'N·m':1000,'N·mm':1,'kN·m':1e6},{max:1e10}),
  d_mm:len('Diameter luar d (sama untuk A dan B)'),
  di_A_mm:field('Diameter dalam alternatif A',{mm:1,m:1000},{max:1e5}),
  di_B_mm:field('Diameter dalam alternatif B',{mm:1,m:1000},{max:1e5}),
  L_mm:len('Panjang poros L',{max:1e7}),
  E_MPa:common.E_MPa,nu:field('Rasio Poisson ν',{'tanpa satuan':1}),rho_kg_m3:common.rho_kg_m3,Sy_MPa:common.Sy_MPa,n_required:common.n_required,
  theta_limit_deg:field('Batas sudut puntir θ',{'°':1},{positive:true,max:360}),
};
export const beamDesignFields={
  P_N:field('Beban titik di tengah P',{kN:1000,N:1},{max:1e8}),
  L_mm:len('Bentang L',{max:1e7}),
  b_A_mm:len('Lebar alternatif A'),h_A_mm:len('Tinggi alternatif A'),
  b_B_mm:len('Lebar alternatif B'),h_B_mm:len('Tinggi alternatif B'),
  E_MPa:common.E_MPa,rho_kg_m3:common.rho_kg_m3,Sy_MPa:common.Sy_MPa,n_required:common.n_required,
  deflection_limit_mm:len('Batas lendutan δ'),
};
const ok=(value,limit,sense)=>value===null?null:sense==='min'?value>=limit*(1-1e-12):value<=limit*(1+1e-12);

function decide(alts){
  // Exercise decision rule (stated in the UI): among alternatives meeting every criterion, prefer the lighter;
  // on equal mass prefer the larger strength margin. The student may argue otherwise.
  const passing=alts.filter(a=>a.allMet);
  if(!passing.length)return {choice:null,rule:'none'};
  const sorted=[...passing].sort((x,y)=>Math.abs(x.mass_kg-y.mass_kg)>1e-9*Math.max(x.mass_kg,y.mass_kg)?x.mass_kg-y.mass_kg:(y.n_yield??0)-(x.n_yield??0));
  const tie=passing.length>1&&Math.abs(passing[0].mass_kg-passing[1].mass_kg)<=1e-9*Math.max(passing[0].mass_kg,passing[1].mass_kg);
  return {choice:sorted[0].key,rule:passing.length===1?'only':tie?'margin':'mass'};
}

export function evaluateShaftDesign(input){
  const d={...input};
  const errors=validateFields(shaftDesignFields,d);
  for(const k of ['di_A_mm','di_B_mm'])if(!errors[k]&&!errors.d_mm&&d[k]>=d.d_mm)errors[k]='Diameter dalam harus ≥ 0 dan lebih kecil dari diameter luar.';
  if(!errors.nu&&d.nu>=.5)errors.nu='Gunakan 0 ≤ ν < 0,5 untuk material latihan isotropik ini.';
  if(!errors.n_required&&d.n_required<=1)errors.n_required='Target faktor keamanan latihan harus lebih besar dari 1.';
  if(Object.keys(errors).length)return {status:'invalid',data:d,errors,result:null};
  const alts=['A','B'].map(key=>{
    const di=d[`di_${key}_mm`],e=evaluateTorsion({mode:'torque',T_Nmm:d.T_Nmm,d_mm:d.d_mm,di_mm:di,L_mm:d.L_mm,E_MPa:d.E_MPa,nu:d.nu,Sy_MPa:d.Sy_MPa});
    if(e.status==='invalid')return null;
    const r=e.result,area=Math.PI*(d.d_mm**2-di**2)/4,mass=d.rho_kg_m3*area*d.L_mm*1e-9;
    const n=r.tauMax_MPa===0?null:d.Sy_MPa/(Math.sqrt(3)*r.tauMax_MPa);
    const strength=n===null?true:ok(n,d.n_required,'min'),stiffness=r.theta_deg===null?null:ok(r.theta_deg,d.theta_limit_deg,'max');
    return {key,di_mm:di,area_mm2:area,J_mm4:r.J_mm4,tauMax_MPa:r.tauMax_MPa,theta_rad:r.theta_rad,theta_deg:r.theta_deg,mass_kg:mass,n_yield:n,
      elastic:e.status==='valid',strength,stiffness,allMet:e.status==='valid'&&strength&&stiffness===true};
  });
  if(alts.includes(null)||!alts.every(a=>allFinite([a.J_mm4,a.tauMax_MPa,a.mass_kg,a.n_yield,a.theta_deg])))return {status:'invalid',data:d,errors:{numeric:'Kombinasi angka terlalu ekstrem.'},result:null};
  const [A,B]=alts;
  return {status:alts.every(a=>a.elastic)?'valid':'outside',data:d,errors:{},reason:alts.every(a=>a.elastic)?'':'Salah satu alternatif mencapai batas domain elastis; sudut puntirnya tidak dihitung.',
    result:{kind:'shaft',alternative_A:A,alternative_B:B,massSaving:A.mass_kg>0?1-B.mass_kg/A.mass_kg:null,stiffnessRatio:B.J_mm4/A.J_mm4,decision:decide(alts)}};
}

export function evaluateBeamDesign(input){
  const d={...input};
  const errors=validateFields(beamDesignFields,d);
  if(!errors.n_required&&d.n_required<=1)errors.n_required='Target faktor keamanan latihan harus lebih besar dari 1.';
  if(Object.keys(errors).length)return {status:'invalid',data:d,errors,result:null};
  const alts=['A','B'].map(key=>{
    const e=evaluateBending({load:'point',P_N:d.P_N,L_mm:d.L_mm,b_mm:d[`b_${key}_mm`],h_mm:d[`h_${key}_mm`],E_MPa:d.E_MPa,Sy_MPa:d.Sy_MPa});
    if(e.status==='invalid')return null;
    const r=e.result,mass=d.rho_kg_m3*r.A_mm2*d.L_mm*1e-9,n=r.sigmaMax_MPa===0?null:d.Sy_MPa/r.sigmaMax_MPa;
    const strength=n===null?true:ok(n,d.n_required,'min'),stiffness=r.deltaMax_mm===null?null:ok(r.deltaMax_mm,d.deflection_limit_mm,'max');
    return {key,b_mm:d[`b_${key}_mm`],h_mm:d[`h_${key}_mm`],A_mm2:r.A_mm2,I_mm4:r.I_mm4,R_N:r.R_N,Mmax_Nmm:r.Mmax_Nmm,sigmaMax_MPa:r.sigmaMax_MPa,deltaMax_mm:r.deltaMax_mm,
      mass_kg:mass,n_yield:n,slenderness:r.slenderness,elastic:e.checks.elastic,slender:e.checks.slender,smallStrain:e.checks.smallStrain,smallDeflection:e.checks.smallDeflection,inDomain:e.status==='valid',strength,stiffness,allMet:e.status==='valid'&&strength&&stiffness===true};
  });
  if(alts.includes(null)||!alts.every(a=>allFinite([a.I_mm4,a.sigmaMax_MPa,a.mass_kg,a.n_yield,a.deltaMax_mm])))return {status:'invalid',data:d,errors:{numeric:'Kombinasi angka terlalu ekstrem.'},result:null};
  const [A,B]=alts,inDomain=alts.every(a=>a.inDomain);
  // Minimum depth for B at its width so that δ meets the limit (I = PL³/(48Eδ) → h = ∛(12I/b)).
  const hMinB=Math.cbrt(12*d.P_N*d.L_mm**3/(48*d.E_MPa*d.deflection_limit_mm)/d.b_B_mm);
  return {status:inDomain?'valid':'outside',data:d,errors:{},reason:inDomain?'':'Salah satu alternatif di luar domain model (luluh, L/h < 10, |σ|/E > 1%, atau |δ|/L > 2%); lendutannya tidak diklaim.',
    result:{kind:'beam',alternative_A:A,alternative_B:B,massSaving:A.mass_kg>0?1-B.mass_kg/A.mass_kg:null,stiffnessRatio:B.I_mm4/A.I_mm4,hMinB_mm:hMinB,decision:decide(alts)}};
}

export const designExercises={
  mesin:{T_Nmm:250000,d_mm:40,di_A_mm:0,di_B_mm:28,L_mm:1000,E_MPa:200000,nu:.3,rho_kg_m3:7850,Sy_MPa:250,n_required:2,theta_limit_deg:2},
  kapal:{P_N:12000,L_mm:3000,b_A_mm:70,h_A_mm:200,b_B_mm:200,h_B_mm:70,E_MPa:200000,rho_kg_m3:7850,Sy_MPa:250,n_required:2,deflection_limit_mm:3},
};
export function designTargets(context){
  if(context==='mesin'){const r=evaluateShaftDesign(designExercises.mesin).result.alternative_B;return {first:r.mass_kg,second:r.theta_deg};}
  const r=evaluateBeamDesign(designExercises.kapal).result;return {first:r.alternative_B.deltaMax_mm,second:r.alternative_A.n_yield};
}
export const gradeDesign=(context,answers)=>gradeAgainst(designTargets(context),answers);
