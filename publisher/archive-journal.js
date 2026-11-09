const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const months={en:['January','February','March','April','May','June','July','August','September','October','November','December'],ua:['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень']};
const t={en:{heading:'ARCHIVE',eyebrow:'THE EDITION ARCHIVE',intro:'A dated record of flows, constraints and changes in the world system.',latest:'LATEST EDITION',past:'PAST EDITIONS',read:'READ THE ISSUE',system:'SYSTEM',poster:'POSTER',count:'CANONICAL EDITIONS',delta:'CONFIRMED NEW Δ',note:'New evidence does not necessarily mean a physical transition.',bottleneck:'SYSTEM MECHANISM'},ua:{heading:'АРХІВ',eyebrow:'АРХІВ ВИПУСКІВ',intro:'Датована історія потоків, обмежень і змін світової системи.',latest:'ОСТАННІЙ ВИПУСК',past:'ПОПЕРЕДНІ ВИПУСКИ',read:'ЧИТАТИ ВИПУСК',system:'СИСТЕМА',poster:'ПЛАКАТ',count:'КАНОНІЧНІ ВИПУСКИ',delta:'НОВИХ ПІДТВЕРДЖЕНИХ Δ',note:'Нові свідчення не обов’язково означають фізичний перехід.',bottleneck:'СИСТЕМНИЙ МЕХАНІЗМ'}};
const clean=x=>String(x||'').trim().replace(/\s+/g,' ');
const day=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'));
const routes=(lang,date)=>({read:'/'+lang+'/brief/'+date+'/',system:'/'+lang+'/system/'+date+'/',poster:'/'+lang+'/poster/'+date+'/'});
const label=(item,lang)=>clean(item.headlines?.[lang])||item.id;
const intro=(item,lang)=>clean(item.decks?.[lang]);
const nav=(item,lang,feature=false)=>{
 const r=routes(lang,item.date),words=t[lang];
 return '<div class="archive-actions"><a class="archive-read" href="'+esc(r.read)+'">'+esc(feature?words.read:'READ')+'</a><a href="'+esc(r.system)+'">'+esc(words.system)+'</a><a href="'+esc(r.poster)+'">'+esc(words.poster)+'</a></div>';
};
export function archivePageBody(lang,items){
 if(!t[lang]||!Array.isArray(items)||!items.length)throw Error('Invalid archive');
 const seen=new Set(),words=t[lang];
 for(const item of items){
  if(!item.id||!day(item.date)||seen.has(item.id)||!clean(item.headlines?.en)||!clean(item.headlines?.ua)||!Number.isInteger(item.confirmedDelta)||item.confirmedDelta<0)throw Error('Invalid archival edition '+(item.id||'?'));
  seen.add(item.id);
 }
 const ordered=items.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)),latest=ordered[0];
 let prevMonth='',rows='';
 for(const item of ordered.slice(1)){
  const m=item.date.slice(0,7);
  if(m!==prevMonth){
   rows+='<h2 class="archive-month">'+esc(months[lang][Number(item.date.slice(5,7))-1]+' '+item.date.slice(0,4))+'</h2>';
   prevMonth=m;
  }
  const link=routes(lang,item.date).read;
  rows+='<article class="archive-edition"><div class="archive-edition-meta"><span>'+esc(item.id)+'</span><time datetime="'+esc(item.date)+'">'+esc(item.date)+'</time><span>Δ '+item.confirmedDelta+'</span></div><div class="archive-edition-main"><h3><a href="'+esc(link)+'">'+esc(label(item,lang))+'</a></h3>'+(intro(item,lang)?'<p>'+esc(intro(item,lang))+'</p>':'')+nav(item,lang)+'</div></article>';
 }
 return '<div class="archive-journal"><header class="archive-intro"><p class="archive-overline">'+esc(words.eyebrow)+'</p><h1>'+esc(words.heading)+'</h1><p>'+esc(words.intro)+'</p><p class="archive-count">'+esc(words.count)+' · '+ordered.length+'</p></header><section class="archive-feature" aria-label="'+esc(words.latest)+'"><div class="archive-feature-marker">'+esc(words.latest)+' <span>'+esc(latest.id)+' · '+esc(latest.date)+'</span></div><h2><a href="'+esc(routes(lang,latest.date).read)+'">'+esc(label(latest,lang))+'</a></h2>'+(intro(latest,lang)?'<p class="archive-feature-deck">'+esc(intro(latest,lang))+'</p>':'')+'<p class="archive-feature-delta">'+esc(words.delta)+': '+latest.confirmedDelta+'<span>'+esc(words.note)+'</span></p>'+nav(latest,lang,true)+'</section><section class="archive-backfile"><h2 class="archive-backfile-heading">'+esc(words.past)+'</h2>'+rows+'</section></div>';
}
