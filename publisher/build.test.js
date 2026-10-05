import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

test("publisher builds archive, entities and trajectories",()=>{
 const out=execFileSync(process.execPath,["publisher/build.js"],{encoding:"utf8"});
 assert.match(out,/Built \d+ issues;/);
 for(const p of ["dist/en/archive/index.html","dist/en/entities/index.html","dist/en/trajectories/index.html","dist/ua/trajectories/index.html"]) assert.equal(fs.existsSync(p),true,p);
 const html=fs.readFileSync("dist/en/trajectories/index.html","utf8");
 assert.match(html,/TRAJECTORIES/);
});
