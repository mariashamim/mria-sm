# CLAUDE.md

Maria Shamim's story site, "Who Am I?" (working name Aasmaan). A personal
narrative for a web-design competition, not a portfolio. Live at
https://mria-sm.vercel.app; every push to `main` deploys. Read `HANDOFF.md`
for the current state and open items, `PLAN.md` for the original concept.

## Stack

Next.js 16.4 App Router (Turbopack), React 19, TypeScript, GSAP 3
(ScrollTrigger, SplitText, MotionPath, `@gsap/react`), Lenis, OGL sky
shader, three.js (intro jet only, lazy), zustand, next/font (Big Shoulders,
Cormorant Garamond, DM Sans, Caveat, Gulzar, IBM Plex Mono). Styling is one hand-written
`app/globals.css`; Tailwind is installed but not used for the site's look.
`sharp` for the cut-out script. No test framework; see Verify.

## Folders

- `app/` layout (fonts, metadata, noscript), page, globals.css, OG image.
- `content/` the single source of copy and data: `chapters.ts` (years, rail,
  titles, lines, figures, sky keyframes), `interactive.ts` (terminal,
  eye chart, chess words), `links.ts` (the three CTA links).
- `components/stage/` the pinned stage; `components/chapters/` Hero and
  Chapter layers; `components/scenes/` per-chapter scenes and interactive
  pieces; `components/scene/` the rooftop set; `components/sky/` the
  shader; `components/ui/` Intro, Menu, Rail, Cursor; `components/sudoku/`.
- `lib/` stage maths (`stage.ts`), chapter timelines, sky colour stops,
  gsap/lenis singletons, the flyby, UI store.
- `public/avatar/` cut-out renders + manifest; `public/scene/` rooftop
  layers; `public/_raw/` (gitignored) Gemini originals; `scripts/`
  cutout, og, and the headless harnesses (shots, firstframes, verify).

## Run, build, verify

```bash
npm run dev                         # :3000; dev-only handles window.__stage/__st/__gsap/__lenis/__intro
npx tsc --noEmit -p .
npx eslint app components lib content scripts/*.mjs --max-warnings=0
npx next build && npx next start -p 3001
node scripts/verify.mjs             # against next dev; 43 checks, expect 42/43 (320x568 residual)
```

If a CSS change does not show up in the browser, stop the dev server,
`rm -rf .next`, start again. TSX hot-reloads; CSS often does not.

## How the site is built

- One pinned viewport. A master GSAP timeline is scrubbed by scroll;
  each chapter is a stacked layer that forms, plays its content timeline
  (`lib/chapterTimelines.ts`), and dissolves while the next forms. Sky and
  active chapter are sampled by master time (`lib/stage.ts`).
- Master time is in viewports of scroll. Each chapter's `scroll` (content/chapters.ts)
  is its length; its content timeline (internally `1.2 + lines × 0.55 + 1.2`)
  is time-scaled to fill it. Scenes hook in through
  `SCENES[id].build({ tl, el, total, reduced })` in
  `components/scenes/registry.tsx`.
- Figures: `figures: [{ pose, alt, size, blink, mask }]` in chapters.ts;
  the pose must exist in `public/avatar/manifest.json` (made by
  `node scripts/cutout.mjs <pose>` from a green-background render).
- Intro: server-rendered black veil, then the flyby once per session; a
  `#chapter` hash skips it and lands on the chapter.
- Reduced motion: `.stage--static`, layers in reading order, scenes static.

## Conventions

- A time-based tween and a scroll tween never target the same element
  (ScrollTrigger records start values on refresh). Use wrapper elements.
- New animated elements start in their pre-animation state in CSS (the
  "first frame" block in globals.css) and are animated with explicit
  `fromTo`/`autoAlpha` values; never `gsap.from` onto a CSS-hidden element.
- CSS is appended in dated, commented blocks at the end of globals.css;
  later rules win, so check for an existing rule before adding one.
- Type (tokens in the "type system v2" blocks of globals.css): Big Shoulders
  for the years and the wordmark, Cormorant Garamond (500+) for headings and
  reflective lines, DM Sans for body, Caveat for the letter, Plex Mono for
  labels, navigation, buttons and the terminal, Gulzar for every Urdu word.
- GSAP writes an inline `translate: none` on any element whose transform it
  animates; give such elements CSS offsets through `top` or margins, never
  the `translate` property.
- Phones (≤900px) lay out text → piece → figure; per-chapter heights via
  `--m-fig`. Keep every target ≥24px. Test 375 and 1280 at minimum.
- Dev handles and `__stage` exist only when `NODE_ENV !== 'production'`.
- Words for new interactive pieces go in `content/`, not in components.
- Commit messages describe the change in plain sentences; no emoji.

## Never do these without Maria asking

- Change her copy: any `lines`, titles, the letter, the P.S., the terminal
  `whoami`, or the Urdu words and their meanings in `content/chapters.ts`.
  Fixing a date or age is fine with the smallest natural edit; rewriting is not.
- Re-add Ginger the cat, add ambient sky motion, change the sky shader, or
  replace the code-built jet.
- Swap the renders, regenerate avatars, or change the CTA links.
- Add dependencies, a UI kit, or Tailwind utility classes to the site.
- Deploy when a task says not to: pushing `main` deploys. Commit locally
  and ask.
