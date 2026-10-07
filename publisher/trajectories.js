export function buildTrajectories(entityIndex, relationEvents = []) {
  const trajectories = [];
  for (const [id, events] of entityIndex.entries()) {
    if (events.length < 2) continue;
    const states = [];
    for (const e of events) {
      const state = e.object.current_state || e.object.entering_state || "unknown";
      if (!states.length || states.at(-1).state !== state) states.push({ date:e.state.date, issue:e.state.issue_id, state });
    }
    const rels = relationEvents.filter(r => r.from === id || r.to === id);
    trajectories.push({
      id,
      first: events[0].state.date,
      last: events.at(-1).state.date,
      appearances: events.length,
      states,
      relations: rels,
      score: events.length * 10 + states.length * 4 + rels.length
    });
  }
  return trajectories.sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
}

export function relationPersistence(relationEvents = []) {
  const map = new Map();
  for (const r of relationEvents) {
    const key = `${r.from}|${r.type}|${r.to}`;
    const x = map.get(key) || { from:r.from, type:r.type, to:r.to, dates:new Set(), issues:new Set() };
    if (r.date) x.dates.add(r.date);
    if (r.issue) x.issues.add(r.issue);
    map.set(key,x);
  }
  return [...map.values()].map(x=>({...x,dates:[...x.dates].sort(),issues:[...x.issues],count:x.dates.size})).filter(x=>x.count>1).sort((a,b)=>b.count-a.count);
}


const PATTERNS=[
 {id:"constraint-adaptation-rerouting-bottleneck",label:{en:"Constraint → adaptation → rerouting → secondary bottleneck",ua:"Обмеження → адаптація → перенаправлення → вторинне вузьке місце"},steps:[
  ["constraint","constrain","bottleneck","blocked","interrupted","risk"],
  ["adapt","recover","buffer","bypass"],
  ["rerout","route","transit","divert","bypass"],
  ["downstream","secondary","product","bottleneck","constraint"]
 ]},
 {id:"shock-buffer-infrastructure",label:{en:"Shock → buffer → infrastructure",ua:"Шок → буфер → інфраструктура"},steps:[
  ["shock","war","strike","disrupt","risk","constraint"],
  ["buffer","stock","reserve","support"],
  ["infrastructure","pipeline","interconnector","storage","construction","capacity"]
 ]},
 {id:"proposal-commitment-construction-operational",label:{en:"Proposal → commitment → construction → operational",ua:"Пропозиція → зобов’язання → будівництво → експлуатація"},steps:[
  ["proposal","proposed","pre_fid","option"],
  ["commit","fid","approved","agreed"],
  ["construct","construction","build"],
  ["operational","commissioned","active","flow"]
 ]}
];
const norm=s=>String(s||"").toLowerCase().replaceAll("_"," ");
const matches=(text,terms)=>terms.some(x=>text.includes(x));
export function detectTrajectoryPatterns(trajectories, relationEvents=[]){
 const out=[];
 for(const t of trajectories){
  const observations=[
   ...t.states.map(s=>({date:s.date,issue:s.issue,text:norm(s.state),kind:"state"})),
   ...relationEvents.filter(r=>r.from===t.id||r.to===t.id).map(r=>({date:r.date,issue:r.issue,text:norm([r.type,r.state,r.from,r.to].join(" ")),kind:"relation"}))
  ].sort((a,b)=>a.date.localeCompare(b.date));
  for(const p of PATTERNS){let pos=0,lastDate="",hits=[];for(const o of observations){if(o.date<lastDate)continue;if(matches(o.text,p.steps[pos])){hits.push(o);lastDate=o.date;pos++;if(pos===p.steps.length)break}}if(pos>=2){out.push({entity:t.id,pattern:p.id,label:p.label,matched_steps:pos,total_steps:p.steps.length,confidence:pos===p.steps.length?"high":pos===p.steps.length-1?"medium":"low",status:pos===p.steps.length?"detected":"forming",hits})}}
 }
 return out.sort((a,b)=>b.matched_steps-a.matched_steps||a.entity.localeCompare(b.entity));
}


