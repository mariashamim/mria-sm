// Compose the social preview image (1200×630) from the hero scene layers:
// pre-dawn sky with stars, the far city, the roof, Maria, the near parapet.
//   node scripts/og.mjs
import sharp from 'sharp'
import path from 'node:path'

const W = 1200
const H = 630
const out = path.resolve('app/opengraph-image.png')

const stars = Array.from({ length: 140 }, (_, i) => {
  // Deterministic pseudo-random so the image is reproducible.
  const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
  const x = r(1) * W
  const y = r(2) * H * 0.55
  const s = 0.6 + r(3) * 1.4
  const o = 0.35 + r(4) * 0.6
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="#F7F3EC" opacity="${o.toFixed(2)}"/>`
}).join('')

const sky = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0A0F2C"/>
      <stop offset="0.55" stop-color="#1C2A55"/>
      <stop offset="1" stop-color="#3A2E5C"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.62" cy="1" r="0.5">
      <stop offset="0" stop-color="#FFB457" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#FFB457" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${stars}
</svg>`)

async function layer(file, width, top, left = 0) {
  const img = sharp(file).resize({ width })
  const meta = await img.metadata()
  const buf = await img.png().toBuffer()
  return { input: buf, top: Math.round(top), left: Math.round(left), meta }
}

async function main() {
  // Far city: wide, pushed down so its own roof hides behind ours.
  const city = await layer('public/scene/city-skyline.webp', 1200, 300)
  // The roof: parapet line lands at ~86% of the height.
  const foreW = 1200
  const foreH = Math.round(foreW * 897 / 2200)
  const fore = await layer('public/scene/rooftop-fore.webp', foreW, H * 0.86 - foreH * 0.77)
  // Maria: feet on the slab behind the near wall.
  const mariaH = Math.round(H * 0.6)
  const mariaW = Math.round(mariaH * 672 / 1218)
  const maria = {
    input: await sharp('public/avatar/pose-hero.webp').resize({ height: mariaH }).png().toBuffer(),
    top: Math.round(H * 0.91 - mariaH),
    left: Math.round(W / 2 - mariaW / 2),
  }
  const parW = 1200
  const parH = Math.round(parW * 490 / 2200)
  const parapet = await layer('public/scene/parapet-front.webp', parW, H * 0.89 - parH * 0.6)

  await sharp(sky)
    .composite([
      { input: city.input, top: city.top, left: city.left },
      { input: fore.input, top: fore.top, left: fore.left },
      maria,
      { input: parapet.input, top: parapet.top, left: parapet.left },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log('wrote', path.relative(process.cwd(), out))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
