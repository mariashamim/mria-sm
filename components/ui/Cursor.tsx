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

    const move = (e: PointerEvent) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest('[data-hover], a, button')
      document.documentElement.classList.toggle('cursor-hover', !!t)
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
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor cursor--dot" aria-hidden="true" />
      <div ref={ring} className="cursor cursor--ring" aria-hidden="true" />
    </>
  )
}
