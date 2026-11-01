# In-app browser session

Run on 2026-11-01 against the local Pages-parity server at `http://127.0.0.1:4173/tools/`.

## Hub load

- URL `http://127.0.0.1:4173/tools/`, title `Media Toolkit`, no console errors.
- Requests captured: `/tools/` and `/tools/styles.css` only. No third-party request.
- Accessibility tree: skip link first, `banner`, theme group named `Theme` with System,
  Light and Dark radios, `main`, one `h1`, region `Tools` with two links, `contentinfo`.
- Card link names: `Image Compressor` and `Audio Toolkit`, each described by its one-line
  summary. Before this session the name was the whole card text, which read as a paragraph;
  `aria-labelledby` and `aria-describedby` were added and the tree rechecked.

## Theme

- System scheme on this machine is dark. With no stored value the page resolved
  `data-theme="dark"` and body background `rgb(19, 20, 23)`.
- Selecting Dark through `label[for="theme-dark"]` set `data-theme="dark"`,
  `localStorage["media-toolkit-theme"]="dark"`, and survived a reload.
- Clicking the radio input directly is not possible here because it is clipped to 1px and the
  label is the hit target. This is the same interaction the Playwright suite performs.

## Card destinations

- Image Compressor card, clicked in the browser: final URL
  `https://ashcx.github.io/image-compressor-v1/`, title `Image Compressor`, no console errors.
- Back returned straight to `http://127.0.0.1:4173/tools/`, which confirms the alias did not
  leave an entry in history.
- Audio Toolkit card, clicked in the browser: final URL
  `https://ashcx.github.io/audio-toolkit-v1/`, title `Audio Toolkit · Tools`, no console errors.

## 404

- `http://127.0.0.1:4173/tools/does-not-exist` rendered `Page not found · Media Toolkit`.
- Recovery links resolved through `<base href="/tools/">` to
  `/tools/`, `/tools/image-compressor/` and `/tools/audio-toolkit/`.

## Screenshot limitation

The in-app screenshot tool reported that it needs a visible desktop window and returned no
image. Visual inspection used the Playwright captures in `captures/` at 1440 and 390 in light
and dark, plus `mobile-320.png`, `404.png` and `redirect-no-js.png`. They show a two-column
card grid at 1440, a single column at 390 and 320, readable contrast, and the theme control
fitting beside the brand at 390.
