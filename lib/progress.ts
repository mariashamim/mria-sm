import { create } from 'zustand'
import { chapters, type Chapter } from '@/content/chapters'

type ProgressState = {
  /** Continuous sky value in [0, 10]; see lib/sky.ts. Written per scroll frame by the stage. */
  sky: number
  /** Index of the chapter currently pinned / in view. */
  active: number
  setSky: (sky: number) => void
  setActive: (active: number) => void
}

export const useProgress = create<ProgressState>((set) => ({
  sky: 0,
  active: 0,
  setSky: (sky) => set({ sky }),
  setActive: (active) => set({ active }),
}))

/** Called by a chapter when it becomes the one in view. */
export function activateChapter(chapter: Chapter) {
  useProgress.getState().setActive(chapter.index)
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.ui = chapter.ui
    document.documentElement.dataset.chapter = chapter.id
  }
}

export function chapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id)
}
