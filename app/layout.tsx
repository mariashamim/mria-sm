import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Caveat, Cormorant_Garamond, DM_Sans, Gulzar, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import SkyCanvas from '@/components/sky/SkyCanvas'
import SmoothScroll from '@/components/scroll/SmoothScroll'
import Intro from '@/components/ui/Intro'
import Cursor from '@/components/ui/Cursor'
import Rail from '@/components/ui/Rail'
import Menu from '@/components/ui/Menu'
import SudokuTerminal from '@/components/sudoku/SudokuTerminal'

const display = Big_Shoulders({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['opsz'],
  variable: '--font-display',
  display: 'block',
})

// The type system (globals.css, "type system v2"): Cormorant Garamond for headings and
// reflective lines, DM Sans for the body, Caveat for the letter in her hand.
const head = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-head',
  display: 'swap',
})

const sans = DM_Sans({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['opsz'],
  variable: '--font-sans',
  display: 'swap',
})

const hand = Caveat({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-hand',
  display: 'swap',
  // Only the letter, near the end, uses it.
  preload: false,
})

const urdu = Gulzar({
  subsets: ['arabic'],
  weight: '400',
  variable: '--font-urdu',
  display: 'block',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mria-sm.vercel.app'),
  title: 'Maria Shamim',
  description: 'Born under the Karachi sky. A story, not a resume.',
  openGraph: {
    title: 'Maria Shamim',
    description: 'Born under the Karachi sky. A story, not a resume.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0F2C',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-ui="paper" className={`${display.variable} ${head.variable} ${sans.variable} ${hand.variable} ${urdu.variable} ${mono.variable}`}>
      <body>
        {/* Without scripts: no veil, every chapter in reading order. */}
        <noscript>
          <style>{`.intro{display:none}.stage,.stage--static{height:auto;overflow:visible}.stage .hero,.stage .chapter{position:relative;opacity:1;visibility:visible}.stage__roof,.hero__figure-in,.hero__opening-in,.topbar,.rail{opacity:1;visibility:visible}`}</style>
        </noscript>
        <SkyCanvas />
        <SmoothScroll />
        <Intro />
        <Cursor />
        <Menu />
        <Rail />
        <main>{children}</main>
        <SudokuTerminal />
      </body>
    </html>
  )
}
