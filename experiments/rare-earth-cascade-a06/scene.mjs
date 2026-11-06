import * as I from './vendor/intaglio.mjs';

export const ENGINE_REVISION='86d03dd5d722f6bd9b7dda8f0dcf308545f3fa86';
export const WIDTH=960;
export const HEIGHT=640;
export const STAGE_PITCH=3.08;
export const CAMERA={azimuth:-63,elevation:25,pad:78};
export const LIGHT=I.direction(-128,53);

const group=(id,surfaces,kind,stage)=>({id,surfaces:Array.isArray(surfaces)?surfaces:[surfaces],kind,stage});
const cuboid=(x0,y0,z0,x1,y1,z1)=>I.box({min:[x0,y0,z0],max:[x1,y1,z1]});
const cylinder=(x,y,z,r,h)=>I.lathe({base:[x,y,z],profile:[[0,r],[h,r]]});
const topDisc=(x,y,z,r)=>I.disc({center:[x,y,z],normal:[0,0,1],radius:r,along:[1,0,0],sides:48});
const boundsOf=(x0,y0,z0,x1,y1,z1)=>[
 [x0,y0,z0],[x0,y0,z1],[x0,y1,z0],[x0,y1,z1],
 [x1,y0,z0],[x1,y0,z1],[x1,y1,z0],[x1,y1,z1]
];

export function stageGeometry(index,count){
 if(!Number.isInteger(index)||!Number.isInteger(count)||index<0||count<1||index>=count)throw Error('Invalid stage index');
 const x=(index-(count-1)/2)*STAGE_PITCH;
 const yMix=-0.74;
 const xm=x-0.98;
 const parts=[
  group('S'+(index+1)+'-mixer',cylinder(xm,yMix,0.38,0.39,0.78),'mixer',index),
  group('S'+(index+1)+'-mixer-lid',topDisc(xm,yMix,1.16,0.39),'mixer',index),
  group('S'+(index+1)+'-motor',cuboid(xm-.22,yMix-.23,1.51,xm+.22,yMix+.23,1.79),'motor',index),
  group('S'+(index+1)+'-shaft',cylinder(xm,yMix,1.16,.055,.39),'shaft',index),
  group('S'+(index+1)+'-settler',cuboid(x-.47,-.52,.36,x+1.22,.64,1.04),'settler',index),
  group('S'+(index+1)+'-settler-rim',cuboid(x-.48,-.53,1.04,x+1.23,.65,1.085),'rim',index),
  group('S'+(index+1)+'-settler-cap',cuboid(x-.37,-.42,1.088,x+1.12,.53,1.106),'surface',index),
  group('S'+(index+1)+'-bridge',cuboid(xm+.26,-.71,.65,x-.46,-.55,.85),'connection',index),
  group('S'+(index+1)+'-base',cuboid(x-1.49,-1.19,.16,x+1.3,.79,.34),'foundation',index),
  group('S'+(index+1)+'-organic-outlet',cuboid(x+.97,.65,.64,x+1.3,.76,.76),'organic',index),
  group('S'+(index+1)+'-aqueous-outlet',cuboid(x+1.05,-.71,.40,x+1.3,-.57,.52),'aqueous',index)
 ];
 return {index,x,parts,bounds:boundsOf(x-1.53,-1.23,.1,x+1.33,.83,1.82)};
}

export function cascadeGeometry(count=6){
 if(!Number.isInteger(count)||count<1||count>6)throw Error('Stage count must be 1–6');
 const stages=Array.from({length:count},(_,i)=>stageGeometry(i,count));
 const parts=stages.flatMap(s=>s.parts);
 if(count>1){
  const first=stages[0].x,last=stages.at(-1).x;
  parts.push(group('aqueous-manifold',cuboid(first-1.34,-1.02,.39,last+1.28,-.94,.49),'aqueous',null));
  parts.push(group('organic-manifold',cuboid(first-1.34,.83,.72,last+1.28,.91,.82),'organic',null));
  for(const st of stages){
   parts.push(group('aq-branch-'+st.index,cuboid(st.x+.97,-.95,.43,st.x+1.08,-.69,.53),'aqueous',st.index));
   parts.push(group('or-branch-'+st.index,cuboid(st.x+.99,.73,.72,st.x+1.11,.88,.82),'organic',st.index));
  }
 }
 const boxes=stages.flatMap(s=>s.bounds);
 boxes.push(...boundsOf(stages[0].x-1.6,-1.25,.08,stages.at(-1).x+1.4,1.01,1.9));
 return {count,stages,parts,bounds:boxes};
}

