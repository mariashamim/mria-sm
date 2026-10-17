'use client'

import { gsap } from '@/lib/gsap'
import Avatar from '@/components/avatar/Avatar'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * The closing: the roof from the opening, at sunrise this time, and Maria
 * standing on it again, so the last frame answers the first. The words are
 * the chapter's own lines; the figure is a decorative repeat of the opening's.
 */

function ClosingScene() {
  return (
    <div className="closing__roof" aria-hidden="true">
      <Avatar pose="pose-hero" alt="" blink breathe sizes="(max-width: 900px) 40vw, 22vh" />
    </div>
  )
}

const closing: SceneDef = {
  Scene: ClosingScene,
  build: ({ tl, el, reduced }) => {
    const roof = el.querySelector<HTMLElement>('.closing__roof')
    if (!roof) return
    if (reduced) {
      gsap.set(roof, { opacity: 1 })
      return
    }
    tl.fromTo(roof, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0.2)
  },
}

export default closing
