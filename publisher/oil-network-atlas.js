import {atlasStudyLinks} from './atlas-studies.js';
import {atlasEditorialHeader,atlasRegisterHeading,atlasSharedShellCSS} from "./atlas-layout.js";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";

const BASE=fileURLToPath(new URL("../",import.meta.url));
import {atlasEscape as esc,atlasSourceAnchor,atlasSectionTitle,atlasPalette} from "./atlas-primitives.js";
const read=p=>JSON.parse(readFileSync(path.join(BASE,p),"utf8"));
const selectionPath="knowledge/system-ledger-visual/oil-network.json";

const geometry={
 "hormuz":{x:20,y:75},
 "east-west-pipeline":{x:20,y:300},
 "gulf-oil-flow":{x:335,y:185},
 "refined-products-bottleneck":{x:645,y:80},
 "g7-emergency-stock-release":{x:645,y:370},
 "us-gulf-offshore-output":{x:940,y:75},
 "global-oil-balance":{x:940,y:320}
};
const W=210,H=74;
const relationLabelPositions={
 "REL-261008-03":{x:279,y:145},
 "REL-261007-01":{x:280,y:294},
 "REL-261006-01":{x:582,y:150},
 "REL-261006-02":{x:750,y:258},
 "REL-261008-02":{x:895,y:376},
 "REL-261008-01":{x:1045,y:241}
};
const paths={
 "REL-261008-03":"M230 112 L335 222",
 "REL-261007-01":"M230 337 L335 222",
 "REL-261006-01":"M545 222 L645 117",
 "REL-261006-02":"M750 370 L750 154",
 "REL-261008-02":"M855 407 L940 357",
 "REL-261008-01":"M1045 149 L1045 320"
};
const predicate={
 constrains:{en:"constrains",ua:"обмежує",short:{en:"CONSTRAINS",ua:"ОБМЕЖУЄ"},color:atlasPalette.constraint},
 supports_recovery:{en:"supports recovery",ua:"підтримує відновлення",short:{en:"SUPPORTS",ua:"ПІДТРИМУЄ"},color:atlasPalette.related},
 reveals_downstream_constraint:{en:"reveals downstream constraint",ua:"виявляє обмеження далі в системі",short:{en:"REVEALS",ua:"ВИЯВЛЯЄ"},color:atlasPalette.downstream},
 buffers:{en:"buffers",ua:"пом’якшує",short:{en:"BUFFERS",ua:"ПОМ’ЯКШУЄ"},color:atlasPalette.related}
};
const copy={
 en:{mast:"EDITORIAL ATLAS 2.0 / TEST 03",back:"EUV CHAIN",compare:"HORMUZ FLOW",new:"NETWORK / LEVERAGE",legend:{constrains:"CONSTRAINT",buffers:"BUFFER / RECOVERY",reveals:"DOWNSTREAM EFFECT"},source:"Dated source",nodes:"ENTITIES",edge:"RELATION",unknown:"No quantified leverage or rent inference",observed:"Dated archived report",physical:"PHYSICAL SUBSTRATE",context:"PHYSICAL SYSTEM",links:"LINKS ARE SOURCED, NOT MEASURED",fine:"The network is assembled from published issue relations and evidence; absence of an edge does not prove absence in the world."},
 ua:{mast:"EDITORIAL ATLAS 2.0 / ТЕСТ 03",back:"ЛАНЦЮГ EUV",compare:"МАРШРУТИ ОРМУЗУ",new:"NETWORK / LEVERAGE",legend:{constrains:"ОБМЕЖЕННЯ",buffers:"БУФЕР / ВІДНОВЛЕННЯ",reveals:"НАСЛІДОК ДАЛІ В СИСТЕМІ"},source:"Датоване джерело",nodes:"СУТНОСТІ",edge:"ВІДНОШЕННЯ",unknown:"Вплив і ренту кількісно не виміряно",observed:"Архівне датоване повідомлення",physical:"ФІЗИЧНА ОСНОВА",context:"ФІЗИЧНА СИСТЕМА",links:"ЗВ’ЯЗКИ ПІДТВЕРДЖЕНІ, АЛЕ НЕ ВИМІРЯНІ",fine:"Мережу складено із зафіксованих у випусках відношень і джерел; відсутність ребра не доводить відсутності реального зв’язку."}
};
function wrap(value,max=24){
 const words=String(value).split(/\s+/u),lines=[],current=[];
 for(const word of words){if([...current.join(" ")].length+word.length+1>max&&current.length){lines.push(current.join(" "));current.length=0}current.push(word)}
 if(current.length)lines.push(current.join(" "));
 return lines.slice(0,3);
}
export function loadOilNetwork(){
 const config=read(selectionPath),registry=read("knowledge/entities.json");
 const records=[];
 for(const ref of config.edges){
  const issue=ref.issue,rel=read("issues/"+issue+"/relations.json"),ev=read("issues/"+issue+"/evidence.json");
  const row=rel.relations.find(r=>r.id===ref.id);
  if(!row)throw Error("Missing canonical relation "+ref.id);
  const sources=(row.source_ids||[]).map(id=>ev.records.find(e=>e.id===id));
  if(sources.some(x=>!x))throw Error("Missing canonical evidence for "+ref.id);
  records.push({...row,issue,date:ev.as_of||rel.as_of,sources:sources.map(s=>({id:s.id,url:s.url,publisher:s.source,date:s.publication_date}))});
 }
 const nodes=config.nodes.map(slug=>{
  const entity=registry.entities.find(e=>e.slug===slug);
  if(!entity)throw Error("Missing registered entity "+slug);
  return {...entity};
 });
 return {config,nodes,records};
}
export function validateOilNetwork({config,nodes,records}){
 if(config?.schema!=="wsb-network-selection-v1"||config.case_type!=="NETWORK_LEVERAGE")throw Error("Invalid network selection");
 if(nodes?.length!==7||records?.length!==6||new Set(nodes.map(n=>n.slug)).size!==7)throw Error("Unexpected graph size");
 const ids=new Set(nodes.map(n=>n.slug));
 for(const n of nodes)if(!n.labels?.en||!n.labels?.ua||!geometry[n.slug])throw Error("Unknown node or translation");
 for(const r of records){
  const pred=r.predicate||r.type;
  if(!ids.has(r.from)||!ids.has(r.to)||!predicate[pred])throw Error("Unknown source-backed network edge");
  if(!paths[r.id]||!relationLabelPositions[r.id])throw Error("Missing curated visual routing or label for "+r.id);
  if(!r.sources?.length||r.sources.some(s=>!/^https:\/\//.test(s.url)||!s.id||!s.date))throw Error("Missing dated source for "+r.id);
  if(!config.edges.some(e=>e.id===r.id&&e.issue===r.issue))throw Error("Unselected relation");
 }
 for(const lang of ["en","ua"])if(!config.analysis?.[lang]||!config.labels?.[lang]?.title)throw Error("Missing bilingual framing");
 if(config.qualifications?.rent_distribution!=="not_quantified"||config.qualifications?.system_effect!=="interpreted_not_quantified")throw Error("Unsupported influence measurement");
 return true;
}
export function oilNetworkPage({lang="en",data=loadOilNetwork(),entitySlugs=null}={}){
 if(!copy[lang])throw Error("Unsupported language");
 validateOilNetwork(data);
 const {config,nodes,records}=data,L=copy[lang],C=config.labels[lang],E=esc;
 const sourceLinks=record=>record.sources.map(s=>atlasSourceAnchor({url:s.url,label:s.id,title:s.publisher+" · "+s.date})).join(" · ");
 const edges=records.map(r=>{
  const p=predicate[r.predicate||r.type],g=relationLabelPositions[r.id],label=p.short[lang];
  const width=Math.max(55,[...label].length*7.5+14);
  return `<g data-network-relation="${E(r.id)}"><path data-edge="${E(r.id)}" d="${paths[r.id]}" fill="none" stroke="${p.color}" stroke-width="2.6" marker-end="url(#net-arrow-${p.color.slice(1)})" opacity=".9"><title>${E(r.from)} → ${E(r.to)}: ${E(p[lang])}</title></path><g class="edge-label" aria-label="${E(p[lang])}"><rect x="${(g.x-width/2).toFixed(1)}" y="${g.y-14}" width="${width.toFixed(1)}" height="20" fill="#F3EBDD"/><text x="${g.x}" y="${g.y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="${p.color}">${E(label)}</text></g></g>`;
 }).join("");
 const dots=nodes.map(n=>{const g=geometry[n.slug],lines=wrap(n.labels[lang],24),fs=lines.length>2?13:14;return `${entitySlugs===null||entitySlugs.has(n.slug)?`<a href="/${lang}/entity/${E(n.slug)}/" aria-label="${E(n.labels[lang])}">`:`<g aria-label="${E(n.labels[lang])}">`}<rect x="${g.x}" y="${g.y}" width="${W}" height="${H}" fill="#F3EBDD" stroke="#232523" stroke-width="1.6"/><text x="${g.x+12}" y="${g.y+23}" font-family="Arial,sans-serif" font-weight="700" font-size="${fs}" fill="#232523">${lines.map((line,i)=>`<tspan x="${g.x+12}" dy="${i?17:0}">${E(line)}</tspan>`).join("")}</text>${entitySlugs===null||entitySlugs.has(n.slug)?"</a>":"</g>"}`}).join("");
 const ledger=records.map((r,i)=>{const p=predicate[r.predicate||r.type];const a=nodes.find(n=>n.slug===r.from),b=nodes.find(n=>n.slug===r.to);return `<article class="relation"><span class="num">${String(i+1).padStart(2,"0")}</span><div><h3>${E(a.labels[lang])} <span class="predicate">${E(p[lang])}</span> ${E(b.labels[lang])}</h3><p>${E(r.id)} · WSB-${r.issue} · ${E(r.date)} · ${sourceLinks(r)}</p></div></article>`}).join("");
 return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB · ${E(C.title)}</title><meta name="description" content="${E(C.intro)}"><style>
 :root{--paper:#F3EBDD;--ink:#232523;--red:#A2362A;--blue:#46697A;--ochre:#B08C3E;--rule:#B8AC9B}*{box-sizing:border-box}body{background:var(--paper);color:var(--ink);margin:0}a{color:var(--blue);text-underline-offset:3px;overflow-wrap:anywhere}a:focus-visible{outline:3px solid var(--blue);outline-offset:3px}main{max-width:1510px;margin:auto;padding:24px clamp(16px,3.8vw,58px) 80px}.mast{border-top:8px solid var(--ink);border-bottom:1px solid var(--ink);padding:15px 0;display:flex;justify-content:space-between;gap:10px;align-items:baseline;font:900 clamp(27px,4vw,50px)/1 Arial,sans-serif}.mast small{font:700 11px monospace}.kicker{font:700 11px monospace;color:var(--red);margin:26px 0 13px}h1{font:900 clamp(43px,7vw,100px)/.94 Arial,sans-serif;letter-spacing:-.055em;margin:0 0 22px;max-width:1230px}.lead{font:21px/1.47 Georgia,serif;max-width:950px}.nav{display:flex;flex-wrap:wrap;gap:23px;margin:25px 0 33px;font:700 11px monospace}.graph-section{border-top:5px solid var(--ink);border-bottom:2px solid var(--ink);padding:19px 0 13px}h2{font:700 12px monospace;color:var(--red);letter-spacing:.05em;margin:0 0 17px}.graph-frame{overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin}.graph-frame:focus-visible{outline:3px solid var(--blue);outline-offset:3px}.graph-pan-hint{display:none}@media(max-width:800px){.graph-pan-hint{display:block;font:700 10px/1.45 "IBM Plex Mono",monospace;color:var(--red);letter-spacing:.04em;margin:0 0 12px}}.graph-frame svg{display:block;width:100%;height:auto;min-width:760px;max-width:1180px;margin:auto}.graph-section figcaption{font:14px/1.5 Georgia,serif;max-width:900px}.graph-section figure{margin:0}.legend{display:flex;gap:18px;flex-wrap:wrap;margin:15px 0;font:700 11px monospace}.legend b{display:inline-block;width:25px;height:3px;vertical-align:middle;margin-right:8px}.context{display:grid;grid-template-columns:1fr 1.1fr;gap:28px;border-bottom:2px solid var(--ink);padding:27px 12px}.context p{font:20px/1.5 Georgia,serif;margin:0}.relations{padding:25px 10px}.relation{display:grid;grid-template-columns:40px 1fr;gap:16px;padding:13px 0;border-top:1px solid var(--rule)}.relation h3{font:700 15px/1.4 Arial,sans-serif;margin:0}.relation p{font:500 11px/1.5 monospace;color:#666;margin:7px 0}.relation .num{font:900 22px Arial,sans-serif}.predicate{color:var(--blue)}.fine{font:12px/1.55 monospace;color:#57534f;padding:14px 0;border-top:1px solid var(--rule)}@media(max-width:950px){.context{grid-template-columns:1fr}.graph-frame svg{min-width:700px}}@media(max-width:600px){main{padding:14px}.mast{display:block}.mast small{display:block;margin-top:10px}.lead{font-size:18px}.graph-frame svg{min-width:650px}.relation{grid-template-columns:28px 1fr;gap:8px}.relation h3{font-size:13px}.context p{font-size:18px}}
 ${atlasSharedShellCSS}</style></head><body><main>${atlasEditorialHeader({subtitle:L.mast,kicker:L.new+" / SYSTEM LEDGER",title:C.title,lead:C.intro,links:[{href:`/${lang}/visualizations/euv-optics/`,label:L.back},{href:`/${lang}/visualizations/chokepoint-bypass-v33/`,label:L.compare},{href:`/${lang==="en"?"ua":"en"}/visualizations/oil-network/`,label:lang==="en"?"UA":"EN"}]})}${atlasStudyLinks(lang,"network")}<section class="graph-section">${atlasRegisterHeading(1,C.graph)}<figure><p class="graph-pan-hint" aria-hidden="true">${lang==="ua"?"ПРОКРУТІТЬ СХЕМУ ГОРИЗОНТАЛЬНО ↔":"SCROLL THE DIAGRAM HORIZONTALLY ↔"}</p><div class="graph-frame" tabindex="0" role="region" aria-label="${lang==="ua"?"Горизонтально прокручувана схема нафтової мережі":"Horizontally scrollable oil network diagram"}"><svg viewBox="0 0 1170 510" role="img" aria-label="${E(C.graph)}" xmlns="http://www.w3.org/2000/svg"><title>${E(C.title)}</title><desc>${E(C.intro)}</desc><defs><marker id="net-arrow-A2362A" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#A2362A"/></marker><marker id="net-arrow-46697A" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#46697A"/></marker><marker id="net-arrow-B08C3E" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#B08C3E"/></marker></defs>${edges}${dots}</svg></div><figcaption>${E(C.caveat)}</figcaption></figure><div class="legend" aria-label="${E(L.legend.constrains)} · ${E(L.legend.buffers)} · ${E(L.legend.reveals)}"><span><b style="background:#A2362A"></b>${E(L.legend.constrains)}</span><span><b style="background:#46697A"></b>${E(L.legend.buffers)}</span><span><b style="background:#B08C3E"></b>${E(L.legend.reveals)}</span></div></section><section class="context"><div>${atlasRegisterHeading(2,C.process)}<p>${E(C.context)}</p></div><div>${atlasRegisterHeading(3,C.meaning)}<p>${E(config.analysis[lang])}</p></div></section><section class="relations">${atlasRegisterHeading(4,C.evidence)}${ledger}<p class="fine">${E(L.fine)} ${E(L.unknown)}</p></section></main></body></html>`;
}
