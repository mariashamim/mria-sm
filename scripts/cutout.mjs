// Cut the Gemini renders out of their chroma-green background and export
// web-ready AVIF + WebP layers for the site.
//
//   node scripts/cutout.mjs            process everything in public/_raw
//   node scripts/cutout.mjs pose-hero  process one base name (and its -blink pair)
//
// Steps per image: estimate the background green from the corners, build an
// alpha matte from "greenness", un-premultiply the edge colours (so hair edges
// lose their green fringe), drop stray components (snowflakes, logos), trim
// to the figure, align blink variants to their base pose, resize to a shared
// height, and write public/avatar/<name>.{avif,webp} plus a manifest.

import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

//   node scripts/cutout.mjs --in public/_raw/scene --out public/scene --max-w 2400
//                                      process a different folder (the rooftop layers)

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : def
}
const RAW = path.resolve(opt('--in', 'public/_raw'))
const OUT = path.resolve(opt('--out', 'public/avatar'))
const MAX_H = Number(opt('--max-h', 1600))
const MAX_W = Number(opt('--max-w', 0)) || Infinity
const maxHeightFor = () => MAX_H

// Per-image overrides.
const OVERRIDES = {
  // A monitor crept into the left edge of this render; crop it away first.
  'pose-peek': { cropLeft: 0.16 },
  // The rooftop slab is real floor, not green; keep it (it is masked in CSS).
  'pose-loves': { keepFloor: true },
  // The desk lamp spills warm light onto the green; keep that haze warm, not green.
  'pose-letter': { warmGlow: true },
  // The skyline fades into a grey-green haze at the horizon: key more
  // aggressively and strip green from every pixel (nothing in a city is green).
  'city-skyline': { keyLo: 10, keyHi: 60, despillAll: true, noUnmix: true },
  // Gemini's day edit of the skyline pasted a ghost copy across the top 30%;
  // paint that band background-green before keying so it disappears.
  'city-skyline-day': { fillTop: 0.297 },
  // Clouds and a dusk airfield: soft, semi-transparent edges, and nothing in them is green.
  'cloud-1': { keyLo: 10, keyHi: 60, despillAll: true, noUnmix: true },
  'cloud-2': { keyLo: 10, keyHi: 60, despillAll: true, noUnmix: true },
  'cloud-3': { keyLo: 10, keyHi: 60, despillAll: true, noUnmix: true },
  'airfield-strip': { keyLo: 10, keyHi: 60, despillAll: true, noUnmix: true },
}

