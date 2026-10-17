import type { SkyKeyframe } from '@/content/chapters'

/**
 * The sky is a float in [0, 10]. Whole numbers are the stops below; the shader
 * (and the CSS fallback) blend linearly between adjacent stops.
 * Stop 9 equals stop 0 so the letter chapter returns the sky to pre-dawn, and
 * stop 10 equals stop 1, so it goes on into the dawn the hero ended on.
 */
export type SkyStop = {
  name: string
  top: string
  mid: string
  hor: string
  /** sun or moon: x (0..1 left→right), y (0..1 bottom→top), intensity */
  sun: [number, number, number]
  sunCol: string
  stars: number
  snow: number
  /** warm amber band at the horizon: the city, lit */
  city: number
  /** how much the rooftop layers show their daylight render (0 night, 1 full day) */
  day: number
}

const DAWN: SkyStop = { name: 'dawn', top: '#F6E7D2', mid: '#F4B183', hor: '#E58A5A', sun: [0.5, 0.06, 0.9], sunCol: '#FFD9A0', stars: 0, snow: 0, city: 0, day: 0.55 }

const PREDAWN: SkyStop = {
  name: 'predawn',
  top: '#0A0F2C',
  mid: '#1C2A55',
  hor: '#3A2E5C',
  sun: [0.62, 0.0, 0.35],
  sunCol: '#FFB457',
  stars: 0.8,
  snow: 0,
  city: 0.55,
  day: 0,
}

export const SKY_STOPS: SkyStop[] = [
  PREDAWN,
  DAWN,
  { name: 'grey', top: '#E8EBEF', mid: '#C9CED6', hor: '#9FA8B3', sun: [0.5, 0.55, 0.12], sunCol: '#FFFFFF', stars: 0, snow: 1, city: 0, day: 0.85 },
  { name: 'noon', top: '#5DB9F2', mid: '#8ED0F8', hor: '#FFFFFF', sun: [0.72, 0.92, 0.75], sunCol: '#FFF4C2', stars: 0, snow: 0, city: 0, day: 1 },
  { name: 'golden', top: '#F7B74A', mid: '#E8822E', hor: '#FFF1D6', sun: [0.8, 0.14, 1.0], sunCol: '#FFD27A', stars: 0, snow: 0, city: 0, day: 0.9 },
  { name: 'dusk', top: '#6B4A7A', mid: '#3B2F57', hor: '#1B1730', sun: [0.5, 0.04, 0.5], sunCol: '#FF8A5C', stars: 0.2, snow: 0, city: 0.15, day: 0.3 },
  { name: 'storm', top: '#08060D', mid: '#0B0912', hor: '#120E1A', sun: [0.5, 0.0, 0.0], sunCol: '#000000', stars: 0.25, snow: 0, city: 0, day: 0 },
  { name: 'bluehour', top: '#0E1B3F', mid: '#15306B', hor: '#1F3F7A', sun: [0.2, 0.82, 0.3], sunCol: '#CFE3FF', stars: 0.7, snow: 0, city: 0.5, day: 0.08 },
  { name: 'night', top: '#0A1230', mid: '#101C45', hor: '#2A2250', sun: [0.25, 0.86, 0.35], sunCol: '#DCE8FF', stars: 0.9, snow: 0, city: 1.0, day: 0 },
  { ...PREDAWN, name: 'predawn-return' },
  { ...DAWN, name: 'dawn-return' },
]

export type RGB = [number, number, number]

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const RGB_STOPS = SKY_STOPS.map((s) => ({
  top: hexToRgb(s.top),
  mid: hexToRgb(s.mid),
  hor: hexToRgb(s.hor),
  sunCol: hexToRgb(s.sunCol),
}))

export type SkyUniforms = {
  top: RGB
  mid: RGB
  hor: RGB
  sun: [number, number, number]
  sunCol: RGB
  stars: number
  snow: number
  city: number
  day: number
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

/** Blend the sky stops for a continuous sky value in [0, 10]. */
export function blendSky(s: number): SkyUniforms {
  const max = SKY_STOPS.length - 1
  const v = Math.min(Math.max(s, 0), max)
  const i = Math.min(Math.floor(v), max - 1)
  const t = v - i
  const a = SKY_STOPS[i]
  const b = SKY_STOPS[i + 1]
  const ra = RGB_STOPS[i]
  const rb = RGB_STOPS[i + 1]
  return {
    top: lerp3(ra.top, rb.top, t),
    mid: lerp3(ra.mid, rb.mid, t),
    hor: lerp3(ra.hor, rb.hor, t),
    sun: [lerp(a.sun[0], b.sun[0], t), lerp(a.sun[1], b.sun[1], t), lerp(a.sun[2], b.sun[2], t)],
    sunCol: lerp3(ra.sunCol, rb.sunCol, t),
    stars: lerp(a.stars, b.stars, t),
    snow: lerp(a.snow, b.snow, t),
    city: lerp(a.city, b.city, t),
    day: lerp(a.day, b.day, t),
  }
}

const toCss = (c: RGB) => `rgb(${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)})`

/** CSS gradient equivalent of the shader, used when WebGL is unavailable. */
export function skyToCss(s: number): string {
  const u = blendSky(s)
  return `linear-gradient(to top, ${toCss(u.hor)} 0%, ${toCss(u.mid)} 45%, ${toCss(u.top)} 100%)`
}

/** Piecewise-linear sky value for a chapter's local progress. */
export function interpolateKeyframes(kf: SkyKeyframe[], p: number): number {
  if (kf.length === 0) return 0
  if (p <= kf[0].at) return kf[0].stop
  for (let i = 1; i < kf.length; i++) {
    const a = kf[i - 1]
    const b = kf[i]
    if (p <= b.at) {
      const t = b.at === a.at ? 1 : (p - a.at) / (b.at - a.at)
      return a.stop + (b.stop - a.stop) * t
    }
  }
  return kf[kf.length - 1].stop
}
