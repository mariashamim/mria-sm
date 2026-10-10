import { chapters } from '@/content/chapters'
import Hero from '@/components/chapters/Hero'
import Chapter from '@/components/chapters/Chapter'

export default function Page() {
  const [hero, ...rest] = chapters
  return (
    <>
      <Hero chapter={hero} />
      {rest.map((c) => (
        <Chapter key={c.id} chapter={c} />
      ))}
      <footer className="colophon">
        <span>Made under the Karachi sky, 2026</span>
        <span lang="ur">آسمان</span>
      </footer>
    </>
  )
}
