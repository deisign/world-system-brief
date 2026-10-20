// WSB editorial chart contract: source-backed data, locale, source and presentation.
export const WSB_CHART_THEME=Object.freeze({series:["#A2362A","#46697A"],ink:"#232523",muted:"#55534e",grid:"#CFC4B3",surface:"#F3EBDD",font:"IBM Plex Mono, monospace"});
export function buildEditorialComparison({record,lang="en"}){
 if(!record?.id||!record?.url||!record?.claim)throw new Error("Chart requires source record");
 const oil=Number(record.claim.match(/([\d.]+)% of US Gulf of Mexico oil output/)?.[1]);
 const gas=Number(record.claim.match(/([\d.]+)% of gas output/)?.[1]);
 if(!Number.isFinite(oil)||!Number.isFinite(gas))throw new Error("Chart metrics missing from source claim");
 const ua=lang==="ua";
 return {id:"WSB-0011-GULF-SHUTINS",source:{id:record.id,name:record.source,url:record.url},observationDate:"2026-10-07",unit:"percent",scale:[0,30],metrics:[{key:"oil",label:ua?"Нафта":"Oil",value:oil,color:WSB_CHART_THEME.series[0]},{key:"gas",label:ua?"Газ":"Gas",value:gas,color:WSB_CHART_THEME.series[1]}],spread:Math.round((oil-gas)*100)/100};
}
export function formatEditorialNumber(value,lang){return new Intl.NumberFormat(lang==="ua"?"uk-UA":"en-US",{minimumFractionDigits:2,maximumFractionDigits:2}).format(value)}
