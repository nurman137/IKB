import{readFile,writeFile,mkdir,readdir,stat}from'node:fs/promises';import{createHash}from'node:crypto';
import{familyPreset,prepareFamily,summarizeFamilyRun}from'../web/fe/beam-family.js';import{axisPreset,prepareAxis,summarizeAxis}from'../web/fe/axisymmetric-case.js';import{torPreset,prepareTor,summarizeTor}from'../web/fe/torsion-case.js';import{combPreset,prepareComb,solveCombined}from'../web/fe/combined-case.js';import{platePreset,preparePlate,summarizePlate}from'../web/fe/plate-case.js';import{makeBendingModel,summarizeBending}from'../web/fe/bending-case.js';import{solveFE}from'../web/fe/solver.js';import{makeExport,makeCompactExport,exportCSV,FE_RELEASE}from'../web/fe/learning.js';import{parseRoute}from'../web/model.js';
const ds=JSON.parse(await readFile('docs/m0/reference_cases.json')),rows=[],timings={};
// Exports carry solver timing (diagnostics.elapsedMs); count bytes with it zeroed so the committed manifest is reproducible.
const stableBytes=v=>Buffer.byteLength(JSON.stringify(v,(k,x)=>k==='elapsedMs'?0:x));
for(let num=1;num<=10;num++)for(const context of ['mesin','kapal']){const id=String(num).padStart(2,'0'),caseId=`${id}-${context==='mesin'?'M':'K'}`,t=performance.now();let input,runs,models=[],results=[],summaries=[];
 if(id==='09'){input=combPreset(context,ds);const g=prepareComb(input),r=await solveCombined(g);models=[g.beam,g.tor];results=[r.beam,r.tor];summaries=[r.summary];}
 else{if(id==='04'){input=platePreset(context,ds);runs=preparePlate(input).runs;}
 else if(id==='05'||id==='10'&&context==='mesin'){input=torPreset(id,context,ds);runs=prepareTor(id,input).runs;}
 else if(['02','03','08'].includes(id)){input=axisPreset(id,context,ds);runs=(id==='08'?['free','fixed']:['free']).map(s=>prepareAxis(id,input,'coarse',s));}
 else if(id==='06'){input={...ds.cases.find(c=>c.id===caseId).input,load:'point',nu:.3,stripFactor:.5};runs=[makeBendingModel(input,'BEAM2','coarse')];}
 else{input=familyPreset(id,context,ds);runs=prepareFamily(id,input).runs;}
 for(const a of runs){if(a.status!=='ready')throw new Error(caseId+' '+JSON.stringify(a));const r=await solveFE(a.model);models.push(a.model);results.push(r);summaries.push(id==='04'?summarizePlate(a,r):id==='05'||id==='10'&&context==='mesin'?summarizeTor(a,r):['02','03','08'].includes(id)?summarizeAxis(a,r):id==='06'?summarizeBending(a,r):summarizeFamilyRun(a,r,id));}}
 const data={id,context,input,models,results,summaries},e=makeExport(data),json=JSON.stringify(e),csv=exportCSV(data),compact=makeCompactExport(data),compactJson=JSON.stringify(compact);
 // Compact export must carry the identical input and summaries as the full export, only shorter raw arrays.
 if(compact.exportVariant!=='ringkas'||JSON.stringify(compact.summaries)!==JSON.stringify(e.summaries)||JSON.stringify(compact.input)!==JSON.stringify(e.input)||/NaN|Infinity/.test(compactJson)||compactJson.length>json.length+1024)throw new Error('Compact export '+caseId); // small cases omit nothing; only the notice/metadata may add bytes
 if(parseRoute(`/modul/${id}/fe/${context}/`).type!=='fe'||!csv.includes(caseId)||json.includes(':null')&&e.omittedNonFinite.some(k=>!k.startsWith('.input')))throw new Error('Release export/route '+caseId);
 timings[caseId]=performance.now()-t;
 rows.push({caseId,kernels:models.map(m=>m.kernel),status:summaries.map(s=>s.status),nodes:models.map(m=>m.nodes.length),elements:models.map(m=>m.elements.length),jsonBytes:stableBytes(e),compactJsonBytes:stableBytes(compact),csvBytes:Buffer.byteLength(csv)});
}
async function files(p){const out=[];for(const n of await readdir(p)){const f=p+'/'+n;if((await stat(f)).isDirectory())out.push(...await files(f));else out.push(f);}return out;}
const assets=await files('dist/assets'),assetBytes=(await Promise.all(assets.map(p=>stat(p)))).reduce((s,x)=>s+x.size,0);if(assetBytes>=600*1024)throw new Error('Asset budget');const hashes={};for(const p of ['docs/fe/f6/reference_scipy.py','docs/fe/f6/reference_scipy.json'])hashes[p]=createHash('sha256').update(await readFile(p)).digest('hex');await mkdir('docs/fe/f8',{recursive:true});await writeFile('docs/fe/f8/release_manifest.json',JSON.stringify({release:FE_RELEASE,publicDeployment:false,routes:54,htmlIncluding404:55,assetBytes,referenceHashes:hashes,cases:rows},null,2)+'\n');// Timings depend on the machine, so they are kept out of the committed manifest (which stays reproducible for CI).
await mkdir('.cache',{recursive:true});await writeFile('.cache/fe-audit-timing.json',JSON.stringify({measuredAt:new Date().toISOString(),node:process.version,elapsedMs:timings},null,2)+'\n');
console.log(JSON.stringify({cases:rows.length,submodels:rows.reduce((n,r)=>n+r.kernels.length,0),assetBytes,maxElapsedMs:Math.max(...Object.values(timings))}));
