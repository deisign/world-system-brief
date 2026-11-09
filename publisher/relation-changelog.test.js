import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {classifyRelationObservations,relationChangesForDate,renderRelationChangeLog} from './relation-changelog.js';
import {systemMapPage} from './system-map-page.js';
import {systemMapClientScript} from './system-map-client.js';

const registry={entities:[{id:'E1',slug:'a',labels:{en:'A',ua:'А'}},{id:'E2',slug:'b',labels:{en:'B',ua:'Б'}}]};
const issue=(date,id,rel=[],claimStatus='evidence_update')=>({state:{date,issue_id:id},relations:{relations:rel},claims:{claims:[{id:'CLM',status:claimStatus,source_ids:['SRC']}]},evidence:{records:[{id:'SRC',url:'https://example.org/source',source:'Example'}]}});
const relation=(state='active')=>({from:'E1',to:'E2',type:'constrains',state,claim_ids:['CLM'],source_ids:['SRC']});

test('first relation registration is knowledge, not proven physical creation',()=>{
 const items=classifyRelationObservations([issue('2026-10-01','WSB-01',[relation()])],registry);
 assert.equal(items.length,1);
 assert.equal(items[0].classification,'first_recorded');
 assert.equal(items[0].physical_delta,false);
 assert.equal(items[0].from,'a');
 assert.equal(items[0].sources[0].url,'https://example.org/source');
});
test('repeated relation remains evidence update and absent mention is not disappearance',()=>{
 const items=classifyRelationObservations([
  issue('2026-10-01','WSB-01',[relation()]),
  issue('2026-10-02','WSB-02',[]),
  issue('2026-10-03','WSB-03',[relation()])
 ],registry);
 assert.equal(items.length,2);
 assert.equal(items[1].classification,'further_evidence');
 assert.equal(items[1].previous_observation,'2026-10-01');
 assert.equal(relationChangesForDate(items,'2026-10-02').length,0);
});
test('unverified ended or weakening claims never become confirmed changes',()=>{
 const items=classifyRelationObservations([
  issue('2026-10-01','WSB-01',[relation()]),
  issue('2026-10-02','WSB-02',[relation('ended')]),
  issue('2026-10-03','WSB-03',[relation('weakening')])
 ],registry);
 assert.deepEqual(items.map(i=>i.classification),['first_recorded','unverified_state_assertion','unverified_state_assertion']);
 assert.ok(items.every(i=>!i.physical_delta));
});
test('explicit dated source-backed confirmed delta permits termination and weakening',()=>{
 const items=classifyRelationObservations([
  issue('2026-10-01','WSB-01',[relation()]),
  issue('2026-10-02','WSB-02',[relation('weakening')],'confirmed_delta'),
  issue('2026-10-03','WSB-03',[relation('ended')],'confirmed_delta')
 ],registry);
 assert.equal(items[1].classification,'confirmed_structural_change');
 assert.equal(items[2].classification,'confirmed_termination');
 assert.ok(items[1].physical_delta&&items[2].physical_delta);
});
test('confirmed delta without source/claim linkage does not pass evidence gate',()=>{
 const cases=[
  {...relation('ended'),source_ids:[]},
  {...relation('ended'),claim_ids:[]},
  {...relation('ended'),source_ids:['missing']},
 ];
 for(const r of cases){
  const items=classifyRelationObservations([issue('2026-10-02','WSB-02',[r],'confirmed_delta')],registry);
  assert.equal(items[0].classification,'unverified_state_assertion');
 }
});
test('dated EN/UA digest presents source and entity routes; empty issue stays explicit',()=>{
 const items=classifyRelationObservations([issue('2026-10-01','WSB-01',[relation()])],registry);
 for(const lang of ['en','ua']){
  const html=renderRelationChangeLog({lang,records:items,date:'2026-10-01',registry});
  assert.match(html,new RegExp('/'+lang+'/entity/a/'));
  assert.match(html,/https:\/\/example.org\/source/);
  assert.match(html,/first_recorded/);
  assert.match(renderRelationChangeLog({lang,records:items,date:'2026-10-02',registry}),lang==='ua'?/немає нових спостережень/:/No new relation observations/);
 }
});
test('canonical last issue without relations has no fabricated structural changes',()=>{
 const state=JSON.parse(fs.readFileSync('issues/0041/state.json','utf8'));
 const relations=JSON.parse(fs.readFileSync('issues/0041/relations.json','utf8'));
 assert.equal(state.summary.confirmed_delta,0);
 assert.equal(relations.relations.length,0);
 const result=classifyRelationObservations([{state,relations,claims:{claims:[]},evidence:{records:[]}}],registry);
 assert.deepEqual(result,[]);
});
test('map binds dated digest into page and client changes it with as-of selector',()=>{
 const map={nodes:[],edges:[]};
 const html=systemMapPage({lang:'en',map,date:'2026-10-01',dates:['2026-10-01'],changeLog:'<section id="relation-changelog">Test</section>'});
 assert.match(html,/id="relation-changelog"/);
 const js=systemMapClientScript({temporal:[],entities:{},lang:'en',changeViews:{'2026-10-01':'<section id="relation-changelog">Test</section>'}});
 assert.match(js,/D\.changeViews/);
 assert.match(js,/getElementById\("map-date"\)/);
});
