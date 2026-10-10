'use client'

import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { useProgress } from '@/lib/progress'
import { blendSky, skyToCss } from '@/lib/sky'
import { prefersReducedMotion } from '@/lib/gsap'
import { FRAG, VERT } from './shaders'

/**
 * One full-screen WebGL quad behind the whole page. It reads the continuous
 * sky value from the progress store every frame and eases toward it, so the
 * sky always trails the scroll by a beat. Falls back to a CSS gradient.
 */
export default function SkyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    let renderer: Renderer | null = null
    try {
      renderer = new Renderer({
        canvas,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      })
    } catch {
      renderer = null
    }

    if (!renderer || !renderer.gl) {
      // CSS fallback: keep the body gradient in step with the store.
      document.documentElement.classList.add('no-webgl')
      const apply = (s: number) => document.documentElement.style.setProperty('--sky-fallback', skyToCss(s))
      apply(useProgress.getState().sky)
      const unsub = useProgress.subscribe((st) => apply(st.sky))
      return () => {
        unsub()
        document.documentElement.classList.remove('no-webgl')
      }
    }

    const gl = renderer.gl
    const geometry = new Triangle(gl)
    const uniforms = {
      uRes: { value: [1, 1] as [number, number] },
      uTime: { value: 0 },
      uTop: { value: [0, 0, 0] as [number, number, number] },
      uMid: { value: [0, 0, 0] as [number, number, number] },
      uHor: { value: [0, 0, 0] as [number, number, number] },
      uSun: { value: [0.5, 0, 0] as [number, number, number] },
      uSunCol: { value: [1, 1, 1] as [number, number, number] },
      uStars: { value: 0 },
      uSnow: { value: 0 },
      uCity: { value: 0 },
      uGrain: { value: 0.045 },
    }
    const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms })
    const mesh = new Mesh(gl, { geometry, program })

    const r = renderer
    const resize = () => {
      r.setSize(window.innerWidth, window.innerHeight)
      uniforms.uRes.value = [gl.canvas.width, gl.canvas.height]
    }
    resize()
    window.addEventListener('resize', resize)

    const reduced = prefersReducedMotion()
    const start = performance.now()
    let current = useProgress.getState().sky
    let raf = 0

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const target = useProgress.getState().sky
      current += (target - current) * 0.08
      const u = blendSky(current)
      uniforms.uTop.value = u.top
      uniforms.uMid.value = u.mid
      uniforms.uHor.value = u.hor
      uniforms.uSun.value = u.sun
      uniforms.uSunCol.value = u.sunCol
      uniforms.uStars.value = u.stars
      uniforms.uSnow.value = u.snow
      uniforms.uCity.value = u.city
      uniforms.uTime.value = reduced ? 10 : (now - start) / 1000
      r.render({ scene: mesh })
    }
    raf = requestAnimationFrame(loop)

    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={ref} className="sky" aria-hidden="true" />
}
