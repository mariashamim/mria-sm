'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Chapter as ChapterData } from '@/content/chapters'
import { gsap, SplitText, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { useUI } from '@/lib/ui'
import { interpolateKeyframes } from '@/lib/sky'
import Rooftop from '@/components/scene/Rooftop'
import Avatar from '@/components/avatar/Avatar'

type Props = { chapter: ChapterData }

/**
 * Wordless hero: Maria on the rooftop under a pre-dawn sky. Once the intro has
 * cleared (useUI.introDone) the roof settles in back to front, she arrives, then
 * the chrome fades up and the scroll cue breathes in. On the first scroll her name
 * rises letter by letter behind her and the sky begins to brighten.
 *
 * Two sets of elements on purpose: ScrollTrigger renders the scroll timeline
 * through once on refresh and records every tween's start values at that moment,
 * so nothing the time-based entrance animates may also be a scroll target. The
 * entrance moves the rooftop roots and an inner figure wrapper; the scroll
 * timeline moves the rooftop layers and the outer figure box.
 */
export default function Hero({ chapter }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current
      if (!el || !contextSafe) return
      const reduced = prefersReducedMotion()
      const touch = isTouch()
      const name = el.querySelector<HTMLElement>('.hero__name')
      const figure = el.querySelector<HTMLElement>('.hero__figure')
      const figureIn = el.querySelector<HTMLElement>('.hero__figure-in')
      const roofBack = el.querySelector<HTMLElement>('.hero__rooftop:not(.hero__rooftop--front)')
      const roofFront = el.querySelector<HTMLElement>('.hero__rooftop--front')
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
          onUpdate: (self) => {
            setSky(interpolateKeyframes(chapter.sky, self.progress))
            cue?.classList.toggle('is-gone', self.progress > 0.02)
          },
          onToggle: (self) => {
            if (self.isActive) activateChapter(chapter)
          },
        },
      })

      if (reduced) {
        if (name) gsap.set(name, { opacity: 1 })
        cue?.classList.add('is-in')
        return
      }

      // Scroll-driven: the name builds letter by letter, everything drifts, then clears.
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

      // Time-driven entrance. Everything that arrives is hidden up front, so the
      // intro's fade-out reveals an empty sky; then the far roof, the parapet,
      // Maria, the chrome, and the cue last.
      const chrome = Array.from(document.querySelectorAll<HTMLElement>('.topbar, .rail'))
      const arriving = [roofBack, roofFront, figureIn, ...chrome].filter(Boolean) as HTMLElement[]
      gsap.set(arriving, { autoAlpha: 0 })
      let fired = false
      const run = contextSafe(() => {
        if (fired) return
        fired = true
        const etl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        if (roofBack) etl.fromTo(roofBack, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4 }, 0)
        if (roofFront) etl.fromTo(roofFront, { y: 54, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4 }, 0.2)
        if (figureIn) etl.fromTo(figureIn, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.3 }, 0.35)
        if (chrome.length) etl.fromTo(chrome, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0.9)
        if (cue) etl.call(() => cue.classList.add('is-in'), [], 1.3)
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
    <section ref={ref} id={chapter.id} className="hero" data-ui={chapter.ui} aria-label="Maria on a Karachi rooftop before dawn">
      <h1 className="hero__name" aria-hidden="true">
        Maria
      </h1>
      <Rooftop layers={['city', 'fore']} size="hero" className="hero__rooftop" />
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
      <Rooftop layers={['parapet']} size="hero" className="hero__rooftop hero__rooftop--front" />
      <p className="hero__cue" aria-hidden="true">
        <span>scroll</span>
      </p>
    </section>
  )
}
