'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'
import { chapterById, useProgress } from '@/lib/progress'
import { DREAMS } from '@/content/interactive'
import dreamsJson from '@/data/dreams.json'

/**
 * The closing's dream planes. A card under "Thanks for stopping by." asks
 * what you wanted to be when you were little; the answer folds into a paper
 * plane that flies up into the sky over the city. The sky already holds
 * Maria's plane and any others listed in data/dreams.json.
 *
 * The planes are drawn on one canvas, each in a lane of open sky: lanes are
 * worked out from the page itself (the words, the card, the Urdu word, the
 * rail, the top bar and her figure in the render are all kept clear), and a
 * plane fades out before it reaches anything it would cover. The visitor's
 * plane lives only in their browser (localStorage) and is never sent.
 * Drawing runs only while the closing is the chapter on stage.
 */

type Dream = { answer: string; name?: string; mine?: boolean }
type Plane = Dream & { lane: number; a: number; b: number; w: number; phase: number; speed: number; born: number }
type Box = { l: number; t: number; r: number; b: number }

const KEY = 'aasmaan-dream'
const SHARED: Dream[] = (dreamsJson as Dream[]).filter((d) => d && typeof d.answer === 'string' && d.answer.trim())

// Where she stands in public/scene/closing-sunrise, and the top of the city,
// as fractions of the source image (2400 × 1340).
const SRC = { w: 2400, h: 1340 }
const FIGURE = { x0: 0.58, x1: 0.78, y0: 0.08, y1: 1 }
const HORIZON = 0.42
// The rooftops either side rise above the city line: water tanks left, a stair house right.
const ROOFS = [
  { x0: 0, x1: 0.23, y0: 0.29, y1: 1 },
  { x0: 0.86, x1: 1, y0: 0.36, y1: 1 },
]

const CLOSING = chapterById('closing')?.index ?? -1
const PLANE_W = 30
const LANE_H = 36

function readMine(): string | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null')
    return v && typeof v.answer === 'string' ? v.answer.slice(0, 32) : null
  } catch {
    return null
  }
}
function saveMine(answer: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ answer }))
  } catch {}
}

/** The card's way to the sky: launch a plane, get back where it starts (viewport px). */
const bridge: { launch?: (answer: string) => { x: number; y: number } | null } = {}

/* ───────────────────────── the sky ───────────────────────── */

