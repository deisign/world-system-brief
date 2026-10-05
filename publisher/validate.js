import fs from "node:fs";
import path from "node:path";

function entityResolver(root){
 const p=path.join(root,"knowledge","entities.json");
 if(!fs.existsSync(p)) return {resolve:x=>x,known:new Set()};
 const registry=JSON.parse(fs.readFileSync(p,"utf8"));
 const aliases=new Map(), known=new Set();
 for(const e of registry.entities||[]){
  if(!e.id||!e.slug) continue;
  known.add(e.slug);
  aliases.set(e.id,e.slug);
  aliases.set(e.slug,e.slug);
 }
 return {resolve:x=>aliases.get(x)||x,known};
}

export function validateIssue(base,{root=process.cwd()}={}){
 const errors=[], read=n=>{const p=path.join(base,n);if(!fs.existsSync(p)){errors.push(`missing ${n}`);return null}try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch(e){errors.push(`invalid ${n}: ${e.message}`);return null}};
 const state=read("state.json"), evidence=read("evidence.json"), claims=read("claims.json"), relations=read("relations.json");
 if(!state||!evidence||!claims||!relations)return errors;
 const {resolve,known}=entityResolver(root);
 const objects=new Set((state.objects||[]).map(x=>resolve(x.id))), sources=new Map((evidence.records||[]).map(x=>[x.id,x])), claimIds=new Set((claims.claims||[]).map(x=>x.id));
 const entityExists=id=>objects.has(resolve(id)) || known.has(resolve(id));
 for(const s of evidence.records||[]){if(!s.id)errors.push("evidence without id");if(!/^https?:\/\//.test(s.url||""))errors.push(`${s.id}: missing/invalid url`);if(!/^\d{4}-\d{2}-\d{2}$/.test(s.publication_date||""))errors.push(`${s.id}: missing/invalid publication_date`);if(!s.claim)errors.push(`${s.id}: missing claim`)}
 for(const c of claims.claims||[]){if(!c.id)errors.push("claim without id");for(const sid of c.source_ids||[])if(!sources.has(sid))errors.push(`${c.id}: unknown source ${sid}`);for(const eid of c.entity_ids||[])if(!entityExists(eid))errors.push(`${c.id}: unknown entity ${eid}`);if((c.status==="confirmed"||c.status==="confirmed_delta")&&!(c.source_ids||[]).length)errors.push(`${c.id}: confirmed claim without evidence`);for(const parent of c.derived_from||[])if(!claimIds.has(parent))errors.push(`${c.id}: unknown parent claim ${parent}`)}
 for(const r of relations.relations||relations.records||[]){for(const k of ["from","to"]){const id=r[k];if(id&&!entityExists(id))errors.push(`relation ${r.id||"?"}: unknown ${k} entity ${id}`)}for(const cid of r.claim_ids||[])if(!claimIds.has(cid))errors.push(`relation ${r.id||"?"}: unknown claim ${cid}`);for(const sid of r.source_ids||[])if(!sources.has(sid))errors.push(`relation ${r.id||"?"}: unknown source ${sid}`)}
 for(const o of state.objects||[]){if(!o.current_state)errors.push(`${o.id}: missing current_state`);if(!o.status)errors.push(`${o.id}: missing status`);if(known.size&&!known.has(resolve(o.id)))errors.push(`${o.id}: absent from knowledge/entities.json`)}
 return errors;
}

if(process.argv[1]&&process.argv[1].endsWith("validate.js")){
 const root=process.cwd(), dirs=fs.readdirSync(path.join(root,"issues")).filter(x=>/^\d{4}$/.test(x)).sort();let bad=0;
 for(const d of dirs){const errors=validateIssue(path.join(root,"issues",d),{root});if(errors.length){bad+=errors.length;console.error(`FAIL ${d}`);for(const e of errors)console.error(`  - ${e}`)}else console.log(`OK ${d}`)}
 if(bad){console.error(`${bad} validation error(s)`);process.exit(1)}console.log(`Validated ${dirs.length} issue(s): OK`);
}
