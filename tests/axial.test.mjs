import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateAxial,toCanonical,convertUnit,exercises,gradeExercise,prediction} from '../web/axial-model.js';
import {axialDiagram,elasticGraph} from '../web/axial-visuals.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9+Math.abs(b)*1e-6,`${a} ≠ ${b}`);
const base={F_N:20000,d_mm:20,L_mm:500,E_MPa:200000,Sy_MPa:250};

test('02-M and 02-K agree with independently prepared M0 reference values',async()=>{
  const {cases}=JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));
  for(const id of ['02-M','02-K']){
    const c=cases.find(x=>x.id===id),r=evaluateAxial(c.input);
    assert.equal(r.status,'valid');
    for(const [key,value] of Object.entries(c.expected))near(r.result[key],value);
  }
});
test('equivalent N/kN, mm/m, MPa/GPa produce the same physical result',()=>{
  const a=evaluateAxial(toCanonical({F_N:'20',d_mm:'0,02',L_mm:'0,5',E_MPa:'200',Sy_MPa:'250'},{F_N:'kN',d_mm:'m',L_mm:'m',E_MPa:'GPa',Sy_MPa:'MPa'}));
  const b=evaluateAxial(base);
  assert.deepEqual(a.result,b.result);
  near(convertUnit('20','F_N','kN','N'),20000);
  near(convertUnit('0,02','d_mm','m','mm'),20);
  assert.equal(convertUnit('abc','F_N','kN','N'),null);
});
test('diameter, length, modulus and load obey physical scaling',()=>{
  const r=evaluateAxial(base).result;
  const d=evaluateAxial({...base,d_mm:40}).result;near(d.sigma_MPa,r.sigma_MPa/4);near(d.delta_mm,r.delta_mm/4);
  const l=evaluateAxial({...base,L_mm:1000}).result;near(l.sigma_MPa,r.sigma_MPa);near(l.delta_mm,r.delta_mm*2);
  const e=evaluateAxial({...base,E_MPa:100000}).result;near(e.sigma_MPa,r.sigma_MPa);near(e.epsilon,r.epsilon*2);
  const f=evaluateAxial({...base,F_N:10000}).result;near(f.sigma_MPa,r.sigma_MPa/2);near(f.delta_mm,r.delta_mm/2);
});
test('zero load and release give exact zero strain and deformation',()=>{
  const e=evaluateAxial({...base,F_N:0});assert.equal(e.status,'valid');
  assert.equal(e.result.sigma_MPa,0);assert.equal(e.result.epsilon,0);assert.equal(e.result.delta_mm,0);assert.equal(e.result.final_length_mm,base.L_mm);
  assert.ok(axialDiagram(e).includes('δ = 0 mm'));
});
test('yield threshold and excessive strain hide elastic deformation and graph point',()=>{
  const limit=evaluateAxial({...base,F_N:250*Math.PI*20**2/4});
  assert.equal(limit.status,'outside');assert.equal(limit.result.delta_mm,null);assert.equal(limit.result.epsilon,null);
  assert.ok(!elasticGraph(limit).includes('<circle'));
  assert.ok(axialDiagram(limit).includes('Deformasi tidak dihitung'));
  assert.equal(evaluateAxial({...base,E_MPa:1000}).status,'outside');
});
test('invalid or extreme inputs never leave numerical results',()=>{
  for(const change of [{F_N:-1},{d_mm:0},{L_mm:''},{E_MPa:0},{Sy_MPa:-2},{d_mm:Infinity},{F_N:1e8},{F_N:'1.000,5'}]){
    const e=evaluateAxial({...base,...change});assert.equal(e.status,'invalid');assert.equal(e.result,null);
  }
  assert.equal(evaluateAxial({...base,d_mm:1e-200}).status,'invalid');
});
test('exercise answers are based on separate data and accept 1 percent tolerance',()=>{
  // Values below calculated independently in SI: F/(πr²), FL/(πr²E).
  const expected={mesin:{sigma:74.60387957432594,delta:0.1492077591486519},kapal:{sigma:79.57747154594767,delta:0.5968310365946076}};
  for(const context of ['mesin','kapal']){
    assert.notEqual(exercises[context].F_N,context==='mesin'?20000:30000);
    const e=expected[context],g=gradeExercise(context,e);assert.ok(g.sigma.correct&&g.delta.correct);
    assert.ok(gradeExercise(context,{sigma:e.sigma*1.009,delta:e.delta*.991}).delta.correct);
    assert.ok(!gradeExercise(context,{sigma:e.sigma*1.02,delta:''}).sigma.correct);
    assert.ok(!gradeExercise(context,{sigma:e.sigma,delta:''}).delta.valid);
  }
});
test('prediction feedback identifies the two distinct physical comparisons',()=>{
  assert.ok(prediction('mesin','quarter').correct);assert.ok(!prediction('mesin','half').correct);
  assert.ok(prediction('kapal','double-length').correct);assert.ok(!prediction('kapal','double-both').correct);
});
test('graph keeps comparable axes and shows a shallower slope for lower E',()=>{
  const steel=elasticGraph(evaluateAxial(base)),lower=elasticGraph(evaluateAxial({...base,E_MPa:70000}));
  const end=svg=>svg.match(/<path d="M76 236 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
  const [x1,y1]=end(steel),[x2,y2]=end(lower);
  assert.ok(x2>x1);near(y1,y2);
  assert.ok(steel.includes('0,5'));assert.ok(lower.includes('0,5'));
});
