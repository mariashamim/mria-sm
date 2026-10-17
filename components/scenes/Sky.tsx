'use client'

import { gsap, SplitText } from '@/lib/gsap'
import EyeChart from '@/components/scenes/EyeChart'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * 2023, the window closed: the climax, and the longest chapter. No year at
 * the start; one line at a time, centred and slow. The paper plane from
 * Karsaz comes in from where it left, stalls and falls. The eye chart blurs
 * as she reads down it. On "They closed the window to the sky." the screen
 * cuts to black and nothing moves; then a cursor, and the last line types
 * itself. The year comes last, and a terminal window opens out of that line,
 * landing exactly where 2024's terminal sits so the next chapter can cut in
 * around it (lib/transitions.ts).
 */

// In from the top left, where the Karsaz plane flew out, losing speed as it climbs.
const PLANE_IN = 'M-60 30 C 180 110, 420 220, 640 230 C 760 236, 830 200, 880 150'
const PLANE_FALL = 'M880 150 C 905 260, 860 420, 930 600 C 970 720, 940 860, 990 1000'

function SkyScene() {
  return (
    <>
      <svg className="scene scene--sky" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path className="scene__flight" d={PLANE_IN} fill="none" />
        <path className="scene__fall" d={PLANE_FALL} fill="none" />
        <g className="scene__plane">
          <path d="M0 0 L-40 13 L-29 0 L-40 -13 Z" />
          <path d="M-29 0 L-40 13 L-25 3 Z" opacity="0.55" />
        </g>
      </svg>
      <EyeChart />
      <div className="scene-cut" aria-hidden="true" />
      <div className="open-term" aria-hidden="true">
        <div className="terminal__bar">
          <span>C:\MARIA\FIRST.C</span>
          <span>80 × 25</span>
        </div>
      </div>
    </>
  )
}

/** Offset of an element inside the layer, ignoring every transform on the way. */
function offsetIn(node: HTMLElement, layer: HTMLElement) {
  let x = 0
  let y = 0
  let n: HTMLElement | null = node
  while (n && n !== layer) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y }
}

