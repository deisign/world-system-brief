import test from "node:test";
import assert from "node:assert/strict";
import {systemMapPage} from "./system-map-page.js";
test("renders linked nodes and temporal edge",()=>{const h=systemMapPage({lang:"en",date:"2026-10-06",map:{nodes:[{slug:"a",type:"flow",labels:{en:"A"}},{slug:"b",type:"constraint",labels:{en:"B"}}],edges:[{from:"a",to:"b",type:"reveals_constraint",first:"2026-10-01",last:"2026-10-06",appearances:2}]}});assert.match(h,/SYSTEM MAP/);assert.match(h,/reveals constraint/);assert.match(h,/2026-10-01 → 2026-10-06/);assert.match(h,/\/en\/entity\/a\//)});

test("renders temporal and neighbourhood controls",()=>{const h=systemMapPage({lang:"en",date:"2026-10-07",dates:["2026-10-06","2026-10-07"],map:{nodes:[],edges:[]}});assert.match(h,/id="map-date"/);assert.match(h,/id="map-window"/);assert.match(h,/1-HOP/);assert.match(h,/2026-10-07/)});
