import { create } from 'zustand'
import { chapters, type Chapter } from '@/content/chapters'
import type { Frame } from '@/lib/world'

type ProgressState = Frame & {
  /** Index of the chapter currently pinned / in view. */
  active: number
  /** True when cut-out cloud renders exist, so the sky shader leaves clouds to them. */
  cloudPlates: boolean
  setSky: (sky: number) => void
  /** Written once per scroll frame by the world layer: sky, camera height, travel. */
  setFrame: (frame: Frame) => void
  setActive: (active: number) => void
  setCloudPlates: (cloudPlates: boolean) => void
}

export const useProgress = create<ProgressState>((set) => ({
  sky: 0,
  rise: 0,
  travel: 0,
  active: 0,
  cloudPlates: false,
  setSky: (sky) => set({ sky }),
  setFrame: (frame) => set(frame),
  setActive: (active) => set({ active }),
  setCloudPlates: (cloudPlates) => set({ cloudPlates }),
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
