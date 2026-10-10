'use client'

import { useEffect, useState } from 'react'
import { chapters } from '@/content/chapters'
import { useProgress } from '@/lib/progress'
import { getLenis, scrollToTarget } from '@/lib/lenis'

/** Corner wordmark and a full-screen chapter list. */
export default function Menu() {
  const [open, setOpen] = useState(false)
  const active = useProgress((s) => s.active)

  useEffect(() => {
    const lenis = getLenis()
    if (open) lenis?.stop()
    else lenis?.start()
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
      <div id="menu" className="menu" hidden={!open} role="dialog" aria-modal="true" aria-label="Chapters">
        <ol className="menu__list">
          {chapters.map((c) => (
            <li key={c.id} className={c.index === active ? 'is-active' : undefined}>
              <button type="button" onClick={() => go(c.id)} data-hover>
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
