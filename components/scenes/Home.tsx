'use client'

import { gsap } from '@/lib/gsap'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * 2011, back home: the room is lit by one screen. The chapter powers on like
 * a CRT (the beam here is what shows while the stage squashes the layer into
 * a line, lib/transitions.ts), and the monitor's glow fills the frame
 * (--glow on the figure box, drawn by CSS from the screen's edge). The
 * flicker on both faces is a time-based CSS animation on the figure's own
 * pseudo-element, masked to the render; the scroll never touches it.
 */

function HomeScene() {
  return <div className="crt-beam" aria-hidden="true" />
}

const home: SceneDef = {
  Scene: HomeScene,
  build: ({ tl, el, total, reduced }) => {
    const box = el.querySelector<HTMLElement>('.chapter__figure')
    const beam = el.querySelector<HTMLElement>('.crt-beam')
    if (beam) gsap.set(beam, { opacity: 0 })
    if (!box) return
    if (reduced) {
      gsap.set(box, { '--glow': 0.8 })
      return
    }
    gsap.set(box, { '--glow': 0 })
    // The screen warms up after the power-on, then holds the room.
    tl.to(box, { '--glow': 1, duration: 0.9, ease: 'power2.out' }, 0.1)
    tl.to(box, { '--glow': 0.75, duration: total - 1, ease: 'none' }, 1)
  },
}

export default home
