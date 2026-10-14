// Pure review gate: never silently accept unsupported model-proposed delta.
export function reviewCandidates(bundle, date) {
  const sourceIds=new Set(bundle.sources.map(s=>s.id));
  const classes=new Set(["confirmed_delta","developing","persistent","evidence_update","noise"]);
  let downgraded=0;
  for (const c of bundle.candidates) {
    if (!c.id || !classes.has(c.classification) || !Array.isArray(c.source_ids))
      throw Error("Invalid candidate structure");
    const missing=c.source_ids.filter(id=>!sourceIds.has(id));
    if (missing.length) {
      c.unresolved_source_ids=[...new Set([...(c.unresolved_source_ids||[]),...missing])];
      c.source_ids=c.source_ids.filter(id=>sourceIds.has(id));
      c.review_required=true;
      c.review_reasons=[...new Set([...(c.review_reasons||[]),"unregistered_sources"])];
      bundle.editorial_flags=Array.isArray(bundle.editorial_flags)?bundle.editorial_flags:[];
      bundle.editorial_flags.push(`Candidate ${c.id} cites unregistered sources: ${missing.join(", ")}`);
    }
    if (c.classification!=="confirmed_delta") continue;
    const reasons=[...(c.review_reasons||[])];
    if(c.event_date!==date) reasons.push("event_date_not_issue_date");
    if(!c.source_ids.length) reasons.push("no_registered_sources");
    if(!["high","medium"].includes(c.confidence)) reasons.push("insufficient_confidence");
    if(reasons.length){
      c.proposed_classification="confirmed_delta";
      c.classification="developing";
      c.review_required=true;
      c.review_reasons=reasons;
      bundle.editorial_flags=Array.isArray(bundle.editorial_flags)?bundle.editorial_flags:[];
      bundle.editorial_flags.push(`Candidate ${c.id} downgraded for review: ${reasons.join(", ")}`);
      downgraded++;
    }
  }
  return {bundle,downgraded};
}
