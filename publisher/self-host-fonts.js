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
 // Type rules apply to editorial genres; POSTER keeps its authored composition.
 css+='html[data-wsb-genre="read"] :is(body,.lead,.read-intro p,.boundary,.source-row p,dd,article p),html[data-wsb-genre="system"] :is(.lead,.node-body p,.route-copy p,.analysis p),html[data-wsb-genre="reference"] :is(body,article p,.entity-v),html[data-wsb-genre="home"] .lead{font-family:var(--wsb-body)!important}\n';
 css+='html[data-wsb-genre="read"] :is(h1,.mast,.delta,.ledger-id,article>h2),html[data-wsb-genre="system"] :is(h1,.mast,.delta,.ledger-id),html[data-wsb-genre="reference"] :is(h1,article>h1,article>h2,.brand,.trajectory h2),html[data-wsb-genre="home"] :is(.wordmark,.hero h1,h2,.stat){font-family:var(--wsb-head)!important;font-weight:800}\n';
 css+='html:not([data-wsb-genre="poster"]) :is(.nav,.sub,.meta,.kicker,.status,.register h2,.read-intro h2,dt,.source-meta,.source-row a,.foot,.atlas-register-heading,.source b,article>h3,.sources h2,.wsb-topnav){font-family:var(--wsb-data)!important}\n';
 css+='html[data-wsb-genre="system"] h1{font-size:clamp(36px,5.5vw,78px)!important;line-height:1.04!important;overflow-wrap:anywhere}\n';
 css+='html[data-wsb-genre="home"] .wordmark{font-size:clamp(38px,7vw,105px)!important;white-space:normal;overflow-wrap:anywhere}\n';
 fs.writeFileSync(path.join(folder,'wsb.css'),css);
 let pages=0;
 function genre(file){
  const rel=path.relative(dist,file).split(path.sep);
  const section=rel.length>1?rel[1]:'';
  if(section==='poster')return 'poster';
  if(section==='system'||section==='visualizations'||section==='dependencies')return 'system';
  if(section==='brief'||section==='atlas'&&rel[2]==='read')return 'read';
  if(rel.length===2&&rel[1]==='index.html')return 'home';
  return 'reference';
 }
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile()&&p.endsWith('.html')){let html=fs.readFileSync(p,'utf8');if(!html.includes('</head>')){if(/<meta\s+http-equiv=["']refresh["']/i.test(html))continue;throw Error('Missing head '+p);}if(!/<html(?:\s|>)/i.test(html))throw Error('Missing html root '+p);const kind=genre(p);html=html.replace(/<html(\s|>)/i,'<html data-wsb-genre="'+kind+'"$1');if(!html.includes('href="/assets/fonts/wsb.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/fonts/wsb.css"></head>');fs.writeFileSync(p,html);pages++;}}}
 walk(dist);if(!pages)throw Error('No pages');return {pages,copied};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const result=installFonts(path.resolve(process.argv[2]||'dist'));console.log('WSB fonts: '+result.copied+' WOFF2 files, '+result.pages+' pages');}
