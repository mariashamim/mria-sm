'use client'

import { gsap } from '@/lib/gsap'
import type { SceneDef } from '@/components/scenes/registry'
import { DreamCard, DreamSky } from '@/components/scenes/DreamPlanes'

/**
 * The closing: Maria on the roof at sunrise with her chai, looking out over
 * the city (public/scene/closing-sunrise, a full scene rendered for this
 * moment). The opening had her looking up before dawn; the last frame has her
 * looking out in the morning. An eyes-closed copy of the same frame blinks now
 * and then. The words are the chapter's own lines, over the morning sky.
 */

function ClosingScene() {
  return (
    <div className="closing__scene" aria-hidden="true">
      <picture>
        <source type="image/avif" media="(max-width: 900px)" srcSet="/scene/closing-sunrise-1200.avif" />
        <source type="image/webp" media="(max-width: 900px)" srcSet="/scene/closing-sunrise-1200.webp" />
        <source type="image/avif" srcSet="/scene/closing-sunrise.avif" />
        <img src="/scene/closing-sunrise.webp" alt="" width={2400} height={1340} loading="lazy" decoding="async" draggable={false} />
      </picture>
      <picture className="closing__blink">
        <source type="image/avif" media="(max-width: 900px)" srcSet="/scene/closing-sunrise-blink-1200.avif" />
        <source type="image/webp" media="(max-width: 900px)" srcSet="/scene/closing-sunrise-blink-1200.webp" />
        <source type="image/avif" srcSet="/scene/closing-sunrise-blink.avif" />
        <img src="/scene/closing-sunrise-blink.webp" alt="" width={2400} height={1340} loading="lazy" decoding="async" draggable={false} />
      </picture>
    </div>
  )
}

function ClosingSky() {
  return (
    <>
      <ClosingScene />
      <DreamSky />
    </>
  )
}

const closing: SceneDef = {
  Scene: ClosingSky,
  After: DreamCard,
  build: ({ tl, el, total, reduced }) => {
    const scene = el.querySelector<HTMLElement>('.closing__scene')
    const dream = el.querySelector<HTMLElement>('.dream')
    if (!scene) return
    if (reduced) {
      gsap.set([scene, dream].filter(Boolean), { opacity: 1, visibility: 'inherit' })
      return
    }
    // The card arrives after the last line, "Thanks for stopping by."
    if (dream) tl.fromTo(dream, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.2)
    // The morning settles in: a slow push back from slightly too close.
    tl.fromTo(scene, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 0)
    tl.fromTo(scene, { yPercent: 0 }, { yPercent: -2, duration: total, ease: 'none' }, 0)
  },
}

export default closing
