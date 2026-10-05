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