const argFilter = args.find((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--'))) || null

function greenness(r, g, b) {
  return g - Math.max(r, b)
}

async function loadRaw(file, matchTo = null) {
  let img = sharp(file).ensureAlpha()
  if (matchTo) {
    const meta = await img.metadata()
    if (meta.width !== matchTo.width || meta.height !== matchTo.height) {
      img = img.resize(matchTo.width, matchTo.height, { fit: 'fill', kernel: 'lanczos3' })
    }
  }
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

function estimateBackground(data, w, h) {
  // Sample a border strip (3% of the width) around the whole frame, keep the
  // purest-green quarter of those samples, and take their median. Corners are
  // often vignetted and the floor at the bottom is in shadow.
  const s = Math.max(8, Math.floor(w * 0.03))
  const step = 2
  const samples = []
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (x >= s && x < w - s && y >= s && y < h - s) continue
      const i = (y * w + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      samples.push({ r, g, b, gn: greenness(r, g, b) })
    }
  }
  samples.sort((p, q) => q.gn - p.gn)
  const top = samples.slice(0, Math.max(1, Math.floor(samples.length * 0.25)))
  const med = (k) => {
    const arr = top.map((c) => c[k]).sort((a, b) => a - b)
    return arr[Math.floor(arr.length / 2)]
  }
  return [med('r'), med('g'), med('b')]
}

function matte(data, w, h, bg, { keepFloor = false, warmGlow = false, keyLo, keyHi, despillAll = false, noUnmix = false } = {}) {
  const gBg = greenness(...bg)
  const bgLum = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]
  // Anything at least this green is background; anything below gFg is figure.
  const hi = keyHi ?? gBg - 18
  const lo = keyLo ?? Math.max(18, Math.min(40, gBg * 0.3))
  const out = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h * 4; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const gn = greenness(r, g, b)
    let a = 1 - Math.min(Math.max((gn - lo) / (hi - lo), 0), 1)
    // Green that is darker than the background is the floor shadow (or a soft
    // edge over it). Keep a little as a neutral contact shadow, unless the floor is real.
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    const isShadow = !keepFloor && a > 0 && a < 0.9 && gn > lo * 0.5 && lum < bgLum * 0.9
    if (isShadow) a = Math.min(a, 0.28)
    let fr = r
    let fg = g
    let fb = b
    if (a > 0 && a < 1 && !noUnmix) {
      // Un-premultiply against the background colour. (Skipped for hazy
      // skylines, where a translucent grey veil is the truthful result.)
      fr = Math.min(255, Math.max(0, (r - (1 - a) * bg[0]) / a))
      fg = Math.min(255, Math.max(0, (g - (1 - a) * bg[1]) / a))
      fb = Math.min(255, Math.max(0, (b - (1 - a) * bg[2]) / a))
    }
    if (isShadow) {
      // A shadow has no hue of its own: make it a dark neutral.
      const v = Math.min(fr, fg, fb) * 0.45
      fr = fg = fb = v
    } else if (gn > 8 && a < 0.995) {
      // Despill: an edge pixel of the figure is never greener than its other
      // channels. Pull green down and push the lost energy into the neighbours.
      const cap = Math.max(fr, fb)
      if (fg > cap) {
        const excess = fg - cap
        fg = cap
        fr = Math.min(255, fr + excess * 0.35)
        fb = Math.min(255, fb + excess * 0.35)
      }
    }
    if (despillAll && a > 0 && fg > (fr + fb) / 2) {
      // Cap green at the red/blue average so haze reads blue-grey, not green-grey.
      fg = (fr + fb) / 2
    }
    if (warmGlow && a > 0) {
      // Nothing in a lamp-lit scene is greener than its own red: the light
      // haze over the green becomes amber, while pink, skin, wood and paper
      // already satisfy the rule and are untouched.
      fg = Math.min(fg, Math.max(fr * 0.85, (fr + fb) / 2))
      if (a < 0.9) fb = Math.min(fb, fr * 0.5)
    }
    out[i] = fr
    out[i + 1] = fg
    out[i + 2] = fb
    out[i + 3] = Math.round(a * 255)
  }
  return out
}

// Opaque pixels right at the matte edge still carry green contamination that
// the greenness test cannot see (orange fur blended with green reads as olive,
// not green). Within a few pixels of any translucent pixel, cap green at the
// red/blue average, which leaves genuine oranges, skins, whites and blues alone.
function despillEdges(rgba, w, h, radius = 4) {
  const n = w * h
  const edge = new Uint8Array(n)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      const a = rgba[p * 4 + 3]
      if (a === 0 || a >= 250) continue
      // Mark the neighbourhood of every translucent pixel.
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= h) continue
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= w) continue
          edge[yy * w + xx] = 1
        }
      }
    }
  }
  for (let p = 0; p < n; p++) {
    if (!edge[p] || rgba[p * 4 + 3] === 0) continue
    const r = rgba[p * 4]
    const g = rgba[p * 4 + 1]
    const b = rgba[p * 4 + 2]
    const cap = (r + b) / 2
    if (g > cap) rgba[p * 4 + 1] = Math.round(cap)
  }
  return rgba
}

// Keep only the largest connected region of visible pixels (plus any region
// at least 3% of its size), so snowflakes and stray marks disappear.
function keepMainComponents(rgba, w, h, threshold = 24) {
  const n = w * h
  const label = new Int32Array(n).fill(-1)
  const sizes = []
  const stack = new Int32Array(n)
  for (let p = 0; p < n; p++) {
    if (label[p] !== -1 || rgba[p * 4 + 3] < threshold) continue
    const id = sizes.length
    let size = 0
    let sp = 0
    stack[sp++] = p
    label[p] = id
    while (sp > 0) {
      const q = stack[--sp]
      size++
      const x = q % w
      const nb = [q - 1, q + 1, q - w, q + w]
      for (let k = 0; k < 4; k++) {
        const r = nb[k]
        if (r < 0 || r >= n) continue
        if (k === 0 && x === 0) continue
        if (k === 1 && x === w - 1) continue
        if (label[r] !== -1 || rgba[r * 4 + 3] < threshold) continue
        label[r] = id
        stack[sp++] = r
      }
    }
    sizes.push(size)
  }
  if (sizes.length === 0) return rgba
  const largest = Math.max(...sizes)
  const keep = sizes.map((s) => s >= largest * 0.03)
  for (let p = 0; p < n; p++) {
    const id = label[p]
    if (id === -1 || !keep[id]) {
      // Also clear faint pixels that belong to no kept region.
      if (id === -1 && rgba[p * 4 + 3] >= threshold) continue
      rgba[p * 4 + 3] = 0
    }
  }
  // Second pass: faint pixels (below threshold) far from any kept region.
  // Cheap approach: clear faint pixels whose 4-neighbourhood has no kept label.
  for (let p = 0; p < n; p++) {
    const a = rgba[p * 4 + 3]
    if (a === 0 || a >= threshold) continue
    const x = p % w
    const nb = [p - 1, p + 1, p - w, p + w]
    let near = false
    for (let k = 0; k < 4; k++) {
      const r = nb[k]
      if (r < 0 || r >= n) continue
      if (k === 0 && x === 0) continue
      if (k === 1 && x === w - 1) continue
      const id = label[r]
      if (id !== -1 && keep[id]) {
        near = true
        break
      }
    }
    if (!near) rgba[p * 4 + 3] = 0
  }
  return rgba
}

