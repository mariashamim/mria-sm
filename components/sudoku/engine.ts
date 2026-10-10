/** A 9×9 grid as 81 numbers, row-major, 0 = empty. */
export type Grid = number[]

const ROWS = 9

export const rowOf = (i: number) => Math.floor(i / ROWS)
export const colOf = (i: number) => i % ROWS
export const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3)

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Can `n` go at index `i` without clashing with its row, column or box? */
export function canPlace(g: Grid, i: number, n: number): boolean {
  const r = rowOf(i)
  const c = colOf(i)
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let k = 0; k < 9; k++) {
    if (g[r * 9 + k] === n) return false
    if (g[k * 9 + c] === n) return false
    const bi = (br + Math.floor(k / 3)) * 9 + (bc + (k % 3))
    if (g[bi] === n) return false
  }
  return true
}

function fillFrom(g: Grid, i: number, rng: () => number): boolean {
  if (i === 81) return true
  if (g[i] !== 0) return fillFrom(g, i + 1, rng)
  for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng)) {
    if (canPlace(g, i, n)) {
      g[i] = n
      if (fillFrom(g, i + 1, rng)) return true
      g[i] = 0
    }
  }
  return false
}

/** A complete, valid, random solution grid. */
export function generateSolution(rng: () => number = Math.random): Grid {
  const g: Grid = new Array(81).fill(0)
  fillFrom(g, 0, rng)
  return g
}

/** Count solutions up to `limit` (2 is enough to test uniqueness). */
export function countSolutions(g: Grid, limit = 2): number {
  const work = g.slice()
  let count = 0
  const step = (): boolean => {
    let i = work.indexOf(0)
    if (i === -1) {
      count++
      return count >= limit
    }
    // Pick the empty cell with the fewest candidates to keep the search small.
    let best = i
    let bestCount = 10
    for (let k = i; k < 81; k++) {
      if (work[k] !== 0) continue
      let c = 0
      for (let n = 1; n <= 9; n++) if (canPlace(work, k, n)) c++
      if (c < bestCount) {
        bestCount = c
        best = k
        if (c <= 1) break
      }
    }
    i = best
    for (let n = 1; n <= 9; n++) {
      if (canPlace(work, i, n)) {
        work[i] = n
        if (step()) {
          work[i] = 0
          return true
        }
        work[i] = 0
      }
    }
    return false
  }
  step()
  return count
}

/** Remove cells from a solution while the puzzle keeps a single solution. */
export function makePuzzle(solution: Grid, holes = 46, rng: () => number = Math.random): Grid {
  const p = solution.slice()
  let removed = 0
  for (const i of shuffle([...Array(81).keys()], rng)) {
    if (removed >= holes) break
    const keep = p[i]
    p[i] = 0
    if (countSolutions(p, 2) !== 1) p[i] = keep
    else removed++
  }
  return p
}

/** Which filled cells clash with another in their row, column or box. */
export function conflicts(g: Grid): boolean[] {
  const bad = new Array(81).fill(false)
  for (let i = 0; i < 81; i++) {
    const n = g[i]
    if (n === 0) continue
    for (let j = i + 1; j < 81; j++) {
      if (g[j] !== n) continue
      if (rowOf(i) === rowOf(j) || colOf(i) === colOf(j) || boxOf(i) === boxOf(j)) {
        bad[i] = true
        bad[j] = true
      }
    }
  }
  return bad
}

export function isSolved(g: Grid, solution: Grid): boolean {
  for (let i = 0; i < 81; i++) if (g[i] !== solution[i]) return false
  return true
}

export type Game = { puzzle: Grid; solution: Grid }

export function newGame(holes = 46): Game {
  const solution = generateSolution()
  const puzzle = makePuzzle(solution, holes)
  return { puzzle, solution }
}
