'use client'

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { useUI } from '@/lib/ui'
import Avatar, { poseRatio } from '@/components/avatar/Avatar'
import TerminalPrompt from '@/components/scenes/TerminalPrompt'
import EyeChart from '@/components/scenes/EyeChart'
import MateInOne from '@/components/scenes/MateInOne'
import { DESK, EYE_CHART, MATE } from '@/content/interactive'
import type { SceneDef } from '@/components/scenes/registry'

/**
 * Explore: her desk at night, in the letter's room (the same wall and the
 * same window onto the skyline). She sits at the laptop; the laptop opens
 * her terminal. Everything else is paper, drawn here like the envelope: the
 * Sudoku sheet on the desk, the eye chart pinned to the wall, a chess puzzle
 * card, a sticky note that says chai and a Coke Studio ticket stub. Each one
 * lifts a little under the pointer or keyboard focus and names itself; a
 * click opens it in a sheet over the page (Esc, the close button or the
 * backdrop closes it). Sudoku opens the real Sudoku window instead.
 */

type Kind = 'laptop' | 'eye' | 'chess' | 'chai' | 'music'

const rand = (i: number, k: number) => {
  const v = Math.sin(i * 23.17 + k * 9.71) * 43758.545
  return v - Math.floor(v)
}
const STARS = Array.from({ length: 34 }, (_, i) => ({ left: `${(rand(i, 1) * 100).toFixed(1)}%`, top: `${(rand(i, 2) * 50).toFixed(1)}%` }))

// A few printed givens on the paper Sudoku; the rest is blank grid.
const GIVENS: Record<number, string> = { 0: '5', 4: '7', 10: '6', 12: '1', 20: '9', 22: '8', 28: '6', 33: '3', 37: '8', 41: '4', 44: '1', 52: '2', 58: '2', 62: '8', 66: '4', 70: '5', 76: '8', 80: '9' }

