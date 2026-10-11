'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, SplitText, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { interpolateKeyframes } from '@/lib/sky'
import Avatar, { hasPose, poseRatio } from '@/components/avatar/Avatar'
import Rooftop from '@/components/scene/Rooftop'
import { SCENES } from '@/components/scenes/registry'

type Props = { chapter: ChapterData }

/**
 * A pinned, scroll-scrubbed chapter. The year builds up digit by digit, the
 * Urdu word is written from the right, the title rises word by word, the
 * lines reveal one by one, the figure arrives and drifts, and at the end the
 * whole stage clears before the next chapter scrolls in. Each chapter also
 * drives the sky through its keyframes and flips the UI colour when active.
 */
export default function Chapter({ chapter }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const reduced = prefersReducedMotion()
      const touch = isTouch()
      const inner = el.querySelector<HTMLElement>('.chapter__inner')
      const year = el.querySelector<HTMLElement>('.chapter__year')
      const urdu = el.querySelector<HTMLElement>('.chapter__urdu')
      const title = el.querySelector<HTMLElement>('.chapter__title')
      const lines = Array.from(el.querySelectorAll<HTMLElement>('.chapter__lines p'))
      const figures = Array.from(el.querySelectorAll<HTMLElement>('.chapter__figure > *'))
      const layers = Array.from(el.querySelectorAll<HTMLElement>('.rooftop__layer'))
      const extras = Array.from(el.querySelectorAll<HTMLElement>('.terminal'))
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

      // The year builds up digit by digit, then drifts upward for the rest of the chapter.
      if (year) {
        const split = SplitText.create(year, { type: 'chars' })
        tl.from(split.chars, { yPercent: 45, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07 }, 0)
        tl.fromTo(year, { yPercent: 6 }, { yPercent: -8, duration: total }, 0)
      }
      // The Urdu word is written from the right, the way it is read.
      if (urdu) {
        tl.fromTo(urdu, { clipPath: 'inset(-10% 0 -10% 100%)', opacity: 0.3 }, { clipPath: 'inset(-10% 0 -10% 0%)', duration: 1.1, ease: 'power2.out' }, 0.15)
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
          const split = SplitText.create(lines, { type: 'chars' })
          const each = (0.62 * total) / Math.max(1, split.chars.length)
          tl.from(split.chars, { opacity: 0, duration: 0.02, stagger: { each, ease: 'none' } }, 0.55)
        } else {
          const from: gsap.TweenVars = { yPercent: 110, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.55 }
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
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0)
        tl.fromTo(layer, { yPercent: 6 * depth, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0)
        tl.to(layer, { yPercent: -10 * depth, duration: total + 0.4 }, 0.8)
      })
      scene?.build({ tl, el, total, reduced })

      // Hold, then clear the stage so the next chapter arrives on an empty sky.
      tl.to({}, { duration: 0.7 })
      const stage = [inner, ...figures, ...extras].filter(Boolean) as HTMLElement[]
      tl.to(stage, { y: -36, opacity: 0, duration: 0.5, ease: 'power2.in', stagger: 0.04 })
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
    </section>
  )
}

function figuresFor(chapter: ChapterData) {
  const figs = (chapter.figures ?? []).filter((f) => hasPose(f.pose))
  if (figs.length === 0) return null
  const layout = figs.some((f) => f.size === 'wide') ? 'wide' : figs.length > 1 ? 'pair' : 'single'
  return (
    <div className={`chapter__figure chapter__figure--${layout}`}>
      {figs.map((f) => (
        // The wrapper takes GSAP's drift; the avatar inside keeps its own CSS breathing transform.
        // The wrapper carries the aspect ratio so its width is definite inside the flex row.
        <div key={f.pose} className={`chapter__fig chapter__fig--${f.size ?? 'normal'}`} style={{ aspectRatio: poseRatio(f.pose) }}>
          <Avatar
            pose={f.pose}
            alt={f.alt}
            blink={f.blink}
            breathe
            className={f.mask ? `avatar--mask-${f.mask}` : undefined}
            sizes={f.size === 'wide' ? '(max-width: 900px) 90vw, 56vw' : '(max-width: 900px) 70vw, 36vw'}
          />
        </div>
      ))}
    </div>
  )
}
