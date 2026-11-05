import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {atlasEscape as E,atlasSourceAnchor,atlasPalette} from "./atlas-primitives.js";
import {atlasEditorialHeader,atlasRegisterHeading,atlasSharedShellCSS} from "./atlas-layout.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const load=p=>JSON.parse(readFileSync(path.join(ROOT,p),"utf8"));
const dictionary={
 en:{summary:"Reuters reported the IRGC tanker claims; independent confirmation of the losses remains absent.",kicker:"READ / EDITORIAL ATLAS 2.0 / SINGLE-ISSUE PILOT",first:"WHAT IS REPORTED",second:"DEPENDENCIES / SYSTEM LEDGER",third:"STATUS OF THE CLAIM",fourth:"EVIDENCE / SOURCE REGISTER",delta:"CONFIRMED NEW SYSTEM DELTAS",event:"A claim is not a confirmed physical loss.",claim:"Reported assertion",baseline:"Previous system state",status:"No new confirmed capacity loss",boundary:"Evidence boundary",compare:"ORIGINAL READ",archive:"ARCHIVE",system:"SYSTEM",other:"UA",method:"Source dates and claim status are preserved. The design does not turn unverified reporting into a confirmed system change.",labels:["Flow","Bottleneck","Substitution horizon","Leverage","Rent distribution","Adaptation"]},
 ua:{summary:"Reuters передало заяви КВІР про танкери; незалежного підтвердження втрат немає.",kicker:"READ / EDITORIAL ATLAS 2.0 / ПІЛОТ ОДНОГО ВИПУСКУ",first:"ПОВІДОМЛЕННЯ ТА ЙОГО СТАТУС",second:"ЗАЛЕЖНОСТІ / SYSTEM LEDGER",third:"СТАТУС ТВЕРДЖЕННЯ",fourth:"ДОКАЗИ / РЕЄСТР ДЖЕРЕЛ",delta:"ПІДТВЕРДЖЕНІ НОВІ СИСТЕМНІ ЗМІНИ",event:"Заява не є підтвердженням фізичної втрати.",claim:"Заявлене повідомлення",baseline:"Попередній стан системи",status:"Нових підтверджених втрат пропускної здатності немає",boundary:"Межа доказовості",compare:"ПОПЕРЕДНІЙ READ",archive:"АРХІВ",system:"SYSTEM",other:"EN",method:"Дати джерел і статус твердження збережено. Дизайн не перетворює неперевірене повідомлення на підтверджену зміну системи.",labels:["Потік","Вузьке місце","Горизонт заміщення","Важелі впливу","Розподіл ренти","Адаптація"]}
};
const labels={
 en:["Flow","Bottleneck","Substitution horizon","Leverage","Rent distribution","Adaptation"],
 ua:["Потік","Вузьке місце","Горизонт заміщення","Важелі впливу","Розподіл ренти","Адаптація"]
};
function extractMarkdown(read,lang){
 const titleLines=[...read.matchAll(/^# (.+)$/gm)].map(x=>x[1]);
 if(titleLines.length!==2||titleLines[0]!=="WORLD SYSTEM BRIEF")throw Error("Unexpected READ heading structure");
 const marker=lang==="ua"?"ПІДТВЕРДЖЕНІ НОВІ СИСТЕМНІ ЗМІНИ":"CONFIRMED NEW SYSTEM DELTAS";
 const count=read.match(new RegExp("^\\*\\*"+marker+": (\\d+)\\*\\*$","m"));
 if(!count)throw Error("Confirmed delta count not found");
 const start=read.indexOf("# "+titleLines[1]+"\n"),next=read.indexOf("\n## SYSTEM LEDGER",start);
 if(start<0||next<0)throw Error("READ narrative not found");
 const narrative=read.slice(start+titleLines[1].length+3,next).trim();
 const ledger=[];
 for(const label of labels[lang]){
  const prefix="**"+label+":** ";
  const match=read.split("\n").find(line=>line.startsWith(prefix));
  if(!match)throw Error("Missing READ Ledger field: "+label);
  ledger.push({name:label,value:match.slice(prefix.length)});
 }
 const boundary=read.trim().split(/\n\n/).at(-1);
 if(!boundary||boundary.startsWith("http"))throw Error("Evidence boundary missing");
 return {title:titleLines[1],narrative,confirmed:Number(count[1]),ledger,boundary};
}
export function loadReadPilot(){
 const issue="0038",folder="issues/"+issue;
 return {state:load(folder+"/state.json"),evidence:load(folder+"/evidence.json"),texts:{
  en:readFileSync(path.join(ROOT,folder,"read/en.md"),"utf8"),
  ua:readFileSync(path.join(ROOT,folder,"read/ua.md"),"utf8")
 }};
}
export function readAtlasPilot({lang="en",data=loadReadPilot()}={}){
 if(!dictionary[lang])throw Error("Unsupported language");
 const L=dictionary[lang],state=data.state,ev=data.evidence;
 if(state?.issue_id!=="WSB-0038"||state.date!=="2026-11-04"||ev.issue_id!==state.issue_id||ev.as_of!==state.date)throw Error("Unmatched issue/evidence");
 const entry=extractMarkdown(data.texts[lang],lang);
 if(entry.confirmed!==0)throw Error("Pilot safety assumption changed: verify interpretation");
 if(ev.records?.length!==2)throw Error("Unexpected source set");
 const primary=ev.records.find(x=>x.role==="primary_report");
 const baseline=ev.records.find(x=>x.role==="baseline");
 if(!primary||!baseline||!primary.url||!baseline.url||primary.publication_date!==state.date)throw Error("Missing dated source or baseline");
 const nav=atlasEditorialHeader({subtitle:state.issue_id+" / "+state.date,kicker:L.kicker,title:entry.title,lead:L.summary,links:[
  {href:"/"+lang+"/brief/"+state.date+"/",label:L.compare},
  {href:"/"+lang+"/system/"+state.date+"/",label:L.system},
  {href:"/"+lang+"/archive/",label:L.archive},
  {href:"/"+(lang==="en"?"ua":"en")+"/atlas/read/0038/",label:L.other}
 ]});
 const detail=entry.ledger.map((r,i)=>`<div class="ledger-row"><span class="ledger-id">${String(i+1).padStart(2,"0")}</span><dt>${E(r.name)}</dt><dd>${E(r.value)}</dd></div>`).join("");
 const sourceRow=(r,label)=>`<article class="source-row"><div class="source-meta"><strong>${E(label)}</strong><span>${E(r.publication_date)} · ${E(r.id)}</span></div><div>${atlasSourceAnchor({url:r.url,label:r.source})}<p>${E(r.claim)}</p></div></article>`;
 return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB READ 0038 — ${E(entry.title)}</title><meta name="description" content="${E(entry.narrative)}"><style>
 :root{--paper:${atlasPalette.paper};--ink:${atlasPalette.ink};--red:${atlasPalette.constraint};--blue:${atlasPalette.related};--rule:${atlasPalette.rule}}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink)}main{max-width:1510px;padding:24px clamp(16px,3.8vw,58px) 82px;margin:auto}a{color:var(--blue);text-underline-offset:3px;overflow-wrap:anywhere}a:focus-visible{outline:3px solid var(--blue);outline-offset:3px}.mast{border-top:8px solid var(--ink);border-bottom:1px solid var(--ink);padding:15px 0;display:flex;justify-content:space-between;gap:15px;align-items:baseline;font:900 clamp(25px,4vw,50px)/1 Arial,sans-serif}.mast small{font:700 11px/1.5 monospace}.kicker{font:700 11px/1.4 monospace;color:var(--red);margin:28px 0 14px}h1{font:850 clamp(34px,4.4vw,64px)/1.055 Arial,sans-serif;letter-spacing:-.038em;margin:0 0 20px;max-width:1190px;overflow-wrap:normal}.lead{font:20px/1.52 Georgia,serif;max-width:1000px}.nav{display:flex;flex-wrap:wrap;gap:21px;margin:26px 0 35px;font:700 11px monospace}.read-intro{display:grid;grid-template-columns:1.15fr .85fr;border-top:5px solid var(--ink);border-bottom:2px solid var(--ink)}.read-intro>section{min-width:0;padding:23px 20px 26px}.read-intro>section+section{border-left:1px solid var(--ink)}.read-intro p{font:20px/1.52 Georgia,serif}.delta{font:900 clamp(80px,11vw,145px)/.9 Arial,sans-serif;color:var(--red);letter-spacing:-.08em;margin:17px 0}.status{font:700 14px/1.5 monospace}.register{border-bottom:2px solid var(--ink);padding:27px 20px 28px}.register h2,.read-intro h2{font:700 12px/1.4 monospace;color:var(--red);margin:0 0 18px}.ledger-list{margin:0;display:grid;grid-template-columns:1fr 1fr;column-gap:25px}.ledger-row{display:grid;grid-template-columns:30px 1fr;gap:3px 12px;padding:13px 0;border-top:1px solid var(--rule)}.ledger-id{grid-row:span 2;font:900 21px Arial,sans-serif;color:var(--blue)}dt{font:700 12px/1.4 monospace}dd{margin:0;font:16px/1.5 Georgia,serif}.boundary{font:20px/1.5 Georgia,serif;max-width:1040px}.source-row{display:grid;grid-template-columns:250px 1fr;gap:18px;border-top:1px solid var(--rule);padding:16px 0}.source-meta{display:flex;flex-direction:column;gap:7px;font:700 11px/1.5 monospace}.source-meta span{color:#68655E}.source-row a{font:700 13px/1.5 monospace}.source-row p{font:14px/1.5 Georgia,serif}.foot{font:12px/1.6 monospace;color:#58564f;margin-top:25px}@media(max-width:940px){.read-intro,.ledger-list{grid-template-columns:1fr}.read-intro>section+section{border-left:0;border-top:1px solid var(--ink)}}@media(max-width:600px){h1{font-size:clamp(31px,8.6vw,42px);line-height:1.07;letter-spacing:-.035em}main{padding:14px}.mast{display:block}.mast small{display:block;margin-top:10px}.lead,.read-intro p{font-size:18px}.register,.read-intro>section{padding:20px 2px}.source-row{grid-template-columns:1fr;gap:7px}.boundary{font-size:18px}}
 ${atlasSharedShellCSS}</style></head><body><main>${nav}<div class="read-intro"><section>${atlasRegisterHeading(1,L.first)}<p>${E(entry.narrative)}</p></section><section>${atlasRegisterHeading(2,L.third)}<p class="status">${E(L.delta)}</p><div class="delta">0</div><p class="status">${E(L.event)}</p></section></div><section class="register"><div>${atlasRegisterHeading(3,L.second)}</div><dl class="ledger-list">${detail}</dl></section><section class="register"><div>${atlasRegisterHeading(4,L.fourth)}</div><p class="boundary">${E(entry.boundary)}</p>${sourceRow(primary,L.claim)}${sourceRow(baseline,L.baseline)}<p class="foot">${E(L.method)}</p></section></main></body></html>`;
}
