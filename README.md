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
| Markup | Hand-written HTML5 |
| Styling | Plain CSS: custom properties, grid, flexbox, media queries, light/dark tokens |
| Behaviour | A few lines of vanilla JavaScript, inline: theme bootstrap before paint and `location.replace` on redirect aliases |
| Framework | None |
| Bundler / build step | None |
| Runtime dependencies | None |
| Fonts / analytics / cookies | None |
| Browser storage | `localStorage["media-toolkit-theme"]` only |
| Verification (development only) | Node.js 22, Playwright (Chromium and WebKit), `@axe-core/playwright`, `html-validate` |
| CI / hosting | GitHub Actions plus GitHub Pages |

`public/` is the complete deployed artifact. The test tooling never ships.

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

The hub is plain HTML, CSS, and a tiny inline theme script. It has no framework, no build
step, no runtime dependency, no external font, no analytics, no cookie, and no third-party
request. The only stored value is the theme choice in
`localStorage["media-toolkit-theme"]`.

The hub does not process files and does not embed the apps. Each link opens the tool's own
site, where processing stays on the device.

## Add a future tool

The current tools are separate deployments, reached through local alias pages. To add another
one:

1. Copy an existing alias to `public/<slug>/index.html`. Change the title, canonical URL,
   `location.replace` target, `<noscript>` refresh, and the visible fallback link.
2. Add a card to `nav.tool-grid` in `public/index.html`: an `a.tool-card[href="./<slug>/"]` with
   `aria-labelledby` and `aria-describedby` pointing at its `h2` and short summary.
3. Add the tool to `ALIASES` in `scripts/verify.mjs` (name, marker, route, file, card selector,
   destination). That list drives the link allowlist and the redirect, browser, and no-JS
   checks.
4. Add the route to the `checkHttp` page list and to `recoveryLinks`. Add a matching recovery
   link to `public/404.html`.
5. Run `npm run validate` and `npm test`, then commit the refreshed evidence and captures.
6. Merge to `main`; the Pages workflow deploys `public/`.

A tool hosted inside this repository can live directly under `public/<slug>/` instead. Skip the
alias file and the `ALIASES` checks, but still add the card, the 404 link, and the HTTP checks.

## Layout

```text
public/                         deployed artifact
  index.html                    hub
  styles.css                    tokens, layout, themes
  favicon.svg
  .nojekyll
  image-compressor/index.html   redirect alias
  audio-toolkit/index.html      redirect alias
  404.html                      recovery page
scripts/
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

Open `http://127.0.0.1:4173/tools/`.

```sh
npm test
```

The suite serves `public/` at the production base path and checks links, redirect contracts,
HTTP status codes, Chromium and WebKit layouts, themes, keyboard navigation, the no-JavaScript
fallback, the 404 page, and axe accessibility. Screenshots are written to
`docs/sprint-evidence/sprint-1/captures/`.

## Deployment

The public `ashcx/tools` repository deploys `public/` from `main` through
`.github/workflows/pages.yml`. CI runs `npm test` on pull requests. Deployment requires a
successful workflow run and a live check; local success alone is not deployment evidence.

## Verification

`npm run validate` runs html-validate over the artifact. `npm test` accepts `--only` with any
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
