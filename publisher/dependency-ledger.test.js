import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateDependencyAssessments,dependencyLedgerPage} from './dependency-ledger.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const config=read('knowledge/dependency-assessments.json'),registry=read('knowledge/entities.json');
const bundle={state:read('issues/0039/state.json'),claims:read('issues/0039/claims.json'),evidence:read('issues/0039/evidence.json')};
const nextBundle={state:read('issues/0040/state.json'),claims:read('issues/0040/claims.json'),evidence:read('issues/0040/evidence.json')};
const currentBundle={state:read('issues/0041/state.json'),claims:read('issues/0041/claims.json'),evidence:read('issues/0041/evidence.json')};
const newestBundle={state:read('issues/0042/state.json'),claims:read('issues/0042/claims.json'),evidence:read('issues/0042/evidence.json')};
const todayBundle={state:read('issues/0043/state.json'),claims:read('issues/0043/claims.json'),evidence:read('issues/0043/evidence.json')};
const bundles=[bundle,nextBundle,currentBundle,newestBundle,todayBundle];
test('first real assessments bind exactly to original issue, claims and sources',()=>{
 assert.equal(validateDependencyAssessments(config,registry,bundles),true);
 assert.deepEqual(config.records.map(x=>x.entity_slug),['uk-critical-minerals-resilience','maersk-container-freight-pricing','global-oil-balance','refined-products-bottleneck','ai-gas-turbine-capacity-bottleneck','china-smart-port-technology-stack','black-sea-maritime-security-hub']);
 assert.deepEqual(config.records.map(x=>x.classification),Array(7).fill('knowledge_update'));
});
test('unknown horizon stays null; an estimated horizon must appear in primary evidence',()=>{
 assert.equal(config.records[1].substitutability.status,'unknown');
 assert.equal(config.records[1].substitutability.min_years,null);
 assert.equal(config.records[0].substitutability.min_years,10);
 assert.equal(config.records[0].substitutability.max_years,15);
 const unsupported=JSON.parse(JSON.stringify(config));unsupported.records[0].substitutability.max_years=99;
 assert.throws(()=>validateDependencyAssessments(unsupported,registry,bundles),/Horizon absent/);
 const invented=JSON.parse(JSON.stringify(config));invented.records[1].substitutability.min_years=3;
 assert.throws(()=>validateDependencyAssessments(invented,registry,bundles),/Invented horizon/);
});
test('fail closed for unlinked claims, sources, status changes and missing translations',()=>{
 const mutate=()=>JSON.parse(JSON.stringify(config));
 let x=mutate();x.records[0].source_ids=['WSB-0039-SRC-03'];assert.throws(()=>validateDependencyAssessments(x,registry,bundles),/Unlinked evidence/);
 x=mutate();x.records[0].claim_ids=['WSB-0039-CLM-02'];assert.throws(()=>validateDependencyAssessments(x,registry,bundles),/Claim does not support/);
 x=mutate();x.records[0].classification='confirmed_delta';assert.throws(()=>validateDependencyAssessments(x,registry,bundles),/Invalid entity/);
 x=mutate();x.records[0].leverage.text.ua='';assert.throws(()=>validateDependencyAssessments(x,registry,bundles),/Invalid leverage/);
 x=mutate();x.records.push(x.records[0]);assert.throws(()=>validateDependencyAssessments(x,registry,bundles),/Duplicate/);
});
test('bilingual ledger pages preserve source URLs and exact unknown fields',()=>{
 for(const lang of ['en','ua']){
  const html=dependencyLedgerPage({lang,records:config.records,registry,bundles});
  assert.match(html,/WSB-0039-SRC-01/);
  assert.match(html,/href="https:\/\/publications\.parliament\.uk\//);
  assert.match(html,/WSB-0039-CLM-02/);
  assert.match(html,/ledger\/dependencies\/uk-critical-minerals-resilience/);
  assert.match(html,lang==='en'?/UNKNOWN/:/НЕ ВСТАНОВЛЕНО/);
  const detail=dependencyLedgerPage({lang,records:config.records,registry,bundles,slug:'maersk-container-freight-pricing'});
  assert.match(detail,/46%/);
  assert.doesNotMatch(detail,/WSB-0039-SRC-01/);
 }
});

test('engraving appears on both localized critical-minerals detail pages, not unrelated pages',()=>{
 const engravings=read('visualizations/engravings/manifest.json').engravings;
 for(const lang of ['en','ua']){
  const detail=dependencyLedgerPage({lang,records:config.records,registry,bundles,slug:'uk-critical-minerals-resilience',engravings});
  assert.match(detail,/<figure class="engraving">/);
  assert.match(detail,/rare-earth-separation-study-01\.svg/);
  assert.match(detail,/rare-earth-separation-study-01-mobile\.svg/);
  assert.match(detail,/srcset="\/assets\/engravings\/rare-earth-separation-study-01-mobile.svg"/);
  assert.match(detail,new RegExp('/'+lang+'/engravings/rare-earth-separation-study-01/'));
  assert.match(detail,/width="960" height="640"/);
  assert.match(detail,lang==='ua'?/Паспорт гравюри/:/Engraving details/);
  const other=dependencyLedgerPage({lang,records:config.records,registry,bundles,slug:'maersk-container-freight-pricing',engravings});
  assert.doesNotMatch(other,/rare-earth-separation-study-01/);
  const index=dependencyLedgerPage({lang,records:config.records,registry,bundles,engravings});
  assert.doesNotMatch(index,/<figure class="engraving">/);
 }
});

test('2026-11-06 knowledge updates retain original October observations and refuse invented time horizons',()=>{
 const global=config.records.find(r=>r.id==='DPA-0040-GLOBAL-OIL-BALANCE');
 const products=config.records.find(r=>r.id==='DPA-0040-REFINED-PRODUCTS-GAP');
 assert.equal(validateDependencyAssessments(config,registry,bundles),true);
 for(const row of [global,products]){
  assert.equal(row.substitutability.status,'unknown');
  assert.equal(row.substitutability.min_years,null);
  assert.equal(row.substitutability.max_years,null);
  assert.equal(row.rent.status,'unknown');
  assert.equal(row.leverage.status,'unknown');
 }
 assert.deepEqual(products.claim_ids,['WSB-0040-CLM-02']);
 assert.deepEqual(products.source_ids,['WSB-0040-SRC-01','WSB-0040-SRC-02']);
 assert.match(products.flow.en,/just over half/);
 assert.doesNotMatch(products.flow.en,/55%|52%|51%/);
 for(const lang of ['en','ua']){
  const html=dependencyLedgerPage({lang,records:config.records,registry,bundles,slug:'refined-products-bottleneck'});
  assert.match(html,/WSB-0040-SRC-01/);
  assert.match(html,/WSB-0040-SRC-02/);
  assert.match(html,lang==='en'?/UNKNOWN/:/НЕ ВСТАНОВЛЕНО/);
 }
});


test('9 November turbine assessment retains non-comparable order and annual output measurements',()=>{
 const row=config.records.find(record=>record.id==='DPA-0041-AI-TURBINE-POWER');
 assert.ok(row);
 assert.equal(validateDependencyAssessments(config,registry,bundles),true);
 assert.equal(row.classification,'knowledge_update');
 assert.equal(row.substitutability.status,'unknown');
 assert.equal(row.substitutability.min_years,null);
 assert.equal(row.leverage.status,'unknown');
 assert.equal(row.rent.status,'unknown');
 assert.deepEqual(row.claim_ids,['WSB-0041-CLM-01']);
 assert.deepEqual(row.source_ids,['WSB-0041-SRC-01']);
 assert.match(row.flow.en,/100 GW/);
 assert.match(row.flow.en,/60–70 GW/);
 for(const lang of ['en','ua']){
  const html=dependencyLedgerPage({lang,records:config.records,registry,bundles,slug:row.entity_slug});
  assert.match(html,/WSB-0041-SRC-01/);
  assert.match(html,lang==='en'?/UNKNOWN/:/НЕ ВСТАНОВЛЕНО/);
 }
});

test('10 November port dependency is reported knowledge, not global technology control',()=>{
 const row=config.records.find(r=>r.id==='DPA-0042-PORT-TECH-STACK');
 assert.ok(row);
 assert.equal(validateDependencyAssessments(config,registry,bundles),true);
 assert.equal(row.flow_type,'data');
 assert.equal(row.substitutability.status,'unknown');
 assert.equal(row.substitutability.min_years,null);
 assert.equal(row.leverage.status,'unknown');
 assert.equal(row.rent.status,'unknown');
 assert.deepEqual(row.claim_ids,['WSB-0042-CLM-01','WSB-0042-CLM-02']);
 assert.deepEqual(row.source_ids,['WSB-0042-SRC-01','WSB-0042-SRC-04']);
 for(const lang of ['en','ua']){
  const html=dependencyLedgerPage({lang,records:config.records,registry,bundles,slug:row.entity_slug});
  assert.match(html,/WSB-0042-SRC-01/);
  assert.match(html,/WSB-0042-SRC-04/);
  assert.match(html,lang==='en'?/UNKNOWN/:/НЕ ВСТАНОВЛЕНО/);
 }
});

test('11 November security hub funding is knowledge, not commissioned protection',()=>{
 const row=config.records.find(r=>r.id==='DPA-0043-BLACK-SEA-MARITIME-SECURITY');
 assert.ok(row);assert.equal(row.classification,'knowledge_update');
 assert.equal(row.flow_type,'goods');
 assert.equal(row.substitutability.status,'unknown');
 assert.equal(row.leverage.status,'unknown');
 assert.equal(row.rent.status,'unknown');
 assert.equal(row.adaptation.status,'proposed');
 assert.deepEqual(row.claim_ids,['WSB-0043-CLM-01']);
 assert.deepEqual(row.source_ids,['WSB-0043-SRC-02','WSB-0043-SRC-03']);
 assert.equal(validateDependencyAssessments(config,registry,bundles),true);
 for(const lang of ['en','ua']){
  const html=dependencyLedgerPage({lang,records:config.records,registry,bundles,slug:row.entity_slug});
  assert.match(html,/2027/);
  assert.match(html,/WSB-0043-SRC-03/);
  assert.match(html,lang==='ua'?/НЕ ВСТАНОВЛЕНО/:/UNKNOWN/);
 }
});
