import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {makeExport,makeCompactExport,COMPACT_ARRAY_LIMIT} from '../web/fe/learning.js';
import {axisPreset,prepareAxis,summarizeAxis} from '../web/fe/axisymmetric-case.js';
import {makeBendingModel,summarizeBending} from '../web/fe/bending-case.js';
import {solveFE} from '../web/fe/solver.js';

const fixture=()=>({id:'04',context:'mesin',input:{F_N:10,d_mm:12},
  models:[{kernel:'PS2',nodes:Array.from({length:100},(_,i)=>[i,0]),elements:Array.from({length:40},()=>({type:'T6'})),constraints:[{node:0,dof:0,value:0}]}],
  results:[{status:'solved_unverified',displacements:new Float64Array(200).fill(.5),energy_Nmm:12.5,reactions:[1,2,3],diagnostics:{residual:1e-12}}],
  summaries:[{status:'solved_unverified',comparisons:[{name:'Force',value:10,reference:10,unit:'N'}],path:Array.from({length:5},(_,i)=>({x_mm:i,stress:[1,2,3]}))}]});

test('compact JSON keeps input, summaries and scalars, and replaces only long raw arrays with a length marker',()=>{
  const d=fixture(),full=makeExport(d),c=makeCompactExport(d);
  assert.equal(c.exportVariant,'ringkas');assert.equal(c.caseId,'04-M');assert.equal(c.status,'solved_unverified');
  assert.deepEqual(c.input,full.input);assert.deepEqual(c.summaries,full.summaries);
  assert.deepEqual(c.models[0].nodes,{_omitted:'array',length:100});assert.deepEqual(c.models[0].elements,{_omitted:'array',length:40});
  assert.deepEqual(c.results[0].displacements,{_omitted:'array',length:200});
  assert.deepEqual(c.models[0].constraints,full.models[0].constraints,'short arrays stay');
  assert.deepEqual(c.results[0].reactions,[1,2,3]);assert.equal(c.results[0].energy_Nmm,12.5);assert.equal(c.results[0].diagnostics.residual,1e-12);
  assert.deepEqual(c.omittedArrays.map(o=>o.path).sort(),['.models.0.elements','.models.0.nodes','.results.0.displacements']);
  assert.match(c.notice,/ringkas/);assert.match(c.notice,/Refleksi pribadi tidak diekspor/);
  assert.ok(JSON.stringify(c).length<JSON.stringify(full).length);
  // An array exactly at the limit is kept.
  const edge=fixture();edge.models[0].nodes=Array.from({length:COMPACT_ARRAY_LIMIT},(_,i)=>[i,0]);
  assert.equal(makeCompactExport(edge).models[0].nodes.length,COMPACT_ARRAY_LIMIT);
});

test('compact JSON also drops long strings such as the Worker inputSnapshot, keeping short text',()=>{
  const d=fixture();d.results[0].inputSnapshot=JSON.stringify({nodes:Array.from({length:500},(_,i)=>[i,i])});d.results[0].runId='run-7';
  const c=makeCompactExport(d);
  assert.deepEqual(c.results[0].inputSnapshot,{_omitted:'string',length:d.results[0].inputSnapshot.length});
  assert.equal(c.results[0].runId,'run-7');assert.equal(c.caseId,'04-M');
  assert.ok(c.omittedArrays.some(o=>o.path==='.results.0.inputSnapshot'&&o.kind==='string'));
  assert.equal(c.summaries[0].comparisons[0].name,'Force','summary text is never shortened');
});

test('compact JSON inherits the full export guards: incomplete, out-of-domain or nonfinite results are refused',()=>{
  for(const status of ['outside_model','cancelled','solver_failed']){const bad=fixture();bad.summaries[0].status=status;assert.throws(()=>makeCompactExport(bad));}
  const nonfinite=fixture();nonfinite.summaries[0].comparisons[0].value=Infinity;assert.throws(()=>makeCompactExport(nonfinite));
  const inactive=fixture();inactive.input.unused=NaN;assert.ok(makeCompactExport(inactive).omittedNonFinite.includes('.input.unused'));
});

test('compact JSON on real cases: small, identical summaries, no non-finite values (06-K beam and 08-M thermal AX2)',async()=>{
  const ds=JSON.parse(await readFile('docs/m0/reference_cases.json','utf8'));
  const beamInput={...ds.cases.find(c=>c.id==='06-K').input,load:'point',nu:.3,stripFactor:.5},beam=makeBendingModel(beamInput,'BEAM2','coarse'),beamResult=await solveFE(beam.model);
  const axisInput=axisPreset('08','mesin',ds),runs=['free','fixed'].map(s=>prepareAxis('08',axisInput,'coarse',s)),axisResults=[];for(const a of runs)axisResults.push(await solveFE(a.model));
  const cases=[{id:'06',context:'kapal',input:beamInput,models:[beam.model],results:[beamResult],summaries:[summarizeBending(beam,beamResult)]},
    {id:'08',context:'mesin',input:axisInput,models:runs.map(a=>a.model),results:axisResults,summaries:runs.map((a,i)=>summarizeAxis(a,axisResults[i]))}];
  for(const d of cases){
    const full=JSON.stringify(makeExport(d)),c=makeCompactExport(d),compact=JSON.stringify(c,null,2);
    // Compare the serialized form, i.e. exactly what is downloaded (JSON writes -0 as 0 in both files).
    assert.equal(JSON.stringify(c.summaries),JSON.stringify(JSON.parse(full).summaries));assert.ok(!/NaN|Infinity/.test(compact));
    assert.ok(Buffer.byteLength(compact)<80*1024,`${d.id} compact ${Buffer.byteLength(compact)} bytes should stay below 80 KiB`);
  }
  // The thermal case shrinks from megabytes to kilobytes.
  const thermalFull=JSON.stringify(makeExport(cases[1]),null,2).length,thermalCompact=JSON.stringify(makeCompactExport(cases[1]),null,2).length;
  assert.ok(thermalFull/thermalCompact>100,`expected >100× reduction, got ${(thermalFull/thermalCompact).toFixed(1)}×`);
});

test('UI offers the compact export with its own filename and locks it together with the other exports',async()=>{
  const s=await readFile('web/fe/learning.js','utf8');
  assert.match(s,/id="fe-export-json-compact"[^>]*disabled>Ekspor JSON ringkas</);
  assert.match(s,/id="fe-export-json"[^>]*disabled>Ekspor JSON lengkap</);
  assert.equal((s.match(/\['json','json-compact','csv'\]/g)||[]).length,2,'enable and invalidate both include the compact button');
  assert.match(s,/IKB-FE-\$\{id\}-\$\{context\}-ringkas\.json/);
});
