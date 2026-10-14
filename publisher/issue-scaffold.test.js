import test from "node:test";
import assert from "node:assert/strict";
import {issueScaffold} from "./issue-scaffold.js";
const base={issue_id:"WSB-0017",date:"2026-10-14",objects:[{id:"port",current_state:"open",status:"persistent"}]};
const research={issue_date:"2026-10-15",sources:[{id:"S",url:"https://example.com/news",publication_date:"2026-10-15",claim:"Alleged closure"}],
 candidates:[{id:"port",headline:"Port closure reported",classification:"confirmed_delta",current_state:"closed",event_date:"2026-10-15",source_ids:["S"]}]};
const audit={issue_date:"2026-10-15",publication_authorized:false,candidates:[{id:"port",eligible_source_ids:["S"],flags:["review"]}]};
const loc={en:{locale:"en"},ua:{locale:"ua"}};
test("keeps proposed state out of carried-forward canonical state",()=>{const r=issueScaffold(research,audit,base,loc);assert.equal(r.files["state.json"].objects[0].current_state,"open");assert.equal(r.files["claims.json"].claims[0].proposed_state,"closed");assert.equal(r.manifest.publication_authorized,false);assert.match(r.files["read/ua.md"],/НЕ ПУБЛІКУВАТИ/);});
test("requires independent audit",()=>assert.throws(()=>issueScaffold(research,{...audit,publication_authorized:true},base,loc),/Review gate/));
test("requires baseline date older than target",()=>assert.throws(()=>issueScaffold(research,audit,{...base,date:"2026-10-16"},loc),/Previous canonical state/));
