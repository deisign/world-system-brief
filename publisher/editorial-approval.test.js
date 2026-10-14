import test from "node:test";
import assert from "node:assert/strict";
import {approveDraft} from "./editorial-approval.js";
const draft={manifest:{date:"2026-10-15",publication_authorized:false},
 state:{date:"2026-10-15",objects:[{id:"port",current_state:"open",status:"persistent"}]},
 evidence:{records:[{id:"SRC1",url:"https://example.org"}]},
 claims:{claims:[{id:"DRAFT-CLM-port",statement:"Reported interruption",observed_at:"2026-10-14",source_ids:["SRC1"]}]}};
const approval={issue_date:"2026-10-15",issue_id:"WSB-0018",editorial_approval:true,
 source_verification_complete:true,translation_verified:true,candidates:[{id:"DRAFT-CLM-port",decision:"accept",reviewer_note:"Verified"}]};
test("accepts evidence update without inventing state change",()=>{const r=approveDraft(draft,approval);assert.equal(r.state.objects[0].current_state,"open");assert.equal(r.claims.claims[0].status,"evidence_update");});
test("rejected claim is excluded",()=>{const r=approveDraft(draft,{...approval,candidates:[{id:"DRAFT-CLM-port",decision:"reject",reviewer_note:"Unreliable"}]});assert.equal(r.claims.claims.length,0);});
test("rejects missing signoffs or unreviewed candidates",()=>{assert.throws(()=>approveDraft(draft,{...approval,translation_verified:false}),/sign-off/);assert.throws(()=>approveDraft(draft,{...approval,candidates:[]}),/Every candidate/);});
test("requires event-date match for confirmed delta",()=>{assert.throws(()=>approveDraft(draft,{...approval,candidates:[{id:"DRAFT-CLM-port",decision:"accept",reviewer_note:"Confirmed",confirmed_delta:true,verified_new_state:"closed",verified_entity_id:"port"}]},),/./);});
