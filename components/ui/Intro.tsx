'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { useUI } from '@/lib/ui'

const KEY = 'aasmaan-intro-seen'

/**
 * Two to three seconds: a horizon line draws itself, the sky lifts from black,
 * the word آسمان resolves and dissolves. Any key, click or scroll skips it.
 * Shown once per session.
 */
export default function Intro() {
  const ref = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(true)

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
    const id = requestAnimationFrame(() => setDone(false))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (done || !ref.current) return
    const el = ref.current
    const line = el.querySelector<HTMLElement>('.intro__line')
    const word = el.querySelector<HTMLElement>('.intro__word')
    const lenis = getLenis()
    lenis?.stop()
    document.documentElement.classList.add('intro-open')

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {}
      gsap.to(el, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          document.documentElement.classList.remove('intro-open')
          lenis?.start()
          setDone(true)
          useUI.getState().setIntroDone(true)
        },
      })
    }

    const tl = gsap.timeline({ onComplete: finish })
    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.inOut' }, 0.1)
    tl.fromTo(word, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.7)
    tl.to(word, { opacity: 0, y: -14, duration: 0.6, ease: 'power2.in' }, 1.9)
    tl.to({}, { duration: 0.2 })

    const skip = () => {
      tl.kill()
      finish()
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchstart', skip, { passive: true })
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
      tl.kill()
    }
  }, [done])

  if (done) return null
  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <div className="intro__line" />
      <div className="intro__word" lang="ur">
        آسمان
      </div>
    </div>
  )
}
