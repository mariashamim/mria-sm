'use client'

import { useEffect, useRef } from 'react'
import { isTouch, prefersReducedMotion } from '@/lib/gsap'
import { chapterById, useProgress } from '@/lib/progress'

/**
 * Outside the classroom: steam off her chai (after reference/chai-letter.html).
 * Soft wisps rise from the cup into a faint warm haze; a cursor or a finger
 * moving through it parts it. The first time the section is on screen the
 * steam gathers into the word چائے above her head, holds, then lifts away.
 *
 * It must never hide her face or the words: the wisps are at most a few
 * percent opaque, fainter still across her face, the word forms in the sky
 * above her, and the canvas sits under the text (globals.css).
 *
 * Time-based, not scrolled: it runs only while this section is the one on
 * stage. Phones and reduced motion get fewer particles; reduced motion gets a
 * still haze instead.
 */

const WORD = 'چائے'
// The cup's rim and her face, as fractions of the render's box (pose-loves).
const CUP = { x: 0.497, y: 0.385 }
const FACE = { x: 0.5, y: 0.2, rx: 0.17, ry: 0.11 }

type P = { x: number; y: number; vx: number; vy: number; age: number; life: number; s0: number; s1: number; a: number; seed: number }
type W = { tx: number; ty: number; cx: number; cy: number; d: number; s: number; j: number }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** A soft round puff, drawn once and stamped for every particle. */
function makeSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')
  if (!x) return c
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,246,232,1)')
  g.addColorStop(0.45, 'rgba(255,240,222,0.45)')
  g.addColorStop(1, 'rgba(255,236,215,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 64, 64)
  return c
}

