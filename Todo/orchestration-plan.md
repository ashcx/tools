# Media Toolkit orchestration plan

## 1. Purpose and authority

This plan coordinates the build of a small static hub at `https://ashcx.github.io/tools/`.
The hub routes visitors to two already-deployed tools:

- Image Compressor: `https://ashcx.github.io/image-compressor-v1/`
- Audio Toolkit: `https://ashcx.github.io/audio-toolkit-v1/`

Authority order:

1. The user's current request. On 2026-11-01 the user selected `/tools/` as the hub URL.
2. This repository's [Scrum policy](redesign-scrum-plan.md).
3. The sprint file: [Sprint 1](sprint-1-tool-router.md).
4. The two apps' READMEs and the Audio Toolkit plan for product facts and navigation intent.

The current request is planning-only. The plan does not authorize implementation, repository
creation, or deployment.

## 2. Analysis that fixes the architecture

### 2.1 Both apps are independent static deployments

| Fact | Image Compressor | Audio Toolkit |
| --- | --- | --- |
| Repository | `ashcx/image-compressor-v1` | `ashcx/audio-toolkit-v1` |
| Live URL | `https://ashcx.github.io/image-compressor-v1/` (HTTP 200 on 2026-10-31) | `https://ashcx.github.io/audio-toolkit-v1/` (HTTP 200 on 2026-10-31) |
| Stack | Vite 8, TypeScript, Preact 10, Web Workers, WebAssembly | Vite 8, TypeScript, Preact 11, Web Workers, WebAssembly |
| Vite base | `/image-compressor-v1/` | `/audio-toolkit-v1/` |
| Deploy | GitHub Pages, push to `main` | GitHub Pages, push to `main` |
| Hub link today | None | Header links to `https://ashcx.github.io/tools/` |

Both apps emit absolute asset URLs under their project base path. They are separate sites with
separate build pipelines, workers, and large vendor assets. Rebuilding them into a hub would be
a cross-repo integration project, not a router page.

### 2.2 The Audio Toolkit plan fixes the product shape

`audio-toolkit-v1/todo/audio-toolkit-plan.md` section 2 records these decisions:

- Use Media Toolkit as the overall brand.
- Build a hub with two large tool cards.
- Link the hub to `https://ashcx.github.io/image-compressor-v1/`.
- Plan the audio app at `https://ashcx.github.io/audio-toolkit-v1/`.
- Keep the hub, image app, and audio app as separately deployable sites.
- Implement the hub and image app in their own authorized workspaces.

The plan originally named `https://ashcx.github.io/media-toolkit/`. The user's 2026-11-01
request supersedes that URL with `https://ashcx.github.io/tools/`. The brand, two-card shape,
and separate-deployment decisions still hold.

### 2.3 The navigation inconsistency is resolved by the URL choice

The Audio Toolkit header points to `https://ashcx.github.io/tools/`:

- `src/main.tsx` line 150.
- `scripts/workspace-check.mjs` line 18.
- `scripts/privacy-check.mjs` line 11.

Its release-acceptance note also names `/tools/`. Its plan still contains an older
`/media-toolkit/` reference. Before the user's decision, the repository disagreed with itself.

The 2026-11-01 choice resolves the code side: `/tools/` is the canonical hub, so the Audio
Toolkit header and tests are already correct. No audio code, test, or deployment change is
needed. Aligning the audio plan's older `/media-toolkit/` wording is optional sibling
documentation, not a Sprint 1 dependency.

### 2.4 Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Copy both app builds into `/tools/image/` and `/tools/audio/` | Requires changing both apps' Vite bases, worker URLs, and wasm paths; adds a cross-repo build and re-verification of two large apps. Not simple. |
| Embed either app in an iframe | Breaks the apps' history, focus, downloads, file pickers, and storage behavior; adds a hosting dependency without benefit. |
| Reverse proxy or redirect service | Adds a second platform or server for a two-link page. |
| SPA client router with history fallback | GitHub Pages cannot rewrite unknown paths. A client router would need a 404 fallback and adds JavaScript for no user benefit. |
| Rebuild the hub in Vite + Preact to match the apps | Two cards and a theme toggle do not need a framework. A build step adds dependency and failure surface. |

