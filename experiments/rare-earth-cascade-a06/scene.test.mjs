import test from 'node:test';
import assert from 'node:assert/strict';
import {cascadeGeometry,stageGeometry,renderCascade,ENGINE_REVISION} from './scene.mjs';
test('six real stage models have separately identifiable mixer, drive and settler',()=>{
 const a=cascadeGeometry(6);
 assert.equal(a.stages.length,6);
 assert.equal(a.parts.filter(p=>p.kind==='mixer').length,12);
 assert.equal(a.parts.filter(p=>p.kind==='motor').length,6);
 assert.equal(a.parts.filter(p=>p.kind==='settler').length,6);
 assert.equal(a.parts.filter(p=>p.kind==='aqueous').length,13);
 assert.equal(a.parts.filter(p=>p.kind==='organic').length,13);
 assert.equal(a.parts.filter(p=>p.kind==='surface').length,6);
 assert.equal(new Set(a.parts.map(p=>p.id)).size,a.parts.length);
});
test('stage geometry is reproducible, adequately spaced and never randomized',()=>{
 const a=cascadeGeometry(6),b=cascadeGeometry(6);
 assert.deepEqual(a.stages.map(s=>({x:s.x,bounds:s.bounds,ids:s.parts.map(p=>p.id)})),b.stages.map(s=>({x:s.x,bounds:s.bounds,ids:s.parts.map(p=>p.id)})));
 assert.ok(a.stages.every((s,i)=>i===0||s.x-a.stages[i-1].x>3));
 assert.throws(()=>stageGeometry(6,6));
 assert.throws(()=>cascadeGeometry(7));
 assert.match(ENGINE_REVISION,/^[a-f0-9]{40}$/);
});
test('actual Draw Beautiful intaglio returns real vector strokes for both vessel types',()=>{
 const {svg,metadata}=renderCascade({count:1,ss:1});
 assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
 assert.match(svg,/<path data-stage="1" data-kind="mixer"/);
 assert.match(svg,/<path data-stage="1" data-kind="settler"/);
 assert.match(svg,/<path data-stage="1" data-kind="motor"/);
 assert.ok(metadata.rendered_surfaces>4);
 assert.ok((metadata.linesByKind.mixer||0)>0);
 assert.ok((metadata.linesByKind.settler||0)>0);
 assert.doesNotMatch(svg,/<image\b|data:image|<foreignObject|<script\b/i);
});