export default function ChaiSteam() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const g = canvas?.getContext('2d')
    const layer = canvas?.closest<HTMLElement>('[data-layer]')
    const index = chapterById('loves')?.index ?? -1
    if (!canvas || !g || !layer) return
    const reduced = prefersReducedMotion()
    const touch = isTouch()
    const sprite = makeSprite()

    let W = 0
    let H = 0
    let cup = { x: 0, y: 0 }
    let fig = { x: 0, y: 0, w: 0, h: 0 }
    const mouse = { x: -9999, y: -9999 }
    const parts: P[] = []
    let word: W[] = []
    let wordStart = 0
    let running = false
    let raf = 0
    let last = 0
    let spawnAcc = 0
    let formed = false

    const measure = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(touch ? 1.5 : 2, window.devicePixelRatio || 1)
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      const box = layer.querySelector<HTMLElement>('.chapter__fig')?.getBoundingClientRect()
      if (box && box.width) {
        fig = { x: box.left - r.left, y: box.top - r.top, w: box.width, h: box.height }
        cup = { x: fig.x + fig.w * CUP.x, y: fig.y + fig.h * CUP.y }
      }
    }

    // Fainter over her face: the haze must never hide it.
    const faceFade = (x: number, y: number) => {
      const dx = (x - (fig.x + fig.w * FACE.x)) / (fig.w * FACE.rx)
      const dy = (y - (fig.y + fig.h * FACE.y)) / (fig.h * FACE.ry)
      return dx * dx + dy * dy < 1 ? 0.3 : 1
    }

    const spawn = () => {
      parts.push({ x: cup.x + rand(-7, 7), y: cup.y + rand(-2, 4), vx: rand(-6, 6), vy: rand(-34, -52), age: 0, life: rand(4.2, 6.4), s0: rand(4, 7), s1: rand(50, 92), a: rand(0.03, 0.05), seed: rand(0, 6.28) })
    }

    // The word, sampled from Gulzar into points, placed in the sky above her head.
    const formWord = () => {
      // Narrow screens have no clear sky above her: the word would cross the words or
      // the board, so phones keep the wisps and skip it.
      if (reduced || !fig.w || W < 700) return
      const room = fig.y - 60
      const fs = Math.min(230, W * 0.24, room * 0.85)
      if (fs < 48) return
      const family = getComputedStyle(document.documentElement).getPropertyValue('--font-urdu').trim() || 'serif'
      const off = document.createElement('canvas')
      const ow = Math.ceil(fs * 3)
      const oh = Math.ceil(fs * 2)
      off.width = ow
      off.height = oh
      const x = off.getContext('2d')
      if (!x) return
      x.fillStyle = '#fff'
      x.font = `400 ${fs}px ${family}`
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.direction = 'rtl'
      x.fillText(WORD, ow / 2, oh / 2)
      const d = x.getImageData(0, 0, ow, oh).data
      const step = Math.max(3, Math.round(fs / 46))
      const cx = clamp(cup.x, fs * 0.9, W - fs * 0.9)
      const cy = Math.max(fs * 0.55 + 70, fig.y - fs * 0.5)
      const pts: W[] = []
      for (let yy = 0; yy < oh; yy += step) {
        for (let xx = 0; xx < ow; xx += step) {
          if (d[(yy * ow + xx) * 4 + 3] > 140) {
            const tx = cx + xx - ow / 2
            const ty = cy + yy - oh / 2
            pts.push({ tx, ty, cx: cup.x + rand(-90, 90), cy: (cup.y + ty) / 2 + rand(-40, 40), d: rand(0, 0.6) + (Math.abs(tx - cup.x) / W) * 0.6, s: rand(5, 8), j: rand(0, 6.28) })
          }
        }
      }
      word = pts
      wordStart = performance.now()
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      g.clearRect(0, 0, W, H)
      spawnAcc += dt * (touch ? 14 : 22)
      while (spawnAcc > 1) {
        spawn()
        spawnAcc--
      }
      const t = now / 1000
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.age += dt
        if (p.age > p.life) {
          parts.splice(i, 1)
          continue
        }
        const k = p.age / p.life
        p.vx += Math.sin(t * 0.7 + p.y * 0.011 + p.seed) * 14 * dt
        p.vx *= 0.995
        // The pointer parts the steam.
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < 140 && dist > 0) {
          const f = (1 - dist / 140) * 260 * dt
          p.vx += (dx / dist) * f
          p.vy += (dy / dist) * f * 0.4
        }
        p.vy = Math.min(p.vy, -8)
        p.x += p.vx * dt
        p.y += p.vy * dt
        const s = p.s0 + (p.s1 - p.s0) * easeOut(k)
        g.globalAlpha = p.a * Math.sin(Math.PI * k) * clamp(k * 5) * faceFade(p.x, p.y)
        g.drawImage(sprite, p.x - s, p.y - s, s * 2, s * 2)
      }
      if (word.length) {
        const tt = (now - wordStart) / 1000
        let alive = false
        for (const w of word) {
          const lt = clamp((tt - w.d) / 1.7)
          const e = easeInOut(lt)
          // From the cup, along a curve, into the letter's shape.
          let x = (1 - e) * (1 - e) * cup.x + 2 * (1 - e) * e * w.cx + e * e * w.tx
          let y = (1 - e) * (1 - e) * cup.y + 2 * (1 - e) * e * w.cy + e * e * w.ty
          let a = 0.05 + 0.25 * e
          let s = w.s
          const rt = tt - 3.9
          if (rt > 0) {
            // Then it lifts away and thins out.
            y -= rt * rt * 26 + rt * 18
            x += Math.sin(rt * 2 + w.j) * rt * 12
            a *= clamp(1 - rt / 1.6)
            s += rt * 9
          } else if (lt >= 1) {
            x += Math.sin(tt * 1.6 + w.j) * 1.2
            y += Math.cos(tt * 1.3 + w.j) * 1.2
          }
          if (a > 0.002) {
            alive = true
            g.globalAlpha = a
            g.drawImage(sprite, x - s, y - s, s * 2, s * 2)
          }
        }
        if (!alive && tt > 4) word = []
      }
      g.globalAlpha = 1
      if (running) raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      measure()
      last = performance.now()
      raf = requestAnimationFrame(frame)
      if (!formed) {
        formed = true
        const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
        fonts.then(() => setTimeout(() => running && formWord(), 450))
      }
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
      g.clearRect(0, 0, W, H)
      parts.length = 0
    }

    // A still haze for reduced motion: a few puffs above the cup, drawn once.
    if (reduced) {
      const still = () => {
        measure()
        g.clearRect(0, 0, W, H)
        for (let i = 0; i < 10; i++) {
          const s = 40 + i * 12
          g.globalAlpha = 0.05
          g.drawImage(sprite, cup.x - s + Math.sin(i * 1.7) * 18, cup.y - i * 34 - s, s * 2, s * 2)
        }
        g.globalAlpha = 1
      }
      const t = setTimeout(still, 400)
      window.addEventListener('resize', still)
      return () => {
        clearTimeout(t)
        window.removeEventListener('resize', still)
      }
    }

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onTouch = (e: TouchEvent) => {
      const p = e.touches[0]
      if (!p) return
      const r = canvas.getBoundingClientRect()
      mouse.x = p.clientX - r.left
      mouse.y = p.clientY - r.top
    }
    const away = () => {
      mouse.x = mouse.y = -9999
    }
    const sync = (active: number) => (active === index ? start() : stop())
    const unsubscribe = useProgress.subscribe((s) => sync(s.active))
    sync(useProgress.getState().active)
    window.addEventListener('resize', measure)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', away, { passive: true })
    document.addEventListener('mouseleave', away)
    return () => {
      unsubscribe()
      stop()
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', away)
      document.removeEventListener('mouseleave', away)
    }
  }, [])

  return <canvas ref={ref} className="chai-steam" aria-hidden="true" />
}
