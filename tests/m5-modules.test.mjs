import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateSection,sectionProperties,sectionExercises,sectionTargets,gradeSection,inactiveSectionFields} from '../web/section-model.js';
import {evaluateThermal,thermalVariants,thermalExercises,thermalTargets,gradeThermal,aluminium} from '../web/thermal-model.js';
import {evaluateCombined,combinedVariants,combinedExercises,combinedTargets,gradeCombined} from '../web/combined-model.js';
import {canonicalFrom,validateFields,field} from '../web/lab-core.js';
import {sectionConfig} from '../web/section-lab.js';
import {thermalConfig} from '../web/thermal-lab.js';
import {combinedConfig} from '../web/combined-lab.js';
import {sectionPair,stressComparison,stiffnessBars} from '../web/section-visuals.js';
import {pipeDiagram,stressTemperatureGraph,drawnExpansion} from '../web/thermal-visuals.js';
import {shaftLoads,criterionBars} from '../web/combined-visuals.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9+Math.abs(b)*1e-6,`${a} != ${b}`);
const cases=async()=>JSON.parse(await readFile('docs/m0/reference_cases.json','utf8')).cases;
const rect={shape:'rect',P_N:2000,L_mm:1000,b_mm:40,h_mm:100,d_mm:60,di_mm:50,bf_mm:50,tf_mm:6,tw_mm:5,E_MPa:200000,Sy_MPa:250};
const pipe08={support:'fixed',d_mm:40,di_mm:32,L_mm:2000,deltaT_C:40,E_MPa:200000,alpha_per_C:12e-6,Sy_MPa:250};
const shaft09={F_N:0,M_Nmm:300000,T_Nmm:200000,d_mm:40,Sy_MPa:250,n_required:2};

test('07, 08 and 09 match every numerical output in the independent M0 dataset',async()=>{
  const all=await cases();let checked=0;
  for(const c of all.filter(c=>['07','08','09'].includes(c.id.slice(0,2)))){
    const id=c.id.slice(0,2),e=id==='07'?evaluateSection(c.input):id==='08'?evaluateThermal(c.input):evaluateCombined(c.input);
    assert.equal(e.status,'valid',c.id);
    const flat=id==='07'?Object.entries(c.expected).flatMap(([o,v])=>Object.entries(v).map(([k,n])=>[e.result[o][k],n])):Object.entries(c.expected).map(([k,n])=>[e.result[k],n]);
    for(const [a,b] of flat){near(a,b);checked++;}
  }
  assert.equal(checked,24+10+16);
});

test('07 profile properties agree with independent SI fixtures (I, T with parallel axis, pipe, weak axes)',()=>{
  // Values from an independent Python SI calculation (docs/m5/serah_terima.md).
  const I=evaluateSection({...rect,shape:'I'}).result;
  near(I.orientation_A.A_mm2,1040);near(I.orientation_A.I_mm4,1611146.6666666665);near(I.orientation_A.deltaMax_mm,.12930749114502302);
  near(I.orientation_B.I_mm4,125916.66666666672);near(I.orientation_B.sigmaBottom_MPa,99.27200529450691);
  const T=evaluateSection({...rect,shape:'T',P_N:5000,L_mm:2000,bf_mm:100,tf_mm:10,h_mm:150,tw_mm:8}).result.orientation_A;
  near(T.A_mm2,2120);near(T.yc_mm,105.37735849056604);near(T.I_mm4,4809364.779874214);near(T.Ztop_mm3,107778.5764622974);near(T.Zbot_mm3,45639.45091017607);
  near(T.sigmaTop_MPa,-23.195704397474007);near(T.sigmaBottom_MPa,54.777170849848765);near(T.deltaMax_mm,.8663652805258085);
  near(evaluateSection({...rect,shape:'T',P_N:5000,L_mm:2000,bf_mm:100,tf_mm:10,h_mm:150,tw_mm:8}).result.orientation_B.deltaMax_mm,4.964415072758467);
  const P=evaluateSection({...rect,shape:'pipe',P_N:5000,L_mm:2000,d_mm:114,di_mm:100}).result;
  near(P.orientation_A.I_mm4,3381925.276987576);near(P.orientation_A.sigmaBottom_MPa,42.135762421968934);near(P.orientation_B.I_mm4,P.orientation_A.I_mm4);
});
test('07 physical invariants: equal area, rotation ratio, T asymmetry, validation',()=>{
  const r=evaluateSection(rect).result;
  near(r.orientation_B.A_mm2,r.orientation_A.A_mm2);near(r.square.A_mm2,r.orientation_A.A_mm2);
  near(r.ratio_delta,(100/40)**2);near(r.ratio_I,(100/40)**2);
  const T=sectionProperties('T',{bf_mm:100,tf_mm:10,h_mm:150,tw_mm:8});assert.ok(T.yc>75);
  const t=evaluateSection({...rect,shape:'T',bf_mm:100,tf_mm:10,h_mm:150,tw_mm:8,L_mm:2000}).result.orientation_A;assert.ok(Math.abs(t.sigmaBottom_MPa)>Math.abs(t.sigmaTop_MPa));
  // An I section of zero web/flange reduction equals the outer rectangle.
  near(sectionProperties('I',{bf_mm:40,tf_mm:10,h_mm:100,tw_mm:40}).I,40*100**3/12);
  for(const bad of [{...rect,shape:'I',tf_mm:50},{...rect,shape:'T',tf_mm:100},{...rect,shape:'I',tw_mm:60},{...rect,shape:'pipe',di_mm:60},{...rect,b_mm:0},{...rect,shape:'hex'},{...rect,h_mm:1e-200}])assert.equal(evaluateSection(bad).status,'invalid');
  assert.equal(evaluateSection({...rect,shape:'pipe',b_mm:'x'}).status,'valid');
  assert.deepEqual(inactiveSectionFields('rect').sort(),['bf_mm','d_mm','di_mm','tf_mm','tw_mm']);
  const stocky=evaluateSection({...rect,L_mm:900});assert.equal(stocky.status,'outside');assert.equal(stocky.result.orientation_A.deltaMax_mm,null);assert.ok(stocky.result.orientation_B.deltaMax_mm>0);
  const zero=evaluateSection({...rect,P_N:0}).result.orientation_A;assert.equal(zero.sigmaTop_MPa,0);assert.equal(zero.deltaMax_mm,0);
});

