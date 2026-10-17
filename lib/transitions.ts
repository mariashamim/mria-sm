import { gsap } from '@/lib/gsap'

/**
 * How each chapter arrives on the stage and how it leaves. The stage
 * (components/stage/Stage.tsx) calls these on the master timeline; master time
 * is in viewports of scroll. Only transform and opacity move here: whole
 * layers are large, and a filter on one costs a frame.
 *
 * One section at a time: every exit finishes before the next section starts
 * forming (lead 1), so two years or two Urdu words are never on screen
 * together. The one exception is 2023 → 2024, where 2024 cuts in over the
 * dark 2023 ends on. Transitions are short, and each section's own words
 * start arriving as it forms (a small `body`), so no stretch of scroll is empty.
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
  dur: 0.35,
  body: 0.2,
  build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: dur, ease: 'power2.out' }, at),
}

const exitDefault: Exit = {
  dur: 0.3,
  lead: 1,
  build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, scale: 1.03, duration: dur, ease: 'power2.in' }, at),
}

const ENTERS: Record<string, Enter> = {
  // Under the ink: it is simply there when the ink clears.
  karachi: {
    dur: 0.02,
    body: 0,
    build: (m, l, at) => m.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02, ease: 'none' }, at),
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
    dur: 0.4,
    body: 0.45,
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
    dur: 0.4,
    body: 0.2,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, yPercent: 5 }, { autoAlpha: 1, yPercent: 0, duration: dur, ease: 'power3.out' }, at),
  },
  // Out of the clouds: 2023 settles from slightly too close.
  sky: {
    dur: 0.5,
    body: 0.1,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: dur, ease: 'power2.out' }, at),
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
    body: 0.1,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: dur, ease: 'back.out(1.6)' }, at),
  },
  // The letter's card arrives on its own; the layer only fades.
  letter: {
    dur: 0.4,
    body: 0.1,
    build: (m, l, at, dur) => m.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: 'power1.out' }, at),
  },
}

const EXITS: Record<string, Exit> = {
  // She is looking up: the rooftop keeps sinking as it goes.
  // The ink bleed (lib/setpieces.ts): the opening dims while گھر draws itself,
  // then the ink covers everything and 2007 forms underneath it.
  hero: {
    dur: 1.7,
    lead: 0.8,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, yPercent: 3, duration: dur * 0.3, ease: 'power1.in' }, at + dur * 0.15),
  },
  // The thaw: no movement, a fade through the warm wash the chapter ends on.
  london: {
    dur: 0.3,
    lead: 1,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, duration: dur, ease: 'power1.inOut' }, at),
  },
  // The screen goes; a quick fall back from the glass.
  home: {
    dur: 0.3,
    lead: 1,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, scale: 0.98, duration: dur, ease: 'power2.in' }, at),
  },
  // The plane has already left; the page follows it out quickly.
  // The fly-through (lib/setpieces.ts): the plane comes at us, the mist rises
  // over 2017, and 2023 forms behind the clouds.
  karsaz: {
    dur: 1.5,
    lead: 0.62,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, duration: dur * 0.3, ease: 'power1.in' }, at + dur * 0.15),
  },
  // 2023 ends in the dark with a terminal window open; 2024 cuts in over it,
  // and only then does this layer go.
  sky: {
    dur: 0.06,
    lead: 0,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, duration: 0.01, ease: 'none' }, at + dur),
  },
  loves: {
    dur: 0.3,
    lead: 1,
    build: (m, l, at, dur) => m.to(l, { autoAlpha: 0, scale: 0.97, duration: dur, ease: 'power2.in' }, at),
  },
}

export const enterOf = (id: string): Enter => ENTERS[id] ?? enterDefault
export const exitOf = (id: string): Exit => EXITS[id] ?? exitDefault
