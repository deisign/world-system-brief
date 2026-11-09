import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {homePage} from './homepage.js';
import {editorialSkin} from './editorial-skin.js';
import {addAtlasNavigation} from './standalone-navigation.js';

const home=fs.readFileSync('publisher/homepage.js','utf8');

test('homepage uses Cyrillic-compatible Manrope instead of Impact display faces',()=>{
 assert.doesNotMatch(home,/Impact,/);
 assert.match(home,/font-size:clamp\(42px,5\.4vw,82px\)/);
 assert.match(home,/font-size:clamp\(42px,6\.2vw,94px\)/);
 assert.match(home,/font-family:.*Manrope/);
});
test('shared READ headings use bounded Manrope typography',()=>{
 assert.doesNotMatch(editorialSkin,/IBM Plex Sans Condensed/);
 assert.match(editorialSkin,/font-size:clamp\(40px,5vw,76px\)/);
 assert.match(editorialSkin,/font-family:"Manrope"/);
});
test('standalone pages expose bilingual canonical Dependency Ledger navigation',()=>{
 for(const lang of ['en','ua']){
  const html=addAtlasNavigation('<html><head></head><body><main>TEST</main></body></html>',{lang,date:'2026-11-09',mode:'system'});
  assert.match(html,new RegExp('/'+lang+'/ledger/dependencies/'));
  assert.match(html,new RegExp('/'+lang+'/archive/'));
  assert.match(html,/aria-label="World System Brief navigation"/);
 }
});
