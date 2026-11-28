import os from 'node:os';
import {writeFile} from 'node:fs/promises';
import {solveFE} from '../web/fe/solver.js';
import {beamFixture,patchFixture} from '../web/fe/fixtures.js';
const results=[];
for(const [name,model] of [['beam-24',beamFixture(8)],['beam-384',beamFixture(128)],['patch-medium',patchFixture(16,16)],['patch-large',patchFixture(48,48)],['patch-near-element-cap',patchFixture(60,60)]]){
 const r=await solveFE(model);results.push({name,nodes:model.nodes.length,elements:model.elements.length,status:r.status,message:r.message,diagnostics:r.diagnostics});
}
const out={note:'Node execution benchmark, not browser/device performance or F8 qualification',node:process.version,platform:os.platform(),cpu:os.cpus()[0]?.model,results};
await writeFile('docs/fe/f1/benchmark.json',JSON.stringify(out,null,2)+'\n');process.stdout.write(JSON.stringify(out,null,2)+'\n');
