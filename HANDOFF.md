# HANDOFF — "Who Am I?" (Aasmaan), Maria Shamim's story site

Written 17 Oct 2026 for a fresh session with no memory of the previous chat.
Read this, then `PLAN.md` (the original concept, partly outdated in the
timeline section) and `docs/avatar-prompts.md` (how every render was made).

## What this is

A personal storytelling site for a team web-design competition (judges: Issa
and Ajwad; criteria they sent on 14 Oct: copy, structure, consistency,
personality, idea, execution, mobile, a CTA is required, "no AI slop" is
marked down). Not a portfolio. Live at **https://mria-sm.vercel.app**, repo
`github.com/mariashamim/mria-sm`, branch `main`, **every push deploys**.
Deadline was 16 Oct 2026 and was extended to "a month or more" on 10 Oct.

Concept: one continuous Karachi sky from pre-dawn to night as you scroll; her
life told as what happened under it, with stylised 3D renders of her (made in
Gemini from the prompt pack, cut out by `scripts/cutout.mjs`). Chapters:
hero (now, on the roof) → 2007 born → 2010 London → 2011 back home / City
School / brother Sharjeel's PC → 2017 Bahria College Karsaz, pre-engineering,
the paper plane → 2023 the window closed (PAF GD Pilot, eyesight failed the
medical) → 2024 Hello, World (CS at Bahria University) → What I love → A
letter to her three-year-old self, with the CTA under it.

## Stack

Next.js 16.4 (App Router, Turbopack), React 19, GSAP 3 (ScrollTrigger,
SplitText, MotionPath) via `@gsap/react`, Lenis smooth scroll, OGL sky
shader, three.js only for the intro jet (lazy), zustand for tiny UI state,
Tailwind installed but the styling is one hand-written `app/globals.css`
(long; new work is appended in dated blocks at the end, cascade order
matters). Fonts via next/font: Big Shoulders (display), Fraunces (serif),
Gulzar (Urdu), IBM Plex Mono. No tests framework; see "Verification".

## Architecture you must understand before touching motion

- **The stage** (`components/stage/Stage.tsx`, `lib/stage.ts`,
  `lib/chapterTimelines.ts`): one pinned viewport for the whole story. One
  master GSAP timeline scrubbed by scroll; every chapter is an absolutely
  stacked layer that forms (autoAlpha, scale .94, blur) → plays its content
  timeline → dissolves while the next forms (ENTER .6, EXIT .7, OVERLAP .45).
  Sky colour and "active chapter" are sampled by master time (`skyAt`,
  `activeAt`). `scrollToChapter(id, {immediate})` jumps by master time.
  Dev handle: `window.__stage = { master, segments, duration }`; also
  `window.__st`, `window.__gsap`, `window.__lenis`, `window.__intro`.
- **Rule: a time-based tween and a scroll tween must never share an
  element.** ScrollTrigger renders the scrubbed timeline through on refresh
  and records start values then. The hero entrance animates `.stage__roof`
  roots + `.hero__figure-in`; the scroll timeline animates rooftop layers +
  `.hero__figure`. Same idea in the 2007 kite (SMIL sway on inner groups,
  scroll on the outer group) and the eye chart (`--auto-gaze` from the
  timeline, `--held-gaze` from the pointer, CSS picks).
- **First frame**: the black veil is server-rendered (`components/ui/Intro.tsx`,
  phases veil → flyby → done); everything the animations bring in starts
  hidden in CSS ("the first frame" block in globals.css). Any new animated
  element whose start state differs from its SSR state will flash: add it
  there, with explicit `fromTo` values (never `gsap.from` onto a CSS-hidden
  element, it tweens 0→0).
- **Intro**: the flyby (`lib/flyby.ts`, code-built jet). Once per session
  (`sessionStorage aasmaan-intro-seen`), skipped by any key/click/scroll,
  skipped entirely when the URL has a `#chapter` hash. Dev: set
  `aasmaan-intro-hold = 1` to pause it, scrub `window.__intro.progress(x)`.
