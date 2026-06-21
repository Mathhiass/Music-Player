'use client'
import { PuzzlePiece } from './PuzzlePiece'

interface Props {
  artworkUrl: string
  gridSize: number
  pieceSize: number
}

export function PuzzleBoard({ artworkUrl, gridSize, pieceSize }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, ${pieceSize}px)`, gap: 4 }}>
      {Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => (
          <div key={`${r}-${c}`}>
            {/* Cells are rendered by PuzzleOverlay/Cell */}
          </div>
        ))
      )}
    </div>
  )
}