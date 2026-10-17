'use client'

import { chapterById } from '@/lib/progress'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * The letter (after reference/chai-letter.html): Maria at the desk under the
 * lamp, by a window onto the same rooftop and skyline as the opening. Tied to
 * the scroll in both directions, in order:
 *   an envelope slides onto the desk, addressed by hand, with a Karachi
 *   skyline stamp and a Karachi 2026 postmark;
 *   it turns over, the wax seal cracks and the flap opens;
 *   the page slides out and comes forward;
 *   the letter writes itself line by line (scrolling up un-writes it);
 *   meanwhile the window goes from night to sunrise, the lamp fades and the
 *   skyline turns to day;
 *   the three doors arrive last, as postage stamps that are still links.
 * Everything moves through transform and opacity, except the writing, which
 * wipes each line in with a clip.
 */

const address = (chapterById('letter')?.lines[0] ?? '').replace(/,\s*$/, '')

// Deterministic stars for the window, the same on the server and the client.
const rand = (i: number, k: number) => {
  const v = Math.sin(i * 41.31 + k * 17.77) * 15731.743
  return v - Math.floor(v)
}
const STARS = Array.from({ length: 40 }, (_, i) => `${(rand(i, 1) * 100).toFixed(1)}% ${(rand(i, 2) * 55).toFixed(1)}%`)

