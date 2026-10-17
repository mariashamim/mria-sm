'use client'

import { gsap } from '@/lib/gsap'
import Avatar from '@/components/avatar/Avatar'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * The letter: a paper card on the roof from the opening, written by hand while
 * the night turns to dawn. The stage brings the whole rooftop back
 * (components/stage/Stage.tsx); this scene lays the card down and, as the
 * letter ends and the sky brightens, puts her back where the story began,
 * standing on the roof, so the last frame answers the first.
 */

function LetterScene() {
  return (
    <div className="letter__roof" aria-hidden="true">
      <Avatar pose="pose-hero" alt="" blink breathe sizes="(max-width: 900px) 40vw, 22vh" />
    </div>
  )
}

const letter: SceneDef = {
  Scene: LetterScene,
  owns: ['year', 'figures'],
  build: ({ tl, el, total, reduced }) => {
    const card = el.querySelector<HTMLElement>('.chapter__inner')
    const desk = Array.from(el.querySelectorAll<HTMLElement>('.chapter__figure > *'))
    const roof = el.querySelector<HTMLElement>('.letter__roof')
    if (!card || !roof) return
    if (reduced) {
      gsap.set(card, { opacity: 1 })
      gsap.set(desk, { opacity: 1 })
      gsap.set(roof, { opacity: 0 })
      return
    }
    gsap.set(roof, { opacity: 0, y: 30 })
    // The card is laid down, a little crooked, the way paper lands.
    tl.fromTo(card, { opacity: 0, y: 70, rotation: 3 }, { opacity: 1, y: 0, rotation: -0.8, duration: 0.7, ease: 'power3.out' }, 0)
    // She writes it at the desk, under the lamp...
    tl.fromTo(desk, { opacity: 0, yPercent: 6 }, { opacity: 1, yPercent: 0, duration: 0.8, ease: 'power2.out' }, 0.3)
    // ...and once it is written, she is on the roof again, in the first light.
    tl.to(desk, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 0.72 * total)
    tl.to(roof, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.76 * total)
  },
}

export default letter
