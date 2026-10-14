import test from "node:test";
import assert from "node:assert/strict";
import {editorialPacket,renderPacket} from "./research-packet.js";
const bundle={issue_date:"2026-10-15",sources:[{id:"s",url:"https://example.org/report",publication_date:"2026-10-15"}],candidates:[{id:"a",headline:"Change",event_date:"2026-10-15",classification:"developing",source_ids:["s"]}]};
const audit={issue_date:"2026-10-15",baseline_issue_id:"WSB-0017",publication_authorized:false,candidates:[{id:"a",eligible_source_ids:["s"],flags:["needs_evidence"]}]};
test("builds a nonpublishing packet with source links",()=>{const p=editorialPacket(bundle,audit);assert.equal(p.ready_for_publication,false);assert.equal(p.translation_verified,false);assert.match(renderPacket(p,"en"),/example.org\/report/);assert.match(renderPacket(p,"ua"),/НЕ ПУБЛІКУВАТИ/);});
test("rejects unauthorized inputs",()=>assert.throws(()=>editorialPacket(bundle,{...audit,publication_authorized:true}),/review required/i));
test("rejects unaudited candidates",()=>assert.throws(()=>editorialPacket(bundle,{...audit,candidates:[]}),/Missing review/));
