import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

test("editorial console script parses and stays client-side", () => {
 const html=fs.readFileSync("editorial/index.html","utf8");
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script,"inline script exists");
 assert.doesNotThrow(()=>new vm.Script(script),"browser script syntax");
 assert.match(script,/draft:true/,"only a draft PR is requested");
 assert.match(script,/research\/approvals\//,"PR contains editorial decisions");
 assert.doesNotMatch(script,/localStorage|sessionStorage/,"token must not persist");
 assert.doesNotMatch(script,/issues\/.*PUT/,"no direct issue writes");
});
test("editorial desk is included in generated site",()=> {
 assert.ok(fs.existsSync("editorial/index.html"));
 const html=fs.readFileSync("editorial/index.html","utf8");
 assert.match(html,/Выбор выпуска из GitHub/);
 assert.match(html,/Создать Draft PR/);
});