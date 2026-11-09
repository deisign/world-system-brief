const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const T={en:{head:'ENTITIES IN THIS EDITION',intro:'Follow an observed object to its dated biography, dependency assessment and published mechanism study.',bio:'ENTITY HISTORY',ledger:'DEPENDENCY DOSSIER',visual:'MECHANISM VISUALIZATION',back:'BACK TO ENTITY',study:'VIEW MECHANISM'},ua:{head:'СУТНОСТІ ВИПУСКУ',intro:'Від спостережуваної сутності — до датованої біографії, оцінки залежності та опублікованої візуалізації механізму.',bio:'ІСТОРІЯ СУТНОСТІ',ledger:'ДОСЬЄ ЗАЛЕЖНОСТІ',visual:'ВІЗУАЛІЗАЦІЯ МЕХАНІЗМУ',back:'ДО СУТНОСТІ',study:'ДО МЕХАНІЗМУ'}};
const STUDIES={hormuz:{route:'visualizations/oil-network/',en:'Gulf oil-flow network',ua:'Мережа нафтових потоків Затоки'},'gulf-oil-flow':{route:'visualizations/oil-network/',en:'Gulf oil-flow network',ua:'Мережа нафтових потоків Затоки'},'east-west-pipeline':{route:'visualizations/oil-network/',en:'Oil bypass network',ua:'Мережа обхідних нафтопроводів'},'refined-products-bottleneck':{route:'visualizations/0040/',en:'Crude and product export comparison',ua:'Порівняння експорту нафти й нафтопродуктів'},'uk-critical-minerals-resilience':{route:'engravings/rare-earth-separation-study-01/',en:'Rare-earth separation engraving',ua:'Гравюра розділення рідкісноземельних елементів'}};
const href=(lang,route)=>'/'+lang+'/'+route;
const names=(registry,lang)=>new Map(registry.entities.map(e=>[e.slug,e.labels?.[lang]||e.slug]));
const valid=(lang,registry)=>{if(!T[lang]||!Array.isArray(registry?.entities))throw Error('Invalid reader journey configuration');};
function study(lang,slug,studySlugs){const item=studySlugs.has(slug)?STUDIES[slug]:null;return item?{url:href(lang,item.route),name:item[lang]}:null;}
export function readerIssueEntities({lang,state,loc,registry,ledgerSlugs=new Set(),studySlugs=new Set(Object.keys(STUDIES))}){
 valid(lang,registry);
 if(!state?.date||!Array.isArray(state.objects)||!(ledgerSlugs instanceof Set)||!(studySlugs instanceof Set))throw Error('Invalid issue objects');
 const labels=names(registry,lang),seen=new Set(),rows=[];
 for(const o of state.objects){
  if(!labels.has(o.id)||seen.has(o.id))continue;
  seen.add(o.id);
  const bio=href(lang,'entity/'+encodeURIComponent(o.id)+'/'),linked=study(lang,o.id,studySlugs);
  const links=['<a href="'+bio+'">'+T[lang].bio+'</a>'];
  if(ledgerSlugs.has(o.id))links.push('<a href="'+href(lang,'ledger/dependencies/'+encodeURIComponent(o.id)+'/')+'">'+T[lang].ledger+'</a>');
  if(linked)links.push('<a href="'+linked.url+'">'+T[lang].study+'</a>');
  rows.push('<li class="reader-entity"><span class="reader-entity-title"><a href="'+bio+'">'+E(labels.get(o.id))+'</a></span><span class="reader-entity-state">'+E(loc?.states?.[o.current_state]||o.current_state||'—')+'</span><span class="reader-entity-actions">'+links.join(' · ')+'</span></li>');
 }
 if(!rows.length)return '';
 return '<section class="reader-journey" id="issue-entities"><h2>'+T[lang].head+'</h2><p>'+T[lang].intro+'</p><ul>'+rows.join('')+'</ul></section>';
}
export function readerEntityVisualization({lang,slug,registry,studySlugs=new Set(Object.keys(STUDIES))}){
 valid(lang,registry);
 const linked=study(lang,slug,studySlugs);
 return linked?'<section class="reader-mechanism"><h2>'+T[lang].visual+'</h2><p><a href="'+linked.url+'">'+E(linked.name)+'</a></p><p>'+T[lang].intro+'</p></section>':'';
}
export function readerLedgerReturn({lang,slug,registry,studySlugs=new Set(Object.keys(STUDIES))}){
 valid(lang,registry);
 if(!names(registry,lang).has(slug))throw Error('Unknown entity '+slug);
 const linked=study(lang,slug,studySlugs);
 return '<nav class="reader-ledger-bridge" aria-label="'+T[lang].bio+'"><a href="'+href(lang,'entity/'+encodeURIComponent(slug)+'/')+'">'+T[lang].back+'</a>'+(linked?' · <a href="'+linked.url+'">'+T[lang].study+'</a>':'')+'</nav>';
}
