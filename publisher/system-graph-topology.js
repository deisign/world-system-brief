const escape=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const color=status=>status==='proposed_not_commissioned'?'#A2362A':status==='price_signal'?'#8A6736':'#46697A';
const isSoft=status=>['analyst_assessment','price_signal','proposed_not_commissioned','preliminary_report'].includes(status);
const label=(entity,lang)=>entity?.labels?.[lang]||entity?.slug||'';
const clip=(s,max=27)=>s.length>max?s.slice(0,max-1)+'…':s;

/**
 * Deterministic shared-node SVG, not a geographic drawing or flow-capacity model.
 * Cyclic dependencies remain supported: the display is a stable column layout,
 * and cycles are routed visually without claiming a causal direction of change.
 */
export function layoutDependencyGraph(validated){
 const ids=validated.config.nodes,edges=validated.edges;
 const nodes=new Map(ids.map(id=>[id,{id,rank:0}]));
 const incoming=new Map(ids.map(id=>[id,0]));
 const children=new Map(ids.map(id=>[id,[]]));
 for(const e of edges){incoming.set(e.to,incoming.get(e.to)+1);children.get(e.from).push(e.to);}
 const queue=ids.filter(id=>incoming.get(id)===0).sort(),seen=new Set();
 while(queue.length){
  const id=queue.shift();seen.add(id);
  for(const to of children.get(id).sort()){
   nodes.get(to).rank=Math.max(nodes.get(to).rank,nodes.get(id).rank+1);
   incoming.set(to,incoming.get(to)-1);
   if(incoming.get(to)===0){queue.push(to);queue.sort();}
  }
 }
 // A cycle receives a shared final column, not an invented route/chronology.
 const fallback=Math.max(0,...[...nodes.values()].map(n=>n.rank));
 for(const id of ids)if(!seen.has(id))nodes.get(id).rank=fallback;
 const columns=new Map();
 for(const item of nodes.values()){const list=columns.get(item.rank)||[];list.push(item);columns.set(item.rank,list);}
 const maxRows=Math.max(...[...columns.values()].map(a=>a.length)),levels=Math.max(...columns.keys())+1;
 const width=Math.max(960,levels*250+35),height=Math.max(320,maxRows*112+52);
 for(const [rank,items] of columns){items.sort((a,b)=>a.id.localeCompare(b.id));items.forEach((n,i)=>{n.x=24+rank*250;n.y=30+i*112+(maxRows-items.length)*56;});}
 return {nodes,width,height};
}
export function renderDependencyTopologySVG(validated,lang){
 if(!['en','ua'].includes(lang))throw Error('Unknown graph locale');
 const registry=new Map(validated.registry.entities.map(e=>[e.slug,e]));
 const {nodes,width,height}=layoutDependencyGraph(validated),pieces=[];
 pieces.push('<svg role="img" aria-label="'+escape(lang==='ua'?'Схема спільних вузлів і спрямованих залежностей':'Shared-node diagram of directed dependencies')+'" xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'">');
 pieces.push('<defs><marker id="sg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#46697A"/></marker></defs><rect width="'+width+'" height="'+height+'" fill="#F2EBDD"/>');
 for(const e of validated.edges){
  const a=nodes.get(e.from),b=nodes.get(e.to);
  const forward=b.x>a.x;
  const x1=forward?a.x+210:a.x+105,y1=a.y+33,x2=forward?b.x:b.x+105,y2=b.y+33;
  const middle=forward?(x1+x2)/2:Math.max(x1,x2)+48;
  const d='M'+x1+' '+y1+' C'+middle+' '+y1+' '+middle+' '+y2+' '+x2+' '+y2;
  pieces.push('<g><title>'+escape(e.id+' | '+e.from+' → '+e.to+' | '+e.status)+'</title><path d="'+d+'" fill="none" stroke="'+color(e.status)+'" stroke-width="2.3"'+(isSoft(e.status)?' stroke-dasharray="6 5"':'')+' marker-end="url(#sg-arrow)"/></g>');
 }
 for(const id of validated.config.nodes){
  const n=nodes.get(id),display=label(registry.get(id),lang)||id;
  pieces.push('<g id="node-'+escape(id)+'"><title>'+escape(display)+'</title><rect x="'+n.x+'" y="'+n.y+'" width="210" height="66" fill="#F2EBDD" stroke="#68655E" stroke-width="1.5"/><text x="'+(n.x+10)+'" y="'+(n.y+24)+'" fill="#232523" font-family="Manrope,Arial,sans-serif" font-size="13" font-weight="800">'+escape(clip(display))+'</text><text x="'+(n.x+10)+'" y="'+(n.y+47)+'" fill="#68655E" font-family="monospace" font-size="10">'+escape(clip(id,31))+'</text></g>');
 }
 pieces.push('</svg>');return pieces.join('');
}
