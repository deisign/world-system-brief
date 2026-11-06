import fs from 'node:fs';
import path from 'node:path';
import {validateDependencyAssessments,dependencyLedgerPage} from './dependency-ledger.js';
import {validateDependencyTransitions} from './dependency-transitions.js';

const root=process.cwd(),out=path.join(root,'dist');
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),'utf8'));
const config=read('knowledge/dependency-assessments.json');
const evolution=read('knowledge/dependency-transitions.json');
const registry=read('knowledge/entities.json');
const engravings=read('visualizations/engravings/manifest.json').engravings;
const dirs=fs.readdirSync(path.join(root,'issues')).filter(x=>/^\d{4}$/.test(x)).sort();
const bundles=dirs.map(d=>({
 state:read('issues/'+d+'/state.json'),
 claims:fs.existsSync(path.join(root,'issues',d,'claims.json'))?read('issues/'+d+'/claims.json'):{claims:[]},
 evidence:read('issues/'+d+'/evidence.json')
}));
validateDependencyAssessments(config,registry,bundles);
validateDependencyTransitions(evolution,config,bundles);
const slugs=[...new Set(config.records.map(x=>x.entity_slug))];
for(const lang of ['en','ua']){
 const write=(destination,html)=>{const file=path.join(out,lang,'ledger','dependencies',...destination,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html)};
 write([],dependencyLedgerPage({lang,records:config.records,registry,bundles,engravings,transitions:evolution.records}));
 for(const slug of slugs)write([slug],dependencyLedgerPage({lang,records:config.records,registry,bundles,slug,engravings,transitions:evolution.records}));
}
console.log('Dependency Ledger: '+config.records.length+' dated assessments; '+slugs.length+' entity histories; bilingual publication OK');
