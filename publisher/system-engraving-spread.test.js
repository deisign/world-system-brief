import test from "node:test";
import assert from "node:assert/strict";
import { systemEngravingSpread } from "./system-engraving-spread.js";

test("spread connects the actual reviewed SVG and system diagram without substituting raster art",()=>{
 for(const lang of ["en","ua"]){
  const html=systemEngravingSpread({lang});
  assert.match(html,/assets\/engravings\/tanker-study-01\.svg/);
  assert.match(html,/<svg\b[\s\S]*?<\/svg>/);
  assert.match(html,/iea\.org/);
  assert.match(html,/Draw Beautiful/);
  assert.match(html,/EAST–WEST/);
  assert.match(html,/Habshan|ХАБШАН/);
  assert.match(html,/widths do not represent capacity|не відображають пропускної здатності/);
  assert.match(html,new RegExp('lang="'+lang+'"'));
  assert.match(html,/href="\/en\/visualizations\/chokepoint-bypass\/"|href="\/ua\/visualizations\/chokepoint-bypass\/");
 }
});
test("spread rejects missing provenance and malformed engraving paths",()=>{
 assert.throws(()=>systemEngravingSpread({model:{routes:["hormuz","saudi","uae"],source:""}}));
 assert.throws(()=>systemEngravingSpread({engravingId:"../private"}));
 assert.throws(()=>systemEngravingSpread({lang:"fr"}));
});
