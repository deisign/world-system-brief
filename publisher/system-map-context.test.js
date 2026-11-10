import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {systemMapVisualSVG} from './system-map-visual.js';
import {systemMapPage} from './system-map-page.js';
import {systemMapClientScript} from './system-map-client.js';
import {runConnectivityAudit} from './entity-connectivity-audit.js';

const entities={
 a:{slug:'a',type:'infrastructure',labels:{en:'Terminal A',ua:'Термінал А'}},
 b:{slug:'b',type:'system_dependency',labels:{en:'Port Software B',ua:'Портове ПЗ Б'}}
};
const recorded=[{from:'a',to:'b',type:'reports_to',appearances:1}];
const context=[{from:'a',to:'b',type:'contextual_association',sources:[{id:'SRC',url:'https://example.org/a',date:'2026-11-10'}]}];

test('context is absent from the diagram by default, present only when explicitly supplied',()=>{
 const normal=systemMapVisualSVG(recorded,entities,'en');
 assert.doesNotMatch(normal,/visual-context-edge/);
 assert.equal((normal.match(/class="visual-edge"/g)||[]).length,1);
 const overlay=systemMapVisualSVG(recorded,entities,'ua',null,context);
 assert.match(overlay,/class="visual-context-edge"/);
 assert.match(overlay,/stroke-dasharray="5 7"/);
 assert.match(overlay,/не причинність/);
 assert.equal((overlay.match(/class="visual-edge"/g)||[]).length,1);
});
test('diagram never manufactures a solid relation from context alone',()=>{
 const overlay=systemMapVisualSVG([],entities,'en',null,context);
 assert.doesNotMatch(overlay,/class="visual-edge"/);
 assert.equal((overlay.match(/class="visual-context-edge"/g)||[]).length,1);
 assert.match(overlay,/not causation/);
});
test('bilingual map exposes an opt-in, labelled context toggle',()=>{
 for(const lang of ['en','ua']){
  const html=systemMapPage({lang,map:{nodes:Object.values(entities),edges:recorded},date:'2026-11-10',dates:['2026-11-10']});
  assert.match(html,/id="map-context-toggle"/);
  assert.match(html,lang==='ua'?/КОНТЕКСТНІ ЗВ’ЯЗКИ/:/EVIDENCE CONTEXT/);
  assert.match(html,lang==='ua'?/не причинність/:/not causation/);
  assert.doesNotMatch(html,/id="map-context-toggle" checked/);
 }
});
test('map client filters context by dated source and leaves recorded edge counts unchanged',()=>{
 const html=systemMapClientScript({temporal:[],entities,contextRelations:context,lang:'en'});
 assert.match(html,/D\.contextRelations/);
 assert.match(html,/v\.date<=asOf/);
 assert.match(html,/v\.date>=since/);
 assert.match(html,/drawSVG\(edges,D\.entities,D\.lang,focus,context\)/);
 assert.match(html,/map-context-toggle/);
 assert.match(html,/edge-count/);
});
test('real corpus context associations are source linked, not synthetic baselines',()=>{
 const audit=runConnectivityAudit();
 assert.ok(audit.context_relations.length>0);
 assert.ok(audit.context_relations.every(r=>r.level==='contextual'));
 assert.ok(audit.context_relations.every(r=>r.sources.length>0));
 assert.ok(audit.context_relations.every(r=>r.sources.every(s=>s.url.startsWith('https://')&&s.date)));
 assert.ok(audit.context_relations.every(r=>!r.sources.some(s=>s.id.includes('BASELINE'))));
});
test('published map receives audited relationships without promoting them into explicit edges',()=>{
 const build=fs.readFileSync('publisher/publish-system-map.js','utf8');
 assert.match(build,/contextRelations:audit\.context_relations/);
 assert.match(build,/systemMapClientData\(temporal,registry,lang\)/);
 assert.doesNotMatch(build,/temporal\.push\(\.\.\.audit\.context_relations\)/);
});
