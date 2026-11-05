import test from "node:test";
import assert from "node:assert/strict";
import {atlasPalette,atlasEscape,atlasSectionTitle,atlasSourceAnchor} from "./atlas-primitives.js";

test("Atlas primitives share stable palette and escape untrusted literal content",()=>{
 assert.equal(atlasPalette.paper,"#F3EBDD");
 assert.equal(atlasPalette.constraint,"#A2362A");
 assert.equal(atlasPalette.related,"#46697A");
 assert.equal(atlasPalette.downstream,"#B08C3E");
 assert.ok(Object.isFrozen(atlasPalette));
 assert.equal(atlasEscape('<x a="&">'),"&lt;x a=&quot;&amp;&quot;&gt;");
});

test("Atlas register normalizes pre-numbered EN/UA section titles",()=>{
 assert.equal(atlasSectionTitle(1,"02 / МЕРЕЖА ВІДНОШЕНЬ"),"01 / МЕРЕЖА ВІДНОШЕНЬ");
 assert.equal(atlasSectionTitle(2,"01 / PHYSICAL SYSTEM"),"02 / PHYSICAL SYSTEM");
 assert.equal(atlasSectionTitle(3,"03 / DEPENDENCY"),"03 / DEPENDENCY");
 assert.throws(()=>atlasSectionTitle(0,"heading"));
 assert.throws(()=>atlasSectionTitle(4,"04 / "));
});

test("Atlas evidence links remain clickable and reject malformed URLs or labels",()=>{
 const x=atlasSourceAnchor({url:"https://example.org/a?b=1&c=2",label:"SRC-01",title:"Publisher · 2026"});
 assert.match(x,/href="https:\/\/example\.org\/a\?b=1&amp;c=2"/);
 assert.match(x,/rel="noopener noreferrer"/);
 assert.match(x,/SRC-01/);
 assert.throws(()=>atlasSourceAnchor({url:"javascript:alert(1)",label:"bad"}));
 assert.throws(()=>atlasSourceAnchor({url:"http://example.com/",label:"bad"}));
 assert.throws(()=>atlasSourceAnchor({url:"https://example.org",label:""}));
});
