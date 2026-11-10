import test from 'node:test';
import assert from 'node:assert/strict';
import {auditEntityConnectivity} from './entity-connectivity-audit.js';
import {entityConnectivityDirectory,connectivityClientJS} from './entity-connectivity-directory.js';
const registry={entities:[{id:'E1',slug:'a',labels:{en:'A',ua:'А'}},{id:'E2',slug:'b',labels:{en:'B',ua:'Б'}},{id:'E3',slug:'c',labels:{en:'C',ua:'В'}}]};
const bundle={state:{issue_id:'WSB-01',date:'2026-11-01',objects:[{id:'a'},{id:'b'},{id:'c'}]},claims:{claims:[{id:'CLM',entity_ids:['E1','E2'],source_ids:['SRC']}]},evidence:{records:[{id:'SRC',url:'https://example.org/report',source:'News',supports:['a','b']}]},relations:{relations:[{from:'a',to:'b',type:'feeds',source_ids:['SRC'],claim_ids:['CLM']}]}};
const cfg={records:[{id:'LEDGER1',entity_slug:'a'}]};
test('counts explicit and contextual edges separately, without causal inference',()=>{
 const report=auditEntityConnectivity({registry,bundles:[bundle],assessments:cfg});
 assert.equal(report.counts.registry,3);
 assert.equal(report.counts.in_issues,3);
 assert.equal(report.counts.in_claims,2);
 assert.equal(report.counts.in_explicit_graph,2);
 assert.equal(report.counts.in_context_graph,2);
 assert.equal(report.counts.fully_isolated,1);
 assert.equal(report.counts.in_ledger,1);
 assert.equal(report.explicit_relations[0].level,'explicit');
 assert.equal(report.context_relations[0].level,'contextual');
 assert.equal(report.context_relations[0].sources[0].url,'https://example.org/report');
});
test('a joint claim without verified URL does not create contextual link',()=>{
 const b=structuredClone(bundle);
 b.evidence.records[0].url='http://untrusted';
 const report=auditEntityConnectivity({registry,bundles:[b],assessments:{records:[]}});
 assert.equal(report.counts.context_relations,0);
 assert.equal(report.counts.explicit_relations,1);
 assert.equal(report.counts.fully_isolated,1);
});
test('single entity claim never creates a link',()=>{
 const b=structuredClone(bundle);
 b.claims.claims[0].entity_ids=['a'];
 b.evidence.records[0].supports=['a'];
 const report=auditEntityConnectivity({registry,bundles:[b],assessments:{records:[]}});
 assert.equal(report.counts.context_relations,0);
});
test('registry orphan and unknown claim IDs remain measurable',()=>{
 const b=structuredClone(bundle);
 b.claims.claims[0].entity_ids=['a','UNKNOWN'];
 const report=auditEntityConnectivity({registry,bundles:[b],assessments:{records:[]}});
 assert.equal(report.counts.anomalies,1);
 assert.equal(report.anomalies[0].type,'unknown_entity');
});
test('later silence leaves earlier explicit relation recorded',()=>{
 const b={state:{issue_id:'WSB-02',date:'2026-11-02',objects:[{id:'c'}]},claims:{claims:[]},evidence:{records:[]},relations:{relations:[]}};
 const report=auditEntityConnectivity({registry,bundles:[b,bundle],assessments:cfg});
 assert.equal(report.counts.explicit_relations,1);
 assert.equal(report.explicit_relations[0].issues[0],'WSB-01');
});

test('the full registry is visible even if a record has no entity-to-entity relations',()=>{
 const audit=auditEntityConnectivity({registry,bundles:[bundle],assessments:cfg});
 for(const lang of ['en','ua']){
  const html=entityConnectivityDirectory({lang,audit});
  assert.equal((html.match(/class="connectivity-item"/g)||[]).length,3);
  assert.match(html,/data-mode="isolated"/);
  assert.match(html,/https:\/\/example.org\/report/);
  assert.match(html,new RegExp('/'+lang+'/entity/a/'));
  assert.match(html,/co-occurrence|спільні джерела/);
 }
 assert.match(connectivityClientJS,/connectivity-mode/);
});

test('large inherited baseline and internal source never forms synthetic context clique',()=>{
 const b=structuredClone(bundle);
 b.claims.claims=[];
 b.relations.relations=[];
 b.evidence.records=[{id:'INHERITED',source_type:'internal',role:'baseline',url:'https://example.org/internal',supports:['a','b','c']}];
 const result=auditEntityConnectivity({registry,bundles:[b],assessments:{records:[]}});
 assert.equal(result.counts.context_relations,0);
 assert.equal(result.counts.in_evidence,0);
 assert.equal(result.counts.in_baseline_only,3);
 assert.equal(result.counts.fully_isolated,3);
});
test('omnibus primary source for more than three entities is not mistaken for pairwise relations',()=>{
 const larger={entities:[...registry.entities,{id:'E4',slug:'d',labels:{en:'D',ua:'Д'}}]};
 const b=structuredClone(bundle);
 b.claims.claims=[];
 b.relations.relations=[];
 b.evidence.records=[{id:'OMNIBUS',url:'https://example.org/omnibus',supports:['a','b','c','d']}];
 const result=auditEntityConnectivity({registry:larger,bundles:[b],assessments:{records:[]}});
 assert.equal(result.counts.context_relations,0);
});

test('audit preserves direct dated source and claim links independent of graph edges',()=>{
 const report=auditEntityConnectivity({registry,bundles:[bundle],assessments:cfg});
 const e=report.entities.find(x=>x.slug==='a');
 assert.ok(e.issue_refs.some(x=>x.id==='WSB-01'&&x.date==='2026-11-01'));
 assert.ok(e.claim_refs.some(x=>x.id==='CLM'));
 assert.ok(e.source_refs.some(x=>x.url==='https://example.org/report'));
 const html=entityConnectivityDirectory({lang:'en',audit:report});
 assert.match(html,/href="\/en\/claim\/CLM\/"/);
 assert.match(html,/href="\/en\/brief\/2026-11-01\/"/);
 assert.match(html,/href="https:\/\/example.org\/report"/);
 assert.match(html,/href="\/en\/entity\/c\/"/);
});
