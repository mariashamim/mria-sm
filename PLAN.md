# Aasmaan (آسمان) — Maria's "Who Am I?" site

Master plan · written 10 October 2026 · deadline: extended, a month or more (we aim for a presentable v1 by 20 October and keep polishing)

---

## 1. The idea in one paragraph

One day, under one sky. The whole site is a single continuous sky that moves from pre-dawn to night as you scroll, and Maria's life is told as what happened under it. Born under Karachi's sky in 2007. A grey London winter that didn't stick. A bright childhood at City School with an older brother's PC. A golden plan at Bahria College Karsaz to become a fighter pilot. A dusk where the sky said no. A night where a different glow appeared on a laptop screen. The avatar ages chapter by chapter; Ginger the cat is in every scene. It ends with a letter to the three-year-old in Southall, and the sky returns to pre-dawn, so the day ends where it began.

Why this wins on the three judging criteria:

- **Design.** One strong visual system (a living sky, a condensed display face against an italic serif, a stylised 3D avatar) instead of many unrelated effects. Restraint reads as expensive.
- **Flow.** The sky is a literal progress bar. The palette tells you where you are in the story before you read a word. A rail of years on the right confirms it.
- **Content & structure.** A true arc with a hinge (the rejection) and a payoff (the first program that worked), told in first person, ending on a letter rather than a contact card.

Working name: **Aasmaan** (Urdu for sky). The browser title is simply "Maria".

---

## 2. Decisions locked in our Q&A

| Area | Decision |
|---|---|
| Concept | Avatar-led journey through real chapters |
| Mood | Time-of-day palette arc (sky as narrative) |
| Avatar | Stylised 3D render, stylised likeness of Maria |
| Likeness | Light warm brown skin, oval face, large dark brown almond eyes, medium natural eyebrows, soft rounded nose, long thick straight layered dark hair always loose (no hijab in any scene), slim and average height, soft closed-mouth smile; round thin glasses only at screens; signature everyday outfit is a dusty-rose square-neck kurta with white scalloped lace trim over wide-leg white palazzo trousers and cream flats (hero, character sheet, letter); dusty-blue kurta at the desk; terracotta kurta on the night rooftop |
| Companion | None. Ginger the cat was rendered and tried in every chapter on 10 October, then removed at Maria's request: the site is about Maria alone. The storyboard's cat beats below are superseded. |
| Person named | Sharjeel, older brother, first guide to computers and games |
| Hinge | PAF GD Pilot application and rejection, told as the pivotal turning point |
| The click | First "Hello, World" / first program that ran |
| Kafeel origin | A gap in society: no real elderly-support system in Pakistan |
| Loves | Valorant and shooters, Minecraft and cozy builders, mobile games (PUBG, chess, puzzles), Coke Studio and Urdu music, chai and Karachi street life, badminton and table tennis, cats |
| Home anchor | A rooftop with the Karachi skyline |
| Voice | Warm, honest, lightly witty first person |
| Urdu | One Nastaliq word per chapter as a typographic accent |
| Hero | No words: the avatar and the sky only; words arrive on first scroll |
| Ending | A letter to my younger self; no contact card |
| Scroll model | Smooth long scroll (Lenis) with pinned, scroll-scrubbed scenes |
| Intro | Short cinematic intro, 2 to 3 seconds, skippable |
| Sound | Optional ambient layer, off by default, plus tiny UI sounds |
| Cursor | Custom cursor that reacts to scenes |
| Navigation | Thin timeline rail with years, plus a corner menu |
| Easter egg | Hidden playable Sudoku on the monitor in the university chapter |
| Type | Condensed sans headlines + italic serif accents |
| Motion | Cinematic but calm |
| WebGL | Light touch: one shader sky plus grain and particles |
| Devices | Desktop-first, mobile fully working |
| Stack | Next.js + GSAP ScrollTrigger + Lenis |
| Deploy | GitHub repo, imported into Vercel; URL `mria-sm.vercel.app` |
| Avatar production | Maria generates in Gemini from the prompt pack in `docs/avatar-prompts.md` |
| Photos available | Karachi places (rooftop, street, sea) and old family photos of London / Southall |
| Presenting | Nothing extra; Maria scrolls |
| Red lines | None; Maria vetoes in review |

