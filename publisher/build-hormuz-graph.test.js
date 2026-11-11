import test from 'node:test';
import assert from 'node:assert/strict';
import {loadHormuzGraph,validateHormuzGraph,renderHormuzPage} from './build-hormuz-graph.js';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const config=read('knowledge/system-graphs/hormuz.json'),registry=read('knowledge/entities.json'),retro=read('knowledge/retrospective-relations.json');
const ids=fs.readdirSync('issues').filter(x=>/^\d{4}$/.test(x)).sort();
const bundles=ids.map(id=>{const d={};for(const p of ['state','claims','evidence','relations']){const f='issues/'+id+'/'+p+'.json';d[p]=fs.existsSync(f)?read(f):{};}return d;});
const inputs=()=>({config:structuredClone(config),registry,bundles,retro});
test('seven evidenced mechanisms and all nine named nodes resolve against canonical issues',()=>{
 const graph=loadHormuzGraph();
 assert.equal(graph.config.nodes.length,9);
 assert.equal(graph.edges.length,7);
 assert.ok(graph.edges.every(x=>x.sources.length&&x.sources.every(s=>s.url.startsWith('https://'))));
 assert.ok(graph.edges.every(x=>x.physical_delta===false));
 assert.ok(graph.edges.some(x=>x.evidence.kind==='retrospective'));
 assert.ok(graph.edges.some(x=>x.evidence.kind==='issue_claim'));
});
test('all seven Ledger dimensions bilingual with unknown replacement horizons never invented',()=>{
 for(const key of ['flow','dependency','bottleneck','substitutability','leverage','rent','adaptation']){
  assert.ok(config.dimensions[key].en&&config.dimensions[key].ua);
 }
 assert.ok(config.edges.some(x=>x.substitutability==='unknown'));
 assert.ok(config.edges.some(x=>x.substitutability==='partial_observed'));
 assert.ok(config.edges.some(x=>x.substitutability==='proposed'));
 assert.ok(!JSON.stringify(config).includes('leverage_score'));
});
test('reject invented entity, mismatched claim and fabricated external relation',()=>{
 const a=inputs();a.config.edges[0].to='fictional-port';assert.throws(()=>validateHormuzGraph(a),/Invalid dependency edge/);
 const b=inputs();b.config.edges[0].evidence.claim_id='FAKE';assert.throws(()=>validateHormuzGraph(b),/Unverifiable claim/);
 const c=inputs();c.config.edges[2].evidence.relation_id='RET-FAKE';assert.throws(()=>validateHormuzGraph(c),/Unverifiable retrospective/);
 const d=inputs();d.config.edges[0].physical_delta=true;assert.throws(()=>validateHormuzGraph(d),/Invalid dependency edge/);
});
test('do not mistake quoted price, future pipeline project or mined-route allegation for verified throughput',()=>{
 const e=loadHormuzGraph().edges;
 assert.equal(e.find(x=>x.id==='HMX-05').status,'price_signal');
 assert.equal(e.find(x=>x.id==='HMX-06').status,'proposed_not_commissioned');
 assert.equal(e.find(x=>x.id==='HMX-04').status,'analyst_assessment');
 assert.equal(e.find(x=>x.id==='HMX-07').status,'preliminary_report');
});
test('bilingual rendered SVG is generated from real directed graph, with accessible evidence and navigation',()=>{
 const graph=loadHormuzGraph();
 for(const lang of ['en','ua']){
  const html=renderHormuzPage({lang,validated:graph});
  assert.match(html,/<svg role="img"/);
  assert.equal((html.match(/class="mechanism" id="HMX-/g)||[]).length,7);
  assert.match(html,new RegExp('/'+lang+'/map/'));
  assert.match(html,/RET-SRC-OMAN-STS-01/);
  assert.match(html,/WSB-SRC-0011-03/);
  assert.match(html,/hormuz-mine-insurance-clearance-dependency/);
  assert.match(html,lang==='en'?/NO NEW PHYSICAL SYSTEM/:/НЕ СТВОРЮЄ НОВИХ ФІЗИЧНИХ/);
 }
});