test('08 free vs fixed, sign convention, scaling and elastic limit',()=>{
  const e=evaluateThermal(pipe08),r=e.result;
  assert.equal(r.sigma_free_MPa,0);assert.equal(r.delta_fully_fixed_mm,0);assert.equal(r.reactionSense,'push');
  const cool=evaluateThermal({...pipe08,deltaT_C:-40}).result;near(cool.sigma_fully_fixed_MPa,96);assert.equal(cool.reactionSense,'pull');near(cool.delta_free_mm,-.96);
  const zero=evaluateThermal({...pipe08,deltaT_C:0}).result;assert.equal(zero.sigma_fully_fixed_MPa,0);assert.equal(zero.reactionMagnitude_N,0);assert.equal(zero.reactionSense,'none');
  const v=thermalVariants(e);
  near(v[3][1].result.delta_free_mm,r.delta_free_mm*2);near(v[3][1].result.sigma_fully_fixed_MPa,r.sigma_fully_fixed_MPa);
  near(v[4][1].result.sigma_fully_fixed_MPa,r.sigma_fully_fixed_MPa);assert.ok(v[4][1].result.reactionMagnitude_N>r.reactionMagnitude_N);
  const al=evaluateThermal({...pipe08,...aluminium}).result;near(al.delta_free_mm,1.84);near(al.sigma_fully_fixed_MPa,-64.4);near(al.reactionMagnitude_N,29133.873632330314);
  const hot=evaluateThermal({...pipe08,deltaT_C:120});assert.equal(hot.status,'outside');assert.equal(hot.result.sigma_active_MPa,null);assert.ok(!hot.fixedElastic);
  assert.equal(evaluateThermal({...pipe08,deltaT_C:120,support:'free'}).status,'valid');
  for(const bad of [{...pipe08,di_mm:40},{...pipe08,alpha_per_C:0},{...pipe08,L_mm:0},{...pipe08,support:'x'},{...pipe08,deltaT_C:'abc'}])assert.equal(evaluateThermal(bad).status,'invalid');
  assert.ok(pipeDiagram(hot).includes('di luar domain elastis'));assert.ok(stressTemperatureGraph(e).includes('−Eα'));
  assert.equal(drawnExpansion(e,200),0);assert.ok(drawnExpansion(evaluateThermal({...pipe08,support:'free'}),1e6)<=110);
});

test('09 combined stress at the same point, limiting cases and criterion status',()=>{
  const r=evaluateCombined(shaft09).result;
  near(r.vm_A_MPa,r.vm_B_MPa);assert.equal(r.critical,'both');
  near(r.principal_A_MPa[0],52.56530686685338);near(r.principal_A_MPa[1],-4.8188239392847905);
  near(evaluateCombined({...shaft09,T_Nmm:0}).result.sigma_vm_max_MPa,Math.abs(r.sigma_edge_A_MPa));
  near(evaluateCombined({...shaft09,M_Nmm:0}).result.sigma_vm_max_MPa,Math.sqrt(3)*r.tau_surface_MPa);
  const k=evaluateCombined({F_N:-80000,M_Nmm:200000,T_Nmm:3000000,d_mm:80,Sy_MPa:250,n_required:2});
  assert.equal(k.result.critical,'B');assert.ok(k.checks.compression);near(k.result.vm_A_MPa,53.04750287540866);near(k.result.vm_B_MPa,55.38357626970594);
  const zero=evaluateCombined({...shaft09,M_Nmm:0,T_Nmm:0});assert.equal(zero.result.n_yield,null);assert.equal(zero.status,'valid');assert.equal(zero.result.critical,'none');
  const fail=evaluateCombined({...shaft09,Sy_MPa:100});assert.equal(fail.status,'valid');assert.ok(!fail.checks.meets);
  const yielded=evaluateCombined({...shaft09,Sy_MPa:50});assert.equal(yielded.status,'outside');assert.ok(yielded.checks.yielded);
  const exact=evaluateCombined({...shaft09,n_required:r.n_yield});assert.ok(exact.checks.meets);
  for(const bad of [{...shaft09,n_required:1},{...shaft09,d_mm:0},{...shaft09,T_Nmm:-1},{...shaft09,Sy_MPa:0}])assert.equal(evaluateCombined(bad).status,'invalid');
  const v=combinedVariants(evaluateCombined(shaft09));near(v[4][1].result.vm_A_MPa,r.vm_A_MPa/1.2**3);
  assert.ok(criterionBars(fail).includes('Belum memenuhi'));assert.ok(shaftLoads(k).includes('Elemen titik B'));
});

