# Sprint 1 interrogate

Date: 2026-11-01
Scope: the integrated Sprint 1 increment, base 9100bee to head 8a2f784, plus the sprint Goal,
entry criteria, stories, exit criteria, coverage matrix, contract, captures, checks, decision
trail, README, TODO, and both workflows.

## Reviewers

| Reviewer | Session | Focus | Route | Effort | Verdict |
| --- | --- | --- | --- | --- | --- |
| A | `a6ea9c2b-d39c-4cf7-82bb-73ec48487e63` | Correctness, contracts, data safety | Inherited `deepseek-official/deepseek-flash` | Default | PASS WITH FINDINGS |
| B | `58efb7f7-ff17-4023-8d59-d3d041027df9` | User journey, coverage, maintainability | Inherited `deepseek-official/deepseek-flash` | Default | PASS WITH FINDINGS |

Both reviewers were read-only and worked in separate git worktrees at `8a2f784`. They did not
edit source files, commit, push, or start subagents. Both ran `npm run validate` and `npm test`,
rebuilt negative controls, and inspected the captures. The full scope each covered is in its
report; the findings below are the reproduced ones.

## Independence and route limitation

The sprint text named `opencode/deepseek-v4.1-flash-free#max`. That route is not registered in
this session. Subagent runs with an explicit provider, model, or max effort failed before
finishing. A probe on the inherited route returned `OK`, so both reviewers inherited the parent
`deepseek-flash` route at default effort in separate contexts. This is independent context, not
model, provider, or effort diversity. The project policy claims reviewer independence only, not
diversity. The same limitation is recorded in the sprint file and the decision trail.

## Findings and dispositions

### A1, MEDIUM: the no-JavaScript alias check could not fail

Reviewer A removed both `<noscript>` refresh tags from a copy and ran:

```
node scripts/verify.mjs --only browser --public /tmp/mt-neg-nojs
```

The browser group printed four `SKIP browser: ... within 10s` lines and exited 0. A broken
no-JS journey therefore passed.

Fixed in `3e09aa2`. `checkAliasWithoutJavaScript` now clicks the visible fallback after a
refresh timeout. If that also fails, it throws `CheckFailure`. The `skips` list is gone.

Rerun with a copy whose audio alias has no noscript refresh and whose visible fallback points
at `https://example.com/audio/`:

```
FAIL browser (16.1s)
  [chromium] alias without JavaScript: /tools/audio-toolkit/ does not reach https://ashcx.github.io/audio-toolkit-v1/ with JavaScript disabled
    expected the noscript refresh or the visible fallback to navigate
    actual   neither path reached the destination
exit=1
```

The normal suite still passes, and the fallback path is recorded with a `NOTE browser` line if
it is used.

### A2, LOW: alias fallback pages overflowed at 320px

Reviewer A loaded the alias with JavaScript disabled, a 204 destination stub, and a 320px
viewport. `documentElement.scrollWidth` was 325 against a 320 client width, and `main` sat at
`x=-5`. The alias style blocks had no `box-sizing` reset, so `main` was content-box `100%`
plus padding and border.

Fixed in `3e09aa2` with `*, *::before, *::after { box-sizing: border-box; }` in both aliases.
Added `checkAliasFallbackLayout`, which loads each alias at 320px with the destination stubbed
to 204 and asserts no horizontal overflow. It runs in Chromium and WebKit.

Rerun: `PASS browser` in both engines.

### A3 / B8, LOW: blocked storage tested writes but not reads

The blocked-storage check overrode only `Storage.prototype.setItem`. `readPreference` also calls
`getItem`, so the read-throw branch was untested.

Fixed in `3e09aa2`: the check now throws from both `getItem` and `setItem`. The page still
renders, a theme choice still applies, and a reload still works. The test also asserts the
focused theme radio is checked.

### A4, NIT: the contract overstated verifier coverage

The contract said the verifier asserts all selectors and text above. It did not assert the h1
text, descriptor, aria wiring, absence of a footer or fact list, no nested interactive elements,
or 44px targets.

Fixed: `checkLayout` now asserts the h1 text, descriptor, header-only theme control, zero
footers and fact lists, no nested interactive elements, both `aria-labelledby` and
`aria-describedby` links, hidden arrows, and 44 by 44 targets. The contract's verification
sentence now names the areas the verifier covers.

### A5, NIT: the 404 route-table catch-all was inaccurate

`/tools/index.html` and `/tools/404.html` are real files and return 200. The contract row now
says an unknown path that does not map to an artifact file returns 404.

### B1, HIGH: the planned PR base did not match local `main`

Local `main` was at the reviewed head, while the plan says remote `main` holds the planning
commit `9100bee` so Pages cannot run before review. This was a delivery risk, not a code defect.

