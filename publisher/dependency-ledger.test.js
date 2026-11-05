import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateDependencyAssessments,dependencyLedgerPage} from './dependency-ledger.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const config=read('knowledge/dependency-assessments.json'),registry=read('knowledge/entities.json');
const bundle={state:read('issues/0039/state.json'),claims:read('issues/0039/claims.json'),evidence:read('issues/0039/evidence.json')};
test('first real assessments bind exactly to original issue, claims and sources',()=>{
 assert.equal(validateDependencyAssessments(config,registry,[bundle]),true);
 assert.deepEqual(config.records.map(x=>x.entity_slug),['uk-critical-minerals-resilience','maersk-container-freight-pricing']);
 assert.deepEqual(config.records.map(x=>x.classification),['knowledge_update','knowledge_update']);
});
test('unknown horizon stays null; an estimated horizon must appear in primary evidence',()=>{
 assert.equal(config.records[1].substitutability.status,'unknown');
 assert.equal(config.records[1].substitutability.min_years,null);
 assert.equal(config.records[0].substitutability.min_years,10);
 assert.equal(config.records[0].substitutability.max_years,15);
 const unsupported=JSON.parse(JSON.stringify(config));unsupported.records[0].substitutability.max_years=99;
 assert.throws(()=>validateDependencyAssessments(unsupported,registry,[bundle]),/Horizon absent/);
 const invented=JSON.parse(JSON.stringify(config));invented.records[1].substitutability.min_years=3;
 assert.throws(()=>validateDependencyAssessments(invented,registry,[bundle]),/Invented horizon/);
});
test('fail closed for unlinked claims, sources, status changes and missing translations',()=>{
 const mutate=()=>JSON.parse(JSON.stringify(config));
 let x=mutate();x.records[0].source_ids=['WSB-0039-SRC-03'];assert.throws(()=>validateDependencyAssessments(x,registry,[bundle]),/Unlinked evidence/);
 x=mutate();x.records[0].claim_ids=['WSB-0039-CLM-02'];assert.throws(()=>validateDependencyAssessments(x,registry,[bundle]),/Claim does not support/);
 x=mutate();x.records[0].classification='confirmed_delta';assert.throws(()=>validateDependencyAssessments(x,registry,[bundle]),/Invalid entity/);
 x=mutate();x.records[0].leverage.text.ua='';assert.throws(()=>validateDependencyAssessments(x,registry,[bundle]),/Invalid leverage/);
 x=mutate();x.records.push(x.records[0]);assert.throws(()=>validateDependencyAssessments(x,registry,[bundle]),/Duplicate/);
});
test('bilingual ledger pages preserve source URLs and exact unknown fields',()=>{
 for(const lang of ['en','ua']){
  const html=dependencyLedgerPage({lang,records:config.records,registry,bundles:[bundle]});
  assert.match(html,/WSB-0039-SRC-01/);
  assert.match(html,/href="https:\/\/publications\.parliament\.uk\//);
  assert.match(html,/WSB-0039-CLM-02/);
  assert.match(html,/ledger\/dependencies\/uk-critical-minerals-resilience/);
  assert.match(html,lang==='en'?/UNKNOWN/:/НЕ ВСТАНОВЛЕНО/);
  const detail=dependencyLedgerPage({lang,records:config.records,registry,bundles:[bundle],slug:'maersk-container-freight-pricing'});
  assert.match(detail,/46%/);
  assert.doesNotMatch(detail,/WSB-0039-SRC-01/);
 }
});