---

## 3. Narrative spine

The sky moves through nine states. Each chapter owns one. The rail on the right marks the years.

| # | Years | Chapter | Urdu accent | Sky | Avatar | Ginger's beat |
|---|---|---|---|---|---|---|
| 0 | — | Intro | آسمان (sky) | Black to pre-dawn | Silhouette | — |
| 1 | now | Hero | — | Pre-dawn navy | 19, kurta, hair loose, looking up on the rooftop | Sitting beside her, also looking up |
| 2 | 2007 | Karachi | گھر (home) | Dawn cream and peach | None (title chapter) | A tiny Ginger walks across the skyline line |
| 3 | 2010–11 | London | برف (snow) | Grey morning, snow | 3, puffer coat, oversized backpack | Peeking from behind a red post box |
| 4 | 2011–17 | Back home | دوستی (friendship) | Bright noon | 8, City School white kameez with maroon collar, single plait; then at home behind Sharjeel's chair | Asleep on the PC tower |
| 5 | 2017–23 | Karsaz | حساب (calculation) | Golden afternoon | 16, navy Karsaz pinafore over lilac shirt, white dupatta, single plait, paper plane in hand | Batting at the paper plane |
| 6 | 2023 | The sky said no | آسمان (sky) | Dusk to storm to near-black | 18, white shirt, small against a huge sky | Sits at her feet, the only warm colour on screen |
| 7 | 2023–now | Hello, World | پہلا (first) | Blue hour to night | 19, dusty-blue kurta, round glasses, at the desk | On the desk, staring at the cursor |
| 8 | now | What I love | چائے (chai) | Night, city lights | 19, hair loose, headphones, chai, cross-legged on the rooftop | Finally in the spotlight: asleep on the keyboard |
| 9 | now | A letter | خط (letter) | Night fading back to pre-dawn | 19, writing at the desk, glasses off | Curled in the lamp light |

---

## 4. Scene-by-scene storyboard

Copy lines below are drafts in Maria's voice. They exist to show tone and length; Maria rewrites any she doesn't recognise as her own.

### 0 · Intro (2–3 s, skippable with any key or click)

- Black screen. A single thin horizon line draws itself across the middle (SVG stroke).
- Above the line the sky lifts from black to pre-dawn navy; below it the Karachi skyline silhouette fades in.
- The Urdu word آسمان resolves in Nastaliq, then dissolves upward like breath.
- Assets finish loading behind this. If loading is slow the horizon line keeps breathing until ready.

### 1 · Hero (pre-dawn, wordless)

- Full-viewport sky. Stars still visible, thinning near the horizon.
- Present-day avatar on the rooftop in the dusty-rose kurta and white palazzos, three-quarter view, looking up. The pink is the one warm note against the pre-dawn navy and sets the avatar's signature colour for the whole site. Ginger beside her. Water tank, antenna and a kite string in silhouette.
- The only UI: the timeline rail (2007 glowing faintly at the top), the corner menu, the sound toggle, and a small "scroll" cue that breathes.
- On the first scroll the word **Maria** rises behind the avatar in the condensed face, enormous, then the whole scene parallaxes away as the sky brightens.

### 2 · 2007 · Karachi (dawn)

- A title chapter: **2007** fills the viewport in the condensed face; گھر floats behind it in Nastaliq at low opacity.
- Sky warms to cream and peach. Crows cross (tiny animated silhouettes). The skyline from the hero stays, now in daylight.
- Copy (draft): "I was born in Karachi in 2007. A loud city got one more voice." Then: "(Ginger came much later. She insists on being in every scene anyway.)"
- Motion: words reveal line by line as the sun's glow rises from the horizon in the shader.

