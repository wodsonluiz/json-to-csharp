# DevSecOps finalization — 2026-10-31

## Diagnosis and correction plan (stage 1)

Baseline: PR #12, merged commit `1bef711175619e2a5bac656dbb76c53f9a7d3de9`.
The OIDC verification run was successful:
https://github.com/wodsonluiz/json-to-csharp/actions/runs/41207373912

The full online npm audit reports 12 Moderate entries but one underlying advisory:
GHSA-g3hv-75wg-m249 (CVE-2026-118764), minimatch glob-pattern amplification causing
CPU/memory exhaustion. All affected paths are development/packaging dependencies.
The extension runtime has no audit findings. ESLint 9 accepts minimatch 3; vsce
4.1.0 and typescript-eslint accept minimatch 10. The advisory affects versions
below 11.0.1. No compatible patched backport exists in those ranges at diagnosis.
`npm audit fix --force` proposes unrelated downgrades; a forced major override
would violate parent dependency contracts and will not be used.

The CodeQL logs show that analysis and the local SARIF gate succeeded. Feature
flag/API queries failed because the job had only contents:read. Separately,
`upload: false` disabled SARIF upload but did not disable the independent database
upload (default true), causing retries and a permission-denied error annotation.

Corrections, in order:
1. Apply only compatible dependency updates. If the advisory remains, make its
   development-only exception explicit, scoped to the exact advisory and affected
   package names, owned and time-limited. Block all High/Critical and any new or
   expired/unreviewed findings; never use a broad npm audit exception.
2. Grant security-events:read only to SAST, with the required permission ceiling
   on the reusable workflow caller. Explicitly disable optional database upload,
   retain security-extended queries, local SARIF verification and retained report.
3. Fix existing brace-style lint warnings without changing behavior; make lint
   warnings fail CI. Add meaningful negative checks for security gates, and verify
   VSIX content, corruption/tampering and transfer integrity.
4. Confirm branch, environment, Actions and Marketplace policy restrictions. Run
   PR checks, merge without bypass, follow main CI, then run verify-oidc on the
   unchanged version with the required environment approval.
5. No functional feature/fix is part of this plan. Keep version 1.0.6; document real
   publication as deferred to the next legitimate release. Do not revoke any PAT
   based solely on a successful token exchange.

Sources:
- https://github.com/advisories/GHSA-g3hv-75wg-m249
- https://github.com/github/codeql-action/blob/9b3254085494b55a0f7c4c2b3d2d52cc712ce370/analyze/action.yml
- https://github.com/microsoft/vscode-vsce#trusted-publishing

## Compatible corrections and validation (stages 2–3)

Compatible update inspection confirms that the latest allowed ESLint/vsce/
typescript-eslint still require vulnerable minimatch 3/10. Tested the allowed
updates and retained runtime dependencies to avoid unrelated conversion changes.
Updated only Node 22 type definitions (22.19.13 → 22.20.5). The twelve Moderate
entries are now governed by a machine-enforced, development-only exception for
GHSA-g3hv-75wg-m249, owned by wodsonluiz and expiring on 2026-11-30 UTC. Any new
advisory, runtime finding, changed severity or expired exception blocks SCA.

SAST receives only security-events:read plus contents:read; the reusable caller
sets that permission ceiling. `upload: never` and `upload-database: false` remove
unused service uploads without disabling queries, SARIF inspection or retained
evidence. Brace-only source formatting removes five lint warnings and CI now
fails on any new lint warning. ESLint 9's upstream deprecation is retained as a
documented tool-migration limitation; no warning is suppressed.

Added negative tests for audit policy, SARIF rejection, release identity/branch/
version restrictions and malicious/corrupt VSIX content. The package allowlist now
rejects case collisions and checks archive CRCs. VSIX SHA-256 is checked after
transfer in both package scanning and the protected OIDC job.

Local results and final GitHub execution links are recorded in the finalization PR.
The final release remains a security-only maintenance change; no actual Marketplace
publication or PAT revocation is justified before the next legitimate release.

