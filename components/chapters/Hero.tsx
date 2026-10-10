'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { interpolateKeyframes } from '@/lib/sky'
import Skyline from './Skyline'
import Avatar from '@/components/avatar/Avatar'

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
      <Skyline className="hero__skyline" />
      <p className="hero__cue" aria-hidden="true">
        scroll
      </p>
    </section>
  )
}
