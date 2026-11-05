import test from 'node:test';
import assert from 'node:assert/strict';
import {mapStudyEntities,renderLedgerBridge,addLedgerBridge} from './atlas-ledger-bridge.js';
const registry={entities:[{slug:'hormuz',labels:{en:'Strait of Hormuz',ua:'Ормузька протока'}},{slug:'east-west-pipeline',labels:{en:'East–West Pipeline',ua:'Нафтопровід East–West'}},{slug:'global-oil-balance',labels:{en:'Global oil balance',ua:'Нафтовий баланс'}}]};
const history=new Map([['hormuz',[{state:{date:'2026-10-08'}},{state:{date:'2026-11-04'}}]],['east-west-pipeline',[{state:{date:'2026-10-07'}}]]]);
test('only registered and historically attested study nodes link to dossiers',()=>{
 const ids=['hormuz','east-west','habshan-fujairah'];
 assert.deepEqual(mapStudyEntities('flow',ids,registry,history).map(x=>x.slug),['hormuz','east-west-pipeline',null]);
 for(const lang of ['en','ua']){
  const html=renderLedgerBridge({lang,kind:'flow',ids,registry,history});
  assert.ok(html.includes('href="/'+lang+'/entity/hormuz/"'));
  assert.ok(html.includes('href="/'+lang+'/entity/east-west-pipeline/"'));
  assert.ok(!html.includes('/entity/habshan-fujairah/'));
  assert.ok(html.includes('2026-10-08 — 2026-11-04'));
 }
});
test('unregistered EUV study nodes remain unlinked',()=>{
 const html=renderLedgerBridge({lang:'en',kind:'chain',ids:['zeiss','asml','fab'],registry,history});
 assert.doesNotMatch(html,/href="\/en\/entity\//);
 assert.match(html,/NO SYSTEM LEDGER RECORD/);
});
test('registered node without issue history is not linked',()=>{
 assert.equal(mapStudyEntities('network',['global-oil-balance'],registry,history)[0].slug,null);
});
test('bridge preserves original evidence HTML and rejects unknown IDs',()=>{
 const out=addLedgerBridge('<html><head></head><body><main><a href="https://example.org">SOURCE</a></main></body></html>',{lang:'en',kind:'chain',ids:['zeiss','asml','fab'],registry,history});
 assert.match(out,/SOURCE/);assert.match(out,/atlas-ledger-bridge/);
 assert.throws(()=>mapStudyEntities('flow',['unknown'],registry,history));
});

test('source-backed EUV nodes link to structural profiles but never pretend to have dated histories',()=>{
 const html=renderLedgerBridge({lang:'en',kind:'chain',ids:['zeiss','asml','fab'],registry,history,structuralSlugs:['zeiss-smt','asml']});
 assert.match(html,/href="\/en\/structure\/zeiss-smt\/"/);
 assert.match(html,/href="\/en\/structure\/asml\/"/);
 assert.match(html,/STRUCTURAL PROFILE · NO ISSUE HISTORY/);
 assert.doesNotMatch(html,/\/en\/entity\/asml\//);
 assert.doesNotMatch(html,/\/en\/structure\/fab\//);
});
