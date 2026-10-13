/**
 * The intro's jet: a stylised fighter built from geometry in code, lit to
 * match the rooftop render (cool navy from above, warm amber from the city),
 * flying a straight line at constant height from left to right across the
 * sky. The line only bows toward the camera so the jet is closest, and
 * largest, in the middle. A particle contrail hangs behind it.
 *
 * three.js is imported lazily, so the site pays for it only during the intro.
 */

export type FlybyHandle = {
  /** 0 = just off the left edge, 1 = gone off the right edge. */
  setT: (t: number) => void
  dispose: () => void
}

export async function createFlyby(canvas: HTMLCanvasElement): Promise<FlybyHandle> {
  const THREE = await import('three')

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 400)
  camera.position.set(0, 0, 0)
  camera.lookAt(0, 0.2, -1)

  scene.add(new THREE.HemisphereLight(0x3d5296, 0xb07a3a, 0.5))
  const key = new THREE.DirectionalLight(0xcfe3ff, 0.85)
  key.position.set(-3, 6, 2)
  const warm = new THREE.DirectionalLight(0xffb457, 0.45)
  warm.position.set(1.5, -4, 3)
  const rim = new THREE.DirectionalLight(0x9fc8ff, 0.4)
  rim.position.set(4, 2, -6)
  scene.add(key, warm, rim)

  const body = new THREE.MeshStandardMaterial({ color: 0x626d8f, metalness: 0.6, roughness: 0.5 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a3150, metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide })
  const glass = new THREE.MeshStandardMaterial({ color: 0x3f64c8, metalness: 0.9, roughness: 0.12, transparent: true, opacity: 0.92 })
  const stripe = new THREE.MeshStandardMaterial({ color: 0x1d6b3a, metalness: 0.4, roughness: 0.55 })

  const jet = new THREE.Group()
  // Fuselage: a lathe along the length (local +X is the nose).
  const profile = [
    [2.85, 0.01], [2.55, 0.09], [2.1, 0.2], [1.5, 0.3], [0.7, 0.36], [-0.3, 0.37], [-1.2, 0.35], [-2.0, 0.3], [-2.55, 0.25], [-2.8, 0.2],
  ].map(([x, r]) => new THREE.Vector2(r, x))
  const fuselage = new THREE.Mesh(new THREE.LatheGeometry(profile, 36), body)
  fuselage.rotation.z = -Math.PI / 2
  jet.add(fuselage)
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.17, 0.3, 24, 1, true), dark)
  nozzle.rotation.z = Math.PI / 2
  nozzle.position.x = -2.9
  jet.add(nozzle)
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), glass)
  canopy.scale.set(0.72, 0.24, 0.27)
  canopy.position.set(1.15, 0.3, 0)
  jet.add(canopy)
  const spine = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.34), body)
  spine.position.set(-0.2, 0.32, 0)
  jet.add(spine)
  // Wings: a swept trapezoid extruded thin, mirrored.
  const wingShape = new THREE.Shape()
  wingShape.moveTo(0.75, 0.3)
  wingShape.lineTo(-0.85, 2.35)
  wingShape.lineTo(-1.55, 2.35)
  wingShape.lineTo(-1.75, 0.3)
  wingShape.closePath()
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 })
  const wingR = new THREE.Mesh(wingGeo, body)
  wingR.rotation.x = Math.PI / 2
  wingR.position.y = -0.02
  const wingL = wingR.clone()
  wingL.scale.z = -1
  jet.add(wingR, wingL)
  const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 10)
  for (const z of [2.35, -2.35]) {
    const rail = new THREE.Mesh(railGeo, dark)
    rail.rotation.z = Math.PI / 2
    rail.position.set(-1.2, 0, z)
    jet.add(rail)
  }
  for (const s of [1, -1]) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.5), stripe)
    st.position.set(-1.0, 0.055, s * 0.75)
    jet.add(st)
  }
  // Tailplanes and fin.
  const tailShape = new THREE.Shape()
  tailShape.moveTo(-1.75, 0.25)
  tailShape.lineTo(-2.35, 1.05)
  tailShape.lineTo(-2.75, 1.05)
  tailShape.lineTo(-2.8, 0.25)
  tailShape.closePath()
  const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.05, bevelEnabled: false })
  const tailR = new THREE.Mesh(tailGeo, body)
  tailR.rotation.x = Math.PI / 2
  tailR.position.y = 0.05
  const tailL = tailR.clone()
  tailL.scale.z = -1
  jet.add(tailR, tailL)
  const finShape = new THREE.Shape()
  finShape.moveTo(-1.55, 0.3)
  finShape.lineTo(-2.3, 1.35)
  finShape.lineTo(-2.7, 1.35)
  finShape.lineTo(-2.75, 0.3)
  finShape.closePath()
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, { depth: 0.06, bevelEnabled: false }), body)
  fin.position.z = -0.03
  jet.add(fin)
  for (const s of [1, -1]) {
    const intake = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 0.3), dark)
    intake.position.set(0.25, -0.06, s * 0.46)
    jet.add(intake)
  }

  // A soft radial sprite for glows and the contrail.
  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = glowCanvas.height = 128
  const g = glowCanvas.getContext('2d')
  if (g) {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.4, 'rgba(255,255,255,0.45)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
  }
  const glowTex = new THREE.CanvasTexture(glowCanvas)
  glowTex.colorSpace = THREE.SRGBColorSpace

  // Afterburner: flame cone, core glow, a point light; wing-tip nav lights.
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.9, 20, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff8a3c, transparent: true, opacity: 0.75, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  flame.rotation.z = Math.PI / 2
  flame.position.x = -3.35
  jet.add(flame)
  const burnerGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb073, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }))
  burnerGlow.scale.set(1.3, 1.3, 1)
  burnerGlow.position.x = -3.0
  jet.add(burnerGlow)
  const burnerLight = new THREE.PointLight(0xff9a4a, 30, 9, 2)
  burnerLight.position.x = -3.1
  jet.add(burnerLight)
  const navR = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x53ff7a, blending: THREE.AdditiveBlending, depthWrite: false }))
  navR.scale.set(0.35, 0.35, 1)
  navR.position.set(-1.2, 0, 2.38)
  const navL = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff5b5b, blending: THREE.AdditiveBlending, depthWrite: false }))
  navL.scale.set(0.35, 0.35, 1)
  navL.position.set(-1.2, 0, -2.38)
  jet.add(navR, navL)
  scene.add(jet)

  // Farther and higher: a clean silhouette well above the city, about a sixth of the frame wide at its closest.
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-42, 9.8, -42),
    new THREE.Vector3(-17, 8.6, -27),
    new THREE.Vector3(0, 8.2, -22),
    new THREE.Vector3(17, 8.6, -27),
    new THREE.Vector3(42, 9.8, -42),
  ])

  // Contrail particles.
  const POOL = 320
  type Puff = { life: number; max: number; size: number }
  const puffs: { sprite: InstanceType<typeof THREE.Sprite>; data: Puff }[] = []
  for (let i = 0; i < POOL; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xf3efe6, transparent: true, opacity: 0.5, depthWrite: false }))
    sprite.visible = false
    scene.add(sprite)
    puffs.push({ sprite, data: { life: 0, max: 1, size: 1 } })
  }
  let nextPuff = 0
  const emit = (pos: InstanceType<typeof THREE.Vector3>) => {
    for (let k = 0; k < 2; k++) {
      const p = puffs[nextPuff]
      nextPuff = (nextPuff + 1) % POOL
      p.sprite.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2))
      p.data.life = 0
      p.data.max = 4.5 + Math.random()
      p.data.size = 1.15
      p.sprite.visible = true
    }
  }
  const clearPuffs = () => {
    for (const p of puffs) p.sprite.visible = false
  }

  const state = { t: 0 }
  const tangent = new THREE.Vector3()
  const pos = new THREE.Vector3()
  const xAxis = new THREE.Vector3(1, 0, 0)
  const tail = new THREE.Vector3()
  let lastT = -1
  let prevTime = performance.now()
  let raf = 0
  let disposed = false

  // The horizontal field of view stays near 80° on wide screens; on a phone the
  // vertical one is capped so the jet is not stretched.
  const fit = () => {
    // The canvas always covers the viewport; sizing from the window (and
    // writing the CSS size) keeps it independent of the stylesheet.
    const w = window.innerWidth || 1
    const h = window.innerHeight || 1
    renderer.setSize(w, h, true)
    camera.aspect = w / h
    const vfov = (2 * Math.atan(Math.tan((80 * Math.PI) / 360) / camera.aspect) * 180) / Math.PI
    camera.fov = Math.min(75, Math.max(50, vfov))
    camera.updateProjectionMatrix()
  }
  fit()
  window.addEventListener('resize', fit)

  const frame = (now: number) => {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - prevTime) / 1000)
    prevTime = now
    const t = Math.min(0.999, Math.max(0, state.t))
    if (t < lastT - 0.001) clearPuffs()
    path.getPointAt(t, pos)
    path.getTangentAt(t, tangent)
    jet.position.copy(pos)
    jet.quaternion.setFromUnitVectors(xAxis, tangent)
    // A touch of bank through the middle, wings level at the edges.
    jet.rotateX(0.22 * Math.sin(Math.PI * t))
    flame.scale.set(1, 1.0 + Math.random() * 0.14, 1)
    if (t > lastT && t > 0.002 && t < 0.998) {
      tail.set(-2.9, 0, 0).applyQuaternion(jet.quaternion).add(jet.position)
      emit(tail)
    }
    lastT = t
    for (const p of puffs) {
      if (!p.sprite.visible) continue
      p.data.life += dt
      const k = p.data.life / p.data.max
      if (k >= 1) {
        p.sprite.visible = false
        continue
      }
      const sz = p.data.size * (0.6 + k * 1.3)
      p.sprite.scale.set(sz, sz, 1)
      p.sprite.material.opacity = 0.42 * (1 - k) * (1 - k)
    }
    // The roar: a faint shake of the camera as it passes closest.
    const near = Math.max(0, 1 - Math.abs(t - 0.5) / 0.14)
    camera.position.set((Math.random() - 0.5) * 0.02 * near, (Math.random() - 0.5) * 0.02 * near, 0)
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  return {
    setT: (t) => {
      state.t = t
    },
    dispose: () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
      scene.traverse((obj) => {
        const mesh = obj as { geometry?: { dispose: () => void }; material?: { dispose: () => void } }
        mesh.geometry?.dispose?.()
        mesh.material?.dispose?.()
      })
      glowTex.dispose()
      renderer.dispose()
    },
  }
}
