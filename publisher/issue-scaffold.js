import fs from "node:fs";
import path from "node:path";

export function issueScaffold(packet, audit, previous, localizations) {
  if (!packet || !audit || audit.publication_authorized !== false || packet.issue_date !== audit.issue_date) throw Error("Review gate required");
  if (!previous || previous.date >= packet.issue_date || !Array.isArray(previous.objects)) throw Error("Previous canonical state required");
  if (!localizations?.en || !localizations?.ua) throw Error("Both baseline localizations required");
  const sourceIndex=new Map(packet.sources.map(s=>[s.id,s]));
  const audited=new Map(audit.candidates.map(c=>[c.id,c]));
  const claims=[],evidence=[];
  for(const c of packet.candidates) {
    const review=audited.get(c.id);
    if(!review)throw Error("Candidate missing audit");
    const sourceIds=[];
    for(const sid of review.eligible_source_ids||[]) {
      const s=sourceIndex.get(sid);
      if(!s)continue;
      const eid="DRAFT-SRC-"+sid;
      if(!evidence.some(x=>x.id===eid))evidence.push({id:eid,source:s.publisher||s.title||sid,url:s.url,
        publication_date:s.publication_date,claim:s.claim||s.title||"Unverified source lead",
        observation:s.observation||"",assessment:"UNVERIFIED - EDITORIAL REVIEW REQUIRED",supports:[c.id],confidence:"low"});
      else {const row=evidence.find(x=>x.id===eid);if(!row.supports.includes(c.id))row.supports.push(c.id);}
      sourceIds.push(eid);
    }
    claims.push({id:"DRAFT-CLM-"+c.id,kind:"proposed",statement:c.headline||c.id,observed_at:c.event_date,
      entity_ids:[c.id],source_ids:sourceIds,status:"review_required",review_flags:review.flags||[],
      proposed_classification:c.classification,proposed_state:c.current_state});
  }
  const state=structuredClone(previous);
  state.date=packet.issue_date;state.issue_id="DRAFT-"+packet.issue_date;
  state.summary={confirmed_delta:0,developing:0,persistent:state.objects.length};
  state.objects=state.objects.map(o=>({...o,entering_state:o.current_state,change:"stable",status:"persistent"}));
  state.notes=[...(previous.notes||[]),"Unverified candidate changes excluded from canonical state until reviewed."];
  const read=lang=>(lang==="ua"?"# РЕДАКЦІЙНИЙ ЧЕРНЕТКОВИЙ ВИПУСК":"# EDITORIAL DRAFT ISSUE")+"\n\n"+
    (lang==="ua"?"НЕ ПУБЛІКУВАТИ. Переклад і незалежна перевірка джерел потрібні.":"DO NOT PUBLISH. Independent source verification and translation required.")+"\n\n"+
    packet.candidates.map(c=>"## "+(c.headline||c.id)+"\n\n"+(c.why_structural||"")+"\n").join("\n");
  return {manifest:{date:packet.issue_date,publication_authorized:false,source_verification:"pending",translation_verification:"pending",
    based_on:previous.issue_id,proposals:packet.candidates.length},
    files:{"state.json":state,"evidence.json":{issue_id:state.issue_id,as_of:state.date,records:evidence},
      "claims.json":{issue_id:state.issue_id,as_of:state.date,claims},
      "relations.json":{issue_id:state.issue_id,as_of:state.date,relations:[]},
      "locale/en.json":structuredClone(localizations.en),"locale/ua.json":structuredClone(localizations.ua),
      "read/en.md":read("en"),"read/ua.md":read("ua")}};
}
export function saveScaffold(result,dir) {
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,"MANIFEST.json"),JSON.stringify(result.manifest,null,2)+"\n");
  for(const [name,data] of Object.entries(result.files)){
    const target=path.join(dir,name);fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,typeof data==="string"?data:JSON.stringify(data,null,2)+"\n");
  }
}
if(process.argv[1]?.endsWith("/issue-scaffold.js")){
  const date=process.argv[2];if(!/^\d{4}-\d{2}-\d{2}$/.test(date||""))throw Error("YYYY-MM-DD required");
  const read=p=>JSON.parse(fs.readFileSync(p,"utf8")),packet=read("research/pending/"+date+".json"),
    audit=read("research/reviews/"+date+".json");
  const states=fs.readdirSync("issues").filter(x=>/^\d{4}$/.test(x)).map(x=>({dir:x,state:read("issues/"+x+"/state.json")}));
  const prior=states.filter(x=>x.state.date<date).sort((a,b)=>a.state.date.localeCompare(b.state.date)).at(-1);
  if(!prior)throw Error("No previous issue");
  const locale={en:read("issues/"+prior.dir+"/locale/en.json"),ua:read("issues/"+prior.dir+"/locale/ua.json")};
  saveScaffold(issueScaffold(packet,audit,prior.state,locale),"research/drafts/"+date+"/canonical");
  console.log("Review-only canonical-shaped files generated; publication NOT authorized.");
}