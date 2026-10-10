import { create } from 'zustand'

type UIState = {
  sudokuOpen: boolean
  setSudokuOpen: (open: boolean) => void
}

/** Small cross-component UI state: overlays that need to be opened from a chapter. */
export const useUI = create<UIState>((set) => ({
  sudokuOpen: false,
  setSudokuOpen: (sudokuOpen) => set({ sudokuOpen }),
}))
