import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {readGulfFlowEvidence,renderGulfFlowSvg,gulfFlowDiagramPage} from "./gulf-flow-chart.js";

const evidence=JSON.parse(fs.readFileSync("issues/0040/evidence.json","utf8")).records;
test("diagram strictly derives Vortexa volumes and reported crude share from issue evidence",()=>{
 const data=readGulfFlowEvidence(evidence);
 assert.equal(data.crude,14);
 assert.equal(data.share,86);
 assert.equal(data.products,3.1);
 assert.equal(data.productsShare,null);
 assert.equal(data.qualifier,"just over half");
 assert.deepEqual(data.sourceIds,["WSB-0040-SRC-02","WSB-0040-SRC-01"]);
});
test("dual-language SVG embeds provenance but no invented exact refined-product percentage",()=>{
 const data=readGulfFlowEvidence(evidence);
 for(const lang of ["en","ua"]){
  const svg=renderGulfFlowSvg(data,lang);
  assert.match(svg,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg,/<title id="g-title">/);
  assert.match(svg,/86%/);
  assert.match(svg,/3[.,]1/);
  assert.match(svg,/&gt;50%/);
  assert.match(svg,/WSB-0040-SRC-01, WSB-0040-SRC-02/);
  assert.doesNotMatch(svg,/<image\b|<script\b|<foreignObject\b|data:image/i);
  assert.doesNotMatch(svg,/52%|55%|56%|51%/);
  assert.match(svg,lang==="ua"?/Точну частку джерело не називає/:/Exact recovery percentage not reported/);
  const page=gulfFlowDiagramPage(data,lang);
  assert.match(page,/reuters\.com/);
  assert.match(page,new RegExp('href="/'+lang+'/brief/2026-11-06/"'));
  assert.match(page,/viewBox="0 0 960 660"/);
 }
});
test("rejects missing sources and ambiguous reworded observation rather than inventing figure",()=>{
 const wrong=JSON.parse(JSON.stringify(evidence));
 wrong[1].claim=wrong[1].claim.replace("just over half normal","about 60% normal");
 assert.throws(()=>readGulfFlowEvidence(wrong),/Missing paired flow observation/);
 const missing=evidence.filter(x=>x.id!=="WSB-0040-SRC-02");
 assert.throws(()=>readGulfFlowEvidence(missing),/Dated source records/);
 const invalid=readGulfFlowEvidence(evidence);
 assert.throws(()=>renderGulfFlowSvg({...invalid,productsShare:55},"en"),/Unverified metrics/);
 assert.throws(()=>renderGulfFlowSvg(invalid,"ru"),/Invalid locale/);
});
test("render is deterministic and source quantities change visual bar width",()=>{
 const d=readGulfFlowEvidence(evidence);
 const a=renderGulfFlowSvg(d,"en"),b=renderGulfFlowSvg(d,"en");
 assert.equal(a,b);
 const changed=renderGulfFlowSvg({...d,share:85},"en");
 assert.notEqual(a,changed);
 assert.match(a,/width="688"/);
 assert.match(changed,/width="680"/);
});
