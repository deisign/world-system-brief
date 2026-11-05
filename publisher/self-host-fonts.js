import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const fonts=[['manrope',800],['ibm-plex-serif',400],['ibm-plex-mono',400],['ibm-plex-mono',600],['ibm-plex-mono',700]];
const subsets=new Set(['latin','latin-ext','cyrillic','cyrillic-ext']);
export function installFonts(dist,modules='node_modules'){
 const folder=path.join(dist,'assets','fonts');fs.mkdirSync(folder,{recursive:true});
 let css='',copied=0;
 for(const [pkg,weight] of fonts){
  const dir=path.join(modules,'@fontsource',pkg);
  const sheet=fs.readFileSync(path.join(dir,weight+'.css'),'utf8');
  let found=0;
  for(const block of sheet.match(/@font-face\s*\{[^}]+\}/g)||[]){
   const name=block.match(/url\(\.\/files\/([^)\s]+\.woff2)\)/)?.[1];
   if(!name)continue;
   const subset=name.slice(pkg.length+1).replace(new RegExp('-'+weight+'-normal\\.woff2$'),'');
   if(!subsets.has(subset))continue;
   if(!block.includes('unicode-range:'))throw Error('Missing unicode-range '+name);
   const from=path.join(dir,'files',name);
   if(!fs.existsSync(from)||!fs.statSync(from).size)throw Error('Missing WOFF2 '+from);
   fs.copyFileSync(from,path.join(folder,name));
   css+=block.replace(/src:\s*[^;]+;/,'src: url("./'+name+'") format("woff2");')+'\n';
   found++;copied++;
  }
  if(found!==4)throw Error('Incomplete Cyrillic/Latin: '+pkg+' '+weight+' '+found);
  fs.copyFileSync(path.join(dir,'LICENSE'),path.join(folder,pkg+'-LICENSE.txt'));
 }
 css+='\n:root{--wsb-head:"Manrope",Arial,sans-serif;--wsb-body:"IBM Plex Serif",Georgia,serif;--wsb-data:"IBM Plex Mono","Courier New",monospace}\n';
 css+='body,.lead,.read-intro p,.boundary,.source-row p,dd,article p,.entity-v{font-family:var(--wsb-body)!important}\n';
 css+='h1,article>h1,article>h2,.mast,.brand,.delta,.ledger-id,.trajectory h2{font-family:var(--wsb-head)!important;font-weight:800}\n';
 css+='.nav,.sub,.meta,.kicker,.status,.register h2,.read-intro h2,dt,.source-meta,.source-row a,.foot,.atlas-register-heading,.source b,article>h3,.sources h2{font-family:var(--wsb-data)!important}\n';
 fs.writeFileSync(path.join(folder,'wsb.css'),css);
 let pages=0;
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile()&&p.endsWith('.html')){let html=fs.readFileSync(p,'utf8');if(!html.includes('</head>'))throw Error('Missing head '+p);if(!html.includes('href="/assets/fonts/wsb.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/fonts/wsb.css"></head>');fs.writeFileSync(p,html);pages++;}}}
 walk(dist);if(!pages)throw Error('No pages');return {pages,copied};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const result=installFonts(path.resolve(process.argv[2]||'dist'));console.log('WSB fonts: '+result.copied+' WOFF2 files, '+result.pages+' pages');}