## 3. Product contract

### 3.1 Routes

| Route | Behavior |
| --- | --- |
| `/tools/` | Hub landing page. Two large tool cards. Works without JavaScript. |
| `/tools/image-compressor/` | Static redirect to `https://ashcx.github.io/image-compressor-v1/`. |
| `/tools/audio-toolkit/` | Static redirect to `https://ashcx.github.io/audio-toolkit-v1/`. |
| Any other path under `/tools/` | Custom 404 page with links to both tools and the hub home. |

The two tool cards link to the local alias routes, not directly to the external apps. The
router owns the entry points; the alias pages own the canonical destinations. This keeps one
place to change a destination and makes the router testable end to end. `location.replace`
keeps the alias out of browser history.

### 3.2 Redirect contract

Each alias page contains:

- `<title>` naming the destination.
- `<meta name="robots" content="noindex">`.
- `<link rel="canonical" href="https://ashcx.github.io/<app>/">`.
- Inline `location.replace("https://ashcx.github.io/<app>/")`.
- `<noscript><meta http-equiv="refresh" content="0; url=https://ashcx.github.io/<app>/"></noscript>`.
- A visible fallback link to the destination.
- A relative link back to the hub home.

No alias page fetches a local asset, so a redirect cannot be delayed by a missing file.

### 3.3 Content contract

Copy is frozen from the app READMEs at execution time and recorded with the inspected revision.

Image Compressor card:

- Name: Image Compressor.
- One line: compress, convert, and resize images in batches.
- Formats: JPEG, PNG, WebP, AVIF, HEIC.
- Privacy: images are processed in the browser and are not uploaded.
- Honest caveat: AVIF and HEIC can be slower; estimates are guidance, not a guarantee.

Audio Toolkit card:

- Name: Audio Toolkit.
- One line: process a batch of audio or video soundtracks with one ordered recipe.
- Capabilities: extract, trim, gain, normalize, channels, sample rate, voice/music isolation,
  speech cleanup.
- Formats: MP3, AAC/M4A, WAV, FLAC, Opus/OGG.
- Privacy: media is processed locally; files are not uploaded.
- Honest caveat: isolation can take minutes and results vary; Firefox is unsupported.

The hub must not claim that either app is server-backed, unlimited, or faster than measured.
Do not reuse marketing superlatives from the app READMEs.

### 3.4 Privacy contract

- The hub is static. No cookies, analytics, tracking pixels, external fonts, or third-party
  scripts.
- The only browser storage is `localStorage["media-toolkit-theme"]` for the theme choice. The
  key uses the brand name, not the URL.
- The initial page load makes no external requests. Opening a card intentionally navigates to
  the app's origin.
- The hub does not process files.

## 4. File layout and stack

### 4.1 Stack

| Layer | Choice |
| --- | --- |
| Markup | Hand-written HTML5 |
| Styling | Plain CSS: custom properties, grid, flexbox, media queries, light/dark tokens |
| Behaviour | A few lines of vanilla JavaScript, inline: theme bootstrap before paint and `location.replace` on aliases |
| Framework | None |
| Bundler / build step | None |
| Runtime dependencies | None |
| Fonts / analytics / cookies | None |
| Browser storage | `localStorage["media-toolkit-theme"]` only |
| Verification (development only) | Node.js 22, Playwright (Chromium and WebKit), `@axe-core/playwright`, `html-validate` |
| CI / hosting | GitHub Actions plus GitHub Pages |

`public/` is the complete deployed artifact. Test tooling never ships. The two linked apps are
separate Vite + TypeScript + Preact applications; they are not part of this build.

Why not Preact: the page has two cards, a theme control, and two redirect pages. There is no
state or data flow that justifies a framework or bundler. A static artifact has fewer failure
modes and can be served directly by Pages.

### 4.2 Layout

