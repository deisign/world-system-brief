import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderCascade,ENGINE_REVISION} from './scene.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(here,'renders');
fs.mkdirSync(out,{recursive:true});
const jobs=[
 {name:'stage-a-01-intaglio',count:1,mode:'intaglio'},
 {name:'cascade-a-06-mass',count:6,mode:'mass'},
 {name:'cascade-a-06-intaglio',count:6,mode:'intaglio'}
];
const stats=[];
for(const job of jobs){
 const t0=performance.now();
 const {svg,metadata}=renderCascade({count:job.count,mode:job.mode,ss:1});
 const filepath=path.join(out,job.name+'.svg');
 fs.writeFileSync(filepath,svg,'utf8');
 const actual=fs.readFileSync(filepath,'utf8');
 if(!actual.includes('data-kind="mixer"')||!actual.includes('data-kind="settler"'))throw Error('Both mixer and settler must be rendered');
 const summary={...metadata,file:path.basename(filepath),bytes:Buffer.byteLength(actual),duration_ms:Math.round(performance.now()-t0)};
 stats.push(summary);
 console.log(job.name,JSON.stringify({bytes:summary.bytes,duration_ms:summary.duration_ms,rendered_surfaces:summary.rendered_surfaces,by_kind:summary.linesByKind}));
}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({experiment:'cascade-a-06',status:'unreviewed-experiment-not-published',pinned_upstream:ENGINE_REVISION,files:stats},null,2)+'\n');
console.log('DRAW BEAUTIFUL GEOMETRIC INK EXPORT OK');
