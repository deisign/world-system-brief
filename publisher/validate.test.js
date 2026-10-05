import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {validateIssue} from "./validate.js";

function fixture({bad=false,useCanonicalId=false}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"wsb-")), base=path.join(root,"issues","0001");
 fs.mkdirSync(base,{recursive:true});fs.mkdirSync(path.join(root,"knowledge"),{recursive:true});
 const write=(n,x)=>fs.writeFileSync(path.join(base,n),JSON.stringify(x));
 fs.writeFileSync(path.join(root,"knowledge","entities.json"),JSON.stringify({entities:[{id:"ENT-000001",slug:"hormuz"}]}));
 write("state.json",{objects:[{id:"hormuz",current_state:"on",status:"persistent"}]});
 write("evidence.json",{records:[{id:"s1",url:"https://example.com/x",publication_date:"2026-10-05",claim:"fact"}]});
 write("claims.json",{claims:[{id:"c1",entity_ids:[bad?"ENT-999999":useCanonicalId?"ENT-000001":"hormuz"],source_ids:["s1"],status:"persistent"}]});
 write("relations.json",{relations:[]});
 return {root,base};
}

test("accepts slug references",()=>{const x=fixture();assert.deepEqual(validateIssue(x.base,{root:x.root}),[])});
test("accepts canonical ENT id for a slug in state",()=>{const x=fixture({useCanonicalId:true});assert.deepEqual(validateIssue(x.base,{root:x.root}),[])});
test("rejects genuinely unknown entity",()=>{const x=fixture({bad:true});assert.match(validateIssue(x.base,{root:x.root}).join("\n"),/unknown entity ENT-999999/)});
