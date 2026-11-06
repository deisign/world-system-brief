import test from 'node:test';
import assert from 'node:assert/strict';
import {cascadeGeometry,renderCascade} from '../rare-earth-cascade-a06/scene.mjs';
const opts={count:3,mode:'intaglio',openSettler:true,cameraSettings:{azimuth:-43,elevation:29,pad:72}};
test('new profile changes only hatching and not camera or physical surfaces',()=>{
 const standard=renderCascade({...opts,hatchProfile:'standard'});
 const mobile=renderCascade({...opts,hatchProfile:'mobile-open'});
 assert.deepEqual(standard.metadata.camera,mobile.metadata.camera);
 assert.equal(standard.metadata.physical_surfaces,mobile.metadata.physical_surfaces);
 assert.equal(standard.metadata.count,3);
 assert.equal(mobile.metadata.hatchProfile,'mobile-open');
 assert.notEqual(standard.svg,mobile.svg);
 assert.ok(Buffer.byteLength(mobile.svg)<Buffer.byteLength(standard.svg)*.90);
 assert.equal(cascadeGeometry(3,{openSettler:true}).stages.length,3);
});
test('all three real vector mixer, settler, rim and liquid groups remain in mobile output',()=>{
 const {svg,metadata}=renderCascade({...opts,hatchProfile:'mobile-open'});
 for(const i of [1,2,3])for(const kind of ['mixer','settler','motor','rim','surface']){
  assert.ok(svg.includes('data-stage="'+i+'" data-kind="'+kind+'"'),kind+' stage '+i);
 }
 assert.ok(metadata.rendered_surfaces>60);
 assert.doesNotMatch(svg,/<image\b|<foreignObject|<script\b|data:image/i);
});
test('invalid mobile profile combinations are rejected',()=>{
 assert.throws(()=>renderCascade({...opts,hatchProfile:'fake'}),/Unknown hatch profile/);
 assert.throws(()=>renderCascade({...opts,openSettler:false,hatchProfile:'mobile-open'}),/needs open-settler/);
 assert.throws(()=>renderCascade({...opts,mode:'mass',hatchProfile:'mobile-open'}),/needs open-settler/);
});
