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
function md(md){
 let h=esc(md).replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
 return h.split(/\n\n+/).map(x=>/^<h[1-3]>/.test(x)?x:`<p>${x.replace(/\n/g,"<br>")}</p>`).join("\n");
}
function shell(body,{lang="en",mode="READ",date="",issue="",archive=false}={}){
 const other=lang==="en"?"ua":"en";
 const modeNav=archive
  ? `<a href="/${lang}/">LATEST</a><a href="/${other}/archive/">${other.toUpperCase()}</a>`
  : `<a href="/${lang}/brief/${date}/">READ</a><a href="/${lang}/system/${date}/">SYSTEM</a><a href="/${lang}/poster/${date}/">POSTER</a><a href="/${lang}/archive/">ARCHIVE</a><a href="/${other}/brief/${date}/">${other.toUpperCase()}</a>`;
 return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>World System Brief · ${archive?"Archive":date}</title><style>
:root{--paper:#F1ECE0;--ink:#292A27;--muted:#68655E;--rule:#8B877E}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial,sans-serif}main{max-width:980px;margin:auto;padding:40px 28px 90px}.mast{border-top:8px solid var(--ink);border-bottom:2px solid var(--ink);padding:18px 0 12px;margin-bottom:55px}.brand{font-weight:900;font-size:clamp(42px,7vw,82px);letter-spacing:-.06em;text-align:center}.sub{text-align:center;font:700 11px monospace;letter-spacing:.22em}.nav{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:16px;font:700 11px monospace}.nav a,.archive-row a{color:inherit;text-decoration:none;border-bottom:1px solid}article{max-width:760px;margin:auto}h1{font-size:54px;line-height:.95;letter-spacing:-.045em}h2{margin-top:48px;border-top:2px solid;padding-top:16px}h3{font:700 12px monospace;letter-spacing:.12em}p{font-size:19px;line-height:1.55}strong{font-weight:800}.meta{font:700 10px monospace;color:var(--muted);margin-bottom:24px}.archive-row{display:grid;grid-template-columns:130px 150px 1fr;gap:18px;align-items:baseline;border-top:1px solid var(--rule);padding:18px 0;font:700 13px monospace}.archive-modes{display:flex;gap:16px;flex-wrap:wrap}@media(max-width:650px){.archive-row{grid-template-columns:1fr}.brand{font-size:48px}}</style></head><body><main><header class="mast"><div class="brand">WORLD SYSTEM BRIEF</div><div class="sub">FLOWS · BOTTLENECKS · LEVERAGE</div><nav class="nav">${modeNav}</nav></header><div class="meta">${issue} · ${date} · ${mode}</div>${body}</main></body></html>`;
}
function archivePage(lang,items,lastDate){
 const title=lang==="ua"?"АРХІВ":"ARCHIVE";
 const rows=items.slice().reverse().map(x=>`<div class="archive-row"><strong>${esc(x.id)}</strong><span>${esc(x.date)}</span><span class="archive-modes"><a href="/${lang}/brief/${x.date}/">READ</a><a href="/${lang}/system/${x.date}/">SYSTEM</a><a href="/${lang}/poster/${x.date}/">POSTER</a></span></div>`).join("");
 return shell(`<article><h1>${title}</h1>${rows}</article>`,{lang,mode:title,date:lastDate,issue:title,archive:true});
}

fs.rmSync(out,{recursive:true,force:true}); mkdir(out);
const archive=[];
for(const id of issueDirs){
 const base=path.join(root,"issues",id), state=JSON.parse(fs.readFileSync(path.join(base,"state.json"),"utf8"));
 for(const lang of ["en","ua"]){
  const loc=JSON.parse(fs.readFileSync(path.join(base,"locale",lang+".json"),"utf8"));
  const read=fs.readFileSync(path.join(base,"read",lang+".md"),"utf8");
  write(path.join(out,lang,"brief",state.date,"index.html"),shell("<article>"+md(read)+"</article>",{lang,mode:"READ",date:state.date,issue:state.issue_id}));
  write(path.join(out,lang,"system",state.date,"index.html"),renderSystem(state,loc,lang));
  write(path.join(out,lang,"poster",state.date,"index.html"),renderPoster(state,loc,lang));
 }
 archive.push({id:state.issue_id,date:state.date});
}
const lastState=JSON.parse(fs.readFileSync(path.join(root,"issues",latest,"state.json"),"utf8"));
for(const lang of ["en","ua"]){
 write(path.join(out,lang,"index.html"),`<!doctype html><meta http-equiv="refresh" content="0;url=/${lang}/brief/${lastState.date}/">`);
 write(path.join(out,lang,"archive","index.html"),archivePage(lang,archive,lastState.date));
}
write(path.join(out,"archive","index.html"),`<!doctype html><meta http-equiv="refresh" content="0;url=/en/archive/">`);
write(path.join(out,"index.html"),`<!doctype html><meta charset="utf-8"><title>World System Brief</title><style>body{margin:0;background:#F1ECE0;color:#292A27;font-family:Arial}.x{min-height:100vh;display:grid;place-content:center;text-align:center}.b{font-size:clamp(50px,9vw,120px);font-weight:900;letter-spacing:-.07em}.s{font:700 12px monospace;letter-spacing:.25em;margin:15px}.a a{color:inherit;margin:20px;font:700 18px monospace}</style><div class="x"><div class="b">WORLD SYSTEM BRIEF</div><div class="s">FACTS · STRUCTURE · CONNECTIONS · CONSEQUENCES · NOT NOISE</div><div class="a"><a href="/en/brief/${lastState.date}/">READ EN →</a><a href="/ua/brief/${lastState.date}/">ЧИТАТИ UA →</a><a href="/en/archive/">ARCHIVE →</a></div></div>`);
console.log(`WSB build: ${issueDirs.length} issue(s) → dist/; archive: ${archive.length} issue(s) × 2 locales`);