test('all six exercises have independent expected answers and grading tolerance',()=>{
  const expected={
    section:{mesin:{first:1280000.0000000002,second:7.1111111111111125},kapal:{first:86.91489361702126,second:101.0335569363185}},
    thermal:{mesin:{first:1.8000000000000003,second:-144},kapal:{first:72,second:112.64494618711556}},
    combined:{mesin:{first:58.082385690526245,second:4.304230913172997},kapal:{first:55.38357626970594,second:4.513973579144736}},
  };
  const mods={section:[sectionTargets,gradeSection,sectionExercises,evaluateSection],thermal:[thermalTargets,gradeThermal,thermalExercises,evaluateThermal],combined:[combinedTargets,gradeCombined,combinedExercises,evaluateCombined]};
  for(const [name,[targets,grade,data,evaluate]] of Object.entries(mods))for(const context of ['mesin','kapal']){
    const t=targets(context),x=expected[name][context];near(t.first,x.first);near(t.second,x.second);
    assert.equal(evaluate(data[context]).status,'valid',`${name} ${context}`);
    assert.ok(Object.values(grade(context,{first:String(x.first).replace('.',','),second:x.second})).every(g=>g.correct));
    assert.ok(!grade(context,{first:x.first*1.03,second:''}).first.correct);assert.ok(!grade(context,{first:x.first,second:''}).second.valid);
  }
  // Sign matters for thermal stress answers.
  assert.ok(!gradeThermal('mesin',{first:1.8,second:144}).second.correct);
});

test('lab configs produce steps, results and variants for valid inputs and nothing stale for invalid',async()=>{
  const all=await cases();
  for(const cfg of [sectionConfig,thermalConfig,combinedConfig])for(const context of ['mesin','kapal']){
    const preset=cfg.preset(context,{cases:all}),units=Object.fromEntries(Object.entries(cfg.fields).map(([k,fl])=>[k,Object.keys(fl.units)[0]]));
    const raw=Object.fromEntries(Object.entries(cfg.fields).map(([k,fl])=>[k,String(preset[k]/fl.units[units[k]])]));
    if(cfg.mode)raw[cfg.mode.key]=preset[cfg.mode.key];
    const e=cfg.evaluate(canonicalFrom(cfg.fields,raw,units,cfg.mode?.key));assert.equal(e.status,'valid',`${cfg.id} ${context}`);
    assert.equal(cfg.steps(e,raw,units).length,7);assert.ok(cfg.results(e).length>=8);assert.ok(cfg.variants(e).length>=3);
    assert.ok(cfg.lab.render(e,cfg.scale?.default).includes('<svg'));for(const g of cfg.graphs)assert.ok(g.render(e,cfg.scale?.default).includes('<svg'));
    const bad=cfg.evaluate({...canonicalFrom(cfg.fields,raw,units,cfg.mode?.key),d_mm:NaN,L_mm:NaN,P_N:NaN});
    if(bad.status==='invalid'){assert.equal(cfg.variants(bad),null);assert.ok(cfg.lab.render(bad).includes('Perbaiki input'));}
  }
  for(const shape of ['I','T','pipe']){const e=evaluateSection({...rect,shape});assert.ok(sectionConfig.steps(e,{...rect},Object.fromEntries(Object.keys(sectionConfig.fields).map(k=>[k,Object.keys(sectionConfig.fields[k].units)[0]])))[2][1].length>50);assert.ok(sectionPair(e).includes('<svg'));assert.ok(stressComparison(e).includes('<svg'));assert.ok(stiffnessBars(e).includes('<svg'));}
});
test('shared lab core handles units, signed fields and skipped fields',()=>{
  const fields={a:field('A',{kN:1000,N:1},{signed:true}),b:field('B',{mm:1},{positive:true})};
  assert.deepEqual(canonicalFrom(fields,{a:'-1,5',b:'2'},{a:'kN',b:'mm'}),{a:-1500,b:2});
  const d={a:-5,b:0};assert.ok(validateFields(fields,d).b);assert.ok(!validateFields(fields,{a:-5,b:1}).a);
  assert.deepEqual(validateFields(fields,{a:-5,b:'x'},new Set(['b'])),{});
});
