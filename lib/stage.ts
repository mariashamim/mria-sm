import type { ScrollTrigger } from '@/lib/gsap'
import { chapters, type Keyframe } from '@/content/chapters'
import { interpolateKeyframes } from '@/lib/sky'
import { getLenis } from '@/lib/lenis'

/**
 * The stage: one pinned viewport, one master timeline, every chapter a layer.
 * Chapters overlap at their edges (the next one forms while the previous one
 * dissolves), so the sky and the active chapter are sampled by master time,
 * not by which section is on screen.
 */

export type Segment = {
  id: string
  index: number
  /** Master time at which the layer starts to form. */
  start: number
  /** Master time span of the chapter's own content timeline. */
  bodyStart: number
  bodyEnd: number
  /** Master time at which the layer has fully dissolved. */
  end: number
}

let master: ScrollTrigger | null = null
let segments: Segment[] = []
let duration = 1

export function setStage(st: ScrollTrigger, segs: Segment[], dur: number) {
  master = st
  segments = segs
  duration = dur
}

export function clearStage() {
  master = null
  segments = []
  duration = 1
}

const first = (kf: Keyframe[]) => (kf.length ? kf[0].stop : 0)
const last = (kf: Keyframe[]) => (kf.length ? kf[kf.length - 1].stop : 0)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Continuous sky value in [0, 10] for a master time (see lib/sky.ts). */
export function skyAt(time: number): number {
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    const c = chapters[s.index]
    if (time < s.bodyStart) {
      if (i === 0) return first(c.sky)
      const p = segments[i - 1]
      const pc = chapters[p.index]
      const g = clamp01((time - p.bodyEnd) / Math.max(1e-6, s.bodyStart - p.bodyEnd))
      return lerp(last(pc.sky), first(c.sky), g)
    }
    if (time <= s.bodyEnd) {
      const span = Math.max(1e-6, s.bodyEnd - s.bodyStart)
      return interpolateKeyframes(c.sky, (time - s.bodyStart) / span)
    }
  }
  const tail = segments[segments.length - 1]
  return tail ? last(chapters[tail.index].sky) : 0
}

/** Index of the chapter that owns a master time: the latest one that has started forming for real. */
export function activeAt(time: number): number {
  let active = 0
  for (const s of segments) {
    if (time >= s.start + (s.bodyStart - s.start) * 0.5) active = s.index
  }
  return active
}

/** Scroll so that a chapter's content is just beginning (the hero: the very top). */
export function scrollToChapter(id: string, opts: { immediate?: boolean } = {}) {
  const seg = segments.find((s) => s.id === id)
  const target = document.getElementById(id)
  if (!master || !seg) {
    if (target) target.scrollIntoView({ behavior: opts.immediate ? 'instant' : 'smooth', block: 'start' })
    return
  }
  // Before the first refresh (fonts and images still loading) the trigger has no span yet.
  if (!(master.end > master.start)) master.refresh()
  // Land once the previous chapter has fully dissolved and this one is sharp.
  const y = seg.index === 0 ? master.start : master.start + ((seg.bodyStart + 0.35) / duration) * (master.end - master.start)
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(y, opts.immediate ? { immediate: true, force: true } : { duration: 1.6 })
  else window.scrollTo({ top: y, behavior: opts.immediate ? 'instant' : 'smooth' })
}
