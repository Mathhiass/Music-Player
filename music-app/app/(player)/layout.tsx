import { PlayerBar } from '@/components/player/PlayerBar'
import { PuzzleOverlay } from '@/components/puzzle/PuzzleOverlay'
import { AudioEngineProvider } from '@/components/player/AudioEngineProvider'

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudioEngineProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 90 }}>
        <main style={{ flex: 1 }}>{children}</main>
        <PlayerBar />
        <PuzzleOverlay />
      </div>
    </AudioEngineProvider>
  )
}