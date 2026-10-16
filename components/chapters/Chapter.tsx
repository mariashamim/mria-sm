'use client'

import type { Chapter as ChapterData } from '@/content/chapters'
import Avatar, { hasPose, poseRatio } from '@/components/avatar/Avatar'
import { SCENES } from '@/components/scenes/registry'
import { DOORS } from '@/content/links'

type Props = { chapter: ChapterData }

/**
 * A chapter's layer on the stage: the year, the Urdu word, the title, the
 * lines, the figure and any scene. It has no motion of its own; the stage
 * (components/stage/Stage.tsx) forms it, plays its content timeline
 * (lib/chapterTimelines.ts) and dissolves it as the scroll moves on.
 */
export default function Chapter({ chapter }: Props) {
  const Scene = SCENES[chapter.id]?.Scene
  return (
    <section id={chapter.id} data-layer={chapter.id} className="chapter" data-ui={chapter.ui} aria-labelledby={`${chapter.id}-title`}>
      {Scene && <Scene />}
      <div className="chapter__urdu" aria-hidden="true" lang="ur">
        {chapter.urdu}
      </div>
      <div className="chapter__inner">
        <p className="chapter__meta">
          <span>{String(chapter.index).padStart(2, '0')}</span>
          <span aria-hidden="true"> · </span>
          <span lang="ur">{chapter.urdu}</span>
          <span aria-hidden="true"> · </span>
          <span>{chapter.urduMeaning}</span>
        </p>
        {/* The year is decoration; the title is the section's heading. */}
        <div className="chapter__year" aria-hidden="true">
          {chapter.year}
        </div>
        <h2 id={`${chapter.id}-title`} className="chapter__title">
          {chapter.title}
        </h2>
        {chapter.lines.length > 0 && (
          <div className="chapter__lines">
            {chapter.lines.map((line, i) => (
              <div className="mask" key={i}>
                <p>{line}</p>
              </div>
            ))}
          </div>
        )}
        {chapter.ps && (
          <div className="chapter__ps">
            {chapter.ps.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <nav className="doors" aria-label="Say hello">
              {DOORS.map((d) => (
                <a key={d.id} href={d.href} title={d.title} target={d.href.startsWith('mailto:') ? undefined : '_blank'} rel={d.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'} data-hover>
                  {d.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
      {figuresFor(chapter)}
    </section>
  )
}

function figuresFor(chapter: ChapterData) {
  const figs = (chapter.figures ?? []).filter((f) => hasPose(f.pose))
  if (figs.length === 0) return null
  const layout = figs.some((f) => f.size === 'wide') ? 'wide' : figs.length > 1 ? 'pair' : 'single'
  return (
    <div className={`chapter__figure chapter__figure--${layout}`}>
      {figs.map((f) => (
        // The wrapper takes GSAP's drift; the avatar inside keeps its own CSS breathing transform.
        // The wrapper carries the aspect ratio so its width is definite inside the flex row.
        <div key={f.pose} className={`chapter__fig chapter__fig--${f.size ?? 'normal'}`} style={{ aspectRatio: poseRatio(f.pose) }}>
          <Avatar
            pose={f.pose}
            alt={f.alt}
            blink={f.blink}
            breathe
            className={f.mask ? `avatar--mask-${f.mask}` : undefined}
            sizes={f.size === 'wide' ? '(max-width: 900px) 90vw, 56vw' : '(max-width: 900px) 70vw, 36vw'}
          />
        </div>
      ))}
    </div>
  )
}
