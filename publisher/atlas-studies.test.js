import test from 'node:test';
import assert from 'node:assert/strict';
import {atlasStudies,atlasStudiesPage,atlasStudyLinks} from './atlas-studies.js';
import {systemEngravingV33} from './system-engraving-v33.js';
import {euvAtlasPage} from './euv-atlas.js';
import {oilNetworkPage} from './oil-network-atlas.js';

test('EN/UA study hub links to exactly three existing visualization routes',()=>{
 assert.equal(atlasStudies.length,3);
 for(const lang of ['en','ua']){
  const html=atlasStudiesPage({lang});
  assert.equal((html.match(/class="study-link"/g)||[]).length,3);
  for(const study of atlasStudies){
   assert.ok(html.includes('href="/'+lang+'/visualizations/'+study.slug+'/"'));
   assert.ok(html.includes(study.grammar));
   assert.ok(html.includes(study.title[lang]));
   assert.ok(html.includes(study.evidence[lang]));
  }
  assert.ok(html.includes('href="/'+lang+'/dependencies/"'));
  assert.ok(html.includes('href="/'+lang+'/entities/"'));
  assert.ok(html.includes('href="/'+lang+'/archive/"'));
  assert.ok(html.includes('href="/'+(lang==='en'?'ua':'en')+'/atlas/studies/"'));
 }
});
test('all three study renderers expose shared navigation without losing citations',()=>{
 const renderers=[['flow',systemEngravingV33],['chain',euvAtlasPage],['network',oilNetworkPage]];
 for(const [kind,render] of renderers)for(const lang of ['en','ua']){
  const html=render({lang});
  assert.equal((html.match(/class="atlas-study-links"/g)||[]).length,1);
  assert.ok(html.includes('href="/'+lang+'/atlas/studies/"'));
  assert.ok(html.includes('aria-current="page"'));
  assert.ok(html.includes('rel="noopener noreferrer"'));
  assert.equal((html.match(/class="atlas-register-heading"/g)||[]).length,4,kind+'/'+lang);
 }
});
test('invalid locales and study keys are rejected',()=>{
 assert.throws(()=>atlasStudiesPage({lang:'xx'}));
 assert.throws(()=>atlasStudyLinks('xx'));
 assert.throws(()=>atlasStudyLinks('en','unsupported'));
});
