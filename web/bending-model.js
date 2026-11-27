import {readNumber} from './model.js';

// Canonical units: N, N/mm, mm, MPa. Defaults are teaching assumptions, not data for a specific structure.
const field=(label,units,{positive=false,max=1e7}={})=>({label,units,positive,max});
export const bendingFields={
  P_N:field('Beban titik P',{kN:1000,N:1},{max:1e8}),
  w_N_per_mm:field('Beban merata w',{'kN/m':1,'N/mm':1,'N/m':.001},{max:1e6}),
  L_mm:field('Bentang L',{mm:1,m:1000},{positive:true}),
  b_mm:field('Lebar penampang b',{mm:1,m:1000},{positive:true,max:1e5}),
  h_mm:field('Tinggi penampang h',{mm:1,m:1000},{positive:true,max:1e5}),
  E_MPa:field('Modulus elastisitas E',{GPa:1000,MPa:1},{positive:true}),
  Sy_MPa:field('Batas luluh latihan Sᵧ',{MPa:1},{positive:true,max:1e6}),
};
export const loadCases={point:'Beban titik di tengah',udl:'Beban merata penuh'};
export const inactiveBendingFields=load=>load==='udl'?['P_N']:['w_N_per_mm'];
export const slendernessLimit=10; // Pedagogical Euler–Bernoulli threshold from M0, not a universal rule.

// Explicit uniform-load presets: the M0 dataset only defines a midspan point load for 06.
export const udlPresets={mesin:{w_N_per_mm:5},kapal:{w_N_per_mm:6}};

export function canonicalBending(raw,units){
  const out={load:raw.load};
  for(const [k,f] of Object.entries(bendingFields))out[k]=f.units[units[k]]===undefined?NaN:readNumber(raw[k])*f.units[units[k]];
  return out;
}
export function convertBendingUnit(key,value,from,to){
  const units=bendingFields[key]?.units,n=readNumber(value);
  return units&&units[from]&&units[to]&&Number.isFinite(n)?n*units[from]/units[to]:null;
}

function validate(input){
  const d={...input,load:input.load??'point',Sy_MPa:input.Sy_MPa??250},errors={};
  if(!(d.load in loadCases))errors.load='Pilih beban titik di tengah atau beban merata penuh.';
  const skip=new Set(inactiveBendingFields(d.load));
  for(const [k,f] of Object.entries(bendingFields)){
    if(skip.has(k))continue;
    d[k]=readNumber(d[k]);
    if(!Number.isFinite(d[k]))errors[k]='Masukkan angka yang sah tanpa pemisah ribuan.';
    else if(d[k]<0||(f.positive&&d[k]===0))errors[k]=f.positive?'Nilai harus lebih besar dari nol.':'Gunakan nol atau nilai positif (beban ke bawah).';
    else if(d[k]>f.max)errors[k]='Angka melampaui rentang numerik latihan.';
  }
  return {data:d,errors};
}
const invalid=(data,errors)=>({status:'invalid',data,errors,result:null});

// Internal actions and deflection (downward positive) at x for the active configuration.
export function beamAt(d,I,x){
  const {L_mm:L,E_MPa:E}=d;
  if(d.load==='udl'){
    const w=d.w_N_per_mm;
    return {V:w*(L/2-x),M:w*x*(L-x)/2,v:w*x*(L**3-2*L*x*x+x**3)/(24*E*I)};
  }
  const P=d.P_N,s=Math.min(x,L-x);
  // V is reported for the left side of the cut; at exactly midspan the jump is handled by the caller.
  return {V:x<L/2?P/2:x>L/2?-P/2:P/2,M:P*s/2,v:P*s*(3*L*L-4*s*s)/(48*E*I)};
}

export function evaluateBending(input){
  const {data:d,errors}=validate(input);
  if(Object.keys(errors).length)return invalid(d,errors);
  const {L_mm:L,b_mm:b,h_mm:h,E_MPa:E}=d,udl=d.load==='udl';
  const A=b*h,I=b*h**3/12,c=h/2,Z=I/c;
  const total=udl?d.w_N_per_mm*L:d.P_N;
  const R=total/2,M=udl?d.w_N_per_mm*L*L/8:d.P_N*L/4;
  const sigma=M*c/I,delta=udl?5*d.w_N_per_mm*L**4/(384*E*I):d.P_N*L**3/(48*E*I);
  if(!(I>0)||![A,I,Z,R,M,sigma,delta].every(Number.isFinite))return invalid(d,{numeric:'Kombinasi angka terlalu ekstrem.'});
  const reachedYield=sigma>=d.Sy_MPa*(1-1e-12),stocky=L/h<slendernessLimit;
  const reasons=[];
  if(reachedYield)reasons.push('Tegangan lentur maksimum mencapai atau melampaui batas luluh latihan; model elastis tidak berlaku.');
  if(stocky)reasons.push(`L/h = ${new Intl.NumberFormat('id-ID',{maximumSignificantDigits:4}).format(L/h)} < ${slendernessLimit}: balok terlalu pendek untuk klaim lendutan Euler–Bernoulli; deformasi geser tidak lagi kecil.`);
  const deflectionShown=!reachedYield&&!stocky;
  return {status:reasons.length?'outside':'valid',data:d,errors:{},reason:reasons.join(' '),checks:{elastic:!reachedYield,slender:!stocky},
    result:{load:d.load,A_mm2:A,I_mm4:I,c_mm:c,Z_mm3:Z,total_N:total,R_N:R,Vmax_N:R,Mmax_Nmm:M,sigmaMax_MPa:sigma,sigmaTop_MPa:sigma===0?0:-sigma,sigmaBottom_MPa:sigma,slenderness:L/h,
      deltaMax_mm:deflectionShown?delta:null,spanOverDeflection:deflectionShown&&delta>0?L/delta:null}};
}

// One-at-a-time parameter study at the active load intensity.
export function bendingVariants(e){
  if(e.status==='invalid')return null;
  const d=e.data;
  return [
    ['Aktif',evaluateBending(d)],
    ['h × 2',evaluateBending({...d,h_mm:d.h_mm*2})],
    ['b × 2',evaluateBending({...d,b_mm:d.b_mm*2})],
    [d.load==='udl'?'L × 2 (w tetap)':'L × 2 (P tetap)',evaluateBending({...d,L_mm:d.L_mm*2})],
    ['Putar penampang (b ↔ h)',evaluateBending({...d,b_mm:d.h_mm,h_mm:d.b_mm})],
  ];
}

export const bendingExercises={
  mesin:{load:'point',P_N:12000,w_N_per_mm:0,L_mm:2000,b_mm:80,h_mm:160,E_MPa:200000,Sy_MPa:250},
  kapal:{load:'udl',P_N:0,w_N_per_mm:8,L_mm:4000,b_mm:120,h_mm:240,E_MPa:200000,Sy_MPa:250},
};
export function bendingTargets(context){
  const r=evaluateBending(bendingExercises[context]).result;
  return {first:r.sigmaMax_MPa,second:r.deltaMax_mm};
}
export function gradeBending(context,answers){
  return Object.fromEntries(Object.entries(bendingTargets(context)).map(([k,target])=>{
    const n=readNumber(answers[k]);return [k,{valid:Number.isFinite(n),correct:Number.isFinite(n)&&Math.abs(n-target)<=Math.max(1e-6,.01*Math.abs(target))}];
  }));
}
