import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDraft} from './research-draft.js';
const data={issue_date:'2026-10-15',sources:[{id:'SRC1',title:'Report',url:'https://example.org/story',publication_date:'2026-10-15'}],candidates:[{id:'transport',headline:'Supply shift',classification:'confirmed_delta',event_date:'2026-10-15',source_ids:['SRC1'],why_structural:'Changing routes'}]};
const audit={issue_date:'2026-10-15',publication_authorized:false,candidates:[{id:'transport',eligible_source_ids:['SRC1'],flags:['independent_editorial_confirmation_required']}]};
const previous={issue_id:'WSB-0017',date:'2026-10-14'};
test('creates bilingual review skeleton and blocks publication',()=>{const r=makeDraft(data,audit,previous);assert.equal(r.manifest.publication_authorized,false);assert.match(r.en,/Supply shift/);assert.match(r.ua,/НЕ ПЕРЕВІРЕНО/);assert.match(r.ua,/Supply shift/);assert.match(r.en,/https:\/\/example.org\/story/);});
test('never proceeds without a review gate',()=>{assert.throws(()=>makeDraft(data,{...audit,publication_authorized:true},previous),/Review gate/);});
test('requires a preceding canonical issue',()=>{assert.throws(()=>makeDraft(data,audit,{...previous,date:'2026-10-16'}),/baseline/);});