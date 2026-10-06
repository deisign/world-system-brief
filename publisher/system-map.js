export function buildTemporalRelations(issueBundles, registry={entities:[]}){
 const aliases=new Map(), entities=new Map();
 for(const e of registry.entities||[]){aliases.set(e.id,e.slug);aliases.set(e.slug,e.slug);entities.set(e.slug,e)}
 const byKey=new Map();
 for(const b of issueBundles){for(const r of b.relations?.relations||b.relations?.records||[]){
  const from=aliases.get(r.from)||r.from,to=aliases.get(r.to)||r.to,type=r.type||r.predicate||"related_to",key=`${from}|${type}|${to}`;
  const x=byKey.get(key)||{key,from,to,type,events:[]};x.events.push({date:b.state.date,issue:b.state.issue_id,state:r.state||"active",claim_ids:r.claim_ids||[],source_ids:r.source_ids||[]});byKey.set(key,x);
 }}
 return [...byKey.values()].map(r=>({...r,first:r.events[0].date,last:r.events.at(-1).date,current_state:r.events.at(-1).state,appearances:r.events.length,from_entity:entities.get(r.from),to_entity:entities.get(r.to)})).sort((a,b)=>b.last.localeCompare(a.last)||b.appearances-a.appearances);
}

export function currentSystemMap(temporal,{since=null}={}){
 const terminalStates=new Set(["ended","inactive","rejected","superseded"]);
 const edges=temporal.filter(r=>(!since||r.last>=since)&&!terminalStates.has(String(r.current_state||"").toLowerCase()));
 const ids=new Set(edges.flatMap(r=>[r.from,r.to]));
 const nodes=[...ids].map(id=>{const sample=edges.find(r=>r.from===id)?.from_entity||edges.find(r=>r.to===id)?.to_entity;return sample||{slug:id,id,labels:{en:id,ua:id},type:"unknown"}});
 return {nodes,edges};
}
