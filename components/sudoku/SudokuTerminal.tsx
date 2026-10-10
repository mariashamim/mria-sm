'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUI } from '@/lib/ui'
import { getLenis } from '@/lib/lenis'
import { boxOf, colOf, conflicts, isSolved, newGame, rowOf, type Game, type Grid } from './engine'

/**
 * The hidden game behind the monitor in the Hello, World chapter: a real,
 * playable Sudoku inside a retro terminal window. Keyboard: arrows move,
 * 1-9 enter, Backspace or 0 clears, N new puzzle, Escape closes.
 */
export default function SudokuTerminal() {
  const open = useUI((s) => s.sudokuOpen)
  const setOpen = useUI((s) => s.setSudokuOpen)
  const [game, setGame] = useState<Game | null>(null)
  const [cells, setCells] = useState<Grid>([])
  const [sel, setSel] = useState(40)
  const [note, setNote] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const start = useCallback(() => {
    const g = newGame(46)
    setGame(g)
    setCells(g.puzzle.slice())
    setSel(g.puzzle.indexOf(0))
    setNote(null)
  }, [])

  // Generate lazily on first open so the server render stays deterministic.
  useEffect(() => {
    if (!open || game) return
    const id = setTimeout(start, 0)
    return () => clearTimeout(id)
  }, [open, game, start])

  // Freeze the page while the window is open.
  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      document.documentElement.classList.add('modal-open')
      const id = setTimeout(() => gridRef.current?.focus(), 0)
      return () => {
        clearTimeout(id)
        lenis?.start()
        document.documentElement.classList.remove('modal-open')
      }
    }
    lenis?.start()
    document.documentElement.classList.remove('modal-open')
  }, [open])

  const set = useCallback(
    (i: number, n: number) => {
      if (!game || game.puzzle[i] !== 0) return
      setCells((prev) => {
        const next = prev.slice()
        next[i] = n
        if (game && isSolved(next, game.solution)) setNote('Solved. The assembly version took 1,400 lines.')
        else setNote(null)
        return next
      })
    },
    [game],
  )

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!game) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const r = rowOf(sel)
      const c = colOf(sel)
      switch (e.key) {
        case 'Escape':
          setOpen(false)
          return
        case 'ArrowUp':
          setSel(((r + 8) % 9) * 9 + c)
          break
        case 'ArrowDown':
          setSel(((r + 1) % 9) * 9 + c)
          break
        case 'ArrowLeft':
          setSel(r * 9 + ((c + 8) % 9))
          break
        case 'ArrowRight':
          setSel(r * 9 + ((c + 1) % 9))
          break
        case 'Backspace':
        case 'Delete':
        case '0':
          set(sel, 0)
          break
        case 'n':
        case 'N':
          start()
          break
        default:
          if (/^[1-9]$/.test(e.key)) set(sel, Number(e.key))
          else return
      }
      e.preventDefault()
    },
    [game, sel, set, setOpen, start],
  )

  // Keys work wherever focus is while the window is open; the whole page is frozen anyway.
  useEffect(() => {
    if (!open) return
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onKey])

  const check = () => {
    if (!game) return
    const bad = conflicts(cells)
    const empties = cells.filter((v) => v === 0).length
    if (bad.some(Boolean)) setNote('Something clashes. Red cells repeat a number in their row, column or box.')
    else if (empties > 0) setNote(`No clashes so far. ${empties} to go.`)
    else if (isSolved(cells, game.solution)) setNote('Solved. The assembly version took 1,400 lines.')
    else setNote('Full, but not right. Try again.')
  }

  const bad = cells.length ? conflicts(cells) : []
  const selRow = rowOf(sel)
  const selCol = colOf(sel)
  const selBox = boxOf(sel)
  const selVal = cells[sel] || 0

  return (
    <div className="sudoku" hidden={!open} role="dialog" aria-modal="true" aria-label="Sudoku">
      <div className="sudoku__window">
        <div className="sudoku__bar">
          <span className="sudoku__title">C:\MARIA\SUDOKU.EXE</span>
          <button type="button" className="sudoku__close" onClick={() => setOpen(false)} aria-label="Close" data-hover>
            ×
          </button>
        </div>
        <p className="sudoku__intro">
          Spring 2025: a whole Sudoku in x86 MASM, registers and interrupts, INT 21h for every keypress. This one is JavaScript. The rules are the same.
        </p>
        <div ref={gridRef} className="sudoku__grid" tabIndex={0} role="grid" aria-label="Sudoku grid">
          {cells.map((v, i) => {
            const given = game?.puzzle[i] !== 0
            const cls = [
              'sudoku__cell',
              given ? 'is-given' : '',
              i === sel ? 'is-selected' : '',
              rowOf(i) === selRow || colOf(i) === selCol || boxOf(i) === selBox ? 'is-related' : '',
              selVal && v === selVal ? 'is-same' : '',
              bad[i] ? 'is-bad' : '',
              colOf(i) % 3 === 2 && colOf(i) !== 8 ? 'is-box-right' : '',
              rowOf(i) % 3 === 2 && rowOf(i) !== 8 ? 'is-box-bottom' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                type="button"
                key={i}
                className={cls}
                role="gridcell"
                aria-selected={i === sel}
                tabIndex={-1}
                onClick={() => setSel(i)}
                data-hover
              >
                {v || ''}
              </button>
            )
          })}
        </div>
        <div className="sudoku__pad" aria-label="Digits">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button type="button" key={n} onClick={() => set(sel, n)} data-hover>
              {n}
            </button>
          ))}
          <button type="button" onClick={() => set(sel, 0)} aria-label="Clear cell" data-hover>
            ⌫
          </button>
        </div>
        <div className="sudoku__actions">
          <button type="button" onClick={check} data-hover>
            check
          </button>
          <button type="button" onClick={start} data-hover>
            new puzzle
          </button>
          <span className="sudoku__hint">arrows move · 1–9 type · esc closes</span>
        </div>
        <p className="sudoku__note" aria-live="polite">
          {note ?? ' '}
        </p>
      </div>
    </div>
  )
}
