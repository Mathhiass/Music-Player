'use client'
import { useDraggable } from '@dnd-kit/core'
import { getPieceClipPath } from '@/lib/puzzle/engine'
import type { PuzzlePiece as TPiece } from '@/lib/puzzle/engine'

interface Props {
  piece: TPiece
  artworkUrl: string
  pieceSize: number
  gridSize: number
  inTray?: boolean
}

export function PuzzlePiece({ piece, artworkUrl, pieceSize, gridSize, inTray = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
    data: { piece },
  })

  const { clipPath, backgroundPosition, backgroundSize } = getPieceClipPath(
    piece.correctRow, piece.correctCol, gridSize, pieceSize
  )

  const style: React.CSSProperties = {
    width: pieceSize,
    height: pieceSize,
    backgroundImage: `url(${artworkUrl})`,
    backgroundSize,
    backgroundPosition,
    clipPath,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.5 : 1,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.15s ease, box-shadow 0.15s ease',
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
    borderRadius: 4,
    userSelect: 'none',
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
  }

  return <div ref={setNodeRef} style={style} {...listeners} {...attributes} />
}