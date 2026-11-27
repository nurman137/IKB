import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateBending,canonicalBending,convertBendingUnit,beamAt,bendingVariants,bendingExercises,bendingTargets,gradeBending,udlPresets} from '../web/bending-model.js';
import {bendingSteps} from '../web/bending-content.js';
import {loadedBeam,sectionStress,shearMomentCharts,drawnDeflection} from '../web/bending-visuals.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9+Math.abs(b)*1e-6,`${a} != ${b}`);
const beam={load:'point',P_N:8000,w_N_per_mm:5,L_mm:1500,b_mm:60,h_mm:120,E_MPa:200000,Sy_MPa:250};
const udl={...beam,load:'udl'};

test('both 06 cases match every numerical output in the independent M0 dataset',async()=>{
  const {cases}=JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));
  const own=cases.filter(c=>c.id.startsWith('06-'));assert.equal(own.length,2);
  for(const c of own){
    const e=evaluateBending(c.input);assert.equal(e.status,'valid',c.id);
    for(const [k,n] of Object.entries(c.expected))near(e.result[k],n);
  }
});
test('10-K alternatives reuse the same point-load beam model',async()=>{
  const {cases}=JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));
  const k=cases.find(c=>c.id==='10-K');
  for(const alt of ['A','B']){
    const r=evaluateBending({load:'point',P_N:k.input.P_N,L_mm:k.input.L_mm,b_mm:k.input[`b_${alt}_mm`],h_mm:k.input[`h_${alt}_mm`],E_MPa:k.input.E_MPa,Sy_MPa:k.input.Sy_MPa}).result;
    for(const [key,n] of Object.entries(k.expected[`alternative_${alt}`]))near(r[key],n);
  }
});
test('uniform-load presets agree with independent SI fixtures',()=>{
  // Values from an independent Python SI calculation (docs/m4/serah_terima.md).
  const m=evaluateBending({...udl,...udlPresets.mesin}).result;
  near(m.R_N,3750);near(m.Mmax_Nmm,1406250);near(m.sigmaMax_MPa,9.765625000000002);near(m.deltaMax_mm,.19073486328125003);
  const k=evaluateBending({...udl,...udlPresets.kapal,L_mm:3000,b_mm:100,h_mm:200}).result;
  near(k.R_N,9000);near(k.Mmax_Nmm,6750000);near(k.sigmaMax_MPa,10.124999999999998);near(k.deltaMax_mm,.47460937499999994);
});
test('point and uniform loads are exclusive configurations',()=>{
  assert.equal(evaluateBending({...beam,w_N_per_mm:'abc'}).status,'valid');
  assert.equal(evaluateBending({...udl,P_N:'abc'}).status,'valid');
  assert.ok(evaluateBending({...beam,load:'other'}).errors.load);
  // Same total load: uniform gives half the moment and 5/8 of the deflection of a midspan point load.
  const p=evaluateBending({...beam,P_N:7500}).result,u=evaluateBending(udl).result;
  near(u.Mmax_Nmm,p.Mmax_Nmm/2);near(u.deltaMax_mm,p.deltaMax_mm*5/8);near(u.R_N,p.R_N);
});
test('deflection curve, shear and moment satisfy beam relations',()=>{
  for(const input of [beam,udl]){
    const e=evaluateBending(input),r=e.result;
    near(beamAt(input,r.I_mm4,input.L_mm/2).v,r.deltaMax_mm);near(beamAt(input,r.I_mm4,input.L_mm/2).M,r.Mmax_Nmm);
    near(beamAt(input,r.I_mm4,0).v,0);near(beamAt(input,r.I_mm4,input.L_mm).M,0);
    near(beamAt(input,r.I_mm4,300).v,beamAt(input,r.I_mm4,1200).v);
    const x=400,h=.01;near((beamAt(input,r.I_mm4,x+h).M-beamAt(input,r.I_mm4,x-h).M)/(2*h),beamAt(input,r.I_mm4,x).V);
  }
  near(beamAt(udl,8640000,375).v,.13589859008789065);near(beamAt(beam,8640000,375).v,.2237955729166667);
  near(beamAt(beam,8640000,749).V-beamAt(beam,8640000,751).V,beam.P_N);
});
test('parameter scaling follows the M0 verification rules',()=>{
  // L = 3000 keeps h × 2 above the L/h ≥ 10 slenderness threshold.
  const long={...beam,L_mm:3000},a=evaluateBending(long).result,h2=evaluateBending({...long,h_mm:240}).result,b2=evaluateBending({...long,b_mm:120}).result;
  near(h2.sigmaMax_MPa,a.sigmaMax_MPa/4);near(h2.deltaMax_mm,a.deltaMax_mm/8);
  near(b2.sigmaMax_MPa,a.sigmaMax_MPa/2);near(b2.deltaMax_mm,a.deltaMax_mm/2);
  near(evaluateBending({...long,E_MPa:100000}).result.sigmaMax_MPa,a.sigmaMax_MPa);
  assert.equal(evaluateBending({...beam,h_mm:240}).result.deltaMax_mm,null);
  const v=bendingVariants(evaluateBending(udl));assert.equal(v.length,5);
  near(v[3][1].result.sigmaMax_MPa,v[0][1].result.sigmaMax_MPa*4);near(v[3][1].result.deltaMax_mm,v[0][1].result.deltaMax_mm*16);
  const rot=bendingVariants(evaluateBending(beam))[4][1].result;near(rot.A_mm2,7200);near(rot.sigmaMax_MPa,41.66666666666667);near(rot.deltaMax_mm,1.3020833333333335);
});
test('zero load, elastic limit and slenderness limit are handled honestly',()=>{
  const zero=evaluateBending({...beam,P_N:0});assert.equal(zero.status,'valid');assert.equal(zero.result.deltaMax_mm,0);assert.equal(zero.result.sigmaTop_MPa,0);assert.equal(zero.result.spanOverDeflection,null);
  assert.equal(drawnDeflection(zero,1000),0);
  const yieldLimit=evaluateBending({...beam,Sy_MPa:evaluateBending(beam).result.sigmaMax_MPa});assert.equal(yieldLimit.status,'outside');assert.equal(yieldLimit.result.deltaMax_mm,null);assert.ok(!yieldLimit.checks.elastic);
  assert.ok(loadedBeam(yieldLimit).includes('Lendutan tidak dihitung'));
  const stocky=evaluateBending({...beam,L_mm:1199});assert.equal(stocky.status,'outside');assert.ok(!stocky.checks.slender);assert.equal(stocky.result.deltaMax_mm,null);assert.ok(stocky.result.sigmaMax_MPa>0);assert.match(stocky.reason,/L\/h/);
  assert.equal(evaluateBending({...beam,L_mm:1200}).status,'valid');
  assert.match(bendingSteps(stocky,{},{})[5][1],/tidak dihitung/);
  for(const input of [{...beam,L_mm:0},{...beam,b_mm:0},{...beam,h_mm:-1},{...beam,E_MPa:0},{...beam,P_N:-1},{...udl,w_N_per_mm:-2},{...beam,h_mm:1e-200}]){
    const e=evaluateBending(input);assert.equal(e.status,'invalid');assert.equal(e.result,null);
  }
});
test('equivalent units keep physical results',()=>{
  const e=evaluateBending(canonicalBending({load:'udl',P_N:'8',w_N_per_mm:'5000',L_mm:'1,5',b_mm:'0,06',h_mm:'0,12',E_MPa:'200000',Sy_MPa:'250'},{P_N:'kN',w_N_per_mm:'N/m',L_mm:'m',b_mm:'m',h_mm:'m',E_MPa:'MPa',Sy_MPa:'MPa'})).result;
  near(e.deltaMax_mm,evaluateBending(udl).result.deltaMax_mm);
  near(convertBendingUnit('w_N_per_mm','5','kN/m','N/m'),5000);assert.equal(convertBendingUnit('P_N','x','kN','N'),null);
});
test('visuals follow the configuration and stress signs',()=>{
  assert.ok(shearMomentCharts(evaluateBending(udl)).includes('parabola'));assert.ok(shearMomentCharts(evaluateBending(beam)).includes('loncatan'));
  const s=sectionStress(evaluateBending(beam));assert.match(s,/tekan [-−]20,833/);assert.ok(s.includes('tarik +20,833'));
  const e=evaluateBending(beam);near(drawnDeflection(e,100),e.result.deltaMax_mm/1500*430*100);assert.equal(drawnDeflection(e,1e9),60);
});
test('both independent exercises have expected answers and grading tolerance',()=>{
  const expected={mesin:{first:17.578124999999996,second:.36621093749999994},kapal:{first:13.888888888888891,second:.9645061728395063}};
  for(const context of ['mesin','kapal']){
    const t=bendingTargets(context),x=expected[context];near(t.first,x.first);near(t.second,x.second);
    assert.equal(evaluateBending(bendingExercises[context]).status,'valid');
    assert.ok(Object.values(gradeBending(context,{first:String(x.first).replace('.',','),second:x.second})).every(g=>g.correct));
    assert.ok(!gradeBending(context,{first:x.first*1.03,second:''}).first.correct);assert.ok(!gradeBending(context,{first:x.first,second:''}).second.valid);
  }
  assert.equal(bendingExercises.mesin.load,'point');assert.equal(bendingExercises.kapal.load,'udl');
});
test('solution steps follow the active configuration',()=>{
  const units={P_N:'kN',w_N_per_mm:'kN/m',L_mm:'mm',b_mm:'mm',h_mm:'mm',E_MPa:'GPa',Sy_MPa:'MPa'};
  const raw={load:'udl',P_N:'8',w_N_per_mm:'5',L_mm:'1500',b_mm:'60',h_mm:'120',E_MPa:'200',Sy_MPa:'250'};
  const u=bendingSteps(evaluateBending(canonicalBending(raw,units)),raw,units);
  assert.ok(u[0][1].includes('Beban merata w'));assert.ok(!u[0][1].includes('Beban titik P:'));assert.ok(u[2][1].includes('wL²/8'));assert.ok(u[5][1].includes('384'));
  const pRaw={...raw,load:'point'},p=bendingSteps(evaluateBending(canonicalBending(pRaw,units)),pRaw,units);
  assert.ok(p[2][1].includes('PL/4'));assert.ok(p[5][1].includes('48'));assert.ok(p[4][1].includes('20,83333'));
});