export function DreamSky() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const section = canvas?.closest('section')
    const ctx = canvas?.getContext('2d')
    if (!canvas || !section || !ctx) return
    const reduced = prefersReducedMotion()
    const dreams: Dream[] = [...SHARED]
    const mine = readMine()
    if (mine) dreams.push({ answer: mine, mine: true })

    let W = 0
    let H = 0
    let font = 'cursive'
    let size = 22
    let planes: Plane[] = []
    let raf = 0
    let running = false
    let last = 0
    let clock = 0
    let relaid = 0

    const rectIn = (el: Element | Range | null, pad = 10): Box | null => {
      if (!el) return null
      // In the section's own (untransformed) pixels: the stage scales it as it comes and goes.
      const s = section.getBoundingClientRect()
      const k = s.width / (section.offsetWidth || s.width) || 1
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return null
      return { l: (r.left - s.left) / k - pad, t: (r.top - s.top) / k - pad, r: (r.right - s.left) / k + pad, b: (r.bottom - s.top) / k + pad }
    }

    // Her and the city line, from the render's object-fit: cover placement.
    const sceneGeometry = () => {
      const img = section.querySelector<HTMLImageElement>('.closing__scene picture:not(.closing__blink) img')
      const box = rectIn(img, 0)
      if (!img || !box) return { figure: null, roofs: [], horizon: H * 0.55 }
      const bw = box.r - box.l
      const bh = box.b - box.t
      const k = Math.max(bw / SRC.w, bh / SRC.h)
      const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100)
      const ox = box.l + (bw - SRC.w * k) * (Number.isFinite(px) ? px : 0.5)
      const oy = box.t + (bh - SRC.h * k) * (Number.isFinite(py) ? py : 0.5)
      const at = (f: { x0: number; x1: number; y0: number; y1: number }, pad: number): Box => ({
        l: ox + f.x0 * SRC.w * k - pad,
        t: oy + f.y0 * SRC.h * k - pad,
        r: ox + f.x1 * SRC.w * k + pad,
        b: oy + f.y1 * SRC.h * k,
      })
      return {
        roofs: ROOFS.map((f) => at(f, 8)),
        figure: { l: ox + FIGURE.x0 * SRC.w * k - 12, t: oy + FIGURE.y0 * SRC.h * k - 12, r: ox + FIGURE.x1 * SRC.w * k + 12, b: oy + FIGURE.y1 * SRC.h * k },
        horizon: oy + HORIZON * SRC.h * k,
      }
    }

    const labelOf = (d: Dream) => (d.name ? `${d.answer} — ${d.name}` : d.answer)

    // Lanes: horizontal strips of open sky, each with its widest clear stretch.
    const layout = () => {
      // The words by their ink, not their column: a range around each line's text.
      const words = [...section.querySelectorAll('.chapter__meta, .chapter__lines p')].map((el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        return rectIn(range, 12)
      })
      const keep = [
        ...words,
        rectIn(section.querySelector('.dream'), 12),
        rectIn(section.querySelector('.chapter__urdu'), 4),
        rectIn(document.querySelector('.rail'), 14),
        rectIn(document.querySelector('.topbar'), 0),
      ].filter(Boolean) as Box[]
      const geo = sceneGeometry()
      if (geo.figure) keep.push(geo.figure)
      keep.push(...geo.roofs)
      const top = 16
      const bottom = Math.min(H - 20, geo.horizon - 10)
      const lanes: { y: number; a: number; b: number }[] = []
      for (let y = top + LANE_H / 2; y <= bottom - LANE_H / 2; y += 6) {
        const hits = keep.filter((k) => k.t < y + LANE_H / 2 && k.b > y - LANE_H / 2).sort((p, q) => p.l - q.l)
        let x = 8
        let best = { a: 0, b: 0 }
        for (const k of [...hits, { l: W - 8, r: W - 8 } as Box]) {
          if (k.l - x > best.b - best.a) best = { a: x, b: k.l }
          x = Math.max(x, k.r)
        }
        lanes.push({ y, ...best })
      }
      size = W < 600 ? 18 : 22
      const gap = W < 600 ? 34 : 40
      ctx.font = `${size}px ${font}`
      const used: { y: number; n: number }[] = []
      const prev = planes
      planes = dreams.map((d, i) => {
        const w = PLANE_W + 10 + ctx.measureText(labelOf(d)).width + (d.mine ? 16 : 0)
        // A short stretch still holds a plane: it just bobs there instead of crossing.
        const fits = lanes.filter((l) => l.b - l.a >= w + 12)
        // A plane keeps its lane while the lane still has room for it, so nothing jumps.
        const old = prev.find((p) => p.answer === d.answer && p.name === d.name && p.mine === d.mine)
        const kept = old && old.lane >= 0 ? fits.find((l) => l.y === old.lane) : undefined
        // Otherwise: a lane clear of the others, or share the least used one.
        const free = kept ? [kept] : fits.filter((l) => used.every((u) => Math.abs(u.y - l.y) >= gap))
        const pool = free.length ? free : fits
        let pick = pool[0]
        if (free.length) {
          // Away from the other planes and from the edges of the open sky, in a long stretch.
          const ys = fits.map((l) => l.y)
          const mid = (Math.min(...ys) + Math.max(...ys)) / 2
          const score = (l: { y: number; a: number; b: number }) =>
            (used.length ? Math.min(...used.map((u) => Math.abs(u.y - l.y))) * 2 : 0) + (l.b - l.a) * 0.5 - Math.abs(l.y - mid)
          pick = free.reduce((m, l) => (score(l) > score(m) ? l : m))
        } else if (fits.length) {
          pick = fits.reduce((m, l) => ((used.find((u) => u.y === l.y)?.n ?? 0) < (used.find((u) => u.y === m.y)?.n ?? 0) ? l : m))
        }
        if (!pick) return { ...d, lane: -1, a: 0, b: 0, w, phase: 0, speed: 0, born: old?.born ?? -10 }
        const u = used.find((x) => x.y === pick.y)
        if (u) u.n++
        else used.push({ y: pick.y, n: 1 })
        const share = u ? u.n - 1 : 0
        return {
          ...d,
          lane: pick.y,
          a: pick.a,
          b: pick.b,
          w,
          phase: old ? old.phase : 0.3 + share * 0.5 + i * 0.37,
          // Slower in a short stretch, so a plane is not forever fading in and out.
          speed: pick.b - pick.a - w < 60 ? 0 : Math.min(9 + ((i * 5) % 7), Math.max(4, (pick.b - pick.a - w) / 12)),
          born: old?.born ?? -10,
        }
      })
    }

    const resize = () => {
      W = section.offsetWidth
      H = section.offsetHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      font = getComputedStyle(canvas).getPropertyValue('--font-hand-stack').trim() || 'cursive'
      layout()
      draw()
    }

    const where = (p: Plane) => {
      const span = Math.max(1, p.b - p.a - p.w)
      const x = p.speed === 0 ? p.a + span / 2 : p.a + (((p.phase * span + (reduced ? 0 : clock * p.speed)) % span) + span) % span
      const y = p.lane + (reduced ? 0 : Math.sin(clock * 0.7 + p.phase * 6) * 3)
      return { x, y, span }
    }

    const drawPlane = (x: number, y: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-0.06)
      ctx.fillStyle = '#fbf6ea'
      ctx.strokeStyle = 'rgba(59, 53, 80, 0.55)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(PLANE_W, 0)
      ctx.lineTo(0, -8)
      ctx.lineTo(7, 0)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#e7dcc6'
      ctx.beginPath()
      ctx.moveTo(PLANE_W, 0)
      ctx.lineTo(7, 0)
      ctx.lineTo(3, 7)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#d6c8ad'
      ctx.beginPath()
      ctx.moveTo(PLANE_W, 0)
      ctx.lineTo(7, 0)
      ctx.lineTo(10, 3)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.textBaseline = 'middle'
      for (const p of planes) {
        if (p.lane < 0) continue
        const { x, y, span } = where(p)
        const off = x - p.a
        const fade = Math.min(50, span * 0.2)
        const edge = p.speed === 0 ? 1 : Math.max(0, Math.min(1, off / fade, (span - off) / fade))
        const fresh = reduced ? 1 : Math.max(0, Math.min(1, (clock - p.born) / 0.8))
        const alpha = edge * fresh
        if (alpha <= 0.01) continue
        ctx.globalAlpha = alpha
        drawPlane(x, y)
        const tx = x + PLANE_W + 10
        ctx.font = `${size}px ${font}`
        const label = labelOf(p)
        if (p.mine) {
          const tw = ctx.measureText(label).width
          ctx.fillStyle = 'rgba(251, 246, 234, 0.92)'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.18)'
          ctx.shadowBlur = 8
          ctx.shadowOffsetY = 2
          ctx.fillRect(tx - 6, y - size * 0.65, tw + 12, size * 1.3)
          ctx.shadowColor = 'transparent'
          ctx.fillStyle = '#26375f'
          ctx.fillText(label, tx, y + 1)
        } else {
          ctx.fillStyle = 'rgba(59, 53, 80, 0.82)'
          ctx.fillText(label, tx, y + 1)
        }
      }
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      clock += dt
      relaid += dt
      // The words and the card move as they arrive; keep the lanes honest.
      if (relaid > 0.8) {
        relaid = 0
        layout()
      }
      draw()
      raf = requestAnimationFrame(frame)
    }
    const sync = () => {
      const on = !reduced && !document.hidden && useProgress.getState().active === CLOSING
      if (on && !running) {
        running = true
        last = 0
        layout()
        raf = requestAnimationFrame(frame)
      } else if (!on && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }

    bridge.launch = (answer) => {
      const i = dreams.findIndex((d) => d.mine)
      if (i >= 0) dreams.splice(i, 1)
      dreams.push({ answer, mine: true })
      planes = planes.filter((p) => !p.mine)
      layout()
      const p = planes.find((q) => q.mine)
      if (!p || p.lane < 0) {
        draw()
        return null
      }
      // Start it a little way into its lane, so it comes out of the fold in open sky.
      const span = Math.max(1, p.b - p.a - p.w)
      p.phase = (((0.15 * span - (reduced ? 0 : clock * p.speed)) % span) + span) % span / span
      p.born = reduced ? -10 : clock + 1.5
      draw()
      const s = section.getBoundingClientRect()
      const k = s.width / (section.offsetWidth || s.width) || 1
      const { x, y } = where(p)
      return { x: s.left + (x + PLANE_W / 2) * k, y: s.top + y * k }
    }

    if (process.env.NODE_ENV !== 'production') (window as unknown as { __dreams: () => unknown }).__dreams = () => ({ planes, running, clock, W, H })
    const ro = new ResizeObserver(resize)
    ro.observe(section)
    const unsub = useProgress.subscribe(sync)
    document.addEventListener('visibilitychange', sync)
    document.fonts?.ready.then(resize)
    resize()
    sync()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      unsub()
      document.removeEventListener('visibilitychange', sync)
      bridge.launch = undefined
    }
  }, [])

  return <canvas ref={ref} className="dream-sky" aria-hidden="true" />
}

