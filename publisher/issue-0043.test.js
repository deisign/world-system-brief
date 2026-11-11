import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateIssue} from './validate.js';
import {classifyRelationObservations} from './relation-changelog.js';

const root='issues/0043/';
const read=file=>JSON.parse(fs.readFileSync(root+file,'utf8'));
const state=read('state.json'),claims=read('claims.json'),evidence=read('evidence.json'),relations=read('relations.json');
const registry=JSON.parse(fs.readFileSync('knowledge/entities.json','utf8'));
const slugs=new Set(registry.entities.map(e=>e.slug)),ids=new Set(registry.entities.map(e=>e.id));
test('0043 canonical structure passes full evidence validator',()=>{
 assert.deepEqual(validateIssue(root),[]);
 assert.equal(state.issue_id,'WSB-0043');
 assert.equal(state.date,'2026-11-11');
 assert.equal(state.summary.confirmed_delta,0);
 assert.ok(claims.claims.every(c=>c.status!=='confirmed_delta'));
 assert.equal(relations.relations.length,3);
 assert.equal(registry.entities.length,100);
});
test('all new maritime entities have dated history and named sources',()=>{
 const needed=['black-sea-maritime-security-hub','black-sea-commercial-shipping-threat','red-sea-aspides-escort-capacity','red-sea-commercial-shipping-risk','hormuz-mine-insurance-clearance-dependency'];
 const objects=new Set(state.objects.map(o=>o.id));
 for(const slug of needed){assert.ok(slugs.has(slug));assert.ok(objects.has(slug));assert.ok(evidence.records.some(e=>e.supports.includes(slug)));}
 for(const c of claims.claims){assert.ok(c.entity_ids.every(id=>ids.has(id)));assert.ok(c.source_ids.every(id=>evidence.records.some(s=>s.id===id)));}
});
test('official 2027 hub aspiration cannot be reported as commissioned capacity',()=>{
 const ec=evidence.records.find(s=>s.id==='WSB-0043-SRC-03');
 assert.equal(ec.publication_date,'2026-11-10');
 assert.equal(ec.source_type,'official_record');
 assert.match(ec.claim,/2027/);
 assert.match(state.notes.join(' '),/not a deployed|not operational|no new physical/i);
 assert.equal(state.dominant_mechanism.type,'evidence_update');
});
test('dated November 11 oil evidence never implies proof of restored passage or mines',()=>{
 const oil=evidence.records.find(s=>s.id==='WSB-0043-SRC-01');
 assert.equal(oil.publication_date,'2026-11-11');
 assert.match(oil.claim,/07:30 GMT/);
 assert.match(oil.observation,/allegation/);
 assert.match(state.notes.join(' '),/No new physical/);
});
test('relation changelog marks each edge as first recorded, not new physical change',()=>{
 const obs=classifyRelationObservations([{state,claims,evidence,relations}],registry);
 assert.equal(obs.length,3);
 assert.ok(obs.every(x=>x.classification==='first_recorded'));
 assert.ok(obs.every(x=>!x.physical_delta));
 assert.ok(obs.every(x=>x.sources.length>0));
});
test('bilingual reading files present and primary source links retained',()=>{
 for(const lang of ['en','ua']){
  const read=fs.readFileSync(root+'read/'+lang+'.md','utf8');
  assert.match(read,lang==='en'?/SHIPPING NEEDS MORE THAN AN OPEN STRAIT/:/СУДНОПЛАВСТВУ ЗАМАЛО ВІДКРИТОЇ ПРОТОКИ/);
  for(const source of evidence.records)assert.ok(read.includes(source.url),source.id+' absent from '+lang);
  assert.ok(!/confirmed new physical.*:\s*[1-9]/i.test(read));
 }
});
