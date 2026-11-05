import test from "node:test";
import assert from "node:assert/strict";
import {readAtlasPilot,loadReadPilot} from "./read-atlas-pilot.js";

test("READ 0038 preview retains bilingual canonical narrative, source bounds and original URL",()=>{
 const data=loadReadPilot();
 for(const lang of ["en","ua"]){
  const html=readAtlasPilot({lang,data});
  assert.ok(html.includes('lang="'+lang+'"'));
  assert.equal((html.match(/class="atlas-register-heading"/g)||[]).length,4);
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.ok(html.includes('class="mast atlas-mast"'));
  assert.ok(html.includes('WSB-0038-SRC-01'));
  assert.ok(html.includes('WSB-0038-SRC-02'));
  assert.ok(html.includes('irans-irgc-says-four-tankers-ablaze'));
  assert.ok(html.includes('href="/'+lang+'/brief/2026-11-04/"'));
  assert.ok(html.includes('href="/'+(lang==="en"?"ua":"en")+'/atlas/read/0038/"'));
  assert.ok(html.includes('>0</div>'));
  assert.ok(html.includes(lang==="en"?"independent verification of ship identities":"незалежною перевіркою ідентичності суден"));
  assert.ok(html.includes(lang==="en"?"Publication and underlying event dates are separate.":"Дата публікації та дата події відокремлені."));
 }
});
test("READ refuses unsupported issue and changed claim certainty without review",()=>{
 const d=loadReadPilot();
 const wrong=structuredClone(d);wrong.evidence.issue_id="WSB-9999";
 assert.throws(()=>readAtlasPilot({data:wrong}));
 const changed=structuredClone(d);changed.texts.en=changed.texts.en.replace("CONFIRMED NEW SYSTEM DELTAS: 0","CONFIRMED NEW SYSTEM DELTAS: 2");
 assert.throws(()=>readAtlasPilot({data:changed}));
 const missing=structuredClone(d);missing.evidence.records[0].url="";
 assert.throws(()=>readAtlasPilot({data:missing}));
 assert.throws(()=>readAtlasPilot({lang:"fr",data:d}));
});