Resolved at delivery: the remote is created and `9100bee` is pushed explicitly to `main`. The
reviewed head is pushed as `sprint-1-hub`. Local `main` is not pushed. The execution log records
the exact base.

### B2, MEDIUM: coverage did not map every story clause

Missing checks and rows: cards at 768 and 759, dark layout, skip-link and theme focus rings,
44px targets, reduced motion, and alias history.

Fixed in `3e09aa2` and the docs:

- `checkLayout` asserts stacked cards at 390 and 759, side-by-side cards at 768 and 1440, and
  no overflow at 320, 390, 768, and 1440 in light and dark. It also checks target sizes.
- `checkKeyboard` asserts the skip-link outline, the theme-option outline, and the checked
  radio.
- `checkAliasNavigation` goes back from the destination to `/tools/` for both aliases.
- `checkTheme` selects Light, reloads, and asserts the radio and stored value.
- A new `tablet-768.png` capture is retained.
- `coverage.md` maps these clauses to the checks.

### B3, MEDIUM: the no-JS check could silently skip

Duplicate of A1. Fixed once in `3e09aa2`.

### B4, LOW: the link allowlist accepted repository links

`isAllowedAbsoluteUrl` still allowed `https://github.com/ashcx/*`, although the page has no
repository links. Removed in `3e09aa2`. Negative control 2 now expects only the two app
destinations.

### B5, LOW: README described artifacts that did not exist

The README said the PR was in progress and listed `live results`, while `live.json` and the PR
did not exist. Reworded to "implementation, local verification, and independent review are
complete; the sprint PR is pending" and removed `live results` from the layout list.

### B6, LOW: stale sprint evidence references

The sprint file named a `404.txt` that never existed and said captures covered all four widths
when 768 was missing. Removed `404.txt`; added `tablet-768.png`; the evidence lines now name
1440, 768, 390, and 320.

### B7, LOW: review route record was stale

The sprint still named `opencode/deepseek-v4.1-flash-free#max`. Updated to the inherited route
at default effort, with the limitation repeated here. The decision trail has a correction row.
The execution log now names rate limits as the reason the prior run stopped.

### B9, NIT: content-freeze had two stale descriptions

The font line said "system sans stack" while the CSS starts with Inter. The audio card sentence
described a card that no longer exists. Both corrected.

### B10, NIT: 404 decorative arrows were announced

The 404 used `.links a::after { content: "\2192"; }`, so Chromium's accessibility tree named the
links with a trailing arrow. Replaced with `<span class="link-arrow" aria-hidden="true">` in
`3e09aa2`. The accessible names are now the link text only.

## Dropped or corrected claims

- Reviewer B's `redirects.json` briefly showed `example.com` for the audio alias. Reviewer B had
  run a negative control, which writes the failed report to the fixed evidence path, then
  restored the source. The alias source was correct. The clean run after the negative controls
  restored `redirects.json`, and `checks.txt` records the order.
- `package.json` and the lock root disagreed on the axe range. Aligned at `^4.13.0` in
  `3e09aa2`; `npm ci --dry-run` exits 0.
- No path traversal was found. Plain, encoded, double-encoded, backslash, and null-byte probes
  all returned 404 and stayed under `public/`.
- History, theme, contrast, axe, request list, negative controls, and workflow parsing were
  checked and held.
- The capture check asserts a non-empty file after navigating and waiting for the `h1`. Visual
  quality is covered by the retained captures and the inspection record, not by that check.

## Rerun after the fixes

```
$ npm run validate
exit=0

$ npm test
PASS links (0.0s)
PASS redirects (0.0s)
PASS html (0.1s)
PASS http (0.0s)
PASS browser (6.0s)
PASS axe (1.4s)
PASS captures (0.5s)
PASS all 7 groups in 8.6s
exit=0
```

Three negative controls exit 1 with expected and actual output: a wrong alias canonical, a
third-party image, and a no-JS alias with both paths broken. Full output is in `checks.txt`.
The fix commit is `3e09aa2`.

## Verdict

PASS WITH FINDINGS. No blocker and no high code defect. The one high finding was a delivery
base risk and is resolved by the push plan. Every reproduced finding is fixed or narrowly
explained. The docs and evidence now match the code.

Not verified here: the CI run, the Pages deploy, the live URL, and the PR itself. Those follow
the push and merge.

## Post-fix review limitation

The fixes changed tests and the alias fallback CSS. The user directed that no subagents be used,
so the fixes were not given a fresh independent review. The main session reran the full suite,
the browser group, the three negative controls, and the capture inspection. A later independent
pass can review commit `3e09aa2` and the docs commit if the operator wants that separation.
