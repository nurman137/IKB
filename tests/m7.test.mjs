import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {createProgressStore,progressLabel,PROGRESS_KEY} from '../web/progress.js';
import {glossary} from '../web/glossary.js';
import {modules,parseRoute} from '../web/model.js';

const memory=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),dump:()=>m};};

test('progress store records attempts per module and context, keeping the best exercise score',()=>{
  const s=createProgressStore(memory());assert.ok(s.available());
  assert.equal(progressLabel(s.module('05')),'Belum dibuka');
  s.record('05','mesin','visit');assert.equal(progressLabel(s.module('05')),'Sudah dibuka');
  s.record('05','mesin','prediction',false);s.record('05','mesin','exercise',1);
  let m=s.module('05');assert.ok(m.predictionAnswered);assert.ok(!m.predictionCorrect);assert.equal(m.exerciseBest,1);assert.ok(!m.complete);
  assert.match(progressLabel(m),/latihan 1\/2/);
  s.record('05','mesin','prediction',true);s.record('05','mesin','prediction',false);s.record('05','kapal','exercise',2);s.record('05','mesin','exercise',0);
  m=s.module('05');assert.ok(m.predictionCorrect,'a correct prediction is not erased by a later wrong one');assert.equal(m.exerciseBest,2);assert.ok(!m.complete,'prediction and exercise must be in the same context');
  s.record('05','kapal','prediction',false);m=s.module('05');assert.ok(m.complete);assert.equal(progressLabel(m),'Tuntas dipelajari');
  assert.equal(m.contexts.find(c=>c.context==='mesin').exerciseBest,1);
  s.record('05','kapal','reflection',true);assert.ok(s.module('05').reflection);
});
test('progress store rejects unknown modules/contexts/kinds and clamps scores',()=>{
  const s=createProgressStore(memory());
  assert.equal(s.record('11','mesin','visit'),false);assert.equal(s.record('05','other','visit'),false);assert.equal(s.record('05','mesin','grade',100),false);
  s.record('01','kapal','exercise',7);assert.equal(s.module('01').exerciseBest,2);
  s.record('01','kapal','exercise',-3);assert.equal(s.module('01').exerciseBest,2);
});
test('progress store survives corrupt data and unavailable storage',()=>{
  const mem=memory();mem.setItem(PROGRESS_KEY,'{not json');const s=createProgressStore(mem);
  assert.equal(s.module('02').visited,false);assert.ok(s.record('02','mesin','visit'));assert.ok(s.module('02').visited);
  mem.setItem(PROGRESS_KEY,JSON.stringify({version:99,items:{'02-mesin':{visited:true}}}));assert.equal(s.module('02').visited,false);
  const broken={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');},removeItem(){throw new Error('blocked');}};
  const b=createProgressStore(broken);assert.equal(b.available(),false);assert.equal(b.record('02','mesin','visit'),false);assert.equal(b.module('02').visited,false);assert.equal(b.clear(),false);
  assert.equal(createProgressStore(null).available(),false);
  assert.ok(s.clear());assert.equal(mem.getItem(PROGRESS_KEY),null);
});
test('progress stores no free text, only attempt markers',()=>{
  const mem=memory(),s=createProgressStore(mem);s.record('03','mesin','reflection','jawaban pribadi mahasiswa');
  assert.ok(!mem.getItem(PROGRESS_KEY).includes('jawaban'));
});
test('glossary entries are complete, unique and link to existing modules',()=>{
  const ids=new Set(modules.map(m=>m.id)),terms=new Set();
  assert.ok(glossary.length>=30);
  for(const [term,en,sym,unit,def,mods] of glossary){
    assert.ok(term&&en&&sym&&unit&&def.length>20,term);assert.ok(!terms.has(term),`duplicate ${term}`);terms.add(term);
    assert.ok(mods.length>0&&mods.every(id=>ids.has(id)),term);
  }
  for(const id of ids)assert.ok(glossary.some(g=>g[5].includes(id)),`module ${id} has no glossary term`);
});
test('progress and glossary pages are routed and built as reloadable files',async()=>{
  assert.deepEqual(parseRoute('/progres/'),{type:'progress'});assert.deepEqual(parseRoute('/IKB/glosarium/index.html','/IKB/'),{type:'glossary'});
  for(const r of ['progres','glosarium']){await access(`dist/${r}/index.html`);const html=await readFile(`dist/${r}/index.html`,'utf8');assert.ok(html.includes('../assets/app.js'));assert.ok(html.includes('m7.css'));}
});