### 3 · 2010–11 · London (grey morning, snow)

- Sky desaturates to silver. Snow particles begin in the shader, slow and large.
- Avatar at age three in a puffer coat and an oversized backpack at the Tudor Primary gate. Southall high street behind: shop signs in Punjabi and Urdu script, a red bus, a post box with Ginger peeking out.
- Two or three of the real old family photos appear as grain-treated prints that drift in on scroll (faces cropped or softened).
- Copy (draft): "When I was three we moved to London. It didn't stick." / "I remember the snow more than the school. I remember Southall sounding like home with a different accent."
- The one accent colour in this chapter is red (bus, post box). Everything else is cold.

### 4 · 2011–17 · Back home (bright noon)

- Sky snaps to saturated blue; the sun glow sits high. The widest, happiest chapter.
- Two beats inside one pinned section, panned horizontally as you scroll:
  1. City School: avatar at eight mid-step with a backpack in the white kameez with maroon collar and the round TCS crest, hair in a single plait, friends as soft silhouettes beside her, a playground.
  2. Home: the family PC. Sharjeel in the chair (back view, a silhouette with a headset), Maria peeking over the chair back. The CRT glow is the first "screen light" on her face in the story.
- Copy (draft): "Back in Karachi, City School, and a group of friends I still have." / "Sharjeel had the PC first. I had the chair behind him. That's where the whole thing started, if I'm honest."
- Ginger is asleep on the PC tower.

### 5 · 2017–23 · Karsaz (golden afternoon)

- Sky turns amber and ochre. Long shadows.
- Avatar at sixteen in the Karsaz uniform: navy sleeveless pinafore over a pale lilac shirt, white dupatta, hair in a single plait, physics notebook under one arm, a paper plane in the other hand. Vector diagrams and equations drift in the background as thin white lines.
- The paper plane is the chapter's motif: it leaves her hand on scroll and climbs toward the top of the viewport. The cursor becomes a paper plane here.
- Copy (draft): "Bahria College Karsaz. Pre-engineering. Maths, physics, and a plan: I was going to fly."
- Ginger bats at the plane as it leaves.

### 6 · 2023 · The sky said no (dusk, storm, near-black)

- The hinge. The slowest pin on the site (roughly 400vh of scroll).
- The sky takes most of the screen. The avatar at eighteen in a white shirt and black trousers, hair loose down her back, is small at the bottom edge, looking up. This pose deliberately rhymes with the hero: same upward gaze, same loose hair, opposite end of the day. A single jet contrail crosses the whole sky (SVG path drawn by scroll) and fades.
- The sky goes from dusk purple to a bruised slate to almost black. The rail dims. Ginger at her feet is the only warm colour left.
- Copy (draft), one line at a time with long gaps: "I applied to the Air Force. GD Pilot." / "I wanted the sky." / "The sky said no." / (long pause, near-black) / "I didn't have a plan B. I had a laptop."
- Transition: in the dark, one small rectangle lights up. It is a screen. The next chapter grows out of it.

### 7 · 2023–now · Hello, World (blue hour to night)

- The screen rectangle expands into the desk scene. Avatar at nineteen in a dusty-blue kurta, round thin glasses on, hair loose, laptop glow on her face. The window behind her shows the Karachi night arriving.
- A terminal on the monitor types `printf("Hello, World");` as you scroll, cursor blinking in sync with the ambient grain. When it "runs", the lamp on the desk comes on: the first warm light since the storm.
- Copy (draft): "First semester, Computer Science, Bahria University." / "The first time the machine did exactly what I told it to, something clicked that the sky never did."
- Second beat, Kafeel: the laptop screen shows the Kafeel interface softly. Copy (draft): "Then I built Kafeel. Karachi has no real system for its elderly. That felt like a gap someone should fill, so I tried."
- **Easter egg:** a Sudoku grid is faintly visible on the monitor. The cursor turns into a small "play" glyph over it. Click: a retro terminal window opens with a real playable 9×9 Sudoku, a one-line caption ("I wrote one of these in x86 assembly. Registers, interrupts, INT 21h. This one's in JavaScript, you're welcome."). Escape closes it.
- Ginger on the desk, staring at the cursor.

