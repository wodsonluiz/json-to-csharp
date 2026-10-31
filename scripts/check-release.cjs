const assert = require('node:assert/strict');
const metadata = require('../package.json');
(async () => {
  assert.equal(process.env.GITHUB_REPOSITORY,'wodsonluiz/json-to-csharp');
  assert.equal(process.env.GITHUB_REF,'refs/heads/main');
  assert.equal(process.env.GITHUB_EVENT_NAME,'workflow_dispatch');
  assert.equal(process.env.AUTHORIZED_VERSION,metadata.version,'Authorized version must match the manifest exactly');
  assert.match(metadata.version,/^\d+\.\d+\.\d+$/,'Only stable versions are authorized');
  const response = await fetch('https://api.github.com/repos/wodsonluiz/json-to-csharp/branches/main', {
    headers: {Authorization:`Bearer ${process.env.GH_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}
  });
  assert.ok(response.ok,'Could not verify main branch');
  const branch = await response.json();
  assert.equal(branch.protected,true,'Publishing requires protected main');
  assert.equal(branch.commit.sha,process.env.GITHUB_SHA,'Ref advanced; rerun checks on current main');
  console.log('Protected main and exact authorized version verified');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
