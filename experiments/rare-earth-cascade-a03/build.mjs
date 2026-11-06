import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderCascade,ENGINE_REVISION} from '../rare-earth-cascade-a06/scene.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(here,'renders');
fs.mkdirSync(out,{recursive:true});
export const variants=[
 {id:'a03-1-linear',cameraSettings:{azimuth:-63,elevation:25,pad:72}},
 {id:'a03-2-spatial',cameraSettings:{azimuth:-43,elevation:29,pad:72}},
 {id:'a03-3-close',cameraSettings:{azimuth:-55,elevation:20,pad:35}}
];
const entries=[];
for(const variant of variants){
 for(const mode of ['mass','intaglio']){
  const name=variant.id+'-'+mode;
  const t0=performance.now();
  const result=renderCascade({count:3,mode,cameraSettings:variant.cameraSettings});
  const file=path.join(out,name+'.svg');
  fs.writeFileSync(file,result.svg);
  const counts=[1,2,3].map(i=>({
   stage:i,
   mixer:(result.svg.match(new RegExp('data-stage="'+i+'" data-kind="mixer"','g'))||[]).length,
   settler:(result.svg.match(new RegExp('data-stage="'+i+'" data-kind="settler"','g'))||[]).length,
   motor:(result.svg.match(new RegExp('data-stage="'+i+'" data-kind="motor"','g'))||[]).length
  }));
  if(counts.some(x=>x.mixer<1||x.settler<1||x.motor<1))throw Error('Missing physical stage geometry '+name+': '+JSON.stringify(counts));
  entries.push({file:path.basename(file),camera:variant.cameraSettings,mode,bytes:fs.statSync(file).size,ms:Math.round(performance.now()-t0),components:counts,render:result.metadata});
  console.log('PASS',name,entries.at(-1).bytes+' bytes',JSON.stringify(counts));
 }
}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({experiment:'cascade-a03',approval:'unreviewed',engineRevision:ENGINE_REVISION,files:entries},null,2)+'\n');
console.log('PASS six genuine pinned Draw Beautiful SVG renders');
