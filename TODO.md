# Media Toolkit TODO roadmap

Media Toolkit is a static hub that routes visitors to two browser-local tools:

- [Image Compressor](https://ashcx.github.io/image-compressor-v1/) — batch image compression,
  conversion, and resizing.
- [Audio Toolkit](https://ashcx.github.io/audio-toolkit-v1/) — ordered batch recipes for
  extracting, trimming, processing, and exporting audio.

Status: planning complete. Implementation not started.

Planned site: `https://ashcx.github.io/tools/` (not deployed; observed 404 on 2026-11-01).

## Why this shape

Both tools are already deployed as independent Vite + Preact GitHub Pages sites. Their Vite
configs hard-code these base paths:

- `/image-compressor-v1/`
- `/audio-toolkit-v1/`

On 2026-11-01 the user selected `https://ashcx.github.io/tools/` as the hub URL. GitHub Pages
project sites use the repository name as the path, so the hub repository must be
`ashcx/tools`. The local folder is named `media-toolkit`; the brand is Media Toolkit.

The hub therefore links to the existing sites. It does not rebuild, embed, or proxy them.
Keeping the three sites separately deployable avoids changing either app's base path, worker
URLs, or WebAssembly paths, and avoids a cross-repo build.

The Audio Toolkit header already points to `https://ashcx.github.io/tools/`. Once the hub is
deployed, that return link is correct without an audio code change. Its plan still contains an
older `/media-toolkit/` reference; aligning that sibling document is optional.

## Sprint sequence

| Sprint | Observable outcome | Status |
| --- | --- | --- |
| [1](Todo/sprint-1-tool-router.md) | Publish the Media Toolkit hub at `/tools/` with two tool cards, route aliases, and a recoverable 404 | Planned |

## External follow-ups

These are separate repositories. They are not part of the hub PR.

- [ ] Optional: align `audio-toolkit-v1/todo/audio-toolkit-plan.md` section 2 from
      `/media-toolkit/` to `/tools/`. Documentation only; no audio code, test, or deployment
      change. The Audio Toolkit code and release-acceptance note already use `/tools/`.
- [ ] Optional: add a return link from Image Compressor to `https://ashcx.github.io/tools/`.
      Not required for Sprint 1.

## Final acceptance

- [ ] `https://ashcx.github.io/tools/` returns 200 and renders both cards on desktop and
      mobile, in light and dark themes.
- [ ] `/tools/image-compressor/` reaches the live Image Compressor.
- [ ] `/tools/audio-toolkit/` reaches the live Audio Toolkit.
- [ ] Unknown paths return an HTTP 404 page with working recovery links.
- [ ] `npm test` passes, including link, redirect, accessibility, keyboard, no-JavaScript, and
      404 checks.
- [ ] Desktop and mobile captures are inspected and retained.
- [ ] Independent interrogate verdict is recorded in
      `docs/sprint-evidence/sprint-1/interrogate.md`.
- [ ] The sprint PR is open and links the plan, evidence, and verdict.
- [ ] Deployment is observed after merge, within the authorized scope.
- [ ] The Audio Toolkit return link to `/tools/` is verified live, or recorded as an external
      gap. No audio code change is expected.

## Start here

Read [orchestration](Todo/orchestration-plan.md), [Scrum policy](Todo/redesign-scrum-plan.md),
and [Sprint 1](Todo/sprint-1-tool-router.md).

The current request was planning-only. It does not authorize implementation, repository
creation, or deployment.