function Sheet({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const openSudoku = useUI((s) => s.setSudokuOpen)
  const [answer, setAnswer] = useState<string | null>(null)

  // Freeze the page while the sheet is open; Esc closes; focus stays inside.
  useEffect(() => {
    const lenis = getLenis()
    lenis?.stop()
    document.documentElement.classList.add('modal-open')
    const back = document.activeElement as HTMLElement | null
    const first = panel.current?.querySelector<HTMLElement>('input') ?? panel.current?.querySelector<HTMLElement>('.dk-sheet__close')
    const id = setTimeout(() => first?.focus(), 0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panel.current) return
      const f = [...panel.current.querySelectorAll<HTMLElement>('button, input, [tabindex="0"]')].filter((n) => !n.hasAttribute('disabled'))
      if (f.length === 0) return
      const a = f[0]
      const z = f[f.length - 1]
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault()
        z.focus()
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault()
        a.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(id)
      window.removeEventListener('keydown', onKey)
      // The Sudoku window may have opened from here; it keeps the page frozen itself.
      if (useUI.getState().sudokuOpen) return
      lenis?.start()
      document.documentElement.classList.remove('modal-open')
      back?.focus({ preventScroll: true })
    }
  }, [onClose])

  // Leaving for another part of the page (cd): unfreeze first, so the scroll can run.
  const leave = () => {
    getLenis()?.start()
    document.documentElement.classList.remove('modal-open')
    onClose()
  }
  const title = DESK.labels[kind]
  const check = (e: FormEvent) => {
    e.preventDefault()
    setAnswer(EYE_CHART.fail)
  }

  return createPortal(
    <div className="dk-sheet" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className={`dk-sheet__panel dk-sheet__panel--${kind}`} role="dialog" aria-modal="true" aria-labelledby="dk-sheet-title">
        <div className="dk-sheet__head">
          <h3 id="dk-sheet-title">{title}</h3>
          <button type="button" className="dk-sheet__close" onClick={onClose} aria-label="Close" data-hover>
            ×
          </button>
        </div>
        {kind === 'laptop' && (
          <div className="terminal terminal--explore terminal--sheet" aria-label="A terminal you can type into">
            <div className="terminal__bar" aria-hidden="true">
              <span>C:\MARIA</span>
              <span>80 × 25</span>
            </div>
            <TerminalPrompt onLeave={leave} />
            <button
              type="button"
              className="terminal__sudoku"
              onClick={() => {
                onClose()
                openSudoku(true)
              }}
              data-hover
            >
              <span className="terminal__sudoku-label">
                <b>▸ SUDOKU.EXE</b>
                <small>The one I wrote in x86 assembly. Click to play.</small>
              </span>
            </button>
          </div>
        )}
        {kind === 'eye' && (
          <div className="dk-eye" style={{ '--auto-gaze': 0.35 } as CSSProperties}>
            <EyeChart />
            <form className="dk-eye__form" onSubmit={check}>
              <label htmlFor="dk-eye-in">{DESK.eye.ask}</label>
              <div>
                <input id="dk-eye-in" autoComplete="off" spellCheck={false} placeholder={DESK.eye.placeholder} maxLength={24} />
                <button type="submit" data-hover>
                  Check
                </button>
              </div>
              <p className="dk-eye__reply" aria-live="polite">
                {answer}
              </p>
            </form>
          </div>
        )}
        {kind === 'chess' && (
          <div className="dk-chess">
            <MateInOne />
          </div>
        )}
        {(kind === 'chai' || kind === 'music') && (
          <div className={`dk-note dk-note--${kind}`}>
            {DESK.notes[kind].map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function Obj({ kind, label, className, onOpen, children }: { kind: string; label: string; className?: string; onOpen: () => void; children?: React.ReactNode }) {
  return (
    <div className={`dk-o dk-o--${kind} ${className ?? ''}`}>
      <button type="button" className="dk-obj" onClick={onOpen} aria-label={label} data-hover>
        {children}
        <span className="dk-obj__tag" aria-hidden="true">
          {label}
        </span>
      </button>
    </div>
  )
}

function DeskScene() {
  const [open, setOpen] = useState<Kind | null>(null)
  const openSudoku = useUI((s) => s.setSudokuOpen)
  const L = DESK.labels

  return (
    <>
      <div className="room room--explore" aria-hidden="true">
        <div className="room__wall room__wall--night" />
        <div className="room__lamp" />
        <div className="room__window">
          <div className="room__sky room__sky--night" />
          <div className="room__stars">
            {STARS.map((s, i) => (
              <i key={i} style={s} />
            ))}
          </div>
          <div className="room__city room__city--night" />
          <i className="room__mul room__mul--v" />
          <i className="room__mul room__mul--h" />
        </div>
      </div>

      <div className="dk">
        <div className="dk__wall">
          <Obj kind="eye" label={L.eye} onOpen={() => setOpen('eye')}>
            <span className="dk-paper dk-eyecard" aria-hidden="true">
              <i className="dk-pin" />
              {EYE_CHART.rows.slice(0, 6).map((r, i) => (
                <b key={i} style={{ fontSize: `${1.5 - i * 0.22}em`, filter: i > 3 ? `blur(${(i - 3) * 0.6}px)` : undefined }}>
                  {r}
                </b>
              ))}
            </span>
          </Obj>
          <Obj kind="chess" label={L.chess} onOpen={() => setOpen('chess')}>
            <span className="dk-paper dk-chesscard" aria-hidden="true">
              <i className="dk-tape" />
              <span className="dk-chesscard__board">
                <span className="dk-chesscard__k">♚</span>
                <span className="dk-chesscard__q">♕</span>
              </span>
              <small>{MATE.ask.replace('White to move. ', '')}</small>
            </span>
          </Obj>
          <Obj kind="chai" label={L.chai} onOpen={() => setOpen('chai')}>
            <span className="dk-sticky" aria-hidden="true">
              chai
            </span>
          </Obj>
          <Obj kind="music" label={L.music} onOpen={() => setOpen('music')}>
            <span className="dk-ticket" aria-hidden="true">
              <span className="dk-ticket__main">
                <small>Admit one</small>
                <b>Coke Studio</b>
                <small>Live · Karachi</small>
              </span>
              <span className="dk-ticket__stub">No. 0207</span>
            </span>
          </Obj>
        </div>

        <div className="dk__seat" style={{ aspectRatio: poseRatio('pose-desk') }}>
          <Avatar pose="pose-desk" alt="Maria at her desk, typing on her laptop" blink breathe sizes="(max-width: 900px) 60vw, 30vw" />
          <button type="button" className="dk-laptop" onClick={() => setOpen('laptop')} aria-label={`${L.laptop}: open her terminal`} data-hover>
            <span className="dk-obj__tag" aria-hidden="true">
              {L.laptop}
            </span>
          </button>
          <Obj kind="sudoku" label={L.sudoku} onOpen={() => openSudoku(true)}>
            <span className="dk-paper dk-sudoku" aria-hidden="true">
              {Array.from({ length: 81 }, (_, i) => (
                <i key={i}>{GIVENS[i] ?? ''}</i>
              ))}
            </span>
          </Obj>
        </div>
      </div>

      {open && <Sheet kind={open} onClose={() => setOpen(null)} />}
    </>
  )
}

const explore: SceneDef = {
  Scene: DeskScene,
  build: ({ tl, el, reduced }) => {
    const seat = el.querySelector<HTMLElement>('.dk__seat')
    const objs = [...el.querySelectorAll<HTMLElement>('.dk__wall .dk-o, .dk__seat .dk-o')]
    if (reduced) {
      gsap.set([seat, ...objs].filter(Boolean), { opacity: 1 })
      return
    }
    // She is at the desk as the room forms; the paper settles in after the invitation.
    if (seat) tl.fromTo(seat, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.2)
    tl.fromTo(objs, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.12 }, 1.0)
  },
}

export default explore
