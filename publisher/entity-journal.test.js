import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {entityAtlasBody,entityBiographyBody} from './entity-journal.js';
import {entityStyles} from './entity-journal-css.js';

const registry={entities:[{id:'ENT-1',slug:'hormuz',type:'chokepoint',labels:{en:'Strait of Hormuz',ua:'Ормузька протока'}},{id:'ENT-2',slug:'ai-gas-turbine-capacity-bottleneck',type:'system_constraint',labels:{en:'Gas turbine supply',ua:'Постачання газових турбін'}}]};
const event=(id,date,status='evidence_update')=>({state:{date,issue_id:'WSB-TEST'},object:{id,current_state:'persistent_navigation_constraint',entering_state:'persistent_navigation_constraint',status},loc:{states:{persistent_navigation_constraint:'Persistent shipping constraint'},labels:{}},evidence:{records:[{id:'SRC-1',url:'https://example.com/story',source:'Example',claim:'Source description',supports:[id]}]}});
const index=new Map([['hormuz',[event('hormuz','2026-11-05'),event('hormuz','2026-11-09')]],['ai-gas-turbine-capacity-bottleneck',[event('ai-gas-turbine-capacity-bottleneck','2026-11-09')]]]);
const ledger=new Set(['ai-gas-turbine-capacity-bottleneck']);

test('atlas uses canonical registry labels, newest observation first, and only true linked Ledger dossiers',()=>{
 for(const lang of ['en','ua']){
  const html=entityAtlasBody({lang,index,registry,ledgerSlugs:ledger});
  assert.match(html,/href="\/(en|ua)\/entity\/hormuz\/"/);
  assert.match(html,/2026-11-09/);
  assert.match(html,/entity-tiles/);
  assert.equal((html.match(/class="entity-tile"/g)||[]).length,2);
  assert.equal((html.match(/class="entity-linked"/g)||[]).length,1);
  assert.match(html,lang==='ua'?/Ормузька протока/:/Strait of Hormuz/);
 }
});

test('biography keeps original source anchor, issue route and exact dependency ledger profile',()=>{
 for(const lang of ['en','ua']){
  const html=entityBiographyBody({lang,id:'ai-gas-turbine-capacity-bottleneck',events:index.get('ai-gas-turbine-capacity-bottleneck'),registry,ledgerSlugs:ledger});
  assert.match(html,new RegExp('/'+lang+'/ledger/dependencies/ai-gas-turbine-capacity-bottleneck/'));
  assert.match(html,/href="https:\/\/example.com\/story"/);
  assert.match(html,/id="src-SRC-1"/);
  assert.match(html,lang==='ua'?/<h2>СИСТЕМНА БІОГРАФІЯ<\/h2>/:/<h2>SYSTEM BIOGRAPHY<\/h2>/);
  assert.match(html,/<section class="sources">/);
  assert.match(html,/<section class="entity-chronology"><\/section>/);
  assert.match(html,/FIRST OBSERVED|ПЕРШЕ СПОСТЕРЕЖЕННЯ/);
 }
});

test('entities without ledger assessments never get invented profile links',()=>{
 const html=entityBiographyBody({lang:'en',id:'hormuz',events:index.get('hormuz'),registry,ledgerSlugs:ledger});
 assert.doesNotMatch(html,/\/en\/ledger\/dependencies\/hormuz\//);
 assert.match(html,/\/en\/brief\/2026-11-09\//);
});
test('editorial strings escape markup and invalid input fails closed',()=>{
 const malicious=structuredClone(registry);
 malicious.entities[0].labels.en='<script>x</script>';
 const html=entityAtlasBody({lang:'en',index,registry:malicious});
 assert.match(html,/&lt;script&gt;/);
 assert.doesNotMatch(html,/<script>/);
 assert.throws(()=>entityAtlasBody({lang:'ru',index,registry}),/Invalid locale/);
 assert.throws(()=>entityBiographyBody({lang:'ua',id:'hormuz',events:[],registry}),/Invalid biography/);
});
test('shared style uses safe two-column responsive layout and Manrope',()=>{
 assert.match(entityStyles,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(entityStyles,/@media\(max-width:680px\)/);
 assert.match(entityStyles,/Manrope/);
});
test('publisher connects entity Atlas while preserving canonical history postprocessor',()=>{
 const src=fs.readFileSync('publisher/build.js','utf8');
 const history=fs.readFileSync('publisher/entity-history.js','utf8');
 assert.match(src,/entityBiographyBody\(\{lang,id,events,registry,ledgerSlugs\}\)/);
 assert.match(src,/entityAtlasBody\(\{lang,index,registry,ledgerSlugs\}\)/);
 assert.match(history,/SYSTEM BIOGRAPHY/);
 assert.match(history,/class="entity-event"/);
});
