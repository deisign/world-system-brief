import test from "node:test";
import assert from "node:assert/strict";
import {systemEngravingV31} from "./system-engraving-v31.js";

test("03.1 bilingual layout uses approved vector asset and source-backed pipeline routes",()=>{
 for(const lang of ["en","ua"]){
  const html=systemEngravingV31({lang});
  assert.ok(html.includes('lang="'+lang+'"'));
  assert.ok(html.includes('/assets/engravings/tanker-study-01.svg'));
  assert.ok(html.includes('https://www.iea.org/'));
  assert.ok(html.includes('EAST–WEST'));
  assert.ok(html.includes('FUJAIRAH')||html.includes('ФУДЖЕЙРА'));
  assert.ok(html.includes('03 / '));
  assert.ok(html.includes('<svg'));
  assert.ok(!html.includes('<canvas'));
  assert.ok(html.includes('href="/'+(lang==="ua"?"en":"ua")+'/visualizations/chokepoint-bypass-v31/"'));
 }
});
test("03.1 rejects invalid asset id, language and unknown evidence",()=>{
 assert.throws(()=>systemEngravingV31({lang:"fr"}));
 assert.throws(()=>systemEngravingV31({engravingId:"../secret"}));
 assert.throws(()=>systemEngravingV31({model:{source:"",routes:["hormuz","east-west","habshan-fujairah"]}}));
 assert.throws(()=>systemEngravingV31({model:{source:"https://example.org",routes:["hormuz"]}}));
});