### 8 · now · What I love (night, city lights)

- Back on the rooftop. The city below is lit in amber. The sky is deep indigo with a few stars.
- A looser montage: a short horizontal strip of "things" that slide in as you scroll, each with a witty caption:
  - A chai cup with steam (shader-free: CSS blur on an SVG) — "Doodh patti. Non-negotiable."
  - The laptop lid with small stickers: a Valorant spike, a Minecraft grass block, a chess knight — "Valorant when I want to lose, Minecraft when I want to build, chess when I want to think."
  - Headphones — "Coke Studio on repeat. Yes, still."
  - A badminton racket and a table-tennis paddle leaning on the water tank — "Not cricket. Badminton and table tennis. I will not be taking questions."
  - Ginger asleep on the keyboard — "Ginger. Orange. In charge."
- Copy intro (draft): "Things that are mine, no grades attached."

### 9 · now · A letter (night fading to pre-dawn)

- The desk again, lamp on, glasses off, hair loose. The avatar writes.
- The letter appears in the italic serif, one line at a time, as if being written. Draft:

  > To the three-year-old in Southall,
  > You're going to remember the snow more than the school. That's fine. Hold on to the friends from City School; you'll still have them. Sit behind Sharjeel's chair as long as he lets you. Learn the physics. Apply for the sky. When it says no, don't argue with it. You'll find the sky anyway. It's just not where you're looking.
  > — M.

- As the last line lands, the sky slowly lightens back to the hero's pre-dawn navy. The skyline silhouette returns. Ginger yawns.
- Final frame: a small line in the utility face, "Made under the Karachi sky, 2026", and the Urdu آسمان once more. No contact card, as agreed.

---

## 5. Design system

### 5.1 Sky palette (one token set per sky state)

The shader interpolates between these stops as global scroll progress moves 0 → 1. UI colours (text, rail, cursor) switch between "ink" and "paper" per chapter so contrast always holds.

| State | Top | Mid | Horizon | Accent | UI |
|---|---|---|---|---|---|
| Pre-dawn (hero, ending) | `#0A0F2C` | `#1C2A55` | `#3A2E5C` | `#FFB457` (lamp) | paper |
| Dawn (2007) | `#F6E7D2` | `#F4B183` | `#E58A5A` | `#0E0D0C` | ink |
| Grey morning (London) | `#E8EBEF` | `#C9CED6` | `#9FA8B3` | `#C93A22` (red) | ink |
| Noon (2011–17) | `#5DB9F2` | `#8ED0F8` | `#FFFFFF` | `#FFE27A` (sun) | ink |
| Golden (Karsaz) | `#F7B74A` | `#E8822E` | `#FFF1D6` | `#0E0D0C` | ink |
| Dusk → storm (PAF) | `#6B4A7A` | `#3B2F57` | `#1B1730` | `#FF9A5C` (Ginger) | paper |
| Blue hour (Hello, World) | `#0E1B3F` | `#15306B` | `#1F3F7A` | `#7DF5B3` (screen) | paper |
| Night (loves) | `#0A1230` | `#101C45` | `#2A2250` | `#FFC46B` (city) | paper |

Neutrals: ink `#0E0D0C`, paper `#F7F3EC`, mid `#8A8378` (warm-biased, never pure grey).

### 5.2 Typography

