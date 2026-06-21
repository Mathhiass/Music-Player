'use client'
import { useDroppable } from '@dnd-kit/core'
import { usePuzzleStore } from '@/store/puzzleStore'
import { PuzzlePiece } from './PuzzlePiece'

interface Props { artworkUrl: string; gridSize: number; pieceSize: number }

function Cell({ row, col, artworkUrl, gridSize, pieceSize }: {
  row: number; col: number; artworkUrl: string; gridSize: number; pieceSize: number
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `cell-${row}-${col}` })
  const piece = usePuzzleStore(s =>
    s.pieces.find(p => p.currentRow === row && p.currentCol === col && p.isPlaced)
  )

  return (
    <div
      ref={setNodeRef}
      style={{
        width: pieceSize, height: pieceSize,
        border: `1px solid ${isOver ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
        background: isOver ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
        borderRadius: 4,
        transition: 'border-color 0.15s, background 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {piece && (
        <PuzzlePiece piece={piece} artworkUrl={artworkUrl} pieceSize={pieceSize} gridSize={gridSize} />
      )}
    </div>
  )
}

export function PuzzleBoard({ artworkUrl, gridSize, pieceSize }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, ${pieceSize}px)`, gap: 4 }}>
      {Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => (
          <Cell key={`${r}-${c}`} row={r} col={c}
            artworkUrl={artworkUrl} gridSize={gridSize} pieceSize={pieceSize} />
        ))
      )}
    </div>
  )
}