import test from 'node:test';
import assert from 'node:assert/strict';
import {registryEntityPage,registryIndexAddendum} from './entity-register.js';
const entity={id:'ENT-TEST',slug:'test-entity',type:'organization',labels:{en:'Test <Entity>',ua:'Тестова сутність'}};
const claims=[{id:'CLM-1',date:'2026-10-08',issue_id:'WSB-0011',statement:'A reported observation',status:'persistent',entities:[{slug:'test-entity'}],sources:[{id:'SRC-A',url:'https://example.org/source'}]}];
test('untracked entity has a truthful bilingual registry page with canonical claim and source',()=>{
 for(const lang of ['en','ua']){
  const html=registryEntityPage({lang,entity,claims});
  assert.match(html,/dated state biography|датована історія/);
  assert.match(html,/href="\/(en|ua)\/claim\/CLM-1\/"/);
  assert.match(html,/href="https:\/\/example.org\/source"/);
  assert.match(html,/ENT-TEST/);
 }
});
test('registry-only entity does not fabricate a dated history and can link a structural study',()=>{
 const html=registryEntityPage({lang:'en',entity,structure:true});
 assert.match(html,/SOURCE-BACKED STRUCTURAL PROFILE/);
 assert.match(html,/No dated claims/);
 assert.doesNotMatch(html,/class="entity-event"/);
 const other=registryIndexAddendum({lang:'en',entities:[entity]});
 assert.match(other,/test-entity/);
 assert.match(other,/OTHER REGISTERED ENTITIES/);
});
test('HTML escapes labels and rejects bad locale',()=>{
 const html=registryEntityPage({lang:'en',entity});
 assert.match(html,/Test &lt;Entity&gt;/);
 assert.doesNotMatch(html,/Test <Entity>/);
 assert.throws(()=>registryEntityPage({lang:'ru',entity}));
});
