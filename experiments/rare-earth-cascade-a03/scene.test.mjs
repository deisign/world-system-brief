import test from 'node:test';
import assert from 'node:assert/strict';
import {cascadeGeometry,renderCascade,ENGINE_REVISION} from '../rare-earth-cascade-a06/scene.mjs';

const views=[
 {azimuth:-63,elevation:25,pad:72},
 {azimuth:-43,elevation:29,pad:72},
 {azimuth:-55,elevation:20,pad:35}
];
test('three mixer-settler stage units, three motors, separate phase networks',()=>{
 const a=cascadeGeometry(3);
 assert.equal(a.stages.length,3);
 for(const kind of ['settler','motor','shaft','surface'])assert.equal(a.parts.filter(p=>p.kind===kind).length,3,kind);
 assert.equal(a.parts.filter(p=>p.kind==='mixer').length,6);
 assert.equal(a.parts.filter(p=>p.id.includes('manifold')).length,2);
 assert.deepEqual(a.stages.map(s=>s.x),[-3.08,0,3.08]);
});
test('three camera studies preserve identical input geometry and different camera angles',()=>{
 const g1=cascadeGeometry(3).stages.map(x=>x.bounds);
 const g2=cascadeGeometry(3).stages.map(x=>x.bounds);
 assert.deepEqual(g1,g2);
 assert.deepEqual(new Set(views.map(v=>v.azimuth)).size,3);
 for(const v of views)assert.equal(v.pad<320,true);
});
test('all 6 real intaglio and mass SVGs have visible physical source paths',()=>{
 for(const view of views){
  for(const mode of ['mass','intaglio']){
   const {svg,metadata}=renderCascade({count:3,mode,cameraSettings:view});
   assert.equal(metadata.count,3);
   assert.deepEqual(metadata.camera,view);
   for(let i=1;i<=3;i++)for(const part of ['mixer','settler','motor'])
    assert.ok(svg.includes('data-stage="'+i+'" data-kind="'+part+'"'),i+' '+part+' '+mode);
   assert.match(svg,/<path data-stage=/);
   assert.doesNotMatch(svg,/<image\b|data:image|<foreignObject|<script\b/i);
  }
 }
});
test('invalid camera settings fail closed and renderer stays pinned',()=>{
 assert.match(ENGINE_REVISION,/^[a-f0-9]{40}$/);
 for(const cameraSettings of [{azimuth:Infinity,elevation:25,pad:72},{azimuth:-43,elevation:0,pad:72},{azimuth:-43,elevation:29,pad:400}])
  assert.throws(()=>renderCascade({count:3,cameraSettings}),/Invalid camera/);
});
