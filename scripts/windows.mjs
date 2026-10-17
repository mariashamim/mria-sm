// Finds the lit windows in the night city render and writes their positions
// (fractions of the render) to components/scene/windows.json, for the 2007
// chapter's windows that switch on one by one.
//   node scripts/windows.mjs [count=56]
import sharp from 'sharp'
import fs from 'node:fs/promises'

const COUNT = Number(process.argv[2] || 56)
const night = await sharp('public/scene/city-skyline.webp').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const day = await sharp('public/scene/city-skyline-day.webp').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = night.info
const CELL = 14
const cells = []
for (let cy = 0; cy + CELL <= H; cy += CELL) {
  for (let cx = 0; cx + CELL <= W; cx += CELL) {
    let best = 0
    let bx = 0
    let by = 0
    for (let y = cy; y < cy + CELL; y++) {
      for (let x = cx; x < cx + CELL; x++) {
        const i = (y * W + x) * 4
        const [r, g, b, a] = [night.data[i], night.data[i + 1], night.data[i + 2], night.data[i + 3]]
        if (a < 250) continue
        // Warm and bright at night, and much brighter than the same spot by day: a lamp, not a wall.
        const lum = 0.3 * r + 0.6 * g + 0.1 * b
        const dayLum = 0.3 * day.data[i] + 0.6 * day.data[i + 1] + 0.1 * day.data[i + 2]
        const score = r > 150 && g > 95 && r > b + 40 ? lum - dayLum * 0.35 : 0
        if (score > best) {
          best = score
          bx = x
          by = y
        }
      }
    }
    if (best > 60) cells.push({ x: bx / W, y: by / H, s: best })
  }
}
// The brightest, spread out: no two closer than ~2.5% of the width.
cells.sort((a, b) => b.s - a.s)
const picked = []
for (const c of cells) {
  if (picked.length >= COUNT) break
  if (picked.every((p) => Math.hypot((p.x - c.x) * W, (p.y - c.y) * H) > W * 0.025)) picked.push(c)
}
// Switch-on order: left to right with a little shuffle, so it reads as a street waking up.
picked.sort((a, b) => a.x - b.x)
const out = picked.map((p) => [+p.x.toFixed(4), +p.y.toFixed(4)])
await fs.writeFile('components/scene/windows.json', JSON.stringify(out) + '\n')
console.log(`${cells.length} candidates, wrote ${out.length}; y range ${Math.min(...out.map((o) => o[1])).toFixed(2)}–${Math.max(...out.map((o) => o[1])).toFixed(2)}`)
