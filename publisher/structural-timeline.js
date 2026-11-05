import {atlasEscape as E,atlasSourceAnchor} from './atlas-primitives.js';

export function structuralKnowledgeTimeline(slug,registry,bundles){
 const entity=(registry.entities||[]).find(e=>e.slug===slug);
 if(!entity)throw Error('Unknown structural entity '+slug);
 if(!Array.isArray(bundles))throw Error('Expected canonical issues');
 const aliases=new Set([entity.id,entity.slug]);
 const rows=[],seen=new Set();
 for(const bundle of bundles){
  const {state,claims,evidence}=bundle;
  if(!state?.issue_id||!/^\d{4}-\d{2}-\d{2}$/.test(state.date||''))throw Error('Invalid canonical issue');
  const sourceMap=new Map((evidence?.records||[]).map(s=>[s.id,s]));
  const objects=(state.objects||[]).filter(o=>aliases.has(o.id));
  for(const c of claims?.claims||[]){
   if(!(c.entity_ids||[]).some(id=>aliases.has(id)))continue;
   if(!c.id||seen.has(c.id))throw Error('Duplicate structural claim ID '+c.id);
   seen.add(c.id);
   if(c.issue_id&&c.issue_id!==state.issue_id)throw Error('Claim/issue mismatch '+c.id);
   if(!c.statement||!Array.isArray(c.source_ids)||!c.source_ids.length)throw Error('Claim lacks evidence '+c.id);
   const sources=c.source_ids.map(id=>{
    const s=sourceMap.get(id);
    if(!s||!/^https:\/\//.test(s.url||'')||!/^\d{4}-\d{2}-\d{2}$/.test(s.publication_date||''))throw Error('Invalid claim source '+c.id+' '+id);
    return {id:s.id,url:s.url,label:s.source||s.id,publication_date:s.publication_date};
   });
   const declaredDelta=c.status==='confirmed_delta';
   const changed=objects.some(o=>o.entering_state&&o.current_state&&o.entering_state!==o.current_state&&o.change!=='stable');
   if(declaredDelta&&(!changed||state.summary?.confirmed_delta<1))throw Error('Unsupported confirmed delta '+c.id);
   rows.push({id:c.id,issue_id:state.issue_id,date:state.date,observed_at:c.observed_at||null,status:c.status||'unclassified',kind:declaredDelta?'system_delta':'knowledge_update',statement:c.statement,sources});
  }
 }
 rows.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 return rows;
}
export function renderStructuralTimeline({lang,slug,rows}){
 if(!['en','ua'].includes(lang)||!Array.isArray(rows))throw Error('Invalid timeline');
 const ua=lang==='ua';
 if(!rows.length)return '<section class="structural-timeline"><h2>'+(ua?'ІСТОРІЯ ЗНАНЬ':'KNOWLEDGE HISTORY')+'</h2><p>'+(ua?'У датованих випусках WSB немає тверджень, безпосередньо прив’язаних до цієї сутності. Структурний профіль спирається на джерела дослідження EUV.':'No dated WSB issue contains a claim explicitly linked to this entity. The structural profile is backed by the EUV study sources.')+'</p></section>';
 const entries=rows.map(r=>{
  const sourceLinks=r.sources.map(s=>atlasSourceAnchor({url:s.url,label:s.id+' · '+s.publication_date})).join(' · ');
  const type=r.kind==='system_delta'?(ua?'ПІДТВЕРДЖЕНА ЗМІНА СИСТЕМИ':'CONFIRMED SYSTEM CHANGE'):(ua?'ОНОВЛЕННЯ ЗНАНЬ / БЕЗ ПІДТВЕРДЖЕНОЇ Δ':'KNOWLEDGE UPDATE / NO CONFIRMED Δ');
  return '<article class="structural-entry"><div class="structural-entry-meta"><a href="/'+lang+'/brief/'+E(r.date)+'/">'+E(r.issue_id)+'</a> · '+E(r.date)+' · '+type+' · '+E(r.status)+'</div><p>'+E(r.statement)+'</p><div class="structural-entry-sources">'+sourceLinks+'</div></article>';
 }).join('');
 return '<section class="structural-timeline"><h2>'+(ua?'ІСТОРІЯ ЗНАНЬ':'KNOWLEDGE HISTORY')+'</h2><p>'+(ua?'Твердження прив’язані до датованих випусків і джерел. Нове свідчення не дорівнює зміні стану системи.':'Claims are linked to dated issues and sources. New evidence does not by itself establish a change in the world.')+'</p>'+entries+'</section>';
}
export const timelineCSS='<style>.structural-timeline{margin:35px 0;border-top:2px solid var(--ink,#232523);padding-top:12px}.structural-timeline>p{font:15px/1.55 "IBM Plex Serif",Georgia,serif}.structural-entry{border-top:1px solid var(--rule,#B8AC9B);padding:16px 0}.structural-entry-meta,.structural-entry-sources{font:700 11px/1.6 "IBM Plex Mono",monospace}.structural-entry p{font:16px/1.5 "IBM Plex Serif",Georgia,serif}.structural-entry-sources{overflow-wrap:anywhere}</style>';
