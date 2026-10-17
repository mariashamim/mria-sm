'use client'

import { gsap } from '@/lib/gsap'
import { useUI } from '@/lib/ui'
import karachi from '@/components/scenes/Karachi'
import london from '@/components/scenes/London'
import home from '@/components/scenes/Home'
import karsaz from '@/components/scenes/Karsaz'
import sky from '@/components/scenes/Sky'
import letter from '@/components/scenes/Letter'
import closing from '@/components/scenes/Closing'
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
    </div>
    </>
  )
}

/* ───────────────────────── Explore: the terminal and Sudoku ───────────────────────── */

/** The prompt that answers, and the Sudoku, in a window of their own under her invitation. */
function ExploreScene() {
  const openSudoku = useUI((s) => s.setSudokuOpen)
  return (
    <div className="terminal terminal--explore" aria-label="A terminal you can type into">
      <div className="terminal__bar" aria-hidden="true">
        <span>C:\MARIA</span>
        <span>80 × 25</span>
      </div>
      <TerminalPrompt />
      <button type="button" className="terminal__sudoku" onClick={() => openSudoku(true)} data-hover>
        <span className="terminal__sudoku-label">
          <b>▸ SUDOKU.EXE</b>
          <small>The one I wrote in x86 assembly. Click to play.</small>
        </span>
      </button>
    </div>
  )
}

const explore: SceneDef = {
  Scene: ExploreScene,
  build: ({ tl, el, reduced }) => {
    const term = el.querySelector<HTMLElement>('.terminal')
    if (!term) return
    if (reduced) {
      gsap.set(term, { opacity: 1 })
      return
    }
    // Right after the invitation to try it (the second line rises at 1.05).
    tl.fromTo(term, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.3)
  },
}

const hello: SceneDef = {
  Scene: HelloScene,
  build: ({ tl, el, total, reduced }) => {
    const term = el.querySelector<HTMLElement>('.terminal')
    const typed = el.querySelector<HTMLElement>('.terminal__typed')
    const caret = el.querySelector<HTMLElement>('.terminal__caret')
    const out = el.querySelector<HTMLElement>('.terminal__body .terminal__out')
    const dark = el.querySelector<HTMLElement>('.scene-dark')
    const warm = el.querySelector<HTMLElement>('.scene-warm')
    const glyphs = Array.from(el.querySelectorAll<HTMLElement>('.glyph'))
    const dots = Array.from(el.querySelectorAll<HTMLElement>('.glyph__dot'))
    const letters = Array.from(el.querySelectorAll<HTMLElement>('.glyph__ch'))
    if (!term || !typed || !out || !caret || !dark || !warm) return
    if (reduced) {
      typed.textContent = CODE
      gsap.set([term, out], { opacity: 1 })
      gsap.set([dark, ...glyphs], { opacity: 0 })
      gsap.set(warm, { opacity: 1 })
      return
    }
    // The window 2023 opened is already here, in the dark, the moment this chapter cuts in.
    gsap.set(term, { opacity: 1 })
    gsap.set([out, warm, ...glyphs, ...letters], { opacity: 0 })
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

export const SCENES: Record<string, SceneDef> = { karachi, london, home, karsaz, sky, hello, loves, explore, letter, closing }
