// Guards the privacy promises from the README: minimal permissions, no network
// calls, no remote code and no dynamic code execution.
// Usage: node scripts/security-check.mjs
import {readFileSync} from 'node:fs';

const errors = [];
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const ALLOWED_PERMISSIONS = ['activeTab', 'scripting'];

if (manifest.manifest_version !== 3) errors.push('manifest_version must be 3.');
for (const p of manifest.permissions || [])
  if (!ALLOWED_PERMISSIONS.includes(p)) errors.push(`Unexpected permission: ${p}`);
for (const key of ['host_permissions', 'optional_permissions', 'optional_host_permissions', 'background', 'content_scripts', 'externally_connectable', 'content_security_policy', 'web_accessible_resources'])
  if (manifest[key]) errors.push(`Unexpected manifest key: ${key}`);

const FORBIDDEN = [
  [/\bfetch\s*\(/, 'network request (fetch)'],
  [/\bXMLHttpRequest\b/, 'network request (XMLHttpRequest)'],
  [/\bWebSocket\b/, 'network connection (WebSocket)'],
  [/\bEventSource\b/, 'network connection (EventSource)'],
  [/\bsendBeacon\b/, 'network request (sendBeacon)'],
  [/\beval\s*\(/, 'dynamic code execution (eval)'],
  [/\bnew\s+Function\s*\(/, 'dynamic code execution (new Function)'],
  [/\bset(?:Timeout|Interval)\s*\(\s*['"`]/, 'string passed to setTimeout/setInterval'],
  [/\bimportScripts\b|\bimport\s*\(/, 'dynamic script import'],
  [/\bchrome\.cookies\b|\bdocument\.cookie\b/, 'cookie access'],
];
for (const file of ['export.js', 'popup.js']) {
  const src = readFileSync(file, 'utf8');
  for (const [re, what] of FORBIDDEN) if (re.test(src)) errors.push(`${file}: ${what}`);
}

const html = readFileSync('popup.html', 'utf8');
for (const m of html.matchAll(/<script[^>]*\bsrc=["']([^"']+)["']/gi))
  if (/^(?:https?:)?\/\//i.test(m[1])) errors.push(`popup.html: remote script ${m[1]}`);

if (errors.length) { console.error('Security check failed:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('Security check passed: minimal permissions, no network calls, no remote or dynamic code.');
