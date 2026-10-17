// Automated checks over the dev site in headless Edge (DevTools protocol):
// console and network errors, heading outline, menu / rail / deep-link
// navigation, the terminal, the chess puzzle, the Sudoku window, the eye
// chart, the doors, keyboard focus, a responsive scan at eight viewports and
// the reduced-motion layout. Prints PASS / FAIL lines and a summary.
//   node scripts/verify.mjs            (dev server on :3000; needs the dev-only window.__stage)
//   SITE_URL=... CDP_PORT=... node scripts/verify.mjs
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = Number(process.env.CDP_PORT || 9371)
const SITE = process.env.SITE_URL || 'http://localhost:3000'
const OUT = path.resolve(process.env.OUT_DIR || '.shots/verify')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await fs.mkdir(OUT, { recursive: true })
const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${OUT}/profile`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' })
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
const consoleIssues = []
const networkIssues = []
const noise = (s) => /_next\/hmr|\[HMR\]|Fast Refresh|hot-reloader|turbopack/i.test(s)
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
    return
  }
  if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) {
    const text = m.params.args.map((a) => a.value ?? a.description ?? '').join(' ')
    if (!noise(text)) consoleIssues.push(`${m.params.type}: ${text.slice(0, 200)}`)
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails
    consoleIssues.push(`exception: ${(d.exception?.description ?? d.text).slice(0, 200)}`)
  }
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !noise(m.params.entry.text)) consoleIssues.push(`log: ${m.params.entry.text.slice(0, 200)}`)
  if (m.method === 'Network.loadingFailed' && !noise(m.params.errorText) && m.params.type !== 'WebSocket') networkIssues.push(`failed: ${m.params.errorText} (${m.params.type})`)
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) networkIssues.push(`${m.params.response.status} ${m.params.response.url.slice(0, 120)}`)
}
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id
    pending.set(i, res)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
const evalJs = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text)
  return r.result?.result?.value
}
const key = async (k, code, vk, text) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, text })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk })
}
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}
const test = async (name, fn) => {
  try {
    await fn()
  } catch (e) {
    check(name, false, 'threw: ' + String(e.message ?? e).slice(0, 160))
  }
}
const shot = async (name) => {
  const s = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 })
  if (s.result?.data) await fs.writeFile(`${OUT}/${name}.jpg`, Buffer.from(s.result.data, 'base64'))
}

await send('Page.enable')
await send('Runtime.enable')
await send('Log.enable')
await send('Network.enable')
const viewport = async (w, h, mobile = false) => {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile })
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 })
}
await viewport(1280, 800)

const ready = async (max = 90) => {
  for (let i = 0; i < max; i++) {
    await sleep(1000)
    if ((await evalJs('!!window.__stage && !!window.__lenis && !!window.__st')) === true) return true
  }
  return false
}
const load = async (url) => {
  await send('Page.navigate', { url })
  const ok = await ready()
  await sleep(1500)
  await evalJs(`document.querySelectorAll('img').forEach(i => { i.loading = 'eager' }); window.__gsap?.ticker.lagSmoothing(0); window.__st.refresh(); window.__at=(id,p)=>{const S=window.__stage; const m=S.master.scrollTrigger; const s=S.segments.find(x=>x.id===id); const t=(s.bodyStart+(s.bodyEnd-s.bodyStart)*p)/S.duration; const y=m.start+t*(m.end-m.start); window.__lenis.scrollTo(y,{immediate:true}); window.scrollTo(0,y); S.master.progress(t)}; 'ok'`)
  return ok
}

// Warm up, mark the intro seen, reload.
await send('Page.navigate', { url: `${SITE}/?verify=warm` })
await ready()
await evalJs(`sessionStorage.setItem('aasmaan-intro-seen', '1'); 'set'`)
await load(`${SITE}/?verify=1`)

/* ── 1. document ── */
await test('headings', async () => {
  const hs = JSON.parse(await evalJs(`JSON.stringify([...document.querySelectorAll('h1,h2,h3,h4')].map(h => [h.tagName, (h.textContent||'').trim().slice(0,30), h.getAttribute('aria-hidden'), h.getAttribute('aria-label')]))`))
  const h1 = hs.filter((h) => h[0] === 'H1' && h[2] !== 'true')
  check('exactly one accessible h1', h1.length === 1, JSON.stringify(h1))
  const order = hs.filter((h) => h[2] !== 'true').map((h) => h[0])
  const skips = order.some((t, i) => i > 0 && Number(t[1]) > Number(order[i - 1][1]) + 1)
  check('no skipped heading levels', !skips, order.join(' '))
})
await test('metadata', async () => {
  const t = await evalJs('document.title')
  const d = await evalJs(`document.querySelector('meta[name=description]')?.content || ''`)
  const lang = await evalJs('document.documentElement.lang')
  check('title names the author', /maria/i.test(t) && t.length > 6, t)
  check('description present', d.length > 20, d)
  check('html lang set', lang === 'en', lang)
  const ur = await evalJs(`[...document.querySelectorAll('[lang="ur"]')].length`)
  check('urdu spans carry lang="ur"', ur >= 9, String(ur))
})
await test('images', async () => {
  const bad = JSON.parse(await evalJs(`JSON.stringify([...document.querySelectorAll('img')].filter(i => !i.getAttribute('width') || !i.getAttribute('height') || i.alt == null).map(i => i.getAttribute('src')))`))
  check('every img has width, height and alt', bad.length === 0, bad.join(', '))
  const broken = JSON.parse(await evalJs(`JSON.stringify([...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc))`))
  check('no broken images', broken.length === 0, broken.join(', '))
})

/* ── 2. navigation ── */
await test('menu', async () => {
  await evalJs(`document.querySelector('.topbar__menu').click()`)
  await sleep(700)
  const open = await evalJs(`getComputedStyle(document.querySelector('.menu')).display`)
  check('menu opens', open === 'grid', open)
  const focusIn = await evalJs(`!!document.activeElement && !!document.activeElement.closest('.menu')`)
  check('focus moves into the menu', focusIn)
  await key('Escape', 'Escape', 27)
  await sleep(600)
  const closed = await evalJs(`getComputedStyle(document.querySelector('.menu')).display`)
  check('escape closes the menu', closed === 'none', closed)
  const back = await evalJs(`document.activeElement === document.querySelector('.topbar__menu')`)
  check('focus returns to the menu button', back)
  await evalJs(`document.querySelector('.topbar__menu').click()`)
  await sleep(600)
  await evalJs(`[...document.querySelectorAll('.menu__list button')].find(b => b.textContent.includes('Karsaz')).click()`)
  await sleep(2600)
  const active = await evalJs(`document.querySelector('.rail li.is-active button')?.textContent`)
  const closed2 = await evalJs(`getComputedStyle(document.querySelector('.menu')).display`)
  check('menu item scrolls to the chapter and closes', active === '2017' && closed2 === 'none', `active ${active}, menu ${closed2}`)
})
await test('rail', async () => {
  await evalJs(`[...document.querySelectorAll('.rail button')].find(b => b.textContent === '2023').click()`)
  await sleep(2600)
  const active = await evalJs(`document.querySelector('.rail li.is-active button')?.textContent`)
  const current = await evalJs(`document.querySelector('.rail li.is-active button')?.getAttribute('aria-current')`)
  check('rail year scrolls and marks aria-current', active === '2023' && current === 'true', `active ${active}, aria-current ${current}`)
  await evalJs(`document.querySelector('.topbar__mark').click()`)
  await sleep(2600)
  const top = await evalJs('Math.round(window.scrollY)')
  check('wordmark returns to the start', top < 40, `scrollY ${top}`)
})
await test('deep link', async () => {
  await load(`${SITE}/?verify=deep#loves`)
  await sleep(3500)
  const active = await evalJs(`document.querySelector('.rail li.is-active button')?.textContent`)
  const title = await evalJs(`(window.__stage && window.__stage.segments.find(s => s.id === 'loves')) ? 'ok' : 'nostage'`)
  check('#loves lands on Outside the classroom', active === 'NOW', `active ${active} (${title})`)
  await load(`${SITE}/?verify=2`)
})

