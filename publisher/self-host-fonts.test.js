import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {installFonts,fonts} from './self-host-fonts.js';
test('exports 20 local WOFF2 files with subset coverage and injects CSS',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'wsb-font-test-'));
 try{
  const mods=path.join(root,'node_modules'),dist=path.join(root,'dist');fs.mkdirSync(dist);
  fs.writeFileSync(path.join(dist,'index.html'),'<html><head></head><body></body></html>');
  for(const [pkg,weight] of fonts){
   const dir=path.join(mods,'@fontsource',pkg);fs.mkdirSync(path.join(dir,'files'),{recursive:true});
   let css='';
   for(const subset of ['latin','latin-ext','cyrillic','cyrillic-ext']){
    const name=pkg+'-'+subset+'-'+weight+'-normal.woff2';
    fs.writeFileSync(path.join(dir,'files',name),'valid-fixture');
    css+='@font-face { font-family: "Test"; font-weight: '+weight+'; src: url(./files/'+name+') format("woff2"); unicode-range: U+0000-FFFF; }\n';
   }
   fs.writeFileSync(path.join(dir,weight+'.css'),css);fs.writeFileSync(path.join(dir,'LICENSE'),'OFL');
  }
  assert.deepEqual(installFonts(dist,mods),{pages:1,copied:20});
  const css=fs.readFileSync(path.join(dist,'assets','fonts','wsb.css'),'utf8');
  assert.match(css,/Manrope/);assert.match(css,/IBM Plex Serif/);assert.match(css,/IBM Plex Mono/);
  assert.match(css,/cyrillic-800-normal\.woff2/);
  assert.match(fs.readFileSync(path.join(dist,'index.html'),'utf8'),/href="\/assets\/fonts\/wsb.css"/);
  installFonts(dist,mods);
  assert.equal((fs.readFileSync(path.join(dist,'index.html'),'utf8').match(/wsb\.css/g)||[]).length,1);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('missing Fontsource files fail closed',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'wsb-font-missing-'));
 try{fs.mkdirSync(path.join(root,'dist'));fs.writeFileSync(path.join(root,'dist','index.html'),'<head></head>');assert.throws(()=>installFonts(path.join(root,'dist'),path.join(root,'node_modules')))}
 finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('headless root redirect is allowed and remains navigable',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'wsb-font-redirect-'));
 try {
  const dist=path.join(root,'dist');fs.mkdirSync(dist);fs.writeFileSync(path.join(dist,'index.html'),'<meta http-equiv="refresh" content="0;url=/en/">');fs.writeFileSync(path.join(dist,'other.html'),'<html><head></head></html>');
  const mods=path.join(root,'node_modules');
  for(const [pkg,weight] of fonts){
   const d=path.join(mods,'@fontsource',pkg);fs.mkdirSync(path.join(d,'files'),{recursive:true});
   let css='';
   for(const s of ['latin','latin-ext','cyrillic','cyrillic-ext']){
    const n=pkg+'-'+s+'-'+weight+'-normal.woff2';
    fs.writeFileSync(path.join(d,'files',n),'test');
    css+='@font-face {src:url(./files/'+n+') format("woff2");unicode-range:U+0000-FFFF;}\n';
   }
   fs.writeFileSync(path.join(d,weight+'.css'),css);fs.writeFileSync(path.join(d,'LICENSE'),'OFL');
  }
  assert.deepEqual(installFonts(dist,mods),{pages:1,copied:20});
  assert.equal(fs.readFileSync(path.join(dist,'index.html'),'utf8'),'<meta http-equiv="refresh" content="0;url=/en/">');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
