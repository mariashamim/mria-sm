import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Fraunces, Gulzar, Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import SkyCanvas from '@/components/sky/SkyCanvas'
import SmoothScroll from '@/components/scroll/SmoothScroll'
import Intro from '@/components/ui/Intro'
import Cursor from '@/components/ui/Cursor'
import Rail from '@/components/ui/Rail'
import Menu from '@/components/ui/Menu'

const display = Big_Shoulders({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
})

const serif = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT', 'WONK'],
  variable: '--font-serif',
  display: 'swap',
})

const body = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const urdu = Gulzar({
  subsets: ['arabic'],
  weight: '400',
  variable: '--font-urdu',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Maria',
  description: 'Born under the Karachi sky. A story, not a resume.',
  openGraph: {
    title: 'Maria',
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
    <html lang="en" data-ui="paper" className={`${display.variable} ${serif.variable} ${body.variable} ${urdu.variable} ${mono.variable}`}>
      <body>
        <SkyCanvas />
        <SmoothScroll />
        <Intro />
        <Cursor />
        <Menu />
        <Rail />
        <main>{children}</main>
      </body>
    </html>
  )
}
