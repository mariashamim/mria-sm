'use client'

import { useEffect, useRef } from 'react'
import manifestJson from '@/public/scene/manifest.json'
import { ScrollTrigger } from '@/lib/gsap'
import { useProgress } from '@/lib/progress'
import { sampleAt } from '@/lib/world'
import Rooftop from '@/components/scene/Rooftop'

type Entry = { width: number; height: number }
const manifest = manifestJson as Record<string, Entry>

/** Optional cut-out cloud renders (public/scene/cloud-*.avif). Without them the sky shader draws its own. */
const PLATES = [
  { name: 'cloud-far', speed: 0.22, phase: 0.1, width: '120vw' },
  { name: 'cloud-near', speed: 0.42, phase: 0.62, width: '140vw' },
].filter((p) => p.name in manifest)

/**
 * The persistent world behind every chapter: the Karachi rooftop set and,
 * when the renders exist, cloud plates. One ScrollTrigger spanning the whole
 * page samples the sky and the camera height by absolute scroll position
 * (lib/world.ts) and writes them to the store and to --rise / --travel on
 * <html>, which the CSS turns into the roof sinking away as you climb.
 *
 * Two fixed roots on purpose: the far roof sits behind the page, the parapet
 * in front of the hero figure, and a single fixed parent would trap both in
 * one stacking context.
 */
export default function World() {
  const back = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const backEl = back.current
    const plates = backEl ? Array.from(backEl.querySelectorAll<HTMLElement>('.world__plate')) : []
    const { setFrame, setCloudPlates } = useProgress.getState()
    if (PLATES.length) setCloudPlates(true)

    let lastRise = -1
    const apply = (y: number) => {
      const f = sampleAt(y, window.innerHeight)
      setFrame(f)
      if (Math.abs(f.rise - lastRise) > 0.0005) {
        root.style.setProperty('--rise', f.rise.toFixed(4))
        lastRise = f.rise
      }
      if (plates.length) {
        // Plates drift down the screen as we climb and wrap around, fading in with height.
        const alpha = Math.min(1, Math.max(0, (f.rise - 0.12) / 0.38))
        plates.forEach((el, i) => {
          const p = PLATES[i]
          const cycle = (f.travel * p.speed + p.phase) % 1
          el.style.setProperty('--plate-y', `${(-45 + cycle * 190).toFixed(2)}vh`)
          el.style.setProperty('--plate-alpha', alpha.toFixed(3))
        })
      }
    }

    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => apply(self.scroll()),
      onRefresh: (self) => apply(self.scroll()),
    })
    apply(window.scrollY)
    return () => {
      st.kill()
      root.style.removeProperty('--rise')
    }
  }, [])

  return (
    <>
      <div ref={back} className="world" aria-hidden="true">
        {PLATES.map((p) => (
          <div key={p.name} className={`world__plate world__plate--${p.name.replace('cloud-', '')}`} style={{ width: p.width }}>
            <picture>
              <source type="image/avif" srcSet={`/scene/${p.name}.avif`} />
              <img src={`/scene/${p.name}.webp`} alt="" width={manifest[p.name].width} height={manifest[p.name].height} decoding="async" loading="lazy" draggable={false} />
            </picture>
          </div>
        ))}
        <Rooftop layers={['city', 'fore']} size="hero" className="world__rooftop" />
      </div>
      <div ref={front} className="world-front" aria-hidden="true">
        <Rooftop layers={['parapet']} size="hero" className="world__rooftop" />
      </div>
    </>
  )
}
