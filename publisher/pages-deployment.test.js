import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const workflow=fs.readFileSync('.github/workflows/validate-release.yml','utf8');
test('GitHub Pages deploys only after the full release build and browser QA',()=>{
 const validate=workflow.indexOf('name: Validate, test and generate publication');
 const prefix=workflow.indexOf('name: Prepare Pages publication assets and paths');
 const links=workflow.indexOf('name: Check generated site links and asset integrity');
 const browser=workflow.indexOf('name: Browser smoke tests against final prefixed Pages build');
 const capture=workflow.indexOf('name: Capture bilingual editorial screenshots and measured overflow');
 const artifact=workflow.indexOf('name: Upload validated GitHub Pages artifact');
 assert.ok(validate>=0&&validate<prefix&&prefix<links&&links<browser&&browser<capture&&capture<artifact);
 assert.match(workflow,/actions\/upload-pages-artifact@v4/);
 assert.match(workflow,/path: dist/);
});
test('deployer waits for build, deploys only main pushes and uses scoped OIDC permissions',()=>{
 assert.match(workflow,/deploy:\n\s+name: Publish validated WSB to GitHub Pages\n\s+needs: build/);
 assert.equal((workflow.match(/if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/g)||[]).length,2);
 assert.match(workflow,/permissions:\n\s+contents: read\n\s+pages: write\n\s+id-token: write/);
 assert.match(workflow,/environment:\n\s+name: github-pages/);
 assert.match(workflow,/actions\/configure-pages@v5/);
 assert.match(workflow,/actions\/deploy-pages@v4/);
 assert.doesNotMatch(workflow,/enablement: true/);
});
