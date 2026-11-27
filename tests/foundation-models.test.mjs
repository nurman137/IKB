import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateFoundation,evaluateBeam,evaluateHooke,evaluatePin,canonicalFoundation,foundationExercises,exerciseTargets,gradeFoundation} from '../web/foundation-model.js';
import {beamCharts,pinDiagram,hookeDiagram} from '../web/foundation-visuals.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9+Math.abs(b)*1e-6,`${a} != ${b}`);
const beam={P_N:10000,L_mm:1200,a_mm:400,x_mm:600};
const hooke={F_N:10000,d_mm:20,L_mm:500,E_MPa:200000,nu:.3,Sy_MPa:250};
const pin={F_N:12000,d_mm:12,n_planes:1,t_center_mm:8,t_each_outer_mm:8};

test('all six M3 cases match every numerical output in the independent M0 dataset',async()=>{
  const {cases}=JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));
  for(const c of cases.filter(c=>['01','03','04'].includes(c.id.slice(0,2)))){
    const e=evaluateFoundation(c.id.slice(0,2),c.input);assert.equal(e.status,'valid',c.id);
    for(const [k,n] of Object.entries(c.expected))near(e.result[k],n);
  }
});
test('beam reactions satisfy force and moment equilibrium including load at supports',()=>{
  for(const a of [0,1,400,600,1199,1200]){
    const e=evaluateBeam({...beam,a_mm:a}),r=e.result;
    near(r.RA_N+r.RB_N,beam.P_N);near(r.RB_N*beam.L_mm,beam.P_N*a);
    if(a===0||a===beam.L_mm){assert.equal(r.M_at_load_Nmm,0);near(r.V_left_N,0);near(r.V_right_N,0);assert.ok(beamCharts(e).includes('V = 0 pada bentang'));}
  }
});
test('beam cut distinguishes discontinuities and end conditions',()=>{
  const at=evaluateBeam({...beam,x_mm:beam.a_mm}).result;
  near(at.V_left_N-at.V_right_N,beam.P_N);near(at.M_at_x_Nmm,at.M_at_load_Nmm);
  const roundoff=evaluateBeam({...beam,x_mm:400+Number.EPSILON*1200}).result;
  near(roundoff.V_left_N-roundoff.V_right_N,beam.P_N);
  const left=evaluateBeam({...beam,x_mm:0}).result,right=evaluateBeam({...beam,x_mm:beam.L_mm}).result;
  assert.equal(left.M_at_x_Nmm,0);assert.equal(right.M_at_x_Nmm,0);assert.equal(left.V_left_N,0);assert.equal(right.V_right_N,0);
});
test('beam diagram derivatives and symmetric reactions agree with physical invariants',()=>{
  const x=200,h=.01,a=evaluateBeam({...beam,x_mm:x-h}).result,b=evaluateBeam({...beam,x_mm:x+h}).result;
  near((b.M_at_x_Nmm-a.M_at_x_Nmm)/(2*h),a.V_right_N);
  const symmetric=evaluateBeam({...beam,a_mm:600}).result;near(symmetric.RA_N,symmetric.RB_N);
  const zero=evaluateBeam({...beam,P_N:0}).result;near(zero.RA_N,0);near(zero.M_at_x_Nmm,0);
});
test('energy fixtures and lateral strain agree with independent SI calculations',()=>{
  const a=evaluateHooke(hooke).result,b=evaluateHooke({...hooke,F_N:15000,d_mm:25,L_mm:1000}).result;
  near(a.U_J,.3978873577297384);near(b.U_J,1.1459155902616465);
  near(a.U_Nmm,a.U_J*1000);near(a.delta_d_mm,-.0009549296585513718);
  assert.ok(a.epsilon_lateral<0);assert.equal(evaluateHooke({...hooke,nu:0}).result.delta_d_mm,0);
});
test('Hooke stiffness, energy and material comparison preserve physical scaling',()=>{
  const a=evaluateHooke(hooke),twice=evaluateHooke({...hooke,F_N:20000}).result;
  near(twice.delta_mm,a.result.delta_mm*2);near(twice.U_J,a.result.U_J*4);
  near(a.result.sigma_MPa,a.comparisonData.sigma_MPa);assert.ok(a.comparisonData.delta_mm>a.result.delta_mm);
  near(evaluateHooke({...hooke,L_mm:1000}).result.k_N_per_mm,a.result.k_N_per_mm/2);
});
test('Hooke limits reject unsupported Poisson values and hide nonelastic deformation/energy',()=>{
  for(const nu of [-.1,.5,1])assert.equal(evaluateHooke({...hooke,nu}).status,'invalid');
  const e=evaluateHooke({...hooke,Sy_MPa:10});assert.equal(e.status,'outside');assert.equal(e.result.U_J,null);assert.equal(e.result.delta_d_mm,null);assert.equal(e.result.epsilon_lateral,null);assert.ok(hookeDiagram(e).includes('Deformasi tidak dihitung'));
  const zero=evaluateHooke({...hooke,F_N:0}).result;assert.equal(zero.U_J,0);assert.equal(zero.delta_mm,0);
});
test('two shear planes halve pin shear without halving middle-plate bearing',()=>{
  const a=evaluatePin(pin).result,b=evaluatePin({...pin,n_planes:2}).result;
  near(b.tau_avg_MPa,a.tau_avg_MPa/2);near(b.bearing_center_MPa,a.bearing_center_MPa);near(b.bearing_each_outer_MPa,a.bearing_center_MPa/2);
  assert.equal(a.bearing_each_outer_MPa,null);
});
test('pin plate thickness affects bearing but not shear; double-shear diagram follows the mode',()=>{
  const a=evaluatePin(pin),b=evaluatePin({...pin,t_center_mm:16});near(a.result.tau_avg_MPa,b.result.tau_avg_MPa);near(b.result.bearing_center_MPa,a.result.bearing_center_MPa/2);
  const single=pinDiagram(a),double=pinDiagram(evaluatePin({...pin,n_planes:2}));
  assert.ok(single.includes('satu bidang geser'));assert.ok(double.includes('dua bidang geser'));assert.ok(double.includes('F/2'));
  const zero=evaluatePin({...pin,F_N:0}).result;assert.equal(zero.tau_avg_MPa,0);assert.equal(zero.bearing_center_MPa,0);
});
test('invalid geometry or extreme numeric combinations clear results',()=>{
  for(const [id,input] of [['01',{...beam,a_mm:1201}],['01',{...beam,x_mm:-1}],['01',{...beam,L_mm:0}],['03',{...hooke,E_MPa:0}],['04',{...pin,n_planes:1.5}],['04',{...pin,n_planes:2,t_each_outer_mm:0}],['04',{...pin,d_mm:1e-200}]]){
    const e=evaluateFoundation(id,input);assert.equal(e.status,'invalid');assert.equal(e.result,null);
  }
  assert.equal(evaluatePin({...pin,t_each_outer_mm:''}).status,'valid');
});
test('equivalent force, length and modulus unit inputs keep physical results',()=>{
  const actual=evaluateBeam(canonicalFoundation('01',{P_N:'10',L_mm:'1,2',a_mm:'0,4',x_mm:'0,6'},{P_N:'kN',L_mm:'m',a_mm:'m',x_mm:'m'})).result;
  near(actual.RA_N,evaluateBeam(beam).result.RA_N);
  const h=evaluateHooke(canonicalFoundation('03',{F_N:'10',d_mm:'0,02',L_mm:'0,5',E_MPa:'200',nu:'0,3',Sy_MPa:'250'},{F_N:'kN',d_mm:'m',L_mm:'m',E_MPa:'GPa',nu:'tanpa satuan',Sy_MPa:'MPa'})).result;
  near(h.U_J,evaluateHooke(hooke).result.U_J);
});
test('all six independent exercises have the expected answers and grading tolerance',()=>{
  const targets={
    '01':{mesin:{first:9,second:3},kapal:{first:6,second:12}},
    '03':{mesin:{first:.07957747154594767,second:.3183098861837907},kapal:{first:.15278874536821954,second:.9167324722093172}},
    '04':{mesin:{first:114.59155902616465,second:150},kapal:{first:74.60387957432594,second:187.5}},
  };
  for(const id of Object.keys(targets))for(const context of ['mesin','kapal']){
    const actual=exerciseTargets(id,context),expected=targets[id][context];near(actual.first,expected.first);near(actual.second,expected.second);
    const grades=gradeFoundation(id,context,expected);assert.ok(grades.first.correct&&grades.second.correct);
    assert.ok(!gradeFoundation(id,context,{first:expected.first*1.03,second:''}).first.correct);assert.ok(!gradeFoundation(id,context,{first:expected.first,second:''}).second.valid);
    assert.equal(evaluateFoundation(id,foundationExercises[id][context]).status,'valid');
  }
});
