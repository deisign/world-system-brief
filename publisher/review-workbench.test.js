import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReviewQueue,reviewWorkbenchPage} from './review-workbench.js';
const registry={entities:[{id:'ENT-1',slug:'hormuz'}]};
const claims=[{id:'CLM-1',issue_id:'WSB-0010',date:'2026-10-01',statement:'Unverified <claim> about transit',kind:'reported',status:'evidence_update',confidence:'medium',entity_ids:['ENT-1'],sources:[{id:'S-0',url:'https://example.org/original'}]}];
const bundles=[{state:{issue_id:'WSB-0010',date:'2026-10-01'},evidence:{records:[]}},{state:{issue_id:'WSB-0011',date:'2026-10-02'},evidence:{records:[{id:'S-1',url:'https://example.org/later',publication_date:'2026-10-02',source:'Later report',supports:['hormuz'],claim:'Same entity, not necessarily same claim'},{id:'S-B',url:'https://example.org/baseline',publication_date:'2026-10-02',role:'baseline',supports:['hormuz']},{id:'S-X',url:'https://example.org/other',publication_date:'2026-10-02',supports:['other']}]}}];
test('review queue uses canonical entity matching and excludes baseline and unrelated sources',()=>{
 const q=buildReviewQueue(claims,bundles,new Map(),registry);assert.equal(q.length,1);assert.deepEqual(q[0].later.map(x=>x.id),['S-1']);assert.equal(q[0].reviewed,null);
});
test('review decision is displayed without changing original claim',()=>{
 const before=structuredClone(claims),initial=buildReviewQueue(claims,bundles,new Map(),registry)[0].score;
 const q=buildReviewQueue(claims,bundles,new Map([['CLM-1',[{decision:'qualified'}]]]),registry);
 assert.equal(q[0].reviewed,'qualified');assert.equal(q[0].score,initial-2);assert.deepEqual(claims,before);
});
test('both locale pages escape text and expose filter and draft controls',()=>{
 const queue=buildReviewQueue(claims,bundles,new Map(),registry);
 for(const lang of ['ua','en']){
  const html=reviewWorkbenchPage({lang,queue});
  assert.match(html,/Unverified &lt;claim&gt;/);assert.match(html,/https:\/\/example.org\/later/);assert.match(html,/id="search"/);assert.match(html,/class="generate"/);assert.match(html,/knowledge\/claim-revisions\.json/);assert.doesNotMatch(html,/Unverified <claim>/);
 }
});
test('no later material is never presented as matched',()=>{
 assert.equal(buildReviewQueue(claims,[bundles[0]],new Map(),registry)[0].later.length,0);
 assert.throws(()=>buildReviewQueue(claims,bundles,new Map(),null));assert.throws(()=>reviewWorkbenchPage({lang:'ru',queue:[]}));
});
