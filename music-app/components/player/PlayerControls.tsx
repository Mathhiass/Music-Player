'use client'
import React from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

export function PlayerControls() {
  const { isPlaying, setIsPlaying, playNext, playPrevious } = usePlayerStore()
  return (
    <div className="flex items-center gap-4 shrink-0 select-none">
      {/* Skip Backward Button */}
      <button 
        onClick={playPrevious}
        className="text-zinc-400 hover:text-zinc-200 p-1.5 transition-colors cursor-pointer" 
        title="Previous"
      >
        <SkipBack className="h-5 w-5 fill-current" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="h-10 w-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-200 text-black hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Play className="h-5 w-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Skip Forward Button */}
      <button 
        onClick={playNext}
        className="text-zinc-400 hover:text-zinc-200 p-1.5 transition-colors cursor-pointer" 
        title="Next"
      >
        <SkipForward className="h-5 w-5 fill-current" />
      </button>
    </div>
  )
}

export default PlayerControls
