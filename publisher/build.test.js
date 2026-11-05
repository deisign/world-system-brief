import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

test("publisher builds archive, entities and trajectories",()=>{
 const out=execFileSync(process.execPath,["publisher/build.js"],{encoding:"utf8"});
 assert.match(out,/Built \d+ issues;/);
 for(const p of ["dist/en/archive/index.html","dist/en/entities/index.html","dist/en/trajectories/index.html","dist/ua/trajectories/index.html"]) assert.equal(fs.existsSync(p),true,p);
 const html=fs.readFileSync("dist/en/trajectories/index.html","utf8");
 assert.match(html,/TRAJECTORIES/);
});

test('publishes EUV source-backed structural profiles and their direct study links',()=>{
 execFileSync(process.execPath,["publisher/build.js"],{encoding:"utf8"});
 for(const lang of ['en','ua']){
  for(const slug of ['zeiss-smt','asml']){
   const f='dist/'+lang+'/structure/'+slug+'/index.html';
   assert.ok(fs.existsSync(f),f);
   const page=fs.readFileSync(f,'utf8');
   assert.ok(page.includes('/'+lang+'/visualizations/euv-optics/'));
   assert.ok(page.includes('https://'));
  }
  const study=fs.readFileSync('dist/'+lang+'/visualizations/euv-optics/index.html','utf8');
  assert.ok(study.includes('/'+lang+'/structure/zeiss-smt/'));
  assert.ok(study.includes('/'+lang+'/structure/asml/'));
  assert.ok(!study.includes('/'+lang+'/structure/fab/'));
 }
});

test('publishes bilingual review workbenches from canonical claims and evidence',()=>{
 execFileSync(process.execPath,["publisher/build-claims.js"],{encoding:"utf8"});
 for(const lang of ['en','ua']){
  const file='dist/'+lang+'/editorial/reviews/index.html';
  assert.ok(fs.existsSync(file),file);
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/id="review-data"/);
  assert.match(html,/href="\/(en|ua)\/claims\/"/);
  assert.match(html,/knowledge\/claim-revisions\.json/);
  assert.match(html,/id="search"/);
 }
});

test('first editorial review renders on the original dated claim page in both languages',()=>{
 execFileSync(process.execPath,["publisher/build-claims.js"],{encoding:"utf8"});
 for(const lang of ['en','ua']){
  const file='dist/'+lang+'/claim/CLM-261007-04/index.html';
  assert.ok(fs.existsSync(file),file);
  const page=fs.readFileSync(file,'utf8');
  assert.match(page,/REV-0011-CLM26100704/);
  assert.match(page,/2026-10-08/);
  assert.match(page,/WSB-SRC-0011-01/);
  assert.match(page,/WSB-SRC-0011-02/);
  assert.match(page,lang==='en'?/QUALIFIED/:/УТОЧНЕНО/);
  assert.match(page,/A developing Gulf of Mexico hurricane threatens US oil and gas production/);
 }
});

test('public root opens the editorial homepage rather than bypassing it',()=>{
 execFileSync(process.execPath,["publisher/build.js"],{encoding:"utf8"});
 const redirect=fs.readFileSync("dist/index.html","utf8");
 assert.match(redirect,/content="0;url=\/en\/"/);
 assert.doesNotMatch(redirect,/content="0;url=\/en\/brief\//);
 const home=fs.readFileSync("dist/en/index.html","utf8");
 assert.match(home,/WORLD SYSTEM BRIEF/);
});

test('registered entities without state events are real, sourced pages, never broken claim links',()=>{
 execFileSync(process.execPath,["publisher/build.js"],{encoding:"utf8"});
 execFileSync(process.execPath,["publisher/build-claims.js"],{encoding:"utf8"});
 for(const lang of ['en','ua']){
  const file='dist/'+lang+'/entity/cheniere/index.html';
  assert.ok(fs.existsSync(file),file);
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/CLM-260930-03/);
  assert.match(html,/href="https:\/\/www\.reuters\.com\//);
  assert.doesNotMatch(html,/class="entity-event"/);
  const index=fs.readFileSync('dist/'+lang+'/entities/index.html','utf8');
  assert.match(index,/id="registry-without-state"/);
  assert.match(index,/\/entity\/cheniere\//);
 }
});
