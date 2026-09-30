import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const out=path.join(root,"dist");
const issueDirs=fs.readdirSync(path.join(root,"issues")).filter(x=>/^\d{4}$/.test(x)).sort();
const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[c]));

for(const lang of ["en","ua"]){
 const index=new Map();
 for(const dir of issueDirs){
  const base=path.join(root,"issues",dir);
  const state=JSON.parse(fs.readFileSync(path.join(base,"state.json"),"utf8"));
  const loc=JSON.parse(fs.readFileSync(path.join(base,"locale",`${lang}.json`),"utf8"));
  const ep=path.join(base,"evidence.json");
  const evidence=fs.existsSync(ep)?JSON.parse(fs.readFileSync(ep,"utf8")):{records:[]};
  for(const object of state.objects||[]){
   if(!index.has(object.id)) index.set(object.id,[]);
   index.get(object.id).push({state,loc,object,evidence});
  }
 }
 for(const [id,events] of index){
  const file=path.join(out,lang,"entity",id,"index.html");
  if(!fs.existsSync(file)) continue;
  const sourceNumbers=new Map();
  let n=0;
  for(const e of events) for(const r of e.evidence.records||[]) if((r.supports||[]).includes(id)&&!sourceNumbers.has(r.id)) sourceNumbers.set(r.id,++n);
  const history=events.map(e=>{
   const o=e.object,l=e.loc;
   const refs=(e.evidence.records||[]).filter(r=>(r.supports||[]).includes(id)).map(r=>`<a class="cite" href="#src-${esc(r.id)}">[${sourceNumbers.get(r.id)}]</a>`).join("");
   const from=l.states?.[o.entering_state]||o.entering_state||"—";
   const to=l.states?.[o.current_state]||o.current_state||"—";
   const status=l.statuses?.[o.status]||o.status||"—";
   const same=o.entering_state===o.current_state;
   const tag=lang==="ua"?(same?"БЕЗ ЗМІН":"ЗМІНА СТАНУ"):(same?"NO CHANGE":"STATE CHANGE");
   const stateLine=same?`<strong>${esc(to)}</strong>`:`<strong>${esc(from)}</strong> → <strong>${esc(to)}</strong>`;
   return `<div class="entity-event"><div class="date">${esc(e.state.date)} · <a href="/${lang}/brief/${e.state.date}/">${esc(e.state.issue_id)}</a>${refs}</div><p><strong>${tag}</strong><br>${stateLine}<br>${esc(status)}</p></div>`;
  }).join("");
  let html=fs.readFileSync(file,"utf8");
  html=html.replace(/(<section class="entity-history"><h2>[^<]*<\/h2>)[\s\S]*?(<\/section><section class="sources">)/,`$1${history}$2`);
  fs.writeFileSync(file,html);
 }
}
