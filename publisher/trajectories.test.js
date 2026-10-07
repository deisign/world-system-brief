import test from "node:test";
import assert from "node:assert/strict";
import { buildTrajectories, relationPersistence, detectTrajectoryPatterns } from "./trajectories.js";

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

test("detects a forming structural trajectory without inventing missing steps",()=>{
 const trajectories=[{id:"oil",states:[{date:"2026-10-01",issue:"1",state:"constrained"},{date:"2026-10-02",issue:"2",state:"adapting"}]}];
 const out=detectTrajectoryPatterns(trajectories,[{from:"oil",to:"route",type:"reroutes_via",date:"2026-10-03",issue:"3"}]);
 const p=out.find(x=>x.pattern==="constraint-adaptation-rerouting-bottleneck");
 assert.equal(p.status,"forming");assert.equal(p.matched_steps,3);assert.equal(p.confidence,"medium");
});
test("marks a complete pattern only when all ordered steps exist",()=>{
 const trajectories=[{id:"oil",states:[{date:"2026-10-01",issue:"1",state:"constrained"},{date:"2026-10-02",issue:"2",state:"adapting"},{date:"2026-10-04",issue:"4",state:"downstream products bottleneck"}]}];
 const rel=[{from:"oil",to:"route",type:"reroutes_via",date:"2026-10-03",issue:"3"}];
 const p=detectTrajectoryPatterns(trajectories,rel).find(x=>x.pattern==="constraint-adaptation-rerouting-bottleneck");
 assert.equal(p.status,"detected");assert.equal(p.matched_steps,4);assert.equal(p.confidence,"high");
});
