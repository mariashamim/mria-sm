// Headless Edge over the DevTools protocol: load the dev site (next dev on :3000),
// skip the intro, park the stage on each chapter, log the boxes and save a
// screenshot per chapter. Works while the browser pane is blocked by popups.
//   node scripts/shots.mjs [outDir=.shots] [mobile|desktop] [chapter,chapter,...|all]
// AT=0.05,0.5,0.95 parks each chapter at those points of its own content (default 0.95).
// CLICK=<selector> clicks an element after parking; EXEC=<js> runs after the click.
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = Number(process.env.CDP_PORT || 9333)
const SITE = process.env.SITE_URL || 'http://localhost:3000'
const OUT = path.resolve(process.argv[2] || '.shots')
const mode = process.argv[3] || 'mobile'
const ALL = ['hero', 'karachi', 'london', 'home', 'school', 'karsaz', 'sky', 'hello', 'loves', 'explore', 'letter', 'closing']
const chapters = process.argv[4] === 'all' ? ALL : (process.argv[4] || 'karachi,sky,hello,loves').split(',')
const AT = (process.env.AT || '0.95').split(',').map(Number)
const VIEW = process.env.VIEW ? process.env.VIEW.split("x").map(Number) : null
const W = VIEW ? VIEW[0] : mode === "mobile" ? 375 : 1280
const H = VIEW ? VIEW[1] : mode === "mobile" ? 812 : 800
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
if (!page) {
  console.error('no page target')
  proc.kill()
  process.exit(1)
}
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
  if (r.result?.exceptionDetails) return 'EXC: ' + JSON.stringify(r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text)
  return r.result?.result?.value ?? r.result?.result?.description
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: mode === 'mobile' ? 2 : 1, mobile: mode === 'mobile' })
if (mode === 'mobile') await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })

await send('Page.navigate', { url: `${SITE}/?v=71` })
// Wait for the stage to exist (first compile can take a while), then mark the intro seen and reload.
for (let i = 0; i < 90; i++) {
  await sleep(1000)
  if ((await evalJs('!!window.__stage')) === true) break
}
await evalJs(`sessionStorage.setItem('aasmaan-intro-seen', '1'); 'set'`)
await send('Page.navigate', { url: `${SITE}/?v=72` })
for (let i = 0; i < 60; i++) {
  await sleep(1000)
  if ((await evalJs('!!window.__stage && !!window.__lenis')) === true) break
}
await sleep(2500)
console.log('intro:', await evalJs(`document.querySelector('.intro') ? getComputedStyle(document.querySelector('.intro')).opacity : 'none'`))
await evalJs(
  `window.__gsap?.ticker.lagSmoothing(0); window.__st.refresh(); window.__at=(id,p)=>{const S=window.__stage; const m=S.master.scrollTrigger; const s=S.segments.find(x=>x.id===id); const t=(s.bodyStart+(s.bodyEnd-s.bodyStart)*p)/S.duration; const y=m.start+t*(m.end-m.start); window.__lenis?.scrollTo(y,{immediate:true}); window.scrollTo(0,y); S.master.progress(t)}; 'ok'`,
)
// Lazy figures never load behind hidden layers in headless; force them and wait.
await evalJs(`document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; i.decoding = 'sync' }); 'eager'`)
for (let i = 0; i < 20; i++) {
  await sleep(500)
  if ((await evalJs(`[...document.querySelectorAll('.chapter__fig img')].every(i => i.complete && i.naturalWidth > 0)`)) === true) break
}
console.log('figures loaded:', await evalJs(`[...document.querySelectorAll('.chapter__fig img')].map(i => i.complete && i.naturalWidth > 0).join(',')`))
const R = `(el)=>{if(!el) return null; const r=el.getBoundingClientRect(); return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]}`
for (const c of chapters) for (const at of AT) {
  await evalJs(`window.__at('${c}', ${at}); 'go'`)
  await sleep(1800)
  await evalJs(`window.__at('${c}', ${at}); 'go'`)
  await sleep(400)
  const m = await evalJs(
    `(()=>{const R=${R}; const q=s=>R(document.querySelector('#${c} '+s)); return JSON.stringify({vw: innerWidth, vh: innerHeight, inner:q('.chapter__inner'), piece:q('.eye, .terminal, .mate'), fig:q('.chapter__figure'), img:q('.chapter__fig img'), kite: document.querySelector('#${c} .scene__kite')?.getAttribute('transform') ?? null, op: getComputedStyle(document.querySelector('#${c}')).opacity})})()`,
  )
  console.log(c, at, m)
  // CLICK=<selector> opens something on the parked chapter first; EXEC=<js> runs after it.
  if (process.env.CLICK) {
    await evalJs(`document.querySelector(${JSON.stringify(process.env.CLICK)})?.click(); 'click'`)
    await sleep(900)
    if (process.env.EXEC) console.log('exec:', await evalJs(process.env.EXEC))
    await sleep(600)
  }
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 })
  await fs.writeFile(AT.length > 1 ? `${OUT}/${W}-${c}-${String(Math.round(at * 100)).padStart(2, "0")}.jpg` : `${OUT}/${mode}-${c}.jpg`, Buffer.from(shot.result.data, 'base64'))
}
ws.close()
proc.kill()
process.exit(0)
