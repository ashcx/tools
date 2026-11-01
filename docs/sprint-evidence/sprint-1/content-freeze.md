# Content freeze

Frozen on 2026-11-01 before any hub markup was written.

## User-directed reduction on 2026-11-01

The user called the first landing page text-heavy and asked for a logo, the tool name, and one
short descriptor. That instruction supersedes the card copy below. The rendered page now shows:

- Brand: Media Toolkit.
- Descriptor: Two browser-local tools for images and audio.
- Image Compressor summary: Compress, convert, resize.
- Audio Toolkit summary: Trim, process, export audio.
- Theme labels: System, Light, Dark.

The format, privacy, and caveat facts below stay in this record as the source of truth for the
two tools. They are not rendered, and the contract and verification script no longer assert them.

## Visual tokens after the redesign

The hub started from the Image Compressor's warm neutral tokens and reset them to a quieter
paper palette when the card lists were removed.

| Token | Light | Dark |
| --- | --- | --- |
| Page background | `#f4f1ea` | `#121211` |
| Surface | `#fbf9f4` | `#1c1b19` |
| Border | `#ddd7c9` | `#2e2c28` |
| Strong border | `#c9c2b1` | `#4a463f` |
| Text | `#1c1a17` | `#f2efe8` |
| Muted text | `#6d675d` | `#a19b90` |

Breakpoints: one column below 760px, two card columns at 760px and above. Stage width 700px,
page padding 24px on desktop and 16px on mobile. Brand mark 64px on desktop and 56px on mobile.
Theme option target 44 by 44 pixels. Radii are 12px for the theme control, 8px for its options,
and 14px for tool cards. The font stack starts with Inter and falls back to the system sans
stack. There is no external font request.

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
