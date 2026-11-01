# Sprint 1 — Media Toolkit tool router

## Goal

Publish `https://ashcx.github.io/tools/` as a fast, accessible, dependency-free hub that
presents Image Compressor and Audio Toolkit as two large tool cards, routes
`/tools/image-compressor/` and `/tools/audio-toolkit/` to the live apps, and recovers unknown
paths with a useful 404.

Scope boundary: the hub only. The image and audio applications are read-only references. No
audio code change is required; its header already targets `/tools/`.

Status: **In progress**. Implementation, local verification, independent review, and the PR are
complete. CI passes. Deployment is not authorized yet.
Technical delivery: Complete.
Agent-verified acceptance: Local, interrogate, and CI VERIFIED. Live deployment NOT VERIFIED.

## Entry criteria

Definition of Ready for technical work.

- [x] The user authorized execution on 2026-11-01 and authorized the PR after review. Merge and
      deployment remain separate.
- [x] The canonical hub URL is confirmed as `https://ashcx.github.io/tools/`. The user selected
      it on 2026-11-01. The GitHub repository must be named `ashcx/tools`; the local folder
      stays `media-toolkit`.
- [x] Both external apps respond HTTP 200 and their canonical URLs were rechecked at execution:
      `https://ashcx.github.io/image-compressor-v1/` and
      `https://ashcx.github.io/audio-toolkit-v1/`.
- [x] The content freeze inputs are available: both app READMEs and the Audio Toolkit plan
      section 2. The inspected revisions are recorded before copy is written.
- [x] Node 22+, npm, and Playwright browser support are available. `gh` is authenticated as
      `ashcx`; the account can create a public repository named `tools` and enable GitHub
      Pages.
- [x] The audio repository's dirty `codex/ui-redesign` worktree is left untouched. No audio
      code or test change is planned.
- [x] No predecessor sprint exists. No carry-forward applies.

## Depends on

No internal predecessor. This is the first sprint in this repository.

External contracts:

- Image Compressor is live at `https://ashcx.github.io/image-compressor-v1/` with base path
  `/image-compressor-v1/`.
- Audio Toolkit is live at `https://ashcx.github.io/audio-toolkit-v1/` with base path
  `/audio-toolkit-v1/`.
- The Audio Toolkit header already points to `https://ashcx.github.io/tools/`, and its
  release-acceptance note names `/tools/`. Its plan still contains an older
  `/media-toolkit/` reference; the user's 2026-11-01 choice supersedes that URL. Aligning the
  sibling plan is optional documentation and is not a Sprint 1 blocker.
- `https://ashcx.github.io/tools/` returned HTTP 404 on 2026-11-01 because the hub does not
  exist yet. That is expected before deployment.

## Tasks

Timebox: one week.

Commitment: 6 committed story points plus 3 required stretch points. Review and rework reserve:
2 story points, about 22% of total capacity. Points are relative, not hours.

Execute stories and tasks sequentially. Each task ends with a check or an artifact. Do not tick
a task without evidence.

- [x] **S1-US01 — Publish the hub landing page** (P0, 3 SP; owner: main instance; review:
      subsequent self-review).
  - **Given** the hub is served at `/tools/`, **when** a visitor opens it, **then** they see the
    Media Toolkit logo, the name, one short descriptor, and two large links for Image Compressor
    and Audio Toolkit with short summaries.
  - **Given** JavaScript is disabled, **when** the visitor uses a link, **then** the alias page's
    noscript refresh or visible fallback still reaches the destination app.
  - **Given** a screen reader, **when** it reads the page, **then** there is one `h1`, two `h2`
    link headings, semantic landmarks, a skip link, and no nested interactive elements.
  - Tasks:
    - [x] Freeze the original card copy, app URLs, and privacy statements. Superseded on
          2026-11-01 by the user's minimal-page direction; the rendered copy is recorded in
          `content-freeze.md`.
    - [x] Freeze the redesigned token table, breakpoint, and control sizes in
          `content-freeze.md`.
    - [x] Write `public/index.html` and `public/styles.css` with the logo, `h1`, descriptor, and
          two link cards. No fact lists, footer, or repository links.
    - [x] Add `public/favicon.svg` and `public/.nojekyll`.
    - [x] Apply the saved theme before first paint with a small inline head script. Core content
          and navigation work without JavaScript.
    - [x] Capture desktop and mobile, light and dark. Inspect spacing, hierarchy, copy, and focus
          states.
    - [x] Perform separate self-review, resolve findings, rerun affected checks, and log exact
          results.
  - **Evidence:** `docs/sprint-evidence/sprint-1/captures/desktop-light.png`,
    `desktop-dark.png`, `mobile-light.png`, `mobile-dark.png`, `mobile-320.png`; `checks.txt`;
    `coverage.md`.

