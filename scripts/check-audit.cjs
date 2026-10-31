const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

function checkAudit(report, lock, exception, now = Date.now()) {
  assert.ok(!report.error && report.metadata?.vulnerabilities && report.vulnerabilities,
    'Incomplete audit or registry failure');
  const entries = Object.entries(report.vulnerabilities);
  assert.equal(entries.length, report.metadata.vulnerabilities.total, 'Inconsistent audit report');
  if (!entries.length) return 0;
  assert.ok(Number.isFinite(Date.parse(exception.expires)) && now <= Date.parse(exception.expires),
    'Dependency exception expired or invalid');
  assert.equal(exception.severity, 'moderate');
  const permitted = new Set(exception.packages);
  let advisorySeen = false;
  for (const [name, finding] of entries) {
    assert.equal(finding.severity, 'moderate', `${name}: unaccepted severity (High/Critical always block)`);
    assert.ok(permitted.has(name), `${name}: package not covered by reviewed exception`);
    assert.ok(finding.nodes?.length && finding.nodes.every(node => lock.packages?.[node]?.dev === true),
      `${name}: runtime or unknown dependency cannot use this exception`);
    assert.ok(finding.via?.length, `${name}: missing advisory chain`);
    for (const via of finding.via) {
      if (typeof via === 'string') {
        assert.ok(permitted.has(via) && report.vulnerabilities[via], `${name}: unreviewed advisory chain`);
      } else {
        assert.equal(via.url, exception.advisory, `${name}: new advisory requires review`);
        assert.equal(via.severity, exception.severity, `${name}: advisory severity changed`);
        advisorySeen = true;
      }
    }
  }
  assert.ok(advisorySeen, 'Exception does not match an actual advisory');
  return entries.length;
}

if (require.main === module) {
  try {
    const result = spawnSync('npm', ['audit', '--json'], {
      encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 120000
    });
    assert.ok(!result.error && [0, 1].includes(result.status), 'npm audit did not complete');
    const report = JSON.parse(result.stdout);
    const count = checkAudit(report, require('../package-lock.json'), require('../.github/security/audit-exceptions.json'));
    const output = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'json-to-csharp-npm-audit.json');
    fs.writeFileSync(output, JSON.stringify(report, null, 2));
    console.log(`SCA passed: zero High/Critical; ${count} explicitly reviewed development-only Moderate entries.`);
    if (count) console.log('GHSA-g3hv-75wg-m249 exception expires 2026-11-30; all other findings block.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { checkAudit };
