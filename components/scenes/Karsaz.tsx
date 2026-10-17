'use client'

import { gsap, SplitText } from '@/lib/gsap'
import { KARSAZ_SUM } from '@/content/interactive'
import { pointAt } from '@/components/scenes/thread'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * 2017, Karsaz. The thread picks up here: a dashed line comes down out of the
 * top right of the sky, where the 2007 kite was last seen, into her raised
 * hand. On "I was going to fly." the paper plane leaves that hand and flies
 * the line out of the top left, where 2023 will pick it up. Everything is
 * drawn in the layer's own pixels from where her hand really is.
 */

// The paper plane in the render, as fractions of the figure's box.
const HAND = { x: 0.17, y: 0.12 }

function KarsazScene() {
  return (
    <svg className="scene scene--karsaz" aria-hidden="true">
      <defs>
        <mask id="karsaz-in-mask" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="8000" height="8000">
          <path className="scene__reveal-in" pathLength={1} stroke="#fff" strokeWidth="14" fill="none" />
        </mask>
        <mask id="karsaz-trail-mask" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="8000" height="8000">
          <path className="scene__reveal" pathLength={1} stroke="#fff" strokeWidth="14" fill="none" />
        </mask>
      </defs>
      <path className="scene__trail scene__trail--in" fill="none" strokeWidth="2" strokeDasharray="6 12" strokeLinecap="round" mask="url(#karsaz-in-mask)" />
      <path className="scene__trail" fill="none" strokeWidth="2" strokeDasharray="6 12" strokeLinecap="round" mask="url(#karsaz-trail-mask)" />
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
    const fig = el.querySelector<HTMLElement>('.chapter__fig')
    const threadIn = svg?.querySelector<SVGPathElement>('.scene__trail--in')
    const revealIn = svg?.querySelector<SVGPathElement>('.scene__reveal-in')
    const trail = svg?.querySelector<SVGPathElement>('.scene__trail:not(.scene__trail--in)')
    const reveal = svg?.querySelector<SVGPathElement>('.scene__reveal')
    const plane = svg?.querySelector<SVGGElement>('.scene__plane')
    if (!svg || !fig || !threadIn || !revealIn || !trail || !reveal || !plane) return

    const state = { into: 0, out: 0, fade: 1 }
    const draw = () => {
      const box = svg.getBoundingClientRect()
      if (box.width === 0) return
      const w = el.offsetWidth
      const h = el.offsetHeight
      const k = w / box.width
      const f = fig.getBoundingClientRect()
      const hx = (f.left - box.left) * k + f.width * k * HAND.x
      const hy = (f.top - box.top) * k + f.height * k * HAND.y
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      // In from the top right, where the kite went; out at the top left, toward 2023.
      const into = `M${(w * 1.03).toFixed(1)} ${(-h * 0.04).toFixed(1)} C${(w * 0.92).toFixed(1)} ${(h * 0.14).toFixed(1)}, ${(hx + w * 0.14).toFixed(1)} ${(hy - h * 0.22).toFixed(1)}, ${hx.toFixed(1)} ${hy.toFixed(1)}`
      const out = `M${hx.toFixed(1)} ${hy.toFixed(1)} C${(hx - w * 0.14).toFixed(1)} ${(hy - h * 0.16).toFixed(1)}, ${(w * 0.34).toFixed(1)} ${(h * 0.16).toFixed(1)}, ${(w * 0.22).toFixed(1)} ${(h * 0.2).toFixed(1)}`
      threadIn.setAttribute('d', into)
      revealIn.setAttribute('d', into)
      trail.setAttribute('d', out)
      reveal.setAttribute('d', out)
      revealIn.style.strokeDasharray = '1'
      revealIn.style.strokeDashoffset = String(1 - state.into)
      reveal.style.strokeDasharray = '1'
      reveal.style.strokeDashoffset = String(1 - state.out)
      threadIn.style.opacity = String(0.45 * state.fade)
      const p = pointAt(trail, state.out)
      plane.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.angle.toFixed(1)})`)
    }

    gsap.set(plane, { opacity: 0 })
    if (reduced) {
      state.into = 1
      state.out = 1
      state.fade = 0.6
      draw()
      return
    }
    draw()
    // The line comes down from the sky into her hand while the year is worked out.
    tl.to(state, { into: 1, duration: 1.2, ease: 'power1.inOut', onUpdate: draw }, 0.1)
    // The plane leaves her hand as the last line (the application, rising at 0.85) lands,
    // and flies the line on and off the top of the screen; the old line lets go.
    const start = 1.4
    tl.set(plane, { opacity: 1 }, start)
    tl.to(state, { out: 1, duration: total - start - 0.05, ease: 'power1.in', onUpdate: draw }, start)
    tl.to(state, { fade: 0, duration: 0.7, ease: 'power1.in', onUpdate: draw }, start + 0.2)
    tl.set(plane, { opacity: 0 }, total - 0.05)
  },
}

export default karsaz
