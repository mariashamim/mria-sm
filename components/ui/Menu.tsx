'use client'

import { useEffect, useRef, useState } from 'react'
import { chapters } from '@/content/chapters'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { useProgress } from '@/lib/progress'
import { getLenis, scrollToTarget } from '@/lib/lenis'

/** Corner wordmark and a full-screen chapter list that fades up, items staggering in. */
export default function Menu() {
  const [open, setOpen] = useState(false)
  const active = useProgress((s) => s.active)
  const overlay = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lenis = getLenis()
    const el = overlay.current
    if (!el) return
    const items = Array.from(el.querySelectorAll<HTMLElement>('.menu__list li'))
    const reduced = prefersReducedMotion()
    if (open) {
      lenis?.stop()
      gsap.killTweensOf([el, ...items])
      gsap.set(el, { display: 'grid' })
      if (reduced) {
        gsap.set([el, ...items], { clearProps: 'opacity,transform' })
      } else {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
        gsap.fromTo(items, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.045, delay: 0.08 })
      }
    } else {
      lenis?.start()
      gsap.killTweensOf([el, ...items])
      if (reduced || getComputedStyle(el).display === 'none') {
        gsap.set(el, { display: 'none' })
      } else {
        gsap.to(el, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => gsap.set(el, { display: 'none' }) })
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lenis?.start()
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // let Lenis restart before scrolling
    requestAnimationFrame(() => scrollToTarget(`#${id}`))
  }

  return (
    <>
      <header className="topbar">
        <button type="button" className="topbar__mark" onClick={() => go('hero')} data-hover aria-label="Back to the start">
          Maria
        </button>
        <button type="button" className="topbar__menu" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="menu" data-hover>
          {open ? 'Close' : 'Menu'}
        </button>
      </header>
      <div id="menu" ref={overlay} className="menu" role="dialog" aria-modal="true" aria-label="Chapters" aria-hidden={!open}>
        <ol className="menu__list">
          {chapters.map((c) => (
            <li key={c.id} className={c.index === active ? 'is-active' : undefined}>
              <button type="button" onClick={() => go(c.id)} data-hover tabIndex={open ? 0 : -1}>
                <span className="menu__year">{c.year}</span>
                <span className="menu__title">{c.title}</span>
                <span className="menu__urdu" lang="ur">
                  {c.urdu}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}
