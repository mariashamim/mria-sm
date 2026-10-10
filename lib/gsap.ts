import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export { gsap, ScrollTrigger, SplitText }

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isTouch(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}