- **Scenes** (`components/scenes/registry.tsx` + files): karachi (kite +
  pointer/tilt wind), karsaz (paper plane), sky (contrail, dim, lit screen,
  `EyeChart.tsx`), hello (terminal + `TerminalPrompt.tsx`), loves
  (`MateInOne.tsx`). Words for the interactive bits live in
  `content/interactive.ts`; the three CTA links in `content/links.ts`.
- **Content**: `content/chapters.ts` is the single source for years, rail
  labels, titles, lines, figures (pose + alt). The timeline rail years are
  `RAIL_YEARS` there.

## Decisions made with Maria (do not re-litigate)

- Calm, "not too much happening"; benchmark singularity.engl.design (one
  flow, no PowerPoint cuts). She rejected a fixed-stage crossfade at first,
  then asked for exactly that flow once she saw the prototype; the stage is
  the answer.
- Sky shader stays v1: an added star layer read as snow, a dropping horizon
  flattened the skies. Do not add ambient sky motion.
- Intro = the jet crossing left to right while she is on the roof, nothing
  else (cockpit, cuts, camera moves were all rejected). "Farther and smaller"
  was the final knob.
- Ginger the cat was removed from the site entirely on 10 Oct. Do not re-add.
- Type system (16 Oct, after a judge said fonts felt incoherent): Big
  Shoulders for name/years/menu, Fraunces for every sentence (italic titles
  and the letter, upright lines/body), Plex Mono for labels, Urdu accent.
  Hanken Grotesk was dropped. Note `.topbar button { font: inherit }` outranks
  `.topbar__mark`; the top bar fonts are set with `.topbar button.topbar__mark`.
- Terminal is a DOS window (C:\MARIA\FIRST.C, `>` prompt, scanlines,
  ▸ SUDOKU.EXE) to match the Sudoku window, after "looks AI generated".
- CTA ("the doors"): P.S. under the letter + same links in the menu. Chai =
  mailto:mariashamim.09@gmail.com, Chess = chess.com/member/Miaaaa_9
  (assumed chess.com, not lichess), Hello = linkedin.com/in/maria-shamim007.
  She chose LinkedIn over Instagram.
- Interactions she picked (of six offered): eye test, terminal that answers,
  kite in the breeze, mate in one. Ambient sound and cursor-reactive stars
  were skipped.
- Chronology (17 Oct, her facts): born Aug 2007; London 2010 at "two, going
  on three"; back 2011; Karsaz "from 2017" then pre-engineering; the window
  2023 at sixteen; university 2024 at seventeen (rail year 2024 added).
- Deploying: the audit brief said "do not deploy without permission"; she
  then said "deploy". Later tasks pushed directly. If a task says not to
  deploy, commit locally and ask.

## Done (all on main, live)

Stage, flyby intro, 2007 kite + toddler render (low-res source, see
below), 2023 figure placement + eye chart, DOS terminal with commands
(help, whoami, ls, cd <year>, chai, chess, hello, sudoku, clear), chess
mate-in-one, the doors, first-frame fix, type system, strip blend,
clothesline fix (near roof fades as it sinks), accessibility pass (real h1,
h2 titles, menu focus in/out, 24px targets, AA dim text), deep links
(`#loves` lands and the hash follows the chapter; the App Router's own hash
scroll lands at the stage top so the jump is retried at 60/400/1000 ms),
responsive pass from 375px up, Lighthouse: desktop 51/100/100/100, mobile
37/100/96/100 (JS-heavy by nature; the veil delays LCP by design).

## Half-done / waiting on Maria

- **Her own copy.** 2011 lines, Karsaz lines, the letter, the hero title and
  the site description are still my drafts. Judges mark "AI slop"; she must
  rewrite these in her voice. 2007, "The window closed", Hello World and
  "What I love" lines are hers.
- **pose-karachi render is low-res** (1024px source → 271×492 cut-out).
  She should re-save the green-background render from Gemini at full size
  to `public/_raw/pose-karachi.jpeg`, then `node scripts/cutout.mjs
  pose-karachi`. The string anchor (`HAND` in `components/scenes/Karachi.tsx`)
  may need a nudge.
