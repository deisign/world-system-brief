import fs from "node:fs";
import path from "node:path";

const escapeHtml=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeSlug=x=>typeof x==="string"&&/^[a-z0-9][a-z0-9-]{1,70}$/.test(x);
export function verifyPhysicalEngraving(entry,root){
 if(!entry||!safeSlug(entry.id))throw new Error("Engraving requires safe id");
 if(!["reviewed"].includes(entry.review_status))throw new Error("Engraving not visually reviewed");
 if(!/^https:\/\//.test(entry.model_source||""))throw new Error("Missing model source");
 if(!/^[0-9a-f]{40}$/.test(entry.engine_revision||""))throw new Error("Pin Draw Beautiful revision");
 for(const lang of ["en","ua"]){if(!entry.title?.[lang]||!entry.caption?.[lang]||!entry.alt?.[lang])throw new Error("Missing "+lang+" editorial copy");}
 const editorial=entry.editorial;
 if(!editorial||!["generic_physical_carrier","generic_processing_cascade"].includes(editorial.subject_class))throw new Error("Missing scoped engraving editorial subject");
 for(const k of ["physical_role","mechanism","limitations","paired_thesis"])
  for(const lang of ["en","ua"])if(typeof editorial[k]?.[lang]!=="string"||!editorial[k][lang].trim())throw new Error("Missing editorial "+k+" "+lang);
 if(!Array.isArray(editorial.related_entities)||!editorial.related_entities.length||new Set(editorial.related_entities).size!==editorial.related_entities.length||editorial.related_entities.some(x=>!safeSlug(x)))throw new Error("Invalid related entities");
 if(!/^\/\{lang\}\/(?:visualizations|explainers|ledger\/dependencies)\/[a-z0-9-]+\/$/.test(editorial.composition_route||""))throw new Error("Invalid editorial composition route");
 const canonical=path.join(root,"knowledge","entities.json");
 if(fs.existsSync(canonical)){
  const known=new Set(JSON.parse(fs.readFileSync(canonical,"utf8")).entities.map(x=>x.slug));
  for(const id of editorial.related_entities)if(!known.has(id))throw new Error("Unregistered editorial entity "+id);
 }
 if(!entry.qa?.desktop||!entry.qa?.mobile||!entry.qa?.reduced_motion||!entry.qa?.closeup)throw new Error("Render QA incomplete");
 const dir=path.join(root,"visualizations","engravings",entry.id);
 const svgPath=path.join(dir,"plate.svg");
 if(!fs.existsSync(svgPath))throw new Error("Reviewed engraving SVG missing");
 const svg=fs.readFileSync(svgPath,"utf8");
 if(!/<svg\s[\s\S]*?<\/svg>/i.test(svg)||!/<path\b/i.test(svg))throw new Error("Invalid vector engraving");
 if(/<script\b|<foreignObject\b|\son\w+\s*=|\b(?:href|xlink:href)\s*=\s*["'](?:https?:|data:|javascript:)/i.test(svg))throw new Error("Unsafe or externally loaded SVG");
 if(svg.length>5_000_000)throw new Error("SVG exceeds review budget");
 let mobilePath=null;
 if(entry.mobile_plate!==undefined){
  if(entry.mobile_plate!=="plate-mobile.svg")throw new Error("Invalid mobile SVG filename");
  mobilePath=path.join(dir,entry.mobile_plate);
  if(!fs.existsSync(mobilePath))throw new Error("Reviewed mobile engraving SVG missing");
  const mobile=fs.readFileSync(mobilePath,"utf8");
  if(!/<svg\s[\s\S]*?<\/svg>/i.test(mobile)||!/<path\b/i.test(mobile))throw new Error("Invalid mobile vector engraving");
  if(/<script\b|<foreignObject\b|\son\w+\s*=|\b(?:href|xlink:href)\s*=\s*["'](?:https?:|data:|javascript:)/i.test(mobile))throw new Error("Unsafe or externally loaded mobile SVG");
  if(mobile.length>5_000_000)throw new Error("Mobile SVG exceeds review budget");
  if(!Number.isInteger(entry.svg_dimensions?.width)||!Number.isInteger(entry.svg_dimensions?.height)||entry.svg_dimensions.width<100||entry.svg_dimensions.height<100)throw new Error("Mobile SVG requires accurate dimensions");
 }
 return {entry,svgPath,mobilePath};
}
export function physicalEngravingPage({entry,lang="en"}){
 if(!["en","ua"].includes(lang))throw Error("Unsupported engraving language");
 const e=escapeHtml,ua=lang==="ua",editorial=entry.editorial;
 if(!editorial)throw Error("Missing editorial meaning");
 const pairing=editorial.composition_route.replace("{lang}",lang);
 const dimensions=entry.svg_dimensions||{width:960,height:660};
 const imagePath="/assets/engravings/"+e(entry.id)+".svg";
 const picture=entry.mobile_plate?`<picture><source media="(max-width: 650px)" srcset="/assets/engravings/${e(entry.id)}-mobile.svg"><img src="${imagePath}" alt="${e(entry.alt[lang])}" loading="eager" width="${dimensions.width}" height="${dimensions.height}"></picture>`:`<img src="${imagePath}" alt="${e(entry.alt[lang])}" loading="eager" width="${dimensions.width}" height="${dimensions.height}">`;
 const contextNote=editorial.subject_class==="generic_physical_carrier"?(ua?"Модель схематична. Форма не є кресленням конкретного судна.":"Schematic model; this is not a blueprint of a specific vessel."):(ua?"Модель умовна: це не креслення промислового обладнання та не підтверджена технологічна схема.":"Schematic physical study, not a certified equipment design or operating flow diagram.");
 const relatedRoute=entry.mobile_plate?pairing:"/"+lang+"/explainers/hormuz/";
 return `<!doctype html><html lang="${e(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB · ${e(entry.title[lang])}</title><style>
 body{background:#F3EBDD;color:#232523;margin:0;font-family:Georgia,serif}main{max-width:1200px;margin:auto;padding:24px 34px 70px}header{border-top:8px solid #232523;padding:15px 0;font:900 clamp(32px,7vw,75px)/1 Arial,sans-serif}h1{font:900 clamp(32px,6vw,72px)/.95 Arial,sans-serif;letter-spacing:-.04em}figure{margin:30px 0;border-block:4px solid #232523;padding:20px 0}figure img{display:block;width:100%;height:auto}figcaption,p{font:18px/1.6 Georgia,serif;max-width:850px}.editorial{border-top:2px solid #232523;padding-top:20px;max-width:850px}.editorial h2{font:700 13px/1.4 monospace;letter-spacing:.04em}.editorial .boundary{border-left:3px solid #A2362A;padding-left:16px;color:#55534e}.micro{font:700 12px/1.5 monospace}a{color:#46697A}@media(max-width:650px){main{padding:16px}p{font-size:16px}}
 </style></head><body><main><header>WORLD SYSTEM BRIEF</header><p class="micro">PHYSICAL ENGRAVING / DRAW BEAUTIFUL</p><h1>${e(entry.title[lang])}</h1><figure>${picture}<figcaption>${e(entry.caption[lang])}</figcaption></figure><p>${e(contextNote)}</p><section class="editorial"><h2>${ua?"ФІЗИЧНА ФОРМА ТА СИСТЕМНИЙ МЕХАНІЗМ":"PHYSICAL FORM AND SYSTEM MECHANISM"}</h2><p>${e(editorial.physical_role[lang])}</p><p>${e(editorial.mechanism[lang])}</p><p class="boundary">${e(editorial.limitations[lang])}</p><p class="micro">${ua?"АНАЛІТИЧНА КОМПОЗИЦІЯ":"ANALYTICAL COMPOSITION"}: <a href="${e(pairing)}">${e(editorial.paired_thesis[lang])}</a></p></section><p class="micro">${ua?"ДЖЕРЕЛО МОДЕЛІ":"MODEL SOURCE"}: <a href="${e(entry.model_source)}">${e(entry.model_source)}</a></p><p><a href="${e(relatedRoute)}">${ua?"СИСТЕМНИЙ МЕХАНІЗМ ТА ДЖЕРЕЛА":"SYSTEM MECHANISM AND SOURCES"}</a></p><p class="micro"><a href="/${e(lang)}/engravings/">${ua?"АТЛАС ГРАВЮР":"ENGRAVING ATLAS"}</a></p></main></body></html>`;
}
export function publishPhysicalEngravings({root,out,write}){
 const manifestPath=path.join(root,"visualizations","engravings","manifest.json");
 if(!fs.existsSync(manifestPath))return 0;
 const entries=JSON.parse(fs.readFileSync(manifestPath,"utf8")).engravings||[];
 for(const entry of entries){const {svgPath,mobilePath}=verifyPhysicalEngraving(entry,root);
   write(path.join(out,"assets","engravings",entry.id+".svg"),fs.readFileSync(svgPath,"utf8"));
   if(mobilePath)write(path.join(out,"assets","engravings",entry.id+"-mobile.svg"),fs.readFileSync(mobilePath,"utf8"));
   for(const lang of ["en","ua"])write(path.join(out,lang,"engravings",entry.id,"index.html"),physicalEngravingPage({entry,lang}));
 }
 for(const lang of ["en","ua"]){
  const ua=lang==="ua";
  const cards=entries.map(entry=>`<article><a href="/${lang}/engravings/${escapeHtml(entry.id)}/"><picture>${entry.mobile_plate?`<source media="(max-width: 650px)" srcset="/assets/engravings/${escapeHtml(entry.id)}-mobile.svg">`:""}<img loading="lazy" src="/assets/engravings/${escapeHtml(entry.id)}.svg" alt="${escapeHtml(entry.alt[lang])}"></picture><h2>${escapeHtml(entry.title[lang])}</h2></a><p>${escapeHtml(entry.editorial.physical_role[lang])}</p></article>`).join("");
  const html=`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB · ${ua?"Атлас гравюр":"Engraving Atlas"}</title><style>body{margin:0;background:#F3EBDD;color:#232523}main{max-width:1100px;margin:auto;padding:25px 28px;font-family:Georgia,serif}header{font:800 clamp(26px,5vw,52px) Arial,sans-serif;border-top:7px solid;padding:15px 0;border-bottom:2px solid}h1{font:800 clamp(27px,5vw,52px) Arial,sans-serif}a{color:inherit}a:focus-visible{outline:3px solid #46697A;outline-offset:4px}.items{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:34px}article{border-top:3px solid;padding-top:20px}article img{width:100%;height:auto;display:block}article h2{font:700 23px Arial,sans-serif}p{line-height:1.6}</style></head><body><main><header>WORLD SYSTEM BRIEF</header><p><a href="/${lang}/">${ua?"ГОЛОВНА":"HOME"}</a> · <a href="/${lang==="en"?"ua":"en"}/engravings/">${lang==="en"?"UA":"EN"}</a></p><h1>${ua?"Атлас фізичних гравюр":"Physical Engraving Atlas"}</h1><p>${ua?"Авторські відтворювані векторні гравюри матеріальних компонентів світової системи. Образ не є доказом системних тверджень.":"Reproducible vector engravings of material components of the world system. The image itself is not evidence of systemic claims."}</p><div class="items">${cards}</div></main></body></html>`;
  write(path.join(out,lang,"engravings","index.html"),html);
 }
 return entries.length;
}
