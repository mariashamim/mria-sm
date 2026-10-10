import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin)
  ScrollTrigger.config({ ignoreMobileResize: true })
  if (process.env.NODE_ENV !== 'production') {
    ;(window as unknown as { __st?: typeof ScrollTrigger }).__st = ScrollTrigger
  }
}

export { gsap, ScrollTrigger, SplitText }

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isTouch(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}
