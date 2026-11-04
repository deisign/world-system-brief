import {systemEngravingV31} from "./system-engraving-v31.js";
import {HORMUZ} from "./system-mechanism.js";

const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const HORMUZ_DEPENDENCIES={
  source:HORMUZ.source,
  baseline:"2026-02",
  flow:{value:"~20",units:"mb/d",basis:"2025 transit of crude oil AND petroleum products",source:"https://www.iea.org/about/oil-safety-and-emergency-response/strait-of-hormuz"},
  spare:{min:3.5,max:5.5,units:"mb/d",basis:"Feb 2026 estimate of available crude-oil bypass pipeline capacity",source:"https://www.iea.org/about/oil-safety-and-emergency-response/strait-of-hormuz"},
  routes:[
    {id:"hormuz",kind:"maritime",basis:"2025 crude + products transit",constraint:"shipping access, security, insurance"},
    {id:"east-west",kind:"pipeline",basis:"Saudi Abqaiq–Yanbu, Red Sea exit",constraint:"terminal capacity and operational availability; Sept 2026 outage and restart",source:"https://www.reuters.com/business/energy/aramco-posts-345-rise-third-quarter-profit-2026-11-03/"},
    {id:"habshan-fujairah",kind:"pipeline",basis:"UAE Habshan–Fujairah crude pipeline",constraint:"already-used capacity; up to 0.7 mb/d additional estimated Feb 2026"}
  ]
};
const text={
 en:{
 title:"Hormuz / limits of substitution",intro:"A tanker crosses a contested maritime corridor. Saudi and Emirati pipelines avoid the strait, but they carry different crude streams and have their own terminal, capacity and security constraints.",
 header:"02 / DEPENDENCY AND ALTERNATIVES",
 main:"MARITIME DEPENDENCY",maritime:"STRAIT OF HORMUZ",maritimeMetric:"~20 mb/d",maritimeUnit:"CRUDE + PRODUCTS / 2025 BASELINE",
 alt:"PARTIAL OIL BYPASS",east:"EAST–WEST / SAUDI ARABIA",eastDetail:"Abqaiq → Yanbu / Red Sea. Operational disruptions and terminal capacity limit what can be redirected.",uae:"HABSHAN–FUJAIRAH / UAE",uaeDetail:"Crude route to Gulf of Oman; some capacity already occupied by existing exports.",
 capacity:"3.5–5.5 mb/d",capacityLabel:"ESTIMATED AVAILABLE CRUDE BYPASS · FEB 2026",
 warning:"NOT A LIKE-FOR-LIKE COMPARISON",warningText:"Hormuz traffic includes crude AND petroleum products. Bypass availability refers to crude-pipeline capacity; the dates and commodity coverage differ. The figures must not be divided into a replacement percentage.",
 conclusion:"03 / WHAT CHANGES",conclusionText:"The pipelines can redirect some exports away from the strait, concentrating new dependencies on inland pipeline integrity, Yanbu and Fujairah terminals, and onward shipping. Substitution is constrained, conditional and time-dependent.",
 history:"2026 OPERATING CONDITION",historyText:"The Saudi East–West route suffered a September interruption and subsequently resumed; the post-restart level is not inferred from February spare-capacity estimates.",
 source:"SOURCES / MEASUREMENT BASIS",basis:"IEA · February 2026 baseline",report:"Reuters · Aramco Q3 report, 3 November 2026",prev:"PREVIOUS COMPOSITION",reportNote:"Conceptual editorial illustration: neither the line lengths nor widths are proportional to actual capacity."
 },
 ua:{
 title:"Ормуз / межі заміщення",intro:"Танкер проходить спірним морським коридором. Саудівський та еміратський нафтопроводи оминають протоку, але мають власні обмеження — від терміналів і пропускної здатності до безпеки.",
 header:"02 / ЗАЛЕЖНІСТЬ ТА АЛЬТЕРНАТИВИ",
 main:"ЗАЛЕЖНІСТЬ ВІД МОРСЬКОГО ШЛЯХУ",maritime:"ОРМУЗЬКА ПРОТОКА",maritimeMetric:"~20 млн",maritimeUnit:"БАРЕЛІВ НА ДОБУ · НАФТА І НАФТОПРОДУКТИ · 2025",
 alt:"ЧАСТКОВИЙ ОБХІД ДЛЯ НАФТИ",east:"EAST–WEST / САУДІВСЬКА АРАВІЯ",eastDetail:"Абкайк → Янбу / Червоне море. Перебої роботи й можливості термінала обмежують перенаправлення експорту.",uae:"ХАБШАН — ФУДЖЕЙРА / ОАЕ",uaeDetail:"Маршрут до Оманської затоки; частину потужності вже використовують для поточного експорту.",
 capacity:"3,5–5,5 млн",capacityLabel:"БАРЕЛІВ НА ДОБУ · ОЦІНКА ДОСТУПНОЇ ПОТУЖНОСТІ ДЛЯ СИРОЇ НАФТИ · ЛЮТИЙ 2026",
 warning:"ПОКАЗНИКИ НЕ Є ОДНОРІДНИМИ",warningText:"Транзит через Ормуз включає сиру нафту ТА нафтопродукти. Оцінка обходу стосується потужності нафтопроводів для сирої нафти; дати й склад потоків різняться. Обчислювати частку повного заміщення з цих чисел не можна.",
 conclusion:"03 / ЩО ЗМІНЮЄТЬСЯ",conclusionText:"Трубопроводи дозволяють відвести частину експорту від протоки, але створюють залежності від цілісності наземної інфраструктури, терміналів Янбу й Фуджейри та подальших морських перевезень. Заміщення обмежене й залежить від умов та часу.",
 history:"УМОВИ РОБОТИ У 2026 РОЦІ",historyText:"Маршрут East–West призупинявся у вересні й згодом відновив роботу; його фактичну потужність після запуску не можна вивести з лютневої оцінки резерву.",
 source:"ДЖЕРЕЛА / ОСНОВА ВИМІРЮВАНЬ",basis:"МЕА · оцінка на лютий 2026 року",report:"Reuters · звіт Aramco за третій квартал, 3 листопада 2026",prev:"ПОПЕРЕДНЯ КОМПОЗИЦІЯ",reportNote:"Редакційна схема: довжина й товщина ліній не відповідають фактичній пропускній здатності."
 }
};
export function systemEngravingV32({lang="en",model=HORMUZ_DEPENDENCIES,engravingId="tanker-study-01"}={}){
 if(!text[lang])throw Error("Unsupported language");
 if(!/^[a-z0-9][a-z0-9-]{1,70}$/.test(engravingId))throw Error("Unsafe engraving id");
 if(model?.routes?.map(r=>r.id).join("|")!=="hormuz|east-west|habshan-fujairah"||!/^https:\/\//.test(model.source??""))throw Error("Expected sourced route set");
 if(!Number.isFinite(model.spare?.min)||!Number.isFinite(model.spare?.max)||model.spare.max<model.spare.min||!model.flow?.source||!model.spare?.source)throw Error("Incomplete measurement provenance");
 const L=text[lang],E=esc,root="/"+lang;
 const sea=model.routes[0],saudi=model.routes[1],emirates=model.routes[2];
 const diagram=`<div class="dependency-plate">
 <div class="evidence-header"><span>${E(L.main)}</span><span>${E(L.maritimeMetric)} <small>${E(L.maritimeUnit)}</small></span></div>
 <div class="sea-route"><span class="serial">01</span><div><strong>${E(L.maritime)}</strong><p>${E(sea.constraint)}</p></div><div class="route-line sea-line" aria-hidden="true"></div></div>
 <div class="bypass-header"><span>${E(L.alt)}</span><strong>${E(L.capacity)} <small>${E(L.capacityLabel)}</small></strong></div>
 <div class="pipe-route"><span class="serial">02</span><div><strong>${E(L.east)}</strong><p>${E(L.eastDetail)}</p></div><div class="route-line pipe-line" aria-hidden="true"></div></div>
 <div class="pipe-route"><span class="serial">03</span><div><strong>${E(L.uae)}</strong><p>${E(L.uaeDetail)}</p></div><div class="route-line pipe-line" aria-hidden="true"></div></div>
 <div class="measure-note"><strong>${E(L.warning)}</strong><p>${E(L.warningText)}</p></div></div>`;
 let html=systemEngravingV31({lang,engravingId});
 const view=/<div class="viewport">[\s\S]*?<\/div><figcaption>[\s\S]*?<\/figcaption>/;
 if(!view.test(html))throw Error("V3.1 markup changed: route viewport");
 html=html.replace(view,diagram+`<figcaption>${E(L.reportNote)}</figcaption>`);
 const summary=/<section class="analysis">[\s\S]*?<\/section>/;
 if(!summary.test(html))throw Error("V3.1 markup changed: analysis section");
 html=html.replace(summary,`<section class="analysis"><div><h2>${E(L.conclusion)}</h2><div class="markers"><span>${E(L.history)}</span></div><p class="op-note">${E(L.historyText)}</p></div><p>${E(L.conclusionText)}</p></section>`);
 html=html.replace(/<h1>[^<]*<\/h1>/,`<h1>${E(L.title)}</h1>`);
 html=html.replace(/<p class="dek">[\s\S]*?<\/p>/,`<p class="dek">${E(L.intro)}</p>`);
 html=html.replace(/<title>[^<]*<\/title>/,`<title>WSB · ${E(L.title)}</title>`);
 html=html.replace('SYSTEM ENGRAVING 03.1','SYSTEM ENGRAVING 03.2');
 html=html.replace(/href="\/(en|ua)\/visualizations\/chokepoint-bypass-v31\//g,'href="/$1/visualizations/chokepoint-bypass-v32/');
 html=html.replace(/<footer>[\s\S]*?<\/footer>/,`<footer><h2>${E(L.source)}</h2><p><a href="${E(model.flow.source)}">${E(L.basis)}</a> · <a href="${E(saudi.source)}">${E(L.report)}</a> · <a href="https://github.com/bumicodes/draw-beautiful">Draw Beautiful</a></p><p class="limitations">${E(L.reportNote)} ${E(L.warningText)}</p></footer>`);
 html=html.replace("</style>",`
 .dependency-plate{font-family:Arial,sans-serif;border-top:1px solid var(--ink)}
 .evidence-header,.bypass-header{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:13px 0 12px;border-bottom:1px solid var(--rule);font:800 11px/1.4 monospace;letter-spacing:.05em}
 .evidence-header>span:last-child,.bypass-header strong{font:900 22px/1 Arial,sans-serif;white-space:nowrap}
 .evidence-header small,.bypass-header small{display:block;margin-top:5px;font:600 10px/1.4 monospace;white-space:normal;text-align:right;max-width:230px}
 .bypass-header{margin-top:20px;color:var(--blue)}
 .sea-route,.pipe-route{display:grid;grid-template-columns:35px 1fr;gap:8px 14px;padding:15px 0 17px}
 .serial{font:900 24px/1 Arial,sans-serif}
 .sea-route strong,.pipe-route strong{font:800 16px/1.2 Arial,sans-serif}
 .sea-route strong{color:var(--red)}.pipe-route strong{color:var(--blue)}
 .sea-route p,.pipe-route p{font:13px/1.4 Georgia,serif;margin:7px 0 0;max-width:510px}
 .route-line{grid-column:2;position:relative;height:2px;background:var(--blue);margin:5px 12px 0 0}
 .sea-line{height:4px;background:var(--red)}
 .route-line:after{content:"";position:absolute;right:-10px;top:-4px;border-left:10px solid var(--blue);border-top:5px solid transparent;border-bottom:5px solid transparent}
 .sea-line:after{border-left-color:var(--red);top:-3px}
 .measure-note{border-top:1px solid var(--ink);padding:16px 0 0;margin-top:12px}
 .measure-note strong{color:var(--red);font:800 12px monospace}
 .measure-note p{font:14px/1.5 Georgia,serif;margin:8px 0}
 .op-note{font:13px/1.5 Georgia,serif!important;margin-top:8px!important}
 @media(max-width:600px){.evidence-header,.bypass-header{flex-direction:column;align-items:flex-start}.evidence-header small,.bypass-header small{text-align:left}.routes .viewport{overflow:visible}.routes svg{min-width:0}}
 </style>`);
 return html;
}
