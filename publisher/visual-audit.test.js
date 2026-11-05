import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderPoster } from "../renderer/poster/poster-renderer.js";
import { dependencyMapPage } from "./dependency-map.js";

const poster = readFileSync(new URL("../issues/0022/state.json", import.meta.url), "utf8");
const locale = JSON.parse(readFileSync(new URL("../issues/0022/locale/en.json", import.meta.url), "utf8"));
test("POSTER preserves print dimensions and adapts below tablet width", () => {
  const html = renderPoster(JSON.parse(poster), locale, "en");
  assert.match(html, /@media\(max-width:1200px\)/);
  assert.match(html, /@media print/);
  assert.match(html, /width:1400px;height:2000px/);
  assert.match(html, /<h1 class="title">/);
  assert.match(html, /\.title\{[^}]*margin:0/);
});
test("dependency map binds visible nodes to issue filtered relationships", () => {
 const html=dependencyMapPage({lang:"en",registry:{entities:[]},relations:[{issue:"WSB-TEST",from:"a",to:"b",type:"buffers",sources:[{name:"Example",url:"https://example.com"}]}]});
 assert.match(html,/data-map-node=/);
 assert.match(html,/data-map-relation=/);
 assert.match(html,/data-from=/);
 assert.match(html,/data-to=/);
 assert.match(html,/querySelectorAll\("\[data-map-node\]"\)/);
});

test('READ typography constrains long Cyrillic headlines on narrow phones',async()=>{
 const {editorialSkin}=await import('./editorial-skin.js');
 assert.match(editorialSkin,/article>h1\{[^}]*overflow-wrap:anywhere/);
 assert.match(editorialSkin,/@media\(max-width:680px\)/);
 assert.match(editorialSkin,/article>h1\{font-size:clamp\(34px,8\.8vw,54px\)/);
});
test('mobile POSTER retains 1400×2000 print canvas but exposes a legible scrollable graph',()=>{
 const html=renderPoster(JSON.parse(poster),locale,'en');
 assert.match(html,/role="region" aria-label="Scroll diagram horizontally"/);
 assert.match(html,/\.diagram svg\{flex:0 0 1000px;width:1000px/);
 assert.match(html,/@media print\{[^}]*\.diagram\{overflow:visible\}/);
});
