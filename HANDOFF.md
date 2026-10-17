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
  timeline → dissolves while the next forms (ENTER .45, EXIT .55, OVERLAP .45).
  Master time is in viewport heights of scroll: each chapter's `scroll` in
  `content/chapters.ts` is how many viewports its content takes (×0.7 on
  touch), and its content timeline is time-scaled to fill exactly that.
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

## Story-flow rework (branch `story-flow`, started 17 Oct 2026)

Maria's brief: chapters felt repetitive (same layout, length and
transition). Three phases, each committed on `story-flow` and stopped for her
review; nothing merged to `main` or deployed. Copy, Urdu words and renders
are not to change.

- **Phase 1, pacing (done, awaiting review).** Each chapter's length is the
  `scroll` field in `content/chapters.ts` (viewports; was `pin`, which only
  ever set the total). Values: hero 1.4, Karachi 2.2, London 1.5 (was ~3.1),
  Back home 3, Karsaz 2.2, the window 6.5 (longest), Hello World 3, What I
  love 2.4, letter 5.5. Lines now fade up 18px instead of sliding out of an
  `overflow: hidden` mask, so a stopped scrub never shows a line cut in half.
  2024's terminal forms with the chapter and prints "Hello, World" as the
  "Two words printed…" line lands, so the chapter no longer opens empty.
