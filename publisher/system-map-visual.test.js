import test from 'node:test';
import assert from 'node:assert/strict';
import {systemMapVisualSVG} from './system-map-visual.js';
import {systemMapPage} from './system-map-page.js';
import {systemMapClientScript} from './system-map-client.js';
import {buildTemporalRelations} from './system-map.js';
const registry={entities:[{id:'E1',slug:'hormuz',type:'chokepoint',labels:{en:'Strait of Hormuz',ua:'Ормузька протока'}},{id:'E2',slug:'east-west-pipeline',type:'infrastructure',labels:{en:'East-West Pipeline',ua:'Нафтопровід East-West'}}]};
const edges=[{from:'hormuz',to:'east-west-pipeline',type:'constrains',first:'2026-11-02',last:'2026-11-03',appearances:1,events:[{date:'2026-11-03',issue:'WSB-TEST',sources:[{id:'SRC',url:'https://example.com/a',name:'Example News'}]}]}];
const map={nodes:registry.entities.map(e=>({slug:e.slug,type:e.type,labels:e.labels})),edges};
test('diagram uses only actual relation endpoints and explicitly disclaims geography',()=>{
 const graph=systemMapVisualSVG(edges,Object.fromEntries(map.nodes.map(n=>[n.slug,n])),'ua');
 assert.match(graph,/viewBox="0 0 1200 720"/);
 assert.match(graph,/data-map-visual-node="hormuz"/);
 assert.match(graph,/data-map-visual-node="east-west-pipeline"/);
 assert.match(graph,/not a geographic map|не географічна карта/);
 assert.doesNotMatch(graph,/data-map-visual-node="ai-gas-turbine-capacity-bottleneck"/);
});
test('no relation means no invented nodes, arrows or physical layout',()=>{
 const graph=systemMapVisualSVG([],{},'en');
 assert.doesNotMatch(graph,/data-map-visual-node=/);
 assert.doesNotMatch(graph,/<line class="visual-edge"/);
});
test('published map has keyboard-focusable SVG plus true evidence URLs',()=>{
 const html=systemMapPage({lang:'ua',map,date:'2026-11-03',dates:['2026-11-02','2026-11-03']});
 assert.match(html,/id="map-visual"/);
 assert.match(html,/role="region"/);
 assert.match(html,/data-map-visual-node="hormuz"/);
 assert.match(html,/https:\/\/example.com\/a/);
 assert.match(html,/RELATION SOURCES|ДЖЕРЕЛА ЗВʼЯЗКУ/);
 assert.match(html,/href="\/ua\/entity\/hormuz\/"/);
});
test('dated evidence is joined to recorded relation and stays sourced',()=>{
 const rows=buildTemporalRelations([{state:{date:'2026-11-03',issue_id:'WSB-TEST'},relations:{relations:[{from:'E1',to:'E2',type:'constrains',source_ids:['SRC']}]},evidence:{records:[{id:'SRC',url:'https://example.com/a',source:'Example News'}]}}],registry);
 assert.equal(rows.length,1);
 assert.deepEqual(rows[0].events[0].sources,[{id:'SRC',url:'https://example.com/a',name:'Example News'}]);
});
test('client updates SVG and provides keyboard node selection',()=>{
 const html=systemMapClientScript({temporal:edges,entities:Object.fromEntries(map.nodes.map(e=>[e.slug,e])),lang:'ua'});
 assert.match(html,/id="map-data"/);
 assert.match(html,/getElementById\("map-visual"\)/);
 assert.match(html,/data-map-visual-node/);
 assert.match(html,/addEventListener\("keydown"/);
});
