#!/usr/bin/env node
// WSB autonomous research intake. Produces a reviewable candidate bundle,
// never an authoritative issue or a published edition.
import fs from "node:fs";
import path from "node:path";
import { reviewCandidates } from "./research-review.js";

const root = process.cwd();
const date = process.env.WSB_ISSUE_DATE;
const key = process.env.OPENAI_API_KEY;
const model = process.env.WSB_OPENAI_MODEL || "gpt-5-mini";
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) throw Error("WSB_ISSUE_DATE must be YYYY-MM-DD");
if (!key) throw Error("OPENAI_API_KEY secret is required");
const dirs = fs.readdirSync(path.join(root,"issues")).filter(s=>/^\d{4}$/.test(s)).sort();
const previous = dirs.map(dir=>({dir,state:JSON.parse(fs.readFileSync(path.join(root,"issues",dir,"state.json"),"utf8"))}))
  .filter(x=>x.state.date < date).sort((a,b)=>a.state.date.localeCompare(b.state.date)).at(-1);
if (!previous) throw Error("No preceding state");
if (dirs.some(dir=>JSON.parse(fs.readFileSync(path.join(root,"issues",dir,"state.json"),"utf8")).date===date)) {
  throw Error("Issue date already present; do not overwrite");
}
const prompt = `Today (Europe/Kyiv issue date): ${date}. Previously assessed WSB state: ${JSON.stringify(previous.state)}.

You are researching a candidate WORLD SYSTEM BRIEF edition, NOT publishing one. Use web search to locate dated, reputable primary/official materials and credible wire reporting. Study structural changes in flows, dependencies, bottlenecks, access, leverage, rents and substitutability. Track the arrow, not the speech.

Strict:
- Never fabricate URLs, quotes, outcomes, magnitudes or dates.
- Differentiate source publication dates, policy effective dates, and actual transition dates.
- Restrict confirmed_delta to documented state changes on issue date; older developments are not new Δ.
- A commitment is NOT physical capacity already operational.
- Persistence and additional evidence are NOT a new Δ.
- Every confirmed candidate must link to a URL that actually appeared in web search and has adequate dated evidence.
- Do not create an artificial delta to fill the day.
- Include skeptical counterevidence, uncertainties, and rejected high-noise headlines where relevant.
- Output a single JSON object only, no markdown:
{
 "issue_date":"YYYY-MM-DD",
 "baseline_issue_id":"...",
 "as_of_note":"...",
 "candidates":[{"id":"lowercase-slug","headline":"...","classification":"confirmed_delta|developing|persistent|evidence_update|noise","entering_state":"...","current_state":"...","why_structural":"...","event_date":"YYYY-MM-DD","confidence":"high|medium|low","source_ids":["SRC-..."],"uncertainties":["..."]}],
 "sources":[{"id":"SRC-...","title":"...","url":"https://...","publisher":"...","publication_date":"YYYY-MM-DD","claim":"...","observation":"...","limitations":"..."}],
 "editorial_flags":["..."]
}
Write observations as source assertions, not verified facts. Keep classification conservative.`;
const response = await fetch("https://api.openai.com/v1/responses", {
  method:"POST",
  headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
  body:JSON.stringify({model,tools:[{type:"web_search"}],input:[{role:"user",content:prompt}]})
});
const body = await response.json();
if (!response.ok) throw Error(`Research API HTTP ${response.status}: ${JSON.stringify(body.error || {}).slice(0,500)}`);
const output = (body.output || []).filter(x=>x.type==="message")
  .flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text).join("\n");
let bundle;
try {
  const cleaned=output.trim().replace(/^\`\`\`(?:json)?\s*/,"").replace(/\s*\`\`\`$/,"");
  bundle=JSON.parse(cleaned);
} catch {throw Error("Research executor returned non-JSON output; no artifact written");}
const rawPath=path.join(root,"research/raw",date+".json");
fs.mkdirSync(path.dirname(rawPath),{recursive:true});
fs.writeFileSync(rawPath,JSON.stringify({provenance:"raw_unverified_model_output",bundle},null,2)+"\n");
if (bundle.issue_date!==date || bundle.baseline_issue_id!==previous.state.issue_id)
  throw Error("Incorrect issue date or baseline; refusing result");
if (!Array.isArray(bundle.candidates)||!Array.isArray(bundle.sources)) throw Error("Malformed research bundle");
if (bundle.sources.length===0) throw Error("No sourced research; fail closed");
const idSet=new Set();
const rejectedSources=[];
const acceptedSources=[];
for (const s of bundle.sources) {
  if (!s.id||idSet.has(s.id)||!/^https:\/\//.test(s.url||"")||!/^\d{4}-\d{2}-\d{2}$/.test(s.publication_date||""))
    throw Error("Invalid/duplicate source metadata; fail closed");
  idSet.add(s.id);
  if (s.publication_date>date) {
    rejectedSources.push({...s,rejection_reason:"future_dated_source"});
    continue;
  }
  acceptedSources.push(s);
}
bundle.sources=acceptedSources;
bundle.rejected_sources=rejectedSources;
bundle.editorial_flags=Array.isArray(bundle.editorial_flags)?bundle.editorial_flags:[];
for(const s of rejectedSources) bundle.editorial_flags.push(`Source ${s.id} excluded: publication date ${s.publication_date} exceeds issue date ${date}`);
const review=reviewCandidates(bundle,date);
const out=path.join(root,"research","pending",date+".json");
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify({
  schema_version:1,provenance:"unverified_model_research_draft",generated_at:new Date().toISOString(),
  research_model:model, review_summary:{downgraded_confirmed_deltas:review.downgraded,all_claims_require_independent_verification:true}, ...bundle
},null,2)+"\n");
console.log(`Created ${out} (${bundle.candidates.length} candidates, ${bundle.sources.length} source claims). Downgraded ${review.downgraded} unsupported Δ(s). Requires independent source verification; not publication-ready.`);
