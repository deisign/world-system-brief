import test from "node:test";
import assert from "node:assert/strict";
import { trajectoriesPage } from "./trajectories-page.js";

test("renders entity trajectory and persistent relation",()=>{
 const html=trajectoriesPage({lang:"en",labels:{h:"Hormuz",f:"Fujairah"},states:{a:"adapting"},trajectories:[{id:"h",first:"2026-10-01",last:"2026-10-05",appearances:3,states:[{state:"a",date:"2026-10-05"}]}],persistentRelations:[{from:"f",type:"routes_around",to:"h",count:2,dates:["2026-10-01","2026-10-02"]}]});
 assert.match(html,/TRAJECTORIES/);
 assert.match(html,/Hormuz/);
 assert.match(html,/Fujairah/);
 assert.match(html,/routes_around/);
});
