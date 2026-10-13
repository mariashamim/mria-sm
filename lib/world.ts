import type { ScrollTrigger } from '@/lib/gsap'
import { chapters, type Keyframe } from '@/content/chapters'
import { interpolateKeyframes } from '@/lib/sky'

/**
 * The world is sampled by absolute scroll position, not per chapter, so the
 * sky and the camera height keep moving while one chapter scrolls out and the
 * next scrolls in. Inside a chapter's pinned range its own keyframes apply;
 * across the gap between two chapters the end of one blends into the start
 * of the next.
 */

const triggers = new Map<number, ScrollTrigger>()

/** Chapters register their pinned ScrollTrigger so the world can read its range. */
export function registerChapterTrigger(index: number, st: ScrollTrigger): () => void {
  triggers.set(index, st)
  return () => {
    if (triggers.get(index) === st) triggers.delete(index)
  }
}

export type Frame = {
  /** Continuous sky value in [0, 9]; see lib/sky.ts. */
  sky: number
  /** How far the camera has climbed above the rooftop, 0 (on the roof) to 1 (high). */
  rise: number
  /** Scroll position in viewport heights; streams stars and clouds past. */
  travel: number
}

const first = (kf: Keyframe[]) => (kf.length ? kf[0].stop : 0)
const last = (kf: Keyframe[]) => (kf.length ? kf[kf.length - 1].stop : 0)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function sampleAt(y: number, viewportHeight: number): Frame {
  const travel = viewportHeight > 0 ? y / viewportHeight : 0
  let prev: { sky: Keyframe[]; rise: Keyframe[]; end: number } | null = null
  for (const c of chapters) {
    const st = triggers.get(c.index)
    if (!st) continue
    const { start, end } = st
    if (y < start) {
      if (!prev) return { sky: first(c.sky), rise: first(c.rise), travel }
      const g = clamp01((y - prev.end) / Math.max(1, start - prev.end))
      return { sky: lerp(last(prev.sky), first(c.sky), g), rise: lerp(last(prev.rise), first(c.rise), g), travel }
    }
    if (y <= end) {
      const p = end > start ? (y - start) / (end - start) : 1
      return { sky: interpolateKeyframes(c.sky, p), rise: interpolateKeyframes(c.rise, p), travel }
    }
    prev = { sky: c.sky, rise: c.rise, end }
  }
  if (prev) return { sky: last(prev.sky), rise: last(prev.rise), travel }
  return { sky: 0, rise: 0, travel }
}
