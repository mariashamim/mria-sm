'use client'

import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { useProgress } from '@/lib/progress'
import { sampleSkyAt } from '@/lib/world'

/**
 * Renders nothing. One ScrollTrigger spanning the whole page samples the sky
 * by absolute scroll position (lib/world.ts) and writes it to the store, so
 * the sky keeps changing through the gap between two pinned chapters instead
 * of pausing until the next one pins.
 */
export default function World() {
  useEffect(() => {
    const setSky = useProgress.getState().setSky
    const apply = (y: number) => setSky(sampleSkyAt(y))
    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => apply(self.scroll()),
      onRefresh: (self) => apply(self.scroll()),
    })
    apply(window.scrollY)
    return () => st.kill()
  }, [])
  return null
}
