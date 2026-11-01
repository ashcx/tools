# Sprint 1 interface contract

Frozen before implementation so the site files and the verification script can be written
against one shape. Updated on 2026-11-01 after the user directed a minimal landing page.

## Routes

| Request | Response |
| --- | --- |
| `GET /tools/` | `200`, `public/index.html` |
| `GET /tools/styles.css` | `200`, `text/css` |
| `GET /tools/favicon.svg` | `200`, `image/svg+xml` |
| `GET /tools/image-compressor/` | `200`, `public/image-compressor/index.html` |
| `GET /tools/audio-toolkit/` | `200`, `public/audio-toolkit/index.html` |
| an unknown path under `/tools/` that does not map to an artifact file | `404`, `public/404.html` |
| outside `/tools/` | `404`, `public/404.html` |

## Hub DOM contract

Document element:

- `<html lang="en" data-theme="light">` before the head script runs.
- The inline head script sets `data-theme` to `light` or `dark` only. The value is the
  resolved theme, never `system`.

Header:

- `a.skip-link[href="#main"]` is the first focusable element.
- `header.site-header` contains only the Settings button. There is no brand link in the header.
- The Settings button is `button#settings-open` with `aria-haspopup="dialog"`,
  `aria-controls="settings-dialog"`, and `aria-expanded`. It holds a decorative gear icon and
  the text `Settings`.
- `dialog#settings-dialog` starts closed. It is named by its `h2#settings-title` (`Settings`) and
  holds a `Close` button, one `section.settings-card` titled `Appearance` by its `h3`, a `Theme`
  label, and a `fieldset.theme-control` with `legend.visually-hidden` text `Theme`.
- The theme radios are all named `theme`, in this order: `#theme-system`, `#theme-light`,
  `#theme-dark`.

Main:

- `main#main` is the skip target and carries `tabindex="-1"`.
- `div.stage` holds `div.brand` and `nav.tool-grid[aria-label="Tools"]`.
- `div.brand` contains a decorative inline `svg.brand__mark`, exactly one `h1.brand__name`
  with text `Media Toolkit`, and one `p.brand__lede` with text
  `Two browser-local tools for images and audio.`
- `nav.tool-grid` holds exactly two children, both `a.tool-card`.
- `a.tool-card.tool-card--image[href="./image-compressor/"]` contains `h2` text
  `Image Compressor` and its summary `Compress, convert, resize`.
- `a.tool-card.tool-card--audio[href="./audio-toolkit/"]` contains `h2` text `Audio Toolkit`
  and its summary `Trim, process, export audio`.
- Each card names its heading with `aria-labelledby` and its summary with `aria-describedby`.
  The arrow is decorative and inside an `aria-hidden` element.
- Exactly three `h2` elements: the Settings dialog title and the two card headings.
- No interactive element inside a card.

The page has no footer. It has no format list, privacy statement, caveat, call-to-action label,
per-tool icon, or repository link. The visible copy is the brand, one descriptor line, two tool
names, two short summaries, the `Settings` trigger, and the dialog copy: `Settings`, `Close`,
`Appearance`, `Theme`, the three theme labels, and the System hint.

Theme behaviour:

- Storage key: `localStorage["media-toolkit-theme"]`, values `system`, `light`, `dark`.
- A missing or invalid value behaves like `system`.
- `system` follows `prefers-color-scheme` and reacts to changes while the page is open.
- An unavailable `localStorage` must not throw or blank the page.
- Selecting a radio updates `data-theme`, the radio checked state, and storage.
- The Settings button opens the dialog with `showModal()`, sets `aria-expanded="true"`, and the
  browser moves focus inside.
- `Close` and Escape close the dialog, set `aria-expanded="false"`, and return focus to the
  Settings button.

Keyboard order:

1. Skip link.
2. The Settings button.
3. The Image Compressor card.
4. The Audio Toolkit card.

While the dialog is open, focus stays inside it: the Close button, then the checked theme radio,
then back to Close.

Layout:

- The stage is at most 700px wide and centered in the viewport.
- No horizontal overflow at 320, 390, 768 or 1440 pixels.
- Two card columns at 760px and above, one column below.
- Interactive targets are at least 44px high.
- `prefers-reduced-motion: reduce` disables transitions.

## Alias contract

Each alias file contains all of:

- `<title>` naming the destination app.
- `<meta name="robots" content="noindex">`.
- `<link rel="canonical">` with the exact destination URL.
- Inline `location.replace("<destination>")`.
- `<noscript><meta http-equiv="refresh" content="0; url=<destination>"></noscript>`.
- A visible `<a>` to the destination.
- A relative link back to `./` or `../`.

No alias references a local stylesheet, script or image file.

## 404 contract

- Inline `<style>`, no external asset.
- `<base href="/tools/">`.
- Links to `./`, `./image-compressor/` and `./audio-toolkit/`.
- Body copy says the page was not found.

## Verification hooks

`scripts/verify.mjs` asserts the routes, hub DOM structure, alias contract, keyboard order,
layout, theme behaviour, and accessibility checks above. It serves `public/` itself at
`/tools/` and never depends on the live network: the two external app origins are intercepted
and answered with a stub page that contains `data-stub="image"` or `data-stub="audio"`.