/* ───────────────────────── the card ───────────────────────── */

export function DreamCard() {
  const card = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState('')
  const [done, setDone] = useState(false)
  const [flying, setFlying] = useState(false)

  // A plane folded on an earlier visit: the card says so (read after hydration).
  useEffect(() => {
    const id = setTimeout(() => readMine() && setDone(true), 0)
    return () => clearTimeout(id)
  }, [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const answer = value.trim().slice(0, 32)
    if (!answer || flying) return
    saveMine(answer)
    const to = bridge.launch?.(answer)
    const el = card.current
    if (!el || !to || prefersReducedMotion() || !el.animate) {
      setDone(true)
      setValue('')
      return
    }
    // Fold the card into a plane, then send it up to where its plane starts.
    const r = el.getBoundingClientRect()
    const dx = to.x - (r.left + r.width / 2)
    const dy = to.y - (r.top + r.height / 2)
    setFlying(true)
    const rect = 'polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%)'
    const plane = 'polygon(0% 10%, 30% 40%, 100% 50%, 30% 60%, 0% 90%)'
    const anim = el.animate(
      [
        { clipPath: rect, transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { clipPath: plane, transform: 'translate(0, -6px) scale(0.55, 0.4) rotate(-4deg)', opacity: 1, offset: 0.3 },
        { clipPath: plane, transform: `translate(${dx * 0.55}px, ${dy * 0.7 - 30}px) scale(0.22, 0.16) rotate(-14deg)`, opacity: 0.95, offset: 0.7 },
        { clipPath: plane, transform: `translate(${dx}px, ${dy}px) scale(0.08, 0.06) rotate(-4deg)`, opacity: 0 },
      ],
      { duration: 2000, easing: 'cubic-bezier(0.45, 0, 0.3, 1)' },
    )
    anim.onfinish = () => {
      setFlying(false)
      setDone(true)
      setValue('')
    }
  }

  return (
    <div className="dream">
      <div ref={card} className={`dream__card${done ? ' dream__card--done' : ''}`}>
        {done ? (
          <>
            <p className="dream__done">{DREAMS.done}</p>
            <button type="button" className="dream__again" onClick={() => setDone(false)} data-hover>
              {DREAMS.again}
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="dream-in" className="dream__ask">
              {DREAMS.ask}
            </label>
            <div className="dream__row">
              <input
                id="dream-in"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={32}
                placeholder={DREAMS.placeholder}
                autoComplete="off"
                spellCheck={false}
                disabled={flying}
              />
              <button type="submit" disabled={flying || !value.trim()} data-hover>
                {DREAMS.button}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
