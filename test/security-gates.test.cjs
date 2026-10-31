const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { checkAudit } = require('../scripts/check-audit.cjs');
const policy = require('../.github/security/audit-exceptions.json');
const now = Date.parse('2026-10-31T00:00:00Z');
const lock = {packages:{'node_modules/minimatch':{dev:true}}};
const moderate = () => ({metadata:{vulnerabilities:{total:1}}, vulnerabilities:{minimatch:{
  severity:'moderate', nodes:['node_modules/minimatch'], via:[{url:policy.advisory,severity:'moderate'}]
}}});

test('SCA accepts only the reviewed, unexpired development advisory', () => {
  assert.equal(checkAudit(moderate(),lock,policy,now),1);
  assert.equal(checkAudit({metadata:{vulnerabilities:{total:0}},vulnerabilities:{}},lock,policy,now),0);
});

test('SCA blocks High/Critical, new advisories, runtime paths, expiry and registry failure', () => {
  for (const severity of ['high','critical','low']) {
    const report=moderate();report.vulnerabilities.minimatch.severity=severity;
    assert.throws(()=>checkAudit(report,lock,policy,now));
  }
  const report=moderate();report.vulnerabilities.minimatch.via[0].url='https://example.invalid/unreviewed';
  assert.throws(()=>checkAudit(report,lock,policy,now));
  assert.throws(()=>checkAudit(moderate(),{packages:{'node_modules/minimatch':{}}},policy,now));
  assert.throws(()=>checkAudit(moderate(),lock,policy,Date.parse('2026-12-01T00:00:00Z')));
  assert.throws(()=>checkAudit({error:{code:'ENETUNREACH'}},lock,policy,now));
});

test('CodeQL gate rejects findings, failed extraction, missing and malformed reports', t => {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'json-csharp-sarif-'));
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  const run=()=>spawnSync(process.execPath,['scripts/check-sarif.cjs',directory],{encoding:'utf8'}).status;
  assert.notEqual(run(),0);
  const sarif = run => JSON.stringify({version:'2.1.0',runs:[{tool:{driver:{name:'CodeQL'}},...run}]});
  for (const report of ['{', JSON.stringify({runs:[]}), sarif({}), sarif({invocations:[{executionSuccessful:false}],results:[]}), sarif({results:[{ruleId:'test/security',message:{text:'Finding'}}]})]) {
    fs.writeFileSync(path.join(directory,'test.sarif'),report);assert.notEqual(run(),0);
  }
  fs.writeFileSync(path.join(directory,'test.sarif'),sarif({results:[]}));
  assert.equal(run(),0);
});

test('release preflight blocks forks, PRs, tags, wrong versions, unprotected/stale main and API failures', t => {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'json-csharp-release-'));
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  const preload=path.join(directory,'preload.cjs');
  // The fixture has no network access and never requests a real credential.
  fs.writeFileSync(preload,'global.fetch=async()=>({ok:process.env.TEST_HTTP_OK!=="false",json:async()=>JSON.parse(process.env.TEST_BRANCH_RESPONSE)});');
  const env={...process.env,GITHUB_REPOSITORY:'wodsonluiz/json-to-csharp',GITHUB_REF:'refs/heads/main',GITHUB_EVENT_NAME:'workflow_dispatch',AUTHORIZED_VERSION:require('../package.json').version,GITHUB_SHA:'approved-commit',GH_TOKEN:'',TEST_BRANCH_RESPONSE:JSON.stringify({protected:true,commit:{sha:'approved-commit'}})};
  const run=overrides=>spawnSync(process.execPath,['--require',preload,'scripts/check-release.cjs'],{env:{...env,...overrides},encoding:'utf8'}).status;
  assert.equal(run({}),0);
  for (const overrides of [
    {GITHUB_REPOSITORY:'untrusted/fork'}, {GITHUB_REF:'refs/tags/v1.0.6'},
    {GITHUB_EVENT_NAME:'pull_request'}, {AUTHORIZED_VERSION:'999.0.0'},
    {TEST_HTTP_OK:'false'}, {TEST_BRANCH_RESPONSE:JSON.stringify({protected:false,commit:{sha:'approved-commit'}})},
    {TEST_BRANCH_RESPONSE:JSON.stringify({protected:true,commit:{sha:'newer-commit'}})}
  ]) assert.notEqual(run(overrides),0);
});
