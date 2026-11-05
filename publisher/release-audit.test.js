import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {auditRelease} from './release-audit.js';
function sample(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'wsb-release-audit-'));
 const put=(p,c)=>{const target=path.join(root,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,c);};
 const doc=(href,src='')=>'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Test</title><link rel="stylesheet" href="/world-system-brief/assets/main.css"></head><body><h1>Test</h1><a href="'+href+'">next</a>'+src+'</body></html>';
 put('en/index.html',doc('/world-system-brief/en/about/'));
 put('ua/index.html',doc('/world-system-brief/en/about/'));
 put('en/about/index.html',doc('/world-system-brief/en/'));
 put('ua/about/index.html',doc('/world-system-brief/ua/'));
 put('assets/main.css','body{background-image:url("./pic.svg")}');
 put('assets/pic.svg','<svg xmlns="http://www.w3.org/2000/svg"></svg>');
 return {root,put,doc};
}
test('fully generated bilingual links, styles and media pass',()=>{
 const {root}=sample();
 try{const report=auditRelease(root);assert.deepEqual(report.errors,[]);assert.equal(report.inspected.html,4);assert.ok(report.inspected.links>=7);}finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('detect missing built route instead of assuming green CI implies live path',()=>{
 const {root,put,doc}=sample();
 try{
  put('en/index.html',doc('/world-system-brief/en/not-a-page/'));
  const issues=auditRelease(root).errors;
  assert.ok(issues.some(x=>x.reason==='missing_target'&&x.target==='/en/not-a-page/index.html'));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('absolute unprefixed project link, invalid asset and wrong CSS URL are errors',()=>{
 const {root,put,doc}=sample();
 try{
  put('en/index.html',doc('/en/about/','<img src="/world-system-brief/assets/lost.svg" alt="Lost">'));
  put('assets/main.css','body{background:url("./not-here.woff2")}');
  const reasons=auditRelease(root).errors.map(x=>x.reason);
  assert.ok(reasons.includes('unprefixed_internal'));
  assert.ok(reasons.filter(x=>x==='missing_target').length>=2);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('ignore external URLs and fragments and record missing localization as warning',()=>{
 const {root,put,doc}=sample();
 try{
  put('en/solo/index.html',doc('https://example.com/path'));
  put('en/index.html',doc('#section'));
  const report=auditRelease(root);
  assert.deepEqual(report.errors,[]);
  assert.ok(report.warnings.some(x=>x.reason==='missing_locale_counterpart'));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
