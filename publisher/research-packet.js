import fs from "node:fs";
export function editorialPacket(bundle, audit) {
  if (!bundle || !audit || bundle.issue_date !== audit.issue_date || audit.publication_authorized !== false) throw Error("Independent review required");
  const checked = new Map(audit.candidates.map(c => [c.id, c]));
  const sources = new Map(bundle.sources.map(s => [s.id, s]));
  const entries = bundle.candidates.map(c => {
    const a = checked.get(c.id);
    if (!a) throw Error("Missing review record for " + c.id);
    return {id:c.id, headline:c.headline, event_date:c.event_date, proposed_classification:c.classification,
      proposed_state:c.current_state, structural_hypothesis:c.why_structural,
      source_leads:(a.eligible_source_ids||[]).map(id=>sources.get(id)).filter(Boolean).map(s=>({title:s.title,url:s.url,date:s.publication_date})),
      review_flags:a.flags||[], uncertainties:c.uncertainties||[]};
  });
  return {date:bundle.issue_date,baseline_issue_id:audit.baseline_issue_id,ready_for_publication:false,translation_verified:false,entries};
}
export function renderPacket(packet, language) {
  const title=language==="ua"?"РЕДАКЦІЙНИЙ ПАКЕТ — НЕ ПУБЛІКУВАТИ":"EDITORIAL PACKET — DO NOT PUBLISH";
  const lines=["# WORLD SYSTEM BRIEF", "## "+title, "", "Date: "+packet.date, "Baseline: "+packet.baseline_issue_id, ""];
  for (const c of packet.entries) {
    lines.push("### "+(c.headline||c.id), "", "Event: "+c.event_date,
      "Classification (proposed): "+c.proposed_classification, "Structural hypothesis: "+(c.structural_hypothesis||""), "",
      ...c.source_leads.map(s=>"- "+s.url+" ("+s.date+")"),
      "", "Review flags: "+c.review_flags.join(", "), "Uncertainties: "+c.uncertainties.join("; "), "");
  }
  return lines.join("\n")+"\n";
}
if(process.argv[1]?.endsWith("research-packet.js")) {
  const date=process.argv[2];
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||""))throw Error("Date YYYY-MM-DD required");
  const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
  const p=editorialPacket(read("research/pending/"+date+".json"),read("research/reviews/"+date+".json"));
  const out="research/drafts/"+date;fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(out+"/packet.json",JSON.stringify(p,null,2)+"\n");
  for(const language of ["en","ua"])fs.writeFileSync(out+"/"+language+".md",renderPacket(p,language));
  console.log("Created review-only packet for "+date);
}