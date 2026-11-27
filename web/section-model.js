import {field,validateFields,allFinite,gradeAgainst} from './lab-core.js';

// Canonical units: N, mm, MPa. Ideal sharp-cornered profiles (no fillets); teaching assumptions only.
const len=(label,opts={})=>field(label,{mm:1,m:1000},{positive:true,max:1e5,...opts});
export const sectionFields={
  P_N:field('Beban titik di tengah P',{kN:1000,N:1},{max:1e8}),
  L_mm:len('Bentang L',{max:1e7}),
  b_mm:len('Lebar persegi panjang b'),
  h_mm:len('Tinggi total h'),
  d_mm:len('Diameter luar d'),
  di_mm:field('Diameter dalam dᵢ',{mm:1,m:1000},{max:1e5}),
  bf_mm:len('Lebar flens b_f'),
  tf_mm:len('Tebal flens t_f'),
  tw_mm:len('Tebal badan t_w'),
  E_MPa:field('Modulus elastisitas E',{GPa:1000,MPa:1},{positive:true}),
  Sy_MPa:field('Batas luluh latihan Sᵧ',{MPa:1},{positive:true,max:1e6}),
};
export const shapes={rect:'Persegi panjang',I:'Profil I simetris',T:'Profil T (flens di atas)',pipe:'Pipa bulat'};
const shapeFields={rect:['b_mm','h_mm'],pipe:['d_mm','di_mm'],I:['bf_mm','tf_mm','h_mm','tw_mm'],T:['bf_mm','tf_mm','h_mm','tw_mm']};
const geometric=['b_mm','h_mm','d_mm','di_mm','bf_mm','tf_mm','tw_mm'];
export const inactiveSectionFields=shape=>geometric.filter(k=>!(shapeFields[shape]||[]).includes(k));
export const slendernessLimit=10;

// Explicit profile presets per context: the M0 dataset only defines the rectangle orientation pair for 07.
export const profilePresets={
  mesin:{d_mm:60,di_mm:50,bf_mm:50,tf_mm:6,tw_mm:5},
  kapal:{d_mm:114,di_mm:100,bf_mm:100,tf_mm:10,tw_mm:8},
};

// Properties about the horizontal centroidal axis. "strong" = as drawn; "weak" = rotated 90° about the beam axis.
export function sectionProperties(shape,d,orientation='strong'){
  if(shape==='rect'){
    const [b,h]=orientation==='strong'?[d.b_mm,d.h_mm]:[d.h_mm,d.b_mm];
    return {A:b*h,I:b*h**3/12,yc:h/2,depth:h,width:b};
  }
  if(shape==='pipe'){
    return {A:Math.PI*(d.d_mm**2-d.di_mm**2)/4,I:Math.PI*(d.d_mm**4-d.di_mm**4)/64,yc:d.d_mm/2,depth:d.d_mm,width:d.d_mm};
  }
  const {bf_mm:bf,tf_mm:tf,h_mm:h,tw_mm:tw}=d;
  if(shape==='I'){
    const A=2*bf*tf+(h-2*tf)*tw;
    return orientation==='strong'?{A,I:(bf*h**3-(bf-tw)*(h-2*tf)**3)/12,yc:h/2,depth:h,width:bf}:{A,I:(2*tf*bf**3+(h-2*tf)*tw**3)/12,yc:bf/2,depth:bf,width:h};
  }
  const Af=bf*tf,yf=h-tf/2,Aw=tw*(h-tf),yw=(h-tf)/2,A=Af+Aw;
  if(orientation==='weak')return {A,I:(tf*bf**3+(h-tf)*tw**3)/12,yc:bf/2,depth:bf,width:h};
  const yc=(Af*yf+Aw*yw)/A;
  // Parallel-axis theorem: each rectangle's own I plus area × (distance to the composite centroid)².
  return {A,I:bf*tf**3/12+Af*(yf-yc)**2+tw*(h-tf)**3/12+Aw*(yw-yc)**2,yc,depth:h,width:bf,parts:{Af,yf,Aw,yw}};
}

