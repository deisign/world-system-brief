import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateIssue} from './validate.js';
const read=p=>JSON.parse(fs.readFileSync('issues/0045/'+p+'.json','utf8'));
const state=read('state'),evidence=read('evidence'),claims=read('claims'),relations=read('relations');
const entities=new Set(JSON.parse(fs.readFileSync('knowledge/entities.json','utf8')).entities.map(x=>x.slug));
test('issue 0045 is dated, source-linked and accepted by WSB validation',()=>{
 assert.deepEqual(validateIssue('issues/0045'),[]);
 assert.equal(state.date,'2026-11-13');
 assert.equal(state.summary.confirmed_delta,0);
 assert.equal(evidence.records.length,3);
 assert.equal(claims.claims.length,5);
 assert.equal(relations.relations.length,6);
});
test('publication date is never October inventory event date',()=>{
 for(const id of ['WSB-0045-CLM-01','WSB-0045-CLM-02']){
  const c=claims.claims.find(x=>x.id===id);
  assert.equal(c.event_date,'2026-10-31');
  assert.equal(c.observed_at,'2026-11-13');
 }
 assert.equal(evidence.records.find(x=>x.id==='WSB-0045-SRC-01').publication_date,'2026-11-13');
});
test('floating stock and planned computing projects do not become today's commissioned capacity',()=>{
 assert.equal(state.summary.confirmed_delta,0);
 assert.ok(state.noise.some(x=>x.id==='stock_on_water_not_refined_supply'));
 assert.ok(state.noise.some(x=>x.id==='project_value_not_chip_purchase'));
 for(const lang of ['en','ua']){
  const md=fs.readFileSync('issues/0045/read/'+lang+'.md','utf8');
  assert.match(md,/WSB-0045-SRC-01/);
  assert.match(md,/WSB-0045-SRC-03/);
  assert.match(md,lang==='en'?/October's supply increase/:/жовтневе збільшення пропозиції/);
 }
});
test('six documented relations link real endpoints and canonical citations',()=>{
 for(const r of relations.relations){
  assert.ok(entities.has(r.from)&&entities.has(r.to),r.id);
  assert.ok(r.claim_ids.every(id=>claims.claims.some(c=>c.id===id)),r.id);
  assert.ok(r.source_ids.every(id=>evidence.records.some(s=>s.id===id)),r.id);
 }
 assert.equal(new Set(relations.relations.map(x=>x.id)).size,6);
});
