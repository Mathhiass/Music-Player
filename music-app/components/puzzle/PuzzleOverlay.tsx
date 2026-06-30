'use client'
import React, { useEffect, useState } from 'react'
import { DndContext, useDroppable } from '@dnd-kit/core'
import { usePuzzleStore } from '@/store/puzzleStore'
import { usePlayerStore } from '@/store/playerStore'
import { PuzzlePiece } from './PuzzlePiece'

interface BoardProps { artworkUrl: string; gridSize: number; pieceSize: number }

function Cell({ row, col, artworkUrl, gridSize, pieceSize }: {
  row: number; col: number; artworkUrl: string; gridSize: number; pieceSize: number
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `cell-${row}-${col}` })
  const piece = usePuzzleStore(s =>
    s.pieces.find(p => p.currentRow === row && p.currentCol === col && p.isPlaced)
  )

  const backgroundSize = `${gridSize * pieceSize}px ${gridSize * pieceSize}px`
  const backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`

  return (
    <div
      ref={setNodeRef}
      className={`rounded transition-all duration-200 ${
        isOver ? 'border-emerald-400 bg-emerald-500/20 shadow-inner' : 'border-zinc-800/40 bg-zinc-950/40'
      }`}
      style={{
        width: pieceSize,
        height: pieceSize,
        position: 'relative',
        overflow: 'visible',
        border: '1px solid rgba(63, 63, 70, 0.4)',
      }}
    >
      {!piece && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${artworkUrl})`,
            backgroundSize,
            backgroundPosition,
            opacity: 0.12,
            filter: 'grayscale(60%)',
            pointerEvents: 'none',
            borderRadius: 4,
          }}
        />
      )}
      {piece && (
        <PuzzlePiece piece={piece} artworkUrl={artworkUrl} pieceSize={pieceSize} gridSize={gridSize} />
      )}
    </div>
  )
}

