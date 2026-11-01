# Sprint 1 interface contract

Frozen before implementation so the site files and the verification script can be written
against one shape.

## Routes

| Request | Response |
| --- | --- |
| `GET /tools/` | `200`, `public/index.html` |
| `GET /tools/styles.css` | `200`, `text/css` |
| `GET /tools/favicon.svg` | `200`, `image/svg+xml` |
| `GET /tools/image-compressor/` | `200`, `public/image-compressor/index.html` |
| `GET /tools/audio-toolkit/` | `200`, `public/audio-toolkit/index.html` |
| anything else under `/tools/` | `404`, `public/404.html` |
| outside `/tools/` | `404`, `public/404.html` |

## Hub DOM contract

Document element:

- `<html lang="en" data-theme="light">` before the head script runs.
- The inline head script sets `data-theme` to `light` or `dark` only. The value is the
  resolved theme, never `system`.

Header:

- `a.skip-link[href="#main"]` is the first focusable element.
- `header.site-header` contains `a.brand[href="./"]` and the theme control.
- Theme control is a `fieldset.theme-control` with `legend.visually-hidden` text `Theme` and
  three radios, all named `theme`, in this order: `#theme-system`, `#theme-light`,
  `#theme-dark`.

Main:

- `main#main` is the skip target and carries `tabindex="-1"`.
- Exactly one `h1`. Its text is `Media Toolkit`.
- `section.tool-grid[aria-label="Tools"]` holds exactly two children, both `a.tool-card`.
- `a.tool-card.tool-card--image[href="./image-compressor/"]` contains `h2` text
  `Image Compressor`.
- `a.tool-card.tool-card--audio[href="./audio-toolkit/"]` contains `h2` text `Audio Toolkit`.
- Exactly two `h2` elements on the page, both inside the cards.
- No interactive element inside a card.

Footer:

- `footer.site-footer` holds the privacy sentence and `ul.footer-links`.
- The footer links to the hub repository and both app repositories.

Theme behaviour:

- Storage key: `localStorage["media-toolkit-theme"]`, values `system`, `light`, `dark`.
- A missing or invalid value behaves like `system`.
- `system` follows `prefers-color-scheme` and reacts to changes while the page is open.
- An unavailable `localStorage` must not throw or blank the page.
- Selecting a radio updates `data-theme`, the radio checked state, and storage.

Layout:

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

`scripts/verify.mjs` asserts the selectors and text above. It serves `public/` itself at
`/tools/` and never depends on the live network: the two external app origins are intercepted
and answered with a stub page that contains `data-stub="image"` or `data-stub="audio"`.
