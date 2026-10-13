'use client'

import { chapters, RAIL_YEARS } from '@/content/chapters'
import { useProgress } from '@/lib/progress'
import { scrollToChapter } from '@/lib/stage'

/** The thin timeline rail of years on the right edge. */
export default function Rail() {
  const active = useProgress((s) => s.active)
  const activeRail = chapters[active]?.rail ?? null

  const go = (year: (typeof RAIL_YEARS)[number]) => {
    const target = chapters.find((c) => c.rail === year)
    if (target) scrollToChapter(target.id)
  }

  return (
    <nav className="rail" aria-label="Timeline">
      <ol>
        {RAIL_YEARS.map((year) => {
          const isActive = activeRail === year
          const isFaint = activeRail === null && year === '2007'
          return (
            <li key={year} className={isActive ? 'is-active' : isFaint ? 'is-faint' : undefined}>
              <button type="button" onClick={() => go(year)} aria-current={isActive ? 'true' : undefined} data-hover>
                {year}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