```
media-toolkit/                      # local folder; the GitHub repository is ashcx/tools
├── public/                         # Pages uploads this directory as the site root
│   ├── index.html                  # hub
│   ├── styles.css                  # tokens, layout, responsive, themes
│   ├── favicon.svg
│   ├── .nojekyll                   # disable Jekyll processing
│   ├── image-compressor/index.html # redirect alias
│   ├── audio-toolkit/index.html    # redirect alias
│   └── 404.html                    # recovery page
├── scripts/
│   ├── serve.mjs                   # local server emulating the /tools/ base path
│   └── verify.mjs                  # link, redirect, browser, accessibility, capture checks
├── docs/sprint-evidence/sprint-1/  # coverage, checks, captures, live results, interrogate
├── .github/workflows/
│   ├── ci.yml                      # npm ci + npm test on PRs
│   └── pages.yml                   # test + deploy public/ on main
├── package.json                    # dev-only tooling; no runtime dependencies
├── package-lock.json
├── .gitignore
├── README.md
├── TODO.md
└── Todo/
    ├── orchestration-plan.md
    ├── redesign-scrum-plan.md
    └── sprint-1-tool-router.md
```

Design choices:

- The GitHub repository must be named `tools` so the project site is served at `/tools/`. The
  local folder stays `media-toolkit`; the brand stays Media Toolkit.
- `public/` is the complete deployed artifact. No build transforms it.
- Assets use relative URLs (`./styles.css`) so the site also works under a different project
  path during local inspection.
- `404.html` uses inline CSS and `<base href="/tools/">` because GitHub Pages serves it for
  unknown paths at any depth; relative asset paths would resolve against the missing path.
- The local server mounts `public/` at `/tools/` and serves `404.html` with status 404 for
  unknown paths, matching Pages. Every check runs against the production path shape.

## 5. Visual direction

Use the Image Compressor's warm neutral tokens as the parent brand. The Audio Toolkit already
describes its shell as image-compressor-style, so this keeps the suite coherent.

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#f5f4f1` | `#131417` |
| Surface | `#ffffff` | `#1c1e23` |
| Surface subtle | `#faf9f7` | `#22252b` |
| Border | `#e4e1db` | `#333840` |
| Border strong | `#d5d1c9` | `#454c57` |
| Text | `#242321` | `#f1f2f4` |
| Muted | `#78756e` | `#9aa1ac` |
| Accent | `#262522` | `#f1f2f4` |
| Accent contrast | `#ffffff` | `#16181c` |
| Success | `#34715a` | `#5fbd94` |
| Bad | `#b64d47` | `#e0796f` |

- Font: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
  sans-serif. No webfont request.
- Radii: 10px controls, 16px panels, 20px cards.
- Max width: 1120px. Page padding: 24px desktop, 16px mobile.
- Tool grid: two columns at 760px and above, one column below.
- Cards: large, equal height, 24px padding, 1px border, subtle shadow. The whole card is one
  anchor; no nested interactive elements. Hover raises the border and moves the card 2px.
- Icons: inline SVG, one per tool, no image files.
- Theme control: compact three-option segmented control (System / Light / Dark) in the header.
  Inline head script applies the saved theme before first paint.
- Footer: privacy sentence and links to the two app repositories plus the hub repository.
- Motion: 150ms color/border/transform transitions; disabled under
  `prefers-reduced-motion: reduce`.

The hub should look like the same family as the tools without copying their application chrome.

## 6. Task order and contract freezes

Execute in this order. Each step ends in a checkable artifact.

1. **Freeze content and URLs.** Read both app READMEs and the Audio Toolkit plan. Record the
   inspected revisions, the canonical URLs, and the card copy in the sprint evidence. No
   implementation before this freeze.
2. **Freeze routes.** Write the route table and redirect contract into the sprint evidence.
   Confirm both external apps return 200. Record that `/tools/` is 404 before the hub deploys,
   which is expected, not a blocker.
3. **Freeze visuals.** Record the token table, breakpoints, and control sizes. Capture the two
   live apps only if needed for visual comparison; do not edit them.
