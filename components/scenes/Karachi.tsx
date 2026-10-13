'use client'

import { gsap } from '@/lib/gsap'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * 2007, Karachi: the first thing she ever flew. A paper kite on a string from
 * the toddler's raised hand, high in the empty part of the sky. The kite body
 * and tail sway on their own clock (SMIL, about the bridle point); the scroll
 * timeline climbs the kite and redraws the string from her hand, so the
 * time-based and scroll-driven motion never share an element.
 */

// Where the string leaves the figure, as fractions of the figure's box.
// Tuned to the render: her right arm stretched up toward the upper left.
const HAND = { x: 0.2, y: 0.12 }

// Kite position as fractions of the chapter box, start → end of the chapter.
const DESKTOP = { from: { x: 0.6, y: 0.28 }, to: { x: 0.57, y: 0.16 }, scale: 1.15 }
const PHONE = { from: { x: 0.76, y: 0.53 }, to: { x: 0.78, y: 0.47 }, scale: 0.62 }

function KarachiScene() {
  return (
    <svg className="scene scene--karachi" aria-hidden="true">
      <path className="scene__string" pathLength={1} fill="none" strokeWidth="1.4" strokeLinecap="round" />
      <g className="scene__kite">
        <g className="scene__kite-body" transform="rotate(-24)">
          <animateTransform attributeName="transform" type="rotate" additive="sum" values="-8 0 0; 6 0 0; -8 0 0" dur="5.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
          <g className="scene__kite-tail">
            <animateTransform attributeName="transform" type="rotate" values="-9 0 58; 9 0 58; -9 0 58" dur="2.9s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
            <path className="scene__kite-tailline" d="M0 58 q 9 18 0 36 q -9 18 0 36 q 8 16 0 32" fill="none" strokeWidth="1.3" strokeLinecap="round" />
            <path className="scene__kite-bow" d="M-7 -4 L7 4 M-7 4 L7 -4" transform="translate(4 86)" strokeWidth="2.2" strokeLinecap="round" />
            <path className="scene__kite-bow" d="M-7 -4 L7 4 M-7 4 L7 -4" transform="translate(-4 122)" strokeWidth="2.2" strokeLinecap="round" />
            <path className="scene__kite-bow" d="M-7 -4 L7 4 M-7 4 L7 -4" transform="translate(3 154)" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <path className="scene__kite-left" d="M0 -46 L-30 2 L0 58 Z" />
          <path className="scene__kite-right" d="M0 -46 L30 2 L0 58 Z" />
          <path className="scene__kite-spar" d="M0 -46 L0 58 M-30 2 L30 2" fill="none" strokeWidth="1.2" strokeLinecap="round" />
          <path className="scene__kite-edge" d="M0 -46 L30 2 L0 58 L-30 2 Z" fill="none" strokeWidth="1" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  )
}

const karachi: SceneDef = {
  Scene: KarachiScene,
  build: ({ tl, el, total, reduced }) => {
    const svg = el.querySelector<SVGSVGElement>('.scene--karachi')
    const string = svg?.querySelector<SVGPathElement>('.scene__string')
    const kite = svg?.querySelector<SVGGElement>('.scene__kite')
    const fig = el.querySelector<HTMLElement>('.chapter__fig')
    if (!svg || !string || !kite) return
    // No render yet: no hand to hold the string, so the sky stays empty.
    if (!fig) return

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const render = (climb: number) => {
      const box = svg.getBoundingClientRect()
      if (box.width === 0) return
      const w = el.offsetWidth
      const h = el.offsetHeight
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      // Everything measured in the layer's own pixels, whatever scale the stage has it at.
      const k = w / box.width
      const f = fig.getBoundingClientRect()
      const hx = (f.left - box.left) * k + f.width * k * HAND.x
      const hy = (f.top - box.top) * k + f.height * k * HAND.y
      const spec = w < 900 ? PHONE : DESKTOP
      const kx = lerp(spec.from.x, spec.to.x, climb) * w
      const ky = lerp(spec.from.y, spec.to.y, climb) * h
      kite.setAttribute('transform', `translate(${kx.toFixed(1)} ${ky.toFixed(1)}) scale(${spec.scale})`)
      // The string sags a little under its own weight and bows with the wind.
      const dx = kx - hx
      const dy = ky - hy
      const dist = Math.hypot(dx, dy)
      const cx = (hx + kx) / 2 + dist * 0.05
      const cy = (hy + ky) / 2 + dist * 0.14
      string.setAttribute('d', `M${hx.toFixed(1)} ${hy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${kx.toFixed(1)} ${ky.toFixed(1)}`)
    }

    gsap.set(svg, { opacity: 1 })
    if (reduced) {
      svg.pauseAnimations()
      gsap.set(string, { strokeDasharray: 1, strokeDashoffset: 0 })
      render(1)
      return
    }
    gsap.set(string, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(kite, { opacity: 0 })
    // She arrives, the string runs up from her hand, and the kite is there at the end of it.
    const climb = { t: 0 }
    tl.to(climb, { t: 1, duration: total + 0.6 - 0.25, ease: 'power1.out', onUpdate: () => render(climb.t) }, 0.25)
    tl.to(string, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.6)
    tl.to(kite, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 1.1)
  },
}

export default karachi
