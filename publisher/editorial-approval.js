import fs from "node:fs";
import path from "node:path";
import {validateIssue} from "./validate.js";

export function approveDraft(draft,decisions) {
 if(!draft?.manifest||draft.manifest.publication_authorized!==false)throw Error("Unverified draft manifest required");
 if(!decisions||decisions.issue_date!==draft.manifest.date||decisions.editorial_approval!==true)throw Error("Explicit issue approval required");
 if(!decisions.source_verification_complete||!decisions.translation_verified)throw Error("Source and translation sign-off required");
 const claims=draft.claims?.claims||[],choices=new Map();
 for(const choice of decisions.candidates||[]) {
  if(!["accept","reject"].includes(choice.decision)||!choice.id||!choice.reviewer_note)throw Error("Invalid editorial decision");
  if(choices.has(choice.id))throw Error("Duplicate editorial decision");
  choices.set(choice.id,choice);
 }
 if(claims.length!==choices.size||claims.some(c=>!choices.has(c.id)))throw Error("Every candidate requires an explicit decision");
 const state=structuredClone(draft.state),sourceIds=new Set((draft.evidence.records||[]).map(s=>s.id));
 const accepted=[];
 for(const claim of claims) {
  const choice=choices.get(claim.id);
  if(choice.decision==="reject")continue;
  if(!claim.source_ids?.length||claim.source_ids.some(id=>!sourceIds.has(id)))throw Error("Accepted claim lacks registered evidence");
  if(choice.confirmed_delta===true){
   if(claim.observed_at!==state.date)throw Error("Delta event date differs from issue date");
   if(!choice.verified_new_state||!choice.verified_entity_id)throw Error("Verified state and entity required");
   const obj=state.objects.find(o=>o.id===choice.verified_entity_id);
   if(!obj||obj.current_state===choice.verified_new_state)throw Error("No verified state transition");
   obj.entering_state=obj.current_state;obj.current_state=choice.verified_new_state;obj.status="confirmed_delta";obj.change="down";
  }
  accepted.push({...claim,status:choice.confirmed_delta?"confirmed_delta":"evidence_update",kind:"observed",review_flags:[],
   statement:choice.verified_statement||claim.statement});
 }
 state.summary={confirmed_delta:state.objects.filter(o=>o.status==="confirmed_delta").length,
  developing:state.objects.filter(o=>o.status==="developing").length,
  persistent:state.objects.filter(o=>o.status==="persistent").length};
 const issueId=decisions.issue_id;
 if(!/^WSB-\d{4}$/.test(issueId))throw Error("Canonical issue ID required");
 state.issue_id=issueId;
 const evidence=structuredClone(draft.evidence);evidence.issue_id=issueId;
 return {state,evidence,claims:{issue_id:issueId,as_of:state.date,claims:accepted.map(c=>({...c,issue_id:issueId}))},
  relations:{issue_id:issueId,as_of:state.date,relations:[]}};
}
export function releaseFiles(output,draft) {
 return {"state.json":output.state,"evidence.json":output.evidence,"claims.json":output.claims,
  "relations.json":output.relations,"locale/en.json":draft.en,"locale/ua.json":draft.ua,
  "read/en.md":draft.readEn,"read/ua.md":draft.readUa};
}
if(process.argv[1]?.endsWith("/editorial-approval.js")) {
 const date=process.argv[2];if(!/^\d{4}-\d{2}-\d{2}$/.test(date||""))throw Error("YYYY-MM-DD required");
 const root=process.cwd(),dir=path.join(root,"research/drafts",date,"canonical");
 const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
 const decisionPath=path.join(root,"research/approvals",date+".json");
 const decisions=read(decisionPath);
 const draft={manifest:read(path.join(dir,"MANIFEST.json")),state:read(path.join(dir,"state.json")),
  evidence:read(path.join(dir,"evidence.json")),claims:read(path.join(dir,"claims.json")),
  en:read(path.join(dir,"locale/en.json")),ua:read(path.join(dir,"locale/ua.json")),
  readEn:fs.readFileSync(path.join(dir,"read/en.md"),"utf8"),
  readUa:fs.readFileSync(path.join(dir,"read/ua.md"),"utf8")};
 if(!decisions.editorial_approval)throw Error("Editorial approval missing");
 const result=approveDraft(draft,decisions);
 if(!decisions.final_read_en||!decisions.final_read_ua)throw Error("Final independent bilingual copy required");
 draft.readEn=decisions.final_read_en;draft.readUa=decisions.final_read_ua;
 const files=releaseFiles(result,draft),target=path.join(root,"issues",decisions.issue_id.slice(-4));
 if(fs.existsSync(target))throw Error("Issue already exists; refusing overwrite");
 fs.mkdirSync(target,{recursive:true});
 for(const [name,value]of Object.entries(files)){const dest=path.join(target,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,typeof value==="string"?value:JSON.stringify(value,null,2)+"\n");}
 const errors=validateIssue(target,{root});if(errors.length){fs.rmSync(target,{recursive:true,force:true});throw Error("Generated issue invalid: "+errors.join("; "));}
 console.log("Generated approved issue files at "+target+". Commit via PR; no automatic publishing.");
}