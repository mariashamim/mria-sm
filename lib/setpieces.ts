import { gsap } from '@/lib/gsap'
import { offsetIn } from '@/components/scenes/thread'

/**
 * The set pieces that cross a chapter boundary, drawn on the stage's effects
 * layer (components/stage/Fx.tsx) and scrubbed by the master timeline like
 * everything else, so they play backwards on the way up and can never stick
 * halfway. Each is a single progress value 0..1 over its stretch of scroll,
 * drawn by one function; outside that stretch it draws nothing.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const eOut = (t: number) => 1 - Math.pow(1 - t, 3)
const eIn = (t: number) => t * t * t
const eIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const NS = 'http://www.w3.org/2000/svg'
// Deterministic scatter, so the bleed is the same every time.
const rnd = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return v - Math.floor(v)
}
const lite = () => window.innerWidth < 900 || window.matchMedia('(pointer: coarse)').matches

/* ─────────────── The ink bleed: the opening into 2007 ───────────────
   گھر draws itself stroke by stroke in the middle of the sky, fills, and
   the ink spreads from it with soft, wet edges until it floods the frame in
   2007's dawn. 2007 forms underneath; the ink clears and the word settles
   into its place as the chapter's Urdu word. */
export function buildInk(master: gsap.core.Timeline, stage: HTMLElement, at: number, dur: number) {
  const svg = stage.querySelector<SVGSVGElement>('.fx__ink')
  const blobs = svg?.querySelector<SVGGElement>('.fx__blobs')
  const word = svg?.querySelector<SVGTextElement>('.fx__word')
  const disp = svg?.querySelector<SVGFEDisplacementMapElement>('.fx__disp')
  const grad = svg?.querySelector<SVGLinearGradientElement>('.fx__grad')
  const layer = stage.querySelector<HTMLElement>('[data-layer="karachi"]')
  const target = layer?.querySelector<HTMLElement>('.chapter__urdu')
  if (!svg || !blobs || !word || !layer || !target) return

  const light = lite()
  blobs.setAttribute('filter', light ? 'url(#ink-soft)' : 'url(#ink-goo)')
  type Blob = { e: SVGCircleElement; x: number; y: number; r: number; d: number; a?: number; dist?: number }
  let seeds: Blob[] = []
  let fingers: Blob[] = []
  let main: SVGCircleElement | null = null
  let geo = { W: 0, H: 0, cx: 0, cy: 0, R: 0, fs: 0, dash: 0, dx: 0, dy: 0, s: 1 }
  let key = ''

  const circle = (x: number, y: number) => {
    const c = document.createElementNS(NS, 'circle')
    c.setAttribute('cx', String(x))
    c.setAttribute('cy', String(y))
    c.setAttribute('r', '0')
    blobs.appendChild(c)
    return c
  }
  const measure = () => {
    // Again once the Urdu font has arrived: its glyphs are much taller than the fallback's.
    const k = `${innerWidth}x${innerHeight}:${document.fonts?.status}`
    if (k === key) return
    key = k
    const W = stage.clientWidth
    const H = stage.clientHeight
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    grad?.setAttribute('y2', String(H))
    const fs = Math.min(W * 0.44, H * 0.34, 320)
    word.setAttribute('font-size', String(fs))
    // Centre on the glyphs' ink, not the font's line box (Gulzar's is far taller than its letters).
    const ctx = document.createElement('canvas').getContext('2d')
    const family = getComputedStyle(word).fontFamily
    let ink = { left: fs * 0.6, right: fs * 0.6, up: fs * 0.5, down: fs * 0.3 }
    if (ctx) {
      ctx.font = `400 ${fs}px ${family}`
      ctx.direction = 'rtl'
      ctx.textAlign = 'center'
      const m = ctx.measureText(word.textContent ?? '')
      ink = { left: m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, up: m.actualBoundingBoxAscent, down: m.actualBoundingBoxDescent }
    }
    const baseline = H / 2 + (ink.up - ink.down) / 2
    word.setAttribute('x', String(W / 2))
    word.setAttribute('y', String(baseline))
    const bb = { x: W / 2 - ink.left, y: baseline - ink.up, width: ink.left + ink.right, height: ink.up + ink.down }
    const cx = bb.x + bb.width / 2
    const cy = bb.y + bb.height / 2
    const R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 160
    blobs.replaceChildren()
    seeds = Array.from({ length: 7 }, (_, i) => ({ e: circle(bb.x + (bb.width * i) / 6, cy), x: bb.x + (bb.width * i) / 6, y: cy + (rnd(i, 1) - 0.5) * 0.36 * bb.height, r: bb.height * (0.32 + rnd(i, 2) * 0.23), d: rnd(i, 3) * 0.12 }))
    fingers = Array.from({ length: light ? 9 : 14 }, (_, i) => ({ e: circle(cx, cy), x: cx, y: cy, a: (i / (light ? 9 : 14)) * Math.PI * 2 + (rnd(i, 4) - 0.5) * 0.4, dist: R * (0.5 + rnd(i, 5) * 0.45), r: 10 + rnd(i, 6) * 20, d: 0.02 + rnd(i, 7) * 0.12 }))
    main = circle(cx, cy)
    // Where the word settles: the chapter's own Urdu word, measured without transforms.
    const t = offsetIn(target, layer)
    const s = target.offsetWidth / Math.max(1, bb.width)
    geo = { W, H, cx, cy, R, fs, dash: fs * 8, dx: t.x + target.offsetWidth / 2 - cx, dy: t.y + target.offsetHeight / 2 - cy, s }
  }

  const draw = (u: number) => {
    if (u <= 0 || u >= 1) {
      svg.style.visibility = 'hidden'
      return
    }
    measure()
    svg.style.visibility = 'visible'
    // 1. The word draws itself, stroke by stroke, then fills.
    const stroke = eIO(clamp(u / 0.3))
    const fill = eOut(clamp((u - 0.28) / 0.1))
    word.style.strokeDasharray = String(geo.dash)
    word.style.strokeDashoffset = String(geo.dash * (1 - stroke))
    // 2. The ink spreads from it until it floods the frame.
    const t = clamp((u - 0.36) / 0.44)
    seeds.forEach((b) => b.e.setAttribute('r', (b.r * eOut(clamp((t - b.d) / 0.3))).toFixed(1)))
    fingers.forEach((f) => {
      const p = clamp((t - f.d) / 0.7)
      const d = (f.dist ?? 0) * eOut(p)
      f.e.setAttribute('cx', (geo.cx + Math.cos(f.a ?? 0) * d).toFixed(1))
      f.e.setAttribute('cy', (geo.cy + Math.sin(f.a ?? 0) * d).toFixed(1))
      f.e.setAttribute('r', (f.r * (1 + p * 1.6)).toFixed(1))
    })
    main?.setAttribute('r', (geo.R * eIO(clamp((t - 0.1) / 0.9))).toFixed(1))
    if (disp) disp.setAttribute('scale', (26 + 60 * Math.sin(t * Math.PI)).toFixed(1))
    // 3. 2007 is there underneath: the ink clears and the word settles into its place.
    const clear = eIO(clamp((u - 0.82) / 0.16))
    blobs.style.opacity = String(1 - clear)
    const settle = eIO(clamp((u - 0.78) / 0.2))
    word.style.transform = `translate(${(geo.dx * settle).toFixed(1)}px, ${(geo.dy * settle).toFixed(1)}px) scale(${(1 + (geo.s - 1) * settle).toFixed(4)})`
    word.style.fillOpacity = String(fill * (1 - 0.7 * settle))
    word.style.strokeOpacity = String(1 - settle)
    word.style.opacity = String(1 - clamp((u - 0.94) / 0.06))
  }

  const state = { u: 0 }
  draw(0)
  master.fromTo(state, { u: 0 }, { u: 1, duration: dur, ease: 'none', immediateRender: false, onUpdate: () => draw(state.u) }, at)
}