| Role | Face | Notes |
|---|---|---|
| Display (years, chapter titles, "Maria") | **Big Shoulders Display** 700–900 | Tall, condensed, American-gothic flavour; fallback Antonio / Anton |
| Emotional lines, the letter | **Fraunces** italic, opsz 144, `WONK 1, SOFT 50` | The soft, slightly quirky italic carries the vulnerable lines |
| Body and UI | **Hanken Grotesk** 400–600 | Quiet, warm, never fights the display face |
| Urdu accents | **Gulzar** (fallback Noto Nastaliq Urdu) | Set at 1.4× the Latin size; Nastaliq needs generous line height |
| Terminal / Sudoku / captions | **IBM Plex Mono** | Only inside screens and the rail numerals |

Scale (desktop): 12 / 14 / 18 / 24 / 40 / 72 / 160 / 320 (years and "Maria" use the top two). Body measure 60–65 characters. Uppercase labels get 0.12em tracking. Headings get `text-wrap: balance`.

### 5.3 Layout

- 12-column fluid grid, 24px gutters, max content width 1440px; scenes are full-bleed.
- Every chapter is a `section` with `min-height: 100vh` that pins; the scroll length of each pin is set per chapter (200–400vh).
- Rail: fixed, right edge, 1px line with year ticks; the active year is the accent colour; a tiny avatar head icon slides along it.
- Corner menu: top-left wordmark "Maria", top-right "Menu" that opens a full-screen chapter list in the display face with the Urdu word for each chapter.
- Sound toggle: bottom-left, a small waveform that animates when on.

### 5.4 Cursor

Dot (6px) plus ring (36px) that lags the dot slightly. States: default; hover on links (ring grows, dot disappears); over the Sudoku monitor ("play" glyph); in the Karsaz and PAF chapters (a small paper plane that rotates toward the direction of movement); over Ginger (a paw). Hidden on touch devices.

---

## 6. Motion system

Principles: nothing bounces; one big moment per chapter; everything else is slow parallax and staggered reveals. Default easing `power2.out` for reveals, `none` for scroll-scrubbed timelines, `scrub: 1` so motion trails the wheel by about a second, which is what gives the cinematic lag.

- **Lenis** with `lerp: 0.08`, `wheelMultiplier: 0.9`, synced to GSAP's ticker.
- **ScrollTrigger** per chapter: `pin: true`, `scrub: 1`, `end` set per chapter. One master trigger over the whole page drives the sky shader's `uProgress` and the rail.
- **Text reveals** with GSAP SplitText (free since GSAP 3.13): lines mask-reveal from below, 0.06s stagger, triggered by position inside the pin timeline so they're scrubbed, not time-based.
- **Avatar layers**: each scene has three depth layers (sky, scene, avatar + cat) moved at 0.2 / 0.5 / 1.0 of the scroll delta. Pose changes between chapters are crossfades, never cuts.
- **Blink trick**: for the hero, sky, desk and letter poses, ask Gemini for an identical pose with eyes closed; crossfade for 120ms every 4–7s. Costs one extra render per pose, makes a static render feel alive.
- **Breathing**: `scale(1 → 1.012)` over 4.5s, ease in-out, on the avatar layer only.
- **Ginger**: two or three poses per chapter crossfaded on scroll thresholds; a 2s tail-flick is faked by swapping between two sitting renders.
- **The contrail** (PAF): an SVG path with `stroke-dashoffset` scrubbed over the chapter; it fades as the sky goes dark.
- **The terminal** (Hello, World): character-by-character typing scrubbed to scroll, so scrolling back un-types it.
- **Reduced motion**: with `prefers-reduced-motion: reduce`, pins are removed, every scene becomes a static full-height section, the sky still changes colour per section (instant), no particles, no cursor.

---

## 7. Interaction inventory

