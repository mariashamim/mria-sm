'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { interpolateKeyframes } from '@/lib/sky'
import Avatar, { hasPose, poseRatio } from '@/components/avatar/Avatar'
import Rooftop from '@/components/scene/Rooftop'
import { SCENES } from '@/components/scenes/registry'

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
      const figures = Array.from(el.querySelectorAll<HTMLElement>('.chapter__figure > *'))
      const walker = el.querySelector<HTMLElement>('.chapter__walker')
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

      const total = 1.2 + lines.length * 0.55 + 1.2
      const scene = SCENES[chapter.id]

      if (reduced) {
        scene?.build({ tl, el, total, reduced })
        return
      }
      if (year) tl.fromTo(year, { yPercent: 10, opacity: 0.6 }, { yPercent: -10, opacity: 1, duration: total }, 0)
      if (urdu) tl.fromTo(urdu, { xPercent: 4, opacity: 0 }, { xPercent: -4, opacity: 0.3, duration: total }, 0)
      if (title) tl.fromTo(title, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
      if (lines.length) {
        tl.from(lines, { yPercent: 110, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.55 }, 0.5)
      }
      if (figures.length) {
        // Arrive a little after the title, then drift upward more slowly than the text.
        tl.fromTo(figures, { yPercent: 10, opacity: 0 }, { yPercent: 4, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.15 }, 0.25)
        tl.to(figures, { yPercent: -5, duration: total - 1.1 }, 1.1)
      }
      if (walker) {
        // Ginger crosses the whole chapter, left to right, with a little bob.
        tl.fromTo(walker, { x: () => -walker.offsetWidth - 40 }, { x: () => window.innerWidth + 40, duration: total + 1.2 }, 0)
      }
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0)
        tl.fromTo(layer, { yPercent: 6 * depth, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0)
        tl.to(layer, { yPercent: -10 * depth, duration: total + 0.4 }, 0.8)
      })
      scene?.build({ tl, el, total, reduced })
      tl.to({}, { duration: 1.2 })
    },
    { scope: ref, dependencies: [chapter.id] },
  )

  const Scene = SCENES[chapter.id]?.Scene

  return (
    <section ref={ref} id={chapter.id} className="chapter" data-ui={chapter.ui} aria-labelledby={`${chapter.id}-title`}>
      {Scene && <Scene />}
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
      {chapter.rooftop && <Rooftop layers={['city']} size="chapter" />}
      {figuresFor(chapter)}
      {chapter.walker && hasPose(chapter.walker) && (
        <div className="chapter__walker" style={{ aspectRatio: poseRatio(chapter.walker) }} aria-hidden="true">
          <Avatar pose={chapter.walker} alt="" sizes="12vw" />
        </div>
      )}
    </section>
  )
}

function figuresFor(chapter: ChapterData) {
  const figs = (chapter.figures ?? []).filter((f) => hasPose(f.pose))
  if (figs.length === 0) return null
  const people = figs.filter((f) => f.role !== 'cat')
  const layout = people.some((f) => f.size === 'wide') ? 'wide' : people.length > 1 ? 'pair' : 'single'
  return (
    <div className={`chapter__figure chapter__figure--${layout}`}>
      {figs.map((f) => {
        const isCat = f.role === 'cat'
        const cls = isCat ? `chapter__fig chapter__fig--cat chapter__fig--cat-${f.size ?? 'normal'}` : `chapter__fig chapter__fig--${f.size ?? 'normal'}`
        return (
          // The wrapper takes GSAP's drift; the avatar inside keeps its own CSS breathing transform.
          // The wrapper carries the aspect ratio so its width is definite inside the flex row.
          <div key={f.pose} className={cls} style={{ aspectRatio: poseRatio(f.pose) }} data-cursor={isCat ? 'paw' : undefined}>
            <Avatar
              pose={f.pose}
              alt={f.alt}
              blink={f.blink}
              breathe
              className={f.mask ? `avatar--mask-${f.mask}` : undefined}
              sizes={isCat ? '(max-width: 900px) 30vw, 12vw' : f.size === 'wide' ? '(max-width: 900px) 90vw, 56vw' : '(max-width: 900px) 70vw, 36vw'}
            />
          </div>
        )
      })}
    </div>
  )
}
