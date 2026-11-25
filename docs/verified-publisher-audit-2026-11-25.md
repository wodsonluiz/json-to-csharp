# Verified Publisher audit — 2026-11-25

## Outcome and evidence limits

Verified Publisher approval is **not confirmed**. The actual Outlook support
reply received on 2026-11-25 confirms TXT validation and raises extension
maintenance older than six months; it does not identify extension IDs. No email
was sent by this audit. Private correspondence and account identifiers are not
copied into this public report.

The maintenance objection conflicts with the JSON to C# release evidence below.
A stale review or another extension under the publisher is possible, but neither
is established. Do not claim that another extension exists based on plural
wording in the support response.

| Extension / identity | Version / date | Evidence |
| --- | --- | --- |
| wodson.json-to-csharp, main and tag v1.1.0 at audit start | 1.1.0 / 2026-10-31 | [Release](https://github.com/wodsonluiz/json-to-csharp/releases/tag/v1.1.0), commit 15d0d7ae819dac1aa6125e21c21434b6ddc30c5c |
| Same extension, completed Marketplace publish job | 1.1.0 / 2026-10-31 | [OIDC run](https://github.com/wodsonluiz/json-to-csharp/actions/runs/41249094188), publish step succeeded and verify-only step skipped |
| Same extension, patch preparation | 1.1.1 / not published by this audit | [PR #37](https://github.com/wodsonluiz/json-to-csharp/pull/37) |
| Other extensions / publishers associated with the account | Not established | Authenticated Marketplace inventory unavailable |

The release records prior public VSIX byte-for-byte verification, including
SHA-256 f5cea96747e550c83a623e92353845cd3f325e9c3f33450947b23655396b6480.
That is historical recorded evidence, not a fresh download by this audit.
Current Marketplace version/date and the complete publisher inventory could not
be independently retrieved: public fetches failed, the local browser could not
initialize, and the command environment could not resolve external hosts.
Search output was cached and lacked trustworthy current version metadata.
Absence from search is not proof that no other extension exists.

The owner subsequently authorized deleting other associated extensions while
preserving JSON to C#. **No deletion was performed:** no additional identity and
ownership could be confirmed and no authenticated Marketplace control was
available. Deletion authorization remains distinct from evidence of execution.

## Official policy

[Microsoft publishing and verification documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#verify-a-publisher)
requires a minimum six-month extension presence and six-month domain registration,
then TXT validation and Microsoft review of track record, content eligibility,
legitimacy, trust and reputation. The public section does not give a numeric
maximum interval between updates; the maintenance objection is confirmed by the
specific support response. TXT validation alone does not grant the badge.
Domain registration age was not independently verified in this audit.

[Trusted Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publish-with-github-actions-and-trusted-publishing)
uses OIDC for publishing credentials. Successful OIDC publication does not grant
Verified Publisher status.

## Repository audit and remediation

- The initial manifest, main and v1.1.0 tag agree on commit
  15d0d7ae819dac1aa6125e21c21434b6ddc30c5c. Only v1.1.0 was returned in the
  Git tags inventory and release listing.
- Release 1.1.0 adds YAML, C# Record and XML conversion alongside Class:
  [#20](https://github.com/wodsonluiz/json-to-csharp/pull/20),
  [#21](https://github.com/wodsonluiz/json-to-csharp/pull/21),
  [#22](https://github.com/wodsonluiz/json-to-csharp/pull/22),
  [#23](https://github.com/wodsonluiz/json-to-csharp/pull/23),
  [release preparation #24](https://github.com/wodsonluiz/json-to-csharp/pull/24).
  Source and bundled tests substantiate the four commands.
- All eight open issue-list entries at audit start were dependency PRs:
  #25, #26, #27, #30, #33, #34, #35 and #36. No separate open feature/bug issue
  was returned. @types/vscode updates #33 and prior updates have failed checks;
  they must not be merged merely to get newer version numbers.
- [PR #34](https://github.com/wodsonluiz/json-to-csharp/pull/34) was inspected and
  merged normally at 989c1c286b3456f12f56a622f42f6ed6e8f2cd5b.
  Its [post-merge run](https://github.com/wodsonluiz/json-to-csharp/actions/runs/45642448606)
  passed. ESLint 10.15.0 reduces development advisory propagation.
- [PR #37](https://github.com/wodsonluiz/json-to-csharp/pull/37), merged at
  a7b619df0d510ab2308f52ffaa71e71dcec65a8e, fixes real Class
  filesystem errors: remote URI preservation, fail-closed destination stat,
  handled Explorer read failures and saved-document enforcement. Existing DTO
  generation and overwrite cancellation are retained.
- PR #37 also combines the reviewed lockfile changes from #35 and #36:
  typescript-eslint 8.73.0 and pinned vsce 4.1.1, with no major override.
  Manifest and lockfile prepare semantic patch 1.1.1; changelog stays Unreleased
  until actual publication.

## Security evidence

The [1.1.0 publication run](https://github.com/wodsonluiz/json-to-csharp/actions/runs/41249094188)
passed build, tests, full SCA, CodeQL security-extended / SARIF gate, source and
history Gitleaks, packaged Gitleaks, VSIX identity/allowlist and checksum checks.

The [first #37 validation run](https://github.com/wodsonluiz/json-to-csharp/actions/runs/45643119457)
passed 28 Node tests and 4 Python tests, build/lint/SCA and package validation.
Its SCA log reports zero High/Critical and two explicitly reviewed Moderate
development-only entries, reduced from the 11-entry release baseline.
The remaining dependency chain is vsce -> minimatch 10.2.6. The follow-up
revision narrows the exception package list to vsce and minimatch only.
The unchanged exception expires **2026-11-30T23:59:59Z**; expired or new findings
block CI and publication. Passing checks must not be described as zero
vulnerabilities overall.

Main is reported protected and requires the GitHub Actions Quality gate.
The detailed branch administration endpoint returned 403, so the full external
settings were not independently re-audited. No branch/environment protections
were changed. Existing documentation requires a marketplace human reviewer,
main-only deployment and no admin bypass. The workflow still uses only
vsce publish --oidc --packagePath extension.vsix, with id-token:write limited to
the protected publication job; no PAT fallback was added or used.

## Remaining execution steps

1. PR #37 is merged and its [main validation](https://github.com/wodsonluiz/json-to-csharp/actions/runs/45643426226) passed. Validate and merge the follow-up documentation / narrowed-exception PR through normal protections. Incorporation does not establish publication.
2. Dispatch the existing Marketplace Trusted Publishing workflow on current
   main with operation publish and exact version 1.1.1. The available connector
   has no workflow-dispatch action and the browser is unavailable.
3. An authorized human must approve the marketplace environment for that run.
   Do not remove or bypass the required review.
4. Confirm public Marketplace 1.1.1, publication date and VSIX identity against
   the tested artifact. Only then create tag/release v1.1.1 at the published
   commit and change the changelog from Unreleased to its actual release date.
5. Retrieve the complete authenticated publisher inventory. Delete only other
   extensions whose account association is confirmed, under the owner's new
   authorization, preserving wodson.json-to-csharp.
6. Revisit the remaining development advisory before the existing deadline.
7. Send the prepared response manually. Do not claim 1.1.1 publication or badge
   approval until supported by evidence.

## English response ready to send with current evidence

Subject: Re: Verified Publisher Request – Maintenance Evidence for wodson

Dear VS Marketplace Support Team,

Thank you for confirming that the TXT record for publisher wodson has been
validated.

I would like to request a reassessment of the maintenance concern for
wodson.json-to-csharp. Version 1.1.0 was released on October 31, 2026, adding
JSON-to-YAML, C# Record and XML conversion alongside the existing C# Class
command.

Release and changes:
https://github.com/wodsonluiz/json-to-csharp/releases/tag/v1.1.0

The following GitHub Actions run successfully completed the actual Marketplace
publication using OIDC, after build, automated tests, CodeQL, dependency analysis
and secret scanning:
https://github.com/wodsonluiz/json-to-csharp/actions/runs/41249094188

We have also prepared patch 1.1.1 with fixes for remote filesystem handling,
permission-error handling and unsaved JSON files, regression tests and dependency
updates. Its publication has not yet been completed:
https://github.com/wodsonluiz/json-to-csharp/pull/37

Could you please reassess the publisher using the October 31 release evidence
and identify the specific extension IDs and last-update dates that triggered
the more-than-six-month maintenance concern? This will help ensure every
affected listing is addressed.

Publisher: wodson
Validated domain: wodson.net
Marketplace: https://marketplace.visualstudio.com/items?itemName=wodson.json-to-csharp

I understand that Verified Publisher approval is a separate review from OIDC
Trusted Publishing and remains subject to Microsoft's confirmation.

Best regards,
Wodson Correia
