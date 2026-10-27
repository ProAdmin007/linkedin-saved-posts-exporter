# Security Policy

## Supported versions

Only the latest release of LinkedIn Saved Posts Exporter receives security fixes.

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Instead, report it privately via
[**Security → Report a vulnerability**](https://github.com/ProAdmin007/linkedin-saved-posts-exporter/security/advisories/new).

Please include a description, steps to reproduce and the affected version. You can expect a first response within a week.

## How this project is secured

- **Minimal permissions:** only `activeTab` and `scripting`; no host permissions, background worker or cookies.
- **No network access:** the extension makes no external requests and loads no remote code.
- **SBOM:** a CycloneDX Software Bill of Materials is kept in [`sbom.cdx.json`](sbom.cdx.json) and attached to every release.
- **Automated scans** on every push, pull request and weekly ([workflow](.github/workflows/security.yml)):
  - **CodeQL** static analysis (`security-extended` queries)
  - **Grype** vulnerability scan of the SBOM
  - **Privacy check** ([`scripts/security-check.mjs`](scripts/security-check.mjs)) that fails the build on extra permissions, network calls, `eval` or remote scripts
- **Dependabot** keeps the GitHub Actions used by the workflow up to date.
