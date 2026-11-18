import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateIssue} from './validate.js';

const registry=JSON.parse(fs.readFileSync('knowledge/entities.json','utf8'));
const slugs=new Set(registry.entities.map(e=>e.slug));
const ids=new Set(registry.entities.map(e=>e.id));
const load=(issue,name)=>JSON.parse(fs.readFileSync('issues/'+issue+'/'+name+'.json','utf8'));

for(const [number,date,numClaims,numEdges] of [['0049','2026-11-17',4,3],['0050','2026-11-18',5,5]]){
 test('WSB-'+number+' schema, source provenance and two languages',()=>{
  assert.deepEqual(validateIssue('issues/'+number),[]);
  const state=load(number,'state'),ev=load(number,'evidence'),claims=load(number,'claims'),rels=load(number,'relations');
  assert.equal(state.date,date);
  assert.equal(state.summary.confirmed_delta,0);
  assert.equal(ev.records.length,3);
  assert.equal(claims.claims.length,numClaims);
  assert.equal(rels.relations.length,numEdges);
  for(const o of state.objects)assert.ok(slugs.has(o.id),o.id);
  for(const r of rels.relations){
   assert.ok(slugs.has(r.from)&&slugs.has(r.to),r.id);
   assert.ok(r.claim_ids.every(id=>claims.claims.some(c=>c.id===id)),r.id);
   assert.ok(r.source_ids.every(id=>ev.records.some(s=>s.id===id)),r.id);
  }
  for(const c of claims.claims){
   assert.ok(c.entity_ids.every(id=>ids.has(id)),c.id);
   assert.ok(c.source_ids.every(id=>ev.records.some(s=>s.id===id)),c.id);
  }
  for(const lang of ['en','ua']){
   const l=load(number,'locale/'+lang);
   const md=fs.readFileSync('issues/'+number+'/read/'+lang+'.md','utf8');
   assert.ok(l.copy.headline&&l.copy.deck);
   assert.ok(state.objects.every(o=>l.labels[o.id]&&l.states[o.entering_state]&&l.states[o.current_state]));
   assert.match(md,/SYSTEM LEDGER/);
   for(const source of ev.records)assert.ok(md.includes(source.id),source.id);
  }
 });
}
test('historical observations and contracts do not become November 18 physical supply',()=>{
 const c17=load('0049','claims').claims;
 const c18=load('0050','claims').claims;
 assert.equal(c17.find(c=>c.id==='WSB-0049-CLM-02').event_date,'2026-10-31');
 assert.equal(c17.find(c=>c.id==='WSB-0049-CLM-04').event_date,'2025-12-31');
 assert.equal(c18.find(c=>c.id==='WSB-0050-CLM-03').event_date,'2026-11-17');
 assert.equal(c18.find(c=>c.id==='WSB-0050-CLM-04').event_date,'2026-11-13');
 assert.equal(load('0050','state').summary.confirmed_delta,0);
});
