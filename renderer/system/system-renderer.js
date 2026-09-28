// WSB SYSTEM renderer v0.1
// One analytical state + one locale payload -> one self-contained SYSTEM HTML.

export const STRINGS = {
  en: {
    systemDelta:"SYSTEM DELTA", map:"SYSTEM MAP · DOMINANT MECHANISM", watch:"BOTTLENECK WATCH",
    ledger:"SYSTEM LEDGER", entering:"ENTERING STATE", current:"CURRENT STATE", status:"STATUS",
    issue:"ISSUE", activity:"SYSTEM ACTIVITY", pressure:"NEWS PRESSURE",
    headline:"THE BYPASS HAS A BOTTLENECK NOW.",
    deck:"Flow recovery does not mean restored substitutability. The original constraint persists while the adaptation route approaches a constraint of its own.",
    mechanism:"BOTTLENECK MIGRATION",
    footer:"THE WORLD IS ALLOWED TO HAVE A ONE-ARROW DAY."
  },
  ua: {
    systemDelta:"SYSTEM DELTA", map:"SYSTEM MAP · DOMINANT MECHANISM", watch:"BOTTLENECK WATCH",
    ledger:"SYSTEM LEDGER", entering:"ПОПЕРЕДНІЙ СТАН", current:"ПОТОЧНИЙ СТАН", status:"СТАТУС",
    issue:"ВИПУСК", activity:"SYSTEM ACTIVITY", pressure:"NEWS PRESSURE",
    headline:"В ОБХОДУ ТЕЖ З’ЯВИЛОСЯ ВУЗЬКЕ МІСЦЕ.",
    deck:"Відновлення потоку не означає відновленої замінності. Первинне обмеження зберігається, а маршрут обходу сам наближається до межі.",
    mechanism:"МІГРАЦІЯ BOTTLENECK",
    footer:"СВІТОВІ ДОЗВОЛЕНО МАТИ ДЕНЬ З ОДНІЄЮ СТРІЛКОЮ."
  }
};

const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const mark=o=>o.change==="up"?"↑":o.change==="strengthening"?"↗":o.change==="unchanged"?"→":o.change==="unconfirmed"?"?":"Δ";
const label=id=>id.replaceAll("-"," ").replace(/\b\w/g,m=>m.toUpperCase());

