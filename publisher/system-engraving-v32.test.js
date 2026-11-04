import test from "node:test";
import assert from "node:assert/strict";
import {systemEngravingV32,HORMUZ_DEPENDENCIES} from "./system-engraving-v32.js";

test("03.2 preserves genuine vector plate, dated sources, non-equivalent measurements and both languages",()=>{
 for(const lang of ["en","ua"]){
  const html=systemEngravingV32({lang});
  assert.ok(html.includes('lang="'+lang+'"'));
  assert.ok(html.includes('/assets/engravings/tanker-study-01.svg'));
  assert.ok(html.includes('iea.org/about/oil-safety-and-emergency-response/strait-of-hormuz'));
  assert.ok(html.includes('aramco-posts-345-rise-third-quarter-profit-2026-11-03'));
  assert.ok(html.includes('EAST–WEST'));
  assert.ok(html.includes("03 / "));
  assert.ok(html.includes("03.2"));
  assert.ok(html.includes('href="/'+(lang==="en"?"ua":"en")+'/visualizations/chokepoint-bypass-v32/"'));
  assert.ok(html.includes(lang==="en"?"NOT A LIKE-FOR-LIKE COMPARISON":"ПОКАЗНИКИ НЕ Є ОДНОРІДНИМИ"));
  assert.ok(html.includes('2026'));
 }
});
test("03.2 refuses unsourced measurements and invalid routes",()=>{
 assert.throws(()=>systemEngravingV32({lang:"fr"}));
 assert.throws(()=>systemEngravingV32({engravingId:"../private"}));
 assert.throws(()=>systemEngravingV32({model:{...HORMUZ_DEPENDENCIES,flow:{...HORMUZ_DEPENDENCIES.flow,source:""}}}));
 assert.throws(()=>systemEngravingV32({model:{...HORMUZ_DEPENDENCIES,routes:[{id:"hormuz"}]}}));
 assert.throws(()=>systemEngravingV32({model:{...HORMUZ_DEPENDENCIES,spare:{min:8,max:3}}}));
});
