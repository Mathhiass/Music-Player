import { create } from 'zustand'
import { PuzzlePiece, generatePieces, checkComplete, calcScore } from '@/lib/puzzle/engine'
import type { Song } from './playerStore'

interface PuzzleState {
  isOpen: boolean
  gridSize: number
  pieces: PuzzlePiece[]
  startTime: number | null
  completionMs: number | null
  score: number | null
  totalScore: number | null
  openPuzzle: (gridSize?: number) => void
  closePuzzle: () => void
  placePiece: (pieceId: number, row: number, col: number) => void
  removePiece: (pieceId: number) => void
  savePuzzleScore: (completionMs: number, score: number, gridSize: number) => Promise<void>
  setTotalScore: (score: number) => void
}

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  isOpen: false,
  gridSize: 3,
  pieces: [],
  startTime: null,
  completionMs: null,
  score: null,
  totalScore: null,

  openPuzzle: (gridSize = 3) =>
    set({ isOpen: true, gridSize, pieces: generatePieces(gridSize), startTime: Date.now(), completionMs: null, score: null }),

  closePuzzle: () => set({ isOpen: false }),

  placePiece: (pieceId, row, col) => {
    const { pieces, startTime, gridSize } = get()
    const updated = pieces.map(p => {
      if (p.currentRow === row && p.currentCol === col && p.id !== pieceId)
        return { ...p, currentRow: -1, currentCol: -1, isPlaced: false }
      if (p.id === pieceId)
        return { ...p, currentRow: row, currentCol: col, isPlaced: true }
      return p
    })
    const complete = checkComplete(updated)
    const completionMs = complete ? Date.now() - (startTime ?? 0) : null
    const score = complete ? calcScore(completionMs!, gridSize) : null
    set({ pieces: updated, completionMs, score })
    if (complete) get().savePuzzleScore(completionMs!, score!, gridSize)
  },

  removePiece: (pieceId) => set(s => ({
    pieces: s.pieces.map(p => p.id === pieceId ? { ...p, currentRow: -1, currentCol: -1, isPlaced: false } : p)
  })),

  savePuzzleScore: async (completionMs: number, score: number, gridSize: number) => {
    const player = await import('./playerStore')
    const songId = player.usePlayerStore.getState().currentSong?.id
    if (!songId) return
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId, completionMs, score, gridSize }),
    })
    if (res.ok) {
      set(state => ({ totalScore: (state.totalScore ?? 0) + score }))
    }
  },

  setTotalScore: (score) => set({ totalScore: score }),
}))