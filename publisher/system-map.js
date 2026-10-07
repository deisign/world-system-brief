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

const terminalStates=new Set(["ended","inactive","rejected","superseded"]);
const active=r=>!terminalStates.has(String(r.current_state||"").toLowerCase());
const cutoff=(date,days)=>{const d=new Date(date+"T00:00:00Z");d.setUTCDate(d.getUTCDate()-days+1);return d.toISOString().slice(0,10)};

export function currentSystemMap(temporal,{since=null,asOf=null,windowDays=null}={}){
 let edges=temporal.map(r=>{
  const events=(r.events||[]).filter(e=>(!asOf||e.date<=asOf)&&(!since||e.date>=since));
  if(r.events&&events.length===0)return null;
  if(!r.events)return r;
  const last=events.at(-1);
  return {...r,events,first:events[0].date,last:last.date,current_state:last.state,appearances:events.length};
 }).filter(Boolean).filter(active);
 if(asOf&&windowDays){const sinceDate=cutoff(asOf,windowDays);edges=edges.filter(r=>r.last>=sinceDate)}
 const ids=new Set(edges.flatMap(r=>[r.from,r.to]));
 const nodes=[...ids].map(id=>{const sample=edges.find(r=>r.from===id)?.from_entity||edges.find(r=>r.to===id)?.to_entity;return sample||{slug:id,id,labels:{en:id,ua:id},type:"unknown"}});
 return {nodes,edges};
}

export function egoSystemMap(map,focus,hops=1){
 if(!focus)return map;
 const allEdges=map.edges||[], seen=new Set([focus]), frontier=new Set([focus]), kept=[];
 for(let depth=0;depth<hops;depth++){const next=new Set();for(const r of allEdges){if(frontier.has(r.from)||frontier.has(r.to)){if(!kept.includes(r))kept.push(r);if(!seen.has(r.from))next.add(r.from);if(!seen.has(r.to))next.add(r.to)}}for(const id of next)seen.add(id);frontier.clear();for(const id of next)frontier.add(id)}
 return {nodes:(map.nodes||[]).filter(n=>seen.has(n.slug)),edges:kept,focus,hops};
}
