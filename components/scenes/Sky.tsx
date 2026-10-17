'use client'

import { gsap } from '@/lib/gsap'
import EyeChart from '@/components/scenes/EyeChart'
import { offsetIn, onResize, pointAt } from '@/components/scenes/thread'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * 2023, the plan changed: the longest chapter. No year at the start; one line
 * at a time, centred and slow. The paper plane from Karsaz comes in from where
 * it left, still flying, while she looks up at it; with the first line it
 * stalls and falls, and the eye chart blurs as she reads down it. After the
 * second line the screen cuts to black and nothing moves; then a cursor. The
 * year comes last, and a terminal window opens out of that cursor, landing
 * exactly where 2024's first program sits so the next chapter can cut in
 * around it (lib/transitions.ts).
 *
 * The thread (components/scenes/thread.ts): the plane comes in at the top
 * left, where 2017's flew out, drawing its dashed line; it stalls, falls and
 * lands at her feet. After the cut it is the one thing left in the dark; it
 * shrinks to a point, and the point rises to where the words were and
 * becomes the cursor.
 */

function SkyScene() {
  return (
    <>
      <svg className="scene scene--sky" aria-hidden="true">
        <defs>
          <mask id="sky-trail-mask" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="8000" height="8000">
            <path className="scene__reveal" pathLength={1} stroke="#fff" strokeWidth="14" fill="none" />
          </mask>
        </defs>
        <path className="scene__trail" fill="none" strokeWidth="2" strokeDasharray="6 12" strokeLinecap="round" mask="url(#sky-trail-mask)" />
        <circle className="scene__spark" r="3.5" />
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

const sky: SceneDef = {
  Scene: SkyScene,
  owns: ['year', 'title', 'lines', 'figures'],
  build: ({ tl, el, reduced }) => {
    const year = el.querySelector<HTMLElement>('.chapter__year')
    const title = el.querySelector<HTMLElement>('.chapter__title')
    const masks = Array.from(el.querySelectorAll<HTMLElement>('.chapter__lines .mask'))
    const linesBox = el.querySelector<HTMLElement>('.chapter__lines')
    const figs = Array.from(el.querySelectorAll<HTMLElement>('.chapter__figure > *'))
    const plane = el.querySelector<SVGGElement>('.scene__plane')
    const svg = el.querySelector<SVGSVGElement>('.scene--sky')
    const trail = el.querySelector<SVGPathElement>('.scene__trail')
    const reveal = el.querySelector<SVGPathElement>('.scene__reveal')
    const spark = el.querySelector<SVGCircleElement>('.scene__spark')
    const figBox = el.querySelector<HTMLElement>('.chapter__fig')
    const eye = el.querySelector<HTMLElement>('.eye')
    const cut = el.querySelector<HTMLElement>('.scene-cut')
    const frame = el.querySelector<HTMLElement>('.open-term')
    if (!year || !title || masks.length < 2 || !linesBox || !plane || !svg || !trail || !reveal || !spark || !figBox || !cut || !frame) return

    if (reduced) {
      gsap.set([year, title, ...masks, ...figs], { opacity: 1 })
      if (eye) gsap.set(eye, { opacity: 1, '--auto-gaze': 1 })
      gsap.set([plane, spark, trail, cut, frame], { opacity: 0 })
      return
    }

    gsap.set([year, title, ...masks, ...figs, cut, frame], { opacity: 0 })
    gsap.set([plane, spark], { opacity: 0 })
    if (eye) gsap.set(eye, { opacity: 0, y: 18, rotation: -1.4, '--auto-gaze': 0, '--worse': 0 })

    // One line at a time, in the same place: it comes up, holds, and (but the last) goes.
    const line = (i: number, at: number, hold: number) => {
      tl.fromTo(masks[i], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, at)
      if (hold > 0) tl.to(masks[i], { opacity: 0, y: -10, duration: 0.5, ease: 'power1.in' }, at + hold)
    }

    // First only the plane, still flying, and her looking up at it.
    tl.fromTo(title, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
    tl.fromTo(figs, { opacity: 0, yPercent: 4 }, { opacity: 1, yPercent: 0, duration: 0.8, ease: 'power2.out' }, 0.4)
    // As it stalls, the first line: the medical, and the chart she could not read.
    line(0, 0.8, 3.1)
    if (eye) {
      tl.to(eye, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.3)
      tl.to(eye, { '--auto-gaze': 1, '--worse': 1, duration: 1.8, ease: 'power1.inOut' }, 1.6)
      tl.to(eye, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 3.9)
    }
    line(1, 4.2, 0)
    // Then nothing: a hard cut to black, and a held beat.
    const CUT = 5.5
    tl.set(cut, { opacity: 1 }, CUT)
    const meta = el.querySelector<HTMLElement>('.chapter__meta')
    tl.set([masks[1], title, ...figs, ...(meta ? [meta] : [])], { opacity: 0 }, CUT + 0.01)

    // A cursor in the dark, where the words were.
    const caret = document.createElement('span')
    caret.className = 'type-caret type-caret--alone'
    caret.setAttribute('aria-hidden', 'true')
    linesBox.appendChild(caret)
    gsap.set(caret, { opacity: 0 })

    // The thread, drawn in the layer's pixels: in, a stall, the fall to her feet,
    // and after the cut, the point it shrinks to rising into the cursor.
    const st = { p: 0, spin: 0, shrink: 0, dot: 0 }
    const geo = { stall: 0.6, land: { x: 0, y: 0 }, cursor: { x: 0, y: 0 } }
    const measureThread = onResize(() => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      const fo = offsetIn(figBox, el)
      const land = { x: fo.x + figBox.offsetWidth * 0.12, y: fo.y + figBox.offsetHeight * 0.97 }
      const stall = { x: w * 0.6, y: h * 0.13 }
      const inPath = `M${-w * 0.05} ${h * 0.04} C${w * 0.2} ${h * 0.14}, ${w * 0.48} ${h * 0.24}, ${stall.x} ${stall.y}`
      trail.setAttribute('d', inPath)
      const inLen = trail.getTotalLength()
      const full = `${inPath} C${stall.x + w * 0.07} ${stall.y + h * 0.16}, ${land.x + w * 0.12} ${land.y - h * 0.32}, ${land.x} ${land.y}`
      trail.setAttribute('d', full)
      reveal.setAttribute('d', full)
      geo.stall = inLen / Math.max(1, trail.getTotalLength())
      geo.land = land
      const c0 = offsetIn(caret, el)
      geo.cursor = { x: c0.x + caret.offsetWidth / 2, y: c0.y + caret.offsetHeight / 2 }
    })
    const drawThread = () => {
      measureThread()
      reveal.style.strokeDasharray = '1'
      reveal.style.strokeDashoffset = String(1 - st.p)
      const at = pointAt(trail, st.p)
      plane.setAttribute('transform', `translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) rotate(${(at.angle + st.spin).toFixed(1)}) scale(${(1 - st.shrink).toFixed(3)})`)
      spark.setAttribute('cx', (geo.land.x + (geo.cursor.x - geo.land.x) * st.dot).toFixed(1))
      spark.setAttribute('cy', (geo.land.y + (geo.cursor.y - geo.land.y) * st.dot).toFixed(1))
    }
    drawThread()
    const stallAt = geo.stall
    tl.set(plane, { opacity: 1 }, 0.1)
    tl.to(st, { p: stallAt, duration: 1.4, ease: 'power2.out', onUpdate: drawThread }, 0.1)
    tl.to(st, { spin: -18, duration: 0.4, ease: 'sine.inOut', onUpdate: drawThread }, 1.5)
    tl.to(st, { p: 1, duration: 1.4, ease: 'power2.in', onUpdate: drawThread }, 1.9)
    tl.to(st, { spin: 342, duration: 1.4, ease: 'power1.in', onUpdate: drawThread }, 1.9)
    // In the dark only the fallen plane is left; it goes to a point, and the point becomes the cursor.
    tl.set(trail, { opacity: 0 }, CUT + 0.01)
    tl.to(st, { shrink: 1, duration: 0.2, ease: 'power2.in', onUpdate: drawThread }, CUT + 0.2)
    tl.set(spark, { opacity: 1 }, CUT + 0.3)
    tl.set(plane, { opacity: 0 }, CUT + 0.4)
    tl.to(st, { dot: 1, duration: 0.25, ease: 'power2.inOut', onUpdate: drawThread }, CUT + 0.3)
    tl.set(spark, { opacity: 0 }, CUT + 0.55)
    tl.fromTo(caret, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: false }, CUT + 0.55)

    // The year, last of all.
    const Y = CUT + 0.75
    tl.fromTo(year, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, Y)

    // A window opens out of the cursor and lands on 2024's first program.
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
      const c = offsetIn(caret, el)
      from = {
        x: c.x,
        y: c.y,
        sx: Math.max(0.02, caret.offsetWidth / Math.max(1, target.offsetWidth)),
        sy: Math.max(0.02, caret.offsetHeight / Math.max(1, target.offsetHeight)),
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
    const O = Y + 0.6
    tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false, onStart: draw }, O)
    tl.to(open, { p: 1, duration: 0.8, ease: 'power3.inOut', onUpdate: draw }, O)
    tl.fromTo(caret, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'power1.in', immediateRender: false }, O + 0.05)
    tl.to(year, { opacity: 0.75, duration: 0.6, ease: 'power1.inOut' }, O + 0.2)
    tl.to({}, { duration: 0.2 }, O + 0.8)
  },
}

export default sky