const GRAPH_PATTERNS=[
 {id:"constraint-adaptation-rerouting-bottleneck-buffer",label:{en:"Constraint → adaptation → rerouting → secondary bottleneck → buffer",ua:"Обмеження → адаптація → перенаправлення → вторинне вузьке місце → буфер"},steps:[
  ["constraint"],["adaptation","bypass"],["rerouting","flow_recovery"],["secondary_constraint"],["buffer"]
 ]}
];
const CLASSIFIERS={
 constraint:["constraint","constrain","disrupt","interrupted","blocked","chokepoint"],
 adaptation:["adapt","recovering","bypass"],
 bypass:["bypass","rerout","route","transit"],
 rerouting:["rerout","route","transit","bypass"],
 flow_recovery:["flow recovery","flow_recover","exports continue recovering","recovering with abnormal","supports recovery","crude recovery","lng recovery"],
 secondary_constraint:["downstream constraint","products bottleneck","product supply tight","products lag","refining products lag","reveals downstream constraint"],
 buffer:["buffer","reserve release","stock release","strategic stock","release committed","market buffer"]
};
const classify=text=>Object.entries(CLASSIFIERS).filter(([,terms])=>matches(text,terms)).map(([k])=>k);
export function buildGraphObservations(issueBundles=[], entityAliases={}){
 const out=[],canon=x=>entityAliases[x]||x;
 for(const b of issueBundles){const s=b.state||{},date=s.date,issue=s.issue_id;
  for(const o of s.objects||[]){const text=norm([o.entering_state,o.current_state,o.status,o.change,o.constraint].join(" "));out.push({date,issue,node:canon(o.id),text,types:classify(text),kind:"object"})}
  for(const e of s.dominant_mechanism?.edges||[]){const text=norm([e.type,e.status,e.constraint,e.change,e.from,e.to].join(" "));out.push({date,issue,from:canon(e.from),to:canon(e.to),node:canon(e.to),text,types:classify(text),kind:"mechanism_edge"})}
  for(const r of b.relations?.relations||b.relations?.records||[]){const text=norm([r.type,r.predicate,r.state,r.change,r.from,r.to].join(" "));out.push({date,issue,from:canon(r.from),to:canon(r.to),node:canon(r.to),text,types:classify(text),kind:"relation"})}
 }
 return out.sort((a,b)=>a.date.localeCompare(b.date));
}
const nodes=o=>new Set([o.from,o.node,o.to].filter(Boolean));
const adjacent=(a,b)=>[...nodes(a)].some(x=>nodes(b).has(x));
function graphDistance(a,b,observations,maxHops=2){
 if(adjacent(a,b))return 0;const edges=observations.filter(o=>o.from&&o.to).map(o=>[o.from,o.to]);let frontier=[...nodes(a)],seen=new Set(frontier),targets=nodes(b);
 for(let d=1;d<=maxHops;d++){const next=[];for(const n of frontier)for(const [x,y] of edges){const z=x===n?y:y===n?x:null;if(z&&!seen.has(z)){if(targets.has(z))return d;seen.add(z);next.push(z)}}frontier=next}return Infinity;
}
const hasType=(o,accepted)=>o.types.some(t=>accepted.includes(t));
export function detectGraphTrajectoryPatterns(issueBundles=[],entityAliases={}){
 const obs=buildGraphObservations(issueBundles,entityAliases),out=[];
 for(const p of GRAPH_PATTERNS){for(let start=0;start<obs.length;start++){if(!hasType(obs[start],p.steps[0]))continue;let hits=[obs[start]],pos=1,last=obs[start];
   for(let i=start+1;i<obs.length&&pos<p.steps.length;i++){const o=obs[i];if(o.date<last.date||!hasType(o,p.steps[pos]))continue;if(graphDistance(last,o,obs.filter(x=>x.date<=o.date),2)>2)continue;hits.push(o);last=o;pos++}
   if(pos>=3)out.push({pattern:p.id,label:p.label,matched_steps:pos,total_steps:p.steps.length,status:pos===p.steps.length?"detected":"forming",confidence:pos===p.steps.length?"high":pos===p.steps.length-1?"medium":"low",first:hits[0].date,last:hits.at(-1).date,nodes:[...new Set(hits.flatMap(h=>[h.from,h.node,h.to]).filter(Boolean))],hits})
 }}
 const best=new Map();for(const x of out){const key=x.pattern+"|"+x.nodes.slice().sort().join("|"),old=best.get(key);if(!old||x.matched_steps>old.matched_steps)best.set(key,x)}
 return [...best.values()].sort((a,b)=>b.matched_steps-a.matched_steps||a.first.localeCompare(b.first));
}
