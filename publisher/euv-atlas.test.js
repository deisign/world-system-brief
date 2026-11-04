import test from "node:test";
import assert from "node:assert/strict";
import {euvAtlasPage,loadEuvStudy,validateEuvStudy} from "./euv-atlas.js";

test("EUV pilot renders EN/UA chain from evidence, without pretending an engraving exists",()=>{
 const d=loadEuvStudy();
 for(const lang of ["en","ua"]){
  const html=euvAtlasPage({lang,data:d});
  assert.ok(html.includes('lang="'+lang+'"'));
  assert.ok(html.includes('ZEISS'));
  assert.ok(html.includes('ASML'));
  assert.ok(html.includes('asml-20241231.htm'));
  assert.ok(html.includes(lang==="en"?"PROCEDURAL ENGRAVING / NOT YET APPROVED":"ПРОЦЕДУРНУ ГРАВЮРУ ЩЕ НЕ ЗАТВЕРДЖЕНО"));
  assert.ok(html.includes(lang==="en"?"Multilayer mirrors in vacuum":"Багатошарові дзеркала у вакуумі"));
  assert.equal((html.match(/class="chain-edge"/g)||[]).length,2);
  assert.equal((html.match(/class="process-step"/g)||[]).length,3);
  assert.ok(html.indexOf("ZEISS SMT")<html.indexOf("ASML /"));
  assert.ok(html.includes(lang==="en"?"Critical optical input":"Критичний оптичний компонент"));
  assert.ok(!html.includes('class="rail"'));
  assert.ok(html.includes('class="chain-edge critical"'));
  assert.ok(html.includes('.chain-edge.critical .edge-arrow{border-top-color:var(--red)}'));
  assert.ok(html.includes('.process-step:not(:last-of-type):before{content:""'));
  assert.ok(html.includes('href="/'+(lang==="en"?"ua":"en")+'/visualizations/euv-optics/"'));
  assert.ok(!html.includes('/assets/engravings/'));
  assert.ok(!html.includes('<img'));
 }
});
test("EUV evidence schema refuses unsupported physical art, source omission and missing translations",()=>{
 const d=loadEuvStudy();
 const clone=()=>structuredClone(d);
 const forged=clone();forged.physical.approved_engraving_id="made-up.svg";assert.throws(()=>validateEuvStudy(forged));
 const missing=clone();missing.nodes[0].source_ids=["NOT-FOUND"];assert.throws(()=>validateEuvStudy(missing));
 const untranslated=clone();untranslated.nodes[1].detail.ua="";assert.throws(()=>validateEuvStudy(untranslated));
 const wrong=clone();wrong.qualifications.substitution_horizon="0_days";assert.throws(()=>validateEuvStudy(wrong));
 const swapped=clone();swapped.edges.reverse();assert.throws(()=>validateEuvStudy(swapped));
 const brokenPhysical=clone();brokenPhysical.physical.stages[1].labels.ua="";assert.throws(()=>validateEuvStudy(brokenPhysical));
 const brokenEdge=clone();brokenEdge.edges[0].source_ids=["INVALID"];assert.throws(()=>validateEuvStudy(brokenEdge));
 assert.throws(()=>euvAtlasPage({lang:"fr",data:d}));
});