// Smooth the alpha of soft regions (shadows) so JPEG noise in the green does
// not turn into speckle. Opaque figure pixels are left untouched.
function softenLowAlpha(rgba, w, h, passes = 2, radius = 2) {
  const n = w * h
  let src = new Float32Array(n)
  for (let p = 0; p < n; p++) src[p] = rgba[p * 4 + 3]
  const orig = src
  for (let pass = 0; pass < passes; pass++) {
    const dst = new Float32Array(n)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0
        let cnt = 0
        for (let dy = -radius; dy <= radius; dy++) {
          const yy = y + dy
          if (yy < 0 || yy >= h) continue
          for (let dx = -radius; dx <= radius; dx++) {
            const xx = x + dx
            if (xx < 0 || xx >= w) continue
            sum += src[yy * w + xx]
            cnt++
          }
        }
        dst[y * w + x] = sum / cnt
      }
    }
    src = dst
  }
  for (let p = 0; p < n; p++) {
    const a = orig[p]
    if (a > 0 && a < 140) {
      // Only soft pixels take the blurred value, and never become more opaque
      // than 60% of what the blur suggests, which keeps shadows light.
      rgba[p * 4 + 3] = Math.round(Math.min(a, src[p]))
    }
  }
  return rgba
}

function bbox(rgba, w, h, threshold = 8) {
  let x0 = w,
    y0 = h,
    x1 = -1,
    y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] >= threshold) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

