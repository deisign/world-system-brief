import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const out=path.join(root,"dist");
const issueDirs=fs.readdirSync(path.join(root,"issues")).filter(x=>/^\d{4}$/.test(x)).sort();
const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[c]));
const registryPath=path.join(root,"knowledge","entities.json");
const registry=fs.existsSync(registryPath)?JSON.parse(fs.readFileSync(registryPath,"utf8")).entities||[]:[];
const byEnt=new Map(registry.map(e=>[e.id,e]));
const bySlug=new Map(registry.map(e=>[e.slug,e]));
const relationRows=[];

for(const dir of issueDirs){
 const base=path.join(root,"issues",dir);
 const rp=path.join(base,"relations.json");
 const cp=path.join(base,"claims.json");
 const ep=path.join(base,"evidence.json");
 const relations=fs.existsSync(rp)?JSON.parse(fs.readFileSync(rp,"utf8")).relations||[]:[];
 const claims=fs.existsSync(cp)?JSON.parse(fs.readFileSync(cp,"utf8")).claims||[]:[];
 const evidence=fs.existsSync(ep)?JSON.parse(fs.readFileSync(ep,"utf8")).records||[]:[];
 const claimMap=new Map(claims.map(c=>[c.id,c]));
 const sourceMap=new Map(evidence.map(s=>[s.id,s]));
 for(const relation of relations) relationRows.push({relation,claimMap,sourceMap});
}

const predicateLabel=(p,lang)=>{
 const labels={
  supplies:{en:"SUPPLIES",ua:"ПОСТАЧАЄ"},
  bypasses:{en:"BYPASSES",ua:"ОБХОДИТЬ"},
  finances:{en:"FINANCES",ua:"ФІНАНСУЄ"},
  enables:{en:"ENABLES",ua:"УМОЖЛИВЛЮЄ"},
  constrains:{en:"CONSTRAINS",ua:"ОБМЕЖУЄ"},
  flows_through:{en:"FLOWS THROUGH",ua:"ПРОХОДИТЬ ЧЕРЕЗ"},
  connects:{en:"CONNECTS",ua:"З'ЄДНУЄ"},
  increases_leverage_of:{en:"INCREASES LEVERAGE OF",ua:"ПОСИЛЮЄ ВАЖІЛЬ"},
  decreases_leverage_of:{en:"DECREASES LEVERAGE OF",ua:"ПОСЛАБЛЮЄ ВАЖІЛЬ"},
  responds_to:{en:"RESPONDS TO",ua:"РЕАГУЄ НА"}
 };
 return labels[p]?.[lang]||String(p||"").replaceAll("_"," ").toUpperCase();
};

function graphBlock(entity,lang,trackedSlugs){
 if(!entity)return "";
 const rows=relationRows.filter(x=>x.relation.from===entity.id||x.relation.to===entity.id);
 if(!rows.length)return "";
 const title=lang==="ua"?"ПОВ’ЯЗАНІ СУТНОСТІ":"CONNECTED ENTITIES";
 const intro=lang==="ua"?"Зв’язки, зафіксовані у структурованому шарі знань WSB.":"Relations recorded in the structured WSB knowledge layer.";
 const html=rows.map(({relation:r,claimMap,sourceMap})=>{
  const from=byEnt.get(r.from),to=byEnt.get(r.to);
  const name=e=>e?.labels?.[lang]||e?.slug||"?";
  const node=e=>trackedSlugs.has(e?.slug)?`<a href="/${lang}/entity/${encodeURIComponent(e.slug)}/"><strong>${esc(name(e))}</strong></a>`:`<strong>${esc(name(e))}</strong>`;
  const sources=[...new Set((r.source_ids||[]).map(id=>sourceMap.get(id)).filter(Boolean))];
  const sourceLinks=sources.map((s,i)=>`<a href="${/^https?:\/\//i.test(s.url||"")?esc(s.url):"#"}" rel="noopener noreferrer">[${i+1}]</a>`).join(" ")||"—";
  const claimText=(r.claim_ids||[]).map(id=>claimMap.get(id)).filter(Boolean).map(c=>c.statement).join(" ");
  const since=r.valid_from||r.observed_at||"—";
  const meta=lang==="ua"?`з ${esc(since)} · впевненість: ${esc(r.confidence||"—")}`:`since ${esc(since)} · confidence: ${esc(r.confidence||"—")}`;
  return `<div class="knowledge-relation"><div class="knowledge-edge">${node(from)} <span>${esc(predicateLabel(r.predicate,lang))}</span> ${node(to)}</div><div class="knowledge-meta">${meta} · ${sourceLinks}</div>${claimText?`<p>${esc(claimText)}</p>`:""}</div>`;
 }).join("");
 return `<section class="knowledge-graph"><h2>${title}</h2><p>${intro}</p>${html}</section>`;
}

for(const lang of ["en","ua"]){
 const index=new Map();
 for(const dir of issueDirs){
  const base=path.join(root,"issues",dir);
  const state=JSON.parse(fs.readFileSync(path.join(base,"state.json"),"utf8"));
  const loc=JSON.parse(fs.readFileSync(path.join(base,"locale",`${lang}.json`),"utf8"));
  const ep=path.join(base,"evidence.json");
  const evidence=fs.existsSync(ep)?JSON.parse(fs.readFileSync(ep,"utf8")):{records:[]};
  for(const object of state.objects||[]){
   if(!index.has(object.id))index.set(object.id,[]);
   index.get(object.id).push({state,loc,object,evidence});
  }
 }
 const trackedSlugs=new Set(index.keys());
 for(const [id,events] of index){
  const file=path.join(out,lang,"entity",id,"index.html");
  if(!fs.existsSync(file))continue;
  const sourceNumbers=new Map();
  let n=0;
  for(const e of events)for(const r of e.evidence.records||[])if((r.supports||[]).includes(id)&&!sourceNumbers.has(r.id))sourceNumbers.set(r.id,++n);
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
  const entity=bySlug.get(id);
  const graph=graphBlock(entity,lang,trackedSlugs);
  if(graph){
   html=html.replace("<section class=\"sources\">",`${graph}<section class="sources">`);
   html=html.replace("</style>",`.knowledge-graph{margin-top:54px;border-top:3px solid var(--ink);padding-top:18px}.knowledge-graph h2{border:0;margin:0 0 10px;padding:0}.knowledge-graph>p{font-size:14px;color:var(--muted)}.knowledge-relation{border-top:1px solid var(--rule);padding:17px 0}.knowledge-edge{font:700 14px/1.5 monospace}.knowledge-edge span{display:inline-block;margin:0 8px;font-size:10px;letter-spacing:.06em;color:var(--muted)}.knowledge-edge a{color:inherit;text-decoration:none;border-bottom:1px solid}.knowledge-meta{margin-top:7px;font:700 10px/1.4 monospace;color:var(--muted)}.knowledge-meta a{color:inherit}.knowledge-relation p{font-size:14px;line-height:1.45;margin:9px 0 0}</style>`);
  }
  fs.writeFileSync(file,html);
 }
}

console.log(`WSB knowledge graph: ${registry.length} registered entities · ${relationRows.length} relation(s)`);
