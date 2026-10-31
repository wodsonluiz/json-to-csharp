// Uses the same exchange implementation as the exact, lockfile-pinned vsce CLI.
// Never prints or persists the temporary Marketplace credential.
const { getOIDCCredential } = require('@vscode/vsce/out/oidc');
(async () => {
  const credential = await getOIDCCredential('wodson');
  if (typeof credential !== 'string' || !credential) throw new Error('Marketplace did not issue a credential');
  console.log('Marketplace OIDC exchange succeeded. No extension version was published.');
})().catch(() => { console.error('Marketplace OIDC exchange failed; publishing remains blocked.'); process.exitCode=1; });
