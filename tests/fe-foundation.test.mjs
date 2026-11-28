import test from 'node:test';
import assert from 'node:assert/strict';
import {solveFE,F1_LIMITS} from '../web/fe/solver.js';
import {beamFixture,patchFixture} from '../web/fe/fixtures.js';
import {beamElement,triangleElement} from '../web/fe/elements.js';
import {FEController} from '../web/fe/controller.js';
import {meshSVG} from '../web/fe/viewer.js';
const near=(a,b,rel=1e-7,abs=1e-7)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=abs+rel*Math.abs(b),`${a} != ${b}`);
const successful=r=>assert.equal(r.status,'solved_unverified',r.message);
test('FE beam cantilever agrees with closed-form displacement, reaction, moment and energy',async()=>{
 const r=await solveFE(beamFixture(8));successful(r);near(r.displacements.at(-2),-.2);near(r.displacements.at(-1),-.0003);near(r.reactions[1],1000);near(r.reactions[2],1e6);near(r.diagnostics.energy_Nmm,100);near(r.diagnostics.energy_Nmm,r.diagnostics.halfWork_Nmm);assert.ok(r.diagnostics.residual<1e-8);assert.ok(r.diagnostics.symmetry<1e-12);near(r.diagnostics.balance.Mz,0,0,1e-3);
});
test('FE beam arbitrary rotations preserve local displacements and energy',async()=>{
 for(const angle of [0,Math.PI/2,37*Math.PI/180]){const r=await solveFE(beamFixture(4,{angle}));successful(r);const ux=r.displacements.at(-3),uy=r.displacements.at(-2);near(-Math.sin(angle)*ux+Math.cos(angle)*uy,-.2);near(Math.cos(angle)*ux+Math.sin(angle)*uy,0);near(r.diagnostics.energy_Nmm,100);}
});
test('FE beam consistent UDL includes nodal moments and gives exact tip response',async()=>{
 for(const n of [1,4,8]){const r=await solveFE(beamFixture(n,{udl:true}));successful(r);near(r.displacements.at(-2),-.075);near(r.reactions[1],1000);near(r.reactions[2],500000);near(r.diagnostics.balance.Fy,0,0,1e-5);}
});
test('FE nonzero Dirichlet correction and prescribed-DOF reactions match hand axial solution',async()=>{
 const m=beamFixture(1,{load:0});m.constraints.push({node:1,dof:0,value:.1});const r=await solveFE(m);successful(r);near(r.reactions[0],-200000);near(r.reactions[3],200000);near(r.diagnostics.energy_Nmm,10000);
 const p=patchFixture(4);const z=await solveFE(p);successful(z);p.nodes.forEach(([x,y],i)=>{near(z.displacements[2*i],.001*x+.0002*y);near(z.displacements[2*i+1],-.0003*y);});
});
test('FE irregular PS2 T3 patch reproduces constant strain, raw stress and strain energy',async()=>{
 for(const n of [2,4,8,16]){const m=patchFixture(n),r=await solveFE(m);successful(r);for(const f of r.fields){near(f.strain[0],.001);near(f.strain[1],-.0003);near(f.strain[2],.0002);near(f.stress[0],200);near(f.stress[1],0,0,1e-5);near(f.stress[2],200000/2.6*.0002);}
 near(r.diagnostics.energy_Nmm,10153.846153846154);near(r.diagnostics.halfWork_Nmm,r.diagnostics.energy_Nmm);assert.ok(r.diagnostics.residual<1e-8);}
});
test('FE dense reference and sparse PCG agree for independently loaded 2D solid',async()=>{
 const m=patchFixture(4);m.constraints=m.nodes.flatMap(([x,y],node)=>x===0?[{node,dof:0,value:0},{node,dof:1,value:0}]:[]);m.loads=[{node:24,dof:0,value:500},{node:19,dof:1,value:-100}];const a=await solveFE(m),b=await solveFE(m,{method:'dense'});successful(a);successful(b);a.displacements.forEach((x,i)=>near(x,b.displacements[i],1e-7,1e-10));near(a.diagnostics.energy_Nmm,b.diagnostics.energy_Nmm,1e-8);
});
test('FE free rigid modes rejected even with exactly zero load',async()=>{
 for(const m of [beamFixture(4,{load:0}),patchFixture(4)]){m.constraints=[];m.loads=[];assert.equal((await solveFE(m)).status,'underconstrained');m.constraints=[{node:0,dof:0,value:0},{node:0,dof:1,value:0}];assert.equal((await solveFE(m)).status,'underconstrained');}
});
test('FE invalid mesh diagnostics reject reversed, degenerate, duplicate and point-hinged elements',async()=>{
 for(const mutate of [m=>m.elements[0].nodes.reverse(),m=>m.nodes[1]=[1e-14,0],m=>m.elements.push({...m.elements[0]}),m=>m.nodes.push([999,999]),m=>m.nodes[1]=m.nodes[0]]){const m=patchFixture(2);mutate(m);assert.equal((await solveFE(m)).status,'invalid_mesh');}
 const m={kernel:'PS2',nodes:[[0,0],[1,0],[0,1],[-1,0],[0,-1]],elements:[{nodes:[0,1,2],E:1,nu:.3,t:1},{nodes:[0,3,4],E:1,nu:.3,t:1}],constraints:[]};assert.equal((await solveFE(m)).status,'invalid_mesh');
});
test('FE invalid material, loads, constraints and resource caps cannot return stale numerical fields',async()=>{
 for(const mutate of [m=>m.elements[0].E=0,m=>m.elements[0].I=NaN,m=>m.loads[0].value=Infinity,m=>m.constraints.push({...m.constraints[0]}),m=>m.loads.push({node:-1,dof:1,value:2})]){const m=beamFixture();mutate(m);const r=await solveFE(m);assert.equal(r.status,'invalid_input');assert.equal(r.displacements,undefined);}
 const m=beamFixture(1);m.elements=Array(F1_LIMITS.elements+1).fill(m.elements[0]);assert.equal((await solveFE(m)).status,'invalid_mesh');
 const p=patchFixture(1);p.elements[0].nu=.49;assert.equal((await solveFE(p)).status,'invalid_input');
});
test('FE zero load returns exact zero and load/units scaling is physical',async()=>{
 const zero=await solveFE(beamFixture(4,{load:0}));successful(zero);assert.ok([...zero.displacements].every(x=>x===0));assert.equal(zero.diagnostics.energy_Nmm,0);
 const a=await solveFE(beamFixture(4)),b=await solveFE(beamFixture(4,{load:-2000}));near(b.displacements.at(-2),a.displacements.at(-2)*2);near(b.diagnostics.energy_Nmm,a.diagnostics.energy_Nmm*4);
 const m=beamFixture(4);m.nodes=m.nodes.map(p=>p.map(x=>x/1000));m.elements=m.elements.map(e=>({...e,E:e.E*1e6,A:e.A*1e-6,I:e.I*1e-12}));const si=await solveFE(m);successful(si);near(si.displacements.at(-2)*1000,a.displacements.at(-2));near(si.diagnostics.energy_Nmm*1000,a.diagnostics.energy_Nmm);
});
test('FE cancellation and convergence failure do not expose partial result',async()=>{
 const early=await solveFE(beamFixture(),{cancel:()=>true});assert.equal(early.status,'cancelled');assert.equal(early.displacements,undefined);
 let stop=false;const m=patchFixture(30,30);const r=await solveFE(m,{cancel:()=>stop,progress:p=>{if(p.phase==='assembly')stop=true;}});assert.equal(r.status,'cancelled');
 const no=await solveFE(beamFixture(8),{method:'pcg',maxIterations:1});assert.equal(no.status,'solver_failed');assert.equal(no.displacements,undefined);
});
test('FE controller ignores stale responses, snapshots input and terminates cancellation',async()=>{
 const workers=[];const createWorker=()=>{const w={terminate(){this.terminated=true;},postMessage(data){this.data=data;}};workers.push(w);return w;};let events=0;const c=new FEController({createWorker,onProgress:()=>events++}),m=beamFixture();const p1=c.run(m);m.loads[1].value=123;assert.equal(workers[0].data.model.loads[1].value,-1000);const p2=c.run(m);assert.equal((await p1).status,'cancelled');assert.ok(workers[0].terminated);workers[0].onmessage({data:{kind:'progress',runId:'1'}});assert.equal(events,0);workers[1].onmessage({data:{kind:'result',runId:'1',result:{status:'wrong'}}});assert.ok(c.current);workers[1].onmessage({data:{kind:'result',runId:'2',result:{status:'solved_unverified'}}});assert.equal((await p2).status,'solved_unverified');assert.ok(workers[1].terminated);
});
test('FE minimal viewer distinguishes line mesh from actual solid and remains finite',async()=>{
 for(const m of [beamFixture(4),patchFixture(4)]){const r=await solveFE(m),html=meshSVG(m,r);assert.match(html,/role="img"/);assert.doesNotMatch(html,/NaN|Infinity|undefined/);assert.match(html,m.kernel==='PS2'?/polygon/:/polyline/);}
});
test('FE sparse solutions agree with independent NumPy quadrature/interpolation oracle',async()=>{
 const {readFile}=await import('node:fs/promises');const oracle=JSON.parse(await readFile('docs/fe/f1/reference_numpy.json','utf8'));
 for(const fixture of oracle.cases){const r=await solveFE(fixture.model);successful(r);r.displacements.forEach((v,i)=>near(v,fixture.displacements[i],1e-7,1e-10));r.reactions.forEach((v,i)=>near(v,fixture.reactions[i],1e-7,1e-5));near(r.diagnostics.energy_Nmm,fixture.energy_Nmm,1e-8);}
});
test('FE validated narrow-band frame cap succeeds; larger models are explicitly rejected',async()=>{
 const r=await solveFE(beamFixture(128));successful(r);near(r.displacements.at(-2),-.2,1e-6);assert.equal(r.diagnostics.solverMethod,'banded-cholesky');assert.equal((await solveFE(beamFixture(129))).status,'invalid_mesh');
});
test('FE malformed arrays and undefined element definitions are diagnosed without throwing',async()=>{
 for(const change of [{loads:{}},{constraints:{}},{elements:[null]},{loads:[null]},{constraints:[null]},{distributedLoads:[null]}]){const r=await solveFE({...beamFixture(1),...change});assert.ok(['invalid_input','invalid_mesh'].includes(r.status));assert.equal(r.displacements,undefined);}
});
