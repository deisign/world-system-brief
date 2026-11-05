import test from "node:test";
import assert from "node:assert/strict";
import {atlasEditorialHeader,atlasRegisterHeading,atlasSharedShellCSS} from "./atlas-layout.js";
import {oilNetworkPage} from "./oil-network-atlas.js";
import {euvAtlasPage} from "./euv-atlas.js";
import {systemEngravingV33} from "./system-engraving-v33.js";

test("shared editorial header escapes content and generates keyboard-accessible local navigation",()=>{
 const html=atlasEditorialHeader({subtitle:"Research",kicker:"FLOW",title:"A & B",lead:"Source <claim>",links:[{href:"/en/dependencies/",label:"Index"},{href:"/ua/visualizations/euv-optics/",label:"UA"}]});
 assert.match(html,/class="mast atlas-mast"/);
 assert.match(html,/class="nav atlas-nav" aria-label="Editorial navigation"/);
 assert.match(html,/A &amp; B/);
 assert.match(html,/Source &lt;claim&gt;/);
 assert.throws(()=>atlasEditorialHeader({subtitle:"S",kicker:"K",title:"T",lead:"L",links:[{href:"javascript:alert(1)",label:"Bad"},{href:"/en/ok/",label:"OK"}]}));
 assert.throws(()=>atlasEditorialHeader({subtitle:"S",kicker:"K",title:"T",lead:"L",links:[{href:"//evil.example/",label:"Bad"},{href:"/en/ok/",label:"OK"}]}));
 assert.equal(atlasRegisterHeading(1,"02 / МЕРЕЖА"),'<h2 class="atlas-register-heading">01 / МЕРЕЖА</h2>');
 assert.match(atlasSharedShellCSS,/@media\(max-width:600px\)/);
});

test("FLOW, CHAIN, NETWORK keep independent mechanisms with one shared editorial shell and four registers",()=>{
 for(const [name,render] of [["flow",systemEngravingV33],["chain",euvAtlasPage],["network",oilNetworkPage]]){
  for(const lang of ["en","ua"]){
   const html=render({lang});
   assert.equal((html.match(/class="mast atlas-mast"/g)||[]).length,1,name+" mast "+lang);
   assert.equal((html.match(/class="nav atlas-nav"/g)||[]).length,1,name+" navigation "+lang);
   assert.equal((html.match(/class="atlas-register-heading"/g)||[]).length,4,name+" registers "+lang);
   assert.ok(html.includes('href="/'+(lang==="en"?"ua":"en")+'/visualizations/'),name+" counterpart "+lang);
   assert.equal((html.match(/<h1>/g)||[]).length,1,name+" h1 "+lang);
   assert.ok(html.includes('rel="noopener noreferrer"'),name+" source links "+lang);
   assert.ok(html.includes('@media(max-width:600px)'),name+" responsive "+lang);
  }
 }
});
