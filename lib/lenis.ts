import type Lenis from 'lenis'

let instance: Lenis | null = null

export function setLenis(l: Lenis | null) {
  instance = l
}

export function getLenis(): Lenis | null {
  return instance
}

/** Scroll to an element or selector, through Lenis when it is running. */
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const l = instance
  if (l) {
    l.scrollTo(target, { offset, duration: 1.6 })
    return
  }
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: 'smooth' })
}