| Interaction | Behaviour |
|---|---|
| Intro | Auto-plays 2–3s; any key, click or scroll skips it; never shown again in the same session (sessionStorage) |
| Rail | Hover a year shows the chapter title; click smooth-scrolls (Lenis) to the chapter start |
| Menu | Full-screen overlay; chapter list; Escape closes; current chapter highlighted |
| Sound | Off by default; one click enables; ambient bed crossfades per chapter (dawn crows, London wind, playground, pages turning, wind at altitude, keyboard, rooftop traffic, pen on paper); UI clicks at −18 dB; remembered in localStorage |
| Sudoku | Hidden on the monitor; click opens a modal terminal; keyboard-playable (arrows + digits), pencil-mark mode, "check" and "new puzzle" commands; Escape closes; progress kept while open only |
| Letter | Lines appear on scroll; the signature "— M." is the final scroll stop |
| Keyboard | Only Escape (closes overlays). No presenter shortcuts, as agreed |
| Touch | Pins shortened; cursor hidden; parallax reduced to two layers; snow and grain capped at 30fps |

---

## 8. Technical architecture

### 8.1 Stack

- **Next.js 15** (App Router, TypeScript), deployed on Vercel from GitHub.
- **GSAP 3.13+** with ScrollTrigger and SplitText (all free now).
- **Lenis** for smooth scroll.
- **OGL** (tiny WebGL library) for the sky shader; one full-screen fixed canvas behind the DOM. Fragment shader: three-stop vertical gradient blended by `uProgress` across the nine states, a sun/moon glow with position per state, star field when dark, snow particles when `uSnow > 0`, film grain always at low amplitude. Falls back to a CSS gradient if WebGL is unavailable.
- **Tailwind v4** for layout utilities; design tokens as CSS variables in `globals.css` (the palette above).
- **next/font** for the five Google faces (self-hosted at build, no layout shift).
- **next/image** for avatar and scene PNGs exported as AVIF + WebP.
- **Howler.js** for audio (lazy-loaded only when the user turns sound on).
- No CMS, no database. Content lives in `content/chapters.ts`.

### 8.2 Folder structure

```
my-app/
  app/
    layout.tsx            fonts, metadata, OG image
    page.tsx              assembles the chapters in order
    globals.css           tokens, resets, type scale
  components/
    sky/SkyCanvas.tsx     OGL canvas + shader, driven by a progress store
    sky/sky.frag          fragment shader
    scroll/SmoothScroll.tsx   Lenis + GSAP ticker bridge
    ui/Intro.tsx
    ui/Rail.tsx
    ui/Menu.tsx
    ui/Cursor.tsx
    ui/SoundToggle.tsx
    chapters/Hero.tsx
    chapters/Karachi2007.tsx
    chapters/London.tsx
    chapters/BackHome.tsx
    chapters/Karsaz.tsx
    chapters/SkySaidNo.tsx
    chapters/HelloWorld.tsx
    chapters/Loves.tsx
    chapters/Letter.tsx
    avatar/Avatar.tsx     layered poses, blink, breathing
    avatar/Ginger.tsx
    sudoku/SudokuTerminal.tsx
    sudoku/engine.ts      generator + solver + validator
  content/
    chapters.ts           copy, Urdu words, years, sky state per chapter
    letter.ts
  lib/
    progress.ts           global scroll progress store (zustand)
    audio.ts
    gsap.ts               plugin registration
  public/
    avatar/               AVIF/WebP cutouts per pose
    ginger/
    scenes/               backgrounds, photos (grain-treated)
    audio/
    og.jpg
  docs/
    avatar-prompts.md     the Gemini prompt pack
  PLAN.md
```

### 8.3 Asset pipeline

1. Maria generates renders in Gemini from `docs/avatar-prompts.md` on a flat chroma-green background.
2. I remove backgrounds locally with `rembg` (handles hair edges better than keying), trim, and normalise each pose to a 1600px-tall canvas with the feet on a shared baseline so crossfades don't jump.
3. Export AVIF (quality 60) + WebP fallback via `sharp`. Target under 180KB per pose, under 2.5MB for all avatar assets combined.
4. Photos: convert to 1600px wide WebP, apply a grain overlay and slight desaturation in CSS so they sit in the illustrated world rather than against it.
5. Audio: CC0 field recordings (freesound.org, CC0 only) or recorded on a phone in Karachi; trimmed to 20–30s loops, exported as 96kbps Opus + AAC fallback. No copyrighted music; Coke Studio is referenced visually only.