/* ─────────────── The fly-through: 2017 into 2023 ───────────────
   The paper plane she threw comes at the camera; we go through soft
   clouds and come out into 2023's sky, where the plane is ahead again. */
export function buildFly(master: gsap.core.Timeline, stage: HTMLElement, at: number, dur: number) {
  const cv = stage.querySelector<HTMLCanvasElement>('.fx__fly')
  const g = cv?.getContext('2d')
  if (!cv || !g) return
  const light = lite()
  const P = Array.from({ length: light ? 26 : 44 }, (_, i) => ({ x: rnd(i, 1) * 2 - 1, y: rnd(i, 2) * 1.5 - 0.75, z: 0.1 + rnd(i, 3) * 1.5, s: 0.6 + rnd(i, 4) * 0.8, k: i % 3, flip: rnd(i, 8) > 0.5 }))
  // The three rendered clouds (public/scene/cloud-*), loaded once; soft puffs stand in until they arrive.
  const clouds = [1, 2, 3].map((n) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = `/scene/cloud-${n}.webp`
    return img
  })
  let W = 0
  let H = 0
  let key = ''
  const measure = () => {
    const k = `${innerWidth}x${innerHeight}`
    if (k === key) return
    key = k
    const dpr = Math.min(light ? 1 : 1.5, window.devicePixelRatio || 1)
    W = stage.clientWidth
    H = stage.clientHeight
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  // The same paper plane as Karsaz's and 2023's, folded in three tones.
  const plane = (x: number, y: number, s: number, rot: number, a: number) => {
    g.save()
    g.translate(x, y)
    g.rotate(rot)
    g.scale(s, s)
    g.globalAlpha = a
    g.fillStyle = '#ffffff'
    g.beginPath()
    g.moveTo(40, 0)
    g.lineTo(-30, -26)
    g.lineTo(-16, 0)
    g.closePath()
    g.fill()
    g.fillStyle = '#d9dee7'
    g.beginPath()
    g.moveTo(40, 0)
    g.lineTo(-16, 0)
    g.lineTo(-30, 22)
    g.closePath()
    g.fill()
    g.fillStyle = '#b9c0cc'
    g.beginPath()
    g.moveTo(40, 0)
    g.lineTo(-16, 0)
    g.lineTo(-22, 9)
    g.closePath()
    g.fill()
    g.restore()
  }
  // Mist from a pale morning white into 2023's dusk.
  const mist = (t: number) => {
    const a = [232, 237, 244]
    const b = [107, 74, 122]
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`
  }

  const draw = (u: number) => {
    if (u <= 0 || u >= 1) {
      cv.style.visibility = 'hidden'
      return
    }
    measure()
    cv.style.visibility = 'visible'
    g.clearRect(0, 0, W, H)
    const up = eIO(clamp((u - 0.12) / 0.3))
    const down = eIO(clamp((u - 0.7) / 0.27))
    g.globalAlpha = up * (1 - down)
    g.fillStyle = mist(clamp((u - 0.55) / 0.3))
    g.fillRect(0, 0, W, H)
    // Clouds rush past, nearest biggest.
    const env = clamp((u - 0.1) / 0.18) * (1 - clamp((u - 0.74) / 0.18))
    if (env > 0) {
      const tt = u * 2.2
      for (const p of P) {
        const z = ((((p.z - tt) % 1.6) + 1.6) % 1.6) + 0.06
        const X = W / 2 + (p.x * W * 0.38) / z
        const Y = H / 2 + (p.y * H * 0.38) / z
        const r = Math.min(700, (70 * p.s) / z)
        const a = env * clamp((1.66 - z) / 0.7) * 0.5
        if (a <= 0) continue
        const img = clouds[p.k]
        if (img.complete && img.naturalWidth) {
          const cw = r * 2.6
          const ch = (cw * img.naturalHeight) / img.naturalWidth
          g.globalAlpha = Math.min(1, a * 1.7)
          g.save()
          g.translate(X, Y)
          if (p.flip) g.scale(-1, 1)
          g.drawImage(img, -cw / 2, -ch / 2, cw, ch)
          g.restore()
          continue
        }
        const gr = g.createRadialGradient(X, Y, 0, X, Y, r)
        gr.addColorStop(0, `rgba(255,255,255,${a})`)
        gr.addColorStop(1, 'rgba(255,255,255,0)')
        g.globalAlpha = 1
        g.fillStyle = gr
        g.fillRect(X - r, Y - r, r * 2, r * 2)
      }
    }
    // The plane, from where Karsaz's flew to, straight at us.
    const p = clamp(u / 0.5)
    if (p < 1) {
      const x0 = W * 0.22
      const y0 = H * 0.2
      plane(x0 + (W / 2 - x0) * eOut(p), y0 + (H / 2 - y0) * eOut(p), 0.7 + 34 * eIn(p), 0.55 - 0.45 * p, 1 - clamp((p - 0.82) / 0.18))
    }
    g.globalAlpha = 1
  }
  const state = { u: 0 }
  draw(0)
  master.fromTo(state, { u: 0 }, { u: 1, duration: dur, ease: 'none', immediateRender: false, onUpdate: () => draw(state.u) }, at)
}
