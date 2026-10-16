import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Fraunces, Gulzar, IBM_Plex_Mono } from 'next/font/google'
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

const serif = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT', 'WONK'],
  variable: '--font-serif',
  display: 'block',
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
    <html lang="en" data-ui="paper" className={`${display.variable} ${serif.variable} ${urdu.variable} ${mono.variable}`}>
      <body>
        {/* Without scripts: no veil, every chapter in reading order. */}
        <noscript>
          <style>{`.intro{display:none}.stage,.stage--static{height:auto;overflow:visible}.stage .hero,.stage .chapter{position:relative;opacity:1;visibility:visible}.stage__roof,.hero__figure-in,.hero__name,.topbar,.rail{opacity:1;visibility:visible}`}</style>
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
