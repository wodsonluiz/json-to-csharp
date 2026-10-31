# Publishing wodson.json-to-csharp

## Trust and authorization

Marketplace publisher `wodson` trusts only owner `wodsonluiz`, repository
`json-to-csharp`, workflow filename `publish.yml`, environment `marketplace`.
The GitHub environment permits only the main branch, requires owner approval and
forbids administrator bypass. Protected main requires PRs, current Quality gate
from GitHub Actions and resolved conversations; independent review is temporarily
waived by the owner for this single-maintainer repository (see SECURITY.md).

## Simulate safely

1. Open Actions → Marketplace Trusted Publishing → Run workflow.
2. Select main, operation `verify-oidc`, and the exact current manifest version
   (`1.0.6`). This runs all checks and builds/scans the VSIX with its SHA-256.
3. After all gates pass, approve the marketplace environment for this run.
4. The job verifies protected/current main, exact version, full dependency audit
   and artifact checksum, then exchanges a GitHub OIDC token for a short-lived
   Marketplace credential using pinned vsce. No credential is logged or persisted.
5. Check the successful verification step and Marketplace policy Last used. The
   publish step must be skipped; this proves federation, not package publication.

## Publish the next legitimate release

There is no functional change in this security finalization. Version **1.0.6**
remains current; real publication is intentionally pending a legitimate release.
Do not bump a version merely to produce publishing evidence.

When there is a real user-facing feature/fix, prepare its normal changelog and
version change in a PR. After required checks and merge, run the same workflow
on main with operation `publish` and the exact new manifest version. Review and
approve the marketplace environment. The job publishes the VSIX produced by the
same protected run with `vsce publish --oidc --packagePath extension.vsix`.

`--oidc` does not fall back to a PAT if token acquisition/exchange fails. No
workflow reads a PAT secret, uses `--pat`, or enables publication for PR/fork/tag
code. Do not use `--skip-duplicate`, continue-on-error or disabled scans to make a
release appear successful. Fix a failed gate and rerun on current protected main.

Record the release run URL, published version and Marketplace Version History
once publication succeeds. Only then revoke obsolete PATs whose issuer/account
is under authorized administration and remove unused GitHub secrets. Neither
GitHub Actions secrets nor marketplace environment secrets were present in the
initial migration inventory; this does not prove that no PAT exists elsewhere.

## Evidence and maintenance

- Baseline OIDC exchange (no publication): https://github.com/wodsonluiz/json-to-csharp/actions/runs/41207373912
- Current finalization results: [diagnostic and evidence](devsecops-finalization.md).
- Before 2026-11-30, revisit the scoped minimatch exception. All new findings and
  expired exceptions block the audit; do not silently extend or broaden it.
- Keep Action/scanner/tool pins current through reviewed dependency PRs.