- [x] **S1-US02 — Make the hub responsive, themed, and accessible** (P0, 2 SP; owner: main
      instance; review: subsequent self-review).
  - **Given** widths of 320, 390, 768, and 1440 pixels, **when** the page is viewed in light,
    dark, and system themes, **then** there is no horizontal overflow, cards stack below 760px,
    text remains readable, focus is visible, targets are at least 44px, and reduced motion
    disables transitions.
  - **Given** the user selects Light, Dark, or System, **when** the page reloads, **then** the
    choice persists in `localStorage["media-toolkit-theme"]` and System follows the operating
    system preference.
  - **Given** an axe-core scan, **when** it runs in light and dark, **then** there are no
    serious or critical violations.
  - Tasks:
    - [x] Implement the responsive grid, spacing, overflow behavior, and 320px minimum.
    - [x] Implement the three-option theme control, `data-theme`, `matchMedia` handling, and
          persistence. Handle unavailable `localStorage` without failing.
    - [x] Add focus-visible styles, a skip link, reduced-motion handling, and minimum target
          sizes.
    - [x] Run the keyboard walkthrough, reload-persistence check, 320px overflow check, and
          axe scans in light and dark.
    - [x] Perform separate self-review, resolve findings, rerun affected checks, and log exact
          results.
  - **Evidence:** captures at 1440, 768, 390, and 320; `accessibility.json`; `checks.txt`;
    `coverage.md`.

- [x] **S1-US03 — Route aliases and recover unknown paths** (P0, 1 SP; owner: main instance;
      review: subsequent self-review).
  - **Given** `/tools/image-compressor/`, **when** it loads with JavaScript, **then** it
    replaces the location with `https://ashcx.github.io/image-compressor-v1/` and leaves no
    alias entry in history.
  - **Given** JavaScript is disabled, **when** the alias loads, **then** the noscript meta
    refresh reaches the same URL and a visible fallback link is present.
  - **Given** the audio alias, **then** it behaves the same way for
    `https://ashcx.github.io/audio-toolkit-v1/`.
  - **Given** an unknown path under `/tools/`, **when** it is requested, **then** the response
    is HTTP 404 and the page links to both tools and the hub home.
  - Tasks:
    - [x] Write `public/image-compressor/index.html` and `public/audio-toolkit/index.html` with
          canonical URL, `noindex`, `location.replace`, noscript meta refresh, visible
          fallback, and a relative home link.
    - [x] Write `public/404.html` with inline CSS, `<base href="/tools/">`, the recovery links,
          and a 404-specific message.
    - [x] Add route-contract checks that assert every required element and target.
    - [x] Perform separate self-review, resolve findings, rerun affected checks, and log exact
          results.
  - **Evidence:** `redirects.json`; `captures/404.png`;
    `captures/redirect-no-js.png`; `checks.txt`; `coverage.md`.

- [x] **S1-US04 — Build the local Pages-parity server and automated verification** (P0, 2 SP;
      required stretch; owner: main instance; review: subsequent self-review).
  - **Given** a clean checkout and `npm test`, **when** the suite runs, **then** it serves
    `public/` at `/tools/`, checks every local link, validates the redirect contract, runs
    Chromium and WebKit desktop/mobile/theme/keyboard/no-JS/404 checks, runs axe, and writes
    screenshots.
  - **Given** a deliberately broken alias target, **when** the checker runs, **then** it fails
    with expected versus actual output. The broken fixture is removed after the check.
  - **Given** the deployed artifact, **then** it contains no test dependency, no source map, and
    no development file.
  - Tasks:
    - [x] Add `package.json`, `package-lock.json`, and a `.gitignore`. Development dependencies
          are limited to Playwright, `@axe-core/playwright`, and `html-validate`.
    - [x] Write `scripts/serve.mjs`: bind `127.0.0.1`, mount `public/` at `/tools/`, serve
          correct MIME types, return `404.html` with status 404 for unknown paths, and stop on
          SIGINT.
    - [x] Write `scripts/verify.mjs`: link check, redirect contract, HTTP status checks,
          Playwright checks, axe scans, and captures. Use request interception to stub the
          external app origins; do not depend on live network for the normal suite.
    - [x] Add a temporary broken-fixture check and record the expected failure.
    - [x] Add `dev` and `test` npm scripts and a short README section for both.
    - [x] Run `npm test`, record exact output, and confirm the deployed artifact contents.
    - [x] Perform separate self-review, resolve findings, rerun affected checks, and log exact
          results.
  - **Evidence:** `checks.txt`; `accessibility.json`; `captures/`; `coverage.md`; the
    negative-control failure and its removal.

