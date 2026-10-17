'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { chapterById, useProgress } from '@/lib/progress'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * 2010, London, briefly. The sky's own snow falls behind the words; this is
 * the snow in front of them. The flakes fall on their own clock (a CSS
 * animation on each flake); the scroll owns only their container's opacity
 * and, from the second line (the snow she remembers) on, the speed they fall
 * at, slowing until they melt away. As the chapter leaves, a warm wash thaws the cold out of it.
 */

const FLAKES = 34
// Deterministic scatter, so the server and the client draw the same snow.
const rand = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return v - Math.floor(v)
}

/**
 * Tap (or click) a falling snowflake and it melts with a tiny soft fade, then
 * quietly comes back. Only while London is on stage; the nearest flake within
 * a finger's width counts, since the flakes themselves are a few pixels.
 */
function useMelt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const snow = ref.current
    const index = chapterById('london')?.index ?? -1
    if (!snow || prefersReducedMotion()) return
    const onDown = (e: PointerEvent) => {
      if (useProgress.getState().active !== index) return
      let best: HTMLElement | null = null
      let bd = 30
      for (const f of Array.from(snow.children) as HTMLElement[]) {
        const r = f.getBoundingClientRect()
        const d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY)
        if (d < bd) {
          bd = d
          best = f
        }
      }
      if (!best || best.getAnimations().some((a) => a.id === 'melt')) return
      const melt = best.animate(
        [
          { scale: '1', opacity: getComputedStyle(best).opacity },
          { scale: '1.9', opacity: '0.5', offset: 0.35 },
          { scale: '0.2', opacity: '0', offset: 0.8 },
          { scale: '0', opacity: '0' },
        ],
        { duration: 2600, easing: 'ease-out' },
      )
      melt.id = 'melt'
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [ref])
}

function LondonScene() {
  const ref = useRef<HTMLDivElement>(null)
  useMelt(ref)
  return (
    <>
      <div ref={ref} className="snow" aria-hidden="true">
        {Array.from({ length: FLAKES }, (_, i) => {
          const style = {
            '--x': `${(rand(i, 1) * 100).toFixed(1)}%`,
            '--size': `${(3 + rand(i, 2) * 5).toFixed(1)}px`,
            '--fall': `${(6 + rand(i, 3) * 7).toFixed(1)}s`,
            '--delay': `${(-rand(i, 4) * 13).toFixed(1)}s`,
            '--drift': `${((rand(i, 5) - 0.5) * 14).toFixed(1)}vw`,
            '--alpha': (0.55 + rand(i, 6) * 0.45).toFixed(2),
          } as React.CSSProperties
          return <i key={i} style={style} />
        })}
      </div>
      <div className="thaw" aria-hidden="true" />
    </>
  )
}

const london: SceneDef = {
  Scene: LondonScene,
  build: ({ tl, el, total, reduced }) => {
    const snow = el.querySelector<HTMLElement>('.snow')
    const thaw = el.querySelector<HTMLElement>('.thaw')
    if (!snow || !thaw) return
    if (reduced) {
      gsap.set(snow, { autoAlpha: 0 })
      gsap.set(thaw, { opacity: 0 })
      return
    }
    gsap.set(snow, { autoAlpha: 0 })
    gsap.set(thaw, { opacity: 0 })
    let flakes: Animation[] | null = null
    const speed = { rate: 1 }
    const apply = () => {
      if (!flakes || flakes.length === 0) flakes = snow.getAnimations({ subtree: true })
      for (const a of flakes) a.playbackRate = speed.rate
    }
    tl.to(snow, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' }, 0)
    // The second line, the snow she remembers, starts rising at 0.3 + 0.55.
    const stick = 0.85
    tl.fromTo(speed, { rate: 1 }, { rate: 0.12, duration: total - stick, ease: 'power2.out', onUpdate: apply, immediateRender: false }, stick)
    tl.to(snow, { autoAlpha: 0, y: 12, duration: total * 0.3, ease: 'power1.in' }, total * 0.7)
    // The wash warms the frame without hiding the words.
    tl.to(thaw, { opacity: 0.55, duration: total * 0.2 + 0.6, ease: 'power1.in' }, total * 0.82)
  },
}

export default london
