# Sprint 1 coverage matrix

Authoritative acceptance state. States are VERIFIED, NOT VERIFIED, and INCONCLUSIVE. A check
is VERIFIED only when a command or browser session produced the recorded result.

Last updated: 2026-11-01, after the independent review and its fixes, before the pull request.

## Entry criteria

| Condition | State | Evidence |
| --- | --- | --- |
| Execution authorized by the user | VERIFIED | user request 2026-11-01: execute Sprint 1 and push the PR after review |
| Canonical hub URL is `https://ashcx.github.io/tools/` | VERIFIED | user instruction 2026-11-01; `content-freeze.md` |
| Both apps return 200 | VERIFIED | `curl` 2026-11-01: image 200, audio 200 |
| Content freeze inputs read and revisions recorded | VERIFIED | `content-freeze.md` |
| Node 22, npm, Playwright available | VERIFIED | `checks.txt`: Node v22.11.0, Playwright 1.64.1, Chromium and WebKit installed |
| `gh` authenticated as `ashcx` | VERIFIED | `gh auth status`, account `ashcx` |
| Audio worktree left untouched | VERIFIED | no write command ran in the audio repository |

## Story acceptance

### S1-US01 hub landing page

| Condition | State | Evidence |
| --- | --- | --- |
| Logo, name, one descriptor, two tool links with short summaries; no fact lists, footer, or repository links | VERIFIED | `checkLayout` asserts the h1 text, descriptor, header-only theme control, zero footers, two aria-labelled cards, and both short summaries; `captures/desktop-light.png`; `captures/mobile-light.png` |
| Both links reach the destination with JavaScript disabled | VERIFIED | `checkAliasWithoutJavaScript` in Chromium and WebKit; `checkAliasFallbackLayout`; negative control 3 fails when both paths break; `captures/redirect-no-js.png` |
| One `h1`, two `h2`, landmarks, skip link, no nested interactive elements | VERIFIED | `checkLayout` asserts one h1, two h2 inside the cards, `banner`, `main`, `nav`, zero nested interactive elements; `checkKeyboard`; `accessibility.json` zero violations |

### S1-US02 responsive, themed, accessible

| Condition | State | Evidence |
| --- | --- | --- |
| No overflow at 320, 390, 768, 1440 and readable in light and dark | VERIFIED | `checkLayout` at all four widths in light and dark; `captures/mobile-320.png`; `captures/tablet-768.png` |
| Cards stack below 760px and fit at the breakpoint | VERIFIED | `checkLayout` asserts stacked at 390 and 759, side by side at 768 and 1440 |
| Focus visible and targets at least 44px | VERIFIED | `checkKeyboard` asserts outlines on the skip link, theme option, and both cards; `checkLayout` asserts 44 by 44 minimum on the skip link, theme options, and cards |
| Light, Dark, and System persist in `localStorage["media-toolkit-theme"]` | VERIFIED | `checkTheme` asserts all three choices, checked radios, storage values, and reload persistence; System follows a live scheme change |
| Reduced motion disables transitions | VERIFIED | `checkReducedMotion` gets a 0s card transition |
| Blocked storage does not blank the page | VERIFIED | `checkBlockedStorage` throws from both `getItem` and `setItem`; the hub renders and a theme choice applies |
| axe has no serious or critical violation in light and dark | VERIFIED | `accessibility.json`: four runs, zero violations of any impact |

### S1-US03 aliases and 404

| Condition | State | Evidence |
| --- | --- | --- |
| Image alias replaces location with the live app | VERIFIED | `redirects.json`; `checkAliasNavigation` final URL and stub document |
| Audio alias replaces location with the live app | VERIFIED | `redirects.json`; `checkAliasNavigation` final URL and stub document |
| The alias leaves no entry in history | VERIFIED | `checkAliasNavigation` goes back from the destination and lands on `/tools/` for both aliases |
| No-JS alias reaches the destination | VERIFIED | `checkAliasWithoutJavaScript` in both engines; `checkAliasFallbackLayout` at 320; negative control 3 fails when both paths break |
| Unknown path returns 404 with recovery links | VERIFIED | `checkHttp` for deep and outside paths; `checkNotFound`; `browser-session.md` 404 |

### S1-US04 local server and verification

| Condition | State | Evidence |
| --- | --- | --- |
| `npm test` serves `public/` at `/tools/` and runs every check | VERIFIED | `checks.txt`: seven groups pass in 8.6s, exit 0 |
| Negative control fails as expected | VERIFIED | `checks.txt`: wrong alias canonical, third-party image, and a no-JS alias with both paths broken each exit 1 with expected and actual output; fixtures removed |
| Deployed artifact has no test dependency | VERIFIED | `checks.txt` artifact listing; `node_modules` and `.github` are not part of `public/` |

### S1-US05 CI, deploy, live evidence

| Condition | State | Evidence |
| --- | --- | --- |
| CI workflow defined and passes on the PR | NOT VERIFIED | `.github/workflows/ci.yml` exists; the PR is not created yet |
| Pages workflow deploys `public/` | NOT VERIFIED | `.github/workflows/pages.yml` exists; needs a merge to `main` |
| Live status codes and browser journey | NOT VERIFIED | no deployment; `/tools/` returned 404 on 2026-11-01 |
| Audio Toolkit return link works against the live hub | NOT VERIFIED | no deployment; its source already targets `/tools/` |

## Exit criteria

| Condition | State | Evidence |
| --- | --- | --- |
| `npm test` passes with recorded output | VERIFIED | `checks.txt`: `PASS all 7 groups in 8.6s`, exit 0 |
| `html-validate` passes on every deployed HTML file | VERIFIED | `checks.txt`: `npm run validate` exit 0 over `public` |
| No runtime dependency, external font, analytics, cookie, or third-party request | VERIFIED | `checks.txt` links group, now limited to the two app destinations; `browser-session.md` request list; `package.json` has dev dependencies only |
| Desktop and mobile pages inspected in light and dark | VERIFIED | `browser-session.md`; captures at 1440, 768, 390, and 320 |
| Aliases work with JavaScript enabled and disabled | VERIFIED | `checks.txt` browser group, both engines; negative control 3 |
| Unknown paths return 404 with working recovery links | VERIFIED | `checks.txt` http group; `browser-session.md` |
| Self-review complete and findings resolved | VERIFIED | review findings fixed: no-JS check now fails when both paths break, alias fallback box sizing, read and write storage block, GitHub allowlist removed, Light/768/focus/target/history checks added, 404 arrows hidden, docs aligned |
| Interrogate gate complete | VERIFIED | `interrogate.md`: two independent read-only reviewers, PASS WITH FINDINGS, findings reproduced, fixed, and rerun; route and effort substitution recorded |
| Sprint PR open with evidence links | NOT VERIFIED | pending |
| Live URL and deployment evidence | NOT VERIFIED | deployment follows the PR; not authorized yet |