export function renderSystem(state, presentation, locale="en"){
  const t=STRINGS[locale]||STRINGS.en;
  const p=presentation||{labels:{},states:{},assessments:{}};
  const L=id=>p.labels[id]||label(id);
  const S=id=>p.states[id]||id;
  const seq=state.dominant_mechanism.sequence;
  const nodes=seq.map((x,i)=>`<div class="node">${esc(L(x))}</div>${i<seq.length-1?'<div class="edge">→</div>':''}`).join("");
  const rows=state.objects.map(o=>`<tr><td>${esc(L(o.id))}</td><td>${esc(S(o.entering_state))}</td><td>${esc(S(o.current_state))}</td><td class="mark">${mark(o)}${o.constraint?" ×":""}</td><td>${esc(o.status.toUpperCase())}</td></tr>`).join("");
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB ${esc(state.issue_id)} · SYSTEM · ${locale.toUpperCase()}</title>
<style>
:root{--paper:#F1ECE0;--paper2:#E6DFD0;--g:#292A27;--g7:#403F3A;--muted:#68655E;--rule:#8B877E;--brass:#8A7454;--brass1:#E2DACB;--petrol:#5E837F;--petrol1:#CFDFDC;--mineral1:#DCE1D5;--oxide1:#E7D1C8}
*{box-sizing:border-box}body{margin:0;background:#D7CEBD;color:var(--g);font-family:Arial,sans-serif}.sheet{width:1400px;min-height:2000px;margin:24px auto;background:var(--paper);padding:34px 42px;display:flex;flex-direction:column}header{border-top:9px solid var(--g)}h1{font:900 78px/.85 Arial;letter-spacing:-.065em;text-align:center;margin:14px 0 4px}.sub{text-align:center;font:900 13px Arial;letter-spacing:.25em;margin-bottom:15px}.bar{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;border-top:2px solid var(--g7);border-bottom:2px solid var(--g7)}.bar div{padding:9px;border-right:1px solid var(--rule);font:700 9px 'Courier New'}.bar div:last-child{border:0}section{border-bottom:2px solid var(--g7)}.hero{display:grid;grid-template-columns:.8fr 2.2fr;min-height:300px}.hero>div{padding:20px 18px 18px 0}.hero>div+div{padding-left:20px;border-left:1px solid var(--rule)}.k{font:900 9px 'Courier New';letter-spacing:.13em;color:var(--muted)}.delta{font:900 72px/.9 Arial}.headline{font:900 39px/.92 Arial;letter-spacing:-.04em;margin:8px 0 12px;max-width:780px}.deck{font:15px/1.4 Arial;max-width:760px}.map{padding:20px 0;min-height:360px}.map h2,.ledger h2{font:900 27px Arial;margin:6px 0 16px}.flow{display:flex;align-items:center;margin:42px 0 28px}.node{flex:1;min-height:70px;display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;border:3px solid var(--g7);background:var(--brass1);font:900 10px 'Courier New'}.node:nth-of-type(n+4){background:var(--petrol1)}.edge{padding:0 9px;font:900 28px Arial}.assessment{border-top:1px solid var(--rule);padding-top:12px;font:900 18px Arial}.ledger{padding:20px 0;min-height:500px}table{width:100%;border-collapse:collapse}th{font:900 8px 'Courier New';text-align:left;border-bottom:2px solid var(--g7);padding:8px 6px}td{font:11px/1.3 Arial;padding:12px 6px;border-bottom:1px solid var(--rule)}.mark{font:900 16px Arial}.watch{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid var(--rule);margin-top:20px}.watch div{padding:14px;border-right:1px solid var(--rule);font:10px/1.35 'Courier New'}.watch div:last-child{border:0}footer{margin-top:auto;border-top:2px solid var(--g7);padding-top:14px;display:flex;justify-content:space-between}.foot{font:900 22px Arial}.micro{font:8px 'Courier New';color:var(--muted)}
</style></head><body><main class="sheet"><header><h1>WORLD SYSTEM BRIEF</h1><div class="sub">FLOWS · BOTTLENECKS · LEVERAGE</div><div class="bar"><div>${t.issue} ${esc(state.issue_id.replace("WSB-",""))} · SYSTEM · ${locale.toUpperCase()}</div><div>${esc(state.date)}</div><div>${t.activity}: ${esc(state.day_type.system_activity.toUpperCase())}</div><div>Δ ${state.summary.confirmed_delta} · DEVELOPING ${state.summary.developing}</div></div></header>
<section class="hero"><div><div class="k">${t.systemDelta}</div><div class="delta">Δ ${state.summary.confirmed_delta}</div></div><div><div class="k">${t.mechanism}</div><div class="headline">${t.headline}</div><p class="deck">${t.deck}</p></div></section>
<section class="map"><div class="k">${t.map}</div><h2>${esc(L(state.dominant_mechanism.id).toUpperCase())}</h2><div class="flow">${nodes}</div><div class="assessment">${esc(p.assessments[state.dominant_mechanism.assessment]||state.dominant_mechanism.assessment)}</div><div class="watch">${state.objects.slice(1,4).map(o=>`<div><b>${esc(L(o.id))} ${mark(o)}${o.constraint?" ×":""}</b><br>${esc(S(o.current_state))}</div>`).join("")}</div></section>
<section class="ledger"><div class="k">${t.ledger}</div><h2>${esc(state.issue_id)} · ${esc(state.date)}</h2><table><thead><tr><th>OBJECT</th><th>${t.entering}</th><th>${t.current}</th><th>MARK</th><th>${t.status}</th></tr></thead><tbody>${rows}</tbody></table></section>
<footer><div class="foot">${t.footer}</div><div class="micro">ONE STATE · MULTIPLE RENDERS · WSB PALETTE v0.2</div></footer></main></body></html>`;
}
