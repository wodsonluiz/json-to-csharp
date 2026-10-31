// CodeQL upload alone does not fail a workflow when it finds vulnerabilities.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const directory = process.argv[2];
const files = fs.readdirSync(directory).filter(file => file.endsWith('.sarif'));
assert.ok(files.length, 'CodeQL produced no SARIF');
let findings = 0;
for (const file of files) {
  const report = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
  assert.equal(report.version, '2.1.0', 'Unexpected SARIF format');
  assert.ok(Array.isArray(report.runs) && report.runs.length, 'Missing CodeQL runs');
  for (const run of report.runs) {
    assert.equal(run.tool?.driver?.name, 'CodeQL', 'Unexpected SAST producer');
    assert.ok(Array.isArray(run.results), 'Missing SARIF results');
    assert.ok(!run.invocations?.some(invocation => invocation.executionSuccessful === false), 'CodeQL execution failed');
    for (const result of run.results || []) {
      // Block every reported finding, including suppressed findings; no implicit exceptions.
      console.error(`${result.ruleId}: ${result.message.text}`);
      findings++;
    }
  }
}
assert.equal(findings, 0, 'CodeQL security findings block publishing');
console.log('CodeQL security gate passed');
