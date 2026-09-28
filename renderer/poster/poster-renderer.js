// WSB POSTER renderer v0.1
// Fixed composition. Same issue state; different job from SYSTEM.

const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const mark=e=>e.status==="adaptation"?"↪":e.constraint==="material"?"×":e.constraint==="partial"?"↗":"→";

export function renderPoster(state,p,locale="en"){
 const L=id=>p.labels?.[id]||id;
 const title=locale==="ua"?"В ОБХОДУ ТЕЖ З’ЯВИЛОСЯ ВУЗЬКЕ МІСЦЕ.":"THE BYPASS HAS A BOTTLENECK NOW.";
 const kicker=locale==="ua"?"МІГРАЦІЯ ВУЗЬКОГО МІСЦЯ":"BOTTLENECK MIGRATION";
 const footer=locale==="ua"?"СВІТОВІ ДОЗВОЛЕНО МАТИ ДЕНЬ З ОДНІЄЮ СТРІЛКОЮ.":"THE WORLD IS ALLOWED TO HAVE A ONE-ARROW DAY.";
 const seq=state.dominant_mechanism.sequence,edges=state.dominant_mechanism.edges||[];
 const flow=seq.map((id,i)=>`<div class="n">${esc(L(id))}</div>${i<edges.length?`<div class="e">${mark(edges[i])}${edges[i].constraint&&edges[i].constraint!=="partial"?" ×":""}</div>`:""}`).join("");
 return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
:root{--paper:#F1ECE0;--g:#292A27;--muted:#68655E;--rule:#8B877E;--brass:#E2DACB;--petrol:#CFDFDC}
*{box-sizing:border-box}body{margin:0;background:#D7CEBD;font-family:Arial,sans-serif;color:var(--g)}.poster{width:1400px;height:2000px;margin:24px auto;background:var(--paper);padding:42px;display:grid;grid-template-rows:auto 1fr auto}.mast{border-top:10px solid var(--g);padding-top:18px}.brand{font:900 76px/.85 Arial;letter-spacing:-.06em;text-align:center}.sub{text-align:center;font:900 12px 'Courier New';letter-spacing:.24em;margin:8px}.meta{border-top:2px solid var(--g);border-bottom:2px solid var(--g);padding:10px 0;font:900 10px 'Courier New';display:flex;justify-content:space-between}.main{display:flex;flex-direction:column;justify-content:center}.k{font:900 12px 'Courier New';letter-spacing:.14em;color:var(--muted)}.delta{font:900 150px/.8 Arial;margin:28px 0 12px}.title{font:900 72px/.88 Arial;letter-spacing:-.055em;max-width:1180px}.flow{display:flex;align-items:center;margin:90px 0 45px}.n{flex:1;min-height:96px;border:4px solid var(--g);display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;background:var(--brass);font:900 11px 'Courier New'}.n:nth-of-type(n+4){background:var(--petrol)}.e{width:62px;text-align:center;font:900 31px Arial}.assessment{border-top:2px solid var(--g);border-bottom:2px solid var(--g);padding:20px 0;font:900 26px/1.15 Arial}.foot{border-top:3px solid var(--g);padding-top:18px;display:flex;justify-content:space-between;align-items:end}.line{font:900 27px Arial}.micro{font:9px 'Courier New';color:var(--muted)}
</style></head><body><main class="poster"><header class="mast"><div class="brand">WORLD SYSTEM BRIEF</div><div class="sub">FLOWS · BOTTLENECKS · LEVERAGE</div><div class="meta"><span>${esc(state.issue_id)} · POSTER · ${locale.toUpperCase()}</span><span>${esc(state.date)}</span><span>Δ ${state.summary.confirmed_delta}</span></div></header><section class="main"><div class="k">${kicker}</div><div class="delta">Δ ${state.summary.confirmed_delta}</div><div class="title">${title}</div><div class="flow">${flow}</div><div class="assessment">${esc(p.assessments?.[state.dominant_mechanism.assessment]||"")}</div></section><footer class="foot"><div class="line">${footer}</div><div class="micro">WSB POSTER · FIXED 1400×2000</div></footer></main></body></html>`;
}
