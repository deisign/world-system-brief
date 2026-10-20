import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rhpPilotPage } from "./rhp-pilot.js";
const evidence=JSON.parse(readFileSync(new URL("../issues/0011/evidence.json",import.meta.url),"utf8"));
test("RHP pilot uses existing quantified source and bilingual output",()=>{
 for(const lang of ["en","ua"]){
  const page=rhpPilotPage({lang,evidence});
  assert.match(page,lang==="ua"?/25,08%/:/25\.08%/);
  assert.match(page,lang==="ua"?/16,37%/:/16\.37%/);
  assert.match(page,/WSB-SRC-0011-01/);
  assert.match(page,/standalone\.js/);
  assert.match(page,new RegExp('lang="'+lang+'"'));
 }
});
test("RHP pilot refuses ungrounded data",()=>{
 assert.throws(()=>rhpPilotPage({lang:"en",evidence:{records:[]}}));
});

test("all three WSB chart layouts share identical cited values",()=>{
 for(const lang of ["en","ua"]){
  const pages=["compact","editorial","micro"].map(variant=>rhpPilotPage({lang,evidence,variant}));
  for(const page of pages){
   assert.match(page,/WSB-SRC-0011-01/);
   assert.match(page,lang==="ua"?/25,08%/:/25\.08%/);
   assert.match(page,lang==="ua"?/16,37%/:/16\.37%/);
   assert.match(page,/\#A2362A/);
   assert.match(page,/\#46697A/);
  }
 }
 assert.throws(()=>rhpPilotPage({lang:"en",evidence,variant:"unsupported"}));
});
