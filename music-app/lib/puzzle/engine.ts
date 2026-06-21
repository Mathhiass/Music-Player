export type PuzzlePiece = {
  id: number
  correctRow: number
  correctCol: number
  currentRow: number
  currentCol: number
  isPlaced: boolean
}

export function generatePieces(gridSize: number): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = []
  let id = 0
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      pieces.push({ id: id++, correctRow: r, correctCol: c, currentRow: -1, currentCol: -1, isPlaced: false })
    }
  }
  // shuffle order so tray is randomized
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pieces[i], pieces[j]] = [pieces[j], pieces[i]]
  }
  return pieces
}

export function checkComplete(pieces: PuzzlePiece[]) {
  return pieces.every(p => p.isPlaced && p.currentRow === p.correctRow && p.currentCol === p.correctCol)
}

export function calcScore(completionMs: number, gridSize: number) {
  const timeSec = Math.max(1, completionMs / 1000)
  const base = 1000 * gridSize
  return Math.max(0, Math.round(base / timeSec))
}

export function getPieceClipPath(correctRow: number, correctCol: number, gridSize: number, pieceSize: number) {
  // background positioning to show the correct crop of the artwork
  const backgroundSize = `${gridSize * pieceSize}px ${gridSize * pieceSize}px`
  const backgroundPosition = `-${correctCol * pieceSize}px -${correctRow * pieceSize}px`
  // use a simple rectangular clip (inset) — components style rounding separately
  const clipPath = `inset(0px)`
  return { clipPath, backgroundPosition, backgroundSize }
}