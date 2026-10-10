'use client'

import { useEffect, useRef } from 'react'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/gsap'

/** Dot plus a lagging ring. Grows over anything marked data-hover. Hidden on touch. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isTouch() || prefersReducedMotion() || !dot.current || !ring.current) return
    document.documentElement.classList.add('has-cursor')

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.35, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.35, ease: 'power3' })
    const rr = gsap.quickTo(ring.current, 'rotation', { duration: 0.4, ease: 'power2' })

    let lastX = 0
    let lastY = 0
    let angle = 0
    const html = document.documentElement
    // Elements opt in with data-cursor; the chosen glyph is stored on <html> as
    // data-glyph (a different name, so the lookup never matches <html> itself).
    const setCustom = (target: EventTarget | null) => {
      const custom = (target as HTMLElement | null)?.closest?.<HTMLElement>('[data-cursor]')?.dataset.cursor
      if (custom) html.dataset.glyph = custom
      else delete html.dataset.glyph
    }
    const move = (e: PointerEvent) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      setCustom(e.target)
      // In the flying chapters the ring is a paper plane that points where you move.
      const mx = e.clientX - lastX
      const my = e.clientY - lastY
      if (Math.hypot(mx, my) > 3) {
        const next = (Math.atan2(my, mx) * 180) / Math.PI
        // Take the short way round so the plane never spins the long way.
        angle += ((((next - angle) % 360) + 540) % 360) - 180
        rr(angle)
        lastX = e.clientX
        lastY = e.clientY
      }
    }
    const over = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      const t = target?.closest('[data-hover], a, button')
      html.classList.toggle('cursor-hover', !!t)
      setCustom(target)
    }
    const leave = () => document.documentElement.classList.add('cursor-out')
    const enter = () => document.documentElement.classList.remove('cursor-out')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mouseenter', enter)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseenter', enter)
      document.documentElement.classList.remove('has-cursor', 'cursor-hover', 'cursor-out')
      delete document.documentElement.dataset.glyph
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor cursor--dot" aria-hidden="true" />
      <div ref={ring} className="cursor cursor--ring" aria-hidden="true" />
    </>
  )
}