async function processGroup(baseName, files) {
  const baseOverride = OVERRIDES[baseName] || {}
  const results = {}
  let rawDims = null
  // The base pose first; variants (blink) are resampled to the base's raw size,
  // because Gemini's edit step returns them at a different resolution.
  const order = ['base', ...Object.keys(files).filter((k) => k !== 'base')]
  for (const variant of order) {
    const file = files[variant]
    if (!file) continue
    // Variant-specific overrides (e.g. "city-skyline-day") layer on top of the base's.
    const override = { ...baseOverride, ...(variant === 'base' ? {} : OVERRIDES[`${baseName}-${variant}`] || {}) }
    let { data, width, height } = await loadRaw(file, variant === 'base' ? null : rawDims)
    if (variant === 'base') rawDims = { width, height }
    if (override.fillTop) {
      // Replace the top band with the background green so it keys out, without
      // changing the image size (variants must stay aligned to their base).
      const bgTop = estimateBackground(data, width, height)
      const rows = Math.floor(height * override.fillTop)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4
          data[i] = bgTop[0]
          data[i + 1] = bgTop[1]
          data[i + 2] = bgTop[2]
        }
      }
    }
    if (override.cropLeft) {
      const cut = Math.floor(width * override.cropLeft)
      const nw = width - cut
      const nd = Buffer.alloc(nw * height * 4)
      for (let y = 0; y < height; y++) {
        data.copy(nd, y * nw * 4, (y * width + cut) * 4, (y * width + width) * 4)
      }
      data = nd
      width = nw
    }
    const bg = estimateBackground(data, width, height)
    let rgba = matte(data, width, height, bg, override)
    rgba = despillEdges(rgba, width, height)
    rgba = keepMainComponents(rgba, width, height)
    rgba = softenLowAlpha(rgba, width, height)
    results[variant] = { rgba, width, height, bg, box: bbox(rgba, width, height) }
  }

  const base = results.base
  if (!base?.box) throw new Error(`${baseName}: nothing left after keying`)
  const pad = Math.round(base.box.h * 0.02)
  const crop = {
    left: Math.max(0, base.box.x0 - pad),
    top: Math.max(0, base.box.y0 - pad),
    width: Math.min(base.width, base.box.x1 + pad + 1) - Math.max(0, base.box.x0 - pad),
    height: Math.min(base.height, base.box.y1 + pad + 1) - Math.max(0, base.box.y0 - pad),
  }
  const scale = Math.min(1, maxHeightFor(baseName) / crop.height, MAX_W / crop.width)
  const outW = Math.round(crop.width * scale)
  const outH = Math.round(crop.height * scale)

  const manifest = {}
  for (const [variant, r] of Object.entries(results)) {
    let img = sharp(r.rgba, { raw: { width: r.width, height: r.height, channels: 4 } })
    if (variant === 'base') {
      img = img.extract(crop)
    } else {
      // Align the blink variant to the base by its own bounding box, then use
      // the base crop so both land on identical pixels.
      const b = r.box
      const dx = b ? Math.round(base.box.x0 + base.box.w / 2 - (b.x0 + b.w / 2)) : 0
      const dy = b ? Math.round(base.box.y1 - b.y1) : 0
      const shifted = Buffer.alloc(r.width * r.height * 4)
      for (let y = 0; y < r.height; y++) {
        const sy = y - dy
        if (sy < 0 || sy >= r.height) continue
        for (let x = 0; x < r.width; x++) {
          const sx = x - dx
          if (sx < 0 || sx >= r.width) continue
          const si = (sy * r.width + sx) * 4
          const di = (y * r.width + x) * 4
          shifted[di] = r.rgba[si]
          shifted[di + 1] = r.rgba[si + 1]
          shifted[di + 2] = r.rgba[si + 2]
          shifted[di + 3] = r.rgba[si + 3]
        }
      }
      const sizeDiff = b ? Math.abs(b.h - base.box.h) / base.box.h : 0
      img = sharp(shifted, { raw: { width: r.width, height: r.height, channels: 4 } }).extract(crop)
      if (sizeDiff > 0.03) console.warn(`  ! ${baseName}-${variant}: size differs from base by ${(sizeDiff * 100).toFixed(1)}%`)
    }
    img = img.resize(outW, outH, { fit: 'fill', kernel: 'lanczos3' })
    const name = variant === 'base' ? baseName : `${baseName}-${variant}`
    const png = await img.png().toBuffer()
    await sharp(png).webp({ quality: 84, alphaQuality: 90, effort: 5 }).toFile(path.join(OUT, `${name}.webp`))
    await sharp(png).avif({ quality: 56, effort: 6 }).toFile(path.join(OUT, `${name}.avif`))
    const [wb, av] = await Promise.all([fs.stat(path.join(OUT, `${name}.webp`)), fs.stat(path.join(OUT, `${name}.avif`))])
    manifest[name] = { width: outW, height: outH, webp: Math.round(wb.size / 1024), avif: Math.round(av.size / 1024) }
    console.log(`  ${name}: ${outW}×${outH}  webp ${Math.round(wb.size / 1024)}KB  avif ${Math.round(av.size / 1024)}KB  bg rgb(${r.bg.join(',')})`)
  }
  return manifest
}

async function main() {
  await fs.mkdir(OUT, { recursive: true })
  const entries = (await fs.readdir(RAW)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  const groups = {}
  for (const f of entries) {
    const stem = f.replace(/\.(jpe?g|png|webp)$/i, '')
    if (stem.startsWith('sheet-') || stem.startsWith('uniform') || stem.startsWith('outfit')) continue
    // "<base>-blink" and "<base>-day" are variants aligned to their base render.
    const m = stem.match(/^(.*)-(blink|day)$/)
    const base = m ? m[1] : stem
    if (argFilter && base !== argFilter) continue
    groups[base] ||= {}
    groups[base][m ? m[2] : 'base'] = path.join(RAW, f)
  }
  const manifestPath = path.join(OUT, 'manifest.json')
  let manifest = {}
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  } catch {}
  for (const [base, files] of Object.entries(groups)) {
    if (!files.base) {
      console.warn(`skipping ${base}: variant without a base`)
      continue
    }
    console.log(base)
    Object.assign(manifest, await processGroup(base, files))
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`manifest → ${path.relative(process.cwd(), manifestPath)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
