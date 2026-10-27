<p align="center">
  <img src="icons/icon128.png" alt="LinkedIn Saved Posts Exporter logo" width="96" height="96">
</p>

<h1 align="center">LinkedIn Saved Posts Exporter</h1>

<p align="center">
  <strong>Export your saved LinkedIn posts to CSV or JSON — free, open source, 100% local.</strong><br>
  A lightweight Chrome extension (Manifest V3) that backs up your LinkedIn bookmarks without servers, logins or tracking.
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.5.0-2ad4ae">
  <img alt="Chrome Manifest V3" src="https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white">
  <img alt="No external requests" src="https://img.shields.io/badge/privacy-100%25%20local-success">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue">
  <a href="https://github.com/ProAdmin007/linkedin-saved-posts-exporter/actions/workflows/security.yml"><img alt="Security scan" src="https://github.com/ProAdmin007/linkedin-saved-posts-exporter/actions/workflows/security.yml/badge.svg"></a>
  <a href="sbom.cdx.json"><img alt="SBOM: CycloneDX" src="https://img.shields.io/badge/SBOM-CycloneDX%201.6-6f42c1"></a>
  <a href="https://ko-fi.com/proadmin007"><img alt="Buy me a coffee on Ko-fi" src="https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white"></a>
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-installation">Installation</a> ·
  <a href="#-usage">Usage</a> ·
  <a href="#-export-format">Export format</a> ·
  <a href="#-privacy--security">Privacy</a> ·
  <a href="#-faq">FAQ</a> ·
  <a href="#-nederlands">Nederlands</a>
</p>

---

## Why this extension?

LinkedIn lets you **save posts** for later, but offers no way to **download, search, back up or export** them. After a few months your *Saved items* list becomes an unsearchable pile of hundreds of posts.

