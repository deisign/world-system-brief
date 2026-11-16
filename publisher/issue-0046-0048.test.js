import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateIssue} from './validate.js';
const reg=JSON.parse(fs.readFileSync('knowledge/entities.json','utf8'));
const bySlug=new Map(reg.entities.map(e=>[e.slug,e]));
const read=(id,f)=>JSON.parse(fs.readFileSync('issues/'+id+'/'+f+'.json','utf8'));
for(const [id,date,expectedSources,expectedClaims,expectedEdges] of [['0046','2026-11-14',2,3,3],['0047','2026-11-15',2,4,4],['0048','2026-11-16',3,5,5]]){
 test('WSB-'+id+' complete provenance and EN/UA archive integration',()=>{
  assert.deepEqual(validateIssue('issues/'+id),[]);
  const state=read(id,'state'),ev=read(id,'evidence'),claims=read(id,'claims'),relations=read(id,'relations');
  assert.equal(state.date,date);
  assert.equal(ev.records.length,expectedSources);
  assert.equal(claims.claims.length,expectedClaims);
  assert.equal(relations.relations.length,expectedEdges);
  for(const o of state.objects)assert.ok(bySlug.has(o.id),'unknown state '+o.id);
  for(const edge of relations.relations){
   assert.ok(bySlug.has(edge.from)&&bySlug.has(edge.to),edge.id);
   assert.ok(edge.claim_ids.every(cid=>claims.claims.some(c=>c.id===cid)),edge.id);
   assert.ok(edge.source_ids.every(sid=>ev.records.some(s=>s.id===sid)),edge.id);
  }
  for(const c of claims.claims){
   assert.ok(c.entity_ids.every(id=>reg.entities.some(e=>e.id===id)),c.id);
   assert.ok(c.source_ids.every(sid=>ev.records.some(e=>e.id===sid)),c.id);
  }
  for(const lang of ['en','ua']){
   const l=read(id,'locale/'+lang);
   const md=fs.readFileSync('issues/'+id+'/read/'+lang+'.md','utf8');
   assert.ok(l.copy.headline&&l.copy.deck);
   assert.ok(state.objects.every(o=>l.labels[o.id]&&l.states[o.entering_state]&&l.states[o.current_state]),lang+id);
   assert.match(md,/SYSTEM LEDGER/);
   for(const e of ev.records)assert.ok(md.includes(e.id),'unreferenced '+e.id);
  }
 });
}
test('WSB backfill has day-specific physical/policy separation and date integrity',()=>{
 const a=read('0046','state'),b=read('0047','state'),c=read('0048','state');
 assert.deepEqual([a.summary.confirmed_delta,b.summary.confirmed_delta,c.summary.confirmed_delta],[0,1,0]);
 const claims14=read('0046','claims').claims;
 assert.equal(claims14[0].event_date,'2026-11-13');
 assert.equal(read('0047','evidence').records[0].publication_date,'2026-11-15');
 assert.equal(read('0048','claims').claims.find(x=>x.id==='WSB-0048-CLM-04').event_date,'2026-10-31');
 assert.ok(b.notes.some(s=>s.includes('exact first-flow')));
 assert.ok(c.notes.some(s=>s.includes('unverified')));
});
