'use client'

import { gsap, SplitText } from '@/lib/gsap'
import { KARSAZ_SUM } from '@/content/interactive'
import { useUI } from '@/lib/ui'
import karachi from '@/components/scenes/Karachi'
import london from '@/components/scenes/London'
import home from '@/components/scenes/Home'
import sky from '@/components/scenes/Sky'
import letter from '@/components/scenes/Letter'
import TerminalPrompt from '@/components/scenes/TerminalPrompt'
import MateInOne from '@/components/scenes/MateInOne'

export type SceneContext = {
  tl: ReturnType<typeof gsap.timeline>
  el: HTMLElement
  /** Length of the chapter timeline before its trailing hold. */
  total: number
  reduced: boolean
}

/** Parts of a chapter's standard animation (lib/chapterTimelines.ts) that a scene animates itself. */
export type ScenePart = 'year' | 'urdu' | 'title' | 'lines' | 'figures'

export type SceneDef = {
  Scene: () => React.JSX.Element
  build: (ctx: SceneContext) => void
  owns?: ScenePart[]
  /** Rendered inside the chapter's text column, just above the year. */
  YearNote?: () => React.JSX.Element
}

/* ───────────────────────── Karsaz: the paper plane ───────────────────────── */

// From Maria's raised hand (she stands at the right) up and away across the year.
const PLANE_PATH = 'M1012 404 C 930 330, 830 262, 700 236 C 560 208, 430 160, 310 96 C 230 54, 150 22, 40 -30'

function KarsazScene() {
  return (
    <svg className="scene scene--karsaz" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <mask id="karsaz-trail-mask" maskUnits="userSpaceOnUse" x="-100" y="-200" width="1640" height="1200">
          <path className="scene__reveal" d={PLANE_PATH} pathLength={1} stroke="#fff" strokeWidth="12" fill="none" />
        </mask>
      </defs>
      <path className="scene__trail" d={PLANE_PATH} fill="none" strokeWidth="2" strokeDasharray="6 12" strokeLinecap="round" mask="url(#karsaz-trail-mask)" />
      <g className="scene__plane">
        <path d="M0 0 L-40 13 L-29 0 L-40 -13 Z" />
        <path d="M-29 0 L-40 13 L-25 3 Z" opacity="0.55" />
      </g>
    </svg>
  )
}

/** The working above the year, in pencil: 2007, plus ten, a rule, and then the answer. */
function KarsazSum() {
  return (
    <div className="sum" aria-hidden="true">
      {KARSAZ_SUM.map((row) => (
        <span key={row} className="sum__row">
          {row}
        </span>
      ))}
      <span className="sum__rule" />
    </div>
  )
}

