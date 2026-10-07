import test from "node:test";
import assert from "node:assert/strict";
import {buildTemporalRelations,currentSystemMap,egoSystemMap} from "./system-map.js";
const reg={entities:[{id:"E1",slug:"a",labels:{en:"A"}},{id:"E2",slug:"b",labels:{en:"B"}}]};
test("builds relation history across issues",()=>{const t=buildTemporalRelations([{state:{date:"2026-10-01",issue_id:"1"},relations:{relations:[{from:"E1",to:"E2",type:"buffers",state:"active"}]}},{state:{date:"2026-10-02",issue_id:"2"},relations:{relations:[{from:"a",to:"b",type:"buffers",state:"active"}]}}],reg);assert.equal(t.length,1);assert.equal(t[0].appearances,2);assert.equal(t[0].first,"2026-10-01");assert.equal(currentSystemMap(t).nodes.length,2)});
test("excludes ended current relations",()=>{const map=currentSystemMap([{from:"a",to:"b",current_state:"ended",last:"2026-10-02",from_entity:reg.entities[0],to_entity:reg.entities[1]}]);assert.equal(map.edges.length,0)});

test("reconstructs map as of a past date",()=>{const t=buildTemporalRelations([{state:{date:"2026-10-01",issue_id:"1"},relations:{relations:[{from:"a",to:"b",type:"buffers",state:"active"}]}},{state:{date:"2026-10-03",issue_id:"3"},relations:{relations:[{from:"a",to:"b",type:"buffers",state:"ended"}]}}],reg);const m=currentSystemMap(t,{asOf:"2026-10-02"});assert.equal(m.edges.length,1);assert.equal(m.edges[0].current_state,"active")});
test("supports one and two hop neighbourhoods",()=>{const e={labels:{en:"x"}};const map={nodes:["a","b","c"].map(slug=>({slug,...e})),edges:[{from:"a",to:"b"},{from:"b",to:"c"}]};assert.equal(egoSystemMap(map,"a",1).nodes.length,2);assert.equal(egoSystemMap(map,"a",2).nodes.length,3)});
