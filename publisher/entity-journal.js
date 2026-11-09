const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words={en:{catalog:'ENTITY ATLAS',intro:'Dated histories of observed system dependencies. Repeated states are observations, not necessarily new physical changes.',issues:'ISSUES',first:'FIRST OBSERVED',latest:'LATEST OBSERVATION',status:'LATEST STATUS',current:'CURRENT STATE',biography:'SYSTEM BIOGRAPHY',evidence:'SOURCES',ledger:'DEPENDENCY LEDGER',latestIssue:'READ LATEST ISSUE',index:'ALL ENTITIES',opening:'RECORDS IN ISSUES',noLedger:'No linked dependency assessment',noDelta:'Observed state is not necessarily a confirmed physical system change.'},ua:{catalog:'АТЛАС СУТНОСТЕЙ',intro:'Датовані історії спостережуваних системних залежностей. Повторювані стани не обов’язково є новими фізичними змінами.',issues:'ВИПУСКИ',first:'ПЕРШЕ СПОСТЕРЕЖЕННЯ',latest:'ОСТАННЄ СПОСТЕРЕЖЕННЯ',status:'ОСТАННІЙ СТАТУС',current:'ПОТОЧНИЙ СТАН',biography:'СИСТЕМНА БІОГРАФІЯ',evidence:'ДЖЕРЕЛА',ledger:'РЕЄСТР ЗАЛЕЖНОСТЕЙ',latestIssue:'ЧИТАТИ ОСТАННІЙ ВИПУСК',index:'УСІ СУТНОСТІ',opening:'ЗАПИСИ У ВИПУСКАХ',noLedger:'Немає пов’язаної оцінки залежності',noDelta:'Спостереження стану не обов’язково означає підтверджену фізичну зміну.'}};
const tag=(status,lang)=>({evidence_update:{en:'EVIDENCE UPDATE',ua:'ОНОВЛЕННЯ СВІДЧЕНЬ'},confirmed_delta:{en:'CONFIRMED Δ',ua:'ПІДТВЕРДЖЕНА Δ'},persistent:{en:'PERSISTENT',ua:'ТРИВАЄ'},developing:{en:'DEVELOPING',ua:'РОЗВИВАЄТЬСЯ'}}[status]?.[lang]||status||'—');
function validate(lang){if(!words[lang])throw Error('Invalid locale');}
const countSources=(events,id)=>new Set(events.flatMap(e=>(e.evidence?.records||[]).filter(r=>(r.supports||[]).includes(id)).map(r=>r.id))).size;
export function entityAtlasBody({lang,index,registry,ledgerSlugs=new Set()}){
 validate(lang);
 if(!(index instanceof Map)||!Array.isArray(registry?.entities)||!(ledgerSlugs instanceof Set))throw Error('Invalid entity index');
 const entries=[...index.entries()].map(([id,events])=>{
  if(!events?.length)throw Error('Empty entity biography '+id);
  const meta=registry.entities.find(e=>e.slug===id);
  const last=events.at(-1),first=events[0],name=meta?.labels?.[lang]||last.loc.labels?.[id]||id;
  return {id,events,name,first:first.state.date,last:last.state.date,status:last.object.status||'persistent',state:last.loc.states?.[last.object.current_state]||last.object.current_state,linked:ledgerSlugs.has(id),sources:countSources(events,id)};
 }).sort((a,b)=>b.last.localeCompare(a.last)||a.name.localeCompare(b.name,lang));
 const w=words[lang];
 const cards=entries.map(x=>'<article class="entity-tile"><div class="entity-tile-top"><span>'+esc(x.events.length)+' '+esc(w.issues)+'</span><time datetime="'+esc(x.last)+'">'+esc(x.last)+'</time></div><h2><a href="/'+lang+'/entity/'+encodeURIComponent(x.id)+'/">'+esc(x.name)+'</a></h2><p class="entity-current">'+esc(x.state)+'</p><div class="entity-tile-bottom"><span class="entity-status">'+esc(tag(x.status,lang))+'</span>'+(x.linked?'<span class="entity-linked">'+esc(w.ledger)+'</span>':'')+'</div></article>').join('');
 return '<div class="entity-atlas"><header class="entity-atlas-header"><p class="entity-kicker">'+esc(w.catalog)+'</p><h1>'+esc(lang==='ua'?'СУТНОСТІ':'ENTITIES')+'</h1><p>'+esc(w.intro)+'</p><p class="entity-count">'+entries.length+' '+esc(w.opening)+'</p></header><div class="entity-tiles">'+cards+'</div></div>';
}
export function entityBiographyBody({lang,id,events,registry,ledgerSlugs=new Set()}){
 validate(lang);
 if(!id||!Array.isArray(events)||!events.length||!(ledgerSlugs instanceof Set))throw Error('Invalid biography');
 const w=words[lang],first=events[0],last=events.at(-1);
 const entity=registry?.entities?.find(e=>e.slug===id);
 const label=entity?.labels?.[lang]||last.loc.labels?.[id]||id;
 const state=last.loc.states?.[last.object.current_state]||last.object.current_state||'—';
 const link='/'+lang+'/brief/'+last.state.date+'/';
 const ledger=ledgerSlugs.has(id)?'<a href="/'+lang+'/ledger/dependencies/'+encodeURIComponent(id)+'/">'+esc(w.ledger)+'</a>':'';
 const sources=[],seen=new Set();
 for(const entry of events)for(const item of entry.evidence?.records||[])if((item.supports||[]).includes(id)&&!seen.has(item.id)){seen.add(item.id);sources.push(item);}
 const list=sources.map((r,i)=>'<div class="source" id="src-'+esc(r.id)+'"><b>['+(i+1)+'] <a href="'+esc(/^https:\/\//.test(r.url||'')?r.url:'#')+'" rel="noopener noreferrer">'+esc(r.source||r.id)+'</a></b><p>'+esc(r.claim||'')+'</p></div>').join('');
 const summary='<div class="entity-biography-facts"><div><span>'+esc(w.first)+'</span><strong>'+esc(first.state.date)+'</strong></div><div><span>'+esc(w.latest)+'</span><strong>'+esc(last.state.date)+'</strong></div><div><span>'+esc(w.issues)+'</span><strong>'+events.length+'</strong></div><div><span>'+esc(w.status)+'</span><strong>'+esc(tag(last.object.status,lang))+'</strong></div></div>';
 const links='<nav class="entity-biography-links" aria-label="'+esc(w.catalog)+'"><a href="/'+lang+'/entities/">'+esc(w.index)+'</a><a href="'+esc(link)+'">'+esc(w.latestIssue)+'</a>'+ledger+'</nav>';
 return '<article class="entity-biography"><p class="entity-kicker">'+esc(entity?.type?.replaceAll('_',' ')||w.catalog)+'</p><h1>'+esc(label)+'</h1>'+summary+'<section class="entity-now"><h2>'+esc(w.current)+'</h2><p>'+esc(state)+'</p><small>'+esc(w.noDelta)+'</small></section>'+links+'<h2>'+esc(w.biography)+'</h2><section class="entity-chronology"></section><section class="sources"><h2>'+esc(w.evidence)+'</h2>'+list+'</section></article>';
}
