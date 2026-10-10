# Aasmaan (آسمان)

Maria's "Who Am I?" story site. One day under one sky: the page is a single sky that moves from pre-dawn to night as you scroll, and the chapters of Maria's life are what happened under it.

- Plan and storyboard: [PLAN.md](PLAN.md)
- Avatar prompt pack: [docs/avatar-prompts.md](docs/avatar-prompts.md), ready-to-paste version in [docs/prompts-ready-to-paste.md](docs/prompts-ready-to-paste.md)
- Gemini procedure: [docs/gemini-howto.md](docs/gemini-howto.md)

## Stack

Next.js 16 (App Router, TypeScript), GSAP ScrollTrigger + SplitText, Lenis smooth scroll, OGL for the sky shader, Zustand for the shared scroll state, Tailwind 4 for utilities. Fonts via `next/font`: Big Shoulders Display, Fraunces, Hanken Grotesk, Gulzar, IBM Plex Mono.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

```
app/            layout (fonts, shell), page (chapter order), globals.css (tokens, layout)
components/
  sky/          SkyCanvas (WebGL) + shaders; CSS fallback when WebGL is missing
  scroll/       Lenis + GSAP ticker bridge
  chapters/     Hero, the generic pinned Chapter, the Skyline silhouette
  ui/           Intro, Rail, Menu, Cursor
content/        chapters.ts: copy, Urdu words, pin lengths, sky keyframes
lib/            sky stops and blending, progress store, Lenis singleton, GSAP setup
public/_raw/    raw Gemini renders and reference photos (ignored by git)
```

## Deploy

The site deploys on Vercel from this GitHub repository. Every push to `main` deploys to production at `mria-sm.vercel.app`; other branches get preview URLs.