export function renderCascade({count=6,mode='intaglio',width=WIDTH,height=HEIGHT,ss=1,cameraSettings=CAMERA}={}){
 if(!['intaglio','mass'].includes(mode))throw Error('Unknown render mode');
 if(!cameraSettings||![-180,180].includes(cameraSettings.azimuth)&&(!Number.isFinite(cameraSettings.azimuth)||Math.abs(cameraSettings.azimuth)>180)||!Number.isFinite(cameraSettings.elevation)||cameraSettings.elevation<1||cameraSettings.elevation>89||!Number.isFinite(cameraSettings.pad)||cameraSettings.pad<0||cameraSettings.pad>=Math.min(width,height)/2)throw Error('Invalid camera settings');
 const geometry=cascadeGeometry(count);
 const cam=I.fitCamera(geometry.bounds,{width,height,pad:cameraSettings.pad,azimuth:cameraSettings.azimuth,elevation:cameraSettings.elevation});
 const solids=geometry.parts.flatMap(part=>part.surfaces);
 const occ=I.occlusion(solids,cam,{ss});
 const paper='#F3EBDD';
 const materials={
  mixer:{base:.30,ambient:.28,bounce:.10},
  settler:{base:.36,ambient:.22,bounce:.12},
  rim:{base:.22,ambient:.28,bounce:.06},
  surface:{base:.04,ambient:.46,bounce:.10},
  motor:{base:.38,ambient:.18,bounce:.07},
  shaft:{base:.35,ambient:.14,bounce:.08},
  foundation:{base:.48,ambient:.15,bounce:.03},
  connection:{base:.45,ambient:.18,bounce:.06},
  organic:{base:.51,ambient:.16,bounce:.09},
  aqueous:{base:.51,ambient:.16,bounce:.09}
 };
 const paths=[];
 let rendered=0;
 const linesByKind={};
 for(const part of geometry.parts){
  const tone=I.lighting({...materials[part.kind],light:LIGHT,view:cam.view});
  for(const surface of part.surfaces){
   const set=I.hatch(surface,cam,occ.sees,{spacing:mode==='mass'?2.45:3.1,step:2.0});
   const d=I.ink(set,mode==='mass'?()=>.96:tone,mode==='mass'?{from:.05,to:.72,width:2.7,fill:2.6,min:.025}:{from:.09,to:.78,width:1.3,fill:1.05,min:.075});
   if(d.length>4){
    paths.push('<path data-stage="'+(part.stage===null?'manifold':part.stage+1)+'" data-kind="'+part.kind+'" d="'+d+'"/>');
    rendered++;
    linesByKind[part.kind]=(linesByKind[part.kind]||0)+1;
   }
  }
 }
 if(!paths.length)throw Error('Draw Beautiful did not produce vector paths');
 const metadata={engine:'bumicodes/draw-beautiful/kit/intaglio.mjs',revision:ENGINE_REVISION,count,mode,rendered_surfaces:rendered,physical_surfaces:solids.length,camera:{...cameraSettings},linesByKind};
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Procedural Draw Beautiful rendering of '+count+' mixer-settler modules"><title>Mixer-settler '+count+'-stage '+mode+' study</title><desc>'+count+' separately modeled mixer drums, drive shafts and longer rectangular settlers; source-geometry hatching, not a chemically complete installation.</desc><rect width="'+width+'" height="'+height+'" fill="'+paper+'"/><g fill="#232523">'+paths.join('')+'</g></svg>';
 return {svg,metadata};
}