4. **Build the hub.** `public/index.html`, `public/styles.css`, `favicon.svg`, `.nojekyll`.
5. **Build the router aliases and 404.** Three small HTML files. No shared runtime.
6. **Build the test lever.** `scripts/serve.mjs` and `scripts/verify.mjs`, with a negative
   control that proves the checker fails on a broken alias.
7. **Run local verification.** Link checks, HTML validation, Playwright checks in Chromium and
   WebKit, axe scans, captures. Fix and rerun.
8. **Add CI and Pages workflows.** Confirm the deploy uploads `public/`.
9. **Create the repository and deploy.** `gh repo create ashcx/tools`, enable Pages with GitHub
   Actions, push `main`, observe the workflow.
10. **Live verification.** Status codes, browser journey, console/network checks, captures,
    deployed commit SHA.
11. **Interrogate.** Two read-only `ds-juror` reviewers at `#max`. Reproduce findings, fix,
    rerun affected checks, record the verdict.
12. **Open the sprint PR and record links.** No audio code change is needed. Optional sibling
    documentation alignment stays out of this PR.

## 7. Verification strategy

### 7.1 Deterministic checks (`npm test`)

- **Local link check.** Parse every `public/**/*.html`; every relative `href`/`src` resolves to
  a file; every external URL is an expected allowlist entry.
- **Redirect contract check.** Each alias has the right canonical URL, `noindex`, JS target,
  noscript meta-refresh target, visible fallback, and home link.
- **HTML validation.** `html-validate` over the deployed HTML.
- **Playwright, Chromium and WebKit**
  - Desktop 1440×900 and mobile 390×844; 320px overflow check.
  - Light, dark, and system themes; toggle persistence across reload.
  - Keyboard: skip link, cards, theme control, footer links; visible focus.
  - Alias navigation with JavaScript enabled: intercept the external origin with a stub page
    and assert the final URL. With JavaScript disabled: assert the meta refresh reaches the
    same stubbed URL.
  - Unknown path: HTTP 404, recovery links present and working.
  - Initial load: no requests outside the local origin.
- **Accessibility.** `@axe-core/playwright` on the hub in light and dark; fail on serious or
  critical violations.
- **Captures.** Desktop light, desktop dark, mobile light, mobile dark, 404, and a redirect
  fallback state. Saved under `docs/sprint-evidence/sprint-1/captures/`.
- **Negative control.** A temporary fixture with a wrong alias target must make the checker
  fail. Record the failure, then remove the fixture. This proves the check has teeth.

### 7.2 Live checks after deployment

- `curl -I` for the hub, CSS, both aliases, and an unknown path. Expected 200/200/200/200/404.
- Browser: open the live hub, click each card, confirm the destination app renders and the URL
  is the canonical app URL.
- Browser: directly open each alias, confirm the redirect and the visible fallback.
- Console: no errors. Network: no unexpected third-party requests.
- Record the deployed commit SHA, workflow run URL, timestamp, and exact status codes.

Live checks depend on deployment authorization. Without it, the live-URL gate remains
NOT VERIFIED; local checks cannot substitute.

## 8. CI and deployment

`ci.yml`:

- Trigger: `pull_request` and `workflow_dispatch`.
- Node 22, `npm ci`, `npx playwright install --with-deps chromium webkit`, `npm test`.
- Upload the evidence folder on failure.

`pages.yml`:

- Trigger: push to `main` and `workflow_dispatch`.
- Same test job as `ci.yml`, including the Playwright browser install, then
  `actions/configure-pages`, `actions/upload-pages-artifact` with `path: public`, and
  `actions/deploy-pages`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Concurrency: one Pages deployment, cancel in progress.

Repository setup:

- Create a public `ashcx/tools` repository. The local folder can stay `media-toolkit`; the
  repository name controls the Pages path.
- Enable Pages with `build_type=workflow` before the first deploy.
- Push `main`; observe the workflow. Do not claim green until the run URL and live response are
  observed.

Example setup after the local build and checks pass:

```sh
git init
git add .
git commit -m "Add Media Toolkit hub"
gh repo create ashcx/tools --public --source=. --remote=origin --push
gh api -X POST repos/ashcx/tools/pages -f build_type=workflow
```