/* ── 3. interactive pieces ── */
await test('terminal', async () => {
  await evalJs(`window.__at('explore', 0.98)`)
  await sleep(1500)
  await evalJs(`document.querySelector('#terminal-in').focus({preventScroll:true})`)
  const focused = await evalJs(`document.activeElement === document.querySelector('#terminal-in')`)
  check('terminal input takes focus', focused)
  await send('Input.insertText', { text: 'help' })
  await key('Enter', 'Enter', 13, '\r')
  await sleep(300)
  const n = await evalJs(`document.querySelector('#explore .terminal__log').children.length`)
  check('help lists the commands', n >= 9, `${n} lines`)
  await key('Enter', 'Enter', 13, '\r')
  await sleep(200)
  const n2 = await evalJs(`document.querySelector('#explore .terminal__log').children.length`)
  check('empty input adds nothing', n2 === n, `${n2} lines`)
  await send('Input.insertText', { text: 'frobnicate <b>x</b>' })
  await key('Enter', 'Enter', 13, '\r')
  await sleep(200)
  const err = await evalJs(`document.querySelector('#explore .terminal__log .terminal__err')?.textContent || ''`)
  const html = await evalJs(`!!document.querySelector('#explore .terminal__log b')`)
  check('unknown command is reported, markup not rendered', /command not found/.test(err) && !html, err.slice(0, 60))
  await send('Input.insertText', { text: 'clear' })
  await key('Enter', 'Enter', 13, '\r')
  await sleep(200)
  const n3 = await evalJs(`document.querySelector('#explore .terminal__log').children.length`)
  check('clear empties the log', n3 === 0, `${n3} lines`)
  await send('Input.insertText', { text: 'cd 2007' })
  await key('Enter', 'Enter', 13, '\r')
  await sleep(2600)
  const active = await evalJs(`document.querySelector('.rail li.is-active button')?.textContent`)
  check('cd 2007 jumps to the chapter', active === '2007', `active ${active}`)
  const hrefs = JSON.parse(await evalJs(`JSON.stringify([...document.querySelectorAll('#letter .doors a')].map(a => a.href))`))
  check('doors link to mail, chess.com and linkedin', hrefs.length === 3 && /^mailto:/.test(hrefs[0]) && /chess\.com/.test(hrefs[1]) && /linkedin\.com/.test(hrefs[2]), hrefs.join(' '))
})
await test('chess', async () => {
  await evalJs(`window.__at('loves', 0.9)`)
  await sleep(1500)
  const q = (s) => `document.querySelector('#loves ${s}')`
  await evalJs(`${q('.mate__sq[aria-label="e1, white rook"]')}.click()`)
  await sleep(100)
  const targets = await evalJs(`document.querySelectorAll('#loves .mate__sq.is-target').length`)
  // Up the e-file (7) and along the first rank to the king (5).
  check('selecting the rook shows its moves', targets === 12, `${targets} targets`)
  await evalJs(`${q('.mate__sq[aria-label="e4"]')}.click()`)
  await sleep(100)
  const wrong = await evalJs(`${q('.mate')}.dataset.status + '|' + ${q('.mate__note')}.textContent`)
  check('a legal non-mating move is refused with a note', /^wrong\|Not mate/.test(wrong), wrong)
  await sleep(1100)
  const reset = await evalJs(`!!${q('.mate__sq[aria-label="e1, white rook"]')}`)
  check('the board comes back after a wrong move', reset)
  await evalJs(`${q('.mate__sq[aria-label="e1, white rook"]')}.click()`)
  await sleep(50)
  await evalJs(`${q('.mate__sq[aria-label="e8"]')}.click()`)
  await sleep(150)
  const solved = await evalJs(`${q('.mate')}.dataset.status + '|' + (${q('.mate__cta')}?.href || '') + '|' + !!${q('.mate__sq.is-mated')}`)
  check('Re8 mates and opens the chess door', /^solved\|https:\/\/www\.chess\.com.*\|true$/.test(solved), solved)
  await evalJs(`${q('.mate__again')}.click()`)
  await sleep(100)
  const again = await evalJs(`${q('.mate')}.dataset.status`)
  check('again resets the puzzle', again === 'idle', again)
})
await test('sudoku', async () => {
  await evalJs(`window.__at('explore', 0.98)`)
  await sleep(1200)
  await evalJs(`document.querySelector('#explore .terminal__sudoku').click()`)
  await sleep(600)
  const open = await evalJs(`!document.querySelector('.sudoku').hidden`)
  const cells = await evalJs(`document.querySelectorAll('.sudoku__cell').length`)
  const focused = await evalJs(`document.activeElement === document.querySelector('.sudoku__grid')`)
  check('sudoku opens with 81 cells and focus on the grid', open && cells === 81 && focused, `open ${open}, cells ${cells}, focused ${focused}`)
  const stopped = await evalJs(`window.__lenis.isStopped`)
  check('page scroll is frozen behind the window', stopped === true)
  const before = await evalJs(`document.querySelector('.sudoku__cell.is-selected')?.textContent || ''`)
  await key('7', 'Digit7', 55, '7')
  await sleep(100)
  const after = await evalJs(`document.querySelector('.sudoku__cell.is-selected')?.textContent || ''`)
  check('typing a digit fills the selected cell', before === '' && after === '7', `'${before}' → '${after}'`)
  await evalJs(`[...document.querySelectorAll('.sudoku__actions button')].find(b => b.textContent.trim() === 'check').click()`)
  await sleep(100)
  const note = await evalJs(`document.querySelector('.sudoku__note').textContent.trim()`)
  check('check reports a state', note.length > 5, note.slice(0, 60))
  await key('Backspace', 'Backspace', 8)
  await sleep(50)
  const cleared = await evalJs(`document.querySelector('.sudoku__cell.is-selected')?.textContent || ''`)
  check('backspace clears the cell', cleared === '')
  await key('Escape', 'Escape', 27)
  await sleep(300)
  const closed = await evalJs(`document.querySelector('.sudoku').hidden`)
  const running = await evalJs(`!window.__lenis.isStopped`)
  check('escape closes the window and scroll resumes', closed && running, `hidden ${closed}, scroll ${running}`)
})
await test('eye chart', async () => {
  await evalJs(`window.__at('sky', 0.6)`)
  await sleep(1200)
  const held = await evalJs(`(()=>{const eye=document.querySelector('#sky .eye'); const r=eye.querySelector('.eye__rows').getBoundingClientRect(); eye.dispatchEvent(new PointerEvent('pointerdown',{clientX:r.left+30, clientY:r.top+r.height*0.5, pointerType:'mouse', bubbles:true})); return eye.style.getPropertyValue('--held-gaze')})()`)
  check('a pointer on the chart sets the gaze', Math.abs(Number(held) - 0.5) < 0.05, held)
  const released = await evalJs(`(()=>{const eye=document.querySelector('#sky .eye'); eye.dispatchEvent(new PointerEvent('pointerout',{pointerType:'mouse', bubbles:true, relatedTarget: document.body})); return eye.style.getPropertyValue('--held-gaze')})()`)
  check('leaving the chart releases it', released === '')
  const blur = await evalJs(`getComputedStyle(document.querySelectorAll('#sky .eye__row')[7]).filter`)
  check('the last line is blurred', /blur\(([4-9]|1\d)/.test(blur), blur)
})
await test('kite', async () => {
  await evalJs(`window.__at('karachi', 0.9)`)
  await sleep(1200)
  const before = await evalJs(`document.querySelector('#karachi .scene__kite').getAttribute('transform')`)
  await evalJs(`window.dispatchEvent(new PointerEvent('pointermove', {clientX: 120, clientY: 90, pointerType: 'mouse', bubbles: true}))`)
  await sleep(1800)
  const after = await evalJs(`document.querySelector('#karachi .scene__kite').getAttribute('transform')`)
  check('the kite follows the pointer', before !== after, `${before} → ${after}`)
  await evalJs(`window.dispatchEvent(new PointerEvent('pointermove', {clientX: 900, clientY: 300, pointerType: 'mouse', bubbles: true}))`)
})

/* ── 4. keyboard ── */
await test('keyboard', async () => {
  await evalJs(`window.scrollTo(0,0); window.__lenis.scrollTo(0,{immediate:true}); document.activeElement && document.activeElement.blur()`)
  await sleep(800)
  const seq = []
  for (let i = 0; i < 6 && seq.length < 4; i++) {
    await key('Tab', 'Tab', 9)
    await sleep(80)
    const s = await evalJs(`(()=>{const a=document.activeElement; if(!a||a===document.body) return 'body'; if (a.tagName==='NEXTJS-PORTAL') return 'devtools'; const cs=getComputedStyle(a); return (a.className||a.tagName)+':'+(a.textContent||'').trim().slice(0,12)+':'+(cs.outlineStyle!=='none' && parseFloat(cs.outlineWidth)>0 ? 'ring' : 'noring')})()`)
    // The dev overlay's portal and the body itself are not part of the site's order.
    if (s !== 'body' && s !== 'devtools') seq.push(s)
  }
  check('tab reaches the top bar and the rail with a visible ring', seq.length === 4 && seq.every((s) => s.endsWith('ring')), seq.join(' | '))
})

/* ── 5. responsive scan ── */
await test('responsive', async () => {
  const sizes = [
    [320, 568, true],
    [320, 658, true],
    [375, 812, true],
    [430, 932, true],
    [768, 1024, true],
    [1024, 768, false],
    [1366, 768, false],
    [1440, 900, false],
    [1920, 1080, false],
  ]
  const ids = ['hero', 'karachi', 'london', 'home', 'school', 'karsaz', 'sky', 'hello', 'loves', 'explore', 'letter', 'closing']
  const problems = []
  for (const [w, h, mobile] of sizes) {
    await viewport(w, h, mobile)
    await sleep(300)
    await evalJs(`window.__st.refresh(); 'r'`)
    await sleep(300)
    for (const cid of ids) {
      await evalJs(`window.__at('${cid}', 0.95)`)
      await sleep(250)
      const r = JSON.parse(
        await evalJs(`(()=>{
          const vw=innerWidth, vh=innerHeight; const out=[];
          if (document.documentElement.scrollWidth > vw + 1) out.push('page scrollWidth ' + document.documentElement.scrollWidth);
          const sec=document.querySelector('#${cid}');
          const R=(el)=>el.getBoundingClientRect();
          const inside=(name, el)=>{ if(!el) return; const b=R(el); if (b.width===0) return; if (b.right > vw+1 || b.left < -1) out.push(name+' x '+Math.round(b.left)+'..'+Math.round(b.right)); if (b.bottom > vh+1) out.push(name+' bottom '+Math.round(b.bottom)+'>'+vh); if (b.top < -1) out.push(name+' top '+Math.round(b.top)); };
          inside('inner', sec.querySelector('.chapter__inner, .hero__opening'));
          inside('lines', sec.querySelector('.chapter__lines'));
          inside('doors', sec.querySelector('.doors'));
          inside('piece', sec.querySelector('.eye, .mate, .terminal'));
          const fig = sec.querySelector('.chapter__fig img, .hero__figure img'); if (fig) { const b=R(fig); if (b.right > vw+1 || b.left < -1) out.push('figure x '+Math.round(b.left)+'..'+Math.round(b.right)); }
          const meta=sec.querySelector('.chapter__meta'); const bar=document.querySelector('.topbar__mark'); if (meta && bar) { const m=R(meta), t=R(bar); if (m.top < t.bottom + 2 && m.width>0) out.push('meta under the wordmark ' + Math.round(m.top) + '<' + Math.round(t.bottom)); }
          const lines=sec.querySelector('.chapter__lines'); if (lines && fig) { const a=R(lines), b=R(fig); const ix=Math.min(a.right,b.right)-Math.max(a.left,b.left), iy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top); if (ix>8 && iy>8) out.push('lines overlap figure '+Math.round(ix)+'x'+Math.round(iy)); }
          const piece=sec.querySelector('.eye, .mate'); if (lines && piece) { const a=R(lines), b=R(piece); const ix=Math.min(a.right,b.right)-Math.max(a.left,b.left), iy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top); if (ix>4 && iy>4) out.push('lines overlap piece '+Math.round(ix)+'x'+Math.round(iy)); }
          const small=[...sec.querySelectorAll('button, a, input')].filter(e=>{const b=R(e); return b.width>0 && (b.width<24 || b.height<24)}).map(e=>(e.getAttribute('aria-label')||e.textContent||e.tagName).trim().slice(0,14)+' '+Math.round(R(e).width)+'x'+Math.round(R(e).height));
          if (small.length) out.push('small targets: '+small.slice(0,6).join(', ')+(small.length>6?' +'+(small.length-6):''));
          return JSON.stringify(out);
        })()`),
      )
      if (r.length) problems.push(`${w}x${h} ${cid}: ${r.join('; ')}`)
      if (process.env.SHOTS === '1') await shot(`${w}x${h}-${cid}`)
    }
  }
  check('responsive scan clean', problems.length === 0, problems.length ? '\n    ' + problems.join('\n    ') : '')
  await viewport(1280, 800)
})

/* ── 6. reduced motion ── */
await test('reduced motion', async () => {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await send('Page.navigate', { url: `${SITE}/?verify=rm` })
  await sleep(7000)
  const r = JSON.parse(await evalJs(`JSON.stringify({static: !!document.querySelector('.stage--static'), tall: document.documentElement.scrollHeight > innerHeight * 4, karachi: getComputedStyle(document.querySelector('#karachi')).opacity + '/' + getComputedStyle(document.querySelector('#karachi')).visibility, name: getComputedStyle(document.querySelector('.hero__opening-in')).opacity, roof: getComputedStyle(document.querySelector('.stage__roof')).visibility, veil: !!document.querySelector('.intro__veil')})`))
  check('reduced motion: static stage, chapters visible, no veil left', r.static && r.tall && r.karachi === '1/visible' && r.name === '1' && r.roof === 'visible' && !r.veil, JSON.stringify(r))
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: '' }] })
})

/* ── 7. console / network ── */
check('no console errors or exceptions', consoleIssues.length === 0, consoleIssues.slice(0, 8).join(' || '))
check('no failed requests', networkIssues.length === 0, networkIssues.slice(0, 8).join(' || '))

const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
ws.close()
proc.kill()
process.exit(failed ? 1 : 0)
