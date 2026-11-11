import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveRetrospectiveRelations,retrospectiveTemporalEdges} from './retrospective-relations.js';
import {runConnectivityAudit} from './entity-connectivity-audit.js';
import {currentSystemMap,buildTemporalRelations} from './system-map.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const config=read('knowledge/retrospective-relations.json');
const registry=read('knowledge/entities.json');
const issues=fs.readdirSync('issues').filter(x=>/^\d{4}$/.test(x)).sort();
const bundles=issues.map(id=>{
 const load=p=>fs.existsSync('issues/'+id+'/'+p+'.json')?read('issues/'+id+'/'+p+'.json'):{};
 return {state:load('state'),claims:load('claims'),evidence:load('evidence'),relations:load('relations')};
});
test('retrospective evidence resolves actual historic claims and HTTPS sources',()=>{
 const result=resolveRetrospectiveRelations(config,bundles,registry);
 assert.equal(result.documented.length,15);
 assert.equal(result.comparative.length,4);
 const all=[...result.documented,...result.comparative];
 assert.equal(all.length,19);
 assert.ok(all.every(r=>r.sources.length>0&&r.sources.every(s=>s.url.startsWith('https://'))));
 assert.ok(all.every(r=>r.physical_delta===false));
 assert.ok(all.every(r=>r.note.en&&r.note.ua));
});
test('backfill date is discovery date, not the date of historical physical change',()=>{
 const {documented}=resolveRetrospectiveRelations(config,bundles,registry);
 const edges=retrospectiveTemporalEdges(documented);
 assert.ok(edges.every(e=>e.first==='2026-11-11'&&e.last==='2026-11-11'));
 assert.ok(edges.every(e=>e.events[0].issue==='RETROSPECTIVE'));
 assert.ok(edges.some(e=>e.sources.some(s=>s.evidence_date<'2026-11-11')));
 assert.equal(currentSystemMap(edges,{asOf:'2026-11-10'}).edges.length,0);
 assert.equal(currentSystemMap(edges,{asOf:'2026-11-11'}).edges.length,15);
});
test('all dated relations from original issues remain unchanged',()=>{
 const old=buildTemporalRelations(bundles,registry);
 const {documented}=resolveRetrospectiveRelations(config,bundles,registry);
 const recovered=retrospectiveTemporalEdges(documented);
 assert.equal(old.length,32);
 assert.equal(recovered.length,15);
 assert.ok(recovered.every(x=>!old.some(y=>y.key===x.key)));
});
test('audit counts distinct retrospective levels without changing primary history',()=>{
 const report=runConnectivityAudit();
 assert.equal(report.counts.registry,100);
 assert.equal(report.counts.anomalies,0);
 assert.equal(report.counts.explicit_relations,47);
 assert.ok(report.counts.in_any_graph>=80);
 assert.ok(report.counts.fully_isolated<=15);
 for(const slug of ['zeiss-smt','asml','ai-gas-turbine-capacity-bottleneck','uk-critical-minerals-resilience']){
  const entity=report.entities.find(x=>x.slug===slug);
  assert.ok(entity.explicit_edges.length||entity.context_edges.length,slug);
 }
 const a=report.explicit_relations.find(x=>x.from==='zeiss-smt');
 assert.match(a.note.en,/long-standing/);
 assert.ok(a.sources.some(x=>x.url.includes('asml.com')));
 const comparison=report.context_relations.find(x=>x.basis.includes('retrospective_comparison'));
 assert.ok(comparison);
});
test('claim-source links and entity identities are enforced',()=>{
 const copy=()=>structuredClone(config);
 const bad=copy();bad.records[0].evidence[0].claim_ids=['FAKE'];assert.throws(()=>resolveRetrospectiveRelations(bad,bundles,registry),/Unlinked retrospective claim/);
 const badSource=copy();badSource.records[1].evidence[0].source_ids=['FAKE'];assert.throws(()=>resolveRetrospectiveRelations(badSource,bundles,registry),/Unlinked retrospective claim|Unlinked retrospective source/);
 const badEndpoint=copy();badEndpoint.records[0].to='invented';assert.throws(()=>resolveRetrospectiveRelations(badEndpoint,bundles,registry),/Unregistered retrospective endpoint/);
 const fakeDelta=copy();fakeDelta.records[0].physical_delta=true;assert.throws(()=>resolveRetrospectiveRelations(fakeDelta,bundles,registry),/Invalid retrospective ID/);
});
test('comparative AI construction constraints never masquerade as a causal relation',()=>{
 const report=runConnectivityAudit();
 const t=report.context_relations.filter(x=>x.basis.includes('retrospective_comparison'));
 assert.ok(t.some(x=>[x.from,x.to].includes('ai-gas-turbine-capacity-bottleneck')));
 assert.ok(!report.explicit_relations.some(x=>[x.from,x.to].includes('ai-gas-turbine-capacity-bottleneck')));
});
