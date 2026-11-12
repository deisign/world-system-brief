import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEvidenceGraph,graphFlowTaxonomy,graphLedgerDimensions} from './system-graph-core.js';

const make=()=>{
 const nodes=['port-a','port-b'];
 const config={
  schema:'wsb-system-graph-v2',id:'trade-route',as_of:'2026-11-11',
  mode:'evidence_graph_not_flow_simulation',nodes,
  dimensions:Object.fromEntries(graphLedgerDimensions.map(d=>[d,{en:d,ua:d}])),
  edges:[{id:'EDGE-1',from:'port-a',to:'port-b',type:'shipping_gate',flow:'goods',status:'reported_observation',substitutability:'unknown',physical_delta:false,explanation:{en:'Source supported transport constraint',ua:'Джерело підтверджує обмеження'},evidence:{kind:'issue_claim',claim_id:'C-1'}}]
 };
 const registry={entities:nodes.map(slug=>({slug}))};
 const resolveProof=()=>({registered_at:'2026-11-11',claim_ids:['C-1'],sources:[{id:'S-1',url:'https://example.org/evidence',publication_date:'2026-11-10'}]});
 return {config,registry,resolveProof};
};
test('reusable evidence-only contract accepts six flow classes and independently sourced graph IDs',()=>{
 assert.deepEqual(graphFlowTaxonomy,['goods','capital','energy','technology','data','labor']);
 for(const flow of graphFlowTaxonomy){
  const input=make();input.config.edges[0].flow=flow;
  const graph=validateEvidenceGraph(input);
  assert.equal(graph.edges[0].flow,flow);
  assert.equal(graph.edges[0].sources[0].id,'S-1');
  assert.equal(graph.edges[0].physical_delta,false);
 }
});
test('reject fake nodes, duplicated edges and synthetic physical delta',()=>{
 const a=make();a.config.edges[0].to='unregistered';assert.throws(()=>validateEvidenceGraph(a),/Invalid dependency edge/);
 const b=make();b.config.edges.push(structuredClone(b.config.edges[0]));assert.throws(()=>validateEvidenceGraph(b),/Invalid dependency edge/);
 const c=make();c.config.edges[0].physical_delta=true;assert.throws(()=>validateEvidenceGraph(c),/Invalid dependency edge/);
 const d=make();d.config.nodes.push('port-a');assert.throws(()=>validateEvidenceGraph(d),/Unregistered or duplicate/);
});
test('reject undocumented proof, future evidence and invalid registration dates',()=>{
 const a=make();a.config.edges[0].evidence.kind='comparison';assert.throws(()=>validateEvidenceGraph(a),/Unsupported proof/);
 const b=make();b.resolveProof=()=>({registered_at:'2026-11-12',claim_ids:[],sources:[{id:'S',url:'https://example.org'}]});assert.throws(()=>validateEvidenceGraph(b),/Unverifiable resolved proof/);
 const c=make();c.resolveProof=()=>({registered_at:'2026-11-11',claim_ids:[],sources:[{id:'S',url:'https://example.org',publication_date:'2026-11-12'}]});assert.throws(()=>validateEvidenceGraph(c),/Unverifiable resolved proof/);
 const d=make();d.config.as_of='2026-02-30';assert.throws(()=>validateEvidenceGraph(d),/Invalid graph metadata/);
 const e=make();e.resolveProof=()=>({registered_at:'2026-11-11',claim_ids:[],sources:[]});assert.throws(()=>validateEvidenceGraph(e),/Unverifiable resolved proof/);
});
test('proposals and market signals remain explicitly non-physical',()=>{
 for(const status of ['price_signal','proposed_not_commissioned','analyst_assessment']){
  const a=make();a.config.edges[0].status=status;
  assert.equal(validateEvidenceGraph(a).edges[0].status,status);
 }
 const a=make();a.config.edges[0].flow='imaginary';assert.throws(()=>validateEvidenceGraph(a),/Invalid dependency edge/);
 const b=make();delete b.config.dimensions.rent;assert.throws(()=>validateEvidenceGraph(b),/Missing Ledger dimension rent/);
});
