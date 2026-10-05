export function buildClaimIndex(issueBundles, registry={entities:[]}){
 const aliases=new Map();
 for(const e of registry.entities||[]){aliases.set(e.id,e);aliases.set(e.slug,e)}
 const claims=[];
 for(const b of issueBundles){
  const sources=new Map((b.evidence?.records||[]).map(s=>[s.id,s]));
  const relations=b.relations?.relations||b.relations?.records||[];
  for(const c of b.claims?.claims||[]){
   claims.push({...c,date:b.state.date,issue_id:c.issue_id||b.state.issue_id,entities:(c.entity_ids||[]).map(id=>aliases.get(id)||{id,slug:id,labels:{en:id,ua:id}}),sources:(c.source_ids||[]).map(id=>sources.get(id)).filter(Boolean),relations:relations.filter(r=>(r.claim_ids||[]).includes(c.id))});
  }
 }
 return claims;
}

export function claimStats(claims){
 return claims.reduce((a,c)=>{a.total++;a[c.status]=(a[c.status]||0)+1;a[c.kind]=(a[c.kind]||0)+1;return a},{total:0});
}
