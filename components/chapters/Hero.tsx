'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, prefersReducedMotion, SplitText } from '@/lib/gsap'
import { useUI } from '@/lib/ui'
import Avatar from '@/components/avatar/Avatar'
import Constellations from '@/components/scenes/Constellations'
import ShootingStar from '@/components/scenes/ShootingStar'

type Props = { chapter: ChapterData }

/**
 * The opening: Maria on the rooftop under a pre-dawn sky, and her first words. The roof itself is
 * the stage's persistent set (components/stage/Stage.tsx). Once the intro
 * lets her in (useUI.introDone) the far roof settles, the parapet follows, she
 * arrives, then the chrome and the scroll cue. The scroll-driven part (her
 * name building letter by letter, the drift, the clear) lives in the stage's
 * master timeline, built by lib/chapterTimelines.ts.
 *
 * Two sets of elements on purpose: ScrollTrigger renders the master timeline
 * through once on refresh and records every tween's start values at that
 * moment, so nothing this time-based entrance animates may also be a scroll
 * target. The entrance moves the rooftop roots and the inner figure wrapper;
 * the master timeline moves the rooftop layers and the outer figure box.
 */
export default function Hero({ chapter }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current
      if (!el || !contextSafe) return
      const figureIn = el.querySelector<HTMLElement>('.hero__figure-in')
      const openingIn = el.querySelector<HTMLElement>('.hero__opening-in')
      const cue = el.querySelector<HTMLElement>('.hero__cue')
      const roofs = Array.from(document.querySelectorAll<HTMLElement>('.stage__roof'))
      const roofBack = roofs.find((r) => !r.classList.contains('stage__roof--front')) ?? null
      const roofFront = roofs.find((r) => r.classList.contains('stage__roof--front')) ?? null
      if (prefersReducedMotion()) return

      const chrome = Array.from(document.querySelectorAll<HTMLElement>('.topbar, .rail'))
      const arriving = [roofBack, roofFront, figureIn, openingIn, ...chrome].filter(Boolean) as HTMLElement[]
      gsap.set(arriving, { autoAlpha: 0 })
      let fired = false
      const run = contextSafe(() => {
        if (fired) return
        fired = true
        // Entering a memory: the camera settles on the roof (a slow push from slightly
        // too close), she arrives, then her question rises a word at a time, then
        // who is asking, and last the invitation to scroll.
        const etl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        if (roofBack) etl.fromTo(roofBack, { y: 36, scale: 1.05, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 2.2, ease: 'power2.out' }, 0)
        if (roofFront) etl.fromTo(roofFront, { y: 64, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.8 }, 0.15)
        if (figureIn) etl.fromTo(figureIn, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4 }, 0.45)
        const lead = openingIn?.querySelector<HTMLElement>('.hero__lead')
        const intro = openingIn ? Array.from(openingIn.querySelectorAll<HTMLElement>('.hero__intro')) : []
        if (openingIn) etl.set(openingIn, { autoAlpha: 1 }, 0.9)
        if (lead) {
          const words = SplitText.create(lead, { type: 'words' }).words
          etl.fromTo(words, { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.09 }, 0.9)
        }
        if (intro.length) etl.fromTo(intro, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 1.6)
        if (chrome.length) etl.fromTo(chrome, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.7)
        if (cue) etl.call(() => cue.classList.add('is-in'), [], 2.3)
      })
      if (useUI.getState().introDone) run()
      const unsubscribe = useUI.subscribe((s) => {
        if (s.introDone) run()
      })
      // If the intro never reports (for example it never mounted), start anyway.
      const fallback = setTimeout(run, 4500)
      return () => {
        clearTimeout(fallback)
        unsubscribe()
      }
    },
    { scope: ref, dependencies: [chapter.id] },
  )

  return (
    <section ref={ref} id={chapter.id} data-layer={chapter.id} className="hero" data-ui={chapter.ui} aria-label="Maria on a Karachi rooftop before dawn">
      <Constellations />
      <ShootingStar />
      {/* The entrance moves the inner block; the scroll timeline moves the outer one. */}
      <div className="hero__opening">
        <div className="hero__opening-in">
          <h1 className="hero__lead">{chapter.lines[0]}</h1>
          {chapter.lines.slice(1).map((line) => (
            <p key={line} className="hero__intro">
              {line}
            </p>
          ))}
        </div>
      </div>
      <div className="hero__figure">
        <div className="hero__figure-in">
          <Avatar
            pose="pose-hero"
            alt="Maria on a Karachi rooftop before dawn, hair loose in the breeze, looking up at the sky"
            blink
            breathe
            priority
            sizes="(max-width: 900px) 60vw, 26vh"
          />
        </div>
      </div>
      {chapter.cue && (
        <p className="hero__cue">
          <span>{chapter.cue}</span>
        </p>
      )}
    </section>
  )
}
