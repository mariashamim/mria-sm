'use client'

import { gsap } from '@/lib/gsap'
import { useUI } from '@/lib/ui'

export type SceneContext = {
  tl: ReturnType<typeof gsap.timeline>
  el: HTMLElement
  /** Length of the chapter timeline before its trailing hold. */
  total: number
  reduced: boolean
}

export type SceneDef = {
  Scene: () => React.JSX.Element
  build: (ctx: SceneContext) => void
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

const karsaz: SceneDef = {
  Scene: KarsazScene,
  build: ({ tl, el, total, reduced }) => {
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
    // The plane leaves her hand once the last line ("I was going to fly.") has landed.
    const start = 0.58 * total
    const dur = 0.4 * total
    tl.to(plane, { opacity: 1, duration: 0.12 }, start)
    tl.to(plane, { motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: dur, ease: 'power1.in' }, start)
    tl.to(reveal, { strokeDashoffset: 0, duration: dur, ease: 'power1.in' }, start)
    tl.to(plane, { opacity: 0, duration: 0.1 }, start + dur - 0.08)
    // Ginger springs up at the plane the moment it leaves, then settles back down.
    const paw = el.querySelector<HTMLElement>('.chapter__fig--cat .avatar > picture')
    if (paw) {
      tl.fromTo(paw, { yPercent: 4, rotate: 0 }, { yPercent: -16, rotate: -6, duration: 0.1 * total, ease: 'power2.out' }, start - 0.02 * total)
      tl.to(paw, { yPercent: 0, rotate: 0, duration: 0.16 * total, ease: 'bounce.out' }, start + 0.08 * total)
    }
  },
}

/* ───────────────────── The sky said no: contrail and dark ───────────────────── */

const CONTRAIL = 'M-80 560 C 340 470, 780 330, 1540 100'

function SkyScene() {
  return (
    <>
      <svg className="scene scene--sky" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path className="scene__contrail" d={CONTRAIL} pathLength={1} fill="none" strokeWidth="2.5" strokeLinecap="round" />
        <g className="scene__jet">
          <path d="M0 0 L-18 -5 L-12 0 L-18 5 Z" />
        </g>
      </svg>
      <div className="scene-dim" aria-hidden="true" />
      <div className="scene-screen" aria-hidden="true">
        <span />
      </div>
    </>
  )
}

const sky: SceneDef = {
  Scene: SkyScene,
  build: ({ tl, el, total, reduced }) => {
    const contrail = el.querySelector<SVGPathElement>('.scene__contrail')
    const jet = el.querySelector<SVGGElement>('.scene__jet')
    const dim = el.querySelector<HTMLElement>('.scene-dim')
    const screen = el.querySelector<HTMLElement>('.scene-screen')
    if (!contrail || !jet || !dim || !screen) return
    const end = total + 1.2
    gsap.set(contrail, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1 })
    gsap.set(jet, { opacity: 0 })
    gsap.set(dim, { opacity: 0 })
    gsap.set(screen, { opacity: 0, scale: 0.4 })
    if (reduced) {
      gsap.set(contrail, { strokeDashoffset: 0, opacity: 0.35 })
      gsap.set(dim, { opacity: 0.6 })
      gsap.set(screen, { opacity: 1, scale: 1 })
      return
    }
    // A jet crosses while the first lines land; its trail hangs, then the dark comes.
    const s = 0.04 * end
    const d = 0.38 * end
    tl.to(jet, { opacity: 1, duration: 0.05 }, s)
    tl.to(jet, { motionPath: { path: contrail, align: contrail, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: d, ease: 'none' }, s)
    tl.to(contrail, { strokeDashoffset: 0, duration: d, ease: 'none' }, s)
    tl.to(jet, { opacity: 0, duration: 0.05 }, s + d - 0.05)
    tl.to(contrail, { opacity: 0, duration: 0.2 * end, ease: 'power1.in' }, 0.5 * end)
    tl.to(dim, { opacity: 0.78, duration: 0.35 * end, ease: 'power1.inOut' }, 0.42 * end)
    // The one thing that lights up in the dark: a screen.
    tl.to(screen, { opacity: 1, scale: 1, duration: 0.14 * end, ease: 'power2.out' }, 0.86 * end)
  },
}

/* ───────────────────────── Hello, World: the terminal ───────────────────────── */

const CODE = 'printf("Hello, World");'

function HelloScene() {
  const openSudoku = useUI((s) => s.setSudokuOpen)
  return (
    <div className="terminal" aria-label="Maria's first program">
      <div className="terminal__bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>maria@karachi: ~/first</span>
      </div>
      <div className="terminal__body">
        <div className="terminal__line">
          <span className="terminal__prompt">$ </span>
          <span className="terminal__typed" />
          <span className="terminal__caret" aria-hidden="true" />
        </div>
        <div className="terminal__line terminal__out">Hello, World</div>
      </div>
      <button type="button" className="terminal__sudoku" onClick={() => openSudoku(true)} data-hover>
        <span className="terminal__grid" aria-hidden="true" />
        <span className="terminal__sudoku-label">
          sudoku.exe
          <small>The one I wrote in x86 assembly. Click to play.</small>
        </span>
      </button>
    </div>
  )
}

const hello: SceneDef = {
  Scene: HelloScene,
  build: ({ tl, el, total, reduced }) => {
    const term = el.querySelector<HTMLElement>('.terminal')
    const typed = el.querySelector<HTMLElement>('.terminal__typed')
    const caret = el.querySelector<HTMLElement>('.terminal__caret')
    const out = el.querySelector<HTMLElement>('.terminal__out')
    const sudoku = el.querySelector<HTMLElement>('.terminal__sudoku')
    if (!term || !typed || !out || !sudoku || !caret) return
    if (reduced) {
      typed.textContent = CODE
      gsap.set([term, out, sudoku], { opacity: 1 })
      return
    }
    gsap.set(term, { opacity: 0, y: 24 })
    gsap.set([out, sudoku], { opacity: 0 })
    const state = { n: 0 }
    const render = () => {
      typed.textContent = CODE.slice(0, Math.round(state.n))
    }
    render()
    tl.to(term, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.35 * total)
    tl.to(state, { n: CODE.length, duration: 0.36 * total, ease: 'none', onUpdate: render }, 0.42 * total)
    tl.to(out, { opacity: 1, duration: 0.12 }, 0.8 * total)
    tl.to(caret, { opacity: 0, duration: 0.05 }, 0.8 * total)
    tl.to(sudoku, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.9 * total)
  },
}

export const SCENES: Record<string, SceneDef> = { karsaz, sky, hello }
