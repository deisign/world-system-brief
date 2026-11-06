import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {verifyPhysicalEngraving,physicalEngravingPage} from "./physical-engraving.js";

const entry={id:"tanker-study-01",review_status:"reviewed",engine_revision:"a".repeat(40),model_source:"https://github.com/bumicodes/draw-beautiful",title:{en:"Tanker",ua:"Танкер"},caption:{en:"Schematic",ua:"Схема"},alt:{en:"Engraved tanker",ua:"Гравірований танкер"},qa:{desktop:true,mobile:true,reduced_motion:true,closeup:true},editorial:{subject_class:"generic_physical_carrier",physical_role:{en:"Oil tanker carrier",ua:"Нафтовий танкер"},mechanism:{en:"Seaborne flow depends on maritime routes",ua:"Морські потоки залежать від маршрутів"},limitations:{en:"No precise vessel, route or lost capacity",ua:"Не конкретне судно, маршрут чи втрачена потужність"},related_entities:["hormuz","gulf-oil-flow"],composition_route:"/{lang}/visualizations/chokepoint-bypass/",paired_thesis:{en:"Partial bypass is not full substitution",ua:"Частковий обхід не повне заміщення"}}};
test("requires a real reviewed vector SVG and complete QA",()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"wsb-engraving-"));
 try{
  const dest=path.join(dir,"visualizations","engravings",entry.id);fs.mkdirSync(dest,{recursive:true});
  fs.writeFileSync(path.join(dest,"plate.svg"),'<svg viewBox="0 0 100 100"><path d="M0 0L20 20"/></svg>');
  assert.equal(verifyPhysicalEngraving(entry,dir).entry.id,entry.id);
  assert.throws(()=>verifyPhysicalEngraving({...entry,review_status:"draft"},dir));
  assert.throws(()=>verifyPhysicalEngraving({...entry,qa:{...entry.qa,mobile:false}},dir));
  fs.writeFileSync(path.join(dest,"plate.svg"),'<svg><script>alert(1)</script><path d="M0 0"/></svg>');
  assert.throws(()=>verifyPhysicalEngraving(entry,dir));
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test("bilingual responsive presentation has proper SVG alt and provenance",()=>{
 for(const lang of ["en","ua"]){const p=physicalEngravingPage({entry,lang});assert.match(p,/img src=/);assert.match(p,/MODEL SOURCE|ДЖЕРЕЛО МОДЕЛІ/);assert.match(p,new RegExp('lang="'+lang+'"'));}
});


test("engraving review rejects missing or misleading editorial scope metadata",()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"wsb-engraving-editorial-"));
 try{
  const plate=path.join(tmp,"visualizations","engravings",entry.id);
  fs.mkdirSync(plate,{recursive:true});
  fs.writeFileSync(path.join(plate,"plate.svg"),'<svg viewBox="0 0 100 100"><path d="M0 0L20 20"/></svg>');
  assert.throws(()=>verifyPhysicalEngraving({...entry,editorial:undefined},tmp),/editorial subject/);
  assert.throws(()=>verifyPhysicalEngraving({...entry,editorial:{...entry.editorial,physical_role:{en:"Vessel",ua:""}}},tmp),/Missing editorial physical_role ua/);
  assert.throws(()=>verifyPhysicalEngraving({...entry,editorial:{...entry.editorial,related_entities:["hormuz","hormuz"]}},tmp),/Invalid related entities/);
  assert.throws(()=>verifyPhysicalEngraving({...entry,editorial:{...entry.editorial,composition_route:"https://example.org/unsafe"}},tmp),/Invalid editorial composition route/);
  const registry=path.join(tmp,"knowledge");fs.mkdirSync(registry);
  fs.writeFileSync(path.join(registry,"entities.json"),JSON.stringify({entities:[{slug:"hormuz"}]}));
  assert.throws(()=>verifyPhysicalEngraving(entry,tmp),/Unregistered editorial entity gulf-oil-flow/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test("bilingual plate explicitly separates material form, mechanism and excluded interpretations",()=>{
 for(const lang of ["en","ua"]){
  const html=physicalEngravingPage({entry,lang});
  assert.match(html,/class="editorial"/);
  assert.match(html,/href="\/(en|ua)\/visualizations\/chokepoint-bypass\/"/);
  assert.match(html,/class="boundary"/);
  assert.match(html,new RegExp(lang==="en"?"Seaborne flow depends":"Морські потоки залежать"));
  assert.doesNotMatch(html,/href="https:\/\/example.org\/unsafe"/);
 }
 assert.throws(()=>physicalEngravingPage({entry,lang:"ru"}),/Unsupported/);
});

test("real rare-earth engraving and mobile variant pass verified physical SVG validation",()=>{
 const root=path.resolve(".");
 const manifest=JSON.parse(fs.readFileSync(path.join(root,"visualizations","engravings","manifest.json"),"utf8"));
 assert.equal(manifest.engravings.length,2);
 const rare=manifest.engravings.find(x=>x.id==="rare-earth-separation-study-01");
 assert.equal(rare?.editorial.subject_class,"generic_processing_cascade");
 const {svgPath,mobilePath}=verifyPhysicalEngraving(rare,root);
 assert.ok(fs.existsSync(svgPath));
 assert.ok(fs.existsSync(mobilePath));
 assert.notEqual(fs.readFileSync(svgPath,"utf8"),fs.readFileSync(mobilePath,"utf8"));
 assert.match(rare.editorial.composition_route,/ledger\/dependencies\/uk-critical-minerals-resilience/);
 for(const lang of ["en","ua"]){
  const html=physicalEngravingPage({entry:rare,lang});
  assert.match(html,/<picture>/);
  assert.match(html,/max-width: 650px/);
  assert.match(html,/rare-earth-separation-study-01-mobile.svg/);
  assert.match(html,/ledger\/dependencies\/uk-critical-minerals-resilience/);
  assert.match(html,/width="960" height="640"/);
  assert.doesNotMatch(html,/explainers\/hormuz/);
  assert.doesNotMatch(html,/specific vessel|конкретного судна/);
 }
});
test("reject unsupported physical subject, missing mobile asset, and unsafe mobile SVG",()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"wsb-bilingual-plate-"));
 try{
  const plate=path.join(dir,"visualizations","engravings",entry.id);fs.mkdirSync(plate,{recursive:true});
  const svg='<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L10 10"/></svg>';
  fs.writeFileSync(path.join(plate,"plate.svg"),svg);
  let candidate={...entry,id:entry.id,mobile_plate:"plate-mobile.svg",svg_dimensions:{width:960,height:640}};
  assert.throws(()=>verifyPhysicalEngraving(candidate,dir),/mobile engraving SVG missing/);
  fs.writeFileSync(path.join(plate,"plate-mobile.svg"),svg);
  assert.equal(verifyPhysicalEngraving(candidate,dir).mobilePath,path.join(plate,"plate-mobile.svg"));
  fs.writeFileSync(path.join(plate,"plate-mobile.svg"),'<svg xmlns="http://www.w3.org/2000/svg"><script>bad()</script><path d="M0 0"/></svg>');
  assert.throws(()=>verifyPhysicalEngraving(candidate,dir),/Unsafe or externally loaded mobile SVG/);
  fs.writeFileSync(path.join(plate,"plate-mobile.svg"),svg);
  candidate={...candidate,editorial:{...candidate.editorial,subject_class:"unsupported"}};
  assert.throws(()=>verifyPhysicalEngraving(candidate,dir),/editorial subject/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