const sky: SceneDef = {
  Scene: SkyScene,
  owns: ['year', 'title', 'lines', 'figures'],
  build: ({ tl, el, reduced }) => {
    const year = el.querySelector<HTMLElement>('.chapter__year')
    const title = el.querySelector<HTMLElement>('.chapter__title')
    const masks = Array.from(el.querySelectorAll<HTMLElement>('.chapter__lines .mask'))
    const figs = Array.from(el.querySelectorAll<HTMLElement>('.chapter__figure > *'))
    const plane = el.querySelector<SVGGElement>('.scene__plane')
    const flight = el.querySelector<SVGPathElement>('.scene__flight')
    const fall = el.querySelector<SVGPathElement>('.scene__fall')
    const eye = el.querySelector<HTMLElement>('.eye')
    const cut = el.querySelector<HTMLElement>('.scene-cut')
    const frame = el.querySelector<HTMLElement>('.open-term')
    if (!year || !title || masks.length < 5 || !plane || !flight || !fall || !cut || !frame) return

    if (reduced) {
      gsap.set([year, title, ...masks, ...figs], { opacity: 1 })
      if (eye) gsap.set(eye, { opacity: 1, '--auto-gaze': 1 })
      gsap.set([plane, cut, frame], { opacity: 0 })
      return
    }

    gsap.set([year, title, ...masks, ...figs, cut, frame], { opacity: 0 })
    gsap.set(plane, { opacity: 0 })
    if (eye) gsap.set(eye, { opacity: 0, y: 18, rotation: -1.4, '--auto-gaze': 0, '--worse': 0 })

    // One line at a time, in the same place: it comes up, holds, and goes.
    const line = (i: number, at: number, hold: number) => {
      tl.fromTo(masks[i], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, at)
      tl.to(masks[i], { opacity: 0, y: -10, duration: 0.5, ease: 'power1.in' }, at + hold)
    }

    tl.fromTo(title, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)

    // The plane: in, slowing as it climbs, a stall, then down.
    tl.set(plane, { opacity: 1 }, 0.1)
    tl.to(plane, { motionPath: { path: flight, align: flight, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 2.3, ease: 'power2.out' }, 0.1)
    tl.to(plane, { rotation: '-=18', duration: 0.5, ease: 'sine.inOut' }, 2.4)
    tl.to(plane, { motionPath: { path: fall, align: fall, alignOrigin: [0.5, 0.5] }, duration: 1.3, ease: 'power2.in' }, 2.9)
    tl.to(plane, { rotation: '+=420', duration: 1.3, ease: 'power1.in' }, 2.9)
    tl.set(plane, { opacity: 0 }, 4.2)

    line(0, 0.3, 1.5) // I applied to the Air Force. GD Pilot.
    // Each line is gone before the next one comes: one thought at a time.
    line(1, 2.35, 1.2) // I wanted the sky.
    // She arrives with "I wanted the sky", looking up at the plane.
    tl.fromTo(figs, { opacity: 0, yPercent: 4 }, { opacity: 1, yPercent: 0, duration: 0.8, ease: 'power2.out' }, 2.1)
    line(2, 4.1, 2.6) // My eyesight failed the medical test.
    // The chart: read down it, and the whole of it slips out of focus, to the last line.
    if (eye) {
      tl.to(eye, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 4.3)
      tl.to(eye, { '--auto-gaze': 1, '--worse': 1, duration: 1.8, ease: 'power1.inOut' }, 4.6)
      tl.to(eye, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 6.8)
    }
    tl.to(figs, { opacity: 0.85, duration: 0.6 }, 6.7)

    // "They closed the window to the sky." Then nothing: a hard cut to black, and a held beat.
    tl.fromTo(masks[3], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 7.25)
    const CUT = 8.5
    tl.set(cut, { opacity: 1 }, CUT)
    const meta = el.querySelector<HTMLElement>('.chapter__meta')
    tl.set([masks[3], title, ...figs, ...(meta ? [meta] : [])], { opacity: 0 }, CUT + 0.01)

    // A cursor in the dark, then the line types itself out behind it.
    const last = masks[4]
    const p = last.querySelector<HTMLElement>('p')
    if (!p) return
    const split = SplitText.create(p, { type: 'words,chars' })
    const chars = split.chars as HTMLElement[]
    const caret = document.createElement('span')
    caret.className = 'type-caret'
    caret.setAttribute('aria-hidden', 'true')
    p.appendChild(caret)
    gsap.set(chars, { opacity: 0 })
    const typed = { n: 0 }
    const place = () => {
      const k = Math.round(typed.n)
      const c = chars[Math.max(0, k - 1)]
      if (!c) return
      // Characters sit inside word boxes; measure them against the line itself.
      const o = offsetIn(c, p)
      gsap.set(caret, { x: k === 0 ? o.x : o.x + c.offsetWidth, y: o.y })
    }
    tl.set(last, { opacity: 1, y: 0 }, CUT + 0.9)
    tl.fromTo(caret, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: false, onStart: place, onReverseComplete: place }, CUT + 0.9)
    tl.to(chars, { opacity: 1, duration: 0.01, ease: 'none', stagger: 1.4 / chars.length }, CUT + 1.2)
    tl.to(typed, { n: chars.length, duration: 1.4, ease: 'none', onUpdate: place }, CUT + 1.2)

    // The year, last of all.
    const Y = CUT + 2.8
    tl.fromTo(year, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, Y)

    // The window opens out of the line and lands on 2024's terminal.
    const target = document.querySelector<HTMLElement>('#hello .terminal')
    const helloLayer = target?.closest<HTMLElement>('[data-layer]')
    if (!target || !helloLayer) return
    let measured = ''
    let from = { x: 0, y: 0, sx: 1, sy: 1 }
    let to = { x: 0, y: 0 }
    const measure = () => {
      const key = `${innerWidth}x${innerHeight}`
      if (key === measured) return
      measured = key
      const t = offsetIn(target, helloLayer)
      to = { x: t.x, y: t.y }
      frame.style.width = `${target.offsetWidth}px`
      frame.style.height = `${target.offsetHeight}px`
      // The typed line's own extent, from its first and last characters.
      const a = offsetIn(chars[0], el)
      const z = offsetIn(chars[chars.length - 1], el)
      const left = Math.min(a.x, z.x)
      const right = Math.max(a.x + chars[0].offsetWidth, z.x + chars[chars.length - 1].offsetWidth)
      const top = a.y
      const bottom = z.y + chars[chars.length - 1].offsetHeight
      from = {
        x: left,
        y: top,
        sx: Math.max(0.02, (right - left) / Math.max(1, target.offsetWidth)),
        sy: Math.max(0.02, (bottom - top) / Math.max(1, target.offsetHeight)),
      }
    }
    const open = { p: 0 }
    const draw = () => {
      measure()
      const k = open.p
      gsap.set(frame, {
        x: from.x + (to.x - from.x) * k,
        y: from.y + (to.y - from.y) * k,
        scaleX: from.sx + (1 - from.sx) * k,
        scaleY: from.sy + (1 - from.sy) * k,
        transformOrigin: '0 0',
      })
    }
    const O = Y + 0.8
    tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false, onStart: draw }, O)
    tl.to(open, { p: 1, duration: 0.8, ease: 'power3.inOut', onUpdate: draw }, O)
    tl.to([last, caret], { opacity: 0, duration: 0.3, ease: 'power1.in' }, O + 0.05)
    tl.to(year, { opacity: 0.35, duration: 0.6, ease: 'power1.inOut' }, O + 0.2)
    tl.to({}, { duration: 0.2 }, O + 0.8)
  },
}

export default sky
