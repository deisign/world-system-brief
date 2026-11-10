import fs from 'node:fs';
import path from 'node:path';

const uniq = values=>[...new Set(values)];
const validUrl = value=>typeof value==='string'&&/^https:\/\//.test(value);
export function auditEntityConnectivity({registry,bundles,assessments}){
 if(!Array.isArray(registry?.entities)||!Array.isArray(bundles)||!Array.isArray(assessments?.records))throw Error('Invalid entity audit inputs');
 const canonical = new Map();
 for(const e of registry.entities){
  if(!e.id||!e.slug||canonical.has(e.slug))throw Error('Invalid or duplicate entity');
  canonical.set(e.id,e.slug);canonical.set(e.slug,e.slug);
 }
 const bySlug=new Map(registry.entities.map(e=>[e.slug,{id:e.id,slug:e.slug,type:e.type,labels:e.labels,issues:new Set(),claim_ids:new Set(),source_ids:new Set(),explicit_edges:new Set(),context_edges:new Set(),ledger_ids:new Set(),study_ids:new Set()}]));
 const anomalies=[],explicit=new Map(),contextual=new Map();
 const resolve=(id,where)=>{const slug=canonical.get(id);if(!slug)anomalies.push({type:'unknown_entity',id,where});return slug;};
 const series=bundles.slice().sort((a,b)=>a.state.date.localeCompare(b.state.date));
 for(const {state,claims,evidence,relations} of series){
  const issue=state.issue_id,date=state.date,claimMap=new Map((claims?.claims||[]).map(c=>[c.id,c])),sourceMap=new Map((evidence?.records||[]).map(s=>[s.id,s]));
  if(!issue||!date)throw Error('Invalid issue date or ID');
  for(const o of state.objects||[]){const slug=resolve(o.id,issue+':state');if(slug)bySlug.get(slug).issues.add(issue);}
  for(const s of evidence?.records||[]){
   for(const raw of s.supports||[]){const slug=resolve(raw,issue+':source:'+s.id);if(slug)bySlug.get(slug).source_ids.add(s.id);}
  }
  for(const source of evidence?.records||[]){
   if(!validUrl(source.url))continue;
   const slugs=uniq((source.supports||[]).map(id=>canonical.get(id)).filter(Boolean));
   for(let i=0;i<slugs.length;i++)for(let j=i+1;j<slugs.length;j++){
    const [from,to]=[slugs[i],slugs[j]].sort(),key=from+'|context|'+to;
    const edge=contextual.get(key)||{key,from,to,type:'contextual_association',level:'contextual',basis:[],issues:[],claim_ids:[],source_ids:[],sources:[]};
    edge.basis.push('shared_source');edge.issues.push(issue);edge.source_ids.push(source.id);edge.sources.push({id:source.id,url:source.url,source:source.source||source.id,issue,date});
    contextual.set(key,edge);
    for(const slug of [from,to])bySlug.get(slug).context_edges.add(key);
   }
  }
  for(const c of claims?.claims||[]){
   const slugs=uniq((c.entity_ids||[]).map(id=>resolve(id,issue+':claim:'+c.id)).filter(Boolean));
   for(const slug of slugs)bySlug.get(slug).claim_ids.add(c.id);
   const verifiedSources=(c.source_ids||[]).filter(id=>{const src=sourceMap.get(id);return src&&validUrl(src.url)}).sort();
   if(slugs.length<2||!verifiedSources.length)continue;
   for(let i=0;i<slugs.length;i++)for(let j=i+1;j<slugs.length;j++){
    const [from,to]=[slugs[i],slugs[j]].sort(),key=from+'|context|'+to;
    const edge=contextual.get(key)||{key,from,to,type:'contextual_association',level:'contextual',basis:[],issues:[],claim_ids:[],source_ids:[],sources:[]};
    edge.basis.push('shared_claim');edge.issues.push(issue);edge.claim_ids.push(c.id);edge.source_ids.push(...verifiedSources);
    for(const id of verifiedSources){const src=sourceMap.get(id);edge.sources.push({id,url:src.url,source:src.source||id,issue,date});}
    contextual.set(key,edge);
    for(const slug of [from,to])bySlug.get(slug).context_edges.add(key);
   }
  }
  for(const r of relations?.relations||relations?.records||[]){
   const from=resolve(r.from,issue+':relation'),to=resolve(r.to,issue+':relation');
   if(!from||!to)continue;
   const type=r.type||r.predicate||'related_to',key=from+'|'+type+'|'+to;
   const edge=explicit.get(key)||{key,from,to,type,level:'explicit',issues:[],claim_ids:[],source_ids:[],sources:[]};
   edge.issues.push(issue);edge.claim_ids.push(...(r.claim_ids||[]));edge.source_ids.push(...(r.source_ids||[]));
   for(const id of r.source_ids||[]){const src=sourceMap.get(id);if(src&&validUrl(src.url))edge.sources.push({id,url:src.url,source:src.source||id,issue,date});else anomalies.push({type:'relation_source_missing',id,issue,key});}
   for(const id of r.claim_ids||[])if(!claimMap.has(id))anomalies.push({type:'relation_claim_missing',id,issue,key});
   explicit.set(key,edge);
   for(const slug of [from,to])bySlug.get(slug).explicit_edges.add(key);
  }
 }
 for(const entry of assessments.records){const slug=resolve(entry.entity_slug,'ledger:'+entry.id);if(slug)bySlug.get(slug).ledger_ids.add(entry.id);}
 const pack=e=>({...e,issues:uniq(e.issues),claim_ids:uniq(e.claim_ids),source_ids:uniq(e.source_ids),sources:uniq(e.sources.map(s=>JSON.stringify(s))).map(s=>JSON.parse(s)),basis:uniq(e.basis||[])});
 const entities=[...bySlug.values()].map(e=>({...e,issues:[...e.issues],claim_ids:[...e.claim_ids],source_ids:[...e.source_ids],explicit_edges:[...e.explicit_edges],context_edges:[...e.context_edges],ledger_ids:[...e.ledger_ids],study_ids:[...e.study_ids]})).sort((a,b)=>a.slug.localeCompare(b.slug));
 const counts={registry:entities.length,in_issues:entities.filter(e=>e.issues.length).length,in_claims:entities.filter(e=>e.claim_ids.length).length,in_evidence:entities.filter(e=>e.source_ids.length).length,in_explicit_graph:entities.filter(e=>e.explicit_edges.length).length,in_context_graph:entities.filter(e=>e.context_edges.length).length,in_any_graph:entities.filter(e=>e.explicit_edges.length||e.context_edges.length).length,in_ledger:entities.filter(e=>e.ledger_ids.length).length,fully_isolated:entities.filter(e=>!e.explicit_edges.length&&!e.context_edges.length).length,explicit_relations:explicit.size,context_relations:contextual.size,anomalies:anomalies.length};
 return {schema:'wsb-entity-connectivity-audit-v1',counts,entities,explicit_relations:[...explicit.values()].map(pack),context_relations:[...contextual.values()].map(pack),anomalies};
}
export function runConnectivityAudit(root=process.cwd()){
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 const registry=read('knowledge/entities.json'),assessments=read('knowledge/dependency-assessments.json');
 const ids=fs.readdirSync(path.join(root,'issues')).filter(x=>/^\d{4}$/.test(x)).sort();
 const bundles=ids.map(id=>{const base='issues/'+id+'/',part=name=>fs.existsSync(path.join(root,base+name+'.json'))?read(base+name+'.json'):{};return {state:part('state'),claims:part('claims'),evidence:part('evidence'),relations:part('relations')};});
 return auditEntityConnectivity({registry,assessments,bundles});
}
if(process.argv[1]&&process.argv[1].endsWith('entity-connectivity-audit.js')){
 const result=runConnectivityAudit();
 fs.mkdirSync('artifacts/entity-audit',{recursive:true});
 fs.writeFileSync('artifacts/entity-audit/connectivity.json',JSON.stringify(result,null,2)+'\n');
 fs.writeFileSync('artifacts/entity-audit/isolated.tsv',['slug\tissues\tclaims\tsources\tledger',...result.entities.filter(e=>!e.explicit_edges.length&&!e.context_edges.length).map(e=>[e.slug,e.issues.length,e.claim_ids.length,e.source_ids.length,e.ledger_ids.length].join('\t'))].join('\n')+'\n');
 console.log('ENTITY CONNECTIVITY AUDIT '+JSON.stringify(result.counts));
}
