import test from 'node:test';
import assert from 'node:assert/strict';
import {loadStructuralProfiles,validateStructuralProfiles,structuralProfilePage} from './structural-profiles.js';
import {loadEuvStudy} from './euv-atlas.js';
import fs from 'node:fs';
const registry=JSON.parse(fs.readFileSync('knowledge/entities.json','utf8'));
const config=loadStructuralProfiles(),study=loadEuvStudy();
test('structural profiles reference only named bilingual registered organizations and real study sources',()=>{
 assert.equal(validateStructuralProfiles(config,registry,study),true);
 assert.deepEqual(config.profiles.map(x=>x.slug),['zeiss-smt','asml']);
 assert.ok(!config.profiles.some(x=>x.node_id==='fab'));
 for(const p of config.profiles)for(const id of p.source_ids)assert.ok(study.sources.some(x=>x.id===id&&/^https:/.test(x.url)));
});
test('bilingual structural pages link to EUV study and cited sources, not fake dated issue history',()=>{
 for(const lang of ['en','ua'])for(const {slug} of config.profiles){
  const html=structuralProfilePage({lang,slug,config,registry,study});
  assert.match(html,/href="\/(en|ua)\/visualizations\/euv-optics\/"/);
  assert.match(html,/https:\/\/www\./);
  assert.match(html,/STRUCTURAL PROFILE|СТРУКТУРНИЙ ПРОФІЛЬ/);
  assert.doesNotMatch(html,/<div class="entity-event">/);
 }
});
test('missing evidence, translation, or spurious dated event cannot pass',()=>{
 const a=structuredClone(config);a.profiles[0].source_ids=['NOT-REAL'];assert.throws(()=>validateStructuralProfiles(a,registry,study));
 const b=structuredClone(registry);b.entities.find(x=>x.slug==='asml').labels.ua='';assert.throws(()=>validateStructuralProfiles(config,b,study));
 assert.equal(validateStructuralProfiles(config,registry,study,new Map([['asml',[{state:{date:'2026-11-05'}}]]])),true);
 assert.throws(()=>structuralProfilePage({lang:'zz',slug:'asml',config,registry,study}));
});