function LetterScene() {
  return (
    <div className="room" aria-hidden="true">
      <div className="room__wall room__wall--night" />
      <div className="room__wall room__wall--dawn" />
      <div className="room__lamp" />
      <div className="room__window">
        <div className="room__sky room__sky--night" />
        <div className="room__sky room__sky--dawn" />
        <div className="room__stars">
          {STARS.map((p, i) => (
            <i key={i} style={{ left: p.split(' ')[0], top: p.split(' ')[1] }} />
          ))}
        </div>
        <div className="room__sun" />
        <div className="room__city room__city--night" />
        <div className="room__city room__city--day" />
        <i className="room__mul room__mul--v" />
        <i className="room__mul room__mul--h" />
      </div>
      <div className="desk">
        <div className="envelope">
          <div className="envelope__body">
            <div className="envelope__face envelope__front">
              <svg className="envelope__postmark" viewBox="0 0 160 80" fill="none" stroke="#3b3550" strokeWidth="1.6">
                <circle cx="118" cy="40" r="30" />
                <circle cx="118" cy="40" r="25" />
                <path id="letter-postmark" d="M 118 40 m -20 0 a 20 20 0 1 1 40 0 a 20 20 0 1 1 -40 0" stroke="none" />
                <text fontFamily="var(--font-mono-stack)" fontSize="6.4" fill="#3b3550" stroke="none" letterSpacing="1">
                  <textPath href="#letter-postmark">KARACHI · 2026 · KARACHI · 2026 ·</textPath>
                </text>
                <path d="M2 28 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 M2 40 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 M2 52 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" />
              </svg>
              <div className="envelope__stamp">
                <div className="envelope__stamp-art" />
                <span>KARACHI</span>
              </div>
              <div className="envelope__addr">{address}</div>
            </div>
            <div className="envelope__face envelope__back">
              <div className="envelope__inside" />
              <div className="envelope__page" />
              <div className="envelope__pocket" />
              <div className="envelope__flap">
                <div className="envelope__seal">
                  <i className="envelope__seal-l" />
                  <i className="envelope__seal-r" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const eOut = (t: number) => 1 - Math.pow(1 - t, 3)
const eIn = (t: number) => t * t * t
const eIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const letter: SceneDef = {
  Scene: LetterScene,
  owns: ['year', 'figures', 'lines', 'ps'],
  build: ({ tl, el, total, reduced }) => {
    const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)
    const card = q('.chapter__inner')
    const fig = q('.chapter__figure')
    const env = q('.envelope__body')
    const wrap = q('.envelope')
    const flap = q('.envelope__flap')
    const sealL = q('.envelope__seal-l')
    const sealR = q('.envelope__seal-r')
    const page = q('.envelope__page')
    const nightSky = q('.room__sky--night')
    const dawnSky = q('.room__sky--dawn')
    const stars = q('.room__stars')
    const sun = q('.room__sun')
    const cityN = q('.room__city--night')
    const cityD = q('.room__city--day')
    const dawnWall = q('.room__wall--dawn')
    const lamp = q('.room__lamp')
    if (!card || !fig || !env || !wrap || !flap || !sealL || !sealR || !page || !nightSky || !dawnSky || !stars || !sun || !cityN || !cityD || !dawnWall || !lamp) return
    // The writing: every paragraph, the sign-off and the P.S., wiped in by its length.
    const lines = Array.from(el.querySelectorAll<HTMLElement>('.chapter__lines p, .chapter__ps > p'))
    const stamps = Array.from(el.querySelectorAll<HTMLElement>('.doors a'))
    const weights = lines.map((l) => Math.max(8, (l.textContent ?? '').length))
    const wsum = weights.reduce((a, b) => a + b, 0)
    const phone = () => window.innerWidth <= 900

    // The lamp's light sits on the lamp in the render (about a quarter in, a quarter down).
    let measured = ''
    const place = () => {
      const key = `${innerWidth}x${innerHeight}`
      if (key === measured) return
      measured = key
      const r = el.getBoundingClientRect()
      const f = (fig.querySelector('.chapter__fig') ?? fig).getBoundingClientRect()
      const R = Math.min(innerWidth * 0.42, 420)
      lamp.style.width = lamp.style.height = `${R * 2}px`
      lamp.style.left = `${f.left - r.left + f.width * 0.25 - R}px`
      lamp.style.top = `${f.top - r.top + f.height * 0.26 - R}px`
    }

    const render = (p: number) => {
      place()
      const seg = (a: number, b: number) => clamp((p - a) / (b - a))
      const slide = eOut(seg(0, 0.05))
      const flip = eIO(seg(0.06, 0.12))
      const brk = eOut(seg(0.13, 0.17))
      const fo = eIO(seg(0.17, 0.23))
      const out = eOut(seg(0.23, 0.3))
      const lift = seg(0.3, 0.35)
      const cin = eOut(seg(0.33, 0.38))
      const wp = seg(0.38, 0.88)
      const d = seg(0.25, 0.98)

      env.style.transform = `translateY(${((1 - slide) * 70).toFixed(2)}vh) rotate(${(-9 + 6 * slide).toFixed(2)}deg) rotateY(${(180 * flip).toFixed(2)}deg)`
      wrap.style.opacity = String(slide * (1 - eIn(lift)))
      wrap.style.transform = `translateY(${(eIn(lift) * 28).toFixed(2)}vh) scale(${(1 - 0.08 * lift).toFixed(4)})`
      sealL.style.transform = `translate(${-brk * 16}px, ${brk * 12}px) rotate(${-brk * 38}deg)`
      sealR.style.transform = `translate(${brk * 16}px, ${brk * 14}px) rotate(${brk * 34}deg)`
      sealL.style.opacity = sealR.style.opacity = String(1 - clamp((brk - 0.55) / 0.45))
      flap.style.transform = `rotateX(${(-fo * 180).toFixed(2)}deg)`
      flap.classList.toggle('is-open', fo > 0.5)
      page.style.transform = `translateY(${(-out * 58).toFixed(2)}%)`

      // The page comes forward; on phones it lifts at the very end to show her again.
      const end = phone() ? eIO(seg(0.92, 1)) : 0
      card.style.opacity = String(cin)
      card.style.transform = `translateY(${((1 - cin) * 16 - end * 36).toFixed(2)}vh) scale(${(0.82 + 0.18 * cin).toFixed(4)}) rotate(-0.6deg)`
      fig.style.opacity = phone() ? String(1 - 0.75 * cin + 0.75 * end) : '1'

      let acc = 0
      lines.forEach((l, i) => {
        const a = acc / wsum
        const b = (acc + weights[i]) / wsum
        acc += weights[i]
        const lp = clamp((wp - a) / (b - a))
        l.style.clipPath = `inset(-6px ${(100 - lp * 100).toFixed(2)}% -8px -6px)`
      })
      stamps.forEach((s, i) => {
        const k = eOut(seg(0.91 + i * 0.02, 0.95 + i * 0.02))
        s.style.opacity = String(k)
        s.style.transform = `rotate(var(--tilt)) translateY(${((1 - k) * 14).toFixed(1)}px) scale(${(0.9 + 0.1 * k).toFixed(3)})`
        s.style.pointerEvents = k > 0.5 ? 'auto' : 'none'
      })

      // Night to sunrise through the window; the lamp gives way to the morning.
      const day = eIO(d)
      dawnSky.style.opacity = String(day)
      nightSky.style.opacity = String(1 - day)
      stars.style.opacity = String(1 - clamp(d * 1.6))
      sun.style.opacity = String(clamp((d - 0.4) / 0.3))
      sun.style.transform = `translateY(${((1 - eOut(clamp((d - 0.45) / 0.55))) * 150).toFixed(1)}%)`
      cityD.style.opacity = String(clamp((d - 0.5) / 0.4))
      cityN.style.opacity = String(1 - clamp((d - 0.6) / 0.35))
      dawnWall.style.opacity = String(day)
      lamp.style.opacity = String(1 - clamp((d - 0.6) / 0.4))
    }

    if (reduced) {
      // The open letter, fully written, at sunrise.
      const settle = () => {
        render(1)
        wrap.style.opacity = '0'
        card.style.transform = 'none'
        fig.style.opacity = '1'
      }
      settle()
      window.addEventListener('resize', settle)
      return
    }
    const state = { p: 0 }
    render(0)
    tl.fromTo(state, { p: 0 }, { p: 1, duration: total, ease: 'none', immediateRender: false, onUpdate: () => render(state.p) }, 0)
  },
}

export default letter
