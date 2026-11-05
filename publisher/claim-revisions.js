import {atlasEscape as E,atlasSourceAnchor} from './atlas-primitives.js';
const decisions=new Set(['confirmed','qualified','refuted']);
const dateOk=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!Number.isNaN(Date.parse(s+'T00:00:00Z'));
export function validateRevisions(ledger,bundles){
 if(ledger?.schema!=='wsb-claim-revisions-v1'||!Array.isArray(ledger.revisions))throw Error('Invalid revisions schema');
 if(!Array.isArray(bundles))throw Error('Missing canonical issue corpus');
 const issues=new Map(),claims=new Map();
 for(const b of bundles){
  if(!b.state?.issue_id||!dateOk(b.state.date)||issues.has(b.state.issue_id))throw Error('Invalid or duplicated issue');
  issues.set(b.state.issue_id,b);
  for(const c of b.claims?.claims||[]){
   if(!c.id||claims.has(c.id))throw Error('Duplicate canonical claim '+c.id);
   claims.set(c.id,{claim:c,bundle:b});
  }
 }
 const seen=new Set(),byTarget=new Map();
 for(const r of ledger.revisions){
  if(!r.id||seen.has(r.id))throw Error('Duplicate revision ID '+r.id);
  seen.add(r.id);
  if(!decisions.has(r.decision))throw Error('Unknown editorial decision '+r.id);
  if(!r.reason?.en?.trim()||!r.reason?.ua?.trim())throw Error('Missing bilingual explanation '+r.id);
  if(!dateOk(r.date))throw Error('Invalid revision date '+r.id);
  const original=claims.get(r.target_claim_id);
  if(!original)throw Error('Unknown original claim '+r.target_claim_id);
  const b=issues.get(r.issue_id);
  if(!b||b.state.date!==r.date||r.date<=original.bundle.state.date)throw Error('Revision must use a later canonical issue '+r.id);
  const sources=new Map((b.evidence?.records||[]).map(s=>[s.id,s]));
  if(!Array.isArray(r.source_ids)||!r.source_ids.length||new Set(r.source_ids).size!==r.source_ids.length)throw Error('Missing or duplicated evidence '+r.id);
  for(const sid of r.source_ids){
   const s=sources.get(sid);
   if(!s||!/^https:\/\//.test(s.url||'')||!dateOk(s.publication_date)||s.publication_date>r.date||s.role==='baseline')throw Error('Invalid revision evidence '+sid);
  }
  const list=byTarget.get(r.target_claim_id)||[];
  if(list.length && (r.date<list.at(-1).date || (r.date===list.at(-1).date&&r.id<=list.at(-1).id)))throw Error('Revisions must be appended in chronological order '+r.id);
  list.push({...r,sources:r.source_ids.map(id=>sources.get(id))});
  byTarget.set(r.target_claim_id,list);
 }
 return byTarget;
}
export function claimRevisionSection({lang,claimId,revisions=[]}){
 if(!['en','ua'].includes(lang))throw Error('Invalid locale');
 const ua=lang==='ua',title=ua?'ПЕРЕГЛЯД ТВЕРДЖЕННЯ':'CLAIM REVIEW HISTORY';
 if(!revisions.length)return '<section class="claim-revisions"><h2>'+title+'</h2><p>'+(ua?'Пізніших редакційних рішень у канонічному реєстрі немає. Початкова оцінка залишається датованою версією, а не автоматично підтвердженим фактом.':'No later editorial decision is registered. The original assessment remains a dated version, not an automatically confirmed fact.')+'</p></section>';
 const labels={confirmed:{en:'CONFIRMED',ua:'ПІДТВЕРДЖЕНО'},qualified:{en:'QUALIFIED',ua:'УТОЧНЕНО'},refuted:{en:'REFUTED',ua:'СПРОСТОВАНО'}};
 const rows=revisions.map(r=>{
  if(r.target_claim_id!==claimId||!decisions.has(r.decision))throw Error('Mismatched revision rendering');
  const links=r.sources.map(s=>atlasSourceAnchor({url:s.url,label:s.id+' · '+s.publication_date})).join(' · ');
  return '<article class="claim-revision"><p class="revision-meta">'+E(r.date)+' · <a href="/'+lang+'/brief/'+E(r.date)+'/">'+E(r.issue_id)+'</a> · '+E(r.id)+' · '+labels[r.decision][lang]+'</p><p>'+E(r.reason[lang])+'</p><p class="revision-sources">'+links+'</p></article>';
 }).join('');
 return '<section class="claim-revisions"><h2>'+title+'</h2><p>'+(ua?'Рішення додаються до початкового твердження без переписування оригіналу.':'Decisions are appended without rewriting the original claim.')+'</p>'+rows+'</section>';
}
