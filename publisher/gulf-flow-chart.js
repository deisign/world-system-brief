// Real analytical SVG from issue evidence, never from a generated image.
const e=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export function readGulfFlowEvidence(records){
 const a=records.find(x=>x.id==="WSB-0040-SRC-02"),b=records.find(x=>x.id==="WSB-0040-SRC-01");
 if(!a||!b||a.publication_date!=="2026-11-03"||b.publication_date!=="2026-11-06")throw Error("Dated source records required");
 if(![a.url,b.url].every(x=>/^https:\/\/www\.reuters\.com\//.test(x)))throw Error("Trusted canonical source URLs required");
 const m=(a.claim||"").match(/crude\/condensate exports\s+([\d.]+)m b\/d\s+\((\d+)% pre-war\)\s+and products\s+([\d.]+)m b\/d\s+\(just over half normal\)/i);
 if(!m)throw Error("Missing paired flow observation and qualitative product recovery");
 const crude=Number(m[1]),share=Number(m[2]),products=Number(m[3]);
 if(!(crude>0&&products>0&&share>0&&share<=100))throw Error("Invalid report metrics");
 if(!(b.claim||"").includes("14m b/d")||!(b.claim||"").includes("3.1m b/d"))throw Error("Later reporting does not corroborate volume");
 return {crude,share,products,productsShare:null,qualifier:"just over half",sourceUrls:[a.url,b.url],sourceIds:[a.id,b.id],period:"2026-10"};
}
export function renderGulfFlowSvg(d,lang="en"){
 if(!["en","ua"].includes(lang))throw Error("Invalid locale");
 if(!d||d.productsShare!==null||d.qualifier!=="just over half"||!Number.isFinite(d.share)||d.share<=0||d.share>100)throw Error("Unverified metrics");
 const ua=lang==="ua";
 const t=ua?{
  title:"НАФТА І ПАЛЬНЕ: РІЗНА ШВИДКІСТЬ ВІДНОВЛЕННЯ",
  subtitle:"Морський експорт із Перської затоки, жовтень 2026",
  crude:"СИРА НАФТА І КОНДЕНСАТ",products:"НАФТОПРОДУКТИ",
  amount:"млн бар./добу",share:"Частка довоєнного експорту",
  exact:"Точну частку джерело не називає",qualifier:"трохи більше половини",
  method:"50% — нижня межа опису, НЕ виміряне значення",
  note:"Оцінки Vortexa, без Ірану; дані про судна можуть бути переглянуті.",
  system:"ФІЗИЧНА ЛОГІКА — НЕ ВИМІРЯНИЙ ПОТІК",
  steps:["СИРА НАФТА","ПЕРЕРОБЛЕННЯ","ПАЛЬНЕ","РОЗПОДІЛ"],
  footer:"Оцінки Vortexa за Reuters, 3 та 6 листопада 2026"
 }:{
  title:"CRUDE AND FUEL: UNEQUAL RECOVERY",
  subtitle:"Persian Gulf seaborne exports, October 2026",
  crude:"CRUDE AND CONDENSATE",products:"REFINED PRODUCTS",
  amount:"million bbl/day",share:"Share of pre-war exports",
  exact:"Exact recovery percentage not reported",qualifier:"just over half",
  method:"50% is a descriptive floor, NOT a measured value",
  note:"Vortexa estimates, Iran excluded; vessel tracking may be revised.",
  system:"PHYSICAL LOGIC — NOT A MEASURED FLOW",
  steps:["CRUDE","REFINING","FUEL","DISTRIBUTION"],
  footer:"Vortexa estimates via Reuters, 3 and 6 November 2026"
 };
 const paper="#F3EBDD",ink="#232523",blue="#46697A",red="#A2362A",rule="#C0B6A7";
 const px=n=>60+8*n;
 const fmt=n=>new Intl.NumberFormat(ua?"uk-UA":"en-US",{minimumFractionDigits:1,maximumFractionDigits:1}).format(n);
 const parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 660" role="img" aria-labelledby="g-title g-desc">',
 '<title id="g-title">'+e(t.title)+'</title>',
 '<desc id="g-desc">'+e(t.subtitle)+'. '+e(t.crude)+': '+d.share+'%, '+fmt(d.crude)+' '+e(t.amount)+'. '+e(t.products)+': '+e(t.qualifier)+', '+fmt(d.products)+' '+e(t.amount)+'. '+e(t.exact)+'.</desc>',
 '<rect width="960" height="660" fill="'+paper+'"/>',
 '<path d="M55 25H905" stroke="'+ink+'" stroke-width="7"/>',
 '<text x="55" y="64" font-family="IBM Plex Mono,monospace" font-size="15" font-weight="700" fill="'+blue+'">WSB-0040 · 2026-11-06 · SOURCE-BOUND DIAGRAM</text>',
 '<text x="55" y="110" font-family="Manrope,Arial,sans-serif" font-size="'+(ua?24:30)+'" font-weight="800" fill="'+ink+'">'+e(t.title)+'</text>',
 '<text x="55" y="143" font-family="IBM Plex Serif,Georgia,serif" font-size="18" fill="'+ink+'">'+e(t.subtitle)+'</text>',
 '<path d="M55 166H905" stroke="'+rule+'"/>',
 '<text x="60" y="195" font-family="IBM Plex Mono,monospace" font-size="14" fill="'+blue+'">'+e(t.share)+' (0–100%)</text>'];
 for(const v of [0,25,50,75,100])parts.push('<line x1="'+px(v)+'" x2="'+px(v)+'" y1="209" y2="401" stroke="'+rule+'" stroke-dasharray="'+(v===0||v===100?'0':'3 5')+'"/><text x="'+px(v)+'" y="423" text-anchor="middle" font-size="12" font-family="IBM Plex Mono,monospace" fill="'+ink+'">'+v+'%</text>');
 parts.push('<text x="60" y="240" font-family="IBM Plex Mono,monospace" font-weight="700" font-size="17" fill="'+ink+'">'+e(t.crude)+'</text>',
 '<rect x="60" y="254" width="800" height="47" fill="#DED6C8"/>',
 '<rect x="60" y="254" width="'+(8*d.share)+'" height="47" fill="'+blue+'"/>',
 '<text x="75" y="286" font-family="Manrope,Arial,sans-serif" font-weight="800" font-size="27" fill="'+paper+'">'+d.share+'%</text>',
 '<text x="60" y="324" font-family="IBM Plex Serif,Georgia,serif" font-size="16" fill="'+ink+'">'+fmt(d.crude)+' '+e(t.amount)+'</text>',
 '<text x="60" y="357" font-family="IBM Plex Mono,monospace" font-weight="700" font-size="17" fill="'+ink+'">'+e(t.products)+'</text>',
 '<rect x="60" y="370" width="800" height="46" fill="#DED6C8"/>',
 '<rect x="60" y="370" width="400" height="46" fill="'+red+'"/>',
 '<path d="M460 365V420" stroke="'+red+'" stroke-width="3" stroke-dasharray="5 4"/>',
 '<path d="M468 393h24m-7 -6 7 6-7 6" fill="none" stroke="'+red+'" stroke-width="2"/>',
 '<text x="75" y="400" font-family="Manrope,Arial,sans-serif" font-size="26" font-weight="800" fill="'+paper+'">&gt;50%</text>',
 '<text x="510" y="399" font-family="IBM Plex Serif,Georgia,serif" font-size="17" fill="'+ink+'">'+e(t.qualifier)+'</text>',
 '<text x="60" y="448" font-family="IBM Plex Serif,Georgia,serif" font-size="15" fill="'+ink+'">'+fmt(d.products)+' '+e(t.amount)+' · '+e(t.exact)+'</text>',
 '<path d="M55 473H905" stroke="'+ink+'" stroke-width="2"/>',
 '<text x="55" y="501" font-family="IBM Plex Mono,monospace" font-size="14" font-weight="700" fill="'+blue+'">'+e(t.system)+'</text>');
 t.steps.forEach((v,i)=>{const x=56+i*216;parts.push('<rect x="'+x+'" y="515" width="182" height="43" fill="'+((i===1||i===2)?"#C4D1D6":"#E4DCCF")+'"/><text x="'+(x+91)+'" y="541" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="'+(ua?12:13)+'" font-weight="700" fill="'+ink+'">'+e(v)+'</text>');if(i<3)parts.push('<path d="M'+(x+187)+' 536h20m-7 -6 7 6-7 6" fill="none" stroke="'+ink+'" stroke-width="2"/>')});
 parts.push('<text x="55" y="588" font-family="IBM Plex Serif,Georgia,serif" font-size="15" fill="'+ink+'">'+e(t.method)+'</text>',
 '<text x="55" y="613" font-family="IBM Plex Serif,Georgia,serif" font-size="14" fill="'+ink+'">'+e(t.note)+'</text>',
 '<path d="M55 626H905" stroke="'+rule+'"/>',
 '<text x="55" y="647" font-family="IBM Plex Mono,monospace" font-size="12" fill="'+blue+'">'+e(t.footer)+' · '+d.sourceIds.join(", ")+'</text>',
 '</svg>');
 return parts.join("");
}
export function gulfFlowDiagramPage(d,lang="en"){
 const ua=lang==="ua", svg=renderGulfFlowSvg(d,lang);
 const heading=ua?"Відновлення сирої нафти й нафтопродуктів":"Crude and refined-product recovery";
 const links=d.sourceUrls.map((u,i)=>'<li><a rel="noopener noreferrer" href="'+e(u)+'">Reuters · '+(i===0?'2026-11-03':'2026-11-06')+'</a></li>').join("");
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB · '+e(heading)+'</title><style>body{background:#F3EBDD;color:#232523;margin:0}main{max-width:1130px;margin:auto;padding:24px clamp(12px,4vw,40px);font:17px/1.55 Georgia,serif}figure{margin:0}figure svg{display:block;width:100%;height:auto}a{color:#46697A}a:focus-visible{outline:3px solid #A2362A;outline-offset:3px}h1{font:800 clamp(24px,4vw,38px) Arial,sans-serif}</style></head><body><main><p><a href="/'+lang+'/brief/2026-11-06/">WSB-0040 / READ</a> · <a href="/'+(ua?'en':'ua')+'/visualizations/0040/">'+(ua?'EN':'UA')+'</a></p><h1>'+e(heading)+'</h1><figure>'+svg+'</figure><p>'+(ua?'Точна частка для нафтопродуктів не наведена; графік не видає умовну половину за виміряне значення.':'The exact product recovery percentage is not supplied; the graphic does not present the descriptive 50% bound as an exact observation.')+'</p><h2>'+(ua?'Джерела':'Sources')+'</h2><ul>'+links+'</ul></main></body></html>';
}
