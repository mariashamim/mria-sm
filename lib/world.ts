import type { ScrollTrigger } from '@/lib/gsap'
import { chapters, type Keyframe } from '@/content/chapters'
import { interpolateKeyframes } from '@/lib/sky'

/**
 * The sky is sampled by absolute scroll position, not per chapter, so it keeps
 * moving while one chapter scrolls out and the next scrolls in. Inside a
 * chapter's pinned range its own keyframes apply; across the gap between two
 * chapters the end of one blends into the start of the next.
 */

const triggers = new Map<number, ScrollTrigger>()

/** Chapters register their pinned ScrollTrigger so the sampler can read its range. */
export function registerChapterTrigger(index: number, st: ScrollTrigger): () => void {
  triggers.set(index, st)
  return () => {
    if (triggers.get(index) === st) triggers.delete(index)
  }
}

const first = (kf: Keyframe[]) => (kf.length ? kf[0].stop : 0)
const last = (kf: Keyframe[]) => (kf.length ? kf[kf.length - 1].stop : 0)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Continuous sky value in [0, 9] (see lib/sky.ts) for an absolute scroll position. */
export function sampleSkyAt(y: number): number {
  let prev: { sky: Keyframe[]; end: number } | null = null
  for (const c of chapters) {
    const st = triggers.get(c.index)
    if (!st) continue
    const { start, end } = st
    if (y < start) {
      if (!prev) return first(c.sky)
      const g = clamp01((y - prev.end) / Math.max(1, start - prev.end))
      return lerp(last(prev.sky), first(c.sky), g)
    }
    if (y <= end) {
      const p = end > start ? (y - start) / (end - start) : 1
      return interpolateKeyframes(c.sky, p)
    }
    prev = { sky: c.sky, end }
  }
  if (prev) return last(prev.sky)
  return 0
}
