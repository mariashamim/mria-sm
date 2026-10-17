'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { chapters } from '@/content/chapters'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/gsap'
import { activateChapter, useProgress } from '@/lib/progress'
import { activeAt, clearStage, scrollToChapter, setStage, skyAt, type Segment } from '@/lib/stage'
import { useUI } from '@/lib/ui'
import { buildChapterContent, buildHeroContent } from '@/lib/chapterTimelines'
import { enterOf, exitOf } from '@/lib/transitions'
import { buildFly, buildInk } from '@/lib/setpieces'
import Fx from '@/components/stage/Fx'
import Rooftop from '@/components/scene/Rooftop'

type Props = { children: React.ReactNode }

/**
 * A #chapter in the address lands on that chapter once the intro has let the
 * page go (the intro stops the scroll while it plays). Returns a cleanup.
 */
function deepLink(ids: string[]): () => void {
  const id = window.location.hash.slice(1)
  if (!id || !ids.includes(id)) return () => {}
  // Straight there, like an anchor; a 1.6 s glide from the top would look like a glitch.
  // The router also scrolls to the hash's element right after hydration, which lands at
  // the top of the pinned stage, so the jump is repeated until it sticks.
  const jump = () => scrollToChapter(id, { immediate: true })
  const schedule = () => {
    const timers = [60, 400, 1000].map((ms) => setTimeout(jump, ms))
    return () => timers.forEach(clearTimeout)
  }
  if (useUI.getState().introDone) return schedule()
  let cancel: (() => void) | null = null
  const unsubscribe = useUI.subscribe((s) => {
    if (!s.introDone) return
    unsubscribe()
    cancel = schedule()
  })
  return () => {
    unsubscribe()
    cancel?.()
  }
}

