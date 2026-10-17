'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'
import { useProgress } from '@/lib/progress'
import { useUI } from '@/lib/ui'

/**
 * The opening's one bit of ambient life: now and then, a shooting star
 * crosses the upper sky above the rooftop. Rare (every 9 to 16 seconds),
 * quick, and only while the opening is the chapter on stage. A single
 * element, moved with the Web Animations API on transform and opacity.
 */
export default function ShootingStar() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let timer = 0
    const fly = () => {
      const ok = useProgress.getState().active === 0 && useUI.getState().introDone && !document.hidden
      if (ok) {
        const W = window.innerWidth
        const H = window.innerHeight
        const x = W * (0.15 + Math.random() * 0.55)
        const y = H * (0.06 + Math.random() * 0.16)
        const len = Math.min(W, H) * (0.22 + Math.random() * 0.12)
        const angle = 18 + Math.random() * 14
        const rad = (angle * Math.PI) / 180
        el.animate(
          [
            { opacity: 0, transform: `translate(${x}px, ${y}px) rotate(${angle}deg) scaleX(0.2)` },
            { opacity: 0.9, offset: 0.25 },
            { opacity: 0, transform: `translate(${x + Math.cos(rad) * len}px, ${y + Math.sin(rad) * len}px) rotate(${angle}deg) scaleX(1)` },
          ],
          { duration: 900, easing: 'cubic-bezier(0.3, 0, 0.5, 1)' },
        )
      }
      timer = window.setTimeout(fly, 9000 + Math.random() * 7000)
    }
    timer = window.setTimeout(fly, 5000)
    return () => window.clearTimeout(timer)
  }, [])

  return <span ref={ref} className="shooting-star" aria-hidden="true" />
}
