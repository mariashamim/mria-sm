'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react'
import { chapters } from '@/content/chapters'
import { DOORS } from '@/content/links'
import { HELP, SECRETS, WHOAMI } from '@/content/interactive'
import { isTouch } from '@/lib/gsap'
import { scrollToChapter } from '@/lib/stage'
import { useUI } from '@/lib/ui'

type Line = { kind: 'in' | 'out' | 'err'; text: string }

const CHIPS = ['help', 'whoami', 'chai', 'chess', 'hello', 'sudoku']

const coarse = () => (typeof window === 'undefined' ? null : window.matchMedia('(pointer: coarse)'))
const subscribeTouch = (cb: () => void) => {
  const mq = coarse()
  mq?.addEventListener('change', cb)
  return () => mq?.removeEventListener('change', cb)
}
/** Coarse pointer or not; false on the server so the markup matches, then the client's truth. */
function useIsTouch() {
  return useSyncExternalStore(subscribeTouch, isTouch, () => false)
}

/**
 * The prompt under Maria's first program. Click it and type; `help` lists
 * what it knows. On phones there is no keyboard (a virtual keyboard would
 * resize the pinned stage), so the commands are chips instead.
 */
export default function TerminalPrompt() {
  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState('')
  const touch = useIsTouch()
  const input = useRef<HTMLInputElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const openSudoku = useUI((s) => s.setSudokuOpen)

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight })
  }, [lines])

  const run = (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    const [name, ...rest] = cmd.toLowerCase().split(/\s+/)
    const out: Line[] = [{ kind: 'in', text: cmd }]
    const say = (text: string) => out.push({ kind: 'out', text })
    const err = (text: string) => out.push({ kind: 'err', text })
    switch (name) {
      case 'help':
        HELP.forEach(say)
        break
      case 'whoami':
        WHOAMI.forEach(say)
        break
      case 'ls':
        say(
          chapters
            .filter((c) => c.id !== 'hero')
            .map((c) => (c.year && c.year !== 'NOW' ? c.year : c.id) + '/')
            .filter((v, i, a) => a.indexOf(v) === i)
            .join('  ') + '  letter.txt',
        )
        break
      case 'cd': {
        const arg = rest[0] ?? ''
        const target = chapters.find((c) => c.id !== 'hero' && (c.id === arg || (!!c.year && c.year.toLowerCase() === arg)))
        if (target) {
          say(`→ ${target.title}`)
          scrollToChapter(target.id)
        } else err(`cd: no such chapter: ${arg || '?'}. try ls`)
        break
      }
      case 'cat':
        if (rest[0] === 'letter.txt') say('read it yourself. keep scrolling.')
        else if (rest[0] === 'chai.txt') SECRETS.chaiTxt.forEach(say)
        else err(`cat: ${rest[0] ?? ''}: no such file`)
        break
      case 'chai':
        say('opening mail. chai is on me.')
        window.location.href = DOORS[0].href
        break
      case 'chess':
        say('see you on the board.')
        window.open(DOORS[1].href, '_blank', 'noopener')
        break
      case 'hello':
        say('hello, world.')
        window.open(DOORS[2].href, '_blank', 'noopener')
        break
      case 'sudoku':
        say('loading sudoku.exe')
        openSudoku(true)
        break
      case 'clear':
        setLines([])
        setValue('')
        return
      case 'sudo':
        if (rest[0] === 'fly') SECRETS.sudoFly.forEach(say)
        else err('sudo: nice try.')
        break
      default:
        err(`${name}: command not found. try help`)
    }
    setLines((prev) => [...prev, ...out].slice(-60))
    setValue('')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    run(value)
  }
  const focus = () => input.current?.focus({ preventScroll: true })

  return (
    <div className="terminal__live" onClick={focus}>
      <div ref={log} className="terminal__log" data-lenis-prevent aria-live="polite">
        {lines.map((l, i) => (
          <div key={i} className={`terminal__line terminal__${l.kind}`}>
            {l.kind === 'in' ? '> ' : ''}
            {l.text}
          </div>
        ))}
      </div>
      <form className="terminal__line terminal__form" onSubmit={submit}>
        <label htmlFor="terminal-in" className="terminal__prompt">
          &gt;&nbsp;
        </label>
        <input
          ref={input}
          id="terminal-in"
          className="terminal__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') (e.target as HTMLInputElement).blur()
          }}
          placeholder={touch ? 'tap a command' : 'type help'}
          aria-label="Type a command"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          readOnly={touch}
          inputMode={touch ? 'none' : 'text'}
        />
      </form>
      <div className="terminal__chips" aria-label="Commands">
        {CHIPS.map((c) => (
          <button
            type="button"
            key={c}
            onClick={(e) => {
              e.stopPropagation()
              run(c)
            }}
            data-hover
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
