'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { useUI } from '@/lib/ui'
import { createFlyby, type FlybyHandle } from '@/lib/flyby'

const KEY = 'aasmaan-intro-seen'

type Phase = 'veil' | 'flyby' | 'done'

/**
 * The flyby. Black lifts on the roof while the hero's own entrance plays
 * underneath (the far roof settles, the parapet follows, Maria arrives). A jet
 * comes in from the left just above the skyline, passes high over her head,
 * and leaves to the right, its contrail hanging in her sky, then thinning.
 * About seven seconds; any key, click or scroll ends it. Shown once per session.
 *
 * The black veil is in the server markup, so the very first frame is black
 * rather than the page before its scripts. A repeat visit only lifts it.
 */
export default function Intro() {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('veil')

  // Decide on mount: a repeat visit just lifts the black; a first visit flies.
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(KEY) === '1'
    } catch {}
    // A link straight to a chapter skips the flyby: the reader was sent somewhere specific.
    const deep = window.location.hash.length > 1
    if (seen || deep || prefersReducedMotion()) {
      useUI.getState().setIntroDone(true)
      const veil = ref.current?.querySelector<HTMLElement>('.intro__veil')
      if (!veil) {
        setPhase('done')
        return
      }
      const lift = gsap.to(veil, { opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.05, onComplete: () => setPhase('done') })
      return () => {
        lift.kill()
      }
    }
    // Defer one frame so the state change isn't synchronous inside the effect.
    const id = requestAnimationFrame(() => setPhase('flyby'))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (phase !== 'flyby' || !ref.current) return
    const el = ref.current
    const veil = el.querySelector<HTMLElement>('.intro__veil')
    const canvas = el.querySelector<HTMLCanvasElement>('.intro__jet')
    if (!veil || !canvas) return
    const lenis = getLenis()
    lenis?.stop()
    document.documentElement.classList.add('intro-open')

    let tl: gsap.core.Timeline | null = null
    let jet: FlybyHandle | null = null
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
      setPhase('done')
    }

    const build = () => {
      if (cancelled) return
      const flight = { t: 0 }
      tl = gsap.timeline({ onComplete: finish })
      if (process.env.NODE_ENV !== 'production') {
        // Dev only: window.__intro to scrub it; sessionStorage 'aasmaan-intro-hold' = '1' pauses it at the start.
        ;(window as unknown as { __intro?: gsap.core.Timeline }).__intro = tl
        try {
          if (sessionStorage.getItem('aasmaan-intro-hold') === '1') tl.pause()
        } catch {}
      }
      // The roof and Maria arrive under the lifting black.
      tl.call(letHeroIn, [], 0.1)
      tl.to(veil, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0)
      // The jet crosses, left to right, at constant speed; perspective does the rest.
      tl.set(canvas, { opacity: 1 }, 1.4)
      tl.to(flight, { t: 1, duration: 3.4, ease: 'none', onUpdate: () => jet?.setT(flight.t) }, 1.5)
      // The contrail hangs, then thins away with the canvas.
      tl.to(canvas, { opacity: 0, duration: 2.2, ease: 'power1.in' }, 5.0)
    }

    // Load the jet first (briefly), so it is there when the black lifts. The
    // 3D library waits for the page's own load event so it never competes
    // with hydration; the black holds 1.4 s before the jet is due anyway.
    gsap.set(canvas, { opacity: 0 })
    const whenLoaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
    const load = whenLoaded
      .then(() => createFlyby(canvas))
      .then((h) => {
      if (cancelled) {
        h.dispose()
        return
      }
      jet = h
    })
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000))
    Promise.race([load.catch(() => undefined), timeout]).then(build)

    const skip = () => {
      if (!tl) {
        finish()
        return
      }
      letHeroIn()
      tl.progress(1)
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
      jet?.dispose()
      jet = null
    }
  }, [phase])

  if (phase === 'done') return null
  return (
    <div ref={ref} className="intro intro--flyby" aria-hidden="true">
      {phase === 'flyby' && <canvas className="intro__jet" />}
      <div className="intro__veil" />
    </div>
  )
}
