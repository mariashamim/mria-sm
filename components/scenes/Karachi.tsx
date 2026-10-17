'use client'

import { useEffect, useRef } from 'react'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/gsap'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * 2007, Karachi: the first thing she ever flew. A paper kite on a string from
 * the toddler's raised hand, high in the empty part of the sky. The kite body
 * and tail sway on their own clock (SMIL, about the bridle point); the scroll
 * timeline climbs the kite and redraws the string from her hand, so the
 * time-based and scroll-driven motion never share an element.
 *
 * The breeze: the kite also drifts toward the pointer (or with the phone's
 * tilt), and the string follows. That offset lives in a per-scene Wind
 * record that both the scroll render and the pointer tween read; neither
 * tweens the same property as the other.
 */

// Where the string leaves the figure, as fractions of the figure's box.
// Tuned to the render: her arm stretched up toward the top corner.
const HAND = { x: 0.07, y: 0.14 }

// Kite position as fractions of the chapter box, start → end of the chapter:
// it leaves from just above her hand and climbs with the scroll.
const DESKTOP = { from: { x: 0.66, y: 0.5 }, to: { x: 0.56, y: 0.12 }, scale: 1.15 }
const PHONE = { from: { x: 0.74, y: 0.62 }, to: { x: 0.8, y: 0.45 }, scale: 0.62 }

type Wind = {
  x: number
  y: number
  /** The kite's resting point and how far the breeze may carry it, in layer pixels. */
  base: { x: number; y: number; max: number } | null
  render: (() => void) | null
}
const WINDS = new WeakMap<SVGSVGElement, Wind>()
const windOf = (svg: SVGSVGElement): Wind => {
  let w = WINDS.get(svg)
  if (!w) {
    w = { x: 0, y: 0, base: null, render: null }
    WINDS.set(svg, w)
  }
  return w
}

