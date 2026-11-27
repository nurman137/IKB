import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluateTorsion,canonicalTorsion,convertTorsionUnit,torsionVariants,torsionExercises,torsionTargets,gradeTorsion,powerPresets} from '../web/torsion-model.js';
import {torsionSteps} from '../web/torsion-content.js';
import {shaftDiagram,shearDistribution,visualTwist} from '../web/torsion-visuals.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9+Math.abs(b)*1e-6,`${a} != ${b}`);
const shaft={mode:'torque',T_Nmm:200000,P_W:0,n_rpm:1450,d_mm:30,di_mm:0,L_mm:600,E_MPa:200000,nu:.3,Sy_MPa:250};

test('both 05 cases match every numerical output in the independent M0 dataset',async()=>{
  const {cases}=JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));
  const own=cases.filter(c=>c.id.startsWith('05-'));assert.equal(own.length,2);
  for(const c of own){
    const e=evaluateTorsion(c.input);assert.equal(e.status,'valid',c.id);
    for(const [k,n] of Object.entries(c.expected))near(e.result[k],n);
  }
});
test('power–rpm presets and hollow shaft agree with independent SI fixtures',()=>{
  // Values from an independent Python SI calculation (docs/m4/serah_terima.md).
  const m=evaluateTorsion({...shaft,mode:'power',...powerPresets.mesin}).result;
  near(m.omega_rad_s,151.84364492350667);near(m.T_Nmm,197571.6534933873);near(m.tauMax_MPa,37.26756179948057);near(m.theta_deg,1.110342482003668);
  const k=evaluateTorsion({...shaft,mode:'power',...powerPresets.kapal,d_mm:60,L_mm:2000}).result;
  near(k.omega_rad_s,62.83185307179586);near(k.T_Nmm,1432394.4878270582);near(k.tauMax_MPa,33.77372788077927);near(k.theta_rad,.02927056416334203);
  const h=evaluateTorsion({...shaft,di_mm:18}).result;
  near(h.J_mm4,69215.56934389031);near(h.tauMax_MPa,43.342849425897434);near(h.tauInner_MPa,26.005709655538457);near(h.theta_deg,1.291348418970972);near(h.gammaMax,.0005634570425366666);
});
test('torque and power modes are exclusive sources of T',()=>{
  const direct=evaluateTorsion({...shaft,P_W:'abc',n_rpm:0});assert.equal(direct.status,'valid');assert.equal(direct.result.omega_rad_s,null);
  const power=evaluateTorsion({...shaft,mode:'power',T_Nmm:'abc',P_W:30000});assert.equal(power.status,'valid');near(power.result.T_Nmm,30000/(2*Math.PI*1450/60)*1000);
  assert.ok(evaluateTorsion({...shaft,mode:'power',n_rpm:0}).errors.n_rpm);
  assert.equal(evaluateTorsion({...shaft,mode:'power',P_W:0}).result.tauMax_MPa,0);
  assert.ok(evaluateTorsion({...shaft,mode:'other'}).errors.mode);
  // Same power at half speed doubles torque.
  const slow=evaluateTorsion({...shaft,mode:'power',P_W:30000,n_rpm:725}).result;near(slow.T_Nmm,power.result.T_Nmm*2);
});
test('parameter scaling follows the M0 verification rules',()=>{
  const a=evaluateTorsion(shaft).result,L2=evaluateTorsion({...shaft,L_mm:1200}).result,d2=evaluateTorsion({...shaft,d_mm:60}).result,T2=evaluateTorsion({...shaft,T_Nmm:400000}).result;
  near(L2.tauMax_MPa,a.tauMax_MPa);near(L2.theta_rad,a.theta_rad*2);near(L2.gammaMax,a.gammaMax);
  near(d2.tauMax_MPa,a.tauMax_MPa/8);near(d2.theta_rad,a.theta_rad/16);
  near(T2.tauMax_MPa,a.tauMax_MPa*2);near(T2.theta_rad,a.theta_rad*2);
  near(a.gammaMax,a.theta_rad*(shaft.d_mm/2)/shaft.L_mm);near(a.Zp_mm3,Math.PI*30**3/16);
  const v=torsionVariants(evaluateTorsion({...shaft,mode:'power',P_W:30000}));assert.equal(v.length,4);
  near(v[1][1].result.theta_rad,v[0][1].result.theta_rad*2);near(v[3][1].result.tauMax_MPa,v[0][1].result.tauMax_MPa/8);
});
test('hollow shaft: stress is linear in radius and lower stiffness than solid of same d',()=>{
  const solid=evaluateTorsion(shaft).result,hollow=evaluateTorsion({...shaft,di_mm:18}).result;
  near(hollow.tauInner_MPa/hollow.tauMax_MPa,18/30);assert.equal(solid.tauInner_MPa,0);
  assert.ok(hollow.tauMax_MPa>solid.tauMax_MPa&&hollow.theta_rad>solid.theta_rad);
  assert.ok(shearDistribution(evaluateTorsion({...shaft,di_mm:18})).includes('>rongga<'));
  assert.ok(!shearDistribution(evaluateTorsion(shaft)).includes('>rongga<'));
});
test('zero torque, elastic limit and invalid geometry are handled honestly',()=>{
  const zero=evaluateTorsion({...shaft,T_Nmm:0});assert.equal(zero.status,'valid');assert.equal(zero.result.theta_rad,0);assert.equal(zero.result.tauMax_MPa,0);
  const yieldLimit=evaluateTorsion({...shaft,Sy_MPa:Math.sqrt(3)*evaluateTorsion(shaft).result.tauMax_MPa});assert.equal(yieldLimit.status,'outside');assert.equal(yieldLimit.result.theta_rad,null);
  assert.ok(shaftDiagram(yieldLimit).includes('θ tidak dihitung'));assert.equal(torsionSteps(yieldLimit,{},{}).length,7);
  const strain=evaluateTorsion({...shaft,E_MPa:2000,Sy_MPa:1e6});assert.equal(strain.status,'outside');assert.match(strain.reason,/regangan geser/i);
  for(const input of [{...shaft,di_mm:30},{...shaft,di_mm:-1},{...shaft,d_mm:0},{...shaft,L_mm:0},{...shaft,nu:.5},{...shaft,nu:-.1},{...shaft,T_Nmm:-5},{...shaft,E_MPa:0},{...shaft,d_mm:1e-80}]){
    const e=evaluateTorsion(input);assert.equal(e.status,'invalid');assert.equal(e.result,null);
  }
});
test('equivalent units keep physical results',()=>{
  const e=evaluateTorsion(canonicalTorsion({mode:'torque',T_Nmm:'0,2',P_W:'30',n_rpm:'1450',d_mm:'0,03',di_mm:'0',L_mm:'0,6',E_MPa:'200',nu:'0,3',Sy_MPa:'250'},{T_Nmm:'kN·m',P_W:'kW',n_rpm:'rpm',d_mm:'m',di_mm:'m',L_mm:'m',E_MPa:'GPa',nu:'tanpa satuan',Sy_MPa:'MPa'})).result;
  near(e.theta_rad,evaluateTorsion(shaft).result.theta_rad);
  near(convertTorsionUnit('T_Nmm','200','N·m','N·mm'),200000);near(convertTorsionUnit('P_W','30','kW','W'),30000);
  assert.equal(convertTorsionUnit('T_Nmm','x','N·m','N·mm'),null);
});
test('visual twist is magnified, capped and zero when unloaded',()=>{
  const e=evaluateTorsion(shaft);near(visualTwist(e,20),e.result.theta_rad*20);
  assert.ok(Math.abs(visualTwist(e,1e6)-75*Math.PI/180)<1e-12);
  assert.equal(visualTwist(evaluateTorsion({...shaft,T_Nmm:0}),40),0);
  assert.ok(shaftDiagram(e,20).includes('diperbesar 20×'));
});
test('both independent exercises have expected answers and grading tolerance',()=>{
  const expected={mesin:{first:16.099586697375603,second:.4796679522255845},kapal:{first:29.345768821323258,second:1.6393539825277126}};
  for(const context of ['mesin','kapal']){
    const t=torsionTargets(context),x=expected[context];near(t.first,x.first);near(t.second,x.second);
    assert.equal(evaluateTorsion(torsionExercises[context]).status,'valid');
    const g=gradeTorsion(context,{first:String(x.first).replace('.',','),second:x.second});assert.ok(g.first.correct&&g.second.correct);
    assert.ok(!gradeTorsion(context,{first:x.first*1.03,second:''}).first.correct);assert.ok(!gradeTorsion(context,{first:x.first,second:''}).second.valid);
  }
  assert.equal(torsionExercises.mesin.mode,'power');assert.ok(torsionExercises.kapal.di_mm>0);
});
test('solution steps follow the active mode and inputs',()=>{
  const units={T_Nmm:'N·m',P_W:'kW',n_rpm:'rpm',d_mm:'mm',di_mm:'mm',L_mm:'mm',E_MPa:'GPa',nu:'tanpa satuan',Sy_MPa:'MPa'};
  const raw={mode:'power',T_Nmm:'200',P_W:'30',n_rpm:'1450',d_mm:'30',di_mm:'0',L_mm:'600',E_MPa:'200',nu:'0.3',Sy_MPa:'250'};
  const p=torsionSteps(evaluateTorsion(canonicalTorsion(raw,units)),raw,units);
  assert.match(p[1][0],/daya/i);assert.ok(p[0][1].includes('Daya P'));assert.ok(!p[0][1].includes('Torsi T:'));
  const tRaw={...raw,mode:'torque'},t=torsionSteps(evaluateTorsion(canonicalTorsion(tRaw,units)),tRaw,units);
  assert.ok(t[0][1].includes('Torsi T:'));assert.ok(!t[0][1].includes('Daya P'));assert.ok(t[4][1].includes('37,72562'));
});
