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
