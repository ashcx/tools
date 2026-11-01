# Content freeze

Frozen on 2026-11-01 before any hub markup was written.

## User-directed reduction on 2026-11-01

The user called the first landing page text-heavy and asked for a logo, the tool name, and one
short descriptor. That instruction supersedes the card copy below. The rendered page now shows:

- Brand: Media Toolkit.
- Descriptor: Two browser-local tools for images and audio.
- Image Compressor summary: Compress, convert, resize.
- Audio Toolkit summary: Trim, process, export audio.
- Settings trigger: a gear icon and `Settings`, top right.
- Settings popup: `Settings`, `Close`, `Appearance`, `Theme`, the labels System, Light, and Dark,
  and the hint `System follows your operating system's light or dark setting.`

The theme selector lives only in the Settings popup. It is not inline in the header.

The format, privacy, and caveat facts below stay in this record as the source of truth for the
two tools. They are not rendered, and the contract and verification script no longer assert them.

## Visual tokens after the user review

The user asked to keep the standard Settings pages in `image-compressor-v1` and
`audio-toolkit-v1` and to match their style and font. The hub now reuses the Image Compressor's
Settings tokens and segmented Appearance control. Neither app was modified.

| Token | Light | Dark |
| --- | --- | --- |
| Page background | `#f5f4f1` | `#131417` |
| Surface | `#ffffff` | `#1c1e23` |
| Subtle surface | `#faf9f7` | `#22252b` |
| Muted surface | `#f0efeb` | `#2a2e35` |
| Border | `#e4e1db` | `#333840` |
| Strong border | `#d5d1c9` | `#454c57` |
| Text | `#242321` | `#f1f2f4` |
| Muted text | `#78756e` | `#9aa1ac` |
| Muted strong | `#5e5b55` | `#c2c8d0` |

Breakpoints: one column below 760px, two card columns at 760px and above. Stage width 700px,
page padding 24px on desktop and 16px on mobile. Brand mark 64px on desktop and 56px on mobile.
Theme option target 44 by 44 pixels. Radii are 10px for the Settings button, Close, and theme
control, 7px for the theme options, 16px for the dialog card, and 20px for tool cards. The popup
is a native `dialog` with a dimmed backdrop, centered at 420px, and it reuses the Settings card
layout: title row, bordered card, segmented control, hint. The font stack is unchanged: Inter first,
then the system sans stack. There is no external font request.

## Sources inspected

| Source | Revision | Inspected |
| --- | --- | --- |
| `ashcx/image-compressor-v1` README | `c1be7cc22d10120f7adca330b83b26370994a1ee` (2026-09-17) | 2026-11-01 |
| `ashcx/audio-toolkit-v1` README | `16f72aa586321e4353e9db3cd2cd979e06b35370` (2026-10-31) | 2026-11-01 |
| `ashcx/image-compressor-v1/src/app.css` tokens | `c1be7cc22d10120f7adca330b83b26370994a1ee` | 2026-11-01 |
| Audio Toolkit plan section 2 | `16f72aa586321e4353e9db3cd2cd979e06b35370` | 2026-11-01 |

Live status on 2026-11-01: `https://ashcx.github.io/image-compressor-v1/` 200,
`https://ashcx.github.io/audio-toolkit-v1/` 200, `https://ashcx.github.io/tools/` 404.

## Canonical URLs

| Route | Destination |
| --- | --- |
| `/tools/` | hub |
| `/tools/image-compressor/` | `https://ashcx.github.io/image-compressor-v1/` |
| `/tools/audio-toolkit/` | `https://ashcx.github.io/audio-toolkit-v1/` |

## Card copy

### Image Compressor

- Name: Image Compressor.
- One line: compress, convert, and resize images in batches.
- Formats: JPEG, PNG, WebP, AVIF and HEIC.
- Privacy: images are processed in the browser and are not uploaded.
- Caveat: AVIF and HEIC encoding is slower, and the size estimates are guidance, not a
  guarantee.

Every claim above is traceable to the image README. The README calls itself
speed-first; the hub does not repeat that as a superlative.

### Audio Toolkit

- Name: Audio Toolkit.
- One line: process a batch of audio or video soundtracks with one ordered recipe.
- Capabilities: extract, trim, gain, normalize, channels, sample rate, voice or music
  isolation, speech cleanup.
- Formats: MP3, AAC/M4A, WAV, FLAC and Opus/OGG.
- Privacy: media is processed locally and files are not uploaded.
- Caveat: isolation can take minutes and results vary; Firefox is unsupported.

The audio README does not state a Firefox limitation. The caveat above was dropped until a
source recorded it. The superseded card copy said that browser support varies for some codecs;
the rendered page no longer carries that caveat.

## Corrections applied after inspection

The audio README makes no Firefox claim, so the planned caveat "Firefox is unsupported" is not
used. Replacing it with an unsourced claim would be worse than omitting it.
