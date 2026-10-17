'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'
import { useProgress } from '@/lib/progress'
import { useUI } from '@/lib/ui'

/**
 * The rooftop's one interaction: move a cursor (or a finger) across the sky
 * and faint lines join the stars near it, like making constellations. Each
 * line fades a few seconds later. Nothing happens unless someone looks.
 *
 * The stars are the sky shader's own (components/sky/shaders.ts): one per
 * cell of a 160-row grid wherever a hash passes 0.985, at the cell's centre.
 * The same hash, run in 32-bit floats here, gives their screen positions, so
 * the lines join stars that are really there. Only stars above the skyline
 * are used; the roof and the city are not sky.
 */

const ROWS = 160
const REACH = 46 // how close the pointer must come to a star to pick it, px
const SPAN = 190 // the longest line drawn between two picked stars, px
const LIFE = 3.6 // seconds a line lives
const FADE = 1.8 // of which the last seconds fade

const f = Math.fround
const fract = (v: number) => f(v - Math.floor(v))
/** The shader's hash, step by step in float32. */
function hash(x: number, y: number) {
  let px = fract(f(x * f(123.34)))
  let py = fract(f(y * f(456.21)))
  const d = f(f(px * f(px + f(45.32))) + f(py * f(py + f(45.32))))
  px = f(px + d)
  py = f(py + d)
  return fract(f(px * py))
}

type Star = { x: number; y: number }
type Line = { a: Star; b: Star; born: number }

export default function Constellations() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const g = canvas?.getContext('2d')
    if (!canvas || !g || prefersReducedMotion()) return

    let W = 0
    let H = 0
    // The canvas's own box: the layer it sits in is narrower than the window by the scrollbar.
    let ox = 0
    let oy = 0
    let stars: Star[] = []
    let skyline = 0
    const lines: Line[] = []
    let last: Star | null = null
    let raf = 0

    const measure = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const own = canvas.getBoundingClientRect()
      W = own.width || window.innerWidth
      H = own.height || window.innerHeight
      ox = own.left
      oy = own.top
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      // Draw in window coordinates, like the stars and the pointer.
      g.setTransform(dpr, 0, 0, dpr, -ox * dpr, -oy * dpr)
      // The top of the city render, plus the band of empty sky the render starts with.
      const city = document.querySelector<HTMLElement>('.stage__roof .rooftop__layer--city')
      const r = city?.getBoundingClientRect()
      skyline = r && r.height > 0 ? r.top + r.height * 0.12 : H * 0.45
      // Cells are square in the sky canvas's own pixels; map them through its box on
      // screen, which can be narrower than the window (the scrollbar).
      const sky = document.querySelector<HTMLCanvasElement>('canvas.sky')
      const box = sky?.getBoundingClientRect()
      const cw = sky?.width || W
      const ch = sky?.height || H
      const bx = box && box.width ? box : { left: 0, top: 0, width: W, height: H }
      const cell = ch / ROWS
      const cols = Math.ceil(cw / cell)
      stars = []
      for (let cy = 0; cy < ROWS; cy++) {
        const y = bx.top + bx.height - ((cy + 0.5) * cell * bx.height) / ch
        // The shader fades stars in from 15% to 60% of the height; keep the clearly visible ones.
        if ((cy + 0.5) / ROWS < 0.3 || y > skyline) continue
        for (let cx = 0; cx < cols; cx++) if (hash(cx, cy) >= 0.985) stars.push({ x: bx.left + ((cx + 0.5) * cell * bx.width) / cw, y })
      }
    }

    const nearest = (x: number, y: number) => {
      let best: Star | null = null
      let bd = REACH
      for (const s of stars) {
        const d = Math.hypot(s.x - x, s.y - y)
        if (d < bd) {
          bd = d
          best = s
        }
      }
      return best
    }

    const draw = (now: number) => {
      g.clearRect(ox, oy, W, H)
      const t = now / 1000
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i]
        const age = t - l.born
        if (age > LIFE) {
          lines.splice(i, 1)
          continue
        }
        // In quickly, a long rest, then a slow fade.
        const a = Math.min(1, age / 0.25) * Math.min(1, (LIFE - age) / FADE)
        g.globalAlpha = 0.42 * a
        g.strokeStyle = '#dfe6ff'
        g.lineWidth = 1
        g.beginPath()
        g.moveTo(l.a.x, l.a.y)
        g.lineTo(l.b.x, l.b.y)
        g.stroke()
        // The joined stars glow a touch while their line lives.
        g.globalAlpha = 0.55 * a
        g.fillStyle = '#ffffff'
        for (const s of [l.a, l.b]) {
          g.beginPath()
          g.arc(s.x, s.y, 1.6, 0, Math.PI * 2)
          g.fill()
        }
      }
      g.globalAlpha = 1
      raf = lines.length ? requestAnimationFrame(draw) : 0
    }

    const visit = (x: number, y: number) => {
      // Only on the rooftop, once it is there, and only in the sky above the city.
      if (useProgress.getState().active !== 0 || !useUI.getState().introDone || y > skyline) return
      const s = nearest(x, y)
      if (!s || s === last) return
      if (last && Math.hypot(s.x - last.x, s.y - last.y) <= SPAN) {
        lines.push({ a: last, b: s, born: performance.now() / 1000 })
        if (!raf) raf = requestAnimationFrame(draw)
      }
      last = s
    }

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') visit(e.clientX, e.clientY)
    }
    // A finger drag is also a scroll; touchmove keeps reporting while the page moves.
    const onTouch = (e: TouchEvent) => {
      const p = e.touches[0]
      if (p) visit(p.clientX, p.clientY)
    }
    const onEnd = () => {
      last = null
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('mouseleave', onEnd)
    // The city's position settles after the entrance; measure again once it has.
    const settle = setTimeout(measure, 2500)
    return () => {
      clearTimeout(settle)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onEnd)
      document.removeEventListener('mouseleave', onEnd)
    }
  }, [])

  return <canvas ref={ref} className="constellations" aria-hidden="true" />
}
