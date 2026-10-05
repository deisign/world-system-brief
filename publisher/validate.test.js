import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {validateIssue} from "./validate.js";
const fixture=({bad=false}={})=>{const d=fs.mkdtempSync(path.join(os.tmpdir(),"wsb-"));const write=(n,x)=>fs.writeFileSync(path.join(d,n),JSON.stringify(x));write("state.json",{objects:[{id:"a",current_state:"on",status:"persistent"}]});write("evidence.json",{records:[{id:"s1",url:"https://example.com/x",publication_date:"2026-10-05",claim:"fact"}]});write("claims.json",{claims:[{id:"c1",entity_ids:[bad?"missing":"a"],source_ids:["s1"],status:"persistent"}]});write("relations.json",{relations:[]});return d};
test("accepts coherent issue",()=>assert.deepEqual(validateIssue(fixture()),[]));
test("rejects dangling entity",()=>assert.match(validateIssue(fixture({bad:true})).join("\n"),/absent from state\.objects/));
