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
