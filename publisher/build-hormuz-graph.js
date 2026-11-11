import fs from 'node:fs';
import path from 'node:path';
import {resolveRetrospectiveRelations} from './retrospective-relations.js';

const dimensions=['flow','dependency','bottleneck','substitutability','leverage','rent','adaptation'];
const statuses=new Set(['observed_constraint','observed_partial','reported_observation','analyst_assessment','price_signal','proposed_not_commissioned','preliminary_report']);
const substitutes=new Set(['partial_observed','unknown','not_substitution','proposed']);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bilingual=x=>x&&['en','ua'].every(k=>typeof x[k]==='string'&&x[k].trim());
const read=(root,file)=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));

export function loadHormuzGraph(root=process.cwd()){
 const config=read(root,'knowledge/system-graphs/hormuz.json');
 const registry=read(root,'knowledge/entities.json');
 const retro=read(root,'knowledge/retrospective-relations.json');
 const ids=fs.readdirSync(path.join(root,'issues')).filter(x=>/^\d{4}$/.test(x)).sort();
 const bundles=ids.map(id=>{const folder='issues/'+id+'/',load=name=>{
  const file=path.join(root,folder+name+'.json');
  return fs.existsSync(file)?read(root,folder+name+'.json'):{};
 };return {state:load('state'),claims:load('claims'),evidence:load('evidence'),relations:load('relations')};});
 return validateHormuzGraph({config,registry,bundles,retro});
}
export function validateHormuzGraph({config,registry,bundles,retro}){
 if(config?.schema!=='wsb-system-graph-v2-pilot'||config.id!=='hormuz'||!/^\d{4}-\d{2}-\d{2}$/.test(config.as_of||'')||config.mode!=='evidence_graph_not_flow_simulation')throw Error('Invalid Hormuz pilot metadata');
 if(!Array.isArray(config.nodes)||!Array.isArray(config.edges)||config.nodes.length<2||!config.edges.length)throw Error('Empty dependency topology');
 for(const d of dimensions)if(!bilingual(config.dimensions?.[d]))throw Error('Missing Ledger dimension '+d);
 const registryMap=new Map(registry.entities.map(e=>[e.slug,e])),uniqueNodes=new Set(config.nodes);
 if(config.nodes.length!==uniqueNodes.size||config.nodes.some(id=>!registryMap.has(id)))throw Error('Unregistered or duplicate graph node');
 const issues=new Map(bundles.map(b=>[b.state.issue_id,b]));
 const historical=resolveRetrospectiveRelations(retro,bundles,registry);
 const recovered=new Map([...historical.documented,...historical.comparative].map(r=>[r.id,r]));
 const ids=new Set(),results=[];
 for(const edge of config.edges){
  if(!edge.id||ids.has(edge.id)||!uniqueNodes.has(edge.from)||!uniqueNodes.has(edge.to)||edge.from===edge.to||!edge.type||edge.flow!=='energy'||!statuses.has(edge.status)||!substitutes.has(edge.substitutability)||edge.physical_delta!==false||!bilingual(edge.explanation))throw Error('Invalid dependency edge '+edge.id);
  ids.add(edge.id);
  const proof=edge.evidence;
  if(!proof||!['issue_claim','retrospective'].includes(proof.kind))throw Error('Unsupported proof '+edge.id);
  let sources=[],date=null,claimIds=[];
  if(proof.kind==='issue_claim'){
   const b=issues.get(proof.issue_id);
   if(!b||b.state.date>config.as_of)throw Error('Unknown or future issue '+edge.id);
   const c=(b.claims.claims||[]).find(x=>x.id===proof.claim_id);
   const s=(b.evidence.records||[]).find(x=>x.id===proof.source_id);
   if(!c||!s||!c.source_ids?.includes(s.id)||!/^https:\/\//.test(s.url||'')||s.role==='baseline'||s.source_type==='internal'||s.publication_date>config.as_of)throw Error('Unverifiable claim and source '+edge.id);
   const alias=new Map(registry.entities.flatMap(e=>[[e.id,e.slug],[e.slug,e.slug]]));
   if(!c.entity_ids?.some(x=>[edge.from,edge.to].includes(alias.get(x))))throw Error('Claim does not mention dependency endpoint '+edge.id);
   if(!s.supports?.some(x=>[edge.from,edge.to].includes(alias.get(x))))throw Error('Source does not support dependency endpoint '+edge.id);
   sources=[{id:s.id,url:s.url,name:s.source||s.id,publication_date:s.publication_date}];date=b.state.date;claimIds=[c.id];
  }else{
   const r=recovered.get(proof.relation_id);
   if(!r||r.classification!=='documented'||r.from!==edge.from||r.to!==edge.to||r.registered_at>config.as_of||!r.sources?.length)throw Error('Unverifiable retrospective relation '+edge.id);
   sources=r.sources.map(s=>({id:s.id,url:s.url,name:s.name||s.id,publication_date:s.evidence_date||null}));
   date=r.registered_at;claimIds=r.claim_ids;
  }
  results.push({...edge,registered_at:date,claim_ids:claimIds,sources});
 }
 return {config,registry,edges:results};
}
const strings={
 en:{title:'HORMUZ · DEPENDENCY SYSTEM',deck:'A directed evidence model, not a transport simulation or a causal score.',heading:'Mechanism topology',warning:'Arrows describe separately sourced relations, not equivalent physical flows. A plan, a risk signal and a confirmed flow cannot be added together.',edge:'DIRECTIONAL MECHANISM',basis:'EVIDENCE',status:'STATUS',sub:'SUBSTITUTABILITY',registered:'Recorded in WSB',ledger:'Seven-dimension System Ledger',sources:'Sources and limitations',nodes:'REGISTERED ENTITIES',back:'SYSTEM MAP',latest:'LATEST',notDelta:'NO NEW PHYSICAL SYSTEM Δ IS CREATED BY THIS GRAPH',footer:'Source-backed pilot · 11 November 2026 · Version 2.0',dim:['FLOW','DEPENDENCY','BOTTLENECK','SUBSTITUTABILITY','LEVERAGE','RENT','ADAPTATION']},
 ua:{title:'ОРМУЗ · СИСТЕМА ЗАЛЕЖНОСТЕЙ',deck:'Направлена модель доказів, а не симуляція перевезень чи причинний рейтинг.',heading:'Топологія механізмів',warning:'Стрілки позначають різні відношення з джерелами, а не рівнозначні фізичні потоки. План, ризиковий сигнал та підтверджений потік не можна додавати.',edge:'НАПРЯМЛЕНИЙ МЕХАНІЗМ',basis:'ДОКАЗИ',status:'СТАН',sub:'ЗАМІННІСТЬ',registered:'Внесено до WSB',ledger:'Сім вимірів System Ledger',sources:'Джерела та обмеження',nodes:'ЗАРЕЄСТРОВАНІ СУТНОСТІ',back:'КАРТА СИСТЕМИ',latest:'ОСТАННІЙ ВИПУСК',notDelta:'ЦЕЙ ГРАФ НЕ СТВОРЮЄ НОВИХ ФІЗИЧНИХ СИСТЕМНИХ Δ',footer:'Пілот на основі джерел · 11 листопада 2026 · Версія 2.0',dim:['ПОТІК','ЗАЛЕЖНІСТЬ','ВУЗЬКЕ МІСЦЕ','ЗАМІННІСТЬ','ВАЖЕЛІ ВПЛИВУ','РЕНТА','АДАПТАЦІЯ']}
};
const clip=(x,max=34)=>x.length>max?x.slice(0,max-1)+'…':x;
function topologySVG(edges,entities,lang){
 const total=edges.length,spacing=86,width=1010,height=72+total*spacing,parts=[];
 parts.push('<svg role="img" aria-label="'+safe(lang==='ua'?'Направлені зв’язки системи Ормузу':'Directed Hormuz system dependencies')+'" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" xmlns="http://www.w3.org/2000/svg">');
 parts.push('<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#46697A"/></marker></defs><rect width="'+width+'" height="'+height+'" fill="#F2EBDD"/>');
 for(let i=0;i<total;i++){
  const e=edges[i],y=46+i*spacing,from=entities.get(e.from)?.labels?.[lang]||e.from,to=entities.get(e.to)?.labels?.[lang]||e.to,status=e.status==='price_signal'?'#8A6736':e.status==='proposed_not_commissioned'?'#A2362A':'#46697A';
  parts.push('<g><title>'+safe(from+' → '+to+' | '+e.type+' | '+e.status)+'</title>');
  parts.push('<rect x="18" y="'+y+'" width="421" height="58" fill="none" stroke="#A7A093"/><rect x="575" y="'+y+'" width="416" height="58" fill="none" stroke="#A7A093"/>');
  parts.push('<line x1="442" y1="'+(y+30)+'" x2="566" y2="'+(y+30)+'" stroke="'+status+'" stroke-width="2.5" marker-end="url(#arrow)"/>');
  parts.push('<text x="30" y="'+(y+23)+'" font-size="15" font-weight="700" font-family="Manrope,Arial,sans-serif" fill="#232523">'+safe(clip(from))+'</text>');
  parts.push('<text x="588" y="'+(y+23)+'" font-size="15" font-weight="700" font-family="Manrope,Arial,sans-serif" fill="#232523">'+safe(clip(to))+'</text>');
  parts.push('<text x="30" y="'+(y+44)+'" font-size="11" font-family="monospace" fill="#68655E">'+safe(e.id)+'</text><text x="588" y="'+(y+44)+'" font-size="11" font-family="monospace" fill="#68655E">'+safe(e.status.replaceAll('_',' '))+'</text></g>');
 }
 parts.push('</svg>');return parts.join('');
}
export function renderHormuzPage({lang,validated}){
 if(!strings[lang])throw Error('Unknown locale');const w=strings[lang],entity=new Map(validated.registry.entities.map(x=>[x.slug,x])),config=validated.config,edges=validated.edges;
 const name=id=>entity.get(id)?.labels?.[lang]||id;
 const detail=edges.map(e=>{
  const proof=e.sources.map(s=>'<a href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer">'+safe(s.name)+' · '+safe(s.id)+'</a>').join(' · ');
  const claim=e.claim_ids.map(x=>'<a href="/'+lang+'/claim/'+encodeURIComponent(x)+'/">'+safe(x)+'</a>').join(' · ');
  return '<article class="mechanism" id="'+safe(e.id)+'"><p class="meta">'+safe(e.id)+' · '+safe(e.status.replaceAll('_',' '))+' · '+safe(e.type.replaceAll('_',' '))+'</p><h3><a href="/'+lang+'/entity/'+encodeURIComponent(e.from)+'/">'+safe(name(e.from))+'</a> <span class="arrow">→</span> <a href="/'+lang+'/entity/'+encodeURIComponent(e.to)+'/">'+safe(name(e.to))+'</a></h3><p>'+safe(e.explanation[lang])+'</p><p class="evidence"><strong>'+w.sub+':</strong> '+safe(e.substitutability.replaceAll('_',' '))+' · <strong>'+w.registered+':</strong> '+safe(e.registered_at)+'</p><p class="evidence"><strong>'+w.basis+':</strong> '+proof+(claim?' · '+claim:'')+'</p></article>';
 }).join('');
 const seven=dimensions.map((d,i)=>'<section class="dimension"><h3>'+w.dim[i]+'</h3><p>'+safe(config.dimensions[d][lang])+'</p></section>').join('');
 const nodeRefs=config.nodes.map(id=>'<a href="/'+lang+'/entity/'+encodeURIComponent(id)+'/">'+safe(name(id))+'</a>').join(' · ');
 const css=':root{--paper:#F2EBDD;--ink:#232523;--rule:#A7A093;--blue:#46697A;--red:#A2362A}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:"IBM Plex Serif",Georgia,serif}main{max-width:1160px;margin:0 auto;padding:25px clamp(16px,4vw,54px) 100px}header{border-top:7px solid var(--ink);border-bottom:2px solid var(--ink);padding:16px 0 20px}nav{display:flex;gap:20px;font:700 12px/1.4 "IBM Plex Mono",monospace;padding:14px 0;flex-wrap:wrap}h1{font:800 clamp(32px,5vw,58px)/1.09 Manrope,Arial,sans-serif;letter-spacing:-.035em;overflow-wrap:anywhere;margin:18px 0}h2{font:800 clamp(24px,3vw,34px)/1.2 Manrope,Arial,sans-serif;border-top:3px solid var(--ink);padding-top:16px;margin-top:50px}h3{font:800 18px/1.3 Manrope,Arial,sans-serif;margin:12px 0}p{font:17px/1.55 "IBM Plex Serif",Georgia,serif;max-width:880px;overflow-wrap:anywhere}a{color:var(--blue);text-underline-offset:3px;overflow-wrap:anywhere}.topology{border:1px solid var(--rule);overflow-x:auto;max-width:100%;background:var(--paper);scrollbar-width:thin}.topology svg{display:block;min-width:800px;max-width:none;height:auto}.meta,.evidence,.notice{font:700 11px/1.7 "IBM Plex Mono",monospace}.meta{color:var(--red)}.mechanism{padding:15px 0 18px;border-bottom:1px solid var(--rule)}.mechanism h3 a{color:var(--ink)}.mechanism .arrow{color:var(--red)}.mechanism p{font-size:15px}.evidence{font-size:11px!important;max-width:100%}.evidence a{display:inline-block;margin:2px 8px 2px 0}.dimension{padding:14px 0;border-bottom:1px solid var(--rule)}.dimension h3{font:800 11px "IBM Plex Mono",monospace;color:var(--red)}.dimension p{font-size:16px}.notice{border-top:2px solid var(--red);padding-top:12px;color:var(--red)}@media(max-width:600px){.topology svg{min-width:940px}.mechanism h3{font-size:16px}.mechanism p{font-size:14px}}';
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>World System Brief · '+safe(w.title)+'</title><style>'+css+'</style></head><body><main><header><div class="meta">WORLD SYSTEM BRIEF · SYSTEM GRAPH V2 · '+safe(config.as_of)+'</div><nav><a href="/'+lang+'/map/">'+w.back+'</a><a href="/'+lang+'/">'+w.latest+'</a><a href="/'+(lang==='en'?'ua':'en')+'/dependencies/hormuz/">'+(lang==='en'?'UA':'EN')+'</a></nav><h1>'+w.title+'</h1><p>'+w.deck+'</p><p class="notice">'+w.notDelta+'</p></header><h2>'+w.heading+'</h2><p>'+w.warning+'</p><div class="topology" tabindex="0" role="region" aria-label="'+safe(w.heading)+'">'+topologySVG(edges,entity,lang)+'</div><h2>'+w.sources+'</h2>'+detail+'<h2>'+w.ledger+'</h2>'+seven+'<h2>'+w.nodes+'</h2><p class="evidence">'+nodeRefs+'</p><p class="meta">'+w.footer+'</p></main></body></html>';
}
export function publishHormuzPages(root=process.cwd()){
 const validated=loadHormuzGraph(root);
 for(const lang of ['en','ua']){const file=path.join(root,'dist',lang,'dependencies','hormuz','index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,renderHormuzPage({lang,validated}));}
 return {entities:validated.config.nodes.length,edges:validated.edges.length};
}
if(process.argv[1]?.endsWith('build-hormuz-graph.js'))console.log('System Graph v2 Hormuz pilot:',JSON.stringify(publishHormuzPages()));
