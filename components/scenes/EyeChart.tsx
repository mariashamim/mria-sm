'use client'

import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { EYE_CHART } from '@/content/interactive'

/**
 * The chart from the medical. Look down it and the lower lines blur until
 * the last one cannot be read, however hard you try.
 *
 * Two inputs feed one number, the gaze (0 = top row, 1 = bottom row):
 *   --auto-gaze  set by the chapter timeline, so the chart reads itself as
 *                the lines land even if nobody touches it;
 *   --held-gaze  set here while a pointer or finger is on the chart, and
 *                removed when it leaves.
 * The CSS picks the held value when it exists; every row blurs by its own
 * difficulty plus how far below the gaze it sits.
 */
export default function EyeChart() {
  const ref = useRef<HTMLDivElement>(null)
  const n = EYE_CHART.rows.length

  const hold = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    const rows = el?.querySelector<HTMLElement>('.eye__rows')
    if (!el || !rows) return
    const r = rows.getBoundingClientRect()
    const g = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    el.style.setProperty('--held-gaze', g.toFixed(3))
    el.classList.add('is-held')
  }
  const release = () => {
    const el = ref.current
    if (!el) return
    el.style.removeProperty('--held-gaze')
    el.classList.remove('is-held')
  }

  return (
    <div
      ref={ref}
      className="eye"
      role="img"
      aria-label="An eye chart. The lower lines blur as you look down it; the last line cannot be read."
      onPointerMove={hold}
      onPointerDown={hold}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      <div className="eye__head" aria-hidden="true">
        <span>{EYE_CHART.head[0]}</span>
        <span>{EYE_CHART.head[1]}</span>
      </div>
      <div className="eye__rows" aria-hidden="true">
        {EYE_CHART.rows.map((row, i) => {
          const p = i / (n - 1)
          const style = { '--p': p.toFixed(3), '--base': (6 * Math.pow(p, 2.5)).toFixed(2), '--fs': EYE_CHART.sizes[i] } as CSSProperties
          return (
            <div key={i} className="eye__row" style={style}>
              <span className="eye__letters">{row}</span>
              <small className="eye__acuity">{EYE_CHART.acuity[i]}</small>
            </div>
          )
        })}
      </div>
      <p className="eye__caption" aria-hidden="true">
        <span className="eye__ask">{EYE_CHART.ask}</span>
        <span className="eye__fail">{EYE_CHART.fail}</span>
      </p>
    </div>
  )
}
