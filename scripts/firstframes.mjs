// Headless Edge over the DevTools protocol: navigate to the dev site and grab a
// screenshot every few hundred milliseconds from the first paint, to see what
// a visitor sees while the scripts load. Also runs the "seen" path (the intro
// already shown this session) when asked.
//   node scripts/firstframes.mjs [outDir=.shots/first] [mobile|desktop] [fresh|seen] [frames=12] [everyMs=250]
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = Number(process.env.CDP_PORT || 9335)
const SITE = process.env.SITE_URL || 'http://localhost:3000'
const OUT = path.resolve(process.argv[2] || '.shots/first')
const mode = process.argv[3] || 'desktop'
const visit = process.argv[4] || 'fresh'
const FRAMES = Number(process.argv[5] || 12)
const EVERY = Number(process.argv[6] || 250)
const W = mode === 'mobile' ? 375 : 1280
const H = mode === 'mobile' ? 812 : 800
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await fs.mkdir(OUT, { recursive: true })
const proc = spawn(
  EDGE,
  ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${OUT}/profile`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', `--window-size=${W},${H}`, 'about:blank'],
  { stdio: 'ignore' },
)
let targets = []
for (let i = 0; i < 30 && !targets.some((t) => t.type === 'page'); i++) {
  await sleep(500)
  try {
    targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
  } catch {}
}
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
  }
}
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id
    pending.set(i, res)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
const evalJs = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return r.result?.result?.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: mode === 'mobile' })

// Warm the dev server and (for the seen path) mark the intro as shown.
await send('Page.navigate', { url: `${SITE}/?warm=1` })
for (let i = 0; i < 90; i++) {
  await sleep(1000)
  if ((await evalJs('!!window.__stage')) === true) break
}
if (visit === 'seen') await evalJs(`sessionStorage.setItem('aasmaan-intro-seen', '1'); 'set'`)
else await evalJs(`sessionStorage.removeItem('aasmaan-intro-seen'); 'cleared'`)

// Now the real run: navigate and shoot.
const t0 = Date.now()
send('Page.navigate', { url: `${SITE}/?first=${visit}` })
for (let i = 0; i < FRAMES; i++) {
  await sleep(EVERY)
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 })
  const dt = Date.now() - t0
  const state = await evalJs(
    `(()=>{try{const v=document.querySelector('.intro__veil'); const c=document.querySelector('#karachi'); return JSON.stringify({hydrated: !!window.__stage, veil: v? getComputedStyle(v).opacity : 'none', karachiVis: c? getComputedStyle(c).visibility+'/'+getComputedStyle(c).opacity : 'none', nameOp: getComputedStyle(document.querySelector('.hero__name')).opacity, roofVis: getComputedStyle(document.querySelector('.stage__roof')).visibility})}catch(e){return 'loading'}})()`,
  )
  console.log(`${String(dt).padStart(5)}ms`, state)
  if (shot.result?.data) await fs.writeFile(`${OUT}/${mode}-${visit}-${String(i).padStart(2, '0')}-${dt}ms.jpg`, Buffer.from(shot.result.data, 'base64'))
}
ws.close()
proc.kill()
process.exit(0)
