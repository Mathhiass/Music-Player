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

function getEdgeSegmentPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  type: number
): string {
  if (type === 0) {
    return `L ${endX.toFixed(1)} ${endY.toFixed(1)}`
  }

  const dx = endX - startX
  const dy = endY - startY
  const L = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / L
  const uy = dy / L

  // Normal vector: points outward relative to clockwise boundary
  // v = (uy, -ux)
  const vx = uy
  const vy = -ux

  const dir = type // 1 for tab, -1 for blank

  const p0x = startX + 0.38 * L * ux
  const p0y = startY + 0.38 * L * uy

  const cp1x = startX + 0.36 * L * ux + 0.04 * L * vx * dir
  const cp1y = startY + 0.36 * L * uy + 0.04 * L * vy * dir

  const cp2x = startX + 0.38 * L * ux + 0.08 * L * vx * dir
  const cp2y = startY + 0.38 * L * uy + 0.08 * L * vy * dir

  const p1x = startX + 0.42 * L * ux + 0.08 * L * vx * dir
  const p1y = startY + 0.42 * L * uy + 0.08 * L * vy * dir

  const cp3x = startX + 0.46 * L * ux + 0.08 * L * vx * dir
  const cp3y = startY + 0.46 * L * uy + 0.08 * L * vy * dir

  const cp4x = startX + 0.44 * L * ux + 0.24 * L * vx * dir
  const cp4y = startY + 0.44 * L * uy + 0.24 * L * vy * dir

  const p2x = startX + 0.50 * L * ux + 0.24 * L * vx * dir
  const p2y = startY + 0.50 * L * uy + 0.24 * L * vy * dir

  const cp5x = startX + 0.56 * L * ux + 0.24 * L * vx * dir
  const cp5y = startY + 0.56 * L * uy + 0.24 * L * vy * dir

  const cp6x = startX + 0.54 * L * ux + 0.08 * L * vx * dir
  const cp6y = startY + 0.54 * L * uy + 0.08 * L * vy * dir

  const p3x = startX + 0.58 * L * ux + 0.08 * L * vx * dir
  const p3y = startY + 0.58 * L * uy + 0.08 * L * vy * dir

  const cp7x = startX + 0.62 * L * ux + 0.08 * L * vx * dir
  const cp7y = startY + 0.62 * L * uy + 0.08 * L * vy * dir

  const cp8x = startX + 0.64 * L * ux + 0.04 * L * vx * dir
  const cp8y = startY + 0.64 * L * uy + 0.04 * L * vy * dir

  const p4x = startX + 0.62 * L * ux
  const p4y = startY + 0.62 * L * uy

  return `L ${p0x.toFixed(1)} ${p0y.toFixed(1)} ` +
         `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1x.toFixed(1)} ${p1y.toFixed(1)} ` +
         `C ${cp3x.toFixed(1)} ${cp3y.toFixed(1)}, ${cp4x.toFixed(1)} ${cp4y.toFixed(1)}, ${p2x.toFixed(1)} ${p2y.toFixed(1)} ` +
         `C ${cp5x.toFixed(1)} ${cp5y.toFixed(1)}, ${cp6x.toFixed(1)} ${cp6y.toFixed(1)}, ${p3x.toFixed(1)} ${p3y.toFixed(1)} ` +
         `C ${cp7x.toFixed(1)} ${cp7y.toFixed(1)}, ${cp8x.toFixed(1)} ${cp8y.toFixed(1)}, ${p4x.toFixed(1)} ${p4y.toFixed(1)} ` +
         `L ${endX.toFixed(1)} ${endY.toFixed(1)}`
}

export function getPieceClipPath(correctRow: number, correctCol: number, gridSize: number, pieceSize: number) {
  const offset = pieceSize * 0.2
  const S = pieceSize
  const totalSize = S + 2 * offset

  const backgroundSize = `${gridSize * S}px ${gridSize * S}px`
  const backgroundPosition = `${-correctCol * S + offset}px ${-correctRow * S + offset}px`

  const getEdgeType = (r: number, c: number, edge: 'right' | 'bottom') => {
    const seed = (r * 17 + c * 31 + (edge === 'right' ? 3 : 7)) * 10007
    return (seed % 2 === 0) ? 1 : -1
  }

  const top = correctRow === 0 ? 0 : -getEdgeType(correctRow - 1, correctCol, 'bottom')
  const bottom = correctRow === gridSize - 1 ? 0 : getEdgeType(correctRow, correctCol, 'bottom')
  const left = correctCol === 0 ? 0 : -getEdgeType(correctRow, correctCol - 1, 'right')
  const right = correctCol === gridSize - 1 ? 0 : getEdgeType(correctRow, correctCol, 'right')

  const oX = offset
  const oY = offset

  const topPath = getEdgeSegmentPath(oX, oY, oX + S, oY, top)
  const rightPath = getEdgeSegmentPath(oX + S, oY, oX + S, oY + S, right)
  const bottomPath = getEdgeSegmentPath(oX + S, oY + S, oX, oY + S, bottom)
  const leftPath = getEdgeSegmentPath(oX, oY + S, oX, oY, left)

  const clipPath = `path('M ${oX.toFixed(1)} ${oY.toFixed(1)} ${topPath} ${rightPath} ${bottomPath} ${leftPath} Z')`

  return { clipPath, backgroundPosition, backgroundSize, offset, totalSize }
}