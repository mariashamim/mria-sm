import { gsap } from '@/lib/gsap'

/**
 * How each chapter arrives on the stage and how it leaves. The stage
 * (components/stage/Stage.tsx) calls these on the master timeline; master time
 * is in viewports of scroll. Only transform and opacity move here: whole
 * layers are large, and a filter on one costs a frame.
 *
 *   enter.dur   how long the layer takes to form
 *   enter.body  how far into the forming its own content starts (fraction)
 *   exit.dur    how long it takes to leave
 *   exit.lead   how far into the leaving the next chapter starts forming (fraction)
 */

type Build = (master: gsap.core.Timeline, layer: HTMLElement, at: number, dur: number) => void
type Enter = { dur: number; body: number; build: Build }
type Exit = { dur: number; lead: number; build: Build }

const enterDefault: Enter = {
  dur: 0.45,
  body: 0.35,
  build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: dur, ease: 'power2.out' }, at),
}

const exitDefault: Exit = {
  dur: 0.55,
  lead: 0.45,
  build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, scale: 1.04, duration: dur, ease: 'power2.in' }, at),
}

const ENTERS: Record<string, Enter> = {
  // Down out of the sky she has just looked up into.
  karachi: {
    dur: 0.5,
    body: 0.3,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, yPercent: -5 }, { autoAlpha: 1, yPercent: 0, duration: dur, ease: 'power2.out' }, at),
  },
  // Brief: a crisp, cold settle.
  london: {
    dur: 0.3,
    body: 0.2,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, scale: 1.03 }, { autoAlpha: 1, scale: 1, duration: dur, ease: 'power3.out' }, at),
  },
  // A CRT powering on: a bright line across the middle opens into the picture.
  // The beam inside the layer (.crt-beam, components/scenes/Home.tsx) is what
  // shows while the layer is squashed, then it fades off the picture.
  home: {
    dur: 0.7,
    body: 0.7,
    build: (m, l, at, dur) => {
      const beam = l.querySelector<HTMLElement>('.crt-beam')
      m.set(l, { autoAlpha: 1, transformOrigin: '50% 50%' }, at)
      m.fromTo(l, { scaleY: 0.006, scaleX: 0.25 }, { scaleX: 1, duration: dur * 0.3, ease: 'power3.out', immediateRender: false }, at)
      m.to(l, { scaleY: 1, duration: dur * 0.4, ease: 'expo.out' }, at + dur * 0.3)
      if (beam) {
        m.set(beam, { opacity: 1 }, at)
        m.to(beam, { opacity: 0, duration: dur * 0.45, ease: 'power1.in' }, at + dur * 0.5)
      }
    },
  },
  // A notebook page laid down on the desk.
  karsaz: {
    dur: 0.55,
    body: 0.35,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, yPercent: 6 }, { autoAlpha: 1, yPercent: 0, duration: dur, ease: 'power3.out' }, at),
  },
  // Slow and still: no movement at all as the climax arrives.
  sky: {
    dur: 0.9,
    body: 0.25,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: 'power1.inOut' }, at),
  },
  // No transition: the window 2023 opened is already on screen, at this
  // chapter's terminal; the chapter forms around it (components/scenes/registry.tsx).
  hello: {
    dur: 0.02,
    body: 0,
    build: (m, l, at) => m.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02, ease: 'none' }, at),
  },
  // A change of tempo: it pops.
  loves: {
    dur: 0.3,
    body: 0.15,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: dur, ease: 'back.out(1.6)' }, at),
  },
  // The letter's card arrives on its own; the layer only fades.
  letter: {
    dur: 0.6,
    body: 0.1,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: 'power1.out' }, at),
  },
}

const EXITS: Record<string, Exit> = {
  // She is looking up: the rooftop keeps sinking as it goes.
  hero: {
    dur: 0.6,
    lead: 0.45,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, yPercent: 6, duration: dur, ease: 'power1.in' }, at),
  },
  // The thaw: no movement, a long fade through the warm wash the chapter ends on.
  london: {
    dur: 0.8,
    lead: 0.35,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, duration: dur, ease: 'power1.inOut' }, at),
  },
  // The screen goes; a quick fall back from the glass.
  home: {
    dur: 0.45,
    lead: 0.4,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, scale: 0.98, duration: dur, ease: 'power2.in' }, at),
  },
  // The plane has already left; the page follows it out quickly.
  karsaz: {
    dur: 0.35,
    lead: 0.6,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, duration: dur, ease: 'power1.in' }, at),
  },
  // 2023 ends in the dark with a terminal window open; 2024 cuts in over it,
  // and only then does this layer go.
  sky: {
    dur: 0.06,
    lead: 0,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, duration: 0.01, ease: 'none' }, at + dur),
  },
  loves: {
    dur: 0.4,
    lead: 0.4,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, scale: 0.97, duration: dur, ease: 'power2.in' }, at),
  },
}

export const enterOf = (id: string): Enter => ENTERS[id] ?? enterDefault
export const exitOf = (id: string): Exit => EXITS[id] ?? exitDefault
