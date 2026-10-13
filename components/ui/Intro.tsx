'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { useUI } from '@/lib/ui'

const KEY = 'aasmaan-intro-seen'
const NAME = 'MARIA'
/** The letter whose stem opens into the sky: the I, which has no counter to leave a dark island behind. */
const WINDOW_LETTER = 3

/**
 * The name as a window. Black, then the five letters open onto the sky one
 * by one while the hero arrives behind them; then the I widens into a
 * doorway and the black is gone. About three seconds; any key, click or
 * scroll jumps to the opening. Shown once per session.
 */
export default function Intro() {
  const ref = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(true)
  const [size, setSize] = useState({ w: 1000, h: 1000 })

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(KEY) === '1'
    } catch {}
    if (seen || prefersReducedMotion()) {
      // No intro this time: let the hero start its entrance right away.
      useUI.getState().setIntroDone(true)
      return
    }
    // Defer one frame so the state change isn't synchronous inside the effect.
    const id = requestAnimationFrame(() => {
      setSize({ w: window.innerWidth, h: window.innerHeight })
      setDone(false)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (done || !ref.current) return
    const el = ref.current
    const text = el.querySelector<SVGTextElement>('.intro__name')
    const veil = el.querySelector<SVGRectElement>('.intro__veil')
    const chars = Array.from(el.querySelectorAll<SVGTSpanElement>('.intro__ch'))
    if (!text || !veil || chars.length !== NAME.length) return
    const lenis = getLenis()
    lenis?.stop()
    document.documentElement.classList.add('intro-open')
    gsap.set(chars, { opacity: 0 })

    let tl: gsap.core.Timeline | null = null
    let finished = false
    let cancelled = false
    const letHeroIn = () => useUI.getState().setIntroDone(true)
    const finish = () => {
      if (finished) return
      finished = true
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {}
      document.documentElement.classList.remove('intro-open')
      lenis?.start()
      letHeroIn()
      setDone(true)
    }

    const build = () => {
      if (cancelled) return
      // Size the name to the viewport: 86% of the width, never more than 60% of the height.
      text.style.fontSize = '100px'
      const b0 = text.getBBox()
      const fs = Math.min((100 * size.w * 0.86) / Math.max(1, b0.width), (100 * size.h * 0.6) / Math.max(1, b0.height))
      text.style.fontSize = `${fs}px`
      const ib = chars[WINDOW_LETTER].getBBox()
      const origin = `${ib.x + ib.width / 2} ${ib.y + ib.height / 2}`

      tl = gsap.timeline({ onComplete: finish })
      if (process.env.NODE_ENV !== 'production') {
        // Dev only: window.__intro to scrub it; sessionStorage 'aasmaan-intro-hold' = '1' pauses it at the start.
        ;(window as unknown as { __intro?: gsap.core.Timeline }).__intro = tl
        try {
          if (sessionStorage.getItem('aasmaan-intro-hold') === '1') tl.pause()
        } catch {}
      }
      // The letters open onto the sky one by one; the hero starts arriving behind them.
      tl.to(chars, { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.09 }, 0.25)
      tl.call(letHeroIn, [], 0.35)
      // The I widens into a doorway, and the black is gone.
      tl.to(text, { scale: 28, svgOrigin: origin, duration: 1.2, ease: 'power3.in' }, 1.6)
      tl.to(veil, { opacity: 0, duration: 0.25, ease: 'power1.out' }, 2.55)
    }
    // Wait for the display font (briefly) so the mask is cut with the real letterforms.
    const fontsReady: Promise<unknown> = 'fonts' in document ? document.fonts.ready : Promise.resolve()
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1500))
    Promise.race([fontsReady, timeout]).then(build)

    const skip = () => {
      if (!tl) {
        finish()
        return
      }
      letHeroIn()
      if (tl.time() < 1.6) tl.seek(1.6)
      tl.timeScale(1.6)
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchstart', skip, { passive: true })
    return () => {
      cancelled = true
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
      tl?.kill()
    }
  }, [done, size])

  if (done) return null
  const { w, h } = size
  return (
    <div ref={ref} className="intro intro--window" aria-hidden="true">
      <svg className="intro__svg" viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <mask id="intro-window" maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            <rect x="0" y="0" width={w} height={h} fill="#fff" />
            <text className="intro__name" x={w / 2} y={h / 2} textAnchor="middle" dominantBaseline="central" fill="#000">
              {NAME.split('').map((ch, i) => (
                <tspan key={i} className="intro__ch">
                  {ch}
                </tspan>
              ))}
            </text>
          </mask>
        </defs>
        <rect className="intro__veil" x="0" y="0" width={w} height={h} fill="#000" mask="url(#intro-window)" />
      </svg>
    </div>
  )
}
