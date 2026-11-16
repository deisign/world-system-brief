import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('both GitHub Pages release workflows use a Playwright 1.56-supported runner',()=>{
 for(const name of ['validate-release.yml','deploy-pages.yml']){
  const yaml=fs.readFileSync('.github/workflows/'+name,'utf8');
  assert.equal((yaml.match(/runs-on: ubuntu-24\.04/g)||[]).length,2,name);
  assert.ok(!yaml.includes('runs-on: ubuntu-latest'),name);
  assert.match(yaml,/python -m pip install playwright==1\.56\.0/);
  assert.match(yaml,/python -m playwright install --with-deps chromium/);
  assert.match(yaml,/run: python tests\/browser_smoke\.py/);
 }
});