Repository controls rechecked in authenticated GitHub settings: main still requires
PRs, the current Quality gate from GitHub Actions, conversation resolution and no
admin bypass. The owner-authorized single-maintainer review exception remains.
The marketplace environment still permits exactly main and zero tags, requires
wodsonluiz approval, and disallows bypass. Default workflow token permissions are
read-only; Actions cannot create/approve PRs. Enabled repository enforcement of
full-commit Action pins and approval for all external fork contributors.

Local validation: 9 Node tests plus 4 Python VSIX security tests passed; lint had
zero warnings; build, package allowlist/CRC checks, actionlint and Gitleaks history,
working-tree and packaged scans passed. Full online SCA passed with 0 High/Critical
and the 12 scoped Moderate entries; production audit had zero vulnerabilities.

The first finalization PR run proved the fail-closed SAST gate by rejecting a new
insecure-temporary-file finding in the audit report writer. Corrected the actual
writer to use a private mkdtemp directory outside CI and exclusive, mode-0600 file
creation in all environments. No SAST suppression or bypass was introduced. The
permission/database-upload errors from the baseline were absent in that run.

## Follow-up dependency review — PR #17

Reviewed ESLint 10.13.0 separately after finalization: typescript-eslint 8.72.1
explicitly supports ESLint 10, and Node 24 CI satisfies the engine requirement.
The unmodified dependency PR passed all five security/quality jobs:
https://github.com/wodsonluiz/json-to-csharp/actions/runs/41209596860

This removes the deprecated ESLint 9 line and the @eslint/eslintrc dependency.
The full audit improves from 12 to 11 Moderate entries; the same single minimatch
advisory remains confined to development tooling. Removed the now-unused
@eslint/eslintrc name from the exception; advisory, severity, owner, expiry and
fail-closed checks are unchanged. Runtime dependencies and version 1.0.6 stay
unchanged. Final updated PR checks and post-merge CI are linked on PR #17.


## Subsequent feature release preparation — 1.1.0

This historical security-only diagnosis above is preserved. The later authorized
feature work supplies the legitimate release deferred by that diagnosis:

- YAML: PR #20, merge `81fe3807dfc68bdc0b3b16d87ea1d9148ffa9cf3`, checks https://github.com/wodsonluiz/json-to-csharp/actions/runs/41236256223.
- C# Record: PR #21, merge `bd345e7bce971706be48e5a07f48f862aa8d6594`, checks https://github.com/wodsonluiz/json-to-csharp/actions/runs/41236602935.
- XML: issue #19 and PR #22, merge `84067a8abd86c97c0b78d8c2d2d587c0cb57e3b7`, checks https://github.com/wodsonluiz/json-to-csharp/actions/runs/41237074065.
- English README and real VS Code GIF: PR #23, merge `35576d8f5efab099de96a2289413b812b837955c`, checks https://github.com/wodsonluiz/json-to-csharp/actions/runs/41242270778.

Every PR passed build/tests/SCA/VSIX, CodeQL, source/history Gitleaks, packaged
Gitleaks and Quality gate before sequential merge. There are now 27 automated
tests and exactly nine allowed VSIX entries. Production audit remains clean;
zero High/Critical and the same 11 scoped development-only Moderate entries.

Authenticated settings were rechecked during release preparation: main still
requires a current Quality gate from GitHub Actions, PRs, conversation resolution
and no admin bypass; no policy was changed. The marketplace environment permits
only main (zero tags), requires wodsonluiz review, disables administrator bypass,
and has no secrets. The Marketplace trust policy is active for exact owner
wodsonluiz/repository json-to-csharp/workflow publish.yml/environment marketplace.

The version/changelog PR prepares 1.1.0 without creating a tag. Real publication,
its exact commit/artifact digest, public Marketplace confirmation and subsequent
GitHub Release must be recorded on the release PR after the approved OIDC run.
No PAT is revoked merely because release preparation or token exchange passed.
