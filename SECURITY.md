# Secure Marketplace releases

Publishing is limited to `wodsonluiz/json-to-csharp`, `.github/workflows/publish.yml`,
protected `main`, and the `marketplace` GitHub environment. Configure the Marketplace
Trusted Publishing policy with those exact repository, workflow and environment
values. The environment must allow **only the main branch**, require an authorized
human reviewer, and disallow administrator bypass. Do not enable publishing until
these external protections are in place.

The `Marketplace Trusted Publishing` manual workflow defaults to `verify-oidc`.
Enter the exact current package version; this operation verifies the same OIDC
exchange used by pinned vsce 4.1.0, discards the temporary credential without
logging it, and does not publish. `publish` sends the VSIX built and scanned in the
same run using `vsce publish --oidc --packagePath extension.vsix`. There is no PAT
fallback and no automatic version bump. Existing Marketplace versions cannot be
republished; authorize a new version through a reviewed PR for the next real
release. Do not create a version solely to test authentication.

Every release reruns compilation, conversion tests (including the bundled command),
full dependency audit with an expiring advisory-specific exception, CodeQL
security-extended, full fetched-history and source
secret scanning, VSIX identity/content allowlist validation and packaged secret
scanning. Any High/Critical dependency advisory, unreviewed or expired Moderate advisory,
or any CodeQL/secret finding blocks
publication. Scanner/download failures also block it. SARIF is retained as an
artifact; uploading a security alert alone is not treated as a passing security gate.
Actions are pinned to commit SHAs and repository settings enforce full-SHA pins;
Gitleaks is pinned to a version and SHA-256. All external fork contributors require
workflow approval. Default token access is read-only and Actions cannot create or
approve PRs.
Only the publishing job can request an OIDC token. Only SAST receives
`security-events: read`; the reusable caller grants the necessary permission
ceiling. SARIF and optional CodeQL database uploads to the Code Scanning service
are explicitly disabled, while local analysis, a strict SARIF gate and retained
SARIF evidence remain mandatory. This avoids granting security-events:write. PR workflows have no publishing
credentials and never use `pull_request_target`. Dependency installation uses the
lockfile and disables lifecycle scripts. Review Dependabot updates normally.

Branch protection requires a PR, the up-to-date `Quality gate` check, resolution
of conversations and no admin bypass. On 2026-10-31 the repository owner explicitly
authorized temporarily waiving the independent PR approval because this project
has no collaborators. Zero independent approvals are currently required; restore
one approval with stale-approval dismissal when an eligible reviewer is available.
This exception does not waive any automated security check or the human approval
of the `marketplace` environment. The owner remains the release approver.

## Dependency audit baseline (2026-10-31)

The initial audit found 6 High, 18 Moderate and 1 Low advisories. Compatible lockfile
updates and removal of the unused Electron/Mocha test runner eliminated all High
and Critical advisories. Node's built-in runner now exercises conversion and the
bundled extension. Extension source behavior and version 1.0.6 are unchanged.
The production dependency audit reports zero vulnerabilities.

After the reviewed ESLint 10 migration, the full audit retains 11 Moderate entries
from one advisory:
[GHSA-g3hv-75wg-m249 / CVE-2026-118764](https://github.com/advisories/GHSA-g3hv-75wg-m249).
It concerns glob-pattern amplification in minimatch below 11.0.1. ESLint 10,
typescript-eslint 8 and vsce 4.1.0 accept minimatch 10; no patched version fits
those contracts. Do not force a major override or the unrelated downgrades
suggested by npm audit. ESLint 10.13.0 was reviewed separately in PR #17: it is
supported by typescript-eslint 8.72.1 and the configured Node runtime, and all
build, lint, tests, security and packaging checks passed. The obsolete ESLint 9
line and its deprecation notice are removed. The remaining exception is unchanged
in severity, advisory, development-only restriction and deadline.

Exception owner: **wodsonluiz**. Expiry: **2026-11-30 23:59:59 UTC**. Scope: only the
exact advisory, Moderate severity, named packages and lockfile paths marked
`dev: true`, in `.github/security/audit-exceptions.json`. `npm run audit:security`
performs the complete online audit and enforces this scope and deadline in CI and
immediately before OIDC use. It rejects registry failures, missing reports, all
High/Critical, new advisories and any affected runtime dependency. There are no
High/Critical exceptions and no broad advisory suppression.

Residual risk is build-time CPU/memory exhaustion from malicious glob patterns.
Release patterns/configuration come from protected main; extension JSON is not
passed to these tool glob matchers. PR jobs have read-only access, no environment
or OIDC identity, and bounded timeouts. Production audit remains clean. The VSIX
has only the bundled runtime, manifest, documentation, license and icon. An
eligible maintainer must revisit upstream releases before the deadline; expired
exceptions block all builds/releases. Dependabot tracks fixes. The Node 22 type
definitions were updated compatibly; runtime dependencies and extension version
remain unchanged.

Negative gate tests cover rejected severities/advisories, runtime paths, exception
expiry, registry errors, SARIF findings/failure/invalid output, release identity,
stale/unprotected main, and VSIX additions, replacements, duplicates/corruption.
A SHA-256 checksum accompanies the built VSIX and is verified again before
package scanning and before either OIDC verification or publication.

## Credentials and migration evidence

Keep existing PAT secrets until an actual authorized OIDC publication succeeds.
A successful exchange alone proves federation, not package publication. After the
first real OIDC release succeeds and Marketplace confirms the version, revoke the
obsolete PAT at its issuer and remove its GitHub secret. Never print credentials
or OIDC tokens in logs. Report newly discovered credentials privately and revoke
them; a clean Gitleaks scan is evidence for its ruleset, not a guarantee that every
possible secret format can be detected.

Current diagnostic, correction plan and validation evidence: `docs/devsecops-finalization.md`.
Release procedure and deferred real-publication evidence: `docs/publishing.md`.

Official references:
- https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publish-with-github-actions-and-trusted-publishing
- https://github.com/microsoft/vscode-vsce#trusted-publishing

