import test from 'node:test';
import assert from 'node:assert/strict';
import {beamDomain} from '../web/beam-domain.js';
import {evaluateBending} from '../web/bending-model.js';
import {evaluateSection} from '../web/section-model.js';
import {evaluateBeamDesign} from '../web/design-model.js';
import {evaluateThermal} from '../web/thermal-model.js';
import {pipeDiagram} from '../web/thermal-visuals.js';
import {bendingContent} from '../web/bending-content.js';
import {sectionConfig} from '../web/section-lab.js';
import {designConfig} from '../web/design-lab.js';
const beam={P_N:8000,L_mm:1500,b_mm:60,h_mm:120,E_MPa:100,Sy_MPa:250};
test('large strain/deflection counterexample is outside domain in beam, sections and design',()=>{
 const b=evaluateBending(beam);assert.equal(b.status,'outside');assert.equal(b.result.deltaMax_mm,null);assert.equal(b.checks.smallStrain,false);assert.equal(b.checks.smallDeflection,false);assert.match(b.reason,/1%/);assert.match(b.reason,/2%/);
 const s=evaluateSection({...beam,shape:'rect'});assert.equal(s.status,'outside');assert.equal(s.result.orientation_A.deltaMax_mm,null);assert.equal(s.result.orientation_B.deltaMax_mm,null);
 const d=evaluateBeamDesign({...beam,b_A_mm:60,h_A_mm:120,b_B_mm:120,h_B_mm:60,rho_kg_m3:7850,n_required:2,deflection_limit_mm:1000});assert.equal(d.status,'outside');assert.equal(d.result.decision.choice,null);for(const k of ['alternative_A','alternative_B']){assert.equal(d.result[k].allMet,false);assert.equal(d.result[k].stiffness,null);assert.equal(d.result[k].deltaMax_mm,null);}
});
test('teaching cutoff boundaries are inclusive and independent; zero-load still works',()=>{
 assert.ok(beamDomain(1,100,2,100).smallStrain);assert.ok(beamDomain(1,100,2,100).smallDeflection);
 assert.equal(beamDomain(1.001,100,1,100).smallStrain,false);assert.equal(beamDomain(.5,100,2.001,100).smallDeflection,false);
 assert.equal(evaluateBending({...beam,P_N:0}).status,'valid');assert.equal(evaluateBending({...beam,P_N:0}).result.deltaMax_mm,0);
 const E=beam.P_N*beam.L_mm**2/(48*(beam.b_mm*beam.h_mm**3/12)*.02);
 assert.equal(evaluateBending({...beam,E_MPa:E}).status,'valid');assert.equal(evaluateBending({...beam,E_MPa:E*.99}).status,'outside');
});
test('thermal force caption identifies support-on-pipe actions for heating and cooling',()=>{
 const input={d_mm:40,di_mm:32,L_mm:2000,deltaT_C:40,E_MPa:200000,alpha_per_C:12e-6,Sy_MPa:250,support:'fixed'};
 for(const deltaT_C of [40,-40]){const e=evaluateThermal({...input,deltaT_C}),html=pipeDiagram(e);assert.match(html,/gaya tumpuan pada pipa/);assert.doesNotMatch(html,/Panah hijau: gaya pipa pada tumpuan/);assert.match(html,/sama besar dan berlawanan arah/);}
});
test('affected lab content exposes the pedagogical limits, not design-code criteria',()=>{
 for(const c of [bendingContent,sectionConfig.content,designConfig('kapal').content]){assert.match(c.limitation,/1%/);assert.match(c.limitation,/2%/);assert.match(c.limitation,/bukan kriteria kode desain/);}
});
