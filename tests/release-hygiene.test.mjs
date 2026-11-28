import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {bindFELink} from '../web/fe-link.js';

test('analytic code never imports FE modules statically; app.js loads FE views per route',async()=>{
  const files=(await readdir('web')).filter(f=>f.endsWith('.js'));
  for(const f of files){
    const s=await readFile(`web/${f}`,'utf8');
    assert.ok(!/^\s*import\s[^;]*from\s*['"]\.\/fe\//m.test(s),`web/${f} must not statically import ./fe/ (load it with import())`);
  }
  const app=await readFile('web/app.js','utf8');
  assert.match(app,/async function renderFE\(\)/);assert.match(app,/import\(path\),import\('\.\/fe\/learning\.js'\)/);
  for(const v of ['plate-view','combined-view','torsion-view','axisymmetric-view','bending-view','family-view'])assert.ok(app.includes(`./fe/${v}.js`),`${v} must be reachable from renderFE`);
});

function fakeLink(href='/modul/05/fe/mesin/'){
  const handlers={};
  return {href,handlers,addEventListener:(type,fn)=>{(handlers[type]||=[]).push(fn);}};
}
const click=(over={})=>({defaultPrevented:false,button:0,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,prevented:false,preventDefault(){this.prevented=true;},...over});

test('FE link waits for the transfer, then navigates; invalid input shows the message instead',async()=>{
  const assigned=[];globalThis.location={assign:u=>assigned.push(u)};
  const okLink=fakeLink();let warmed=0;bindFELink(okLink,async()=>true,()=>assert.fail('should not be invalid'),()=>{warmed++;return Promise.resolve();});
  okLink.handlers.pointerenter[0]();okLink.handlers.focus[0]();assert.equal(warmed,1,'preload runs once');
  const e=click();await okLink.handlers.click[0](e);assert.ok(e.prevented);assert.deepEqual(assigned,['/modul/05/fe/mesin/']);
  const bad=fakeLink();let shown=0;bindFELink(bad,async()=>false,()=>{shown++;});
  const e2=click();await bad.handlers.click[0](e2);assert.ok(e2.prevented);assert.equal(shown,1);assert.equal(assigned.length,1,'no navigation on invalid input');
  const broken=fakeLink();let shown2=0;bindFELink(broken,async()=>{throw new Error('offline');},()=>{shown2++;});
  await broken.handlers.click[0](click());assert.equal(shown2,1,'a failed module load is treated as not transferable');
  delete globalThis.location;
});

test('modified clicks keep native new-tab behaviour',async()=>{
  globalThis.location={assign:()=>assert.fail('must not navigate')};
  for(const over of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{button:1}]){
    const link=fakeLink();let called=0;bindFELink(link,async()=>{called++;return true;},()=>{});
    const e=click(over);await link.handlers.click[0](e);assert.equal(e.prevented,false);assert.equal(called,0);
  }
  bindFELink(null,async()=>true,()=>{});
  delete globalThis.location;
});

test('release manifest is machine-independent; timings live in an ignored local file',async()=>{
  const manifest=await readFile('docs/fe/f8/release_manifest.json','utf8'),ignore=await readFile('.gitignore','utf8');
  assert.ok(!/elapsedMs/.test(manifest),'no timings in the committed manifest');
  assert.match(ignore,/^\.cache\/$/m);
  const m=JSON.parse(manifest);assert.equal(m.cases.length,20);assert.ok(m.cases.every(c=>c.compactJsonBytes>0&&c.jsonBytes>0));
});

test('lecturer review sheet is generated and covers every case',async()=>{
  const s=await readFile('docs/tinjauan_dosen.md','utf8');
  assert.match(s,/Dihasilkan otomatis oleh `node scripts\/review-sheet\.mjs`/);
  for(const id of ['01','02','03','04','05','06','07','08','09','10'])for(const c of ['M','K'])assert.match(s,new RegExp(`\\| ${id}-${c} \\|`),`${id}-${c} missing`);
  assert.ok((s.match(/☐ Setuju ☐ Perlu revisi/g)||[]).length>=70);
  assert.ok(!/NaN|Infinity|undefined/.test(s));
});
