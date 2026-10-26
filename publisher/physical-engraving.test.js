import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {verifyPhysicalEngraving,physicalEngravingPage} from "./physical-engraving.js";

const entry={id:"tanker-study-01",review_status:"reviewed",engine_revision:"a".repeat(40),model_source:"https://github.com/bumicodes/draw-beautiful",title:{en:"Tanker",ua:"Танкер"},caption:{en:"Schematic",ua:"Схема"},alt:{en:"Engraved tanker",ua:"Гравірований танкер"},qa:{desktop:true,mobile:true,reduced_motion:true,closeup:true}};
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
