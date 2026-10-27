// Generates a deterministic CycloneDX 1.6 SBOM (sbom.cdx.json) for the extension.
// The extension has no third-party dependencies, so the SBOM lists the extension
// itself plus every shipped file with its SHA-256 hash.
// Usage: node scripts/generate-sbom.mjs [--check]
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const REPO = 'https://github.com/ProAdmin007/linkedin-saved-posts-exporter';
const FILES = ['manifest.json', 'popup.html', 'popup.js', 'export.js',
  'icons/icon16.png', 'icons/icon32.png', 'icons/icon48.png', 'icons/icon128.png'];

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
// Line endings are pinned to LF in .gitattributes, so hashes match on every OS.
const sha256 = f => createHash('sha256').update(readFileSync(f)).digest('hex');
const purl = `pkg:github/ProAdmin007/linkedin-saved-posts-exporter@${manifest.version}`;

const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  version: 1,
  metadata: {
    tools: {components: [{type: 'application', name: 'generate-sbom.mjs', version: '1.0.0'}]},
    component: {
      type: 'application',
      'bom-ref': purl,
      name: 'linkedin-saved-posts-exporter',
      version: manifest.version,
      description: manifest.description,
      licenses: [{license: {id: 'MIT'}}],
      purl,
      externalReferences: [
        {type: 'vcs', url: REPO},
        {type: 'issue-tracker', url: `${REPO}/issues`},
      ],
      properties: [
        {name: 'chrome:manifest_version', value: String(manifest.manifest_version)},
        {name: 'chrome:permissions', value: (manifest.permissions || []).join(',')},
        {name: 'chrome:host_permissions', value: (manifest.host_permissions || []).join(',')},
      ],
    },
  },
  components: FILES.map(f => ({
    type: 'file',
    'bom-ref': `file:${f}`,
    name: f,
    hashes: [{alg: 'SHA-256', content: sha256(f)}],
  })),
  dependencies: [{ref: purl, dependsOn: []}],
};

const out = JSON.stringify(sbom, null, 2) + '\n';
if (process.argv.includes('--check')) {
  const current = existsSync('sbom.cdx.json') ? readFileSync('sbom.cdx.json', 'utf8').replace(/\r\n/g, '\n') : '';
  if (current !== out) { console.error('sbom.cdx.json is outdated. Run: node scripts/generate-sbom.mjs'); process.exit(1); }
  console.log('sbom.cdx.json is up to date.');
} else {
  writeFileSync('sbom.cdx.json', out);
  console.log(`Wrote sbom.cdx.json (${FILES.length} files, version ${manifest.version}).`);
}
