import fs from 'node:fs';
import path from 'node:path';

export function preflight(bundle, states) {
  if (!bundle || !/^\d{4}-\d{2}-\d{2}$/.test(bundle.issue_date || '')) throw Error('Invalid issue date');
  if (!Array.isArray(bundle.sources) || !Array.isArray(bundle.candidates)) throw Error('Invalid research packet');
  const previous=states.filter(s=>s.date<bundle.issue_date).sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
  if (!previous) throw Error('No preceding issue');
  const prevObjects=new Map((previous.objects||[]).map(o=>[o.id,o]));
  const known=new Map(), warnings=[];
  for(const source of bundle.sources){
    if(!source.id||known.has(source.id)){warnings.push({type:'duplicate_or_missing_source_id',source_id:source.id??null});continue;}
    known.set(source.id,source);
    if(!/^https:\/\/[^\s/]+\.[^\s/]+(?:\/.*)?$/.test(source.url||''))warnings.push({type:'malformed_source_url',source_id:source.id});
    if(!/^\d{4}-\d{2}-\d{2}$/.test(source.publication_date||'')||source.publication_date>bundle.issue_date)warnings.push({type:'invalid_or_future_source_date',source_id:source.id});
    else if(/^https:\/\/[^/]+\/?$/.test(source.url||''))warnings.push({type:'homepage_not_article',source_id:source.id});
  }
  const candidates=bundle.candidates.map(c=>{
    const ids=Array.isArray(c.source_ids)?c.source_ids:[];
    const valid=ids.filter(id=>known.has(id)&&(known.get(id).publication_date||'')<=bundle.issue_date&&/^https:\/\//.test(known.get(id).url||''));
    const unknown=ids.filter(id=>!valid.includes(id)),baseline=prevObjects.get(c.id),reasons=[];
    if(c.event_date!==bundle.issue_date)reasons.push('event_date_not_issue_date');
    if(baseline&&baseline.current_state===c.current_state)reasons.push('unchanged_from_preceding_canonical_state');
    if(!valid.length)reasons.push('no_eligible_citation');
    if(unknown.length)reasons.push('unresolved_citations');
    if(c.classification==='confirmed_delta')reasons.push('independent_editorial_confirmation_required');
    return {id:c.id,proposed_classification:c.classification,event_date:c.event_date,baseline_state:baseline?.current_state??null,proposed_state:c.current_state??null,eligible_source_ids:valid,unresolved_source_ids:unknown,requires_review:true,flags:reasons};
  });
  return {schema_version:1,issue_date:bundle.issue_date,baseline_issue_id:previous.issue_id,model_baseline_issue_id:bundle.baseline_issue_id??null,baseline_mismatch:bundle.baseline_issue_id!==previous.issue_id,publication_authorized:false,checks_are_metadata_only:true,source_count:bundle.sources.length,candidate_count:candidates.length,warnings,candidates};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)){
  const root=process.cwd(),date=process.argv[2]||process.env.WSB_ISSUE_DATE;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))throw Error('Usage: node publisher/research-preflight.js YYYY-MM-DD');
  const bundle=JSON.parse(fs.readFileSync(path.join(root,'research/pending',date+'.json'),'utf8'));
  const states=fs.readdirSync(path.join(root,'issues')).filter(x=>/^\d{4}$/.test(x)).map(x=>JSON.parse(fs.readFileSync(path.join(root,'issues',x,'state.json'),'utf8')));
  const result=preflight(bundle,states),out=path.join(root,'research/reviews',date+'.json');
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
  console.log('Preflight '+date+': '+result.candidate_count+' candidates, '+result.warnings.length+' source warnings; publication NOT authorized.');
}