// Editorial recovery of a relation is not a newly occurred physical change.
const validDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x);
const validUrl=x=>typeof x==='string'&&/^https:\/\//.test(x);
export function resolveRetrospectiveRelations(config,bundles,registry){
 if(config?.schema!=='wsb-retrospective-relations-v1'||!Array.isArray(config.records)||!Array.isArray(bundles)||!Array.isArray(registry?.entities))throw Error('Invalid retrospective registry');
 const alias=new Map(registry.entities.flatMap(e=>[[e.id,e.slug],[e.slug,e.slug]])),entities=new Map(registry.entities.map(e=>[e.slug,e]));
 const issues=new Map(bundles.map(b=>[b.state?.issue_id,b])),ids=new Set(),keys=new Set(),documented=[],comparative=[];
 for(const r of config.records){
  if(!r.id||ids.has(r.id)||!validDate(r.registered_at)||r.physical_delta!==false||!['documented','comparative'].includes(r.classification))throw Error('Invalid retrospective ID/date/classification '+r.id);
  ids.add(r.id);
  const from=alias.get(r.from),to=alias.get(r.to);
  if(!from||!to||from===to||!r.type||!r.note?.en||!r.note?.ua)throw Error('Unregistered retrospective endpoint '+r.id);
  const key=from+'|'+r.type+'|'+to;if(keys.has(key))throw Error('Duplicate retrospective relation '+key);keys.add(key);
  if(!Array.isArray(r.evidence)||!Array.isArray(r.external_sources)||!(r.evidence.length||r.external_sources.length))throw Error('Missing retrospective proof '+r.id);
  const sources=[],claimIds=[],sourceIds=[],citedEndpoints=new Set(),supportEndpoints=new Set(),externalEndpoints=new Set();
  for(const proof of r.evidence){
   const b=issues.get(proof.issue_id);
   if(!b||b.state.date>r.registered_at||!proof.claim_ids?.length||!proof.source_ids?.length)throw Error('Invalid evidence issue '+r.id);
   const claims=new Map((b.claims?.claims||[]).map(x=>[x.id,x])),ev=new Map((b.evidence?.records||[]).map(x=>[x.id,x]));
   for(const cid of proof.claim_ids){
    const c=claims.get(cid);
    if(!c||!c.source_ids?.some(sid=>proof.source_ids.includes(sid)))throw Error('Unlinked retrospective claim '+cid);
    for(const endpoint of c.entity_ids||[])if(from===alias.get(endpoint)||to===alias.get(endpoint))citedEndpoints.add(alias.get(endpoint));
    claimIds.push(cid);
   }
   for(const sid of proof.source_ids){
    const s=ev.get(sid);
    if(!s||!validUrl(s.url)||s.role==='baseline'||s.source_type==='internal'||s.publication_date>r.registered_at)throw Error('Unlinked retrospective source '+sid);
    if(!proof.claim_ids.some(cid=>claims.get(cid).source_ids?.includes(sid)))throw Error('Claim/source mismatch '+sid);
    for(const endpoint of s.supports||[])if(from===alias.get(endpoint)||to===alias.get(endpoint))supportEndpoints.add(alias.get(endpoint));
    sourceIds.push(sid);sources.push({id:sid,url:s.url,name:s.source||sid,source:s.source||sid,issue:proof.issue_id,date:r.registered_at,evidence_date:b.state.date});
   }
  }
  for(const s of r.external_sources){
   if(!s.id||!s.source||!validUrl(s.url)||!validDate(s.checked_at)||s.checked_at>r.registered_at)throw Error('Invalid external source '+r.id);
   if(s.supports!==undefined){
    if(!Array.isArray(s.supports)||!s.supports.length)throw Error('Invalid external endpoint support '+r.id);
    for(const endpoint of s.supports){const slug=alias.get(endpoint);if(!slug||![from,to].includes(slug))throw Error('Unsupported external endpoint '+r.id+':'+endpoint);externalEndpoints.add(slug);}
   }
   sourceIds.push(s.id);sources.push({id:s.id,url:s.url,name:s.source,source:s.source,issue:null,date:r.registered_at,evidence_date:null});
  }
  if(r.evidence.length&&(!citedEndpoints.has(from)&&!citedEndpoints.has(to)||!supportEndpoints.size))throw Error('Proof does not support endpoints '+r.id);
  if(r.classification==='comparative'&&(![...citedEndpoints,...externalEndpoints].includes(from)||![...citedEndpoints,...externalEndpoints].includes(to)))throw Error('Comparative proof missing an endpoint '+r.id);
  if(r.external_sources.length&&r.id>='RET-20261111-20'&&(![...citedEndpoints,...externalEndpoints].includes(from)||![...citedEndpoints,...externalEndpoints].includes(to)))throw Error('Documented external proof missing an endpoint '+r.id);
  if(r.classification==='documented'&&r.evidence.length>1)throw Error('Documented relation requires one issue-backed proposition '+r.id);
  const row={id:r.id,key,from,to,type:r.type,classification:r.classification,registered_at:r.registered_at,physical_delta:false,from_entity:entities.get(from),to_entity:entities.get(to),note:r.note,claim_ids:[...new Set(claimIds)],source_ids:[...new Set(sourceIds)],sources};
  (r.classification==='documented'?documented:comparative).push(row);
 }
 return {documented,comparative};
}
export function retrospectiveTemporalEdges(rows){
 return rows.map(r=>({...r,origin:'retrospective',first:r.registered_at,last:r.registered_at,current_state:'active',appearances:1,events:[{date:r.registered_at,issue:'RETROSPECTIVE',state:'active',claim_ids:r.claim_ids,source_ids:r.source_ids,sources:r.sources}]}));
}
