const dimensions=['flow','dependency','bottleneck','substitutability','leverage','rent','adaptation'];
const flows=new Set(['goods','capital','energy','technology','data','labor']);
const statuses=new Set(['observed_constraint','observed_partial','reported_observation','analyst_assessment','price_signal','proposed_not_commissioned','preliminary_report']);
const substitutes=new Set(['partial_observed','unknown','not_substitution','proposed']);
const kinds=new Set(['issue_claim','retrospective']);
const bilingual=x=>x&&['en','ua'].every(k=>typeof x[k]==='string'&&x[k].trim());
const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const slug=x=>typeof x==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);

/**
 * Validates the reusable, bilingual, evidence-only dependency graph contract.
 * A proof resolver is responsible for checking canonical claims and sources.
 * This function never infers throughput, causality or physical system delta.
 */
export function validateEvidenceGraph({config,registry,resolveProof}){
 if(!config||!['wsb-system-graph-v2-pilot','wsb-system-graph-v2'].includes(config.schema)||!slug(config.id)||!date(config.as_of)||config.mode!=='evidence_graph_not_flow_simulation')throw Error('Invalid graph metadata');
 if(!Array.isArray(registry?.entities)||!Array.isArray(config.nodes)||!Array.isArray(config.edges)||config.nodes.length<2||!config.edges.length)throw Error('Empty dependency topology');
 if(typeof resolveProof!=='function')throw Error('Missing canonical evidence resolver');
 for(const d of dimensions)if(!bilingual(config.dimensions?.[d]))throw Error('Missing Ledger dimension '+d);
 const registered=new Set(registry.entities.map(e=>e.slug)),nodes=new Set(config.nodes);
 if(config.nodes.length!==nodes.size||config.nodes.some(id=>!registered.has(id)))throw Error('Unregistered or duplicate graph node');
 const edgeIds=new Set(),edges=[];
 for(const edge of config.edges){
  if(!edge||!edge.id||edgeIds.has(edge.id)||!nodes.has(edge.from)||!nodes.has(edge.to)||edge.from===edge.to||!edge.type||!flows.has(edge.flow)||!statuses.has(edge.status)||!substitutes.has(edge.substitutability)||edge.physical_delta!==false||!bilingual(edge.explanation))throw Error('Invalid dependency edge '+edge?.id);
  edgeIds.add(edge.id);
  if(!edge.evidence||!kinds.has(edge.evidence.kind))throw Error('Unsupported proof '+edge.id);
  const proof=resolveProof(edge,config.as_of);
  if(!proof||!date(proof.registered_at)||proof.registered_at>config.as_of||!Array.isArray(proof.sources)||!proof.sources.length||proof.sources.some(s=>!s?.id||typeof s.url!=='string'||!s.url.startsWith('https://')||(s.publication_date&&!date(s.publication_date))||(s.publication_date&&s.publication_date>config.as_of))||!Array.isArray(proof.claim_ids))throw Error('Unverifiable resolved proof '+edge.id);
  edges.push({...edge,registered_at:proof.registered_at,claim_ids:proof.claim_ids,sources:proof.sources});
 }
 return {config,registry,edges};
}
export const graphFlowTaxonomy=Object.freeze([...flows]);
export const graphLedgerDimensions=Object.freeze([...dimensions]);
