'use client'
import { usePlayerStore } from '@/store/playerStore'
import { usePuzzleStore } from '@/store/puzzleStore'
import { PlayerControls } from './PlayerControls'

export function PlayerBar() {
  const { currentSong, progress, duration } = usePlayerStore()
  const openPuzzle = usePuzzleStore(s => s.openPuzzle)

  if (!currentSong) return null

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 80,
      background: 'var(--color-background-secondary)',
      borderTop: '1px solid var(--color-border-tertiary)',
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px',
      zIndex: 50,
    }}>
      {/* Artwork — click to open puzzle */}
      <button onClick={() => openPuzzle(3)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <img src={currentSong.artworkUrl ?? '/placeholder.png'} alt="Album art"
          style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover' }} />
      </button>

      <div style={{ minWidth: 160 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {currentSong.title}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {currentSong.artist?.name ?? ''}
        </p>
      </div>

      <PlayerControls />

      {/* Progress bar */}
      <div style={{ flex: 1, height: 4, background: 'var(--color-border-tertiary)', borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-text-primary)', borderRadius: 2, transition: 'width 0.5s linear' }} />
      </div>

      {/* Puzzle button */}
      <button onClick={() => openPuzzle(3)}
        style={{ fontSize: 20, background: 'none', border: '1px solid var(--color-border-secondary)',
          borderRadius: 8, padding: '4px 12px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
        title="Open puzzle">
        🧩
      </button>
    </div>
  )
}