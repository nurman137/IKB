import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePlate,preparePlate,platePreset} from '../web/fe/plate-case.js';
import {syncScrollRegion,regionLabel} from '../web/scroll-regions.js';

const cases=async()=>JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));

test('plate validation says "not a number" for non-numeric input instead of an out-of-range message',async()=>{
  const ds=await cases(),p=platePreset('kapal',ds);
  assert.equal(validatePlate(p).status,'ready');
  for(const k of ['t_center_mm','F_N','E_MPa','d_mm']){
    const v=validatePlate({...p,[k]:NaN});assert.equal(v.status,'invalid_input');
    assert.match(v.errors[k],/angka yang sah/,`${k} should report an invalid number`);
  }
  assert.match(validatePlate({...p,E_MPa:2e6}).errors.E_MPa,/rentang latihan/);
  assert.ok(validatePlate({...p,t_center_mm:-1}).errors.t_center_mm);
  assert.match(validatePlate({...p,t_center_mm:.05}).errors.t_center_mm,/0,1–100\.000/);
  // Errors reach the view through preparePlate unchanged.
  assert.match(preparePlate({...p,nu:NaN}).errors.nu,/angka yang sah/);
});

test('plate inputs are linked to per-field error messages and marked aria-invalid',async()=>{
  const view=await readFile('web/fe/plate-view.js','utf8');
  assert.match(view,/aria-describedby="plate-error-\$\{k\}"/);
  assert.match(view,/id="plate-error-\$\{k\}" class="fe-field-error"/);
  assert.match(view,/setAttribute\('aria-invalid'/);
  assert.match(view,/function render\(g,items=\[\]\)\{markFieldErrors\(/,'every render path updates field errors');
});

function fakeTable({scrollWidth,clientWidth,attrs={},heading='Kasus aktif'}){
  const a=new Map(Object.entries(attrs));
  return {scrollWidth,clientWidth,dataset:{},
    hasAttribute:k=>a.has(k),getAttribute:k=>a.get(k)??null,setAttribute:(k,v)=>a.set(k,String(v)),removeAttribute:k=>a.delete(k),
    querySelector:()=>null,closest:()=>({querySelector:()=>({textContent:`  ${heading}\n `})}),attrs:a};
}

test('only overflowing table wrappers become labelled, focusable regions',()=>{
  const wide=fakeTable({scrollWidth:1323,clientWidth:646});
  assert.equal(syncScrollRegion(wide),true);
  assert.equal(wide.attrs.get('tabindex'),'0');assert.equal(wide.attrs.get('role'),'region');
  assert.equal(wide.attrs.get('aria-label'),'Tabel: Kasus aktif (dapat digeser)');
  const narrow=fakeTable({scrollWidth:646,clientWidth:646});
  assert.equal(syncScrollRegion(narrow),false);assert.ok(!narrow.attrs.has('tabindex'),'no extra Tab stop when nothing scrolls');
});

test('scroll regions undo only their own attributes when the table stops overflowing',()=>{
  const t=fakeTable({scrollWidth:900,clientWidth:400});syncScrollRegion(t);
  t.scrollWidth=400;syncScrollRegion(t);
  assert.ok(!t.attrs.has('tabindex')&&!t.attrs.has('role')&&!t.attrs.has('aria-label'));
  const authored=fakeTable({scrollWidth:900,clientWidth:400,attrs:{tabindex:'-1','aria-label':'Matriks Ke'}});
  syncScrollRegion(authored);assert.equal(authored.attrs.get('tabindex'),'-1');assert.equal(authored.attrs.get('aria-label'),'Matriks Ke');
  authored.scrollWidth=400;syncScrollRegion(authored);assert.equal(authored.attrs.get('tabindex'),'-1','author attributes are kept');
  assert.equal(regionLabel({querySelector:()=>null,closest:()=>null}),'Tabel (dapat digeser)');
});

test('the shell installs the scroll-region watcher and a visible focus style',async()=>{
  const app=await readFile('web/app.js','utf8'),css=await readFile('web/m7.css','utf8');
  assert.match(app,/import \{watchScrollRegions\} from '\.\/scroll-regions\.js';/);assert.match(app,/\nwatchScrollRegions\(\);/);
  assert.match(css,/\.table-scroll:focus-visible\{outline:3px solid/);
});
