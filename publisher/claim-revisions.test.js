import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRevisions,claimRevisionSection} from './claim-revisions.js';
const original={state:{issue_id:'WSB-0038',date:'2026-11-04'},claims:{claims:[{id:'CLM-A',statement:'Original reported assertion'}]},evidence:{records:[]}};
const later={state:{issue_id:'WSB-0039',date:'2026-11-05'},claims:{claims:[]},evidence:{records:[{id:'SRC-B',url:'https://example.org/correction',publication_date:'2026-11-05',source:'Independent correction'}]}};
const corpus=[original,later];
const revision={id:'REV-0039-01',target_claim_id:'CLM-A',issue_id:'WSB-0039',date:'2026-11-05',decision:'qualified',reason:{en:'New evidence narrows the original scope.',ua:'Нові свідчення уточнюють межі попереднього твердження.'},source_ids:['SRC-B']};
const ledger=(records=[revision])=>({schema:'wsb-claim-revisions-v1',revisions:records});
test('empty ledger retains original claims and contains no fabricated review',()=>{
 assert.equal(validateRevisions(ledger([]),corpus).size,0);
 assert.match(claimRevisionSection({lang:'en',claimId:'CLM-A'}),/No later editorial decision/);
});
test('later bilingual source-backed revision is linked to original without mutation',()=>{
 const originalCopy=structuredClone(original);
 const index=validateRevisions(ledger(),corpus);
 assert.equal(index.get('CLM-A')[0].decision,'qualified');
 const html=claimRevisionSection({lang:'ua',claimId:'CLM-A',revisions:index.get('CLM-A')});
 assert.match(html,/УТОЧНЕНО/);
 assert.match(html,/https:\/\/example.org\/correction/);
 assert.match(html,/href="\/ua\/brief\/2026-11-05\/"/);
 assert.deepEqual(original,originalCopy);
});
test('reject unknown claim, missing issue, old-date review, baseline, invalid source and language',()=>{
 const mutate=(key,value)=>ledger([{...revision,[key]:value}]);
 assert.throws(()=>validateRevisions(mutate('target_claim_id','MISSING'),corpus),/Unknown original/);
 assert.throws(()=>validateRevisions(mutate('issue_id','WSB-0040'),corpus),/later canonical issue/);
 assert.throws(()=>validateRevisions(mutate('date','2026-11-04'),corpus),/later canonical issue/);
 assert.throws(()=>validateRevisions(mutate('source_ids',['MISSING']),corpus),/Invalid revision evidence/);
 assert.throws(()=>validateRevisions(mutate('reason',{en:'',ua:'Є'}),corpus),/bilingual/);
 assert.throws(()=>validateRevisions(mutate('decision','unverified'),corpus),/Unknown editorial decision/);
 assert.throws(()=>validateRevisions(ledger([revision,revision]),corpus),/Duplicate revision/);
 const bad=structuredClone(corpus);bad[1].evidence.records[0].role='baseline';
 assert.throws(()=>validateRevisions(ledger(),bad),/Invalid revision evidence/);
});
test('append-order and exact target are enforced',()=>{
 const r2={...revision,id:'REV-0039-02',decision:'refuted'};
 assert.equal(validateRevisions(ledger([revision,r2]),corpus).get('CLM-A').length,2);
 assert.throws(()=>validateRevisions(ledger([r2,revision]),corpus),/chronological order/);
 assert.throws(()=>claimRevisionSection({lang:'en',claimId:'OTHER',revisions:[{...revision,sources:[]}]}),/Mismatched/);
});
