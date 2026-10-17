// Walks the whole story in small steps of scroll and reports two things the
// eye catches but screenshots miss:
//   overlap  more than one section visible at once (outside the 2023 → 2024 cut)
//   empty    stretches of scroll with nothing readable on screen
// Headless Edge over DevTools against next dev (it needs window.__stage).
//   node scripts/gaps.mjs [step=0.05]   (SITE_URL=, VIEW=1440x900, CDP_PORT=)
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = Number(process.env.CDP_PORT || 9480)
const SITE = process.env.SITE_URL || 'http://localhost:3000'
const STEP = Number(process.argv[2] || 0.05)
const [W, H] = (process.env.VIEW || '1440x900').split('x').map(Number)
const OUT = path.resolve('.shots/gaps-profile')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await fs.mkdir(OUT, { recursive: true })
const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${OUT}`, '--no-first-run', '--disable-gpu', `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' })
let targets = []
for (let i = 0; i < 30 && !targets.some((t) => t.type === 'page'); i++) {
  await sleep(500)
  try {
    targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
  } catch {}
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
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
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const evalJs = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value

await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 900 })
await send('Page.navigate', { url: `${SITE}/?gaps=1` })
for (let i = 0; i < 90 && (await evalJs('!!window.__stage')) !== true; i++) await sleep(1000)
await evalJs(`sessionStorage.setItem('aasmaan-intro-seen','1'); 1`)
await send('Page.navigate', { url: `${SITE}/?gaps=2` })
for (let i = 0; i < 60 && (await evalJs('!!window.__stage && !!window.__lenis')) !== true; i++) await sleep(1000)
await sleep(2500)

const res = await evalJs(`(() => {
  const S = window.__stage
  const layers = [...document.querySelectorAll('[data-layer]')]
  const eff = (el) => { let o = 1; for (let n = el; n && n !== document.documentElement; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= +cs.opacity } return o }
  const TEXT = '.chapter__year, .chapter__title, .chapter__lines p, .hero__lead, .hero__intro, .terminal, .chapter__urdu'
  const leaves = (el) => { const l = [...el.querySelectorAll('*')].filter((n) => !n.children.length && n.textContent.trim()); return l.length ? l : [el] }
  const out = []
  for (let t = 0; t <= S.duration + 1e-6; t += ${STEP}) {
    S.master.progress(t / S.duration)
    const vis = layers.filter((l) => eff(l) > 0.04).map((l) => l.dataset.layer)
    let readable = false
    for (const l of layers) {
      if (eff(l) < 0.5) continue
      for (const n of l.querySelectorAll(TEXT)) {
        const r = n.getBoundingClientRect()
        if (r.bottom < 0 || r.top > innerHeight || r.width === 0) continue
        if (leaves(n).some((x) => eff(x) > 0.5)) { readable = true; break }
      }
      if (readable) break
    }
    out.push([+t.toFixed(2), vis.join('+'), readable])
  }
  return JSON.stringify({ duration: S.duration, segments: S.segments.map((s) => [s.id, +s.start.toFixed(2), +s.bodyStart.toFixed(2), +s.bodyEnd.toFixed(2)]), out })
})()`)
const { duration, segments, out } = JSON.parse(res)
const overlaps = []
const empties = []
let run = null
for (const [t, vis, readable] of out) {
  if (vis.includes('+') && vis !== 'sky+hello') overlaps.push(`${t}: ${vis}`)
  if (!readable) run = run ? { ...run, to: t } : { from: t, to: t, at: vis }
  else if (run) { empties.push(run); run = null }
}
if (run) empties.push(run)
console.log(`duration ${duration.toFixed(2)} viewports (${W}x${H})`)
console.log('overlap samples:', overlaps.length ? overlaps.slice(0, 40).join('\n  ') : 'none')
console.log('empty stretches (viewports of scroll):')
for (const e of empties) console.log(`  ${(e.to - e.from + STEP).toFixed(2)}  at ${e.from}–${e.to}  (${e.at || 'nothing'})`)
console.log('segments:', segments.map((s) => s.join(' ')).join(' | '))
ws.close()
proc.kill()
process.exit(0)
