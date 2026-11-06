import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDependencyTransitions, dependencyTransitionTimeline} from './dependency-transitions.js';
const source={id:'S',url:'https://example.org/evidence'};
const claim={id:'C',source_ids:['S'],status:'evidence_update'};
const assessments={records:[{id:'A',entity_slug:'oil',issue_id:'WSB-0040',date:'2026-11-06',claim_ids:['C'],source_ids:['S']}]};
const bundles=[{state:{issue_id:'WSB-0040'},claims:{claims:[claim]},evidence:{records:[source]}}];
const entry={id:'T',assessment_id:'A',entity_slug:'oil',issue_id:'WSB-0040',observed_at:'2026-11-06',effective_at:null,from_state:null,to_state:null,classification:'knowledge_update',direction:'unknown',claim_ids:['C'],source_ids:['S'],reason:{en:'Old estimate',ua:'Попередня оцінка'},caveat:{en:'No measured change',ua:'Зміну не виміряно'},leverage_delta:'unknown',rent_delta:'unknown',substitution_horizon:'unknown'};
const doc=record=>({schema:'wsb-dependency-transitions-v1',records:[record]});
test('grounded knowledge update accepted',()=>assert.equal(validateDependencyTransitions(doc(entry),assessments,bundles),true));
test('physical transition without confirmed delta rejected',()=>assert.throws(()=>validateDependencyTransitions(doc({...entry,classification:'physical_transition',direction:'strengthening',from_state:'a',to_state:'b',effective_at:'2026-10-31'}),assessments,bundles),/Unsupported physical/));
test('fabricated substitution time rejected',()=>assert.throws(()=>validateDependencyTransitions(doc({...entry,substitution_horizon:'2 years'}),assessments,bundles),/Unsupported quantified/));
test('unknown evidence rejected',()=>assert.throws(()=>validateDependencyTransitions(doc({...entry,source_ids:['S2']}),assessments,bundles),/Unsupported transition source/));
test('knowledge update with effective state rejected',()=>assert.throws(()=>validateDependencyTransitions(doc({...entry,direction:'weakening'}),assessments,bundles),/masquerades/));
test('bilingual timeline escapes text',()=>{const html=dependencyTransitionTimeline([{...entry,reason:{en:'<script>',ua:'тест'}}],'en','oil');assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));});
test('no observations states no confirmed transition',()=>assert.match(dependencyTransitionTimeline([],'ua','oil'),/Підтверджених переходів/));

test('Hormuz seven-day history does not invent physical transitions', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const root = process.cwd();
  for (let number = 34; number <= 40; number++) {
    const issue = String(number).padStart(4, '0');
    const state = JSON.parse(fs.readFileSync(path.join(root, 'issues', issue, 'state.json'), 'utf8'));
    assert.equal(state.summary.confirmed_delta, 0, issue);
    const hormuz = state.objects.find(item => item.id === 'hormuz');
    assert.ok(hormuz, issue);
    assert.equal(hormuz.change, 'stable', issue);
    assert.equal(hormuz.current_state, 'persistent_navigation_constraint', issue);
    const claims = JSON.parse(fs.readFileSync(path.join(root, 'issues', issue, 'claims.json'), 'utf8')).claims;
    assert.ok(claims.every(claim => claim.status !== 'confirmed_delta'), issue);
  }
});
