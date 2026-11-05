import test from 'node:test';
import assert from 'node:assert/strict';
import {structuralKnowledgeTimeline,renderStructuralTimeline} from './structural-timeline.js';
const registry={entities:[{id:'ENT-000079',slug:'zeiss-smt'}]};
const source={id:'SRC-1',url:'https://example.org/evidence',publication_date:'2026-11-05',source:'Example'};
function fixture({claimStatus='evidence_update',objectChange='stable',sources=[source],claims=true,delta=0}={}){
 return [{state:{issue_id:'WSB-0039',date:'2026-11-05',summary:{confirmed_delta:delta},objects:[{id:'zeiss-smt',entering_state:'baseline',current_state:objectChange==='stable'?'baseline':'changed',change:objectChange}]},claims:{claims:claims?[{id:'CLM-39',issue_id:'WSB-0039',entity_ids:['ENT-000079'],statement:'New reported information, verification remains bounded.',status:claimStatus,observed_at:'2026-11-05',source_ids:['SRC-1']}]:[]},evidence:{records:sources}}];
}
test('empty canonical history remains explicitly empty',()=>{
 const rows=structuralKnowledgeTimeline('zeiss-smt',registry,fixture({claims:false}));
 assert.deepEqual(rows,[]);
 assert.match(renderStructuralTimeline({lang:'ua',slug:'zeiss-smt',rows}),/немає тверджень/);
});
test('dated source-backed claim changes knowledge, not necessarily the world',()=>{
 const rows=structuralKnowledgeTimeline('zeiss-smt',registry,fixture());
 assert.equal(rows.length,1);assert.equal(rows[0].kind,'knowledge_update');
 const html=renderStructuralTimeline({lang:'en',slug:'zeiss-smt',rows});
 assert.match(html,/KNOWLEDGE UPDATE/);assert.match(html,/WSB-0039/);assert.match(html,/https:\/\/example.org\/evidence/);
 assert.doesNotMatch(html,/CONFIRMED SYSTEM CHANGE/);
});
test('confirmed system delta requires explicit claim, actual transition, and delta tally',()=>{
 const rows=structuralKnowledgeTimeline('zeiss-smt',registry,fixture({claimStatus:'confirmed_delta',objectChange:'changed',delta:1}));
 assert.equal(rows[0].kind,'system_delta');
 assert.throws(()=>structuralKnowledgeTimeline('zeiss-smt',registry,fixture({claimStatus:'confirmed_delta',delta:1})),/Unsupported confirmed delta/);
 assert.throws(()=>structuralKnowledgeTimeline('zeiss-smt',registry,fixture({claimStatus:'confirmed_delta',objectChange:'changed'})),/Unsupported confirmed delta/);
});
test('sources must exist in same canonical issue and use dated HTTPS evidence',()=>{
 assert.throws(()=>structuralKnowledgeTimeline('zeiss-smt',registry,fixture({sources:[]})),/Invalid claim source/);
 assert.throws(()=>structuralKnowledgeTimeline('zeiss-smt',registry,fixture({sources:[{...source,url:'http://example.org'}]})),/Invalid claim source/);
});
test('unrelated claim must not be copied into an entity timeline',()=>{
 const bundles=fixture();bundles[0].claims.claims[0].entity_ids=['some-other-id'];
 assert.deepEqual(structuralKnowledgeTimeline('zeiss-smt',registry,bundles),[]);
});