- **Open chronology questions** she has not answered: PAF application year
  (2023 makes her sixteen at the medical), Karsaz join year (2017 is from
  her plan), "Spring 2025" for the assembly Sudoku. `PLAN.md` and
  `docs/avatar-prompts.md` still say "2017–23 Karsaz" and "London age 3";
  internal docs, left alone.
- Page `<title>` is "Maria Shamim"; description is my draft.
- Real-device checks she was asked to do and never confirmed: touch feel,
  the eye chart drag, tilt wind on 2007, a chapter link from another device.

## Known bugs and limits

- 320×568 viewports: 2023, Hello World and What I love run 40–80px past the
  bottom. 320×658 and 375+ fit (loves is ~10px over at 320×658).
- Chess squares are 18px under 360px wide (24px elsewhere).
- Mobile Lighthouse performance 37 under 4× throttling. Biggest costs: GSAP
  + Lenis + OGL + three.js, SplitText DOM (~990 nodes), and the intro by
  design. Not fixed: smaller 1× image variants (~300 KiB), a lighter jet.
- `prefers-reduced-motion`: static stacked layout, verified only headless.
- The Vercel MCP in the old session was scoped to another team (403); deploy
  checks are done with curl against the live URL.

## Dev gotchas (they each cost a loop once)

- **CSS edits often never reach the browser under `next dev`** (Turbopack
  cache). Stop the server, `rm -rf .next`, start again. TSX hot-reloads fine.
- Stuck server on :3000: find the PID with `netstat -ano | findstr :3000`,
  `taskkill /PID <npm pid> /T /F`, clear `.next`.
- The desktop app's browser pane: hidden pane pauses rAF (scrub timelines
  freeze); page-opened popups (the chess/LinkedIn doors) block all scripting
  until the user closes them; the pinned stage keeps its old width after a
  resize until `window.__st.refresh()`. To park a chapter for measurement:
  `window.__stage.master.progress(t)` plus `window.__lenis.scrollTo(y,
  {immediate:true})`, not the scrub.
- `querySelector('#id .a, .b')` scopes only the first selector.

## Verification (run these before and after any change)

```bash
npx tsc --noEmit -p .
npx eslint app components lib content scripts/*.mjs --max-warnings=0
npx next build
node scripts/verify.mjs          # needs `next dev` on :3000 (uses window.__stage); 43 checks, ~4 min
```

`scripts/verify.mjs` covers console/network errors, headings, metadata,
images, menu/rail/deep-link navigation, terminal, chess, Sudoku, eye chart,
kite, keyboard focus rings, a responsive scan at 320/375/430/768/1024/1366/
1440/1920 and reduced motion. Expected: 42/43, the one failure being the
320×568 residual above. `SHOTS=1 OUT_DIR=.shots/x` saves screenshots.

Other harnesses (all headless Edge over DevTools, Windows path to msedge
hard-coded at the top of each): `scripts/shots.mjs [out] [mobile|desktop]
[chapters]` renders chapters (`VIEW=2560x1080`, `SITE_URL=`, `CDP_PORT=`);
`scripts/firstframes.mjs` screenshots the first seconds of a load (test
against `npx next build && npx next start -p 3001` with
`SITE_URL=http://localhost:3001`, dev timings mean nothing). Lighthouse:
`CHROME_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npx lighthouse@12 http://localhost:3001/ --preset=desktop
--chrome-flags="--headless=new"`. Headless Edge processes outlive the
scripts; stop them with PowerShell `Get-CimInstance Win32_Process` filtered
on `--headless=new`. `.shots/` is gitignored.

## Next steps, in order

1. Get Maria's rewrites of the 2011, Karsaz and letter copy and the hero
   title/description; paste them into `content/chapters.ts` (lines arrays)
   and `app/layout.tsx`. Keep line counts similar: chapter timing is
   `1.2 + lines × 0.55 + 1.2`, and the Karsaz plane leaves on the last line.
2. Resolve the three chronology questions with her, then align `PLAN.md`.
3. Full-size pose-karachi render, re-cut, re-check the string anchor.
4. Her real-phone pass; fix whatever she reports.
5. Optional, if time: half-size avatar variants with `srcset` for 1×
   desktops; 320×568 fit; a `<noscript>`/no-WebGL check on a real low-end
   device; ambient sound (off by default) from the original plan.
