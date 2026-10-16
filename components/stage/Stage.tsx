'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { chapters } from '@/content/chapters'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { activeAt, clearStage, setStage, skyAt, type Segment } from '@/lib/stage'
import { buildChapterContent, buildHeroContent } from '@/lib/chapterTimelines'
import Rooftop from '@/components/scene/Rooftop'

type Props = { children: React.ReactNode }

/** How far a layer takes to form, to dissolve, and how far into a dissolve the next layer starts forming. */
const ENTER = 0.6
const EXIT = 0.7
const OVERLAP = 0.45

/**
 * One pinned viewport for the whole story. The sky (behind) and the rooftop
 * set (inside, persistent) are the world; the hero and every chapter are
 * layers that form in place from slightly smaller and softer, hold while
 * their own content plays, then dissolve away with depth as the next one is
 * already forming. The page never scrolls one chapter past another: the
 * scroll only moves the master timeline.
 *
 * The rooftop keeps its views: the full set under the hero, settling into the
 * city strip for 2007, gone for London through Hello, World, and back at
 * night for the chai and the letter.
 */
export default function Stage({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const reduced = prefersReducedMotion()
      const touch = isTouch()
      const layers = chapters
        .map((c) => ({ c, layer: el.querySelector<HTMLElement>(`[data-layer="${c.id}"]`) }))
        .filter((x): x is { c: (typeof chapters)[number]; layer: HTMLElement } => !!x.layer)
      const city = el.querySelector<HTMLElement>('.stage__roof .rooftop__layer--city')
      const cue = el.querySelector<HTMLElement>('.hero__cue')
      const setSky = useProgress.getState().setSky

      if (reduced) {
        el.classList.add('stage--static')
        layers.forEach(({ c, layer }) => (c.id === 'hero' ? buildHeroContent(layer, true) : buildChapterContent(layer, c, true)))
        cue?.classList.add('is-in')
        activateChapter(chapters[0])
        return
      }

      const totalViewports = chapters.reduce((sum, c) => sum + c.pin, 0)
      let lastActive = -1
      const master = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * totalViewports * (touch ? 0.7 : 1)}`,
          pin: true,
          scrub: touch ? 0.5 : 1,
          anticipatePin: 1,
          onUpdate: (self) => update(self.progress),
        },
      })

      const segments: Segment[] = []
      let t = 0
      layers.forEach(({ c, layer }, i) => {
        const isFirst = i === 0
        const isLast = i === layers.length - 1
        const content = c.id === 'hero' ? buildHeroContent(layer, false) : buildChapterContent(layer, c, false)
        // Forming: from slightly smaller and softer, like something coming into focus.
        if (isFirst) master.set(layer, { autoAlpha: 1, scale: 1, filter: 'blur(0px)' }, 0)
        else master.fromTo(layer, { autoAlpha: 0, scale: 0.94, filter: 'blur(8px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: ENTER, ease: 'power2.out' }, t)
        const bodyStart = isFirst ? 0 : t + ENTER * 0.35
        master.add(content, bodyStart)
        const bodyEnd = bodyStart + content.duration()
        // Dissolving: toward the viewer and out of focus, while the next layer is already forming.
        if (!isLast) master.to(layer, { autoAlpha: 0, scale: 1.06, filter: 'blur(10px)', duration: EXIT, ease: 'power2.in' }, bodyEnd)
        segments.push({ id: c.id, index: c.index, start: t, bodyStart, bodyEnd, end: isLast ? bodyEnd : bodyEnd + EXIT })
        t = bodyEnd + EXIT * OVERLAP
      })

      // The rooftop's views, keyed to the chapters that use them.
      const seg = (id: string) => segments.find((s) => s.id === id)
      const hero = seg('hero')
      const karachi = seg('karachi')
      const hello = seg('hello')
      if (hero && karachi) {
        // The near wall and the roof slab drop out of frame and the city settles into its strip.
        const span = karachi.bodyStart - hero.bodyEnd
        master.to(el, { '--to-strip': 1, duration: span, ease: 'power2.inOut' }, hero.bodyEnd)
        // They also fade as they sink: on wide screens the sink alone left the
        // clothesline's pole peeking into the bottom right corner of every chapter.
        const near = [el.querySelector<HTMLElement>('.stage__roof .rooftop__layer--fore'), el.querySelector<HTMLElement>('.stage__roof .rooftop__layer--parapet')].filter(
          (n): n is HTMLElement => !!n,
        )
        if (near.length) master.to(near, { autoAlpha: 0, duration: span * 0.7, ease: 'power1.in' }, hero.bodyEnd)
      }
      if (city && karachi) master.to(city, { autoAlpha: 0, duration: EXIT, ease: 'power1.inOut' }, karachi.bodyEnd)
      if (city && hello) master.to(city, { autoAlpha: 1, duration: ENTER, ease: 'power1.inOut' }, hello.bodyEnd + EXIT * OVERLAP)

      const duration = master.duration()
      const update = (progress: number) => {
        const time = progress * duration
        setSky(skyAt(time))
        cue?.classList.toggle('is-gone', time > 0.06)
        const active = activeAt(time)
        if (active !== lastActive) {
          lastActive = active
          activateChapter(chapters[active])
        }
      }
      if (master.scrollTrigger) setStage(master.scrollTrigger, segments, duration)
      if (process.env.NODE_ENV !== 'production') {
        ;(window as unknown as { __stage?: unknown }).__stage = { master, segments, duration }
      }
      update(0)
      return () => clearStage()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="stage">
      <Rooftop layers={['city', 'fore']} size="hero" className="stage__roof" />
      <Rooftop layers={['parapet']} size="hero" className="stage__roof stage__roof--front" />
      {children}
    </div>
  )
}
