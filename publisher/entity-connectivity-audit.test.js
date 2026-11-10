import test from 'node:test';
import assert from 'node:assert/strict';
import {auditEntityConnectivity} from './entity-connectivity-audit.js';
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
