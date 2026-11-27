import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateShaftDesign,evaluateBeamDesign,designExercises,designTargets,gradeDesign} from '../web/design-model.js';
import {designConfig} from '../web/design-lab.js';
import {canonicalFrom} from '../web/lab-core.js';
import {alternativesDrawing,utilizationBars,decisionMatrix,designSummary} from '../web/design-visuals.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9+Math.abs(b)*1e-6,`${a} != ${b}`);
const cases=async()=>JSON.parse(await readFile('docs/m0/reference_cases.json','utf8')).cases;
const shaft={T_Nmm:150000,d_mm:35,di_A_mm:0,di_B_mm:20,L_mm:800,E_MPa:200000,nu:.3,rho_kg_m3:7850,Sy_MPa:250,n_required:2,theta_limit_deg:2};
const beam={P_N:15000,L_mm:2500,b_A_mm:80,h_A_mm:180,b_B_mm:180,h_B_mm:80,E_MPa:200000,rho_kg_m3:7850,Sy_MPa:250,n_required:2,deflection_limit_mm:2.5};

test('both 10 cases match every numerical output in the independent M0 dataset',async()=>{
  const all=await cases();let checked=0;
  const m=all.find(c=>c.id==='10-M'),k=all.find(c=>c.id==='10-K');
  const em=evaluateShaftDesign(m.input);assert.equal(em.status,'valid');
  const {deflection_limit_basis,...kin}=k.input;const ek=evaluateBeamDesign({rho_kg_m3:7850,...kin});assert.equal(ek.status,'valid');
  for(const [e,c] of [[em,m],[ek,k]])for(const alt of ['alternative_A','alternative_B'])for(const [key,n] of Object.entries(c.expected[alt])){near(e.result[alt][key],n);checked++;}
  assert.equal(checked,24);
});
test('M0 interpretation: 10-M both pass; 10-K B passes strength but fails deflection',()=>{
  const m=evaluateShaftDesign(shaft).result;
  assert.ok(m.alternative_A.allMet&&m.alternative_B.allMet);assert.equal(m.decision.choice,'B');assert.equal(m.decision.rule,'mass');
  near(m.massSaving,1-4.069147884562181/6.04206807101657);
  const k=evaluateBeamDesign(beam).result;
  assert.ok(k.alternative_A.allMet);assert.ok(k.alternative_B.strength);assert.equal(k.alternative_B.stiffness,false);assert.ok(!k.alternative_B.allMet);
  assert.equal(k.decision.choice,'A');assert.equal(k.decision.rule,'only');
  near(k.alternative_A.n_yield,11.52);near(k.alternative_B.n_yield,5.12);near(k.alternative_A.mass_kg,282.6);near(k.alternative_B.mass_kg,282.6);
  near(k.hMinB_mm,86.67015929382934);
  const fixed=evaluateBeamDesign({...beam,h_B_mm:Math.ceil(k.hMinB_mm)}).result.alternative_B;assert.ok(fixed.stiffness);assert.ok(fixed.mass_kg>k.alternative_B.mass_kg);
});
test('decision rule handles ties, no passing alternative and stricter criteria',()=>{
  const tie=evaluateBeamDesign({...beam,deflection_limit_mm:5}).result;assert.equal(tie.decision.rule,'margin');assert.equal(tie.decision.choice,'A');
  const strict=evaluateShaftDesign({...shaft,theta_limit_deg:.5}).result;assert.equal(strict.decision.choice,null);assert.ok(decisionMatrix({status:'valid',data:{...shaft,theta_limit_deg:.5},result:strict}).includes('Belum ada alternatif'));
  const thin=evaluateShaftDesign({...shaft,di_B_mm:28}).result.alternative_B;near(thin.mass_kg,2.1751445055659655);near(thin.n_yield,4.7826488361048405);near(thin.theta_deg,1.0276111553977507);
  const zero=evaluateShaftDesign({...shaft,T_Nmm:0}).result;assert.equal(zero.alternative_A.n_yield,null);assert.ok(zero.alternative_A.allMet);
});
test('validation and model-domain handling',()=>{
  for(const bad of [{...shaft,di_B_mm:35},{...shaft,n_required:1},{...shaft,nu:.5},{...shaft,theta_limit_deg:0},{...beam,h_B_mm:0},{...beam,deflection_limit_mm:0},{...beam,n_required:.5}])
    assert.equal((bad.T_Nmm!==undefined?evaluateShaftDesign:evaluateBeamDesign)(bad).status,'invalid');
  const stocky=evaluateBeamDesign({...beam,h_A_mm:300});assert.equal(stocky.status,'outside');assert.equal(stocky.result.alternative_A.deltaMax_mm,null);assert.equal(stocky.result.alternative_A.stiffness,null);assert.ok(!stocky.result.alternative_A.allMet);
  const yielded=evaluateShaftDesign({...shaft,Sy_MPa:30});assert.equal(yielded.status,'outside');assert.equal(yielded.result.alternative_B.theta_deg,null);
});
test('both exercises have independent expected answers and grading tolerance',()=>{
  const expected={mesin:{first:5.030946475458695,second:.9750113901626463},kapal:{first:5.9037900874635545,second:12.962962962962967}};
  for(const context of ['mesin','kapal']){
    const t=designTargets(context),x=expected[context];near(t.first,x.first);near(t.second,x.second);
    assert.ok(Object.values(gradeDesign(context,{first:String(x.first).replace('.',','),second:x.second})).every(g=>g.correct));
    assert.ok(!gradeDesign(context,{first:x.first*1.03,second:''}).first.correct);assert.ok(!gradeDesign(context,{first:x.first,second:''}).second.valid);
  }
  assert.equal(evaluateShaftDesign(designExercises.mesin).status,'valid');assert.equal(evaluateBeamDesign(designExercises.kapal).status,'valid');
});
test('context configs render drawings, criteria, summary and seven steps',async()=>{
  const all=await cases();
  for(const context of ['mesin','kapal']){
    const cfg=designConfig(context),preset=cfg.preset(context,{cases:all}),units=Object.fromEntries(Object.entries(cfg.fields).map(([k,fl])=>[k,Object.keys(fl.units)[0]]));
    const raw=Object.fromEntries(Object.entries(cfg.fields).map(([k,fl])=>[k,String(preset[k]/fl.units[units[k]])]));
    const e=cfg.evaluate(canonicalFrom(cfg.fields,raw,units));assert.equal(e.status,'valid',context);
    assert.equal(cfg.steps(e,raw,units).length,7);assert.ok(cfg.results(e).length>=9);assert.ok(cfg.variants(e).length===3);
    assert.ok(alternativesDrawing(e).includes('<svg'));assert.ok(utilizationBars(e).includes('100%'));
    const s=designSummary(e,context);assert.ok(s.includes('Pendamping SolidWorks'));assert.ok(s.includes('singularitas'));assert.ok(s.includes('bukan kutipan standar'));
    assert.equal(cfg.graphs.length,3);
  }
  const k=evaluateBeamDesign(beam);assert.ok(designSummary(k,'kapal').includes('tinggi minimum'));
  assert.ok(decisionMatrix(k).includes('✗ belum memenuhi'));assert.ok(decisionMatrix(k).includes('Rekomendasi latihan: alternatif A'));
});
