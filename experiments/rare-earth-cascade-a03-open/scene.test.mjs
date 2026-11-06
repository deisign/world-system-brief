import test from 'node:test';
import assert from 'node:assert/strict';
import {stageGeometry,cascadeGeometry,renderCascade} from '../rare-earth-cascade-a06/scene.mjs';
const cameraSettings={azimuth:-43,elevation:29,pad:72};
test('three modules retain independent motors and open settlers',()=>{
 const g=cascadeGeometry(3,{openSettler:true});
 assert.equal(g.stages.length,3);
 for(const s of g.stages){
  assert.equal(s.parts.filter(p=>p.kind==='mixer').length,2);
  assert.equal(s.parts.filter(p=>p.kind==='motor').length,1);
  assert.equal(s.parts.filter(p=>p.kind==='settler').length,5);
  assert.equal(s.parts.filter(p=>p.kind==='rim').length,4);
  assert.equal(s.parts.filter(p=>p.kind==='surface').length,1);
  assert.ok(s.parts.some(p=>p.id.includes('transfer-trough')));
  assert.ok(!s.parts.some(p=>p.id.includes('settler-cap')));
 }
});
test('original closed stage is unchanged',()=>{
 const s=stageGeometry(0,3);
 assert.ok(s.parts.some(p=>p.id.includes('settler-cap')));
 assert.ok(!s.parts.some(p=>p.id.includes('settler-floor')));
});
test('physical Draw Beautiful export contains all three stages and original SVG hatching',()=>{
 for(const mode of ['mass','intaglio']){
  const {svg,metadata}=renderCascade({count:3,mode,openSettler:true,cameraSettings});
  assert.equal(metadata.openSettler,true);
  for(const i of [1,2,3])for(const k of ['mixer','settler','motor','rim','surface'])
   assert.ok(svg.includes('data-stage="'+i+'" data-kind="'+k+'"'),mode+' missing '+k+' in '+i);
  assert.doesNotMatch(svg,/<image\b|data:image|foreignObject|<script\b/i);
  assert.ok((metadata.linesByKind.surface||0)>=3);
 }
});
