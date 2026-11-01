# Sprint 1 coverage matrix

Authoritative acceptance state. States are VERIFIED, NOT VERIFIED, and INCONCLUSIVE. A check
is VERIFIED only when a command or browser session produced the recorded result.

Last updated: 2026-11-01, before the pull request.

## Entry criteria

| Condition | State | Evidence |
| --- | --- | --- |
| Execution authorized by the user | VERIFIED | user request 2026-11-01: "execute sprint 1 ... tell me when it is complete" |
| Canonical hub URL is `https://ashcx.github.io/tools/` | VERIFIED | user instruction 2026-11-01; `content-freeze.md` |
| Both apps return 200 | VERIFIED | `curl` 2026-11-01: image 200, audio 200 |
| Content freeze inputs read and revisions recorded | VERIFIED | `content-freeze.md` |
| Node 22, npm, Playwright available | VERIFIED | `checks.txt`: Node v22.11.0, Playwright 1.64.1, Chromium and WebKit installed |
| `gh` authenticated as `ashcx` | VERIFIED | `gh auth status`, account `ashcx` |
| Audio worktree left untouched | VERIFIED | no audio repository command that writes was run |

## Story acceptance

### S1-US01 hub landing page

| Condition | State | Evidence |
| --- | --- | --- |
| Brand, purpose sentence, two large cards with accurate copy | VERIFIED | `browser-session.md`; `captures/desktop-light.png`; `captures/mobile-light.png`; copy traced in `content-freeze.md` |
| Both cards reach the destination with JavaScript disabled | VERIFIED | `checks.txt` browser group, no-JS alias in Chromium and WebKit; `captures/redirect-no-js.png` |
| One `h1`, two `h2`, landmarks, skip link, no nested interactive elements | VERIFIED | `browser-session.md` accessibility tree; `checks.txt` browser group; `accessibility.json` zero violations |

### S1-US02 responsive, themed, accessible

| Condition | State | Evidence |
| --- | --- | --- |
| No overflow at 320, 390, 768, 1440 and readable in light, dark, system | VERIFIED | `checks.txt` browser group, both engines; `captures/mobile-320.png` |
| Theme persists in `localStorage["media-toolkit-theme"]` | VERIFIED | `checks.txt` browser group; `browser-session.md` reload |
| axe has no serious or critical violation in light and dark | VERIFIED | `accessibility.json`: four runs, zero violations of any impact |

### S1-US03 aliases and 404

| Condition | State | Evidence |
| --- | --- | --- |
| Image alias replaces location with the live app | VERIFIED | `redirects.json`; `browser-session.md` card journey |
| Audio alias replaces location with the live app | VERIFIED | `redirects.json`; `browser-session.md` card journey |
| No-JS alias reaches the destination | VERIFIED | `checks.txt` browser group, both engines |
| Unknown path returns 404 with recovery links | VERIFIED | `checks.txt` http group; `browser-session.md` 404 |

### S1-US04 local server and verification

| Condition | State | Evidence |
| --- | --- | --- |
| `npm test` serves `public/` at `/tools/` and runs every check | VERIFIED | `checks.txt`: seven groups pass, exit 0 |
| Negative control fails as expected | VERIFIED | `checks.txt`: wrong alias canonical and third-party URL each exit 1 with expected and actual values; fixtures removed |
| Deployed artifact has no test dependency | VERIFIED | `checks.txt` artifact listing; `node_modules` is the only untracked runtime directory and `.github` is not deployed |

### S1-US05 CI, deploy, live evidence

| Condition | State | Evidence |
| --- | --- | --- |
| CI workflow defined and passes on the PR | NOT VERIFIED | `.github/workflows/ci.yml` exists; no run yet |
| Pages workflow deploys `public/` | NOT VERIFIED | `.github/workflows/pages.yml` exists; needs a merge to `main` |
| Live status codes and browser journey | NOT VERIFIED | no deployment |
| Audio Toolkit return link works against the live hub | NOT VERIFIED | no deployment; its source already targets `/tools/` |

## Exit criteria

| Condition | State | Evidence |
| --- | --- | --- |
| `npm test` passes with recorded output | VERIFIED | `checks.txt`: `PASS all 7 groups in 8.0s`, exit 0 |
| `html-validate` passes on every deployed HTML file | VERIFIED | `checks.txt`: `npm run validate` exit 0 over `public` |
| No runtime dependency, external font, analytics, cookie, or third-party request | VERIFIED | `checks.txt` links group; `browser-session.md` request list; `package.json` has dev dependencies only |
| Desktop and mobile pages inspected in light and dark | VERIFIED | `browser-session.md`; captures at 1440, 390 and 320 |
| Aliases work with JavaScript enabled and disabled | VERIFIED | `checks.txt` browser group, both engines |
| Unknown paths return 404 with working recovery links | VERIFIED | `checks.txt` http group; `browser-session.md` |
| Self-review complete and findings resolved | VERIFIED | card accessible name fixed and rechecked; keyboard chord made platform-adaptive and rerun |
| Interrogate gate complete | NOT VERIFIED | pending |
| Sprint PR open with evidence links | NOT VERIFIED | pending |
