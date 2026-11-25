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
   (`1.1.0` for the prepared feature release). This runs all checks and builds/scans
   the VSIX with its SHA-256.
3. After all gates pass, approve the marketplace environment for this run.
4. The job verifies protected/current main, exact version, full dependency audit
   and artifact checksum, then exchanges a GitHub OIDC token for a short-lived
   Marketplace credential using pinned vsce. No credential is logged or persisted.
5. Check the successful verification step and Marketplace policy Last used. The
   publish step must be skipped; this proves federation, not package publication.

## Publish the next legitimate release

Version **1.1.0** is a legitimate minor release: YAML (#20), C# Record (#21),
and XML (#22), plus the English README and real demonstration (#23). Marketplace
history was checked before preparation: the latest published version was 1.0.6,
with no 1.1.0 and no existing GitHub releases or repository tags. Do not bump a version
merely to produce publishing evidence.

Merge the version/changelog PR only after all required checks pass. Run the
workflow on current main with operation `publish` and exact version `1.1.0`.
After every validation job passes, an authorized human must approve the
`marketplace` environment for this specific release. The job publishes the VSIX
produced by that same protected run with
`vsce publish --oidc --packagePath extension.vsix`.

The run verifies the package SHA-256 after artifact transfer. Record its exact
main commit, artifact digest and run URL. Confirm 1.1.0 appears in the public
Marketplace and verify the published manifest/bundle against the tested artifact.
Only then create GitHub Release `v1.1.0` targeting that exact commit. Until the
publication job succeeds and Marketplace confirmation is recorded, publication
and obsolete-PAT revocation remain pending; a prepared version is not evidence
of deployment. Do not create the release/tag early or move an existing tag.

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

## Published patch 1.1.1 — 2026-11-25

[Protected OIDC run 45645566010](https://github.com/wodsonluiz/json-to-csharp/actions/runs/45645566010)
published `wodson.json-to-csharp v1.1.1` at 15:30 UTC (12:30 America/Sao_Paulo).
The actual publish step succeeded and verify-only authentication was skipped.
Build, 32 automated tests, SCA, CodeQL, source/history/package secret scanning,
VSIX identity/content validation and checksum checks passed in the same run.

Published source commit: `abecc64509d40e197df88bd30a7936b4752065c6`.
Create GitHub tag/release `v1.1.1` at that exact commit, not current main if it has
advanced. Marketplace publication and GitHub Release creation are separate:
the existing workflow does not create a GitHub Release, and the README release
badge follows GitHub Releases. The latest GitHub Release was still v1.1.0 when
this publication record was prepared. No tag/release creation is claimed here.

The GitHub integration available in this session cannot create tags/releases;
the browser is unavailable and the command environment cannot resolve GitHub.
Use the prepared GitHub release form to finish creating v1.1.1 without republishing
the already published Marketplace version. Do not replace the automatic release
badge with a hardcoded version or create another extension version for this task.
