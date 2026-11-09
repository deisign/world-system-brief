import {dependencyTransitionTimeline} from './dependency-transitions.js';
import {atlasEscape as E} from './atlas-primitives.js';

const validDate=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'');
const bilingual=x=>!!x&&['en','ua'].every(k=>typeof x[k]==='string'&&x[k].trim());
const valid={leverage:['unknown','institutional_assessment','observed_price_signal'],rent:['unknown','company_earnings_signal'],adaptation:['unknown','proposed','observed_route_adjustment']};

export function validateDependencyAssessments(data,registry,bundles){
 if(data?.schema!=='wsb-dependency-assessments-v1'||!Array.isArray(data.records)||!Array.isArray(registry?.entities)||!Array.isArray(bundles))throw Error('Invalid dependency assessments schema');
 const entities=new Map(registry.entities.map(e=>[e.slug,e])),issues=new Map(bundles.map(b=>[b.state.issue_id,b])),ids=new Set(),prior=new Map();
 for(const r of data.records){
  if(!r.id||ids.has(r.id))throw Error('Duplicate or missing assessment ID');ids.add(r.id);
  const entity=entities.get(r.entity_slug),issue=issues.get(r.issue_id);
  if(!entity||!bilingual(entity.labels)||!issue||issue.state.date!==r.date||!validDate(r.date)||r.classification!=='knowledge_update'||!['goods','capital','energy','technology','data','labour','materials'].includes(r.flow_type))throw Error('Invalid entity, issue or classification '+r.id);
  if(prior.has(r.entity_slug)&&prior.get(r.entity_slug)>=r.date)throw Error('Non-chronological assessment '+r.id);prior.set(r.entity_slug,r.date);
  if(['flow','dependency','bottleneck'].some(k=>!bilingual(r[k])))throw Error('Missing bilingual dimension '+r.id);
  const sub=r.substitutability;
  if(!sub||!bilingual(sub.scope)||!['unknown','assessed_horizon'].includes(sub.status))throw Error('Invalid replacement horizon '+r.id);
  if(sub.status==='unknown'&&(sub.min_years!==null||sub.max_years!==null))throw Error('Invented horizon '+r.id);
  if(sub.status==='assessed_horizon'&&(!Number.isInteger(sub.min_years)||!Number.isInteger(sub.max_years)||sub.min_years<0||sub.max_years<sub.min_years))throw Error('Invalid horizon bounds '+r.id);
  for(const k of Object.keys(valid))if(!r[k]||!valid[k].includes(r[k].status)||!bilingual(r[k].text))throw Error('Invalid '+k+' statement '+r.id);
  if(!Array.isArray(r.claim_ids)||!r.claim_ids.length||!Array.isArray(r.source_ids)||!r.source_ids.length||new Set(r.claim_ids).size!==r.claim_ids.length||new Set(r.source_ids).size!==r.source_ids.length)throw Error('Missing or duplicate evidence '+r.id);
  const claims=new Map((issue.claims?.claims||[]).map(c=>[c.id,c])),sources=new Map((issue.evidence?.records||[]).map(s=>[s.id,s]));
  for(const id of r.claim_ids){
   const c=claims.get(id);
   if(!c||!(c.entity_ids||[]).some(e=>e===entity.id||e===entity.slug)||c.status==='confirmed_delta')throw Error('Claim does not support knowledge update '+id);
  }
  for(const id of r.source_ids){
   const s=sources.get(id);
   if(!s||!/^https:\/\//.test(s.url||'')||!validDate(s.publication_date)||s.publication_date>r.date||s.role==='baseline'||s.source_type==='internal'||!(s.supports||[]).some(e=>e===entity.id||e===entity.slug)||!r.claim_ids.some(cid=>(claims.get(cid).source_ids||[]).includes(id)))throw Error('Unlinked evidence '+id);
  }
  if(sub.status==='assessed_horizon'&&!r.source_ids.some(id=>{const s=sources.get(id).claim||'';return s.includes(String(sub.min_years))&&s.includes(String(sub.max_years))}))throw Error('Horizon absent from evidence '+r.id);
 }
 return true;
}
export function dependencyLedgerPage({lang,records,registry,bundles,slug=null,engravings=[],transitions=[]}){
 if(!['en','ua'].includes(lang)||!Array.isArray(records))throw Error('Invalid ledger page');
 const ua=lang==='ua',other=ua?'en':'ua',entities=new Map(registry.entities.map(e=>[e.slug,e])),issues=new Map(bundles.map(b=>[b.state.issue_id,b]));
 const shown=slug?records.filter(r=>r.entity_slug===slug):records;
 if(slug&&!shown.length)throw Error('Missing dependency profile');
 const title=slug?(entities.get(slug)?.labels?.[lang]||slug):(ua?'Реєстр структурних залежностей':'Structural Dependency Ledger');
 const labels=ua?['ПОТІК','ЗАЛЕЖНІСТЬ','ВУЗЬКЕ МІСЦЕ','ЗАМІННІСТЬ / ГОРИЗОНТ','ВАЖЕЛІ ВПЛИВУ','РЕНТА / ПРИБУТОК','АДАПТАЦІЯ']:['FLOW','DEPENDENCY','BOTTLENECK','SUBSTITUTABILITY / HORIZON','LEVERAGE','RENT / EARNINGS','ADAPTATION'];
 const field=(key,value)=>'<div class="field"><h3>'+key+'</h3><p>'+E(value)+'</p></div>';
 const matches=slug?engravings.filter(entry=>entry.review_status==='reviewed'&&entry.editorial?.related_entities?.includes(slug)):[];
 const visual=matches.map(entry=>{
  const id=encodeURIComponent(entry.id),alt=E(entry.alt[lang]),caption=E(entry.caption[lang]),title=E(entry.title[lang]);
  const src='/assets/engravings/'+id+'.svg';
  const source=entry.mobile_plate?'<source media="(max-width: 650px)" srcset="/assets/engravings/'+id+'-mobile.svg">':'';
  return '<figure class="engraving"><a href="/'+lang+'/engravings/'+id+'/"><picture>'+source+'<img src="'+src+'" alt="'+alt+'" loading="eager" width="960" height="640"></picture></a><figcaption><strong>'+title+'</strong> — '+caption+' <a href="/'+lang+'/engravings/'+id+'/">'+(ua?'Паспорт гравюри':'Engraving details')+'</a></figcaption></figure>';
 }).join('');
 const html=shown.slice().reverse().map(r=>{
  const entity=entities.get(r.entity_slug),display=entity?.labels?.[lang]||r.entity_slug;
  const horizon=r.substitutability.status==='unknown'?(ua?'НЕ ВСТАНОВЛЕНО':'UNKNOWN'):(r.substitutability.min_years+'–'+r.substitutability.max_years+(ua?' років (оцінка джерела)':' years (source assessment)'));
  const fields=[r.flow[lang],r.dependency[lang],r.bottleneck[lang],horizon+' — '+r.substitutability.scope[lang],r.leverage.text[lang],r.rent.text[lang],r.adaptation.text[lang]].map((v,i)=>field(labels[i],v)).join('');
  const issue=issues.get(r.issue_id),all=new Map((issue.evidence?.records||[]).map(s=>[s.id,s]));
  const sources=r.source_ids.map(id=>{const s=all.get(id);return '<li><a href="'+E(s.url)+'" rel="noopener noreferrer" target="_blank">'+E(s.source||s.id)+'</a> · '+E(id)+' · '+E(s.publication_date)+'</li>';}).join('');
  const claimLinks=r.claim_ids.map(id=>'<a href="/'+lang+'/claim/'+encodeURIComponent(id)+'/">'+E(id)+'</a>').join(' · ');
  if(!slug){
   const refs=r.source_ids.map(id=>{const src=all.get(id);return '<a href="'+E(src.url)+'" rel="noopener noreferrer" target="_blank">'+E(id)+'</a>';}).join(' · ');
   const detail='/'+lang+'/ledger/dependencies/'+encodeURIComponent(r.entity_slug)+'/';
   return '<article class="record record--summary"><p class="meta">'+E(r.date)+' · '+E(r.issue_id)+' · '+E(r.classification)+'</p><h2><a href="'+detail+'">'+E(display)+'</a></h2><p class="summary-bottleneck"><strong>'+(ua?'ВУЗЬКЕ МІСЦЕ':'BOTTLENECK')+'</strong> '+E(r.bottleneck[lang])+'</p><p class="summary-horizon">'+(ua?'ЗАМІННІСТЬ: ':'SUBSTITUTABILITY: ')+E(horizon)+'</p><p class="summary-links"><a href="'+detail+'">'+(ua?'ПОВНЕ ДОСЬЄ':'FULL ASSESSMENT')+'</a> · <a href="/'+lang+'/brief/'+E(r.date)+'/">'+E(r.issue_id)+'</a></p><p class="summary-refs">'+(ua?'ДЖЕРЕЛА: ':'SOURCES: ')+refs+'</p><p class="summary-refs">'+(ua?'ТВЕРДЖЕННЯ: ':'CLAIMS: ')+claimLinks+'</p></article>';
  }
  return '<article class="record"><p class="meta">'+E(r.date)+' · '+E(r.id)+' · '+E(r.classification)+'</p><h2><a href="/'+lang+'/ledger/dependencies/'+encodeURIComponent(r.entity_slug)+'/">'+E(display)+'</a></h2><p class="meta"><a href="/'+lang+'/brief/'+E(r.date)+'/">'+E(r.issue_id)+'</a> · <a href="/'+lang+'/entity/'+encodeURIComponent(r.entity_slug)+'/">'+(ua?'СУТНІСТЬ':'ENTITY')+'</a></p><div class="fields">'+fields+'</div><section class="sources"><h3>'+(ua?'ДЖЕРЕЛА':'SOURCES')+'</h3><ul>'+sources+'</ul><p>'+(ua?'Твердження: ':'Claims: ')+claimLinks+'</p></section></article>';
 }).join('');
 const css=':root{--paper:#F3EBDD;--ink:#232523;--red:#A2362A;--blue:#46697A;--rule:#B8AC9B}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink)}main{max-width:1180px;padding:24px clamp(16px,4vw,54px) 85px;margin:auto}.mast{font:800 clamp(24px,3.4vw,40px)/1.15 "Manrope",Arial,sans-serif;border-top:8px solid;border-bottom:2px solid;padding:16px 0}h1{font:800 clamp(30px,4.2vw,52px)/1.15 "Manrope",Arial,sans-serif;overflow-wrap:anywhere}h2{font:800 clamp(21px,2.5vw,29px)/1.2 "Manrope",Arial,sans-serif}p{font:17px/1.55 "IBM Plex Serif",Georgia,serif}nav,.meta,.field h3,.sources h3{font:700 11px/1.5 "IBM Plex Mono",monospace}.meta,.field h3,.sources h3{color:var(--red)}nav{display:flex;gap:20px;flex-wrap:wrap;padding:18px 0;border-bottom:1px solid var(--rule)}a{color:var(--blue);text-underline-offset:3px;overflow-wrap:anywhere}a:focus-visible{outline:3px solid var(--blue);outline-offset:3px}.record{margin-top:32px;padding:24px 0;border-top:4px solid var(--ink)}.summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 30px}.record--summary{margin-top:18px;border-top:2px solid var(--ink);padding:17px 0}.record--summary h2{font-size:clamp(19px,2.2vw,26px);margin:12px 0}.summary-bottleneck{font-size:15px;line-height:1.5}.summary-bottleneck strong,.summary-horizon,.summary-links,.summary-refs{font:700 11px/1.65 "IBM Plex Mono",monospace}.summary-bottleneck strong{display:block;color:var(--red);font-size:10px}.summary-horizon{color:var(--red)}.summary-refs{overflow-wrap:anywhere}.summary-refs a{display:inline-block;margin-right:4px}.summary-links{border-top:1px solid var(--rule);padding-top:10px}.record--summary .meta{line-height:1.6}.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 30px}.field{border-top:1px solid var(--rule);padding:14px 0}.field h3{margin:0}.field p{margin:6px 0}.sources{border-top:2px solid var(--ink);padding-top:14px}.sources li{font:14px/1.6 "IBM Plex Serif",Georgia,serif;margin:6px 0}.engraving{margin:26px 0 42px;padding:12px 0 22px;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}.engraving picture,.engraving img{display:block;width:100%;height:auto}.engraving figcaption{font:14px/1.55 "IBM Plex Serif",Georgia,serif;max-width:840px;margin-top:8px}.engraving figcaption a{margin-left:.4em}@media(max-width:680px){main{padding:16px}.fields,.summary-grid{grid-template-columns:1fr}h1{font-size:clamp(28px,7vw,40px)}}';
 const intro=ua?'Датовані структурні оцінки з перевірними джерелами. Нова інформація не є фізичною зміною системи. Невідоме залишається невідомим.':'Dated structural assessments backed by canonical evidence. New knowledge is not a physical system change. Unknown values remain unknown.';
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB · '+E(title)+'</title><style>'+css+'</style></head><body><main><header class="mast">WORLD SYSTEM BRIEF</header><nav aria-label="Ledger navigation"><a href="/'+lang+'/">'+(ua?'ГОЛОВНА':'HOME')+'</a><a href="/'+lang+'/ledger/dependencies/">'+(ua?'УСІ ЗАЛЕЖНОСТІ':'ALL DEPENDENCIES')+'</a><a href="/'+lang+'/atlas/studies/">ATLAS</a><a href="/'+other+'/ledger/dependencies/'+(slug?encodeURIComponent(slug)+'/':'')+'">'+other.toUpperCase()+'</a></nav><h1>'+E(title)+'</h1><p>'+E(intro)+'</p>'+visual+(slug?dependencyTransitionTimeline(transitions,lang,slug)+html:'<div class="summary-grid">'+html+'</div>')+'</main></body></html>';
}
