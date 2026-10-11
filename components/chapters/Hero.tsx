'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, SplitText, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { interpolateKeyframes } from '@/lib/sky'
import Rooftop from '@/components/scene/Rooftop'
import Avatar from '@/components/avatar/Avatar'

type Props = { chapter: ChapterData }

/** Fired by the intro overlay when it finishes, or at once when it is skipped. */
export const INTRO_DONE = 'aasmaan:intro-done'

/**
 * Wordless hero: Maria on the rooftop under a pre-dawn sky. After the intro,
 * the roof layers settle in and she arrives. On the first scroll her name
 * rises letter by letter behind her and the sky begins to brighten.
 */
export default function Hero({ chapter }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const reduced = prefersReducedMotion()
      const touch = isTouch()
      const name = el.querySelector<HTMLElement>('.hero__name')
      const figure = el.querySelector<HTMLElement>('.hero__figure')
      const cue = el.querySelector<HTMLElement>('.hero__cue')
      const layers = Array.from(el.querySelectorAll<HTMLElement>('.rooftop__layer'))
      const setSky = useProgress.getState().setSky

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * (touch ? chapter.pin * 0.7 : chapter.pin)}`,
          pin: !reduced,
          scrub: reduced ? false : touch ? 0.5 : 1,
          anticipatePin: 1,
          onUpdate: (self) => setSky(interpolateKeyframes(chapter.sky, self.progress)),
          onToggle: (self) => {
            if (self.isActive) activateChapter(chapter)
          },
        },
      })

      if (reduced) {
        if (name) gsap.set(name, { opacity: 1 })
        return
      }

      // Scroll-driven: the name builds letter by letter, everything drifts, then clears.
      if (cue) tl.to(cue, { opacity: 0, duration: 0.2 }, 0)
      if (name) {
        gsap.set(name, { opacity: 1 })
        const split = SplitText.create(name, { type: 'chars' })
        tl.from(split.chars, { yPercent: 60, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0.05)
      }
      if (figure) tl.to(figure, { yPercent: -6, duration: 1.4 }, 0)
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0)
        tl.fromTo(layer, { yPercent: 0 }, { yPercent: -14 * depth, duration: 1.4 }, 0)
      })
      tl.to({}, { duration: 0.3 })
      const exit = [name, figure].filter(Boolean) as HTMLElement[]
      if (exit.length) tl.to(exit, { opacity: 0, yPercent: '-=14', duration: 0.6, ease: 'power1.in' })
      if (layers.length) tl.to(layers, { opacity: 0, duration: 0.6, ease: 'power1.in' }, '<')

      // Time-driven entrance, once the intro has cleared: the roof settles, she arrives.
      const entrance = () => {
        const etl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        if (layers.length) etl.from(layers, { y: (i: number) => 36 + i * 18, autoAlpha: 0, duration: 1.4, stagger: 0.12 }, 0)
        if (figure) etl.from(figure, { y: 40, autoAlpha: 0, duration: 1.3 }, 0.35)
        const chrome = Array.from(document.querySelectorAll<HTMLElement>('.topbar, .rail'))
        if (chrome.length) etl.from(chrome, { autoAlpha: 0, duration: 0.8 }, 0.9)
      }
      if (layers.length || figure) gsap.set([...layers, figure].filter(Boolean), { autoAlpha: 0 })
      let fired = false
      const run = () => {
        if (fired) return
        fired = true
        entrance()
      }
      window.addEventListener(INTRO_DONE, run, { once: true })
      // If no intro event ever arrives (for example an intro that never mounted), start anyway.
      const fallback = setTimeout(run, 4500)
      return () => {
        clearTimeout(fallback)
        window.removeEventListener(INTRO_DONE, run)
      }
    },
    { scope: ref, dependencies: [chapter.id] },
  )

  return (
    <section ref={ref} id={chapter.id} className="hero" data-ui={chapter.ui} aria-label="Maria on a Karachi rooftop before dawn">
      <h1 className="hero__name" aria-hidden="true">
        Maria
      </h1>
      <Rooftop layers={['city', 'fore']} size="hero" className="hero__rooftop" />
      <div className="hero__figure">
        <Avatar
          pose="pose-hero"
          alt="Maria on a Karachi rooftop before dawn, hair loose in the breeze, looking up at the sky"
          blink
          breathe
          priority
          sizes="(max-width: 900px) 60vw, 26vh"
        />
      </div>
      <Rooftop layers={['parapet']} size="hero" className="hero__rooftop hero__rooftop--front" />
      <p className="hero__cue" aria-hidden="true">
        scroll
      </p>
    </section>
  )
}