/**
 * One pinned viewport for the whole story. The sky (behind) and the rooftop
 * set (inside, persistent) are the world; the hero and every chapter are
 * layers that form in place from slightly smaller and softer, hold while
 * their own content plays, then dissolve away with depth as the next one is
 * already forming. The page never scrolls one chapter past another: the
 * scroll only moves the master timeline.
 *
 * The rooftop keeps its views: the full set under the hero (which first tilts
 * up toward the sky), settling into the city strip for 2007 while its windows
 * light, gone for London through Hello, World, the strip back at night for the
 * chai, and the whole roof again at dawn for the letter.
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
        return deepLink(layers.map((l) => l.c.id))
      }

      let lastActive = -1
      // The master's length in viewports, known once every chapter is added (refreshed below).
      let viewports = 1
      const master = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          // One unit of master time is one viewport of scroll (a little less on touch).
          end: () => `+=${window.innerHeight * viewports * (touch ? 0.7 : 1)}`,
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
        // The chapter's own pace: its content plays over exactly `scroll` viewports.
        content.timeScale(content.duration() / c.scroll)
        // Each chapter forms and leaves its own way (lib/transitions.ts); master time is in viewports.
        const enter = enterOf(c.id)
        const exit = exitOf(c.id)
        if (isFirst) master.set(layer, { autoAlpha: 1, scale: 1 }, 0)
        else enter.build(master, layer, t, enter.dur)
        const bodyStart = isFirst ? 0 : t + enter.dur * enter.body
        master.add(content, bodyStart)
        const bodyEnd = bodyStart + c.scroll
        if (!isLast) exit.build(master, layer, bodyEnd, exit.dur)
        segments.push({ id: c.id, index: c.index, start: t, bodyStart, bodyEnd, end: isLast ? bodyEnd : bodyEnd + exit.dur })
        t = bodyEnd + exit.dur * exit.lead
      })

      // The rooftop's views, keyed to the chapters that use them.
      const seg = (id: string) => segments.find((s) => s.id === id)
      const hero = seg('hero')
      const karachi = seg('karachi')
      const hello = seg('hello')
      const letter = seg('letter')
      const karsaz = seg('karsaz')
      // The set pieces across boundaries, on the effects layer.
      if (hero) buildInk(master, el, hero.bodyEnd, exitOf('hero').dur)
      if (karsaz) buildFly(master, el, karsaz.bodyEnd, exitOf('karsaz').dur)
      const near = [el.querySelector<HTMLElement>('.stage__roof .rooftop__layer--fore'), el.querySelector<HTMLElement>('.stage__roof .rooftop__layer--parapet')].filter(
        (n): n is HTMLElement => !!n,
      )
      // The first thing the scroll does is look up: the roof and Maria sink a little
      // (CSS reads --look, by depth) and the sky opens above them, before anything leaves.
      if (hero) master.to(el, { '--look': 1, duration: hero.bodyEnd * 0.45, ease: 'power1.inOut' }, 0)
      if (hero && karachi) {
        // The near wall and the roof slab drop out of frame and the city settles into its strip.
        const span = karachi.bodyStart - hero.bodyEnd
        master.to(el, { '--to-strip': 1, duration: span, ease: 'power2.inOut' }, hero.bodyEnd)
        // They also fade as they sink: on wide screens the sink alone left the
        // clothesline's pole peeking into the bottom right corner of every chapter.
        if (near.length) master.to(near, { autoAlpha: 0, duration: span * 0.7, ease: 'power1.in' }, hero.bodyEnd)
      }
      if (city && karachi) master.to(city, { autoAlpha: 0, duration: 0.55, ease: 'power1.inOut' }, karachi.bodyEnd)
      if (city && hello) master.to(city, { autoAlpha: 1, duration: 0.45, ease: 'power1.inOut' }, hello.bodyEnd + 0.25)
      // The letter is read on the roof from the opening, at dawn this time: the
      // whole set comes back up and she looks level again (lib/chapterTimelines.ts
      // and the letter scene finish the frame).
      if (letter) {
        // Behind the letter's room, near its end, so the closing opens on the roof.
        const back = letter.bodyStart + (letter.bodyEnd - letter.bodyStart) * 0.8
        const span = (letter.bodyEnd - letter.bodyStart) * 0.15
        master.to(el, { '--to-strip': 0, '--look': 0, duration: span, ease: 'power2.inOut' }, back)
        // The roof slab only: the near parapet would stand in front of the card and its doors.
        const slab = near.filter((n) => n.classList.contains('rooftop__layer--fore'))
        if (slab.length) master.to(slab, { autoAlpha: 1, duration: span * 0.8, ease: 'power1.out' }, back + span * 0.2)
      }

      const duration = master.duration()
      viewports = duration
      const update = (progress: number) => {
        const time = progress * duration
        setSky(skyAt(time))
        cue?.classList.toggle('is-gone', time > 0.06)
        const active = activeAt(time)
        if (active !== lastActive) {
          const first = lastActive === -1
          lastActive = active
          activateChapter(chapters[active])
          // The address follows the chapter, so a refresh or a shared link lands here.
          if (!first) history.replaceState(null, '', active === 0 ? `${location.pathname}${location.search}` : `#${chapters[active].id}`)
        }
      }
      // Now that the length is known, measure the pin again (after update exists: refresh calls onUpdate).
      master.scrollTrigger?.refresh()
      if (master.scrollTrigger) setStage(master.scrollTrigger, segments, duration)
      if (process.env.NODE_ENV !== 'production') {
        ;(window as unknown as { __stage?: unknown }).__stage = { master, segments, duration }
      }
      const unsubscribe = deepLink(segments.map((s) => s.id))
      update(0)
      return () => {
        unsubscribe()
        clearStage()
      }
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="stage">
      <Rooftop layers={['city', 'fore']} size="hero" className="stage__roof" windows />
      <Rooftop layers={['parapet']} size="hero" className="stage__roof stage__roof--front" />
      {children}
      <Fx />
    </div>
  )
}
