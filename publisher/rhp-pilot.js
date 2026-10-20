// RHP evaluation spike: quantitative evidence from the existing WSB-0011 registry.
const escapeHtml = x => String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function rhpPilotPage({lang='en',evidence}) {
 const ua=lang==='ua';
 const record=(evidence.records||[]).find(x=>x.id==='WSB-SRC-0011-01');
 if(!record || !record.url || !/25\.08%/.test(record.claim) || !/16\.37%/.test(record.claim)) throw new Error('WSB-0011 verified evidence missing');
 const title=ua?'ЗУПИНКА ВИДОБУТКУ В МЕКСИКАНСЬКІЙ ЗАТОЦІ':'GULF OF MEXICO OUTPUT SHUT-INS';
 const labels=ua?['Нафта','Газ']:['Oil','Gas'];
 const note=ua?'Частка зупиненого видобутку станом на 7 жовтня 2026 року. Це різні види виробництва, кожен відносно власного загального обсягу.':'Production shut-in shares as of 7 October 2026. Oil and gas each use their own output total as denominator.';
 const source=ua?'ДЖЕРЕЛО':'SOURCE';
 const fallback=ua?'Графік недоступний. Значення наведено в таблиці нижче.':'Chart unavailable. Values remain in the table below.';
 const data=JSON.stringify({labels,values:[25.08,16.37]});
 return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WSB-0011 · RHP Evidence Pilot</title><style>
 :root{--paper:#F3EBDD;--ink:#232523;--red:#A2362A;--blue:#46697A;--rule:#CFC4B3}*{box-sizing:border-box}body{background:var(--paper);color:var(--ink);margin:0;font-family:Georgia,serif}main{max-width:980px;margin:auto;padding:24px 28px 80px}header{border-top:8px solid var(--ink);padding-top:14px;font:900 clamp(27px,5vw,58px)/1 'Arial Narrow',Arial,sans-serif}nav{margin:15px 0 45px;display:flex;flex-wrap:wrap;gap:18px;font:700 12px monospace}a{color:inherit;text-underline-offset:4px}a:focus-visible{outline:3px solid var(--blue);outline-offset:3px}.eyebrow{font:700 12px monospace;color:var(--red)}h1{font:900 clamp(35px,7vw,75px)/.95 'Arial Narrow',Arial,sans-serif;letter-spacing:-.045em;max-width:850px}p{font-size:18px;line-height:1.6;max-width:780px}#chart{min-height:210px;border-block:3px solid var(--ink);padding:28px 0;margin:30px 0}#chart .rhp-chart{--rhp-ink:var(--ink)}table{border-collapse:collapse;width:100%;max-width:600px;font:15px monospace}td,th{text-align:left;border-bottom:1px solid var(--rule);padding:12px}td:last-child{text-align:right}.small{font:12px/1.6 monospace}#chart-status{font:13px/1.5 monospace;color:var(--red)}@media(max-width:600px){main{padding:17px}nav{gap:10px}h1{font-size:38px}}
 </style></head><body><main><header>WORLD SYSTEM BRIEF</header><nav><a href="/${lang}/brief/2026-10-08/">READ · WSB-0011</a><a href="/${lang}/">LATEST</a><a href="/${lang}/dependencies/">DEPENDENCIES</a><a href="/${ua?'en':'ua'}/visualizations/0011/">${ua?'EN':'UA'}</a></nav><div class="eyebrow">RESEARCH / QUANTITATIVE EVIDENCE / RHP PILOT</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(note)}</p><div id="chart" role="img" aria-label="${escapeHtml(title)}"></div><p id="chart-status" role="status" aria-live="polite"></p><table><thead><tr><th>${ua?'Показник':'Measure'}</th><th>${ua?'Частка зупинена':'Share shut in'}</th></tr></thead><tbody><tr><td>${escapeHtml(labels[0])}</td><td>25.08%</td></tr><tr><td>${escapeHtml(labels[1])}</td><td>16.37%</td></tr></tbody></table><p class="small">${source}: <a href="${escapeHtml(record.url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(record.source)} ↗</a> · ${escapeHtml(record.id)}</p><p class="small">${escapeHtml(fallback)}</p></main><script type="module">
 const dataset=${data};
 try {
   const {Chart,Plot,Bar,Label,html,render}=await import('https://cdn.jsdelivr.net/npm/@bezda/rhp@2.0.2/dist/standalone.js');
   const row=d=>html`<div><${Label} edge="start">${'${() => d.label}'}<//><${Bar} to=${'${() => d.value}'} /><${Label} at=${'${() => d.value}'}>${'${() => d.value.toFixed(2) + "%"}'}<//></div>`;
   render(()=>html`<${Chart} scale=${'${[0,30]}'}><${Plot} label=${'${dataset.labels}'} value=${'${dataset.values}'}>${'${row}'}<//><//>`,document.getElementById('chart'));
 } catch(err){document.getElementById('chart-status').textContent=${JSON.stringify(fallback)};console.error('RHP pilot render failed',err)}
 </script></body></html>`;
}