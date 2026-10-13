'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, SplitText, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter } from '@/lib/progress'
import { registerChapterTrigger } from '@/lib/world'
import Avatar, { hasPose, poseRatio } from '@/components/avatar/Avatar'
import { SCENES } from '@/components/scenes/registry'

type Props = { chapter: ChapterData }

/**
 * A pinned, scroll-scrubbed chapter. The year and the Urdu word already build
 * while the section is scrolling into view, so a new chapter is forming as
 * the previous one clears. Once pinned, the title rises word by word, the
 * lines reveal one by one, the figure arrives and drifts, and at the end the
 * whole stage (scene overlays included) clears before the section rides out.
 * The sky and the camera height are not driven here: the world layer samples
 * them by absolute scroll position (lib/world.ts) so they keep moving between
 * chapters. A chapter only registers its pinned range and flips the UI colour.
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
      const extras = Array.from(el.querySelectorAll<HTMLElement>('.terminal, .scene, .scene-dim, .scene-screen'))

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * (touch ? chapter.pin * 0.7 : chapter.pin)}`,
          pin: !reduced,
          scrub: reduced ? false : touch ? 0.5 : 1,
          anticipatePin: 1,
          onToggle: (self) => {
            if (self.isActive) activateChapter(chapter)
          },
        },
      })
      const unregister = tl.scrollTrigger ? registerChapterTrigger(chapter.index, tl.scrollTrigger) : undefined

      const total = 1.2 + lines.length * 0.55 + 1.2
      const scene = SCENES[chapter.id]

      if (reduced) {
        scene?.build({ tl, el, total, reduced })
        return unregister
      }

      // While the section scrolls up into view: the year builds digit by digit
      // and the Urdu word is written from the right, the way it is read.
      const approach = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: touch ? 0.5 : 1 },
      })
      if (year) {
        const split = SplitText.create(year, { type: 'chars' })
        approach.from(split.chars, { yPercent: 45, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07 }, 0.3)
        // Then it drifts upward for the rest of the chapter.
        tl.fromTo(year, { yPercent: 6 }, { yPercent: -8, duration: total }, 0)
      }
      if (urdu) {
        approach.fromTo(urdu, { clipPath: 'inset(-10% 0 -10% 100%)' }, { clipPath: 'inset(-10% 0 -10% 0%)', duration: 0.6, ease: 'power2.out' }, 0.4)
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
      scene?.build({ tl, el, total, reduced })

      // Hold, then clear the stage so the section rides out empty over the moving sky.
      tl.to({}, { duration: 0.7 })
      const stage = [inner, ...figures, ...extras].filter(Boolean) as HTMLElement[]
      tl.to(stage, { y: -36, opacity: 0, duration: 0.5, ease: 'power2.in', stagger: 0.04 })

      return unregister
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
