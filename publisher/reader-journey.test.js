import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readerIssueEntities,readerEntityVisualization,readerLedgerReturn} from './reader-journey.js';
const registry=JSON.parse(fs.readFileSync('knowledge/entities.json','utf8'));
const state=JSON.parse(fs.readFileSync('issues/0041/state.json','utf8'));
const data=JSON.parse(fs.readFileSync('knowledge/dependency-assessments.json','utf8'));
const slugs=new Set(data.records.map(x=>x.entity_slug));
const loc=JSON.parse(fs.readFileSync('issues/0041/locale/ua.json','utf8'));
test('WSB-0041 READ links observed objects to entity and only real Ledger assessments',()=>{
 for(const lang of ['en','ua']){
  const html=readerIssueEntities({lang,state,loc,registry,ledgerSlugs:slugs});
  assert.match(html,new RegExp('/'+lang+'/entity/ai-gas-turbine-capacity-bottleneck/'));
  assert.match(html,new RegExp('/'+lang+'/ledger/dependencies/ai-gas-turbine-capacity-bottleneck/'));
  assert.doesNotMatch(html,/ledger\/dependencies\/nextdc-uncontracted-data-centre-pauses\//);
  assert.doesNotMatch(html,/ledger\/dependencies\/hormuz-navigation-aid-damage-claim\//);
  assert.match(html,lang==='ua'?/СУТНОСТІ ВИПУСКУ/:/ENTITIES IN THIS EDITION/);
 }
});
test('existing source-backed oil study is traversable, but turbine study is never invented',()=>{
 for(const lang of ['en','ua']){
  const oil=readerEntityVisualization({lang,slug:'hormuz',registry});
  assert.match(oil,new RegExp('/'+lang+'/visualizations/oil-network/'));
  const none=readerEntityVisualization({lang,slug:'ai-gas-turbine-capacity-bottleneck',registry});
  assert.equal(none,'');
  const ledger=readerLedgerReturn({lang,slug:'refined-products-bottleneck',registry});
  assert.match(ledger,new RegExp('/'+lang+'/visualizations/0040/'));
  assert.match(ledger,new RegExp('/'+lang+'/entity/refined-products-bottleneck/'));
 }
});
test('unknown entity and invalid inputs fail closed',()=>{
 assert.throws(()=>readerLedgerReturn({lang:'en',slug:'invented',registry}),/Unknown entity/);
 assert.throws(()=>readerIssueEntities({lang:'ru',state,loc,registry}),/Invalid reader journey/);
 assert.throws(()=>readerIssueEntities({lang:'en',state:{date:state.date},loc,registry}),/Invalid issue objects/);
});
test('reading navigation is integrated before source citations',()=>{
 const build=fs.readFileSync('publisher/build.js','utf8');
 const ledger=fs.readFileSync('publisher/dependency-ledger.js','utf8');
 assert.match(build,/\$\{readerIssueEntities\(\{lang,state,loc,registry,ledgerSlugs\}\)\}\$\{sourcesBlock/);
 assert.match(build,/readerEntityVisualization\(\{lang,slug:id,registry\}\)/);
 assert.match(ledger,/readerLedgerReturn\(\{lang,slug,registry\}\)/);
});
