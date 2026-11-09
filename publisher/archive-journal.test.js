import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {archivePageBody} from './archive-journal.js';
import {archiveStyles} from './archive-journal-css.js';

const sample=[
 {id:'WSB-0039',date:'2026-11-05',confirmedDelta:0,headlines:{en:'Mineral substitutes',ua:'Заміщення мінералів'},decks:{en:'An estimated horizon.',ua:'Оціночний горизонт.'}},
 {id:'WSB-0040',date:'2026-11-06',confirmedDelta:0,headlines:{en:'Crude versus products',ua:'Нафта й нафтопродукти'},decks:{en:'Not equivalent flows.',ua:'Різні потоки.'}},
 {id:'WSB-0041',date:'2026-11-09',confirmedDelta:0,headlines:{en:'AI power turbines',ua:'Турбіни для ШІ'},decks:{en:'Power equipment constraints.',ua:'Обмеження енергообладнання.'}}
];

test('latest actual edition is featured with three real route links',()=>{
 const html=archivePageBody('ua',sample);
 assert.match(html,/ОСТАННІЙ ВИПУСК/);
 assert.match(html,/Турбіни для ШІ/);
 assert.match(html,/href="\/ua\/brief\/2026-11-09\/"/);
 assert.match(html,/href="\/ua\/system\/2026-11-09\/"/);
 assert.match(html,/href="\/ua\/poster\/2026-11-09\/"/);
 assert.equal((html.match(/class="archive-edition"/g)||[]).length,2);
 assert.match(html,/Листопад 2026/);
 assert.doesNotMatch(html,/2026-11-07|2026-11-08/);
});
test('both languages use their own registered titles and copy, no duplicate editions',()=>{
 for(const lang of ['en','ua']){
  const html=archivePageBody(lang,sample);
  assert.match(html,new RegExp(lang==='en'?'AI power turbines':'Турбіни для ШІ'));
  assert.equal((html.match(/<time datetime=/g)||[]).length,2);
  assert.match(html,new RegExp('/'+lang+'/brief/2026-11-05/'));
  assert.doesNotMatch(html,/undefined|NaN/);
 }
});
test('archive escapes untrusted editorial strings',()=>{
 const a=structuredClone(sample);
 a[2].headlines.en='<script>wrong</script>';
 const html=archivePageBody('en',a);
 assert.match(html,/&lt;script&gt;/);
 assert.doesNotMatch(html,/<script>/);
});
test('invalid edition IDs, dates and negative deltas fail closed',()=>{
 assert.throws(()=>archivePageBody('ru',sample),/Invalid archive/);
 assert.throws(()=>archivePageBody('en',[]),/Invalid archive/);
 assert.throws(()=>archivePageBody('en',[sample[0],sample[0]]),/Invalid archival edition/);
 assert.throws(()=>archivePageBody('en',[{...sample[0],confirmedDelta:-1}]),/Invalid archival edition/);
 assert.throws(()=>archivePageBody('en',[{...sample[0],date:'nonsense'}]),/Invalid archival edition/);
});
test('layout is grid-based and uses Manrope Cyrillic-safe headings',()=>{
 assert.match(archiveStyles,/grid-template-columns:165px minmax\(0,1fr\)/);
 assert.match(archiveStyles,/@media\(max-width:680px\)/);
 assert.match(archiveStyles,/font:800 clamp\(32px,4\.8vw,65px\).*"Manrope"/);
 assert.doesNotMatch(archiveStyles,/Impact/);
});
test('publisher records issue-specific canonical bilingual locale copy',()=>{
 const source=fs.readFileSync('publisher/build.js','utf8');
 assert.match(source,/archivePageBody\(lang,items\)/);
 assert.match(source,/loc\.copy\?\.headline/);
 assert.match(source,/loc\.copy\?\.deck/);
 assert.match(source,/confirmedDelta:state\.summary\?\.confirmed_delta/);
});
