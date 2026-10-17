/**
 * The one thread through the story: the kite string (2007), the line the
 * plane flies (2017), the plane's fall (2023), and the cursor it becomes.
 * Each piece is drawn in its own layer's pixels from the real positions of
 * her hand and the words, so the hand-offs line up at any screen size.
 */

/** Offset of an element inside an ancestor, ignoring every transform on the way. */
export function offsetIn(node: HTMLElement, ancestor: HTMLElement) {
  let x = 0
  let y = 0
  let n: HTMLElement | null = node
  while (n && n !== ancestor) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y }
}

/** A point along a path (p in 0..1) and the direction of travel there, in degrees. */
export function pointAt(path: SVGPathElement, p: number) {
  const len = path.getTotalLength()
  const at = Math.min(len, Math.max(0, p * len))
  const a = path.getPointAtLength(at)
  const b = path.getPointAtLength(Math.min(len, at + 1))
  const c = at >= len ? path.getPointAtLength(Math.max(0, at - 1)) : a
  const angle = at >= len ? Math.atan2(a.y - c.y, a.x - c.x) : Math.atan2(b.y - a.y, b.x - a.x)
  return { x: a.x, y: a.y, angle: (angle * 180) / Math.PI }
}

/**
 * Calls `measure` again only when the viewport size has changed, so the
 * per-frame draw reads layout once per size, not once per frame.
 */
export function onResize(measure: () => void) {
  let key = ''
  return () => {
    const k = `${window.innerWidth}x${window.innerHeight}`
    if (k === key) return
    key = k
    measure()
  }
}
