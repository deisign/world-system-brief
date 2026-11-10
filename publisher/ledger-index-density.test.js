import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dependencyLedgerPage} from './dependency-ledger.js';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const assessments=read('knowledge/dependency-assessments.json');
const registry=read('knowledge/entities.json');
const transitions=read('knowledge/dependency-transitions.json').records;
const bundles=['0039','0040','0041','0042'].map(id=>({
 state:read('issues/'+id+'/state.json'),
 evidence:read('issues/'+id+'/evidence.json'),
 claims:read('issues/'+id+'/claims.json')
}));

test('bilingual index is a compact source-linked grid, not five full essays',()=>{
 for(const lang of ['ua','en']){
  const html=dependencyLedgerPage({lang,records:assessments.records,registry,bundles,transitions});
  assert.match(html,/<div class="summary-grid">/);
  assert.equal((html.match(/class="record record--summary"/g)||[]).length,assessments.records.length);
  assert.doesNotMatch(html,/<div class="fields">/);
  assert.match(html,/DPA-0041-AI-TURBINE-POWER|WSB-0041-SRC-01/);
  assert.match(html,/WSB-0041-CLM-01/);
  assert.match(html,/https:\/\/www.reuters.com/);
  assert.match(html,/UNKNOWN|НЕ ВСТАНОВЛЕНО/);
 }
});

test('full detail remains bilingual, complete and evidence-linked',()=>{
 for(const lang of ['ua','en']){
  const html=dependencyLedgerPage({lang,records:assessments.records,registry,bundles,transitions,slug:'ai-gas-turbine-capacity-bottleneck'});
  assert.doesNotMatch(html,/class="summary-grid"/);
  assert.match(html,/<div class="fields">/);
  assert.equal((html.match(/class="field"/g)||[]).length,7);
  assert.match(html,/WSB-0041-SRC-01/);
  assert.match(html,/WSB-0041-CLM-01/);
  assert.match(html,/DTE-0041|2026-11-09/);
 }
});
