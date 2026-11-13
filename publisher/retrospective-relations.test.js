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
 assert.equal(result.documented.length,34);
 assert.equal(result.comparative.length,10);
 const all=[...result.documented,...result.comparative];
 assert.equal(all.length,44);
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
 assert.equal(currentSystemMap(edges,{asOf:'2026-11-11'}).edges.length,34);
});
test('all dated relations from original issues remain unchanged',()=>{
 const old=buildTemporalRelations(bundles,registry);
 const {documented}=resolveRetrospectiveRelations(config,bundles,registry);
 const recovered=retrospectiveTemporalEdges(documented);
 assert.equal(old.length,43);
 assert.equal(old.filter(edge=>edge.events.every(event=>!['WSB-0044','WSB-0045'].includes(event.issue))).length,32);
 assert.equal(recovered.length,34);
 assert.ok(recovered.every(x=>!old.some(y=>y.key===x.key)));
});
test('audit counts distinct retrospective levels without changing primary history',()=>{
 const report=runConnectivityAudit();
 assert.equal(report.counts.registry,117);
 assert.equal(report.counts.anomalies,0);
 assert.equal(report.counts.explicit_relations,77);
 assert.equal(report.counts.in_any_graph,117);
 assert.equal(report.counts.fully_isolated,0);
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

test('remaining 12 are connected through exact source-backed counterparts',()=>{
 const recovered=resolveRetrospectiveRelations(config,bundles,registry);
 const audit=runConnectivityAudit();
 const names=['cosco-zippel','estonia-grain-transit','indonesia-singapore-gas-supply-adjustment','iranian-seafarer-rescue-sri-lanka','lng-canada-upstream','maersk-container-freight-pricing','nord-stream-restart-option','nvidia-china','riyadh-aramco-fire','shadow-fleet-shipping-services','us-perm-tech-suspensions','yandex-data-centre-network'];
 for(const name of names){
  const e=audit.entities.find(x=>x.slug===name);
  assert.ok(e&&e.explicit_edges.length+e.context_edges.length>0,name);
 }
 assert.equal(audit.counts.anomalies,0);
 assert.equal(recovered.documented.length,34);
 assert.equal(recovered.comparative.length,10);
 assert.ok(recovered.comparative.every(x=>x.physical_delta===false));
});
test('source to counterpart validation rejects fabricated external support',()=>{
 const fake=structuredClone(config);
 const row=fake.records.find(x=>x.id==='RET-20261111-20');
 row.external_sources[0].supports=['made-up-counterparty'];
 assert.throws(()=>resolveRetrospectiveRelations(fake,bundles,registry),/Unsupported external endpoint/);
 const absent=structuredClone(config);
 const miss=absent.records.find(x=>x.id==='RET-20261111-20');
 miss.external_sources[0].supports=['china-smart-port-technology-stack'];
 assert.throws(()=>resolveRetrospectiveRelations(absent,bundles,registry),/Comparative proof missing an endpoint/);
});
test('all new relationship explanations distinguish plans, reports and independent mechanisms',()=>{
 const rows=config.records.filter(x=>Number(x.id.slice(-2))>=20);
 assert.equal(rows.length,25);
 assert.ok(rows.every(x=>x.physical_delta===false&&x.note.en&&x.note.ua));
 assert.ok(rows.every(x=>x.evidence.length||x.external_sources.length));
 assert.ok(rows.every(x=>x.registered_at==='2026-11-11'));
});

test('13 context-only entities promoted to direct source-proven relations without physical delta',()=>{
 const report=runConnectivityAudit();
 const previouslyContextOnly=['us-spr-refiner-loans','cheniere-petrobras-lng','eu-grid-guarantees','capital-unblocks-grid-capacity','bidirectional-charging','taiwan-energy-buffer','hormuz-navigation-aid-damage-claim','hormuz-oil-risk-repricing','irgc-hormuz-mine-seizure-claims','gulf-qatar-ukmto-tanker-incident','gulf-crude-export-flow','gulf-of-oman-sts','pacific-lng-optionality'];
 assert.equal(previouslyContextOnly.length,13);
 for(const slug of previouslyContextOnly){
  const e=report.entities.find(x=>x.slug===slug);
  assert.ok(e&&e.explicit_edges.length,slug);
  const edge=report.explicit_relations.find(x=>e.explicit_edges.includes(x.key)&&x.basis.includes('retrospective_source_review'));
  assert.ok(edge&&edge.sources.length&&edge.sources.every(s=>s.url.startsWith('https://')),slug);
 }
 assert.equal(report.counts.in_explicit_graph,104);
 assert.equal(report.counts.in_any_graph,117);
 assert.equal(report.counts.fully_isolated,0);
});
test('source-upgraded rows retain uncertainty and original material-delta dates',()=>{
 const upgrades=config.records.filter(x=>Number(x.id.slice(-2))>=32);
 assert.equal(upgrades.length,13);
 assert.ok(upgrades.every(x=>x.classification==='documented'&&x.registered_at==='2026-11-11'&&x.physical_delta===false));
 assert.ok(upgrades.every(x=>x.note.en&&x.note.ua));
 assert.ok(upgrades.every(x=>x.evidence.length||x.external_sources.length));
 const navigation=upgrades.find(x=>x.from==='hormuz-navigation-aid-damage-claim');
 assert.match(navigation.note.en,/no independent proof/i);
 const fid=upgrades.find(x=>x.from==='pacific-lng-optionality');
 assert.match(fid.external_sources[0].url,/lngcanada.ca/);
 const flow=upgrades.find(x=>x.from==='gulf-crude-export-flow');
 assert.ok(!flow.external_sources[0].url.endsWith('/business/energy/'));
});
