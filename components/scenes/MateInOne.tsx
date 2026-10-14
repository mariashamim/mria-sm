'use client'

import { useEffect, useRef, useState } from 'react'
import { DOORS } from '@/content/links'
import { MATE } from '@/content/interactive'

/**
 * "Chess when I want to think": a small board with a mate in one. Click a
 * white piece, then a square. The right move mates; a wrong one shakes and
 * comes back. Solve it and the chess.com door opens.
 *
 * Position (white to move): K g1, R e1, N c3, pawns a2 f2 g2 h2;
 * black K g8, N b6, pawns a7 f7 g7 h7. The only mate is Re8#.
 */

type Kind = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'
type Piece = { p: Kind; w: boolean }
type Board = Record<string, Piece>

const FILES = 'abcdefgh'
const sq = (f: number, r: number) => FILES[f] + (r + 1)
const coords = (s: string): [number, number] => [FILES.indexOf(s[0]), Number(s[1]) - 1]

const W = (p: Kind): Piece => ({ p, w: true })
const B = (p: Kind): Piece => ({ p, w: false })
const START: Board = {
  g1: W('K'),
  e1: W('R'),
  c3: W('N'),
  a2: W('P'),
  f2: W('P'),
  g2: W('P'),
  h2: W('P'),
  g8: B('K'),
  b6: B('N'),
  a7: B('P'),
  f7: B('P'),
  g7: B('P'),
  h7: B('P'),
}
const SOLUTION = { from: 'e1', to: 'e8' }
const MATED_KING = 'g8'

// Filled glyphs for both sides; colour tells them apart. U+FE0E keeps the pawn as text, not emoji.
const GLYPH: Record<Kind, string> = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟︎' }
const NAME: Record<Kind, string> = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' }

/** Plain piece movement for white, enough for a one-move puzzle (no check rules). */
function legal(board: Board, from: string, to: string): boolean {
  const p = board[from]
  if (!p || !p.w || from === to) return false
  const t = board[to]
  if (t && t.w) return false
  const [fx, fy] = coords(from)
  const [tx, ty] = coords(to)
  const dx = tx - fx
  const dy = ty - fy
  const clear = (sx: number, sy: number) => {
    let x = fx + sx
    let y = fy + sy
    while (x !== tx || y !== ty) {
      if (board[sq(x, y)]) return false
      x += sx
      y += sy
    }
    return true
  }
  switch (p.p) {
    case 'K':
      return Math.max(Math.abs(dx), Math.abs(dy)) === 1
    case 'R':
      if (dx !== 0 && dy !== 0) return false
      return clear(Math.sign(dx), Math.sign(dy))
    case 'N':
      return (Math.abs(dx) === 1 && Math.abs(dy) === 2) || (Math.abs(dx) === 2 && Math.abs(dy) === 1)
    case 'P':
      if (dx === 0) return !t && (dy === 1 || (dy === 2 && fy === 1 && !board[sq(fx, 2)]))
      return Math.abs(dx) === 1 && dy === 1 && !!t
    default:
      return false
  }
}

type Status = 'idle' | 'wrong' | 'solved'

export default function MateInOne() {
  const [board, setBoard] = useState<Board>(START)
  const [sel, setSel] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [tries, setTries] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const tap = (s: string) => {
    if (status === 'solved') return
    const piece = board[s]
    if (!sel) {
      if (piece?.w) setSel(s)
      return
    }
    if (piece?.w) {
      setSel(s === sel ? null : s)
      return
    }
    if (!legal(board, sel, s)) return
    const moved: Board = { ...board, [s]: board[sel] }
    delete moved[sel]
    setBoard(moved)
    setSel(null)
    if (sel === SOLUTION.from && s === SOLUTION.to) {
      setStatus('solved')
      return
    }
    setStatus('wrong')
    setTries((n) => n + 1)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setBoard(START)
      setStatus('idle')
    }, 900)
  }

  const reset = () => {
    if (timer.current) clearTimeout(timer.current)
    setBoard(START)
    setSel(null)
    setStatus('idle')
    setTries(0)
  }

  const note = status === 'solved' ? MATE.solved : status === 'wrong' ? MATE.wrong[Math.min(tries - 1, MATE.wrong.length - 1)] : ''
  const hint = status === 'idle' && tries >= 2 && !sel

  return (
    <div className="mate" data-status={status}>
      <p className="mate__ask">{MATE.ask}</p>
      <div className="mate__board" role="grid" aria-label="Chess board, white to move, mate in one">
        {[7, 6, 5, 4, 3, 2, 1, 0].map((r) => (
          <div key={r} role="row" className="mate__row">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((f) => {
              const s = sq(f, r)
              const p = board[s]
              const cls = [
                'mate__sq',
                (f + r) % 2 === 0 ? 'is-dark' : 'is-light',
                sel === s ? 'is-sel' : '',
                sel && legal(board, sel, s) ? 'is-target' : '',
                status === 'solved' && s === MATED_KING ? 'is-mated' : '',
                hint && s === SOLUTION.from ? 'is-hint' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={s}
                  type="button"
                  role="gridcell"
                  className={cls}
                  aria-label={p ? `${s}, ${p.w ? 'white' : 'black'} ${NAME[p.p]}` : s}
                  aria-selected={sel === s}
                  onClick={() => tap(s)}
                  data-hover
                >
                  {p && (
                    <span className={`mate__piece ${p.w ? 'is-white' : 'is-black'}`} aria-hidden="true">
                      {GLYPH[p.p]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <p className="mate__note" aria-live="polite">
        {note || ' '}
      </p>
      {status === 'solved' && (
        <p className="mate__after">
          <a className="mate__cta" href={DOORS[1].href} target="_blank" rel="noopener noreferrer" data-hover>
            {MATE.cta}
          </a>
          <button type="button" className="mate__again" onClick={reset} data-hover>
            again
          </button>
        </p>
      )}
    </div>
  )
}
