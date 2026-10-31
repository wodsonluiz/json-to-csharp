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
full dependency audit, CodeQL security-extended, full fetched-history and source
secret scanning, VSIX identity/content allowlist validation and packaged secret
scanning. Any High/Critical dependency advisory or any CodeQL/secret finding blocks
publication. Scanner/download failures also block it. SARIF is retained as an
artifact; uploading a security alert alone is not treated as a passing security gate.
Actions are pinned to commit SHAs; Gitleaks is pinned to a version and SHA-256.
Only the publishing job can request an OIDC token. PR workflows have no publishing
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

The full audit retains 12 Moderate entries propagated from `minimatch <11.0.1`
through ESLint, typescript-eslint and vsce. These are development/packaging tools;
the runtime VSIX contains only the bundled extension, manifest, documentation,
license and icon. Do not force an incompatible minimatch major override. Track
upstream fixes through Dependabot and re-audit before each release. There are no
High/Critical exceptions. Revisit this baseline when dependencies change.

## Credentials and migration evidence

Keep existing PAT secrets until an actual authorized OIDC publication succeeds.
A successful exchange alone proves federation, not package publication. After the
first real OIDC release succeeds and Marketplace confirms the version, revoke the
obsolete PAT at its issuer and remove its GitHub secret. Never print credentials
or OIDC tokens in logs. Report newly discovered credentials privately and revoke
them; a clean Gitleaks scan is evidence for its ruleset, not a guarantee that every
possible secret format can be detected.

Official references:
- https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publish-with-github-actions-and-trusted-publishing
- https://github.com/microsoft/vscode-vsce#trusted-publishing

