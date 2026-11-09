// Deterministic, schematic topology. Positions are editorial layout, never geographic coordinates.
export function systemMapVisualSVG(edges,entities,lang,focus=null){
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const degree=new Map();
 for(const edge of edges){for(const id of [edge.from,edge.to])degree.set(id,(degree.get(id)||0)+1);}
 const ids=[...degree.keys()].sort((a,b)=>degree.get(b)-degree.get(a)||a.localeCompare(b));
 const visible=ids.slice(0,21),show=new Set(visible);
 const positions=new Map();
 visible.forEach((id,i)=>{
  if(i===0)positions.set(id,{x:600,y:350});
  else if(i<=8){const angle=(i-1)*Math.PI/4-Math.PI/2;positions.set(id,{x:600+Math.cos(angle)*280,y:350+Math.sin(angle)*205});}
  else {const angle=(i-9)*2*Math.PI/12-Math.PI/2;positions.set(id,{x:600+Math.cos(angle)*505,y:350+Math.sin(angle)*305});}
 });
 const color=type=>/chokepoint|constraint|bottleneck|risk/i.test(type)?'#A2362A':/infrastructure|pipeline|route|transport|logistics/i.test(type)?'#46697A':/capital|finance|bank|policy|stock/i.test(type)?'#A08039':'#555C55';
 const lines=edges.filter(e=>show.has(e.from)&&show.has(e.to)).map((e,i)=>{
  const a=positions.get(e.from),b=positions.get(e.to);
  return '<line class="visual-edge" x1="'+a.x.toFixed(1)+'" y1="'+a.y.toFixed(1)+'" x2="'+b.x.toFixed(1)+'" y2="'+b.y.toFixed(1)+'" stroke="#7D827C" stroke-width="'+(Math.min(2.3,1.05+.18*(e.appearances||1))).toFixed(2)+'" stroke-opacity=".55" marker-end="url(#wsb-arrow)"><title>'+esc(e.type.replaceAll('_',' ')+' · '+e.from+' → '+e.to)+'</title></line>';
 }).join('');
 const nodes=visible.map((id,i)=>{
  const p=positions.get(id),entity=entities[id]||{},type=entity.type||'unknown',name=entity.labels?.[lang]||id,active=id===focus,short=name.length>29?name.slice(0,27)+'…':name,shade=color(type);
  const labelY=p.y+(i===0?45:p.y>=350?31:-25);
  return '<g class="visual-node'+(active?' is-focus':'')+'" tabindex="0" role="button" data-map-visual-node="'+esc(id)+'" aria-label="'+esc(name)+'" aria-pressed="'+String(active)+'"><circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+(i===0?15:10)+'" fill="'+shade+'" stroke="#F3EBDD" stroke-width="4"/><text x="'+p.x.toFixed(1)+'" y="'+labelY.toFixed(1)+'" text-anchor="middle" font-family="Manrope,Arial,sans-serif" font-weight="800" font-size="'+(i===0?17:13)+'" fill="#232523" paint-order="stroke" stroke="#F3EBDD" stroke-width="5" stroke-linejoin="round">'+esc(short)+'</text><title>'+esc(name+' · '+type)+'</title></g>';
 }).join('');
 const count=ids.length-visible.length;
 const summary=lang==='ua'?'Схема відношень, не географічна карта':'Relation topology, not a geographic map';
 const limit=count?(lang==='ua'?'Показано 21 із '+ids.length+' вузлів; повний перелік нижче':'Showing 21 of '+ids.length+' nodes; all listed below'):(lang==='ua'?'Усі вузли поточного відбору':'All nodes in current selection');
 return '<svg id="system-visual-svg" viewBox="0 0 1200 720" role="img" aria-labelledby="system-visual-title system-visual-desc" xmlns="http://www.w3.org/2000/svg"><title id="system-visual-title">'+esc(summary)+'</title><desc id="system-visual-desc">'+esc(limit)+'. '+esc(edges.length)+' '+(lang==='ua'?'підтверджених записами зв’язків':'relations backed by issue records')+'.</desc><defs><marker id="wsb-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#7D827C" stroke-width="1"/></marker></defs><g>'+lines+'</g><g>'+nodes+'</g></svg>';
}
