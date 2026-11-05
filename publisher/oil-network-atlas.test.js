import test from "node:test";
import assert from "node:assert/strict";
import {loadOilNetwork,validateOilNetwork,oilNetworkPage} from "./oil-network-atlas.js";

test("NETWORK pilot resolves six dated canonical relations and source IDs across three WSB issues",()=>{
 const d=loadOilNetwork();
 assert.equal(d.nodes.length,7);
 assert.equal(d.records.length,6);
 assert.deepEqual(new Set(d.records.map(r=>r.issue)),new Set(["0009","0010","0011"]));
 assert.ok(d.records.every(r=>r.sources.every(s=>s.url.startsWith("https://")&&s.date)));
 assert.equal(d.records.filter(r=>r.predicate==="buffers"||r.type==="buffers").length,2);
 assert.equal(validateOilNetwork(d),true);
});
test("NETWORK is not drawn as three unrelated routes; source-linked multilingual graph and edge ledger",()=>{
 const d=loadOilNetwork();
 for(const lang of ["en","ua"]){
   const s=oilNetworkPage({lang,data:d});
   assert.ok(s.includes('lang="'+lang+'"'));
   assert.ok(s.includes('<svg'));
   assert.equal((s.match(/data-edge=/g)||[]).length,6);
   assert.equal((s.match(/class="relation"/g)||[]).length,6);
   assert.equal((s.match(new RegExp(`<a href="/${lang}/entity/`,"g"))||[]).length,7);
   assert.equal((s.match(/data-network-relation=/g)||[]).length,6);
   assert.equal((s.match(/class="edge-label"/g)||[]).length,6);
   assert.ok(s.includes(lang==="en"?"CONSTRAINT":"ОБМЕЖЕННЯ"));
   assert.ok(s.includes(lang==="en"?"BUFFER / RECOVERY":"БУФЕР / ВІДНОВЛЕННЯ"));
   assert.ok(s.includes(lang==="en"?"DOWNSTREAM EFFECT":"НАСЛІДОК ДАЛІ В СИСТЕМІ"));
   assert.ok(s.includes(lang==="en"?"REVEALS":"ВИЯВЛЯЄ"));
   assert.ok(s.includes(lang==="en"?"BUFFERS":"ПОМ’ЯКШУЄ"));
   assert.ok(!s.includes("01 / 02 /"));
   assert.ok(!s.includes("02 / 01 /"));
   assert.ok(s.includes('WSB-0011'));
   assert.ok(s.includes('WSB-SRC-0011-03'));
   assert.ok(s.includes(lang==="en"?"supports recovery":"підтримує відновлення"));
   assert.ok(s.includes('href="/'+(lang==="en"?"ua":"en")+'/visualizations/oil-network/"'));
 }
});
test("NETWORK rejects ungrounded edges, invalid translated nodes and inflated leverage",()=>{
 const make=()=>structuredClone(loadOilNetwork());
 const unsourced=make();unsourced.records[0].sources=[];assert.throws(()=>validateOilNetwork(unsourced));
 const fabricated=make();fabricated.records[0].to="unknown-node";assert.throws(()=>validateOilNetwork(fabricated));
 const untranslated=make();untranslated.nodes[1].labels.ua="";assert.throws(()=>validateOilNetwork(untranslated));
 const falseRent=make();falseRent.config.qualifications.rent_distribution="quantified";assert.throws(()=>validateOilNetwork(falseRent));
 assert.throws(()=>oilNetworkPage({lang:"fr"}));
});
