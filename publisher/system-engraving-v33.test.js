import test from "node:test";
import assert from "node:assert/strict";
import {systemEngravingV33,loadSystemVisualLedger,validateSystemVisualLedger} from "./system-engraving-v33.js";

test("03.3 renders a source-bound bilingual ledger and preserves the approved engraving",()=>{
 const data=loadSystemVisualLedger();
 for(const lang of ["en","ua"]){
  const html=systemEngravingV33({lang,data});
  assert.ok(html.includes('lang="'+lang+'"'));
  assert.ok(html.includes('/assets/engravings/tanker-study-01.svg'));
  assert.ok(html.includes('EAST–WEST'));
  assert.ok(html.includes('iea.org/about/oil-safety-and-emergency-response/strait-of-hormuz'));
  assert.ok(html.includes('2026-02'));
  assert.ok(html.includes('2025'));
  assert.ok(html.includes(lang==="en"?"Shipping security, access and insurance":"Безпека судноплавства, доступ і страхування"));
  assert.ok(!html.includes(lang==="ua"?"shipping access, security, insurance":"ПОКАЗНИКИ НЕ Є ОДНОРІДНИМИ"));
  assert.ok(html.includes('href="/'+(lang==="ua"?"en":"ua")+'/visualizations/chokepoint-bypass-v33/"'));
  assert.ok(html.indexOf('04 /')>html.indexOf('03 /'));
 }
});
test("03.3 refuses missing source, translation, invalid routes, inconsistent metric basis",()=>{
 const data=loadSystemVisualLedger();
 assert.throws(()=>systemEngravingV33({lang:"fr",data}));
 const broken=structuredClone(data);broken.routes[0].constraints.ua="";assert.throws(()=>validateSystemVisualLedger(broken));
 const unknown=structuredClone(data);unknown.metrics[0].source_ids=["NO-SUCH-SOURCE"];assert.throws(()=>validateSystemVisualLedger(unknown));
 const incompatible=structuredClone(data);incompatible.metrics[1].commodity="crude_and_products";assert.throws(()=>validateSystemVisualLedger(incompatible));
});