const karsaz: SceneDef = {
  Scene: KarsazScene,
  YearNote: KarsazSum,
  owns: ['year'],
  build: ({ tl, el, total, reduced }) => {
    const rows = Array.from(el.querySelectorAll<HTMLElement>('.sum__row'))
    const rule = el.querySelector<HTMLElement>('.sum__rule')
    const year = el.querySelector<HTMLElement>('.chapter__year')
    if (reduced) {
      gsap.set([...rows, rule], { opacity: 1, scaleX: 1 })
    } else if (year && rule) {
      // Worked by hand: the sum is written, ruled off, and the year is written
      // under it digit by digit, each one drawn left to right like a pen stroke.
      gsap.set(rows, { opacity: 0, x: -6 })
      gsap.set(rule, { scaleX: 0, transformOrigin: '0 50%' })
      tl.to(rows, { opacity: 1, x: 0, duration: 0.3, ease: 'power1.out', stagger: 0.25 }, 0)
      tl.to(rule, { scaleX: 1, duration: 0.3, ease: 'power2.inOut' }, 0.5)
      const split = SplitText.create(year, { type: 'chars' })
      tl.fromTo(split.chars, { clipPath: 'inset(-10% 100% -10% 0)' }, { clipPath: 'inset(-10% 0% -10% 0)', duration: 0.22, ease: 'power1.inOut', stagger: 0.2 }, 0.75)
      tl.fromTo(year, { yPercent: 0 }, { yPercent: -6, duration: total, ease: 'none' }, 0.75)
    }
    const svg = el.querySelector<SVGSVGElement>('.scene--karsaz')
    if (!svg) return
    const reveal = svg.querySelector<SVGPathElement>('.scene__reveal')
    const trail = svg.querySelector<SVGPathElement>('.scene__trail')
    const plane = svg.querySelector<SVGGElement>('.scene__plane')
    if (!reveal || !trail || !plane) return
    gsap.set(reveal, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(plane, { opacity: 0, x: 1012, y: 404 })
    if (reduced) {
      gsap.set(reveal, { strokeDashoffset: 0 })
      return
    }
    // The plane leaves her hand as the last line ("I was going to fly.", rising at 1.6)
    // lands, and flies the dashed path off the top of the screen, on into 2023.
    const start = 1.75
    const dur = total - start - 0.05
    tl.to(plane, { opacity: 1, duration: 0.12 }, start)
    tl.to(plane, { motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: dur, ease: 'power1.in' }, start)
    tl.to(reveal, { strokeDashoffset: 0, duration: dur, ease: 'power1.in' }, start)
    tl.to(plane, { opacity: 0, duration: 0.1 }, start + dur - 0.08)
  },
}

/* ───────────────────────── Hello, World: the terminal ───────────────────────── */

const CODE = 'printf("Hello, World");'

// The stars that briefly become the program: each glyph's wrapper fills the
// layer and is shifted to where its star was, so percentages are of the screen.
const rand = (i: number, k: number) => {
  const v = Math.sin(i * 91.17 + k * 47.53) * 24634.6345
  return v - Math.floor(v)
}

function CodeStars() {
  const n = CODE.length
  return (
    <div className="code-stars" aria-hidden="true">
      {Array.from(CODE).map((ch, i) => (
        <span
          key={i}
          className="glyph"
          style={{ '--i': i - (n - 1) / 2, '--sx': ((rand(i, 1) - 0.5) * 86).toFixed(1), '--sy': (4 + rand(i, 2) * 46).toFixed(1) } as React.CSSProperties}
        >
          <b>
            <span className="glyph__dot" />
            <span className="glyph__ch">{ch}</span>
          </b>
        </span>
      ))}
    </div>
  )
}

function HelloScene() {
  const openSudoku = useUI((s) => s.setSudokuOpen)
  return (
    <>
    <div className="scene-dark" aria-hidden="true" />
    <div className="scene-warm" aria-hidden="true" />
    <CodeStars />
    <div className="terminal" aria-label="Maria's first program">
      <div className="terminal__bar" aria-hidden="true">
        <span>C:\MARIA\FIRST.C</span>
        <span>80 × 25</span>
      </div>
      <div className="terminal__body">
        <div className="terminal__line">
          <span className="terminal__prompt">&gt; </span>
          <span className="terminal__typed" />
          <span className="terminal__caret" aria-hidden="true" />
        </div>
        <div className="terminal__line terminal__out">Hello, World</div>
      </div>
      <TerminalPrompt />
      <button type="button" className="terminal__sudoku" onClick={() => openSudoku(true)} data-hover>
        <span className="terminal__sudoku-label">
          <b>▸ SUDOKU.EXE</b>
          <small>The one I wrote in x86 assembly. Click to play.</small>
        </span>
      </button>
    </div>
    </>
  )
}

const hello: SceneDef = {
  Scene: HelloScene,
  build: ({ tl, el, total, reduced }) => {
    const term = el.querySelector<HTMLElement>('.terminal')
    const typed = el.querySelector<HTMLElement>('.terminal__typed')
    const caret = el.querySelector<HTMLElement>('.terminal__caret')
    const out = el.querySelector<HTMLElement>('.terminal__body .terminal__out')
    const live = el.querySelector<HTMLElement>('.terminal__live')
    const sudoku = el.querySelector<HTMLElement>('.terminal__sudoku')
    const dark = el.querySelector<HTMLElement>('.scene-dark')
    const warm = el.querySelector<HTMLElement>('.scene-warm')
    const glyphs = Array.from(el.querySelectorAll<HTMLElement>('.glyph'))
    const dots = Array.from(el.querySelectorAll<HTMLElement>('.glyph__dot'))
    const letters = Array.from(el.querySelectorAll<HTMLElement>('.glyph__ch'))
    if (!term || !typed || !out || !sudoku || !caret || !live || !dark || !warm) return
    if (reduced) {
      typed.textContent = CODE
      gsap.set([term, out, live, sudoku], { opacity: 1 })
      gsap.set([dark, ...glyphs], { opacity: 0 })
      gsap.set(warm, { opacity: 1 })
      return
    }
    // The window 2023 opened is already here, in the dark, the moment this chapter cuts in.
    gsap.set(term, { opacity: 1 })
    gsap.set([out, live, sudoku, warm, ...glyphs, ...letters], { opacity: 0 })
    gsap.set(dark, { opacity: 1 })
    gsap.set(dots, { opacity: 1 })
    const state = { n: 0 }
    const render = () => {
      typed.textContent = CODE.slice(0, Math.round(state.n))
    }
    render()
    tl.to(state, { n: CODE.length, duration: 0.16 * total, ease: 'none', onUpdate: render }, 0.03 * total)
    tl.to(out, { opacity: 1, duration: 0.12 }, 0.2 * total)
    tl.to(caret, { opacity: 0, duration: 0.05 }, 0.2 * total)
    // Then the dark lifts and the chapter forms around the window.
    tl.to(dark, { opacity: 0, duration: 0.3 * total, ease: 'power1.inOut' }, 0.16 * total)
    // A few stars become the program for a moment, then go back to being stars.
    if (glyphs.length) {
      tl.to(glyphs, { opacity: 1, duration: 0.04 * total, stagger: { each: 0.003 * total, from: 'random' } }, 0.24 * total)
      tl.fromTo(glyphs, { xPercent: (i, g) => Number(g.style.getPropertyValue('--sx')), yPercent: (i, g) => Number(g.style.getPropertyValue('--sy')) - 11 }, { xPercent: 0, yPercent: 0, duration: 0.13 * total, ease: 'power3.inOut', stagger: { each: 0.002 * total, from: 'random' } }, 0.27 * total)
      tl.to(dots, { opacity: 0, duration: 0.06 * total }, 0.33 * total)
      tl.to(letters, { opacity: 1, duration: 0.06 * total }, 0.33 * total)
      tl.to(letters, { opacity: 0, duration: 0.05 * total }, 0.5 * total)
      tl.to(dots, { opacity: 1, duration: 0.05 * total }, 0.5 * total)
      tl.to(glyphs, { xPercent: (i, g) => Number(g.style.getPropertyValue('--sx')), yPercent: (i, g) => Number(g.style.getPropertyValue('--sy')) - 11, duration: 0.12 * total, ease: 'power2.inOut' }, 0.52 * total)
      tl.to(glyphs, { opacity: 0, duration: 0.06 * total }, 0.62 * total)
    }
    // Warmth comes back into the night.
    tl.to(warm, { opacity: 1, duration: 0.35 * total, ease: 'power1.inOut' }, 0.55 * total)
    // Then the prompt is yours.
    tl.to(live, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.6 * total)
    tl.to(sudoku, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.7 * total)
  },
}

/* ───────────────────────── What I love: mate in one ───────────────────────── */

// A change of tempo: no big year, the Urdu word is the headline, and the
// things she loves are stuck on like stickers, quickly, one after another.
const loves: SceneDef = {
  Scene: MateInOne,
  owns: ['year', 'urdu', 'lines'],
  build: ({ tl, el, total, reduced }) => {
    const mate = el.querySelector<HTMLElement>('.mate')
    const urdu = el.querySelector<HTMLElement>('.chapter__urdu')
    const stickers = Array.from(el.querySelectorAll<HTMLElement>('.chapter__lines .mask'))
    if (reduced) {
      gsap.set([mate, urdu, ...stickers].filter(Boolean), { opacity: 1 })
      return
    }
    if (urdu) tl.fromTo(urdu, { opacity: 0, scale: 0.8, rotation: -4 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2)' }, 0)
    tl.fromTo(stickers, { opacity: 0, scale: 0.4, rotation: -14 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(2.4)', stagger: 0.22 }, 0.35)
    // Quick in, then time to read them and play the puzzle.
    tl.to({}, { duration: 0.01 }, total - 0.01)
    if (!mate) return
    // Right after "chess when I want to think" sticks.
    gsap.set(mate, { opacity: 0, y: 16 })
    tl.to(mate, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }, 1.0)
  },
}

export const SCENES: Record<string, SceneDef> = { karachi, london, home, karsaz, sky, hello, loves, letter }