- [ ] **S1-US05 — Add CI, deploy, and record live evidence** (P0, 1 SP; required stretch;
      owner: main instance; review: subsequent self-review).
  - **Given** a pull request, **when** CI runs, **then** it installs the locked dependencies,
    installs Chromium and WebKit, runs `npm test`, and passes.
  - **Given** a merge to `main`, **when** the Pages workflow runs, **then** it uploads
    `public/` and deploys successfully.
  - **Given** the live site, **then** the hub, CSS, both aliases, and the 404 return the
    expected status codes; the two tool links reach the live apps; there are no console errors
    and no unexpected third-party requests.
  - Tasks:
    - [x] Add `.github/workflows/ci.yml` and `.github/workflows/pages.yml` with the versions and
          permissions recorded in the orchestration plan.
    - [x] Create the public `ashcx/tools` repository and enable Pages with
          `build_type=workflow`.
    - [x] Push the planning base to `main`, push the PR head, and record the CI run:
          https://github.com/ashcx/tools/actions/runs/41294114960 (conclusion: success).
    - [ ] Observe the Pages run after the merge.
    - [ ] Run live status-code checks, browser journeys, console/network checks, and
          desktop/mobile light/dark captures.
    - [x] Write `README.md` with the purpose, local development, test, deploy, and privacy
          notes.
    - [ ] Record the deployed commit SHA, workflow run, status codes, and timestamps in
          `live.json`.
    - [ ] Verify the Audio Toolkit header's `/tools/` return link against the live hub. No audio
          code change is expected.
    - [ ] Perform separate self-review, resolve findings, rerun affected checks, and log exact
          results.
  - **Evidence:** `live.json`; workflow run URLs; `captures/live-*`; `checks.txt`;
    `coverage.md`.

## Exit criteria

Definition of Done. Unfinished items remain unchecked.

Implementation and verification gates:

- [ ] Every required story and task is complete with acceptance evidence.
- [x] `npm test` passes with exact recorded output, including link, redirect, Chromium/WebKit,
      keyboard, no-JavaScript, 404, and axe checks.
- [x] `html-validate` passes on every deployed HTML file.
- [x] The negative control failed as expected before removal.
- [x] No runtime dependency, external font, analytics, cookie, or third-party request was
      introduced.
- [x] The deployed artifact contains only `public/` files.
- [x] Actual desktop and mobile pages were inspected in light and dark; captures are retained.
- [x] The redirect aliases work with JavaScript enabled and disabled.
- [x] Unknown paths return HTTP 404 with working recovery links.
- [x] Separate self-review is complete; blocking findings are resolved and rechecked.
- [x] `coverage.md` maps every Ready/Done condition and story acceptance to a check or artifact,
      with honest VERIFIED, NOT VERIFIED, and INCONCLUSIVE states.
- [x] The decision trail and execution log are current.

PR delivery reminder: when the implementation and verification gates pass, push the branch and
open or update the single sprint PR. Do not wait for pending human acceptance. An eligible
last-resort exception permits a PR with unfinished work disclosed.

- [x] The sprint PR links this sprint file, the orchestration plan, the Scrum policy, the
      evidence, and any unfinished-work record.
- [x] The PR URL is recorded in this file's References and Execution log, the roadmap, and any
      unfinished-work record. Bookkeeping is pushed to the same PR branch.

Independent acceptance gates:

- [x] Interrogate is complete against the integrated sprint and the full Ready/Done matrix.
      Two independent read-only reviewers covered correctness/contracts/data safety and
      user-journey/coverage/maintainability. The configured
      `opencode/deepseek-v4.1-flash-free#max` route was unavailable, so both ran on the
      inherited `deepseek-flash` route at default effort, in separate contexts. Reviewer
      identities, route, effort, revisions, findings, reproductions, fixes, reruns, and verdict
      are recorded in `interrogate.md`.
- [ ] Required real-world evidence exists: live URL, status codes, workflow run, and
      desktop/mobile captures. Unavailable evidence is explicitly NOT VERIFIED.
