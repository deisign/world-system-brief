import test from "node:test";
import assert from "node:assert/strict";
import {buildTemporalRelations,currentSystemMap} from "./system-map.js";
const reg={entities:[{id:"E1",slug:"a",labels:{en:"A"}},{id:"E2",slug:"b",labels:{en:"B"}}]};
test("builds relation history across issues",()=>{const t=buildTemporalRelations([{state:{date:"2026-10-01",issue_id:"1"},relations:{relations:[{from:"E1",to:"E2",type:"buffers",state:"active"}]}},{state:{date:"2026-10-02",issue_id:"2"},relations:{relations:[{from:"a",to:"b",type:"buffers",state:"active"}]}}],reg);assert.equal(t.length,1);assert.equal(t[0].appearances,2);assert.equal(t[0].first,"2026-10-01");assert.equal(currentSystemMap(t).nodes.length,2)});
test("excludes ended current relations",()=>{const map=currentSystemMap([{from:"a",to:"b",current_state:"ended",last:"2026-10-02",from_entity:reg.entities[0],to_entity:reg.entities[1]}]);assert.equal(map.edges.length,0)});
