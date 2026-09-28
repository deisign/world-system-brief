// WSB POSTER renderer v0.2
// Fixed composition: the mechanism, not the interface, organizes the page.

const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const short={
 en:{"saudi-production":"SAUDI\nPRODUCTION","east-west-pipeline":"EAST–WEST\nPIPELINE","gulf-terminals":"GULF\nTERMINALS","hormuz":"HORMUZ","gulf-of-oman-sts":"OMAN\nSTS","asian-refinery":"ASIA"},
 ua:{"saudi-production":"САУДІВСЬКА\nАРАВІЯ","east-west-pipeline":"EAST–WEST\nPIPELINE","gulf-terminals":"ТЕРМІНАЛИ\nЗАТОКИ","hormuz":"ОРМУЗ","gulf-of-oman-sts":"ОМАН\nSTS","asian-refinery":"АЗІЯ"}
};
const txt=(x,y,s,cls="node",anchor="middle")=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${String(s).split("\n").map((v,i)=>`<tspan x="${x}" dy="${i?22:0}">${esc(v)}</tspan>`).join("")}</text>`;

function mechanismSvg(state,locale){
 const q=short[locale]||short.en;
 // One route, two constraints, one bypass. Geometry carries the argument.
 return `<svg viewBox="0 0 1220 690" role="img" aria-label="Bottleneck migration diagram">
 <defs><marker id="arr" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="currentColor"/></marker></defs>
 <g class="route">
   <path d="M120 105 H360" class="flow recovering"/>
   <path d="M360 105 V245 H610" class="flow"/>
   <path d="M610 245 H830" class="flow constrained"/>
   <path d="M830 245 C930 245 930 405 830 405 H690" class="flow bypass"/>
   <path d="M690 405 H1010 V565 H1130" class="flow"/>
 </g>
 <g class="nodes">
   <circle cx="120" cy="105" r="18"/><circle cx="360" cy="105" r="18"/>
   <circle cx="610" cy="245" r="18"/><circle cx="830" cy="245" r="18"/>
   <circle cx="690" cy="405" r="18"/><circle cx="1130" cy="565" r="18"/>
 </g>
 ${txt(120,65,q["saudi-production"])}${txt(360,65,q["east-west-pipeline"])}
 ${txt(610,205,q["gulf-terminals"])}${txt(830,205,q.hormuz)}
 ${txt(690,465,q["gulf-of-oman-sts"])}${txt(1130,525,q["asian-refinery"])}
 <g class="cross"><path d="M790 211 l80 68 M870 211 l-80 68"/><path d="M650 371 l80 68 M730 371 l-80 68"/></g>
 <text x="405" y="89" class="state">↗ RECOVERING</text>
 <text x="830" y="310" class="state hot">× PERSISTENT</text>
 <text x="825" y="383" class="state">↪ BYPASS</text>
 <text x="690" y="510" class="state hot">× SATURATING</text>
 </svg>`;
}

export function renderPoster(state,p,locale="en"){
 const title=locale==="ua"?"В ОБХОДУ ТЕЖ\nЗ’ЯВИЛОСЯ ВУЗЬКЕ МІСЦЕ.":"THE BYPASS HAS\nA BOTTLENECK NOW.";
 const kicker=locale==="ua"?"МІГРАЦІЯ ВУЗЬКОГО МІСЦЯ":"BOTTLENECK MIGRATION";
 const formula=locale==="ua"?"ПОТІК ВІДНОВИВСЯ.\nВУЗЬКЕ МІСЦЕ — ПЕРЕМІСТИЛОСЯ.":"THE FLOW RECOVERED.\nTHE BOTTLENECK MOVED.";
 const footer=locale==="ua"?"СВІТОВІ ДОЗВОЛЕНО МАТИ ДЕНЬ З ОДНІЄЮ СТРІЛКОЮ.":"THE WORLD IS ALLOWED TO HAVE A ONE-ARROW DAY.";
 return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{--paper:#F1ECE0;--g:#292A27;--muted:#68655E;--rule:#8B877E;--petrol:#5E837F;--oxide:#A85E4F;--brass:#8A7454}
*{box-sizing:border-box}body{margin:0;background:#D7CEBD;color:var(--g);font-family:Arial,sans-serif}.poster{width:1400px;height:2000px;margin:24px auto;background:var(--paper);padding:42px;display:grid;grid-template-rows:180px 500px 1fr 230px}.mast{border-top:10px solid var(--g);padding-top:18px}.brand{font:900 76px/.85 Arial;letter-spacing:-.06em;text-align:center}.sub{text-align:center;font:900 12px 'Courier New';letter-spacing:.24em;margin:8px}.meta{border-top:2px solid var(--g);border-bottom:2px solid var(--g);padding:10px 0;font:900 10px 'Courier New';display:flex;justify-content:space-between}.hero{padding-top:70px}.k{font:900 13px 'Courier New';letter-spacing:.16em;color:var(--muted)}.heroLine{display:grid;grid-template-columns:235px 1fr;gap:30px;align-items:start;margin-top:20px}.delta{font:900 160px/.78 Arial}.title{font:900 78px/.87 Arial;letter-spacing:-.055em;white-space:pre-line}.diagram{border-top:3px solid var(--g);border-bottom:3px solid var(--g);display:flex;align-items:center}.diagram svg{width:100%;height:760px;overflow:visible}.flow{fill:none;stroke:var(--g);stroke-width:11;marker-end:url(#arr)}.flow.recovering{stroke:var(--brass)}.flow.bypass{stroke:var(--petrol);stroke-dasharray:24 14}.nodes circle{fill:var(--paper);stroke:var(--g);stroke-width:7}.node{font:900 17px 'Courier New';fill:var(--g)}.state{font:900 15px 'Courier New';fill:var(--muted)}.state.hot{fill:var(--oxide)}.cross path{stroke:var(--oxide);stroke-width:12}.close{padding-top:50px}.formula{font:900 46px/.98 Arial;letter-spacing:-.025em;white-space:pre-line}.foot{align-self:end;border-top:3px solid var(--g);padding-top:18px;display:flex;justify-content:space-between;align-items:end}.line{font:900 26px Arial;max-width:1050px}.micro{font:9px 'Courier New';color:var(--muted)}
</style></head><body><main class="poster"><header class="mast"><div class="brand">WORLD SYSTEM BRIEF</div><div class="sub">FLOWS · BOTTLENECKS · LEVERAGE</div><div class="meta"><span>${esc(state.issue_id)} · POSTER · ${locale.toUpperCase()}</span><span>${esc(state.date)}</span><span>Δ ${state.summary.confirmed_delta}</span></div></header>
<section class="hero"><div class="k">${kicker}</div><div class="heroLine"><div class="delta">Δ ${state.summary.confirmed_delta}</div><div class="title">${title}</div></div></section>
<section class="diagram">${mechanismSvg(state,locale)}</section>
<section class="close"><div class="formula">${formula}</div></section>
<footer class="foot"><div class="line">${footer}</div><div class="micro">WSB POSTER · FIXED 1400×2000 · v0.2</div></footer></main></body></html>`;
}
