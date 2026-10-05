import test from "node:test";
import assert from "node:assert/strict";
import {claimsListPage,claimPage} from "./claims-page.js";
const c={id:"c1",date:"2026-10-05",issue_id:"WSB-0008",kind:"inferred",status:"persistent",confidence:"high",statement:"Constraint persists.",entities:[{slug:"hormuz",labels:{en:"Hormuz",ua:"Ормуз"}}],sources:[{id:"s1",source:"Primary",url:"https://example.com",claim:"Evidence"}],relations:[],derived_from:[]};
test("renders claims index",()=>assert.match(claimsListPage({lang:"en",claims:[c]}),/Constraint persists/));
test("renders traceable claim",()=>{const h=claimPage({lang:"en",claim:c,byId:new Map([[c.id,c]])});assert.match(h,/CONFIDENCE/);assert.match(h,/Hormuz/);assert.match(h,/Primary/);assert.match(h,/WSB-0008/)});
