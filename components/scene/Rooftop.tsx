'use client'

import { useEffect, useRef } from 'react'
import manifestJson from '@/public/scene/manifest.json'
import { useProgress } from '@/lib/progress'
import { blendSky } from '@/lib/sky'

type Entry = { width: number; height: number }
const manifest = manifestJson as Record<string, Entry>

export type RooftopLayer = 'city' | 'fore' | 'parapet'

const LAYERS: Record<RooftopLayer, { base: string; day?: string; depth: number }> = {
  // depth: how much the layer drifts with scroll relative to the page (0 = fixed to the sky)
  city: { base: 'city-skyline', day: 'city-skyline-day', depth: 0.25 },
  fore: { base: 'rooftop-fore', day: 'rooftop-fore-day', depth: 0.55 },
  parapet: { base: 'parapet-front', depth: 0.9 },
}

type Props = {
  layers?: RooftopLayer[]
  /** 'hero' fills the lower two thirds of the viewport; 'chapter' is a low strip behind the text. */
  size?: 'hero' | 'chapter'
  className?: string
}

/**
 * The Karachi rooftop set: a far skyline, the roof itself and a near parapet,
 * each cut out of its render so the WebGL sky shows above the roofline. Every
 * layer has a night render and a matched daylight render; their crossfade
 * follows the sky, so windows light up as evening falls.
 */
export default function Rooftop({ layers = ['city', 'fore', 'parapet'], size = 'hero', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = (sky: number) => el.style.setProperty('--day', blendSky(sky).day.toFixed(3))
    apply(useProgress.getState().sky)
    return useProgress.subscribe((s) => apply(s.sky))
  }, [])

  const present = layers.filter((l) => LAYERS[l].base in manifest)
  if (present.length === 0) return null

  return (
    <div ref={ref} className={['rooftop', `rooftop--${size}`, className ?? ''].filter(Boolean).join(' ')} aria-hidden="true">
      {present.map((l) => {
        const { base, day, depth } = LAYERS[l]
        const m = manifest[base]
        const hasDay = !!day && day in manifest
        return (
          <div key={l} className={`rooftop__layer rooftop__layer--${l}`} data-depth={depth} style={{ '--ratio': m.width / m.height } as React.CSSProperties}>
            <picture className="rooftop__night">
              <source type="image/avif" srcSet={`/scene/${base}.avif`} />
              <img src={`/scene/${base}.webp`} alt="" width={m.width} height={m.height} decoding="async" loading={size === 'hero' ? 'eager' : 'lazy'} fetchPriority={size === 'hero' && l === 'city' ? 'high' : undefined} draggable={false} />
            </picture>
            {hasDay && (
              <picture className="rooftop__day">
                <source type="image/avif" srcSet={`/scene/${day}.avif`} />
                <img src={`/scene/${day}.webp`} alt="" width={m.width} height={m.height} decoding="async" loading={size === 'hero' ? 'eager' : 'lazy'} draggable={false} />
              </picture>
            )}
          </div>
        )
      })}
    </div>
  )
}
