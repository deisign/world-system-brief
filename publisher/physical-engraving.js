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
 if(!editorial||editorial.subject_class!=="generic_physical_carrier")throw new Error("Missing scoped engraving editorial subject");
 for(const k of ["physical_role","mechanism","limitations","paired_thesis"])
  for(const lang of ["en","ua"])if(typeof editorial[k]?.[lang]!=="string"||!editorial[k][lang].trim())throw new Error("Missing editorial "+k+" "+lang);
 if(!Array.isArray(editorial.related_entities)||!editorial.related_entities.length||new Set(editorial.related_entities).size!==editorial.related_entities.length||editorial.related_entities.some(x=>!safeSlug(x)))throw new Error("Invalid related entities");
 if(!/^\/\{lang\}\/(?:visualizations|explainers)\/[a-z0-9-]+\/$/.test(editorial.composition_route||""))throw new Error("Invalid editorial composition route");
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
 return {entry,svgPath};
}
export function physicalEngravingPage({entry,lang="en"}){
 if(!["en","ua"].includes(lang))throw Error("Unsupported engraving language");
 const e=escapeHtml,ua=lang==="ua",editorial=entry.editorial;
 if(!editorial)throw Error("Missing editorial meaning");
 const pairing=editorial.composition_route.replace("{lang}",lang);
 return `<!doctype html><html lang="${e(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB · ${e(entry.title[lang])}</title><style>
 body{background:#F3EBDD;color:#232523;margin:0;font-family:Georgia,serif}main{max-width:1200px;margin:auto;padding:24px 34px 70px}header{border-top:8px solid #232523;padding:15px 0;font:900 clamp(32px,7vw,75px)/1 Arial,sans-serif}h1{font:900 clamp(32px,6vw,72px)/.95 Arial,sans-serif;letter-spacing:-.04em}figure{margin:30px 0;border-block:4px solid #232523;padding:20px 0}figure img{display:block;width:100%;height:auto}figcaption,p{font:18px/1.6 Georgia,serif;max-width:850px}.editorial{border-top:2px solid #232523;padding-top:20px;max-width:850px}.editorial h2{font:700 13px/1.4 monospace;letter-spacing:.04em}.editorial .boundary{border-left:3px solid #A2362A;padding-left:16px;color:#55534e}.micro{font:700 12px/1.5 monospace}a{color:#46697A}@media(max-width:650px){main{padding:16px}p{font-size:16px}}
 </style></head><body><main><header>WORLD SYSTEM BRIEF</header><p class="micro">PHYSICAL ENGRAVING / DRAW BEAUTIFUL</p><h1>${e(entry.title[lang])}</h1><figure><img src="/assets/engravings/${e(entry.id)}.svg" alt="${e(entry.alt[lang])}" loading="eager" width="960" height="660"><figcaption>${e(entry.caption[lang])}</figcaption></figure><p>${ua?"Модель схематична. Форма не є кресленням конкретного судна.":"Schematic model; this is not a blueprint of a specific vessel."}</p><section class="editorial"><h2>${ua?"ФІЗИЧНА ФОРМА ТА СИСТЕМНИЙ МЕХАНІЗМ":"PHYSICAL FORM AND SYSTEM MECHANISM"}</h2><p>${e(editorial.physical_role[lang])}</p><p>${e(editorial.mechanism[lang])}</p><p class="boundary">${e(editorial.limitations[lang])}</p><p class="micro">${ua?"АНАЛІТИЧНА КОМПОЗИЦІЯ":"ANALYTICAL COMPOSITION"}: <a href="${e(pairing)}">${e(editorial.paired_thesis[lang])}</a></p></section><p class="micro">${ua?"ДЖЕРЕЛО МОДЕЛІ":"MODEL SOURCE"}: <a href="${e(entry.model_source)}">${e(entry.model_source)}</a></p><p><a href="/${e(lang)}/explainers/hormuz/">${ua?"СИСТЕМНИЙ МЕХАНІЗМ":"SYSTEM MECHANISM"}</a></p></main></body></html>`;
}
export function publishPhysicalEngravings({root,out,write}){
 const manifestPath=path.join(root,"visualizations","engravings","manifest.json");
 if(!fs.existsSync(manifestPath))return 0;
 const entries=JSON.parse(fs.readFileSync(manifestPath,"utf8")).engravings||[];
 for(const entry of entries){const {svgPath}=verifyPhysicalEngraving(entry,root);
   write(path.join(out,"assets","engravings",entry.id+".svg"),fs.readFileSync(svgPath,"utf8"));
   for(const lang of ["en","ua"])write(path.join(out,lang,"engravings",entry.id,"index.html"),physicalEngravingPage({entry,lang}));
 }
 return entries.length;
}
