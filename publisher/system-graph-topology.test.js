import test from 'node:test';
import assert from 'node:assert/strict';
import {loadHormuzGraph} from './build-hormuz-graph.js';
import {layoutDependencyGraph,renderDependencyTopologySVG} from './system-graph-topology.js';

test('one drawn SVG node per registered entity even when multiple mechanisms meet at Hormuz',()=>{
 const graph=loadHormuzGraph();
 const result=layoutDependencyGraph(graph);
 assert.equal(result.nodes.size,9);
 assert.ok(result.nodes.get('east-west-pipeline').rank<result.nodes.get('hormuz').rank);
 assert.ok(result.nodes.get('hormuz').rank<result.nodes.get('gulf-oil-flow').rank);
 for(const lang of ['en','ua']){
  const svg=renderDependencyTopologySVG(graph,lang);
  assert.equal((svg.match(/<g id="node-/g)||[]).length,9);
  assert.equal((svg.match(/<path d="M/g)||[]).length,7);
  assert.match(svg,/stroke-dasharray="6 5"/);
  assert.match(svg,/HMX-06/);
  assert.match(svg,/<svg role="img"/);
 }
});
test('layout remains deterministic and does not infer extra relationships',()=>{
 const graph=loadHormuzGraph();
 const first=renderDependencyTopologySVG(graph,'en');
 assert.equal(first,renderDependencyTopologySVG(graph,'en'));
 assert.equal(graph.edges.length,7);
 const changed=structuredClone(graph);
 changed.edges[0].status='price_signal';
 assert.match(renderDependencyTopologySVG(changed,'en'),/#8A6736/);
});
test('cyclic evidence networks render safely without infinite layout iteration',()=>{
 const graph=structuredClone(loadHormuzGraph());
 graph.edges.push({...graph.edges[0],id:'CYCLE',from:'gulf-oil-flow',to:'hormuz'});
 const layout=layoutDependencyGraph(graph);
 assert.equal(layout.nodes.size,9);
 assert.match(renderDependencyTopologySVG(graph,'en'),/CYCLE/);
 assert.throws(()=>renderDependencyTopologySVG(graph,'fr'),/Unknown graph locale/);
});
