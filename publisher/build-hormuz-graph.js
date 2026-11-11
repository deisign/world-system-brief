import fs from 'node:fs';
import path from 'node:path';
import {resolveRetrospectiveRelations} from './retrospective-relations.js';
import {validateEvidenceGraph} from './system-graph-core.js';
import {renderDependencyTopologySVG} from './system-graph-topology.js';

const dimensions=['flow','dependency','bottleneck','substitutability','leverage','rent','adaptation'];
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(root,file)=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));

export function listSystemGraphIds(root=process.cwd()){
 return fs.readdirSync(path.join(root,'knowledge/system-graphs')).filter(name=>/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(name)).map(name=>name.slice(0,-5)).sort();
}
export function loadSystemGraph(root=process.cwd(),id='hormuz'){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||!listSystemGraphIds(root).includes(id))throw Error('Unknown graph dossier '+id);
 const config=read(root,'knowledge/system-graphs/'+id+'.json');
 if(config.id!==id)throw Error('Graph filename/ID mismatch '+id);
 const registry=read(root,'knowledge/entities.json');
 const retro=read(root,'knowledge/retrospective-relations.json');
 const ids=fs.readdirSync(path.join(root,'issues')).filter(x=>/^\d{4}$/.test(x)).sort();
 const bundles=ids.map(id=>{const folder='issues/'+id+'/',load=name=>{
  const file=path.join(root,folder+name+'.json');
  return fs.existsSync(file)?read(root,folder+name+'.json'):{};
 };return {state:load('state'),claims:load('claims'),evidence:load('evidence'),relations:load('relations')};});
 return validateSystemGraph({config,registry,bundles,retro});
}
export const loadHormuzGraph=root=>loadSystemGraph(root,'hormuz');
export function validateHormuzGraph(args){
 if(args.config?.id!=='hormuz')throw Error('Invalid Hormuz pilot metadata');
 return validateSystemGraph(args);
}
export function validateSystemGraph({config,registry,bundles,retro}){
 const issues=new Map(bundles.map(b=>[b.state.issue_id,b]));
 const historical=resolveRetrospectiveRelations(retro,bundles,registry);
 const recovered=new Map([...historical.documented,...historical.comparative].map(r=>[r.id,r]));
 const aliases=new Map(registry.entities.flatMap(e=>[[e.id,e.slug],[e.slug,e.slug]]));
 return validateEvidenceGraph({config,registry,resolveProof:(edge,asOf)=>{
  const proof=edge.evidence;
  if(proof.kind==='issue_claim'){
   const b=issues.get(proof.issue_id);
   if(!b||b.state.date>asOf)throw Error('Unknown or future issue '+edge.id);
   const c=(b.claims.claims||[]).find(x=>x.id===proof.claim_id);
   const source=(b.evidence.records||[]).find(x=>x.id===proof.source_id);
   if(!c||!source||!c.source_ids?.includes(source.id)||!/^https:\/\//.test(source.url||'')||source.role==='baseline'||source.source_type==='internal'||source.publication_date>asOf)throw Error('Unverifiable claim and source '+edge.id);
   if(!c.entity_ids?.some(x=>[edge.from,edge.to].includes(aliases.get(x))))throw Error('Claim does not mention dependency endpoint '+edge.id);
   if(!source.supports?.some(x=>[edge.from,edge.to].includes(aliases.get(x))))throw Error('Source does not support dependency endpoint '+edge.id);
   return {sources:[{id:source.id,url:source.url,name:source.source||source.id,publication_date:source.publication_date}],registered_at:b.state.date,claim_ids:[c.id]};
  }
  const rel=recovered.get(proof.relation_id);
  if(!rel||rel.classification!=='documented'||rel.from!==edge.from||rel.to!==edge.to||rel.registered_at>asOf||!rel.sources?.length)throw Error('Unverifiable retrospective relation '+edge.id);
  return {sources:rel.sources.map(source=>({id:source.id,url:source.url,name:source.name||source.id,publication_date:source.evidence_date||null})),registered_at:rel.registered_at,claim_ids:rel.claim_ids};
 }});
}
const strings={
 en:{title:'HORMUZ · DEPENDENCY SYSTEM',deck:'A directed evidence model, not a transport simulation or a causal score.',heading:'Dependency network',warning:'Arrows describe separately sourced relations, not equivalent physical flows. A plan, a risk signal and a confirmed flow cannot be added together.',edge:'DIRECTIONAL MECHANISM',basis:'EVIDENCE',status:'STATUS',sub:'SUBSTITUTABILITY',registered:'Recorded in WSB',ledger:'Seven-dimension System Ledger',sources:'Sources and limitations',nodes:'REGISTERED ENTITIES',back:'SYSTEM MAP',latest:'LATEST',notDelta:'NO NEW PHYSICAL SYSTEM Δ IS CREATED BY THIS GRAPH',footer:'Source-backed pilot · 11 November 2026 · Version 2.0',dim:['FLOW','DEPENDENCY','BOTTLENECK','SUBSTITUTABILITY','LEVERAGE','RENT','ADAPTATION']},
 ua:{title:'ОРМУЗ · СИСТЕМА ЗАЛЕЖНОСТЕЙ',deck:'Направлена модель доказів, а не симуляція перевезень чи причинний рейтинг.',heading:'Мережа залежностей',warning:'Стрілки позначають різні відношення з джерелами, а не рівнозначні фізичні потоки. План, ризиковий сигнал та підтверджений потік не можна додавати.',edge:'НАПРЯМЛЕНИЙ МЕХАНІЗМ',basis:'ДОКАЗИ',status:'СТАН',sub:'ЗАМІННІСТЬ',registered:'Внесено до WSB',ledger:'Сім вимірів System Ledger',sources:'Джерела та обмеження',nodes:'ЗАРЕЄСТРОВАНІ СУТНОСТІ',back:'КАРТА СИСТЕМИ',latest:'ОСТАННІЙ ВИПУСК',notDelta:'ЦЕЙ ГРАФ НЕ СТВОРЮЄ НОВИХ ФІЗИЧНИХ СИСТЕМНИХ Δ',footer:'Пілот на основі джерел · 11 листопада 2026 · Версія 2.0',dim:['ПОТІК','ЗАЛЕЖНІСТЬ','ВУЗЬКЕ МІСЦЕ','ЗАМІННІСТЬ','ВАЖЕЛІ ВПЛИВУ','РЕНТА','АДАПТАЦІЯ']}
};
export function renderHormuzPage({lang,validated}){
 if(!strings[lang])throw Error('Unknown locale');const config=validated.config,w=config.id==='hormuz'?strings[lang]:{...strings[lang],title:config.id.toUpperCase()+' · '+(lang==='ua'?'СИСТЕМА ЗАЛЕЖНОСТЕЙ':'DEPENDENCY SYSTEM'),footer:'Evidence-backed graph · '+config.as_of},entity=new Map(validated.registry.entities.map(x=>[x.slug,x])),edges=validated.edges;
 const name=id=>entity.get(id)?.labels?.[lang]||id;
 const detail=edges.map(e=>{
  const proof=e.sources.map(s=>'<a href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer">'+safe(s.name)+' · '+safe(s.id)+'</a>').join(' · ');
  const claim=e.claim_ids.map(x=>'<a href="/'+lang+'/claim/'+encodeURIComponent(x)+'/">'+safe(x)+'</a>').join(' · ');
  return '<article class="mechanism" id="'+safe(e.id)+'"><p class="meta">'+safe(e.id)+' · '+safe(e.status.replaceAll('_',' '))+' · '+safe(e.type.replaceAll('_',' '))+'</p><h3><a href="/'+lang+'/entity/'+encodeURIComponent(e.from)+'/">'+safe(name(e.from))+'</a> <span class="arrow">→</span> <a href="/'+lang+'/entity/'+encodeURIComponent(e.to)+'/">'+safe(name(e.to))+'</a></h3><p>'+safe(e.explanation[lang])+'</p><p class="evidence"><strong>'+w.sub+':</strong> '+safe(e.substitutability.replaceAll('_',' '))+' · <strong>'+w.registered+':</strong> '+safe(e.registered_at)+'</p><p class="evidence"><strong>'+w.basis+':</strong> '+proof+(claim?' · '+claim:'')+'</p></article>';
 }).join('');
 const seven=dimensions.map((d,i)=>'<section class="dimension"><h3>'+w.dim[i]+'</h3><p>'+safe(config.dimensions[d][lang])+'</p></section>').join('');
 const nodeRefs=config.nodes.map(id=>'<a href="/'+lang+'/entity/'+encodeURIComponent(id)+'/">'+safe(name(id))+'</a>').join(' · ');
 const css=':root{--paper:#F2EBDD;--ink:#232523;--rule:#A7A093;--blue:#46697A;--red:#A2362A}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:"IBM Plex Serif",Georgia,serif}main{max-width:1160px;margin:0 auto;padding:25px clamp(16px,4vw,54px) 100px}header{border-top:7px solid var(--ink);border-bottom:2px solid var(--ink);padding:16px 0 20px}nav{display:flex;gap:20px;font:700 12px/1.4 "IBM Plex Mono",monospace;padding:14px 0;flex-wrap:wrap}h1{font:800 clamp(32px,5vw,58px)/1.09 Manrope,Arial,sans-serif;letter-spacing:-.035em;overflow-wrap:anywhere;margin:18px 0}h2{font:800 clamp(24px,3vw,34px)/1.2 Manrope,Arial,sans-serif;border-top:3px solid var(--ink);padding-top:16px;margin-top:50px}h3{font:800 18px/1.3 Manrope,Arial,sans-serif;margin:12px 0}p{font:17px/1.55 "IBM Plex Serif",Georgia,serif;max-width:880px;overflow-wrap:anywhere}a{color:var(--blue);text-underline-offset:3px;overflow-wrap:anywhere}.topology{border:1px solid var(--rule);overflow-x:auto;max-width:100%;background:var(--paper);scrollbar-width:thin}.topology svg{display:block;min-width:800px;max-width:none;height:auto}.meta,.evidence,.notice{font:700 11px/1.7 "IBM Plex Mono",monospace}.meta{color:var(--red)}.mechanism{padding:15px 0 18px;border-bottom:1px solid var(--rule)}.mechanism h3 a{color:var(--ink)}.mechanism .arrow{color:var(--red)}.mechanism p{font-size:15px}.evidence{font-size:11px!important;max-width:100%}.evidence a{display:inline-block;margin:2px 8px 2px 0}.dimension{padding:14px 0;border-bottom:1px solid var(--rule)}.dimension h3{font:800 11px "IBM Plex Mono",monospace;color:var(--red)}.dimension p{font-size:16px}.notice{border-top:2px solid var(--red);padding-top:12px;color:var(--red)}@media(max-width:600px){.topology svg{min-width:940px}.mechanism h3{font-size:16px}.mechanism p{font-size:14px}}';
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>World System Brief · '+safe(w.title)+'</title><style>'+css+'</style></head><body><main><header><div class="meta">WORLD SYSTEM BRIEF · SYSTEM GRAPH V2 · '+safe(config.as_of)+'</div><nav><a href="/'+lang+'/map/">'+w.back+'</a><a href="/'+lang+'/dependencies/">'+(lang==='ua'?'ЗАЛЕЖНОСТІ':'DEPENDENCIES')+'</a><a href="/'+lang+'/">'+w.latest+'</a><a href="/'+(lang==='en'?'ua':'en')+'/dependencies/'+encodeURIComponent(config.id)+'/">'+(lang==='en'?'UA':'EN')+'</a></nav><h1>'+w.title+'</h1><p>'+w.deck+'</p><p class="notice">'+w.notDelta+'</p></header><h2>'+w.heading+'</h2><p>'+w.warning+'</p><div class="topology" tabindex="0" role="region" aria-label="'+safe(w.heading)+'">'+renderDependencyTopologySVG(validated,lang)+'</div><h2>'+w.sources+'</h2>'+detail+'<h2>'+w.ledger+'</h2>'+seven+'<h2>'+w.nodes+'</h2><p class="evidence">'+nodeRefs+'</p><p class="meta">'+w.footer+'</p></main></body></html>';
}
export function renderSystemGraphDirectory({lang,graphs}){
 if(!['en','ua'].includes(lang))throw Error('Unknown locale');
 const ua=lang==='ua';
 const title=ua?'СИСТЕМИ ЗАЛЕЖНОСТЕЙ':'DEPENDENCY SYSTEMS';
 const intro=ua?'Перевірені спрямовані механізми, а не моделювання фізичних потоків.':'Evidence-backed directed mechanisms, not simulated physical flows.';
 const listings=graphs.map(({config,edges})=>'<li><a href="/'+lang+'/dependencies/'+encodeURIComponent(config.id)+'/">'+safe(config.id.toUpperCase())+'</a><span> · '+config.nodes.length+' '+(ua?'сутностей':'entities')+' · '+edges.length+' '+(ua?'механізмів':'mechanisms')+' · '+safe(config.as_of)+'</span><p>'+safe(config.dimensions.dependency[lang])+'</p></li>').join('');
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>World System Brief · '+title+'</title><style>*{box-sizing:border-box}body{margin:0;background:#F2EBDD;color:#232523;font-family:Georgia,serif}main{max-width:940px;margin:auto;padding:28px clamp(16px,5vw,50px) 90px;border-top:7px solid #232523}h1{font:800 clamp(30px,5vw,56px)/1.1 Manrope,Arial,sans-serif}nav{display:flex;gap:20px;flex-wrap:wrap;font:700 13px monospace}a{color:#46697A}li{border-top:1px solid #A7A093;padding:20px 0;overflow-wrap:anywhere}li>a{font:800 23px Manrope,Arial,sans-serif}li span{font:12px monospace}li p{font-size:16px;line-height:1.55}</style></head><body><main><nav><a href="/'+lang+'/map/">'+(ua?'КАРТА СИСТЕМИ':'SYSTEM MAP')+'</a><a href="/'+lang+'/">'+(ua?'ОСТАННІЙ ВИПУСК':'LATEST')+'</a><a href="/'+(ua?'en':'ua')+'/dependencies/">'+(ua?'EN':'UA')+'</a></nav><h1>'+title+'</h1><p>'+intro+'</p><ol>'+listings+'</ol></main></body></html>';
}
export function publishHormuzPages(root=process.cwd()){
 const ids=listSystemGraphIds(root),graphs=ids.map(id=>loadSystemGraph(root,id));
 for(const lang of ['en','ua']){
  for(const validated of graphs){
   const file=path.join(root,'dist',lang,'dependencies',validated.config.id,'index.html');
   fs.mkdirSync(path.dirname(file),{recursive:true});
   fs.writeFileSync(file,renderHormuzPage({lang,validated}));
  }
  const directory=path.join(root,'dist',lang,'dependencies','index.html');
  fs.mkdirSync(path.dirname(directory),{recursive:true});
  fs.writeFileSync(directory,renderSystemGraphDirectory({lang,graphs}));
 }
 const hormuz=graphs.find(graph=>graph.config.id==='hormuz');
 if(!hormuz)throw Error('Missing Hormuz baseline');
 return {entities:hormuz.config.nodes.length,edges:hormuz.edges.length,dossiers:graphs.length};
}

if(process.argv[1]?.endsWith('build-hormuz-graph.js'))console.log('System Graph v2 Hormuz pilot:',JSON.stringify(publishHormuzPages()));