- [ ] The Audio Toolkit return link to `/tools/` is verified live, or recorded as an external
      gap. No audio code change is expected.

Progress automatically after all technical, interrogate, and PR gates pass. An eligible
interrogate-verified last-resort exception permits progression with a linked
`sprint-1-unfinished.md`; incomplete tasks and exits stay unchecked and status stays In
progress. No routine human approval is needed. Clarify materially doubtful intent.

Merge and deploy follow the actual authorized scope. Green tests do not imply permission to
deploy. If deployment is not authorized, the live-URL gate stays NOT VERIFIED.

## Scrum details

- **Timebox and capacity.** One week. Six committed points plus three required stretch points.
  Two points reserved for review and rework, about 22%.
- **Execution model.** Main instance implements sequentially, one story and task at a time.
  No implementation fan-out. Independent review is limited to the two read-only reviewers.
- **Decision authority.** The agent decides within the stated outcome. Ask the user only for
  materially doubtful intent, such as deployment authorization.
- **Evidence.** `docs/sprint-evidence/sprint-1/` with the files named in the stories. The
  coverage matrix is authoritative for acceptance state.
- **Verification.** Local Pages-parity server, link and redirect checks, HTML validation,
  Chromium and WebKit, axe, keyboard, no-JS, 404, and live checks after deployment.
- **Planning record.** This sprint planning entry records the analysis, estimates, task order,
  frozen contracts, verification plan, and risks. No implementation occurred.
- **Daily records.** Written sync notes only when execution spans more than one working day.
  Do not claim meetings.
- **Review and retrospective.** Written records after the interrogate gate. One or two practical
  process improvements.
- **Recovery timebox.** At expiry, record unfinished work and open a recovery timebox. Keep
  recovery tasks in this sprint. Do not silently relax acceptance.

## Out of scope

- Modifying `ashcx/image-compressor-v1` or `ashcx/audio-toolkit-v1` in the hub PR.
- Any Audio Toolkit code, test, or deployment change. Its `/tools/` link is already correct.
- Optional alignment of the Audio Toolkit plan's older `/media-toolkit/` wording. It is sibling
  documentation and not part of this sprint.
- A `/media-toolkit/` alias. `/tools/` is the canonical URL.
- Unified single-origin hosting, iframes, reverse proxies, service workers, or PWA install
  behavior.
- Authentication, accounts, uploads, analytics, search, CMS, internationalization, or a custom
  domain.
- Revalidating either app's internals or running their full test suites.
- Sitemap, robots policy, Open Graph image generation, or search-engine submission.
- Merge or deployment beyond the explicitly authorized scope.

## References

