'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { interpolateKeyframes } from '@/lib/sky'

type Props = { chapter: ChapterData }

/**
 * A pinned, scroll-scrubbed chapter. The year drifts up, the Urdu word drifts
 * across, and the lines mask-reveal one by one. Each chapter also drives the
 * sky through its keyframes and flips the UI colour when it becomes active.
 */
export default function Chapter({ chapter }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const reduced = prefersReducedMotion()
      const touch = isTouch()
      const year = el.querySelector<HTMLElement>('.chapter__year')
      const urdu = el.querySelector<HTMLElement>('.chapter__urdu')
      const title = el.querySelector<HTMLElement>('.chapter__title')
      const lines = Array.from(el.querySelectorAll<HTMLElement>('.chapter__lines p'))
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

      if (reduced) return

      const total = 1.2 + lines.length * 0.55 + 1.2
      if (year) tl.fromTo(year, { yPercent: 10, opacity: 0.6 }, { yPercent: -10, opacity: 1, duration: total }, 0)
      if (urdu) tl.fromTo(urdu, { xPercent: 4, opacity: 0 }, { xPercent: -4, opacity: 0.3, duration: total }, 0)
      if (title) tl.fromTo(title, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
      if (lines.length) {
        tl.from(lines, { yPercent: 110, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.55 }, 0.5)
      }
      tl.to({}, { duration: 1.2 })
    },
    { scope: ref, dependencies: [chapter.id] },
  )

  return (
    <section ref={ref} id={chapter.id} className="chapter" data-ui={chapter.ui} aria-labelledby={`${chapter.id}-title`}>
      <div className="chapter__urdu" aria-hidden="true" lang="ur">
        {chapter.urdu}
      </div>
      <div className="chapter__inner">
        <p className="chapter__meta">
          <span>{String(chapter.index).padStart(2, '0')}</span>
          <span aria-hidden="true"> · </span>
          <span lang="ur">{chapter.urdu}</span>
          <span aria-hidden="true"> · </span>
          <span>{chapter.urduMeaning}</span>
        </p>
        <h2 className="chapter__year" aria-hidden="true">
          {chapter.year}
        </h2>
        <h3 id={`${chapter.id}-title`} className="chapter__title">
          {chapter.title}
        </h3>
        {chapter.lines.length > 0 && (
          <div className="chapter__lines">
            {chapter.lines.map((line, i) => (
              <div className="mask" key={i}>
                <p>{line}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
