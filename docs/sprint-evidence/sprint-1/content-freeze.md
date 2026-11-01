# Content freeze

Frozen on 2026-11-01 before any hub markup was written.

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

The audio README does not state a Firefox limitation. The caveat above is dropped until a
source records it, and the card instead says that browser support varies for some codecs.

## Corrections applied after inspection

The audio README makes no Firefox claim, so the planned caveat "Firefox is unsupported" is not
used. Replacing it with an unsourced claim would be worse than omitting it.
