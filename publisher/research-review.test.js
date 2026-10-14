import test from "node:test";
import assert from "node:assert/strict";
import { reviewCandidates } from "./research-review.js";

const source={id:"SRC-1",url:"https://example.com",publication_date:"2026-10-14"};
function bundle(candidate){return {sources:[source],candidates:[candidate],editorial_flags:[]};}
test("misdated confirmed Δ is downgraded without losing source",()=>{
 const data=bundle({id:"prior-day",classification:"confirmed_delta",event_date:"2026-10-13",source_ids:["SRC-1"],confidence:"high"});
 const out=reviewCandidates(data,"2026-10-14");
 assert.equal(out.downgraded,1);
 assert.equal(out.bundle.candidates[0].classification,"developing");
 assert.equal(out.bundle.candidates[0].proposed_classification,"confirmed_delta");
 assert.deepEqual(out.bundle.candidates[0].review_reasons,["event_date_not_issue_date"]);
 assert.equal(out.bundle.sources.length,1);
});
test("missing evidence and low confidence are flagged",()=>{
 const data=bundle({id:"uncertain",classification:"confirmed_delta",event_date:"2026-10-14",source_ids:[],confidence:"low"});
 const out=reviewCandidates(data,"2026-10-14");
 assert.deepEqual(out.bundle.candidates[0].review_reasons,["no_registered_sources","insufficient_confidence"]);
});
test("potentially supported confirmed Δ still requires independent verification",()=>{
 const data=bundle({id:"plausible",classification:"confirmed_delta",event_date:"2026-10-14",source_ids:["SRC-1"],confidence:"high"});
 assert.equal(reviewCandidates(data,"2026-10-14").downgraded,0);
});
test("unknown source is preserved as unresolved and cannot confirm delta",()=>{
 const data=bundle({id:"bad",classification:"confirmed_delta",event_date:"2026-10-14",source_ids:["SRC-1","missing"],confidence:"high"});
 const out=reviewCandidates(data,"2026-10-14");
 assert.equal(out.downgraded,1);
 assert.equal(out.bundle.candidates[0].classification,"developing");
 assert.deepEqual(out.bundle.candidates[0].source_ids,["SRC-1"]);
 assert.deepEqual(out.bundle.candidates[0].unresolved_source_ids,["missing"]);
 assert.ok(out.bundle.editorial_flags.some(x=>x.includes("missing")));
});
