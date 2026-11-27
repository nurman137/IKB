// M8 release gate: every numerical output of all 20 M0 cases must be reproduced by the site's own models.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {evaluateFoundation} from '../web/foundation-model.js';
import {evaluateAxial} from '../web/axial-model.js';
import {evaluateTorsion} from '../web/torsion-model.js';
import {evaluateBending} from '../web/bending-model.js';
import {evaluateSection} from '../web/section-model.js';
import {evaluateThermal} from '../web/thermal-model.js';
import {evaluateCombined} from '../web/combined-model.js';
import {evaluateShaftDesign,evaluateBeamDesign} from '../web/design-model.js';
import {modules} from '../web/model.js';

const tol=(a,b)=>Math.abs(a-b)<=1e-9+1e-6*Math.abs(b);
const evaluators={
  '01':i=>evaluateFoundation('01',i),'02':evaluateAxial,'03':i=>evaluateFoundation('03',i),'04':i=>evaluateFoundation('04',i),
  '05':evaluateTorsion,'06':evaluateBending,'07':evaluateSection,'08':evaluateThermal,'09':evaluateCombined,
  '10':i=>i.T_Nmm!==undefined?evaluateShaftDesign(i):evaluateBeamDesign({rho_kg_m3:7850,...Object.fromEntries(Object.entries(i).filter(([k])=>k!=='deflection_limit_basis'))}),
};
function compare(expected,actual,path,out){
  for(const [k,v] of Object.entries(expected)){
    if(v&&typeof v==='object')compare(v,actual?.[k],`${path}.${k}`,out);
    else out.push({path:`${path}.${k}`,ok:typeof actual?.[k]==='number'&&tol(actual[k],v),actual:actual?.[k],expected:v});
  }
}

test('release gate: all 20 M0 cases and all 133 numerical outputs are reproduced within tolerance',async()=>{
  const {cases}=JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));
  assert.equal(cases.length,20);
  const results=[];
  for(const c of cases){
    const e=evaluators[c.id.slice(0,2)](c.input);
    assert.equal(e.status,'valid',`${c.id} must evaluate inside the model domain`);
    compare(c.expected,e.result,c.id,results);
  }
  const failed=results.filter(r=>!r.ok);
  assert.deepEqual(failed,[],'every output must match');
  assert.equal(results.length,133);
});
test('release gate: every module has one Machine and one Ship case and an active page',async()=>{
  const {cases}=JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));
  for(const m of modules){assert.ok(cases.some(c=>c.id===`${m.id}-M`));assert.ok(cases.some(c=>c.id===`${m.id}-K`));}
  const app=await readFile('web/app.js','utf8');
  assert.match(app,/const activeModules=\['01','02','03','04','05','06','07','08','09','10'\]/);
});
test('release gate: build output is static, self-contained and small',async()=>{
  const files=[];const walk=async d=>{for(const n of await readdir(d)){const p=`${d}/${n}`;(await stat(p)).isDirectory()?await walk(p):files.push(p);}};await walk('dist');
  const html=files.filter(f=>f.endsWith('.html')&&!f.startsWith('dist/assets/'));assert.equal(html.length,51,'50 routes + 404');
  let assets=0;for(const f of files.filter(f=>f.startsWith('dist/assets/')))assets+=(await stat(f)).size;
  assert.ok(assets<600*1024,`assets ${assets} bytes should stay below 600 KiB uncompressed`);
  for(const f of files.filter(f=>/\.(js|css|html)$/.test(f))){
    const s=await readFile(f,'utf8');
    assert.ok(!/https?:\/\/(?!ocw\.mit\.edu|wp\.optics\.arizona\.edu|www\.w3\.org)[^"'\s)]*\.(js|css)\b/.test(s),`${f} must not load remote scripts or styles`);
    assert.ok(!/console\.log\(/.test(s)||f.includes('serve'),`${f} contains console.log`);
  }
});
test('release gate: modules cite specific documents, not only a general course page',async()=>{
  const {readdir}=await import('node:fs/promises');
  for(const f of (await readdir('web')).filter(f=>f.endsWith('.js'))){
    const s=await readFile(`web/${f}`,'utf8');
    assert.ok(!/['"]https:\/\/ocw\.mit\.edu\/courses\/2-001-mechanics-materials-i-fall-2006\/['"]/.test(s),`${f} still cites only the general course page`);
  }
});
