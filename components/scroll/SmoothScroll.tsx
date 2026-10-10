'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { setLenis } from '@/lib/lenis'

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export default function SmoothScroll() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)

    if (prefersReducedMotion()) {
      return () => window.removeEventListener('load', refresh)
    }

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return null
}