**LinkedIn Saved Posts Exporter** reads the posts on your own [Saved posts page](https://www.linkedin.com/my-items/saved-posts/) and exports them to **CSV (Excel / Google Sheets)** or **JSON**, so you can:

- 📚 Build a personal knowledge base in Notion, Obsidian, Airtable or Excel
- 🔍 Search and filter your saved LinkedIn content
- 💾 Back up your LinkedIn bookmarks before they disappear
- 🤖 Feed your saved posts into your own analysis or AI tools
- 📋 Turn saved posts into tasks on your **Kanban, Scrum or Trello board** (see below)

## 🤖 Tip: from saved posts to a Kanban / Scrum / Trello board with AI

Saved posts often contain ideas, tools and to-dos you never get back to. The **JSON export** is ideal to feed into an AI tool such as **Claude, ChatGPT, Gemini or Copilot** and turn it into actionable cards for your **Kanban board, Scrum board, Trello, Jira, Asana, Notion or Planner**.

1. Export your saved posts as **JSON**.
2. Upload the file to your AI tool of choice.
3. Use a prompt like:

```text
Here is a JSON export of my saved LinkedIn posts. Group them by theme and turn
each actionable idea into a card for my Kanban board with: title, short
description, label/theme, priority (high/medium/low) and the original post link
(post_url). Return the result as a table / CSV I can import into Trello.
```

Because each post includes its `post_url`, every card links straight back to the original LinkedIn post.

## ✨ Features

- **One-click export** of saved LinkedIn posts to **CSV** or **JSON**
- **Resumable scan** — hit your limit, raise it and click *Continue collecting*; already collected posts are kept
- **Configurable limit** — collect 1 to 10,000 posts (default 250)
- **Auto-scroll** with configurable scroll rounds and automatic stop when no new posts load
- **Expand long posts** — automatically clicks *see more* to capture the full text
- **Quality check** — shows how many posts have a post link and how many may be truncated
- **Deduplication** by post URL / URN
- **Excel-friendly CSV** — UTF-8 with BOM, semicolon-separated, protected against CSV/formula injection
- **Built-in diagnostics** to troubleshoot when LinkedIn changes its layout
- **Privacy first** — no servers, no analytics, no cookies permission, no account credentials

## 📦 Installation

The extension is not (yet) in the Chrome Web Store. Install it manually in under a minute:

1. **Download** this repository: click **Code → Download ZIP** and unzip it (or `git clone https://github.com/ProAdmin007/linkedin-saved-posts-exporter.git`).
2. Open **`chrome://extensions`** in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the unzipped folder.
5. Pin the extension to your toolbar.

Works in Google Chrome and other Chromium-based browsers such as **Microsoft Edge**, **Brave**, **Opera** and **Vivaldi**.

## 🚀 Usage

1. Go to **[linkedin.com/my-items/saved-posts/](https://www.linkedin.com/my-items/saved-posts/)** while logged in.
2. Click the extension icon → **Open export panel**.
3. Set the **maximum number of posts** and click **Start collecting**.
4. When finished, click **Export CSV** or **Export JSON**.

> 💡 **Tip:** Try 10–20 posts first. Reaching the limit does **not** mean all saved posts were found — raise the maximum and click **Continue collecting**.

> ⚠️ Closing the panel discards the collected (unexported) posts. Export first.

The interface is in English; the export works with LinkedIn in both English and Dutch.

## 📄 Export format

Each exported post contains the following fields:

| Field | Description |
|---|---|
| `author` | Author name (person or company) |
| `profile_url` | Author profile URL |
| `text` | Full post text |
| `post_url` | Direct link to the post |
| `image_url` | Image URL (if any) |
| `date_display` | Relative date as shown by LinkedIn (e.g. `3w`, `2mo`) |
| `urn` | LinkedIn activity / share URN |
| `text_possibly_truncated` | `true` if the text may be truncated |
| `exported_at` | Export timestamp (ISO 8601) |

Files are saved as `linkedin-saved-posts-YYYY-MM-DD.csv` / `.json`.

## 🔒 Privacy & security

- **Runs entirely in your browser.** The extension makes **no network requests** and has no backend.
- **Minimal permissions:** only `activeTab` and `scripting`. No background service worker, no `cookies`, no host permissions.
- **No private APIs.** It only reads the page you already have open (DOM); it does not call LinkedIn's GraphQL/Voyager endpoints.
- **Readable source.** All logic lives in [`export.js`](export.js) (~200 lines) — audit it yourself.

### SBOM & security scanning

- **SBOM:** a [CycloneDX 1.6](https://cyclonedx.org/) Software Bill of Materials is included as [`sbom.cdx.json`](sbom.cdx.json), with SHA-256 hashes of every shipped file. The extension has **zero third-party dependencies**. Regenerate it with `node scripts/generate-sbom.mjs`.
- **Automated security scans** run on every push, pull request and weekly via [GitHub Actions](.github/workflows/security.yml):
  - **CodeQL** static code analysis (`security-extended`)
  - **Grype** vulnerability scan of the SBOM
  - **Privacy check** ([`scripts/security-check.mjs`](scripts/security-check.mjs)) that fails the build if the extension ever requests extra permissions, makes network calls, uses `eval` or loads remote code
- Found a vulnerability? See [SECURITY.md](SECURITY.md) to report it privately.

## ⚠️ Limitations

> 🐞 **Something stopped working?** LinkedIn regularly changes its website, which can break the export. Please [**report it as an issue**](https://github.com/ProAdmin007/linkedin-saved-posts-exporter/issues/new) with a short description and, if possible, the output of the *Diagnostics* button (remove personal information first).

- Reads only the HTML of the current page; LinkedIn may change its markup at any time.
- Publication date and post link can occasionally be missing. *Possibly truncated* is a heuristic.
- The date is LinkedIn's relative label (e.g. `1w`), not an absolute date.
- Use responsibly and in line with LinkedIn's User Agreement — this tool is meant for exporting **your own** saved items.

## ❓ FAQ

**How do I export my saved posts from LinkedIn?**
LinkedIn has no built-in export for saved posts. Install this extension, open your Saved posts page and click *Export CSV* or *Export JSON*.

**Can I open the export in Excel or Google Sheets?**
Yes. The CSV is UTF-8 with BOM and semicolon-separated, so Excel opens it with correct accents and emoji.

**Is my LinkedIn data sent anywhere?**
No. Everything stays on your computer. The file is generated in your browser and downloaded directly.

**Does it work with Microsoft Edge or Brave?**
Yes, any Chromium-based browser that supports Manifest V3 extensions.

**It found 0 posts — what now?**
Scroll manually a bit, then click *Diagnostics* in the panel. Please [open an issue](https://github.com/ProAdmin007/linkedin-saved-posts-exporter/issues) with the diagnostic output (remove personal information first).

## 🗒️ Changelog

**1.5.0 — English interface**
- Extension UI translated to English.
- Export fields renamed to English (`author`, `text`, `post_url`, …) and files are now named `linkedin-saved-posts-YYYY-MM-DD`.
- Still works with LinkedIn in both English and Dutch.

**1.4.1 — metadata fix**
- Author names are cleaned up with targeted labels for people and companies.
- Relative time is detected per card line, without inventing a missing time.

**1.4.0**
- Resumable collection, configurable post limit and quality overview.

## ☕ Support

Does this extension save you time? You can support further development by buying me a coffee:

<a href="https://ko-fi.com/proadmin007"><img alt="Buy me a coffee on Ko-fi" src="https://ko-fi.com/img/githubbutton_sm.svg"></a>

## 🤝 Contributing

Issues and pull requests are welcome — especially fixes for LinkedIn layout changes and translations of the panel UI.

## 📜 License

[MIT](LICENSE) — free to use, modify and share.

---

## 🇳🇱 Nederlands

**LinkedIn opgeslagen berichten exporteren naar CSV of JSON** — gratis, open source en volledig lokaal.

Met deze Chrome-extensie exporteer je je **opgeslagen LinkedIn-berichten** (bewaarde bijdragen) naar een CSV-bestand voor Excel of naar JSON. Er worden geen gegevens verstuurd: alles gebeurt in je eigen browser.

### Installatie
1. Download deze repository (**Code → Download ZIP**) en pak hem uit.
2. Open `chrome://extensions` en schakel **Ontwikkelaarsmodus** in.
3. Kies **Uitgepakte extensie laden** en selecteer de map.

### Gebruik
1. Open [linkedin.com/my-items/saved-posts/](https://www.linkedin.com/my-items/saved-posts/).
2. Klik op het extensie-icoon → **Open export panel**.
3. Kies het maximale aantal berichten (1–10.000, standaard 250) en klik op **Start collecting**.
4. Is de limiet bereikt? Verhoog hem en klik op **Continue collecting**.
5. Klik op **Export CSV** of **Export JSON**.

- De interface is in het Engels en werkt met LinkedIn in het Nederlands en Engels.
- **Expand long posts** opent automatisch 'meer weergeven'-knoppen.
- **New collection** wist (na bevestiging) alleen de verzamelde gegevens in het paneel.
- Het paneel sluiten betekent dat niet-geëxporteerde gegevens verloren gaan — exporteer eerst.

### Tip: vul je Kanban-, Scrum- of Trellobord met AI
De **JSON-export** is handig om in een AI-tool (zoals Claude, ChatGPT, Gemini of Copilot) te voeren. Zo maak je van je opgeslagen berichten makkelijk kaarten voor je **Kanbanbord, Scrumbord of Trellobord** (of Jira, Asana, Notion, Planner). Bijvoorbeeld met deze prompt:

```text
Hier is een JSON-export van mijn opgeslagen LinkedIn-berichten. Groepeer ze per
thema en maak van elk bruikbaar idee een kaart voor mijn Kanbanbord met: titel,
korte omschrijving, label/thema, prioriteit (hoog/midden/laag) en de link naar
het originele bericht (post_url). Geef het resultaat als tabel/CSV die ik in
Trello kan importeren.
```

### Werkt er iets niet meer?
LinkedIn past regelmatig zijn website aan, waardoor de export kan stoppen met werken. [**Meld het als een issue**](https://github.com/ProAdmin007/linkedin-saved-posts-exporter/issues/new), met een korte omschrijving en indien mogelijk de uitvoer van de knop *Diagnostics* (haal persoonlijke gegevens eerst weg).

### Privacy
Alleen de rechten `activeTab` en `scripting`. Geen achtergrondservice, geen cookies-permissie, geen externe server en geen aanroepen van private LinkedIn-API's.

---

<sub>Keywords: LinkedIn saved posts export, export LinkedIn saved items, download LinkedIn bookmarks, LinkedIn saved posts to CSV, LinkedIn saved posts to Excel, LinkedIn saved posts JSON, LinkedIn posts to Trello, Kanban board, Scrum board, AI, backup LinkedIn saved posts, Chrome extension, LinkedIn opgeslagen berichten exporteren.</sub>

<sub>Not affiliated with, endorsed or sponsored by LinkedIn Corporation. LinkedIn is a trademark of LinkedIn Corporation.</sub>
