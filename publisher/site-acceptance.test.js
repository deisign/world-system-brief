import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dependencyLedgerPage} from './dependency-ledger.js';

const code=fs.readFileSync('publisher/build.js','utf8');
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));

test('READ and archive shell link to the canonical bilingual Dependency Ledger',()=>{
 assert.match(code,/ledger\/dependencies\//);
 assert.match(code,/РЕЄСТР ЗАЛЕЖНОСТЕЙ/);
 assert.match(code,/DEPENDENCY LEDGER/);
});
test('entity detail locale switch preserves the entity id',()=>{
 assert.match(code,/entityId:id/);
 assert.match(code,/entity\/\$\{encodeURIComponent\(entityId\)\}\//);
 assert.match(code,/other\}\/\$\{altRoute\}/);
});
test('Ledger renders a bounded Manrope title on EN and UA without deleting dated assessments',()=>{
 const config=read('knowledge/dependency-assessments.json');
 const registry=read('knowledge/entities.json');
 const bundles=['0039','0040','0041','0042'].map(id=>({
  state:read('issues/'+id+'/state.json'),
  claims:read('issues/'+id+'/claims.json'),
  evidence:read('issues/'+id+'/evidence.json')
 }));
 for(const lang of ['en','ua']){
  const html=dependencyLedgerPage({lang,records:config.records,registry,bundles});
  assert.match(html,/font:800 clamp\(30px,4\.2vw,52px\)/);
  assert.match(html,/font:800 clamp\(21px,2\.5vw,29px\)/);
  assert.match(html,/WSB-0041-SRC-01/);
  assert.match(html,new RegExp('/'+lang+'/ledger/dependencies/'));
  assert.match(html,new RegExp('/'+(lang==='en'?'ua':'en')+'/ledger/dependencies/'));
 }
});
