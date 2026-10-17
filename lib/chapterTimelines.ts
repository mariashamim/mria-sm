import type { Chapter } from '@/content/chapters'
import { gsap, SplitText } from '@/lib/gsap'
import { SCENES } from '@/components/scenes/registry'

/**
 * The content timelines of the hero and of a chapter: what happens inside a
 * layer while it is the one on stage. The stage adds each of these to the
 * master timeline and wraps it in the layer's own forming and dissolving.
 * Everything here is scrubbed, so durations are scroll units, not seconds.
 */

export function buildHeroContent(layer: HTMLElement, reduced: boolean): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'none' } })
  const name = layer.querySelector<HTMLElement>('.hero__name')
  const figure = layer.querySelector<HTMLElement>('.hero__figure')
  if (reduced) {
    if (name) gsap.set(name, { opacity: 1 })
    return tl
  }
  // The name builds letter by letter behind her, she drifts, then both clear.
  if (name) {
    gsap.set(name, { opacity: 1 })
    const split = SplitText.create(name, { type: 'chars' })
    tl.from(split.chars, { yPercent: 60, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0.05)
  }
  if (figure) tl.to(figure, { yPercent: -6, duration: 1.4 }, 0)
  tl.to({}, { duration: 0.3 })
  const exit = [name, figure].filter(Boolean) as HTMLElement[]
  if (exit.length) tl.to(exit, { opacity: 0, yPercent: '-=14', duration: 0.6, ease: 'power1.in' })
  return tl
}

export function buildChapterContent(layer: HTMLElement, chapter: Chapter, reduced: boolean): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'none' } })
  const year = layer.querySelector<HTMLElement>('.chapter__year')
  const urdu = layer.querySelector<HTMLElement>('.chapter__urdu')
  const title = layer.querySelector<HTMLElement>('.chapter__title')
  const lines = Array.from(layer.querySelectorAll<HTMLElement>('.chapter__lines p'))
  const figures = Array.from(layer.querySelectorAll<HTMLElement>('.chapter__figure > *'))
  const total = 1.2 + lines.length * 0.55 + 1.2
  const scene = SCENES[chapter.id]

  if (reduced) {
    scene?.build({ tl, el: layer, total, reduced })
    return tl
  }

  // The year builds digit by digit, then drifts upward for the rest of the chapter.
  if (year) {
    const split = SplitText.create(year, { type: 'chars' })
    tl.from(split.chars, { yPercent: 45, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07 }, 0)
    tl.fromTo(year, { yPercent: 6 }, { yPercent: -8, duration: total }, 0)
  }
  // The Urdu word is written from the right, the way it is read.
  if (urdu) {
    tl.fromTo(urdu, { clipPath: 'inset(-10% 0 -10% 100%)' }, { clipPath: 'inset(-10% 0 -10% 0%)', duration: 1.1, ease: 'power2.out' }, 0.15)
    tl.fromTo(urdu, { xPercent: 3 }, { xPercent: -3, duration: total }, 0)
  }
  // The title rises a word at a time.
  if (title) {
    const split = SplitText.create(title, { type: 'words' })
    tl.from(split.words, { yPercent: 60, opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.06 }, 0.2)
  }
  if (lines.length) {
    if (chapter.id === 'letter') {
      // The letter writes itself, character by character, over most of the chapter.
      // Words wrap, chars animate: splitting into bare chars let lines break mid-word.
      const split = SplitText.create(lines, { type: 'words,chars' })
      const each = (0.62 * total) / Math.max(1, split.chars.length)
      tl.from(split.chars, { opacity: 0, duration: 0.02, stagger: { each, ease: 'none' } }, 0.55)
    } else {
      // A short rise with a fade, never a clip: a scrub can stop anywhere, and a line
      // half out of an overflow mask read as a rendering bug.
      const from: gsap.TweenVars = { y: 18, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.55 }
      // The window chapter's lines surface out of a blur, like a thought forming.
      if (chapter.id === 'sky') from.filter = 'blur(10px)'
      tl.from(lines, from, 0.5)
    }
  }
  if (figures.length) {
    // Arrive a little after the title, then drift upward more slowly than the text.
    tl.fromTo(figures, { yPercent: 10, opacity: 0 }, { yPercent: 4, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.15 }, 0.25)
    tl.to(figures, { yPercent: -5, duration: total - 1.1 }, 1.1)
  }
  // The postscript and the doors come once the letter has been written.
  const ps = Array.from(layer.querySelectorAll<HTMLElement>('.chapter__ps > *'))
  if (ps.length) tl.fromTo(ps, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.18 }, 0.8 * total)
  scene?.build({ tl, el: layer, total, reduced })
  // A hold at the end: the chapter rests before the stage lets it dissolve.
  tl.to({}, { duration: 0.6 })
  return tl
}
