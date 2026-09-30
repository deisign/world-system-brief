import fs from "node:fs";
import path from "node:path";
import { renderSystem } from "../renderer/system/system-renderer.js";
import { renderPoster } from "../renderer/poster/poster-renderer.js";

const root=process.cwd(), out=path.join(root,"dist");
const issueDirs=fs.readdirSync(path.join(root,"issues")).filter(x=>/^\d{4}$/.test(x)).sort();
const latest=issueDirs.at(-1);
const mkdir=p=>fs.mkdirSync(p,{recursive:true});
const write=(p,s)=>{mkdir(path.dirname(p));fs.writeFileSync(p,s)};
const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[c]));
const safeUrl=s=>/^https?:\/\//i.test(String(s||""))?esc(s):"#";
function md(md){
 let h=esc(md).replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
 return h.split(/\n\n+/).map(x=>/^<h[1-3]>/.test(x)?x:`<p>${x.replace(/\n/g,"<br>")}</p>`).join("\n");
}
function shell(body,{lang="en",mode="READ",date="",issue="",archive=false,entity=false,entities=false}={}){
 const other=lang==="en"?"ua":"en";
 const modeNav=archive
  ? `<a href="/${lang}/">LATEST</a><a href="/${lang}/entities/">ENTITIES</a><a href="/${other}/archive/">${other.toUpperCase()}</a>`
  : entity||entities
   ? `<a href="/${lang}/">LATEST</a><a href="/${lang}/archive/">ARCHIVE</a><a href="/${lang}/entities/">ENTITIES</a><a href="/${other}/entities/">${other.toUpperCase()}</a>`
   : `<a href="/${lang}/brief/${date}/">READ</a><a href="/${lang}/system/${date}/">SYSTEM</a><a href="/${lang}/poster/${date}/">POSTER</a><a href="/${lang}/archive/">ARCHIVE</a><a href="/${lang}/entities/">ENTITIES</a><a href="/${other}/brief/${date}/">${other.toUpperCase()}</a>`;
 return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>World System Brief · ${archive?"Archive":entity||entities?issue:date}</title><style>
:root{--paper:#F1ECE0;--ink:#292A27;--muted:#68655E;--rule:#8B877E}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial,sans-serif}main{max-width:980px;margin:auto;padding:40px 28px 90px}.mast{border-top:8px solid var(--ink);border-bottom:2px solid var(--ink);padding:18px 0 12px;margin-bottom:55px}.brand{font-weight:900;font-size:clamp(42px,7vw,82px);letter-spacing:-.06em;text-align:center}.sub{text-align:center;font:700 11px monospace;letter-spacing:.22em}.nav{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:16px;font:700 11px monospace}.nav a,.archive-row a,.sources a,.entity-history a,.entity-link,.entity-row a,.cite{color:inherit;text-decoration:none;border-bottom:1px solid}article{max-width:760px;margin:auto}h1{font-size:54px;line-height:.95;letter-spacing:-.045em}h2{margin-top:48px;border-top:2px solid;padding-top:16px}h3{font:700 12px monospace;letter-spacing:.12em}p{font-size:19px;line-height:1.55}strong{font-weight:800}.meta{font:700 10px monospace;color:var(--muted);margin-bottom:24px}.archive-row{display:grid;grid-template-columns:130px 150px 1fr;gap:18px;align-items:baseline;border-top:1px solid var(--rule);padding:18px 0;font:700 13px monospace}.archive-modes{display:flex;gap:16px;flex-wrap:wrap}.sources{margin-top:60px;border-top:3px solid var(--ink);padding-top:18px}.sources h2{border:0;margin:0 0 18px;padding:0}.source{border-top:1px solid var(--rule);padding:14px 0}.source-head{font:700 12px monospace}.source p{font-size:14px;line-height:1.4;margin:7px 0}.cite{font:700 11px monospace;vertical-align:super;margin-left:3px}.entity-summary{display:grid;grid-template-columns:1fr 1fr;gap:12px;border-block:2px solid;padding:16px 0;font:700 12px monospace}.entity-history{margin-top:32px}.entity-event{border-top:1px solid var(--rule);padding:18px 0}.entity-event .date{font:700 11px monospace;color:var(--muted)}.entity-row{display:grid;grid-template-columns:2fr 1fr 1fr;gap:18px;border-top:1px solid var(--rule);padding:17px 0;align-items:baseline}.entity-row .state{font:12px/1.35 monospace;color:var(--muted)}.entity-row .count{font:700 11px monospace;text-align:right}@media(max-width:650px){.archive-row,.entity-summary,.entity-row{grid-template-columns:1fr}.entity-row .count{text-align:left}.brand{font-size:48px}}</style></head><body><main><header class="mast"><div class="brand">WORLD SYSTEM BRIEF</div><div class="sub">FLOWS · BOTTLENECKS · LEVERAGE</div><nav class="nav">${modeNav}</nav></header><div class="meta">${esc(issue)} · ${esc(date)} · ${esc(mode)}</div>${body}</main></body></html>`;
}
function archivePage(lang,items,lastDate){
 const title=lang==="ua"?"АРХІВ":"ARCHIVE";
 const rows=items.slice().reverse().map(x=>`<div class="archive-row"><strong>${esc(x.id)}</strong><span>${esc(x.date)}</span><span class="archive-modes"><a href="/${lang}/brief/${x.date}/">READ</a><a href="/${lang}/system/${x.date}/">SYSTEM</a><a href="/${lang}/poster/${x.date}/">POSTER</a></span></div>`).join("");
 return shell(`<article><h1>${title}</h1>${rows}</article>`,{lang,mode:title,date:lastDate,issue:title,archive:true});
}
function sourcesBlock(evidence,lang){
 const title=lang==="ua"?"ДЖЕРЕЛА":"SOURCES";
 const rows=(evidence.records||[]).map((r,i)=>`<div class="source" id="src-${esc(r.id)}"><div class="source-head">[${i+1}] <a href="${safeUrl(r.url)}" rel="noopener noreferrer">${esc(r.source)}</a> · ${esc(r.publication_date||"")}</div><p>${esc(r.claim||"")}</p></div>`).join("");
 return `<section class="sources"><h2>${title}</h2>${rows}</section>`;
}
function linkEntities(html,objects,loc,lang){
 const pairs=(objects||[]).map(o=>[o.id,loc.labels?.[o.id]]).filter(([,v])=>v).sort((a,b)=>b[1].length-a[1].length);
 for(const [id,label] of pairs){
  const needle=esc(label),href=`/${lang}/entity/${encodeURIComponent(id)}/`;
  html=html.replaceAll(needle,`<a class="entity-link" href="${href}">${needle}</a>`);
 }
 return html;
}
function citationMap(evidence){
 const map=new Map(); (evidence.records||[]).forEach((r,i)=>{for(const id of r.supports||[]){if(!map.has(id))map.set(id,[]);map.get(id).push({n:i+1,id:r.id});}}); return map;
}
function citeEntities(html,objects,loc,evidence){
 const cm=citationMap(evidence),pairs=(objects||[]).map(o=>[o.id,loc.labels?.[o.id]]).filter(([id,v])=>v&&cm.has(id)).sort((a,b)=>b[1].length-a[1].length);
 for(const [id,label] of pairs){
  const needle=esc(label),marks=cm.get(id).map(x=>`<a class="cite" href="#src-${esc(x.id)}">[${x.n}]</a>`).join("");
  const linked=`>${needle}</a>`;
  if(html.includes(linked)) html=html.replace(linked,linked+marks); else html=html.replace(needle,needle+marks);
 }
 return html;
}
function injectBeforeMainClose(html,fragment){return html.includes("</main>")?html.replace("</main>",fragment+"</main>"):html+fragment;}
function entityPage(lang,id,events){
 const last=events.at(-1),first=events[0],loc=last.loc,label=loc.labels?.[id]||id;
 const stateLabel=x=>loc.states?.[x]||x||"—",statusLabel=x=>loc.statuses?.[x]||x||"—";
 const srcMap=new Map(); for(const e of events) for(const r of e.evidence.records||[]) if((r.supports||[]).includes(id)) srcMap.set(r.id,r);
 const history=events.map(e=>{const o=e.object,l=e.loc;return `<div class="entity-event"><div class="date">${esc(e.state.date)} · <a href="/${lang}/brief/${e.state.date}/">${esc(e.state.issue_id)}</a></div><p><strong>${esc(l.states?.[o.entering_state]||o.entering_state)}</strong> → <strong>${esc(l.states?.[o.current_state]||o.current_state)}</strong><br>${esc(l.statuses?.[o.status]||o.status)}</p></div>`}).join("");
 const evidence={records:[...srcMap.values()]};
 const body=`<article><h1>${esc(label)}</h1><div class="entity-summary"><div>${lang==="ua"?"ПЕРША ФІКСАЦІЯ":"FIRST OBSERVED"}<br><strong>${esc(first.state.issue_id)} · ${esc(first.state.date)}</strong></div><div>${lang==="ua"?"ПОТОЧНИЙ СТАН":"CURRENT STATE"}<br><strong>${esc(stateLabel(last.object.current_state))}</strong><br>${esc(statusLabel(last.object.status))}</div></div><section class="entity-history"><h2>${lang==="ua"?"ІСТОРІЯ СТАНІВ":"STATE HISTORY"}</h2>${history}</section>${sourcesBlock(evidence,lang)}</article>`;
 return shell(body,{lang,mode:lang==="ua"?"СУТНІСТЬ":"ENTITY",date:last.state.date,issue:label,entity:true});
}
function entitiesPage(lang,index,lastDate){
 const title=lang==="ua"?"СУТНОСТІ":"ENTITIES",items=[...index.entries()].map(([id,events])=>{const last=events.at(-1),label=last.loc.labels?.[id]||id,state=last.loc.states?.[last.object.current_state]||last.object.current_state;return {id,events,label,state};}).sort((a,b)=>a.label.localeCompare(b.label,lang));
 const rows=items.map(x=>`<div class="entity-row"><div><a href="/${lang}/entity/${encodeURIComponent(x.id)}/"><strong>${esc(x.label)}</strong></a></div><div class="state">${esc(x.state)}</div><div class="count">${x.events.length} ${lang==="ua"?"ВИП.":"ISSUE"}${x.events.length===1?"":"S"}</div></div>`).join("");
 const intro=lang==="ua"?"Відстежувані об’єкти та їхній останній зафіксований стан.":"Tracked objects and their latest recorded state.";
 return shell(`<article><h1>${title}</h1><p>${intro}</p>${rows}</article>`,{lang,mode:title,date:lastDate,issue:title,entities:true});
}

fs.rmSync(out,{recursive:true,force:true}); mkdir(out);
const archive=[],entityIndex={en:new Map(),ua:new Map()};
for(const id of issueDirs){
 const base=path.join(root,"issues",id), state=JSON.parse(fs.readFileSync(path.join(base,"state.json"),"utf8"));
 const evidencePath=path.join(base,"evidence.json"),evidence=fs.existsSync(evidencePath)?JSON.parse(fs.readFileSync(evidencePath,"utf8")):{records:[]};
 for(const lang of ["en","ua"]){
  const loc=JSON.parse(fs.readFileSync(path.join(base,"locale",lang+".json"),"utf8"));
  const read=fs.readFileSync(path.join(base,"read",lang+".md"),"utf8");
  let readHtml=linkEntities(md(read),state.objects,loc,lang); readHtml=citeEntities(readHtml,state.objects,loc,evidence)+sourcesBlock(evidence,lang);
  write(path.join(out,lang,"brief",state.date,"index.html"),shell("<article>"+readHtml+"</article>",{lang,mode:"READ",date:state.date,issue:state.issue_id}));
  let systemHtml=renderSystem(state,loc,lang); systemHtml=injectBeforeMainClose(systemHtml,sourcesBlock(evidence,lang));
  write(path.join(out,lang,"system",state.date,"index.html"),systemHtml);
  write(path.join(out,lang,"poster",state.date,"index.html"),renderPoster(state,loc,lang));
  for(const object of state.objects||[]){if(!entityIndex[lang].has(object.id))entityIndex[lang].set(object.id,[]);entityIndex[lang].get(object.id).push({state,object,loc,evidence});}
 }
 archive.push({id:state.issue_id,date:state.date});
}
for(const lang of ["en","ua"]) for(const [id,events] of entityIndex[lang]) write(path.join(out,lang,"entity",id,"index.html"),entityPage(lang,id,events));
const lastState=JSON.parse(fs.readFileSync(path.join(root,"issues",latest,"state.json"),"utf8"));
for(const lang of ["en","ua"]){
 write(path.join(out,lang,"index.html"),`<!doctype html><meta http-equiv="refresh" content="0;url=/${lang}/brief/${lastState.date}/">`);
 write(path.join(out,lang,"archive","index.html"),archivePage(lang,archive,lastState.date));
 write(path.join(out,lang,"entities","index.html"),entitiesPage(lang,entityIndex[lang],lastState.date));
}
write(path.join(out,"archive","index.html"),`<!doctype html><meta http-equiv="refresh" content="0;url=/en/archive/">`);
write(path.join(out,"entities","index.html"),`<!doctype html><meta http-equiv="refresh" content="0;url=/en/entities/">`);
write(path.join(out,"index.html"),`<!doctype html><meta charset="utf-8"><title>World System Brief</title><style>body{margin:0;background:#F1ECE0;color:#292A27;font-family:Arial}.x{min-height:100vh;display:grid;place-content:center;text-align:center}.b{font-size:clamp(50px,9vw,120px);font-weight:900;letter-spacing:-.07em}.s{font:700 12px monospace;letter-spacing:.25em;margin:15px}.a a{color:inherit;margin:20px;font:700 18px monospace}</style><div class="x"><div class="b">WORLD SYSTEM BRIEF</div><div class="s">FACTS · STRUCTURE · CONNECTIONS · CONSEQUENCES · NOT NOISE</div><div class="a"><a href="/en/brief/${lastState.date}/">READ EN →</a><a href="/ua/brief/${lastState.date}/">ЧИТАТИ UA →</a><a href="/en/archive/">ARCHIVE →</a><a href="/en/entities/">ENTITIES →</a></div></div>`);
console.log(`WSB build: ${issueDirs.length} issue(s) → dist/; archive: ${archive.length} issue(s) × 2 locales; entities: ${entityIndex.en.size} EN / ${entityIndex.ua.size} UA`);