function PuzzleBoard({ artworkUrl, gridSize, pieceSize }: BoardProps) {
  return (
    <div
      className="grid gap-1 bg-zinc-900 p-2 rounded-xl border border-zinc-800/80 shadow-lg justify-center align-middle"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, ${pieceSize}px)`,
        width: gridSize * pieceSize + 16,
      }}
    >
      {Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => (
          <Cell key={`${r}-${c}`} row={r} col={c}
            artworkUrl={artworkUrl} gridSize={gridSize} pieceSize={pieceSize} />
        ))
      )}
    </div>
  )
}

export function PuzzleOverlay() {
  const { currentSong } = usePlayerStore()
  const {
    isOpen,
    gridSize,
    pieces,
    startTime,
    completionMs,
    score,
    openPuzzle,
    closePuzzle,
    placePiece,
    removePiece,
  } = usePuzzleStore()

  const [elapsed, setElapsed] = useState(0)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  // Live Timer
  useEffect(() => {
    if (!startTime || completionMs || !isOpen) {
      if (!isOpen) setElapsed(0)
      return
    }
    setElapsed(Math.floor((Date.now() - startTime) / 1000))
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime, completionMs, isOpen])

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    if (!currentSong?.id) return
    try {
      const res = await fetch(`/api/scores?songId=${currentSong.id}&gridSize=${gridSize}`)
      const data = await res.json()
      setLeaderboard(data.scores || [])
    } catch {}
  }

  useEffect(() => {
    if (isOpen && currentSong?.id) {
      fetchLeaderboard()
    }
  }, [isOpen, currentSong?.id, gridSize])

  // Refresh leaderboard when completion status changes
  useEffect(() => {
    if (completionMs) {
      setTimeout(() => {
        fetchLeaderboard()
      }, 500)
    }
  }, [completionMs])

  if (!isOpen || !currentSong) return null

  const pieceSize = Math.floor(300 / gridSize)
  const trayPieces = pieces.filter(p => !p.isPlaced)

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over) {
      removePiece(active.id)
      return
    }

    const overId = String(over.id)
    if (overId.startsWith('cell-')) {
      const [, r, c] = overId.split('-')
      placePiece(active.id, Number(r), Number(c))
    } else {
      removePiece(active.id)
    }
  }

  const formatElapsedTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Main Board & Tray Area */}
          <div className="flex-1 p-6 flex flex-col items-center justify-between min-h-[480px]">
            <div className="text-center w-full mb-4">
              <h3 className="text-lg font-bold text-zinc-100 truncate max-w-md mx-auto">{currentSong.title}</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Solve the cover art jigsaw</p>
            </div>

            {/* Board */}
            <div className="relative my-auto">
              <PuzzleBoard artworkUrl={currentSong.artworkUrl ?? ''} gridSize={gridSize} pieceSize={pieceSize} />
              
              {/* Victory Celebration Overlay */}
              {completionMs !== null && (
                <div className="absolute inset-0 bg-zinc-900/95 flex flex-col items-center justify-center rounded-xl p-4 text-center border border-emerald-500/20">
                  <span className="text-4xl animate-bounce">🎉</span>
                  <h4 className="text-xl font-bold text-emerald-400 mt-3">Puzzle Solved!</h4>
                  <p className="text-zinc-300 text-sm mt-1">Time: {formatElapsedTime(Math.floor(completionMs / 1000))}</p>
                  <p className="text-emerald-300 text-xs font-semibold mt-1">Score: {score} pts</p>
                  
                  <button
                    onClick={() => openPuzzle(gridSize)}
                    className="mt-6 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Tray */}
            <div className="w-full mt-6 bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4">
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Your Pieces Tray</p>
              <div className="flex flex-wrap gap-2 justify-center min-h-[82px] items-center">
                {trayPieces.length > 0 ? (
                  trayPieces.map(piece => (
                    <div key={piece.id} className="relative group shrink-0">
                      <PuzzlePiece
                        piece={piece}
                        artworkUrl={currentSong.artworkUrl ?? ''}
                        pieceSize={60}
                        gridSize={gridSize}
                        inTray={true}
                      />
                    </div>
                  ))
                ) : (
                  completionMs === null && (
                    <p className="text-zinc-600 text-xs italic">All pieces placed on the board!</p>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Details / Sidebar Panel */}
          <div className="w-full md:w-80 bg-zinc-900/50 border-l border-zinc-800 p-6 flex flex-col justify-between select-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <span className="font-bold text-zinc-100 text-sm">Jigsaw Controller</span>
                <button
                  onClick={closePuzzle}
                  className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-base"
                >
                  ✕
                </button>
              </div>

              {/* Grid Selector */}
              <div className="space-y-2">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Difficulty (Grid Size)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5].map(size => (
                    <button
                      key={size}
                      onClick={() => openPuzzle(size)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        gridSize === size
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer & Stats */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-950/30 p-4 border border-zinc-800/80 rounded-xl">
                <div>
                  <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Time Elapsed</p>
                  <p className="text-xl font-bold text-zinc-100 font-mono mt-0.5">{formatElapsedTime(elapsed)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Target Grid</p>
                  <p className="text-xl font-bold text-zinc-100 mt-0.5">{gridSize}x{gridSize}</p>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="space-y-3">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Leaderboard (Top Scores)</label>
                {leaderboard.length > 0 ? (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {leaderboard.map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center text-xs p-2 rounded bg-zinc-950/20 border border-zinc-900/60 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>
                            #{index + 1}
                          </span>
                          <span className="text-zinc-300 truncate max-w-[120px]">{item.user?.username || 'User'}</span>
                        </div>
                        <div className="text-emerald-400 font-bold">{item.score} pts</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-600 text-xs italic">No high scores yet. Be the first to solve it!</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 text-center">
              <button
                onClick={() => openPuzzle(gridSize)}
                className="w-full py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-xl text-xs font-bold text-zinc-300 hover:text-zinc-100 transition-all cursor-pointer"
              >
                Restart Puzzle
              </button>
            </div>

          </div>

        </div>
      </div>
    </DndContext>
  )
}