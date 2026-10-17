import { chapters, type Chapter } from '@/content/chapters'
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
  const opening = layer.querySelector<HTMLElement>('.hero__opening')
  const figure = layer.querySelector<HTMLElement>('.hero__figure')
  if (reduced) return tl
  // Her words are already there (the entrance brings them, Hero.tsx); she looks up
  // and the words drift a little. They stay readable to the end: the layer's own
  // exit takes them (lib/transitions.ts), so the roof never sits there empty.
  if (opening) tl.to(opening, { yPercent: -10, duration: 1.4 }, 0)
  if (figure) tl.to(figure, { yPercent: -6, duration: 1.4 }, 0)
  return tl
}

/** The year shown before this chapter's, or 0000 for the first. */
function previousYear(chapter: Chapter): string {
  for (let i = chapter.index - 1; i >= 0; i--) if (/^\d{4}$/.test(chapters[i].year)) return chapters[i].year
  return '0000'
}

/**
 * Turns a year into split-flap cells: each digit a window onto a strip that
 * counts up from the old digit to the new one. The cell keeps its width from
 * an invisible copy of the final digit, so the year's layout never changes;
 * the strip moves by its own height per step (yPercent), on transform only.
 */
function splitFlap(year: HTMLElement, from: string, to: string) {
  year.textContent = ''
  return Array.from(to).map((d, i) => {
    const a = Number(from[i] ?? 0)
    const b = Number(d)
    const seq: number[] = [a]
    for (let n = a; n !== b; ) {
      n = (n + 1) % 10
      seq.push(n)
    }
    const cell = document.createElement('span')
    // A 1 is narrow: the wider digits rolling past it are drawn narrower to fit its window.
    cell.className = d === '1' && seq.length > 1 ? 'flap flap--narrow' : 'flap'
    const sizer = document.createElement('span')
    sizer.className = 'flap__sizer'
    sizer.textContent = d
    const strip = document.createElement('span')
    strip.className = 'flap__strip'
    for (const n of seq) {
      const b2 = document.createElement('b')
      b2.textContent = String(n)
      strip.appendChild(b2)
    }
    cell.append(sizer, strip)
    year.appendChild(cell)
    return { strip, steps: seq.length - 1 }
  })
}

/** Chapters where she is older than in the one before. */
const TIME_SKIPS = new Set(['karachi', 'london', 'home', 'school', 'karsaz', 'hello', 'loves'])

export function buildChapterContent(layer: HTMLElement, chapter: Chapter, reduced: boolean): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'none' } })
  const year = layer.querySelector<HTMLElement>('.chapter__year')
  const urdu = layer.querySelector<HTMLElement>('.chapter__urdu')
  const title = layer.querySelector<HTMLElement>('.chapter__title')
  const lines = Array.from(layer.querySelectorAll<HTMLElement>('.chapter__lines p'))
  const figures = Array.from(layer.querySelectorAll<HTMLElement>('.chapter__figure > *'))
  const total = 1.2 + lines.length * 0.55 + 1.2
  const scene = SCENES[chapter.id]
  const own = (part: 'year' | 'urdu' | 'title' | 'lines' | 'figures' | 'ps') => !!scene?.owns?.includes(part)

  if (reduced) {
    scene?.build({ tl, el: layer, total, reduced })
    return tl
  }

  // The year builds digit by digit, then drifts upward for the rest of the chapter.
  if (year && !own('year')) {
    // The year flips into place like a departures board, from the last year shown
    // (for the girl who wanted to fly). Right-hand digits settle first.
    const strips = splitFlap(year, previousYear(chapter), chapter.year)
    strips.forEach(({ strip, steps }, i) => {
      if (steps === 0) return
      tl.fromTo(strip, { yPercent: 0 }, { yPercent: -100 * steps, duration: 0.42 + 0.1 * (strips.length - 1 - i) + steps * 0.02, ease: `steps(${steps})` }, 0.05 + 0.06 * (strips.length - 1 - i))
    })
    tl.fromTo(year, { yPercent: 6 }, { yPercent: -8, duration: total }, 0)
  }
  // The Urdu word is written from the right, the way it is read.
  if (urdu && !own('urdu')) {
    tl.fromTo(urdu, { clipPath: 'inset(-10% 0 -10% 100%)' }, { clipPath: 'inset(-10% 0 -10% 0%)', duration: 1.1, ease: 'power2.out' }, 0.1)
    tl.fromTo(urdu, { xPercent: 3 }, { xPercent: -3, duration: total }, 0)
  }
  // The title rises a word at a time.
  if (title && !own('title')) {
    const split = SplitText.create(title, { type: 'words' })
    tl.from(split.words, { yPercent: 60, opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.06 }, 0.1)
  }
  if (lines.length && !own('lines')) {
    if (chapter.id === 'letter') {
      // The letter writes itself, character by character, over most of the chapter.
      // Words wrap, chars animate: splitting into bare chars let lines break mid-word.
      const split = SplitText.create(lines, { type: 'words,chars' })
      const each = (0.62 * total) / Math.max(1, split.chars.length)
      tl.from(split.chars, { opacity: 0, duration: 0.02, stagger: { each, ease: 'none' } }, 0.55)
    } else {
      // A short rise with a fade, never a clip: a scrub can stop anywhere, and a line
      // half out of an overflow mask read as a rendering bug.
      const from: gsap.TweenVars = { y: 18, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.55 }
      // The window chapter's lines surface out of a blur, like a thought forming.
      if (chapter.id === 'sky') from.filter = 'blur(10px)'
      tl.from(lines, from, 0.3)
    }
  }
  // She is older than she was a chapter ago: the figure arrives like a photo
  // taken years later, a quick flicker and a small polaroid shake, on its box
  // (the generic tweens below move the figures inside it).
  const box = layer.querySelector<HTMLElement>('.chapter__figure')
  if (box && TIME_SKIPS.has(chapter.id)) {
    tl.to(box, { keyframes: { opacity: [0, 1, 0.2, 1, 0.55, 1] }, duration: 0.45, ease: 'none' }, 0.25)
    tl.fromTo(box, { rotation: -5, scale: 1.06 }, { rotation: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' }, 0.25)
  }
  if (figures.length && !own('figures')) {
    // Arrive a little after the title, then drift upward more slowly than the text.
    tl.fromTo(figures, { yPercent: 10, opacity: 0 }, { yPercent: 4, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.15 }, 0.25)
    tl.to(figures, { yPercent: -5, duration: total - 1.1 }, 1.1)
  }
  // The postscript and the doors come once the letter has been written.
  const ps = Array.from(layer.querySelectorAll<HTMLElement>('.chapter__ps > *'))
  if (ps.length && !own('ps')) tl.fromTo(ps, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.18 }, 0.8 * total)
  scene?.build({ tl, el: layer, total, reduced })
  // A hold at the end: the chapter rests before the stage lets it dissolve.
  tl.to({}, { duration: 0.6 })
  return tl
}
