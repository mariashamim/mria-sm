// Contact sheet of a shots.mjs run (AT=0.05,0.5,0.95): one row per chapter, start / middle / end.
//   node scripts/sheet.mjs <shotsDir> <width> <out.jpg> [cellWidth=360]
import sharp from 'sharp'
import fs from 'node:fs'
const [dir, w, out, cw = '360'] = process.argv.slice(2)
const ids = ['hero','karachi','london','home','karsaz','sky','hello','loves','letter']
const ats = ['05','50','95']
const CW = Number(cw)
const meta = await sharp(`${dir}/${w}-hero-05.jpg`).metadata()
const CH = Math.round(CW * meta.height / meta.width)
const comps = []
for (const [r, id] of ids.entries()) for (const [c, a] of ats.entries()) {
  const f = `${dir}/${w}-${id}-${a}.jpg`
  if (!fs.existsSync(f)) continue
  comps.push({ input: await sharp(f).resize(CW, CH).toBuffer(), left: c * (CW + 6), top: r * (CH + 6) })
}
await sharp({ create: { width: 3 * (CW + 6), height: ids.length * (CH + 6), channels: 3, background: '#f0f' } }).composite(comps).jpeg({ quality: 80 }).toFile(out)
