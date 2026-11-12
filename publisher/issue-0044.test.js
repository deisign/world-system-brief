import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateIssue} from './validate.js';

const read=name=>JSON.parse(fs.readFileSync('issues/0044/'+name+'.json','utf8'));
const state=read('state'),evidence=read('evidence'),claims=read('claims'),relations=read('relations');
const registry=JSON.parse(fs.readFileSync('knowledge/entities.json','utf8'));
const ids=new Set(registry.entities.map(e=>e.slug));
test('WSB-0044 validates canonical entities, source links and date',()=>{
 assert.deepEqual(validateIssue('issues/0044'),[]);
 assert.equal(state.issue_id,'WSB-0044');
 assert.equal(state.date,'2026-11-12');
 assert.equal(state.summary.confirmed_delta,0);
 assert.equal(evidence.records.length,5);
 assert.equal(claims.claims.length,5);
 assert.equal(relations.relations.length,5);
 assert.ok(state.objects.every(x=>ids.has(x.id)));
});
test('historical contract and tanker events are never backdated to publication day',()=>{
 assert.equal(claims.claims.find(x=>x.id==='WSB-0044-CLM-02').event_date,'2026-11-10');
 assert.equal(claims.claims.find(x=>x.id==='WSB-0044-CLM-03').event_date,'2026-11-11');
 assert.equal(evidence.records.find(x=>x.id==='WSB-0044-SRC-02').publication_date,'2026-11-10');
 assert.ok(state.notes.some(x=>x.includes('10 November')));
});
test('planned tickets and CNOOC exploration rate are not counted as operating stock or gas capacity',()=>{
 assert.equal(state.summary.confirmed_delta,0);
 assert.equal(state.objects.find(x=>x.id==='asean-fuel-ticket-reserve').status,'developing');
 assert.equal(state.objects.find(x=>x.id==='cnooc-bohai-ultradeep-gas-test').status,'evidence_update');
 for(const lang of ['en','ua']){
  const md=fs.readFileSync('issues/0044/read/'+lang+'.md','utf8');
  assert.match(md,/WSB-0044-SRC-01/);
  assert.match(md,/WSB-0044-SRC-05/);
  assert.match(md,lang==='en'?/not commercial supply/:/не є промисловим постачанням/);
 }
});
test('all sourced relations have both registered endpoints and verifiable dated claims',()=>{
 for(const rel of relations.relations){
  assert.ok(ids.has(rel.from)&&ids.has(rel.to));
  assert.ok(rel.claim_ids.every(id=>claims.claims.some(c=>c.id===id)));
  assert.ok(rel.source_ids.every(id=>evidence.records.some(s=>s.id===id)));
 }
 const sourceNames=evidence.records.map(x=>x.id);
 assert.equal(sourceNames.length,new Set(sourceNames).size);
});
