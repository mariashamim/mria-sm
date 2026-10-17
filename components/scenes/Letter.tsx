'use client'

import { gsap } from '@/lib/gsap'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * The letter: a paper card on the roof from the opening, written at the desk
 * under the lamp while the night turns towards dawn. On phones the card
 * covers the desk until it is written, then lifts to show her. The stage brings the
 * roof back (components/stage/Stage.tsx); this scene lays the card down. The
 * morning itself, and Maria standing on the roof again, belong to the
 * closing (components/scenes/Closing.tsx).
 */

function LetterScene() {
  return <></>
}

const letter: SceneDef = {
  Scene: LetterScene,
  owns: ['year', 'figures'],
  build: ({ tl, el, total, reduced }) => {
    const card = el.querySelector<HTMLElement>('.chapter__inner')
    const desk = Array.from(el.querySelectorAll<HTMLElement>('.chapter__figure > *'))
    if (!card) return
    if (reduced) {
      gsap.set([card, ...desk], { opacity: 1 })
      return
    }
    // The card is laid down, a little crooked, the way paper lands.
    tl.fromTo(card, { opacity: 0, y: 70, rotation: 3 }, { opacity: 1, y: 0, rotation: -0.8, duration: 0.7, ease: 'power3.out' }, 0)
    // She writes it at the desk, under the lamp.
    tl.fromTo(desk, { opacity: 0, yPercent: 6 }, { opacity: 1, yPercent: 0, duration: 0.8, ease: 'power2.out' }, 0.3)
    // On phones the card fills the screen; once it is written it lifts as you scroll
    // and she is there under it, at the desk. --lift does nothing on wider screens (CSS).
    // It starts while the second half is being written, so the newest line stays in view on short phones.
    tl.fromTo(card, { '--lift': 0 }, { '--lift': 1, duration: 0.4 * total, ease: 'power1.inOut' }, 0.62 * total)
  },
}

export default letter