function beamCheck(props,d){
  const {A,I,yc,depth}=props,ctop=depth-yc,cbot=yc;
  const M=d.P_N*d.L_mm/4,sigmaTop=M===0?0:-M*ctop/I,sigmaBottom=M*cbot/I;
  const sigmaMax=Math.max(Math.abs(sigmaTop),Math.abs(sigmaBottom)),delta=d.P_N*d.L_mm**3/(48*d.E_MPa*I);
  const elastic=sigmaMax<d.Sy_MPa*(1-1e-12),slender=d.L_mm/depth>=slendernessLimit;
  return {A_mm2:A,I_mm4:I,yc_mm:yc,ctop_mm:ctop,cbot_mm:cbot,Ztop_mm3:I/ctop,Zbot_mm3:I/cbot,depth_mm:depth,R_N:d.P_N/2,Mmax_Nmm:M,
    sigmaTop_MPa:sigmaTop,sigmaBottom_MPa:sigmaBottom,sigmaMax_MPa:sigmaMax,deltaMax_mm:elastic&&slender?delta:null,elastic,slender,slenderness:d.L_mm/depth,parts:props.parts};
}

export function evaluateSection(input){
  const d={...input,shape:input.shape??'rect',Sy_MPa:input.Sy_MPa??250},errors={};
  if(!(d.shape in shapes))return {status:'invalid',data:d,errors:{shape:'Pilih bentuk penampang.'},result:null};
  Object.assign(errors,validateFields(sectionFields,d,new Set(inactiveSectionFields(d.shape))));
  if(d.shape==='pipe'&&!errors.di_mm&&!errors.d_mm&&d.di_mm>=d.d_mm)errors.di_mm='Diameter dalam harus ≥ 0 dan lebih kecil dari diameter luar.';
  if((d.shape==='I'||d.shape==='T')&&!errors.tf_mm&&!errors.h_mm&&d.tf_mm*(d.shape==='I'?2:1)>=d.h_mm)errors.tf_mm=d.shape==='I'?'Dua tebal flens harus lebih kecil dari tinggi total.':'Tebal flens harus lebih kecil dari tinggi total.';
  if((d.shape==='I'||d.shape==='T')&&!errors.tw_mm&&!errors.bf_mm&&d.tw_mm>d.bf_mm)errors.tw_mm='Tebal badan tidak boleh melebihi lebar flens.';
  if(Object.keys(errors).length)return {status:'invalid',data:d,errors,result:null};
  const A=beamCheck(sectionProperties(d.shape,d,'strong'),d),B=beamCheck(sectionProperties(d.shape,d,'weak'),d);
  // Same-area solid square as a neutral reference.
  const side=Math.sqrt(A.A_mm2),square=beamCheck({A:A.A_mm2,I:side**4/12,yc:side/2,depth:side},d);
  if(![A,B,square].every(o=>o.I_mm4>0&&allFinite(Object.values(o).filter(v=>typeof v==='number'))))return {status:'invalid',data:d,errors:{numeric:'Kombinasi angka terlalu ekstrem.'},result:null};
  const reasons=[];
  if(!A.elastic)reasons.push('Orientasi A: tegangan lentur mencapai atau melampaui Sᵧ latihan.');
  if(!A.slender)reasons.push(`Orientasi A: L/tinggi < ${slendernessLimit}; lendutan tidak diklaim.`);
  return {status:reasons.length?'outside':'valid',data:d,errors:{},reason:reasons.join(' '),
    result:{shape:d.shape,orientation_A:A,orientation_B:B,square,ratio_I:A.I_mm4/B.I_mm4,ratio_delta:A.deltaMax_mm&&B.deltaMax_mm?B.deltaMax_mm/A.deltaMax_mm:null}};
}

export const sectionExercises={
  mesin:{shape:'rect',P_N:1500,L_mm:1200,b_mm:30,h_mm:80,d_mm:60,di_mm:50,bf_mm:50,tf_mm:6,tw_mm:5,E_MPa:200000,Sy_MPa:250},
  kapal:{shape:'T',P_N:6000,L_mm:2000,b_mm:60,h_mm:120,d_mm:114,di_mm:100,bf_mm:100,tf_mm:10,tw_mm:8,E_MPa:200000,Sy_MPa:250},
};
export function sectionTargets(context){
  const r=evaluateSection(sectionExercises[context]).result;
  return context==='mesin'?{first:r.orientation_A.I_mm4,second:r.ratio_delta}:{first:r.orientation_A.yc_mm,second:r.orientation_A.sigmaBottom_MPa};
}
export const gradeSection=(context,answers)=>gradeAgainst(sectionTargets(context),answers);
