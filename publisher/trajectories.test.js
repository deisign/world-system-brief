import test from "node:test";
import assert from "node:assert/strict";
import { buildTrajectories, relationPersistence } from "./trajectories.js";

const event=(date,issue,state)=>({state:{date,issue_id:issue},object:{current_state:state}});

test("keeps only recurring entities and compresses unchanged states",()=>{
  const idx=new Map([
    ["hormuz",[event("2026-10-01","WSB-0004","constrained"),event("2026-10-02","WSB-0005","constrained"),event("2026-10-05","WSB-0008","adapting")]],
    ["once",[event("2026-10-05","WSB-0008","new")]]
  ]);
  const out=buildTrajectories(idx,[]);
  assert.equal(out.length,1);
  assert.equal(out[0].id,"hormuz");
  assert.deepEqual(out[0].states.map(x=>x.state),["constrained","adapting"]);
});

test("finds relations repeated on different dates",()=>{
  const out=relationPersistence([
    {from:"a",type:"routes_around",to:"b",date:"2026-10-01",issue:"1"},
    {from:"a",type:"routes_around",to:"b",date:"2026-10-02",issue:"2"},
    {from:"x",type:"feeds",to:"y",date:"2026-10-02",issue:"2"}
  ]);
  assert.equal(out.length,1);
  assert.equal(out[0].count,2);
});
