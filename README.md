# [Media Toolkit](https://ashcx.github.io/tools/)

A small static hub for two browser-local tools:

- [Image Compressor](https://ashcx.github.io/image-compressor-v1/) compresses, converts, and
  resizes images in batches.
- [Audio Toolkit](https://ashcx.github.io/audio-toolkit-v1/) processes audio and video
  soundtracks with one ordered batch recipe.

Live site: <https://ashcx.github.io/tools/> (deployment follows the merge).

The GitHub repository must be named `tools` so GitHub Pages serves it at `/tools/`. The local
folder is named `media-toolkit`; the brand is Media Toolkit. The name difference is intentional.

Status: Sprint 1 implementation, local verification, independent review, and the PR are
complete. CI passes. Deployment and live checks follow the merge. See
[PR #1](https://github.com/ashcx/tools/pull/1).

## Stack

The hub is deliberately minimal:

| Layer | Choice |
| --- | --- |
| Markup | Hand-written HTML5 templates, filled at build time |
| Styling | Plain CSS: custom properties, grid, flexbox, media queries, light/dark tokens |
| Behaviour | A few lines of vanilla JavaScript, inline: theme bootstrap before paint and `location.replace` on redirect aliases |
| Framework | None |
| Bundler | None: `scripts/build.mjs` is a plain Node script that fills three HTML templates |
| Config | `sites.yml`: the hub copy and the tool list |
| Runtime dependencies | None |
| Fonts / analytics / cookies | None |
| Browser storage | `localStorage["media-toolkit-theme"]` only |
| Verification (development only) | Node.js 22, `js-yaml` (build only), Playwright (Chromium and WebKit), `@axe-core/playwright`, `html-validate` |
| CI / hosting | GitHub Actions plus GitHub Pages |

`public/` is the deployed artifact. It is generated from `sites.yml` and `src/` and is not
committed; CI builds it. The test tooling never ships.

The two linked apps are separate Vite + TypeScript + Preact applications. They are not part of
the hub build and are not modified by it.

## What this site does

The hub has two tool links. Each link routes through a local alias:

| Hub path | Destination |
| --- | --- |
| `/tools/image-compressor/` | `https://ashcx.github.io/image-compressor-v1/` |
| `/tools/audio-toolkit/` | `https://ashcx.github.io/audio-toolkit-v1/` |

The page shows the brand mark, the name, one descriptor line, and the two links with short
summaries. It has no footer, fact lists, format lists, or privacy statements.

Unknown paths return a 404 page with links to both tools. The alias pages use
`location.replace` and a `<noscript>` meta refresh, so they work with or without JavaScript.

The hub ships plain HTML, CSS, and a tiny inline theme script. The build only joins templates
and config into static files, so the deployed page has no framework, no runtime dependency, no
external font, no analytics, no cookie, and no third-party request. The only stored value is the theme choice in
`localStorage["media-toolkit-theme"]`.

The hub does not process files and does not embed the apps. Each link opens the tool's own
site, where processing stays on the device.

## Add a tool

Add one entry under `tools` in `sites.yml`:

```yaml
  - name: Video Trimmer
    slug: video-trimmer
    summary: Cut and re-encode video clips
    url: https://ashcx.github.io/video-trimmer-v1/
```

That is the whole change. `npm run build` regenerates the hub card, the
`/tools/video-trimmer/` alias page, the 404 recovery link, and the verification
allowlist from the same file. Update `hub.lede` when the sentence counts tools.

| Field | Meaning |
| --- | --- |
| `name` | Card heading, alias page heading, and link text |
| `slug` | Route segment and directory name: `/tools/<slug>/` |
| `summary` | One short line under the card heading |
| `url` | Destination the alias redirects to |

Rules the build enforces: `name`, `slug`, `summary`, and `url` are required;
`slug` is lowercase letters, digits, and single hyphens, and must be unique;
`url` is an absolute `https:` URL. Every tool is a separate deployment, reached
through its alias page.

The same file holds the hub copy:

| Field | Meaning |
| --- | --- |
| `hub.title` | Page title and brand heading |
| `hub.lede` | The descriptor line under the brand |
| `hub.description` | Optional meta description; defaults to `hub.lede` |

## Layout

```text
sites.yml                       hub copy and tool list: the only file to edit
src/                            inputs to the build
  index.html                    hub template
  alias.html                    redirect alias template
  404.html                      recovery page template
  styles.css                    tokens, layout, themes
  favicon.svg
  .nojekyll
public/                         generated artifact, not committed
scripts/
  build.mjs                     reads sites.yml, fills src/, writes public/
  sites.mjs                     loads and validates sites.yml
  serve.mjs                     local server at /tools/
  verify.mjs                    link, redirect, browser, axe, and capture checks
docs/sprint-evidence/sprint-1/  coverage, checks, captures, interrogate
Todo/                           roadmap, orchestration, Scrum policy, sprint plan
```

## Development and verification

These commands run the local server and the full verification suite. Requires Node.js 22+ and
npm.

```sh
npm ci
npm run dev
```

`npm run dev` builds `public/` and then serves it. Open
`http://127.0.0.1:4173/tools/`. Run `npm run build` alone to check the output
without starting the server.

```sh
npm test
```

`npm test` builds first, then verifies. It fails on an invalid `sites.yml`
before any browser starts.

The suite serves `public/` at the production base path and checks links, redirect contracts,
HTTP status codes, Chromium and WebKit layouts, themes, keyboard navigation, the no-JavaScript
fallback, the 404 page, and axe accessibility. Screenshots are written to
`docs/sprint-evidence/sprint-1/captures/`.

## Deployment

The public `ashcx/tools` repository builds `public/` from `main` and deploys it
through `.github/workflows/pages.yml`. CI runs `npm test` on pull requests. Deployment requires a
successful workflow run and a live check; local success alone is not deployment evidence.

## Verification

`npm run validate` builds and then runs html-validate over the artifact. `npm test` accepts `--only` with any
of `links`, `redirects`, `html`, `http`, `browser`, `axe` and `captures`, and `--public <dir>` to
run the same checks against another copy of the artifact.

## Planning

Read [TODO.md](TODO.md), [the orchestration plan](Todo/orchestration-plan.md),
[the Scrum policy](Todo/redesign-scrum-plan.md), and
[Sprint 1](Todo/sprint-1-tool-router.md).

## Related repositories

- [image-compressor-v1](https://github.com/ashcx/image-compressor-v1)
- [audio-toolkit-v1](https://github.com/ashcx/audio-toolkit-v1)

The Audio Toolkit header already links to `https://ashcx.github.io/tools/`, so once this hub is
deployed that return link works without an audio code change. The audio plan still contains an
older `/media-toolkit/` reference; aligning that sibling document is optional and separate from
this repository. See [TODO.md](TODO.md).
