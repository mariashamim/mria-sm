'use client'

import { gsap } from '@/lib/gsap'
import type { SceneDef } from '@/components/scenes/registry'

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

const closing: SceneDef = {
  Scene: ClosingScene,
  build: ({ tl, el, total, reduced }) => {
    const scene = el.querySelector<HTMLElement>('.closing__scene')
    if (!scene) return
    if (reduced) {
      gsap.set(scene, { opacity: 1 })
      return
    }
    // The morning settles in: a slow push back from slightly too close.
    tl.fromTo(scene, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 0)
    tl.fromTo(scene, { yPercent: 0 }, { yPercent: -2, duration: total, ease: 'none' }, 0)
  },
}

export default closing