- **Phase 2, a layout and transition per chapter (done, awaiting review).**
  Transitions live in `lib/transitions.ts` (per chapter enter/exit, only
  transform and opacity; the old blur dissolves are gone). Scenes can take
  over parts of the standard animation with `owns` and add a `YearNote`
  (`components/scenes/registry.tsx`). Per chapter:
  - Hero: the first scroll looks up (`--look` on the stage sinks the roof
    layers and Maria by depth via CSS `translate`), then the roof sinks away.
  - 2007: the kite climbs from her hand; lamps over the city render's real lit
    windows (`scripts/windows.mjs` → `components/scene/windows.json`) switch on
    one by one. String drawn in ink so it reads on the morning sky.
  - 2010: smaller year, DOM snow in front of the text (the shader's behind),
    slowing from "It didn't stick." via Web Animations `playbackRate`, melting
    out; a warm wash thaws into 2011.
  - 2011: CRT power-on entrance (`.crt-beam`), figure big on the left with
    the monitor glow filling the frame, text right-aligned on the right,
    flicker on both faces (CSS, masked to the render).
  - 2017: the year written digit by digit under a worked sum, "2007 + 10"
    (`KARSAZ_SUM` in `content/interactive.ts`, new words: ask Maria). The
    plane leaves on "I was going to fly." and flies off the top.
  - 2023 (`components/scenes/Sky.tsx`, scroll 8): no year at first, title and
    one centred line at a time; the paper plane comes in, stalls and falls;
    the eye chart (now left) blurs (`--worse`) to "Neither could I."; hard cut
    to black on "They closed the window to the sky."; a held beat; a cursor
    types "So I opened a terminal window."; the year appears last; a window
    opens out of the line and lands exactly on 2024's terminal.
  - 2024: cuts in around that terminal in the dark; Hello, World prints; 23
    stars gather into `printf("Hello, World");` and scatter back (an overlay,
    the shader is untouched); a warm glow returns.
  - What I love: pops in; no year, the Urdu word is the headline; the loves
    are stickers that pop in quickly; the board follows.
  - Letter (`components/scenes/Letter.tsx`): a paper card, no year; the roof
    slab comes back (not the parapet, it would cover the doors); the sky goes
    night → pre-dawn → dawn (new stop 10 in `lib/sky.ts`, colour data only);
    the desk fades and she stands on the roof again (pose-hero, decorative).
  - Verified: tsc, eslint, verify.mjs 42/43 (only the old 320px residuals),
    screenshots at 375/768/1440 and 2023 at ten points.
- **Phase 3, continuity and character (done, awaiting review).**
  - The thread (`components/scenes/thread.ts`, all drawn in each layer's
    pixels from her real hand and the real words): at the end of 2007 the
    string slips from her hand and the kite climbs off the top right; 2017
    opens with a dashed line coming down from the top right into her hand,
    and the plane flies it out the top left (`components/scenes/Karsaz.tsx`);
    2023's plane comes in at the top left drawing the same dashed line,
    stalls, falls and lands at her feet; after the cut it is the only thing
    in the dark, shrinks to a point, and the point rises to the start of the
    last line and becomes the cursor. London and 2011 carry no thread.
  - Time-skip: where she is older than the chapter before (2007, 2010, 2011,
    2017, 2024, What I love) her figure box flickers in and gives a small
    polaroid shake (`TIME_SKIPS` in `lib/chapterTimelines.ts`).
  - Placement (desktop): 2007 right; London small and further in; 2011 large
    left; 2017 taller and closer; 2023 small, centred under the line; 2024
    right at the desk; loves right; the letter at the desk, then on the roof.
  - Phones: 2024 and the letter put her centred in whatever height is left
    under the words (last grid row) instead of a corner. 2024 is still only
    ~17vh tall at 375×812: the lines and the terminal take the rest.
  - Verified: tsc, eslint, verify.mjs 42/43 (only the old 320px residuals),
    screenshots at 375/768/1440, 2023 at six points, the kite release.
- Temporary, not committed: `next.config.ts` reads `NEXT_DIST_DIR` and
  `.claude/launch.json` has a `dev-alt` server on :3005, so a second
  `next dev` could run while another session's server held :3000 with stale
  CSS. `git checkout next.config.ts .claude/launch.json tsconfig.json` and
  delete `.next-alt/` to undo.
- Sky rules: stars "rearranging into code" and
  "stop all background motion" touch the sky, which CLAUDE.md says not to
  change without her asking. She asked for both; done as overlays (glyphs, a
  black cut), the shader itself is unchanged.
- Her issue 4 ("the rooftop never returns") is half true: the city strip
  comes back after Hello, World; the roof and Maria do not.

## Approved copy and type system v2 (branch `story-copy`, 17 Oct 2026)

Maria supplied the final copy for every section, word for word, and asked
for one typography system. Not merged to `main`, not deployed.

- **Twelve sections** (`content/chapters.ts`): Opening (hero), Karachi
  August 2007, London 2010, Back to Karachi 2011, School years (new, uses
  the previously unused `pose-cityschool` render), Bahria College Karsaz,
  The plan changed (2023), Bahria University 2024, Outside the classroom,
  Explore (new: the interactive terminal and Sudoku moved here from 2024),
  A letter, Closing (new: the roof at sunrise, Maria standing again). Her
  section names are the headings; Opening and Closing headings are hidden.
  Urdu words she approved for the new ones: سبق lesson, تلاش exploring,
  سفر journey. `year` and `urdu` are optional now.
- **2023** has two lines: the plane flies, stalls and falls with the first,
  the chart blurs, the cut to black comes after the second, and the point
  the plane shrinks to becomes a lone cursor that opens the window onto
  2024's first program (which still prints Hello, World, no prompt).
- **Type system v2** (tokens at the end of `globals.css`, fonts in
  `app/layout.tsx`): Big Shoulders years at one size everywhere
  (`--t-year-size`; London is no longer smaller), Cormorant Garamond 500+
  italic headings, upright for reflective lines (2023, 2024's terminal line,
  the Explore invitation), DM Sans body, Caveat for the letter in ink blue on
  rules that sit under every line with a blank rule between paragraphs, Plex
  Mono for labels, menu numbers, buttons, the terminal. Fraunces is gone;
  `--font-serif-stack` now points at Cormorant. The menu lists section names
  in Cormorant italic, sentence case.
- **Letter on phones**: the card covers the desk until the second half is
  written, then lifts by 36vh as you scroll (`--lift`, through `top`).
  verify.mjs therefore reports the letter's top above the screen at the end
  on phones; that is the intended lift.
- **verify.mjs**: 42/43. The responsive scan's remaining items are the old
  18px chess squares under 360px, 2024's terminal 10px over at 320×568, and
  the letter lift above.
- **Screen-by-screen transitions brief** (ink bleed, CRT, fly-through, type
  as you scroll, chai steam, envelope letter; references in `reference/`):
  only screen 1 was built (constellations between the shader's own stars);
  it is parked in `git stash` "screen 1: constellations (awaiting review)",
  made before this copy pass, so it needs re-applying to the new hero.
  Maria will decide later. Screens 2 to 9 not started.

## Live-site fixes (branch `fixes`, 17 Oct 2026)

- **One section at a time**: every exit finishes before the next section
  forms (`lead: 1` in `lib/transitions.ts`), transitions are 0.3 to 0.45
  viewports, and words start arriving as a section forms (lines at 0.3,
  title at 0.1). Only 2023 → 2024 overlaps, by design (the cut).
- **No long empty stretches**: `node scripts/gaps.mjs` (needs the dev server;
  `SITE_URL=` to point it elsewhere) walks the whole story and prints
  overlaps and stretches with nothing readable. After the fix: no
  overlaps; at most 0.25 to 0.4 of a viewport between sections, and 0.45 for
  2023's dark beat. The opening no longer empties itself before leaving;
  2023 starts its first line with the plane (scroll 4.6, was 6).
- **2024**: the window is centred on the black, up to 760px wide, prints
  Hello, World, then fades out as the dark lifts; the floating code
  characters are gone. On phones the figure gets the terminal's old room.
- **2011 and School years**: body 17 to 21px, weight 500, full ink, above the
  monitor's glow, with a light halo. Measured against the darkest sky pixel
  under each line: 10.8:1 to 14.7:1 desktop, 11.0:1 to 18.0:1 phone.
- **Outside the classroom**: plain lines like every other section; the
  sticker treatment is gone.

## Creative pass: set pieces, chai, letter (branch `chai-letter`, 17 Oct 2026)

Maria compared the site with a competitor's (taibaworld.vercel.app, inspected
in the browser pane at ~736px: hero, collage, a sideways "walk with me"
journey, letter-roll chapter titles, cats, a notes wall) and asked for a
bolder, cinematic pass. Direction agreed: bold set pieces between calmer
sections, nothing copied from the competitor.

- **Ink bleed, opening → 2007** (`lib/setpieces.ts` `buildInk`, drawn on the
  stage's effects layer `components/stage/Fx.tsx`): گھر draws itself stroke
  by stroke, the ink floods the frame in 2007's dawn (an SVG goo filter with
  a turbulence wobble; phones get the filter without the turbulence), 2007
  forms underneath and the word settles into the chapter's Urdu spot. The
  word is centred on its glyph ink (`measureText`), not `getBBox`, whose
  Gulzar line box is far taller than the letters. The hero's exit is 1.7
  viewports with `lead: 0.8`; karachi enters instantly under the ink.
- **Split-flap years** (`splitFlap` in `lib/chapterTimelines.ts`): 2007,
  2010, 2011 and 2024 flip up from the previous year, digit by digit, with a
  departures-board split line; 2017 keeps its handwritten sum, 2023 its
  reveal-last.
- **Fly-through, 2017 → 2023** (`buildFly`): the paper plane comes at the
  camera from where Karsaz's plane ends (now on screen at 22%, 20%), mist
  and clouds stream past, 2023 settles from 1.12 scale.
- **Opening entrance** (`components/chapters/Hero.tsx`): the roof settles
  from 1.05, she arrives, the question rises word by word, then the intro,
  then the cue. **Constellations** are back (`components/scenes/Constellations.tsx`)
  and a rare **shooting star** crosses the opening sky (`ShootingStar.tsx`).
- **2024's hinge line**: "They closed the window to the sky." arrives, then
  "So I opened a terminal window." types itself with a cursor that follows
  the letters and stays blinking after.
- **Chai steam** (`components/scenes/ChaiSteam.tsx`) and the **envelope
  letter** (`components/scenes/Letter.tsx`), after `reference/chai-letter.html`:
  see the code comments. The letter is scroll 7; the closing opens at dawn.
- **Small things**: tap a London snowflake to melt it; hidden terminal
  commands `sudo fly` and `cat chai.txt` (words in `SECRETS`,
  `content/interactive.ts`, new and Maria's to change); one hover/press/focus
  language for every control; terminal lines type in, errors shake.
- **Assets**: `docs/asset-brief.md` has six prioritised Gemini prompts
  (closing pose, London rooftop strip, cloud cut-outs, airfield strip, a
  London reaction pose, paper textures). None generated yet.

## New renders, round 2 (branch `assets`, 17 Oct 2026)

From `docs/asset-brief.md`, Maria generated four of the six; all are integrated.

- **Closing**: Gemini returned a full sunrise scene (not a green-screen
  figure), used as the closing's scene: `public/scene/closing-sunrise*`
  (2400 and 1200 wide, avif and webp; a blink copy flashes every 6.2 s). It
  sits as a band fading up into the dawn sky so the words stay on clear sky.
  The stage no longer brings the roof back for the closing; the city strip
  leaves behind the letter's room.
- **London catch** (`pose-london-catch`, cut out): laid over her figure for a
  moment when a snowflake is tapped.
- **Airfield** (`public/scene/airfield-strip`): 2023's horizon, under the cut.
- **Clouds** (`public/scene/cloud-1..3`): drawn in the fly-through in place of
  the soft puffs. Clouds and airfield are keyed with `despillAll`
  (`scripts/cutout.mjs` overrides) to remove the green on their soft edges.
- Still to generate: the London rooftop strip and the paper textures.
  Originals live in `public/_raw` and `public/_raw/scene` (not committed).

## Half-done / waiting on Maria

- **Her own copy.** Done: every section now uses her approved copy.
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
hard-coded at the top of each): `AT=0.05,0.5,0.95 scripts/shots.mjs [out] [mobile|desktop] all`
shoots start/middle/end of every chapter, `scripts/sheet.mjs` tiles them;
`scripts/shots.mjs [out] [mobile|desktop]
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
   `1.2 + lines × 0.55 + 1.2` (internal proportions; the chapter's `scroll`
   sets how long it really takes), and the Karsaz plane leaves on the last line.
2. Resolve the three chronology questions with her, then align `PLAN.md`.
3. Full-size pose-karachi render, re-cut, re-check the string anchor.
4. Her real-phone pass; fix whatever she reports.
5. Optional, if time: half-size avatar variants with `srcset` for 1×
   desktops; 320×568 fit; a `<noscript>`/no-WebGL check on a real low-end
   device; ambient sound (off by default) from the original plan.
