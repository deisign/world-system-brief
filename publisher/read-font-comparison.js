import {readAtlasPilot} from "./read-atlas-pilot.js";
import {atlasEscape as E} from "./atlas-primitives.js";

export const readFontVariants=Object.freeze(["plex","manrope"]);
const fonts=Object.freeze({
 plex:{
  heading:"'IBM Plex Sans',Arial,sans-serif",
  weight:700,
  stylesheet:"https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@700&family=IBM+Plex+Serif:wght@400&family=IBM+Plex+Mono:wght@400;600;700&display=swap",
  label:"IBM Plex Sans / Serif / Mono"
 },
 manrope:{
  heading:"Manrope,Arial,sans-serif",
  weight:800,
  stylesheet:"https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400&family=IBM+Plex+Mono:wght@400;600;700&family=Manrope:wght@800&display=swap",
  label:"Manrope / Plex Serif / Plex Mono"
 }
});
const ui={
 en:{title:"TYPE STUDY · READ 0038",intro:"Identical text, layout and sizes. Only the headline family and weight change.",current:"Typeface in this preview",base:"Current READ",compare:"Compare"},
 ua:{title:"ТЕСТ ШРИФТУ · READ 0038",intro:"Той самий текст, макет і розміри. Змінюються лише гарнітура та насиченість заголовка.",current:"Шрифт у цій версії",base:"Поточний READ",compare:"Порівняти"}
};
export function readFontComparison({lang="en",variant="plex",data}={}){
 if(!ui[lang]||!fonts[variant])throw Error("Unknown language or typeface");
 const font=fonts[variant],L=ui[lang];
 const opts=data?{lang,data}:{lang};
 const base=readAtlasPilot(opts);
 const stylesheet=E(font.stylesheet);
 const fontCSS=`
/* Editorial font trial: keep identical dimensions and content across variants. */
html{font-synthesis:none}
body,.lead,.read-intro p,dd,.boundary,.source-row p{font-family:'IBM Plex Serif',Georgia,serif}
.mast,h1,.delta,.ledger-id{font-family:${font.heading}}
h1{font-weight:${font.weight};font-size:clamp(34px,4.4vw,64px);letter-spacing:-.026em;line-height:1.10}
.mast{font-weight:700}
.kicker,.nav,.status,.register h2,.read-intro h2,dt,.source-meta,.source-row a,.foot,.atlas-register-heading,.type-trial{font-family:'IBM Plex Mono',monospace}
.type-trial{border-block:1px solid var(--rule);display:flex;flex-wrap:wrap;align-items:baseline;gap:12px 24px;padding:11px 0;margin:-14px 0 24px;font-size:11px;line-height:1.5}
.type-trial strong{color:var(--red)}.type-trial a{font-weight:600}
@media(max-width:600px){h1{font-size:clamp(31px,8.6vw,42px);line-height:1.1;letter-spacing:-.025em}}
`;
 const alternate=variant==="plex"?"manrope":"plex";
 const strip=`<aside class="type-trial" aria-label="${E(L.title)}"><strong>${E(L.title)}</strong><span>${E(L.current)}: ${E(font.label)}</span><a href="/${lang}/atlas/read/0038/type/${alternate}/">${E(L.compare)}: ${E(fonts[alternate].label)}</a><a href="/${lang}/atlas/read/0038/">${E(L.base)}</a></aside>`;
 const cssAnchor="</style></head>";
 const head=`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${stylesheet}">`;
 if(!base.includes(cssAnchor))throw Error("READ stylesheet anchor changed");
 let html=base.replace(cssAnchor,fontCSS+cssAnchor);
 html=html.replace("</style></head>","</style>"+head+"</head>");
 const marker='<div class="read-intro">';
 if(!html.includes(marker))throw Error("READ content anchor changed");
 html=html.replace(marker,strip+marker);
 html=html.replace(/<title>[^<]+<\/title>/,`<title>WSB / ${E(font.label)} / READ 0038</title>`);
 return html;
}
