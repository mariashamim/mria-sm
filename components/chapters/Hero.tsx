'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { interpolateKeyframes } from '@/lib/sky'
import Skyline from './Skyline'

type Props = { chapter: ChapterData }

/**
 * Wordless hero: the avatar on the rooftop under a pre-dawn sky. On the first
 * scroll the name rises behind her and the sky begins to brighten.
 * The figure is a placeholder silhouette until the renders arrive.
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

      if (cue) tl.to(cue, { opacity: 0, duration: 0.2 }, 0)
      if (name) tl.fromTo(name, { yPercent: 45, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'power2.out' }, 0.05)
      if (figure) tl.to(figure, { yPercent: -10, scale: 1.04, duration: 1.4 }, 0)
      tl.to({}, { duration: 0.3 })
      if (name || figure) tl.to([name, figure].filter(Boolean), { opacity: 0, yPercent: -18, duration: 0.6, ease: 'power1.in' })
    },
    { scope: ref, dependencies: [chapter.id] },
  )

  return (
    <section ref={ref} id={chapter.id} className="hero" data-ui={chapter.ui} aria-label="Maria, on a Karachi rooftop before dawn">
      <h1 className="hero__name" aria-hidden="true">
        Maria
      </h1>
      <div className="hero__figure" role="img" aria-label="Maria looking up at the sky, with Ginger the cat beside her">
        <svg viewBox="0 0 200 420" className="hero__silhouette" aria-hidden="true">
          <circle cx="100" cy="52" r="34" />
          <path d="M66 96 C 60 130, 58 170, 60 230 L 60 300 C 62 318, 70 320, 84 322 L 84 404 L 70 414 L 118 414 L 112 404 L 112 322 C 128 320, 138 318, 140 300 L 140 230 C 142 170, 140 130, 134 96 C 122 88, 78 88, 66 96 Z" />
          <path d="M150 350 c 12 -10, 28 -6, 30 10 c 2 14, -8 28, -22 28 c -14 0, -22 -14, -18 -26 l 2 -4 l -4 -6 l 8 2 z" opacity="0.9" />
        </svg>
      </div>
      <Skyline className="hero__skyline" />
      <p className="hero__cue" aria-hidden="true">
        scroll
      </p>
    </section>
  )
}
