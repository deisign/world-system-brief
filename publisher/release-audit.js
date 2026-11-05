import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const baseDefault='/world-system-brief';
const uriAttrs=/(?:^|\s)(href|src|action|poster|srcset)\s*=\s*(["'])(.*?)\2/gi;
const cssUrls=/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi;
const htmlTags=/<(?:a|link|img|script|iframe|source|video|audio|form|meta)\b[^>]*>/gi;
const isSkipped=u=>!u||u==='#'||/^(?:data:|mailto:|tel:|javascript:|blob:|\/\/)/i.test(u);
const isExternal=u=>/^https?:\/\//i.test(u);
function files(dir,match){
 const out=[];
 function walk(d){for(const x of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,x.name);if(x.isDirectory())walk(p);else if(x.isFile()&&match(p))out.push(p);}}
 walk(dir);return out.sort();
}
function attrs(tag){
 const out=[];let m;
 uriAttrs.lastIndex=0;
 while((m=uriAttrs.exec(tag))!==null)out.push({attr:m[1].toLowerCase(),raw:m[3]});
 return out;
}
function pathsFromSrcset(v){
 return v.split(',').map(x=>x.trim().split(/\s+/)[0]).filter(Boolean);
}
function targetFor(root,file,raw,base){
 if(isSkipped(raw)||isExternal(raw))return null;
 const rel=path.relative(root,file).split(path.sep).join('/');
 const publicUrl=new URL(base+'/'+rel,'https://wsb.invalid');
 let url;
 try{url=new URL(raw,publicUrl)}catch{return {problem:'invalid_url',target:raw};}
 if(url.origin!=='https://wsb.invalid')return null;
 if(!(url.pathname===base||url.pathname.startsWith(base+'/')))return {problem:'unprefixed_internal',target:url.pathname};
 let suffix;
 try{suffix=decodeURIComponent(url.pathname.slice(base.length));}catch{return {problem:'invalid_url',target:url.pathname};}
 if(suffix.includes('\0')||suffix.split('/').includes('..'))return {problem:'unsafe_path',target:suffix};
 if(suffix==='/'||suffix==='')suffix='/index.html';
 else if(suffix.endsWith('/'))suffix+='index.html';
 else if(!path.posix.extname(suffix))suffix+='/index.html';
 const local=path.resolve(root,'.'+suffix);
 if(local!==path.resolve(root)&&!local.startsWith(path.resolve(root)+path.sep))return {problem:'unsafe_path',target:suffix};
 if(!fs.existsSync(local)||!fs.statSync(local).isFile())return {problem:'missing_target',target:suffix};
 return {target:suffix,fragment:url.hash};
}
export function auditRelease(root,{base=baseDefault}={}){
 if(!/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(base))throw Error('Invalid Pages base');
 if(!fs.existsSync(root)||!fs.statSync(root).isDirectory())throw Error('Missing publication directory');
 const html=files(root,p=>p.endsWith('.html')),css=files(root,p=>p.endsWith('.css'));
 if(!html.length)throw Error('No published HTML');
 const errors=[],warnings=[],inspected={html:html.length,css:css.length,links:0,fragments:0};
 const push=(level,file,reason,target)=>{const rel=path.relative(root,file).split(path.sep).join('/');(level==='error'?errors:warnings).push({file:rel,reason,target});};
 function check(file,raw){
  if(isSkipped(raw)||isExternal(raw))return;
  inspected.links++;
  const result=targetFor(root,file,raw,base);
  if(result?.problem)push('error',file,result.problem,result.target);
  else if(result?.fragment&&result.fragment!=='#')inspected.fragments++;
 }
 for(const file of html){
  const body=fs.readFileSync(file,'utf8'),rel=path.relative(root,file).split(path.sep).join('/');
  if(!/<meta\s+charset\s*=\s*["']?utf-8/i.test(body))push('warning',file,'missing_charset','');
  if(!/<meta\s+name\s*=\s*["']viewport["']/i.test(body))push('warning',file,'missing_viewport','');
  if(!/<title(?:\s|>)/i.test(body))push('warning',file,'missing_title','');
  if(!/<h1(?:\s|>)/i.test(body)&&!/^index\.html$/.test(rel))push('warning',file,'missing_h1','');
  let t;htmlTags.lastIndex=0;
  while((t=htmlTags.exec(body))!==null)for(const a of attrs(t[0]))for(const url of a.attr==='srcset'?pathsFromSrcset(a.raw):[a.raw])check(file,url);
  const refresh=body.match(/<meta\s+[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/i)?.[0];
  if(refresh){
   const v=refresh.match(/content\s*=\s*["'][^"']*?url\s*=\s*([^"']+)["']/i)?.[1];
   if(v)check(file,v.trim());
  }
 }
 for(const file of css){
  const body=fs.readFileSync(file,'utf8');
  let m;cssUrls.lastIndex=0;
  while((m=cssUrls.exec(body))!==null)check(file,(m[1]??m[2]??m[3]??'').trim());
 }
 const u=new Set(html.map(p=>path.relative(root,p).split(path.sep).join('/')));
 const pairs=[];
 for(const rel of u){
  if(!/^(en|ua)\//.test(rel))continue;
  const other=rel.replace(/^(en|ua)\//,x=>x==='en/'?'ua/':'en/');
  if(!u.has(other))pairs.push({file:rel,reason:'missing_locale_counterpart',target:other});
 }
 warnings.push(...pairs);
 return {base,inspected,errors,warnings};
}
export function auditText(report){
 const lines=['WSB RELEASE LINK AUDIT','HTML '+report.inspected.html+'; CSS '+report.inspected.css+'; local references '+report.inspected.links,'ERRORS '+report.errors.length+'; WARNINGS '+report.warnings.length];
 for(const [label,items] of [['ERROR',report.errors],['WARN',report.warnings]])for(const row of items.slice(0,80))lines.push(label+' '+row.reason+' '+row.file+(row.target?' -> '+row.target:''));
 if(report.errors.length>80||report.warnings.length>80)lines.push('Additional findings suppressed; use JSON output');
 return lines.join('\n');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(process.argv[2]||'dist');
 const strict=process.argv.includes('--strict');
 const report=auditRelease(root);
 console.log(auditText(report));
 if(strict&&report.errors.length)process.exitCode=1;
}
