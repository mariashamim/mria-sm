'use client'

import { gsap, SplitText } from '@/lib/gsap'
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
import ChaiSteam from '@/components/scenes/ChaiSteam'

export type SceneContext = {
  tl: ReturnType<typeof gsap.timeline>
  el: HTMLElement
  /** Length of the chapter timeline before its trailing hold. */
  total: number
  reduced: boolean
}

/** Parts of a chapter's standard animation (lib/chapterTimelines.ts) that a scene animates itself. */
export type ScenePart = 'year' | 'urdu' | 'title' | 'lines' | 'figures' | 'ps'

export type SceneDef = {
  Scene: () => React.JSX.Element
  build: (ctx: SceneContext) => void
  owns?: ScenePart[]
  /** Rendered inside the chapter's text column, just above the year. */
  YearNote?: () => React.JSX.Element
}

/* ───────────────────────── Hello, World: the terminal ───────────────────────── */

const CODE = 'printf("Hello, World");'

function HelloScene() {
  return (
    <>
    <div className="scene-dark" aria-hidden="true" />
    <div className="scene-warm" aria-hidden="true" />
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
    // Right after the invitation to try it (the second line rises at 0.85).
    tl.fromTo(term, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.1)
  },
}

// 2024 opens on the window 2023 opened, alone and centred on the black: it
// types her first program and prints Hello, World. Then it goes, the dark
// lifts, and the chapter is there. The window is fully gone well before the
// next section, and on phones its room goes to the figure.
const hello: SceneDef = {
  Scene: HelloScene,
  build: ({ tl, el, total, reduced }) => {
    const term = el.querySelector<HTMLElement>('.terminal')
    const typed = el.querySelector<HTMLElement>('.terminal__typed')
    const caret = el.querySelector<HTMLElement>('.terminal__caret')
    const out = el.querySelector<HTMLElement>('.terminal__body .terminal__out')
    const dark = el.querySelector<HTMLElement>('.scene-dark')
    const warm = el.querySelector<HTMLElement>('.scene-warm')
    if (!term || !typed || !out || !caret || !dark || !warm) return
    if (reduced) {
      // The finished program, then the chapter: no dark, no window over the words.
      typed.textContent = CODE
      gsap.set([term, dark], { autoAlpha: 0 })
      gsap.set(warm, { opacity: 1 })
      return
    }
    gsap.set(term, { autoAlpha: 1 })
    gsap.set([out, warm], { opacity: 0 })
    gsap.set(dark, { opacity: 1 })
    const state = { n: 0 }
    const render = () => {
      typed.textContent = CODE.slice(0, Math.round(state.n))
    }
    render()
    tl.to(state, { n: CODE.length, duration: 0.14 * total, ease: 'none', onUpdate: render }, 0.03 * total)
    tl.to(out, { opacity: 1, duration: 0.1 }, 0.18 * total)
    tl.to(caret, { opacity: 0, duration: 0.05 }, 0.18 * total)
    // A beat on Hello, World, then the window goes and the dark lifts.
    tl.to(term, { autoAlpha: 0, scale: 0.96, duration: 0.08 * total, ease: 'power2.in' }, 0.28 * total)
    tl.to(dark, { opacity: 0, duration: 0.2 * total, ease: 'power1.inOut' }, 0.3 * total)
    // Warmth comes back into the night.
    tl.to(warm, { opacity: 1, duration: 0.35 * total, ease: 'power1.inOut' }, 0.5 * total)

    // The story's hinge: the first sentence arrives with the line; then the second
    // types itself out, the way her first program did, and a cursor waits after it.
    const hinge = el.querySelector<HTMLElement>('.chapter__lines .mask:last-child p')
    const text = hinge?.textContent ?? ''
    const cut = text.indexOf('So I')
    if (!hinge || cut < 0) return
    const chars = SplitText.create(hinge, { type: 'words,chars' }).chars as HTMLElement[]
    let n = 0
    const typedChars = chars.filter((c) => {
      n += (c.textContent ?? '').length
      return n > cut
    })
    const hingeCaret = document.createElement('span')
    hingeCaret.className = 'hinge-caret'
    hingeCaret.setAttribute('aria-hidden', 'true')
    // The blink lives on the inner element so it never fights the reveal.
    hingeCaret.appendChild(document.createElement('i'))
    hinge.appendChild(hingeCaret)
    gsap.set([...typedChars, hingeCaret], { opacity: 0 })
    const at = 0.5 * total
    // The cursor rides just after the last typed letter.
    const typing = { n: 0 }
    const type = () => {
      const k = Math.round(typing.n)
      typedChars.forEach((c, i) => (c.style.opacity = i < k ? '1' : '0'))
      const anchor = typedChars[k - 1]
      if (anchor) anchor.after(hingeCaret)
      else typedChars[0]?.before(hingeCaret)
    }
    tl.fromTo(hingeCaret, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: false }, at)
    tl.fromTo(typing, { n: 0 }, { n: typedChars.length, duration: 0.25 * total, ease: 'none', immediateRender: false, onUpdate: type }, at)
  },
}

/* ───────────────────────── What I love: mate in one ───────────────────────── */

// No big year: the Urdu word is the headline; the lines read like every other section's.
function LovesScene() {
  return (
    <>
      <ChaiSteam />
      <MateInOne />
    </>
  )
}

const loves: SceneDef = {
  Scene: LovesScene,
  owns: ['year', 'urdu'],
  build: ({ tl, el, reduced }) => {
    const mate = el.querySelector<HTMLElement>('.mate')
    const urdu = el.querySelector<HTMLElement>('.chapter__urdu')
    if (reduced) {
      gsap.set([mate, urdu].filter(Boolean), { opacity: 1 })
      return
    }
    if (urdu) tl.fromTo(urdu, { opacity: 0, scale: 0.8, rotation: -4 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2)' }, 0)
    if (!mate) return
    // After the first line, the one with chess in it.
    gsap.set(mate, { opacity: 0, y: 16 })
    tl.to(mate, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }, 1.0)
  },
}

export const SCENES: Record<string, SceneDef> = { karachi, london, home, karsaz, sky, hello, loves, explore, letter, closing }
