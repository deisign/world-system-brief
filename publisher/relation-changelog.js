// Append-only relation observations are different from verified physical changes.
// Only the explicit claim status "confirmed_delta" can authorize a physical transition.
const TERMINAL=new Set(['ended','inactive','rejected','superseded']);
const LABELS={en:{heading:'CHANGES IN THE RELATION RECORD',intro:'Newly recorded relations are discoveries in the ledger, not necessarily new connections in the world. Silence is not disappearance.',first:'FIRST RECORDED',observed:'FURTHER EVIDENCE',confirmed:'CONFIRMED STRUCTURAL CHANGE',ended:'CONFIRMED TERMINATION',uncertain:'UNVERIFIED STATE ASSERTION',none:'No new relation observations in this issue.',source:'SOURCES',claim:'CLAIMS'},ua:{heading:'ЗМІНИ В РЕЄСТРІ ЗВ’ЯЗКІВ',intro:'Вперше записаний зв’язок не обов’язково щойно виник у світі. Відсутність згадки не означає його зникнення.',first:'УПЕРШЕ ЗАПИСАНО',observed:'ДОДАТКОВІ СВІДЧЕННЯ',confirmed:'ПІДТВЕРДЖЕНА СТРУКТУРНА ЗМІНА',ended:'ПІДТВЕРДЖЕНЕ ПРИПИНЕННЯ',uncertain:'НЕПЕРЕВІРЕНА ЗАЯВА ПРО СТАН',none:'У цьому випуску немає нових спостережень про зв’язки.',source:'ДЖЕРЕЛА',claim:'ТВЕРДЖЕННЯ'}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ID=s=>typeof s==='string'&&s.length>0;
const DATE=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s);
const DIRECT=new Set(['strengthening','weakening','strengthened','weakened','increased','decreased','substituted','broken']);
const stateOf=e=>String(e.state||'active').toLowerCase();
// No inference from historical absence, new mention, or a change in phrasing.
export function classifyRelationObservations(bundles,registry={entities:[]}){
 if(!Array.isArray(bundles)||!Array.isArray(registry?.entities))throw Error('Invalid relation history');
 const alias=new Map(registry.entities.flatMap(e=>[[e.id,e.slug],[e.slug,e.slug]])),seen=new Map(),out=[];
 const sorted=[...bundles].sort((a,b)=>(a.state?.date||'').localeCompare(b.state?.date||''));
 for(const bundle of sorted){
  const {state,relations,claims,evidence}=bundle;
  if(!DATE(state?.date)||!ID(state?.issue_id))throw Error('Missing issue/date');
  const claimMap=new Map((claims?.claims||[]).map(c=>[c.id,c]));
  const sourceMap=new Map((evidence?.records||[]).map(s=>[s.id,s]));
  for(const relation of relations?.relations||relations?.records||[]){
   if(!ID(relation.from)||!ID(relation.to)||!ID(relation.type||relation.predicate))throw Error('Invalid relation endpoints');
   const from=alias.get(relation.from),to=alias.get(relation.to);
   if(!from||!to)throw Error('Unregistered relation endpoint');
   const type=relation.type||relation.predicate,key=[from,type,to].join('|'),prior=seen.get(key);
   const status=stateOf(relation),terminal=TERMINAL.has(status),directional=DIRECT.has(status);
   const claimIds=relation.claim_ids||[],sourceIds=relation.source_ids||[];
   if(!Array.isArray(claimIds)||!Array.isArray(sourceIds))throw Error('Invalid relation evidence array');
   const citedClaims=claimIds.map(id=>claimMap.get(id));
   const citedSources=sourceIds.map(id=>sourceMap.get(id));
   const validSources=sourceIds.length>0&&citedSources.every(s=>s&&/^https:\/\//.test(s.url||''));
   const validClaims=claimIds.length>0&&citedClaims.every(c=>c&&Array.isArray(c.source_ids)&&c.source_ids.some(id=>sourceIds.includes(id)));
   const physical=validSources&&validClaims&&citedClaims.some(c=>c.status==='confirmed_delta');
   // An attributed terminal assertion remains visible as unverified, not a deleted edge.
   const classification=terminal||directional?(physical?(terminal?'confirmed_termination':'confirmed_structural_change'):'unverified_state_assertion'):(prior?'further_evidence':'first_recorded');
   out.push({key,from,to,type,issue_id:state.issue_id,date:state.date,observed_state:status,classification,physical_delta:physical&&(terminal||directional),claim_ids:claimIds,source_ids:sourceIds,sources:validSources?citedSources.map(s=>({id:s.id,url:s.url,name:s.source||s.id})):[],previous_observation:prior?.date||null});
   seen.set(key,{date:state.date,status});
  }
 }
 return out;
}
export function relationChangesForDate(records,date){
 if(!DATE(date)||!Array.isArray(records))throw Error('Invalid change date');
 return records.filter(r=>r.date===date);
}
export function renderRelationChangeLog({lang,records,date,registry}){
 if(!LABELS[lang]||!Array.isArray(records)||!Array.isArray(registry?.entities))throw Error('Invalid changelog');
 const t=LABELS[lang],labels=new Map(registry.entities.map(e=>[e.slug,e.labels?.[lang]||e.slug])),items=relationChangesForDate(records,date);
 const cards=items.map(r=>{
  const title=labels.get(r.from)+' → '+r.type.replaceAll('_',' ')+' → '+labels.get(r.to);
  const sources=r.sources.map(s=>'<a href="'+esc(s.url)+'" rel="noopener noreferrer" target="_blank">'+esc(s.id)+'</a>').join(' · ');
  return '<article class="relation-change" data-change-kind="'+esc(r.classification)+'"><div class="relation-change-meta">'+esc(r.issue_id)+' · '+esc(r.date)+' · '+esc(t[r.classification]||r.classification)+'</div><p><a href="/'+lang+'/entity/'+encodeURIComponent(r.from)+'/">'+esc(labels.get(r.from))+'</a> → '+esc(r.type.replaceAll('_',' '))+' → <a href="/'+lang+'/entity/'+encodeURIComponent(r.to)+'/">'+esc(labels.get(r.to))+'</a></p>'+(sources?'<p class="relation-change-proof">'+esc(t.source)+': '+sources+'</p>':'')+(r.claim_ids.length?'<p class="relation-change-proof">'+esc(t.claim)+': '+esc(r.claim_ids.join(' · '))+'</p>':'')+'</article>';
 }).join('');
 return '<section class="relation-changelog" id="relation-changelog"><h2>'+esc(t.heading)+'</h2><p class="relation-changelog-intro">'+esc(t.intro)+'</p><div id="relation-changelog-records">'+(cards||'<p>'+esc(t.none)+'</p>')+'</div></section>';
}
export const relationChangelogCSS='.relation-changelog{margin:34px 0;border-top:3px solid var(--ink,#232523);padding-top:15px}.relation-changelog h2{font:800 clamp(22px,3vw,36px)/1.15 Manrope,Arial,sans-serif;border:0;margin:0 0 14px;padding:0}.relation-changelog-intro{font:15px/1.55 "IBM Plex Serif",Georgia,serif;max-width:800px}.relation-change{border-top:1px solid #CFC4B3;padding:15px 0}.relation-change-meta,.relation-change-proof{font:700 11px/1.5 "IBM Plex Mono",monospace;color:#46697A}.relation-change p{font-size:14px;line-height:1.6}.relation-change a{color:#46697A;text-underline-offset:3px}.relation-change[data-change-kind^="confirmed"] .relation-change-meta{color:#A2362A}';
