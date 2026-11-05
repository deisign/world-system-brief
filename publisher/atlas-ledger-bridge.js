import {atlasEscape as E} from './atlas-primitives.js';
const keys={
 flow:{hormuz:'hormuz','east-west':'east-west-pipeline','habshan-fujairah':null},
 chain:{zeiss:null,asml:null,fab:null},
 network:Object.fromEntries(['hormuz','east-west-pipeline','gulf-oil-flow','refined-products-bottleneck','g7-emergency-stock-release','global-oil-balance','us-gulf-offshore-output'].map(x=>[x,x]))
};
export function mapStudyEntities(kind,ids,registry,history){
 if(!keys[kind]||!Array.isArray(ids)||!(history instanceof Map))throw Error('Invalid bridge input');
 const registered=new Set((registry.entities||[]).map(x=>x.slug));
 return ids.map(key=>{
  if(!Object.hasOwn(keys[kind],key))throw Error('Unknown study node '+key);
  const slug=keys[kind][key],events=slug&&registered.has(slug)?history.get(slug):null;
  return {key,slug:Array.isArray(events)&&events.length?slug:null,events:Array.isArray(events)?events:[]};
 });
}
export function renderLedgerBridge({lang,kind,ids,labels,registry,history}){
 if(!['en','ua'].includes(lang))throw Error('Unsupported language');
 const ua=lang==='ua',rows=mapStudyEntities(kind,ids,registry,history);
 const names=new Map((registry.entities||[]).map(x=>[x.slug,x.labels?.[lang]||x.slug]));
 const items=rows.map(({key,slug,events})=>{
  const label=names.get(slug)||labels?.[key]?.[lang]||key;
  const date=slug?events[0].state.date+' — '+events.at(-1).state.date:'';
  const entry=slug?'<a href="/'+lang+'/entity/'+encodeURIComponent(slug)+'/">'+E(label)+'</a>':E(label);
  const state=slug?(ua?'БІОГРАФІЯ':'BIOGRAPHY')+' · '+events.length+' '+(ua?'вип.':'issues')+' · '+E(date):(ua?'НЕМАЄ ЗАПИСУ В SYSTEM LEDGER':'NO SYSTEM LEDGER RECORD');
  return '<li><span>'+entry+'</span><small>'+state+'</small></li>';
 }).join('');
 return '<section class="atlas-ledger-bridge"><h2>'+(ua?'СУТНОСТІ ТА ІСТОРІЯ':'ENTITIES AND HISTORY')+'</h2><p>'+(ua?'Посилання ведуть лише до сутностей із підтвердженою історією випусків. Відсутність посилання не означає відсутності реальної залежності.':'Links lead only to entities with recorded issue histories. No link does not mean that a real-world dependency is absent.')+'</p><ul>'+items+'</ul><a href="/'+lang+'/entities/">'+(ua?'ВСІ СУТНОСТІ':'ALL ENTITIES')+'</a></section>';
}
export const bridgeCSS='<style>.atlas-ledger-bridge{margin-top:40px;padding:25px 0;border-top:4px solid var(--ink,#232523)}.atlas-ledger-bridge h2{font:700 12px "IBM Plex Mono",monospace;color:var(--red,#A2362A)}.atlas-ledger-bridge p{font:15px/1.5 "IBM Plex Serif",Georgia,serif;max-width:900px}.atlas-ledger-bridge ul{list-style:none;margin:20px 0;padding:0}.atlas-ledger-bridge li{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:13px 0;border-top:1px solid var(--rule,#B8AC9B)}.atlas-ledger-bridge li small{font:11px/1.6 "IBM Plex Mono",monospace}.atlas-ledger-bridge a{color:var(--blue,#46697A);text-underline-offset:3px}@media(max-width:650px){.atlas-ledger-bridge li{grid-template-columns:1fr}}</style>';
export function addLedgerBridge(html,params){
 if(!html.includes('</main>')||!html.includes('</head>'))throw Error('Invalid study document');
 return html.replace('</head>',bridgeCSS+'</head>').replace('</main>',renderLedgerBridge(params)+'</main>');
}