function KarachiScene() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg || prefersReducedMotion()) return
    const wind = windOf(svg)
    const layer = svg.closest<HTMLElement>('[data-layer]')
    const touch = isTouch()
    const visible = () => !!layer && getComputedStyle(layer).visibility !== 'hidden'

    const blow = (x: number, y: number) => {
      gsap.to(wind, { x, y, duration: 1.6, ease: 'power2.out', overwrite: true, onUpdate: () => wind.render?.() })
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !wind.base || !visible()) return
      const box = svg.getBoundingClientRect()
      if (box.width === 0) return
      const k = (layer?.offsetWidth ?? box.width) / box.width
      const px = (e.clientX - box.left) * k
      const py = (e.clientY - box.top) * k
      let dx = (px - wind.base.x) * 0.3
      let dy = (py - wind.base.y) * 0.2
      const d = Math.hypot(dx, dy)
      if (d > wind.base.max) {
        dx *= wind.base.max / d
        dy *= wind.base.max / d
      }
      blow(dx, dy)
    }
    const onLeave = () => blow(0, 0)
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null || !wind.base || !visible()) return
      const g = Math.max(-25, Math.min(25, e.gamma)) / 25
      const b = Math.max(-25, Math.min(25, e.beta - 50)) / 25
      blow(g * wind.base.max, b * wind.base.max * 0.4)
    }

    if (!touch) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('mouseleave', onLeave)
    } else if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', onTilt)
    }
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('deviceorientation', onTilt)
      gsap.killTweensOf(wind)
    }
  }, [])

  return (
    <svg ref={ref} className="scene scene--karachi" aria-hidden="true">
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
  // The Urdu word arrives by ink (lib/setpieces.ts); it appears as the drawn one settles onto it.
  owns: ['urdu'],
  build: ({ tl, el, total, reduced }) => {
    const urdu = el.querySelector<HTMLElement>('.chapter__urdu')
    if (urdu && !reduced) tl.fromTo(urdu, { opacity: 0 }, { opacity: 0.3, duration: 0.4, ease: 'power1.inOut' }, 0.25)
    const svg = el.querySelector<SVGSVGElement>('.scene--karachi')
    const string = svg?.querySelector<SVGPathElement>('.scene__string')
    const kite = svg?.querySelector<SVGGElement>('.scene__kite')
    const fig = el.querySelector<HTMLElement>('.chapter__fig')
    if (!svg || !string || !kite) return
    // No render yet: no hand to hold the string, so the sky stays empty.
    if (!fig) return
    const wind = windOf(svg)
    // The city's windows, on the stage's persistent skyline (components/scene/Rooftop.tsx).
    const lamps = Array.from(el.closest('.stage')?.querySelectorAll<HTMLElement>('.stage__roof .rooftop__windows i') ?? [])

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    let climb = 0
    // At the very end the string slips from her hand and the kite goes, up and off
    // the top right: where the thread comes back down from in 2017 (Karsaz.tsx).
    let release = 0
    const render = () => {
      const box = svg.getBoundingClientRect()
      if (box.width === 0) return
      const w = el.offsetWidth
      const h = el.offsetHeight
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      // Everything measured in the layer's own pixels, whatever scale the stage has it at.
      const k = w / box.width
      const f = fig.getBoundingClientRect()
      const phone = w < 900
      const spec = phone ? PHONE : DESKTOP
      // On phones she is mirrored (CSS) so her kite arm points up-right, beside the short last line.
      const hx = (f.left - box.left) * k + f.width * k * (phone ? 1 - HAND.x : HAND.x)
      const hy = (f.top - box.top) * k + f.height * k * HAND.y
      const gone = release * release
      const bx = lerp(lerp(spec.from.x, spec.to.x, climb), 1.08, gone) * w
      const by = lerp(lerp(spec.from.y, spec.to.y, climb), -0.18, gone) * h
      wind.base = { x: bx, y: by, max: Math.min(w, h) * (phone ? 0.08 : 0.14) }
      const kx = bx + wind.x
      const ky = by + wind.y
      // The kite leans into the breeze a little.
      const lean = (wind.x / Math.max(1, wind.base.max)) * 10
      kite.setAttribute('transform', `translate(${kx.toFixed(1)} ${ky.toFixed(1)}) rotate(${lean.toFixed(2)}) scale(${spec.scale})`)
      // The string sags a little under its own weight and bows with the wind.
      const dx = kx - hx
      const dy = ky - hy
      const dist = Math.hypot(dx, dy)
      const cx = (hx + kx) / 2 + dist * 0.05
      const cy = (hy + ky) / 2 + dist * 0.14
      // Once let go, the loose end trails the kite instead of her hand.
      const sx = lerp(hx, kx, release * 0.8)
      const sy = lerp(hy, ky, release * 0.8) + release * dist * 0.08
      string.setAttribute('d', `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${kx.toFixed(1)} ${ky.toFixed(1)}`)
    }
    wind.render = render

    gsap.set(svg, { opacity: 1 })
    if (reduced) {
      gsap.set(lamps, { opacity: 1 })
      svg.pauseAnimations()
      gsap.set(string, { strokeDasharray: 1, strokeDashoffset: 0 })
      climb = 1
      render()
      return
    }
    gsap.set(string, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(kite, { opacity: 0 })
    // She arrives, the string runs up from her hand, and the kite is there at the end of it.
    const proxy = { t: 0 }
    tl.to(
      proxy,
      {
        t: 1,
        duration: total + 0.6 - 0.25,
        ease: 'power1.out',
        onUpdate: () => {
          climb = proxy.t
          render()
        },
      },
      0.25,
    )
    tl.to(string, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.6)
    tl.to(kite, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 1.1)
    const letGo = { r: 0 }
    tl.to(
      letGo,
      {
        r: 1,
        duration: 0.9,
        ease: 'power1.in',
        onUpdate: () => {
          release = letGo.r
          render()
        },
      },
      total - 0.3,
    )
    // Below her, the city switches on one window at a time, in no hurry.
    if (lamps.length) {
      const order = lamps.map((l, i) => ({ l, k: (i * 7919) % lamps.length })).sort((a, b) => a.k - b.k).map((o) => o.l)
      tl.fromTo(order, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power1.out', stagger: { each: (total - 0.6) / order.length } }, 0.4)
    }
  },
}

export default karachi
