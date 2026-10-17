// Contact sheet of a shots.mjs run (AT=0.05,0.5,0.95): one row per chapter, start / middle / end.
//   AT=0.05,0.5,0.95 node scripts/sheet.mjs <shotsDir> <width> <out.jpg> [cellWidth=360]  (same AT as the shots)
import sharp from 'sharp'
import fs from 'node:fs'
const [dir, w, out, cw = '360'] = process.argv.slice(2)
const ids = ['hero','karachi','london','home','school','karsaz','sky','hello','loves','explore','letter','closing']
const ats = (process.env.AT || '0.05,0.5,0.95').split(',').map((a) => String(Math.round(Number(a) * 100)).padStart(2, '0'))
const CW = Number(cw)
const meta = await sharp(`${dir}/${w}-hero-${ats[0]}.jpg`).metadata()
const CH = Math.round(CW * meta.height / meta.width)
const comps = []
for (const [r, id] of ids.entries()) for (const [c, a] of ats.entries()) {
  const f = `${dir}/${w}-${id}-${a}.jpg`
  if (!fs.existsSync(f)) continue
  comps.push({ input: await sharp(f).resize(CW, CH).toBuffer(), left: c * (CW + 6), top: r * (CH + 6) })
}
await sharp({ create: { width: 3 * (CW + 6), height: ids.length * (CH + 6), channels: 3, background: '#f0f' } }).composite(comps).jpeg({ quality: 80 }).toFile(out)