If Pages is already enabled, the `gh api` call returns a conflict. Read the current Pages
configuration instead of treating that as a failure. The workflow must be present on the
default branch before the first successful deployment.

## 9. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Repository name does not match `/tools/` | Name the repository `ashcx/tools`. The local folder can stay `media-toolkit`; only the remote name controls the Pages path. Verify the deployed URL before announcing it. |
| GitHub Pages serves the wrong 404 | Verify the custom 404 on the live site immediately after the first deploy. If Pages ignores it, use a root-level `404.html` in the artifact and retest. Do not add an SPA fallback that hides real 404s. |
| Meta refresh and JS double navigation | Use `location.replace` for JS and a `<noscript>` meta refresh for no-JS. Test both paths in Chromium and WebKit. |
| Theme flash before paint | Inline head script sets `data-theme` before CSS loads. Test with saved dark and system dark. |
| Relative asset paths break on 404 | Inline CSS and `<base href="/tools/">` in `404.html`. |
| Content drift as the apps change | Record the inspected README revisions in the sprint evidence. Recheck copy when either app ships a capability change. Do not add a cross-repo build dependency. |
| Sibling docs still name `/media-toolkit/` | Treat the user's 2026-11-01 choice as canonical. Optional doc alignment in `audio-toolkit-v1` is separate; do not edit it from this PR. |
| Deployment permission | `gh` is authenticated as `ashcx`; Pages enablement needs repository admin. Verify before creating the repo. |
| Overbuilding a two-card page | No framework, no build, no runtime dependencies, no analytics, no service worker. The deployed artifact is HTML, CSS, SVG, and a tiny inline theme script. |

## 10. Cross-repo boundary

- The hub PR touches only `ashcx/tools`.
- The image and audio apps are read-only references during Sprint 1.
- No audio code, test, or deployment change is required: its header already targets `/tools/`.
- Optional alignment of the Audio Toolkit plan's older `/media-toolkit/` wording is separate
  sibling documentation. It is listed in `TODO.md` and is not part of the hub PR.
- The hub does not import, build, or vendor either app.

## 11. Evidence convention

All Sprint 1 evidence lives in `docs/sprint-evidence/sprint-1/`:

- `coverage.md` — requirement/acceptance-to-check matrix with VERIFIED, NOT VERIFIED, and
  INCONCLUSIVE states.
- `checks.txt` — exact commands and observed output for local checks.
- `captures/` — real browser screenshots.
- `redirects.json` — alias contract results.
- `accessibility.json` — axe results.
- `live.json` — deployed URL, commit SHA, workflow run, status codes, timestamps.
- `interrogate.md` — reviewer identities, model, scope, revisions, findings, reproductions,
  fixes, reruns, and verdict.
- `decisions.tsv` — append-only decision trail for material choices.

## 12. Decision log

| Date | Decision | Reason | Evidence / next check |
| --- | --- | --- | --- |
| 2026-10-31 | Initial recommendation: hub at `/media-toolkit/` | Audio Toolkit plan and the local folder name | Superseded on 2026-11-01 by the user's `/tools/` choice |
| 2026-11-01 | Hub at `/tools/` | User explicitly selected the URL; it also matches the Audio Toolkit's existing back-link | Create `ashcx/tools`; verify live status and path |
| 2026-10-31 | Hub links to separate app deployments | Both apps are live with fixed base paths; the audio plan keeps them separate | HTTP 200 on both apps, 2026-10-31 |
| 2026-10-31 | Plain static HTML/CSS/JS | Two cards and a theme toggle need no framework or build | Deployed artifact has zero runtime dependencies |
| 2026-10-31 | Cards link through local aliases | Router owns entry points; one place to change a destination | Playwright alias journey |
| 2026-11-01 | No Audio Toolkit code change | Its header and tests already target `/tools/`, now the canonical hub | Optional sibling doc alignment only |
| 2026-10-31 | Custom 404 with inline CSS | GitHub Pages serves it at unknown paths; relative assets would break | Live 404 check after deploy; base is `/tools/` |
