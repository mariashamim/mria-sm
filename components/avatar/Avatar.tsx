'use client'

import { useEffect, useState } from 'react'
import manifestJson from '@/public/avatar/manifest.json'
import { prefersReducedMotion } from '@/lib/gsap'

type Entry = { width: number; height: number }
const manifest = manifestJson as Record<string, Entry>

export type AvatarProps = {
  /** Base name in public/avatar, e.g. "pose-hero". */
  pose: string
  alt: string
  /** Crossfade to "<pose>-blink" every few seconds when that render exists. */
  blink?: boolean
  /** Slow breathing scale on the figure. */
  breathe?: boolean
  priority?: boolean
  className?: string
  sizes?: string
}

export function hasPose(pose: string): boolean {
  return pose in manifest
}

/** CSS aspect-ratio value for a pose, e.g. "672 / 1218". */
export function poseRatio(pose: string): string | undefined {
  const m = manifest[pose]
  return m ? `${m.width} / ${m.height}` : undefined
}

/**
 * One cut-out render of Maria (or Ginger, or Sharjeel), served as AVIF with a
 * WebP fallback, with an optional eyes-closed layer that blinks on a random
 * 3.5 to 7 second cycle. The whole thing is a plain <picture>, no image
 * optimisation round-trip, because the files are already small.
 */
export default function Avatar({ pose, alt, blink = false, breathe = false, priority = false, className, sizes = '40vw' }: AvatarProps) {
  const base = manifest[pose]
  const blinkName = `${pose}-blink`
  const canBlink = blink && blinkName in manifest
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (!canBlink || prefersReducedMotion()) return
    let open: ReturnType<typeof setTimeout> | undefined
    let shut: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      open = setTimeout(
        () => {
          setClosed(true)
          shut = setTimeout(() => {
            setClosed(false)
            schedule()
          }, 140)
        },
        3500 + Math.random() * 3500,
      )
    }
    schedule()
    return () => {
      clearTimeout(open)
      clearTimeout(shut)
    }
  }, [canBlink])

  if (!base) return null

  const cls = ['avatar', breathe ? 'avatar--breathe' : '', className ?? ''].filter(Boolean).join(' ')
  const style = { aspectRatio: `${base.width} / ${base.height}` }

  return (
    <div className={cls} style={style} data-pose={pose}>
      <picture>
        <source type="image/avif" srcSet={`/avatar/${pose}.avif`} sizes={sizes} />
        <img
          src={`/avatar/${pose}.webp`}
          alt={alt}
          width={base.width}
          height={base.height}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          sizes={sizes}
          draggable={false}
        />
      </picture>
      {canBlink && (
        <div className="avatar__blink" data-closed={closed ? 'true' : 'false'} aria-hidden="true">
          <picture>
            <source type="image/avif" srcSet={`/avatar/${blinkName}.avif`} sizes={sizes} />
            <img src={`/avatar/${blinkName}.webp`} alt="" width={base.width} height={base.height} decoding="async" loading={priority ? 'eager' : 'lazy'} sizes={sizes} draggable={false} />
          </picture>
        </div>
      )}
    </div>
  )
}