### 8.4 Performance budget

- Lighthouse performance ≥ 90 on desktop, ≥ 80 on mobile.
- Total JS under 250KB gzipped (GSAP ~70, Lenis ~5, OGL ~25, app ~60).
- Largest Contentful Paint under 2.5s on a mid-range phone; the intro hides any remaining loading.
- 60fps on a 2020 laptop with integrated graphics; grain and particle counts scale down by `devicePixelRatio` and viewport area.

### 8.5 Accessibility and metadata

- Every chapter is a landmark with a heading; the story is readable by a screen reader top to bottom even with all animation off.
- Focus states on rail years, menu items, Sudoku cells and toggles.
- `prefers-reduced-motion` honoured as in section 6.
- Colour contrast checked per sky state for both ink and paper UI.
- Metadata: title "Maria", description "Born under the Karachi sky. A story, not a resume.", an OG image of the hero at pre-dawn, Urdu `lang` attributes on the accent words.

---

## 9. Assets needed

### From Maria (in order of urgency)

1. **Avatar renders** from the prompt pack: 1 character sheet, 9 scene poses, 3 eyes-closed variants, Ginger ×4, Sharjeel back view ×1. Flat green background, PNG, as large as Gemini allows. Drop them in `public/_raw/` (I'll process them).
2. **Photos**: 3–6 of Karachi (rooftop with skyline, a street, the sea at night) and 2–3 of London / Southall from 2010–11. Any size. Faces will be cropped or softened.
3. **Uniform reference photos**: received 10 October and described in the prompt pack. Drop the two photos in `public/_raw/refs/` so you can attach them in Gemini.
4. **Two sentences in your own words** about the day you found out about PAF, and one sentence about the first program that ran. I'll shape them; the site should carry your phrasing at the hinge.

### Produced by me

Sky shader, skyline silhouette, Southall street illustration layers, Karsaz physics-diagram linework, the contrail, the terminal and Sudoku engine, the chai steam, laptop stickers, headphones and racket as SVG, the OG image, the ambient audio edit, all copy drafts.

---

## 10. Build schedule

Today is Friday 10 October 2026. The deadline is extended by a month or more, so the plan targets a strong v1 by 20 October and uses the remaining time for polish passes, which is where awwwards-level sites are actually won.

| Dates | Phase | Outcome |
|---|---|---|
| 10–11 Oct | Prompt pack and skeleton | `docs/avatar-prompts.md` done (today). Next.js app, tokens, fonts, Lenis, GSAP, the sky shader driven by scroll, the rail, nine chapters as text-only placeholders with the palette arc working. Pushed to GitHub, imported to Vercel, live at `mria-sm.vercel.app` by Saturday night. |
| 12–14 Oct | Avatar integration | Maria's renders processed and placed; hero, London, Back home, Karsaz scenes built with parallax; the intro. |
| 15–17 Oct | The hinge and the payoff | PAF chapter with contrail and the dark; Hello, World with the typing terminal and Kafeel beat; the Sudoku engine and terminal modal. |
| 18–20 Oct | Loves, letter, cursor, sound | Montage chapter; the letter; custom cursor states; ambient audio with the toggle. **v1 presentable.** |
| 21–24 Oct | Mobile and performance pass | Pins shortened for touch, images tuned, Lighthouse targets met, reduced-motion path verified, Safari and Firefox checks. |
| 25–31 Oct | Polish pass 1 | Timing of every reveal tuned by hand, type refinements, micro-sounds, blink and breathing, the OG image. Informal feedback from Issa and Ajwad folded in. |
| 1–7 Nov | Polish pass 2 and rehearsal | Judge's-eye review (I scroll it as a stranger and list every rough edge), final copy with Maria's own lines, a dry-run of the presentation flow. |
| Buffer | Up to the real deadline | Anything the mentors suggest, or a medium WebGL element (a 3D paper plane) if we have time and it earns its place. |

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Gemini renders drift between poses (face, proportions) | Generate the character sheet first; attach it as a reference image to every scene prompt; keep one fixed style string; generate 3–4 candidates per pose and pick the most consistent; I normalise scale and baseline afterwards. |
| Renders are heavy and slow the page | AVIF + WebP, lazy loading per chapter, under 180KB per pose, intro hides the first load. |
| Pinned sections feel sticky on phones | Shorter pins on touch, `scrub: 0.5`, two layers only, tested on a real Android and iPhone before v1. |
| Old photos include faces | Crop to places and objects, or soften; nothing identifiable goes live without Maria's say. |
| Music copyright | No tracks on the site; only CC0 ambience. Coke Studio appears as a visual reference. |
| The rejection chapter feels heavy-handed | Keep it to five short lines and let the sky do the talking; Maria writes the hinge sentence herself. |
| "Another CS-themed site" | The computer appears only in chapters 4 and 7. The site's identity is the sky and the city, not the terminal. |
| Vercel connector in this session isn't linked | Not needed: GitHub import works with Maria's own Vercel login. Git Credential Manager is already configured on this machine for the push. |

---

## 12. Small open questions (answer whenever, none block the skeleton)

1. Which Tudor Primary detail you'd like: the gate, the playground, or a classroom.
2. Your two sentences about the PAF day, and one about the first program that ran.
3. Should Sharjeel appear only as a silhouette (planned) or with a face? Silhouette keeps his privacy and reads better.
4. Hair on the PAF day is loose in the prompt (it rhymes with the hero). Say so if you'd rather have a plait or ponytail there.

Resolved on 10 October: uniforms (reference photos received), all avatar likeness details, Ginger's look.

---

## 13. Next actions

- **Me, now:** scaffold the Next.js app, tokens, Lenis, GSAP, sky shader, rail, placeholder chapters; initialise git; push; hand you the repo link to import in Vercel.
- **You, today or tomorrow:** open `docs/avatar-prompts.md`, fill in the three lines marked ADJUST, generate the character sheet first, then the scenes, and drop the PNGs in `public/_raw/`. Send the photos and uniform details whenever convenient.

## 14. Transitions v2 (13 Oct 2026)

Maria's brief after the first live build: better transitions between chapters and a better intro, still calm, with singularity.engl.design as the benchmark (realevate.agency and kyoosangchoi.com for texture). Decisions from the Q&A: the background travels ("rise through the sky"), chapters ride out with the page but softened, the next chapter builds straight in with no gap, the intro is the name as a window, and she will render cloud plates in Gemini.

- **World layer** (`components/scene/World.tsx`, `lib/world.ts`): one rooftop set behind every chapter instead of a copy per chapter. The sky and a camera height (`rise`, per-chapter keyframes in `content/chapters.ts`) are sampled by absolute scroll position, so they keep moving through the gap between pins. Leaving 2007 the parapet, roof and city sink at different speeds (the camera lifts off the roof); the night chapters bring the city back.
- **Sky shader**: the horizon drops with `rise`, stars stream past at two depths, thin fbm clouds appear on the climb (switched off automatically when `cloud-far` / `cloud-near` plates exist in `public/scene`).
- **Chapters**: the year and the Urdu word build while the section is still scrolling in (a second, unpinned ScrollTrigger), so the next chapter is forming as the previous one clears. The clear beat also takes the scene overlays, so nothing hard-edged rides out.
- **Intro**: MARIA as an SVG mask over black. The letters open onto the sky one by one while the hero arrives behind them, then the I widens into a doorway. Skippable, once per session.