- [Roadmap](../TODO.md)
- [Orchestration plan](orchestration-plan.md)
- [Scrum policy](redesign-scrum-plan.md)
- [Audio Toolkit plan section 2](https://github.com/ashcx/audio-toolkit-v1/blob/main/todo/audio-toolkit-plan.md)
  — Media Toolkit brand, two large cards, separate deployments. Its older `/media-toolkit/`
  URL is superseded by the user's 2026-11-01 `/tools/` choice.
- [Audio Toolkit release acceptance](https://github.com/ashcx/audio-toolkit-v1/blob/main/docs/release-acceptance.md)
  — hub handoff; its `/tools/` destination now matches the canonical hub.
- [Image Compressor README](https://github.com/ashcx/image-compressor-v1/blob/main/README.md)
  — capabilities, formats, privacy, limitations.
- [Audio Toolkit README](https://github.com/ashcx/audio-toolkit-v1/blob/main/README.md)
  — capabilities, formats, privacy, limitations.
- Live apps observed HTTP 200 on 2026-10-31:
  `https://ashcx.github.io/image-compressor-v1/` and
  `https://ashcx.github.io/audio-toolkit-v1/`.
- `https://ashcx.github.io/tools/` observed HTTP 404 on 2026-11-01, expected before the hub
  deploys.
- Sprint PR: https://github.com/ashcx/tools/pull/1.

## Execution log

### 2026-10-31 — Sprint Planning

Status: planning complete; implementation not started.

Analysis:

- Both tools are independent Vite + Preact GitHub Pages deployments with fixed base paths.
  Image Compressor returned HTTP 200 at `/image-compressor-v1/`; Audio Toolkit returned HTTP 200
  at `/audio-toolkit-v1/`.
- The Audio Toolkit plan section 2 decides on a Media Toolkit hub with two large tool cards and
  separate deployments. It originally named `/media-toolkit/`.
- The Audio Toolkit header, two Playwright URL assertions, and the release-acceptance note
  point to `/tools/`. That URL returned HTTP 404 before the hub existed.
- A unified build was rejected: it would require changing both apps' base paths, rebuilding
  workers and WebAssembly assets, and adding cross-repo CI.
- The hub will be plain static HTML, CSS, and a tiny inline theme/redirect script. No runtime
  dependencies.

Estimates and commitment:

- S1-US01 3 SP, S1-US02 2 SP, S1-US03 1 SP: 6 committed.
- S1-US04 2 SP, S1-US05 1 SP: 3 required stretch.
- Total 9 SP. Review and rework reserve: 2 SP.

Frozen contracts at the time:

- Hub URL: `https://ashcx.github.io/media-toolkit/` (recommended; superseded 2026-11-01).
- App URLs: image `/image-compressor-v1/`, audio `/audio-toolkit-v1/`.
- Alias routes: `/media-toolkit/image-compressor/` and `/media-toolkit/audio-toolkit/`
  (superseded 2026-11-01).
- Theme storage: `localStorage["media-toolkit-theme"]`.
- Deployed artifact: `public/`, uploaded directly to GitHub Pages.

Verification plan:

- Local Pages-parity server at the production base path.
- Link, redirect, HTML, Chromium, WebKit, keyboard, no-JS, 404, and axe checks.
- Negative control for a broken alias.
- Live status codes, browser journeys, console/network checks, and captures after deployment.

Risks and open items:

- The hub URL choice needed confirmation. It was resolved on 2026-11-01.
- GitHub Pages custom-404 behavior must be verified live.
- Deployment authorization is separate from planning and implementation authorization.

### 2026-11-01 — Hub URL changed to /tools/

Status: planning documents updated; implementation still not started.

Decision:

- The user selected `https://ashcx.github.io/tools/` as the canonical hub URL.
- This supersedes the 2026-10-31 `/media-toolkit/` recommendation.
- The GitHub repository must be named `ashcx/tools`. The local folder remains `media-toolkit`.
- The Audio Toolkit header already targets `/tools/`, and its release-acceptance note names
  `/tools/`, so no audio code, test, or deployment change is required.
- The Audio Toolkit plan's older `/media-toolkit/` wording is optional sibling documentation
  alignment. It is not part of this sprint.

Contract changes:

- Hub URL: `https://ashcx.github.io/tools/`.
- Alias routes: `/tools/image-compressor/` and `/tools/audio-toolkit/`.
- 404 base: `/tools/`.
- Local server mount: `/tools/`.
- Repository: `ashcx/tools`.
- Theme storage remains `localStorage["media-toolkit-theme"]` because it is brand-based, not
  URL-based.

### 2026-11-01 — Planning validation

Status: documents updated; no code, repository, or deployment.

Checks performed:

- Read both repos' README, Vite config, entry HTML, workflows, source headers, and design
  tokens.
- Observed live status codes for both apps, `/tools/`, and `/media-toolkit/`; both hub paths
  returned 404 before deployment.
- Confirmed the `gh` account is authenticated as `ashcx`.
- Confirmed `ashcx/tools` does not exist in the repository list returned by `gh`.
- Confirmed the user's `/tools/` choice makes the Audio Toolkit's existing back-link correct;
  the sibling plan's older `/media-toolkit/` wording is a documentation discrepancy only.

No sprint task is checked. No runtime evidence exists yet; only this planning record and
`docs/sprint-evidence/sprint-1/decisions.tsv`.

### 2026-11-01 — Execution resumed and the minimal page implemented

Status: implementation and local verification complete; independent review and PR pending.

Resume point:

- A prior run implemented US01 through US05 up to local verification, then stopped after the
  negative controls when the session hit rate limits. It left `checks.txt` from 07:35Z and
  evidence JSON from 07:37Z.
- The committed `redirects.json` still held the broken negative-control values. The working
  tree had two later evidence files. The code and suite passed before the redesign.

Implementation:

- The user called the first landing page text-heavy and asked for a logo, the name, and one
  short descriptor. That supersedes the card fact lists, calls to action, footer, and repository
  links.
- One isolated subagent wrote the redesign. The main session reviewed the diff, merged it,
  aligned the remaining pages, and re-ran every check.
- `public/index.html` and `public/styles.css` now use a centered 700px stage: brand mark,
  `Media Toolkit`, one descriptor, two tool links with short summaries, and the
  System/Light/Dark control.
- `checkKeyboard` now asserts the four-stop tab order. No other check was weakened.
- The 404 page, both aliases, and the favicon use the new palette. The 404 copy is shorter, and
  the arrow SVGs are not focusable.
- `npm run validate` and `npm test` both exit 0. Both negative controls fail as expected. See
  `checks.txt`.

Evidence: `docs/sprint-evidence/sprint-1/` (`contract.md`, `content-freeze.md`,
`browser-session.md`, `coverage.md`, `checks.txt`, the captures, `accessibility.json`, and
`redirects.json`).

Next: independent review, then the PR.

### 2026-11-01 — Independent review and fixes

Status: review complete with findings resolved; PR pending.

- The configured `opencode/deepseek-v4.1-flash-free#max` route was unavailable. Subagent calls
  with an explicit provider, model, or max effort failed. Two reviewers ran on the inherited
  `deepseek-flash` route at default effort in separate worktrees. They reviewed the same intent
  and scope against 8a2f784.
- Reviewer A (correctness) passed with one medium and two low findings. Reviewer B
  (journey/coverage) passed with one high process risk, two medium, and several low findings.
- Fixed: the no-JS alias check now clicks the visible fallback and fails when both paths break;
  the alias fallback pages use border-box and are checked at 320; blocked storage tests reads
  and writes; the GitHub allowlist is gone; Light, 768, focus, target size, and history checks
  were added; the 404 arrows are hidden from assistive technology; stale docs were corrected.
- Reviewer B's `redirects.json` showed example.com because its negative control wrote the
  failed report into the evidence path. The source alias was correct. The clean rerun restored
  the evidence, and the clean-run order is recorded in `checks.txt`.
- Rerun: `npm run validate` exit 0; `npm test` seven groups in 8.6s, exit 0; three negative
  controls exit 1 with expected and actual output. See `checks.txt`.
- Delivery: remote `main` will hold the planning commit `9100bee`; the PR head is this branch.
  Pushing local `main` would deploy before the PR, so the delivery uses an explicit base ref.

### 2026-11-01 — Retrospective

- Run the negative controls before the final clean run. They write evidence files, and the
  broken `redirects.json` from the prior run came from skipping that order.
- Make a check that can skip into a check that can fail. The no-JS journey now falls back to
  the visible link and throws when neither path works.

### 2026-11-01 — PR and CI

- Opened https://github.com/ashcx/tools/pull/1 from `sprint-1-hub` into `main`.
- Remote `main` holds the planning commit `9100bee`. The PR head at open was `df83209`.
- CI run https://github.com/ashcx/tools/actions/runs/41294114960 passed on `df83209`.
- Pages is enabled with `build_type=workflow`. The Pages run follows the merge and is NOT
  VERIFIED. The live URL, status codes, and Audio Toolkit return link remain NOT VERIFIED.

### 2026-11-01 — Settings style alignment

Status: implemented and reverified; PR branch updated.

- The user asked to keep the standard Settings pages in `image-compressor-v1` and
  `audio-toolkit-v1` and to match their style and font. Neither app was edited.
- The hub now uses the Image Compressor Settings tokens: `#f5f4f1` page, white surfaces, the
  same borders, text, muted pair, 10px control radius, and 20px cards. The theme control copies
  the Settings segmented Appearance control, including the 44px target and 680 weight. The font
  stack already matched and did not change.
- The 404 page, both alias fallbacks, and the favicon were moved to the same tokens.
- `npm run validate` exit 0; `npm test` seven groups in 8.7s, exit 0; three negative controls
  exit 1. Captures and `accessibility.json` were written again.

### 2026-11-01 — Settings popup

Status: implemented and reverified; PR branch updated.

- The user rejected the inline theme control: they want a Settings button on the page that opens
  a popup card with the dark mode selector, following Image Compressor v1.
- The header now holds a gear-and-label `Settings` button. It opens a native `dialog` centered
  over a dimmed backdrop, holding the Appearance card, Theme label, segmented System/Light/Dark
  control, and the System hint. Close and Escape dismiss it and restore focus to the button.
- The dialog uses the same tokens, radii, typography, and segmented control as the apps. Neither
  app was edited.
- `checkLayout`, `checkTheme`, `checkKeyboard`, `checkAxe`, and `checkCaptures` were updated.
  Axe now runs eight scans, including the popup open in both themes on both engines.
- `npm run validate` exit 0; `npm test` seven groups in 9.5s, exit 0; three negative controls
  exit 1. New captures: `settings-light.png` and `settings-dark.png`.
