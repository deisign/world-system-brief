import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderCascade,ENGINE_REVISION} from '../rare-earth-cascade-a06/scene.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const dest=path.join(root,'renders');
fs.mkdirSync(dest,{recursive:true});
const cameraSettings={azimuth:-43,elevation:29,pad:72};
const files=[];
for(const profile of ['standard','mobile-open']){
 const {svg,metadata}=renderCascade({count:3,mode:'intaglio',cameraSettings,openSettler:true,hatchProfile:profile});
 const name=profile==='standard'?'a03-2-spatial-open-settler-intaglio.svg':'a03-2-spatial-open-settler-mobile-intaglio.svg';
 fs.writeFileSync(path.join(dest,name),svg);
 for(const stage of [1,2,3])for(const kind of ['mixer','settler','motor','surface','rim'])
  if(!svg.includes('data-stage="'+stage+'" data-kind="'+kind+'"'))throw Error('Invisible '+kind+' on stage '+stage+' in '+profile);
 files.push({profile,name,bytes:Buffer.byteLength(svg),metadata});
 console.log('PASS',profile,name,Buffer.byteLength(svg),'bytes',metadata.rendered_surfaces,'layers');
}
if(files[1].bytes>=files[0].bytes*.90)throw Error('Compact profile did not reduce vector complexity sufficiently');
fs.writeFileSync(path.join(dest,'mobile-hatch-report.json'),JSON.stringify({status:'experimental_mobile_profile_not_approved',engine:ENGINE_REVISION,geometry:'same',camera:cameraSettings,files},null,2)+'\n');
