import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {atlasEscape as E,atlasSourceAnchor} from './atlas-primitives.js';
const root=fileURLToPath(new URL('../',import.meta.url));
export function loadStructuralProfiles(){
 return JSON.parse(fs.readFileSync(path.join(root,'knowledge/structural-profiles.json'),'utf8'));
}
export function validateStructuralProfiles(config,registry,study,existingHistory=new Map()){
 if(config?.schema!=='wsb-structural-profiles-v1'||!Array.isArray(config.profiles))throw Error('Invalid structural profile schema');
 const entityIndex=new Map((registry.entities||[]).map(e=>[e.slug,e]));
 const nodeIndex=new Map((study.nodes||[]).map(n=>[n.id,n]));
 const evidence=new Map((study.sources||[]).map(e=>[e.id,e]));
 const seen=new Set();
 for(const p of config.profiles){
  if(!p.slug||seen.has(p.slug))throw Error('Duplicate or missing structural entity');
  seen.add(p.slug);
  const registered=entityIndex.get(p.slug),node=nodeIndex.get(p.node_id);
  if(!registered||registered.type!=='organization'||!registered.labels?.en||!registered.labels?.ua)throw Error('Missing bilingual organization '+p.slug);
  if(!node||p.study!==study.id||!node.labels?.en||!node.labels?.ua||!node.detail?.en||!node.detail?.ua)throw Error('Unmatched source-backed study node '+p.slug);
  if(p.status!=='structural_snapshot'||p.issue_history!=='none')throw Error('Structural profile must not assert an event');
  if((existingHistory.get(p.slug)||[]).length)throw Error('Profile status out of date with issued history '+p.slug);
  if(!Array.isArray(p.source_ids)||!p.source_ids.length||p.source_ids.some(id=>!node.source_ids.includes(id)||!evidence.has(id)||!/^https:\/\//.test(evidence.get(id).url)))throw Error('Unverified source IDs '+p.slug);
 }
 if(config.profiles.length!==2||!seen.has('zeiss-smt')||!seen.has('asml'))throw Error('Unexpected EUV registry coverage');
 return true;
}
export function structuralProfilePage({lang='en',slug,config,registry,study}){
 if(!['en','ua'].includes(lang))throw Error('Unsupported language');
 validateStructuralProfiles(config,registry,study);
 const p=config.profiles.find(x=>x.slug===slug);
 if(!p)throw Error('Unknown structural profile '+slug);
 const entity=registry.entities.find(x=>x.slug===slug),node=study.nodes.find(x=>x.id===p.node_id);
 const evidence=study.sources.filter(x=>p.source_ids.includes(x.id));
 const ua=lang==='ua',other=ua?'en':'ua';
 const sources=evidence.map(x=>'<li><strong>'+E(x.id)+'</strong> · '+E(x.published??(ua?'без дати':'undated'))+' · '+atlasSourceAnchor({url:x.url,label:x.url})+'</li>').join('');
 const title=entity.labels[lang];
 const subtitle=ua?'СТРУКТУРНИЙ ПРОФІЛЬ':'STRUCTURAL PROFILE';
 const context=ua?'Встановлена джерелами структура залежності, а не нова подія чи підтверджена зміна стану. Випусків з історією стану цієї сутності ще немає.':'A source-backed structural dependency, not a newly observed event or a confirmed state change. No dated issue history exists yet for this entity.';
 const html='<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB · '+E(title)+'</title><style>:root{--paper:#F3EBDD;--ink:#232523;--red:#A2362A;--blue:#46697A;--rule:#B8AC9B}*{box-sizing:border-box}body{background:var(--paper);color:var(--ink);margin:0}main{max-width:1000px;padding:24px clamp(18px,4vw,52px) 90px;margin:auto}.mast{border-block:8px solid var(--ink);border-bottom-width:2px;padding:16px 0;font:800 clamp(25px,4vw,45px)/1.1 Arial,sans-serif}.kicker,.status,.meta,nav,.sources strong{font:700 12px/1.5 monospace}.kicker{color:var(--red);margin:35px 0 10px}h1{font:800 clamp(34px,5vw,65px)/1.1 Arial,sans-serif;overflow-wrap:anywhere;margin:0 0 18px}.explanation,.context{font:19px/1.55 Georgia,serif}.context{background:#E8DDCC;padding:22px;border-left:4px solid var(--red)}h2{font:700 12px/1.5 monospace;letter-spacing:.08em;color:var(--red);margin-top:42px;border-top:1px solid var(--rule);padding-top:16px}.sources{padding:0;list-style:none}.sources li{border-top:1px solid var(--rule);padding:16px 0;overflow-wrap:anywhere;font:14px/1.5 Georgia,serif}a{color:var(--blue);text-underline-offset:3px}a:focus-visible{outline:3px solid var(--blue);outline-offset:3px}nav{display:flex;flex-wrap:wrap;gap:20px;padding:20px 0}small{font:12px/1.5 monospace}@media(max-width:600px){main{padding:16px}h1{font-size:clamp(30px,8vw,44px)}}</style></head><body><main><header class="mast">WORLD SYSTEM BRIEF</header><p class="kicker">'+subtitle+' · '+E(entity.id)+'</p><h1>'+E(title)+'</h1><nav aria-label="Atlas navigation"><a href="/'+lang+'/visualizations/euv-optics/">'+(ua?'EUV / ДОСЛІДЖЕННЯ':'EUV / STUDY')+'</a><a href="/'+lang+'/atlas/studies/">'+(ua?'АТЛАС ДОСЛІДЖЕНЬ':'STUDIES ATLAS')+'</a><a href="/'+other+'/structure/'+encodeURIComponent(slug)+'/">'+other.toUpperCase()+'</a></nav><p class="explanation">'+E(node.detail[lang])+'</p><p class="context">'+context+'</p><p class="meta">'+(ua?'СТАН ДОСЛІДЖЕННЯ':'STUDY SNAPSHOT')+' · '+E(study.as_of)+' · '+E(study.id)+'</p><h2>'+(ua?'ДЖЕРЕЛА':'SOURCES')+'</h2><ul class="sources">'+sources+'</ul><small>'+(ua?'Підтверджено лише зазначену структурну залежність. Дані про потужність, горизонт заміщення та нові зміни не встановлені цим профілем.':'This profile confirms only the cited structural dependency. Capacity, replacement horizon and newly occurring changes are not established here.')+'</small></main></body></html>';
 return html;
}
