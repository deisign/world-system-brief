const dated = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
const bilingual = value => value && ['en', 'ua'].every(lang => typeof value[lang] === 'string' && value[lang].trim());

export function validateDependencyTransitions(data, assessments, bundles) {
  if (data?.schema !== 'wsb-dependency-transitions-v1' || !Array.isArray(data.records) || !Array.isArray(assessments?.records) || !Array.isArray(bundles)) throw Error('Invalid dependency transitions schema');
  const known = new Map(assessments.records.map(record => [record.id, record]));
  const issues = new Map(bundles.map(bundle => [bundle.state.issue_id, bundle]));
  const seen = new Set();
  const last = new Map();
  for (const record of data.records) {
    if (typeof record.id !== 'string' || !record.id || seen.has(record.id)) throw Error('Duplicate or missing transition ID');
    seen.add(record.id);
    const assessment = known.get(record.assessment_id);
    const issue = issues.get(record.issue_id);
    if (!assessment || !issue || record.entity_slug !== assessment.entity_slug || record.issue_id !== assessment.issue_id || record.observed_at !== assessment.date || !dated(record.observed_at)) throw Error('Unlinked transition '+record.id);
    if (!bilingual(record.reason) || !bilingual(record.caveat)) throw Error('Missing bilingual explanation '+record.id);
    if (record.classification !== 'knowledge_update' && record.classification !== 'physical_transition') throw Error('Invalid transition class '+record.id);
    if (!['unknown', 'persistent', 'strengthening', 'weakening', 'substituting', 'disrupted'].includes(record.direction)) throw Error('Invalid transition direction '+record.id);
    if (last.has(record.entity_slug) && last.get(record.entity_slug) > record.observed_at) throw Error('Transition out of order '+record.id);
    last.set(record.entity_slug, record.observed_at);
    if (record.leverage_delta !== 'unknown' || record.rent_delta !== 'unknown' || record.substitution_horizon !== 'unknown') throw Error('Unsupported quantified delta '+record.id);
    if (!Array.isArray(record.claim_ids) || !record.claim_ids.length || !Array.isArray(record.source_ids) || !record.source_ids.length) throw Error('Missing transition references '+record.id);
    if (new Set(record.claim_ids).size !== record.claim_ids.length || new Set(record.source_ids).size !== record.source_ids.length) throw Error('Duplicate transition references '+record.id);
    const claims = new Map((issue.claims?.claims || []).map(claim => [claim.id, claim]));
    const sources = new Map((issue.evidence?.records || []).map(source => [source.id, source]));
    for (const id of record.claim_ids) if (!assessment.claim_ids.includes(id) || !claims.has(id)) throw Error('Unsupported transition claim '+id);
    for (const id of record.source_ids) if (!assessment.source_ids.includes(id) || !sources.has(id) || !/^https:\/\//.test(sources.get(id).url || '') || !record.claim_ids.some(cid => (claims.get(cid).source_ids || []).includes(id))) throw Error('Unsupported transition source '+id);
    if (record.classification === 'knowledge_update') {
      if (record.direction !== 'unknown' || record.effective_at !== null || record.from_state !== null || record.to_state !== null) throw Error('Knowledge update masquerades as a state change '+record.id);
      if (record.claim_ids.some(id => claims.get(id).status === 'confirmed_delta')) throw Error('Physical claim mislabeled as knowledge '+record.id);
    } else {
      if (!dated(record.effective_at) || !record.from_state || !record.to_state || record.from_state === record.to_state || record.direction === 'unknown' || !record.claim_ids.some(id => claims.get(id).status === 'confirmed_delta')) throw Error('Unsupported physical transition '+record.id);
    }
  }
  return true;
}

export function dependencyTransitionTimeline(records, lang, slug = null) {
  if (!['en', 'ua'].includes(lang)) throw Error('Unknown locale');
  const rows = records.filter(item => !slug || item.entity_slug === slug);
  if (!rows.length) return `<section class="evolution"><h2>${lang === 'ua' ? 'Зміни залежності' : 'Dependency evolution'}</h2><p>${lang === 'ua' ? 'Підтверджених переходів залежності немає.' : 'No confirmed dependency transitions.'}</p></section>`;
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const items = rows.map(item => `<li><time datetime="${escape(item.observed_at)}">${escape(item.observed_at)}</time> · ${escape(item.classification)} · ${escape(item.direction)}<p>${escape(item.reason[lang])}</p><p>${escape(item.caveat[lang])}</p><a href="/${lang}/brief/${escape(item.observed_at)}/">${escape(item.issue_id)}</a></li>`).join('');
  return `<section class="evolution"><h2>${lang === 'ua' ? 'Зміни залежності' : 'Dependency evolution'}</h2><p>${lang === 'ua' ? 'Дата спостереження не означає дату фізичної зміни.' : 'Observation date is not the date of a physical change.'}</p><ol>${items}</ol></section>`;
}
