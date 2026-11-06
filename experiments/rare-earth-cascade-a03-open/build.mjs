import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderCascade,ENGINE_REVISION} from '../rare-earth-cascade-a06/scene.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const dest=path.join(root,'renders');fs.mkdirSync(dest,{recursive:true});
const cameraSettings={azimuth:-43,elevation:29,pad:72};
const results=[];
for(const mode of ['mass','intaglio']){
 const {svg,metadata}=renderCascade({count:3,mode,cameraSettings,openSettler:true});
 const name='a03-2-spatial-open-settler-'+mode+'.svg';
 fs.writeFileSync(path.join(dest,name),svg);
 if(!svg.includes('data-kind="surface"')||!svg.includes('data-kind="mixer"')||!svg.includes('data-kind="settler"'))throw Error('Essential physical surfaces not rendered');
 results.push({name,bytes:Buffer.byteLength(svg),metadata});
 console.log('PASS',name,Buffer.byteLength(svg),metadata.linesByKind);
}
fs.writeFileSync(path.join(dest,'report.json'),JSON.stringify({engine:'Draw Beautiful',revision:ENGINE_REVISION,status:'experimental_unapproved',cameraSettings,results},null,2)+'\n');
