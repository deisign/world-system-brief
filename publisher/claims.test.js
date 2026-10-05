import test from "node:test";
import assert from "node:assert/strict";
import {buildClaimIndex,claimStats} from "./claims.js";

test("resolves canonical entity ids and attaches evidence and relations",()=>{
 const bundles=[{state:{date:"2026-10-02",issue_id:"WSB-0005"},claims:{claims:[{id:"c1",kind:"observed",status:"confirmed_delta",entity_ids:["ENT-1"],source_ids:["s1"]}]},evidence:{records:[{id:"s1",url:"https://example.com"}]},relations:{relations:[{id:"r1",claim_ids:["c1"]}]}}];
 const out=buildClaimIndex(bundles,{entities:[{id:"ENT-1",slug:"hormuz",labels:{en:"Hormuz",ua:"Ормуз"}}]});
 assert.equal(out[0].entities[0].slug,"hormuz");assert.equal(out[0].sources[0].id,"s1");assert.equal(out[0].relations[0].id,"r1");
 assert.deepEqual(claimStats(out),{total:1,confirmed_delta:1,observed:1});
});
