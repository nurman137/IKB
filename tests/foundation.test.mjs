import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {modules,parseRoute,readNumber,validateInputs} from '../web/model.js';

test('10 modules each have separate Machine and Ship calculation routes and reloadable files',async()=>{
  for(const m of modules){
    assert.deepEqual(parseRoute(`/modul/${m.id}/`),{type:'module',id:m.id});
    await access(`dist/modul/${m.id}/index.html`);
    for(const context of ['mesin','kapal']){
      assert.deepEqual(parseRoute(`/modul/${m.id}/perhitungan/${context}/`),{type:'calculation',id:m.id,context});
      const html=await readFile(`dist/modul/${m.id}/perhitungan/${context}/index.html`,'utf8');
      assert.ok(html.includes('../../../../assets/app.js'));
      assert.ok(!html.includes('__ASSETS__'));
    }
  }
  assert.equal(modules.length,10);
});
test('routing supports a static subdirectory and rejects malformed routes',()=>{
  assert.deepEqual(parseRoute('/IKB/modul/02/perhitungan/kapal/index.html','/IKB/'),{type:'calculation',id:'02',context:'kapal'});
  for(const path of ['/modul/99/','/modul/02/unknown/','/modul/02/perhitungan/other/'])assert.equal(parseRoute(path).type,'notfound');
});
test('Indonesian and decimal point inputs accepted; ambiguous or malicious values rejected',()=>{
  assert.equal(readNumber('1,5'),1.5);assert.equal(readNumber('-12.5'),-12.5);assert.equal(readNumber('0'),0);
  for(const value of ['', '1.000,5','1,000.5','Infinity','1e3','<script>',NaN])assert.ok(Number.isNaN(readNumber(value)));
});
test('all 20 M0 presets are valid and keep independent context values',async()=>{
  const {cases}=JSON.parse(await readFile('dist/assets/cases.json','utf8'));
  assert.equal(cases.length,20);
  for(const c of cases)assert.deepEqual(validateInputs(c.input),{},c.id);
  assert.equal(cases.find(c=>c.id==='02-M').input.F_N,20000);
  assert.equal(cases.find(c=>c.id==='02-K').input.F_N,30000);
});
test('geometry and material domain checks reject invalid values but preserve valid boundaries',()=>{
  assert.ok(validateInputs({d_mm:20,di_mm:20}).di_mm);
  assert.ok(validateInputs({L_mm:100,a_mm:101}).a_mm);
  assert.ok(validateInputs({L_mm:0}).L_mm);
  assert.ok(validateInputs({nu:.5}).nu);
  assert.ok(validateInputs({n_planes:1.5}).n_planes);
  assert.ok(validateInputs({n_required:1}).n_required);
  assert.deepEqual(validateInputs({d_mm:20,di_mm:0,L_mm:100,a_mm:100,nu:0,T_Nmm:0,deltaT_C:-30}),{});
});
