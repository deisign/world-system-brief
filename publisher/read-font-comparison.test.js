import test from "node:test";
import assert from "node:assert/strict";
import {readFontComparison} from "./read-font-comparison.js";
import {loadReadPilot,readAtlasPilot} from "./read-atlas-pilot.js";

test("Font comparison preserves the same bilingual READ content, evidence, page dimensions and titles",()=>{
 const data=loadReadPilot();
 for(const lang of ["en","ua"]){
  const base=readAtlasPilot({lang,data});
  const a=readFontComparison({lang,variant:"plex",data});
  const b=readFontComparison({lang,variant:"manrope",data});
  const title=lang==="en"?"New tanker destruction claims remain unverified":"НОВІ ЗАЯВИ ПРО ЗНИЩЕННЯ ТАНКЕРІВ ЗАЛИШАЮТЬСЯ НЕПІДТВЕРДЖЕНИМИ";
  for(const h of [a,b]){
   assert.ok(h.includes('lang="'+lang+'"'));
   assert.ok(h.includes(title));
   assert.ok(h.includes("WSB-0038-SRC-01"));
   assert.ok(h.includes("WSB-0038-SRC-02"));
   assert.ok(h.includes("Reuters"));
   assert.ok(h.includes('class="atlas-register-heading"'));
   assert.ok(h.includes('font-size:clamp(34px,4.4vw,64px)'));
   assert.ok(h.includes('IBM Plex Serif'));
   assert.ok(h.includes('IBM Plex Mono'));
   assert.ok(h.includes('fonts.googleapis.com/css2?'));
   assert.ok(h.includes(lang==="en"?'Confirmed new system deltas'.toUpperCase():'ПІДТВЕРДЖЕНІ НОВІ СИСТЕМНІ ЗМІНИ'));
   assert.ok(h.includes('href="/'+lang+'/atlas/read/0038/"'));
  }
  assert.ok(!base.includes("fonts.googleapis.com"));
  assert.ok(a.includes("IBM+Plex+Sans:wght@700"));
  assert.ok(b.includes("Manrope:wght@800"));
  assert.ok(a.includes('/type/manrope/'));
  assert.ok(b.includes('/type/plex/'));
  assert.equal((a.match(/<h1>/g)||[]).length,1);
  assert.equal((b.match(/<h1>/g)||[]).length,1);
 }
});

test("Font trial validates variants and preserves authored source regardless of typeface",()=>{
 assert.throws(()=>readFontComparison({lang:"fr"}));
 assert.throws(()=>readFontComparison({variant:"arial"}));
 const data=loadReadPilot();
 const bad=structuredClone(data);
 bad.evidence.records[0].url="";
 assert.throws(()=>readFontComparison({lang:"ua",variant:"plex",data:bad}));
});
