'use client'
import React, { useState, useEffect } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { usePuzzleStore } from '@/store/puzzleStore'
import { PlayerControls } from './PlayerControls'
import { Heart, Shuffle, Repeat, Volume2, VolumeX, Puzzle, Mic, ListMusic, Laptop } from 'lucide-react'

const formatTime = (sec: number) => {
  if (isNaN(sec) || sec === null || sec === undefined) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export function PlayerBar() {
  const { 
    currentSong, 
    progress, 
    duration, 
    audio, 
    volume, 
    setVolume, 
    setProgress,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode 
  } = usePlayerStore()
  const openPuzzle = usePuzzleStore(s => s.openPuzzle)
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set())

  // Fetch library to check if current song is liked
  const fetchLibrary = () => {
    fetch('/api/library')
      .then(res => res.json())
      .then(data => {
        const ids = new Set<string>((data.songs || []).map((s: any) => s.id))
        setLibraryIds(ids)
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (currentSong?.id) {
      fetchLibrary()
    }
  }, [currentSong?.id])

  if (!currentSong) return null

  const isSaved = libraryIds.has(currentSong.id)

  const toggleLibrary = async () => {
    const method = isSaved ? 'DELETE' : 'POST'
    const url = isSaved ? `/api/library?songId=${currentSong.id}` : '/api/library'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isSaved ? undefined : JSON.stringify({
          songId: currentSong.id,
          title: currentSong.title,
          audioUrl: currentSong.audioUrl,
          artworkUrl: currentSong.artworkUrl,
          durationSeconds: currentSong.durationSeconds,
          artistName: currentSong.artist?.name
        }),
      })
      if (res.ok) {
        setLibraryIds(prev => {
          const next = new Set(prev)
          if (isSaved) next.delete(currentSong.id)
          else next.add(currentSong.id)
          return next
        })
      }
    } catch {}
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setProgress(val)
    if (audio) {
      audio.currentTime = val
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
  }

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 h-16 md:h-20 bg-[#08090c] border-t border-zinc-900/60 px-4 md:px-6 flex items-center justify-between z-50 shadow-2xl select-none">
      {/* Left: Artwork + Title */}
      <div className="flex items-center w-1/3 md:w-1/4 min-w-0 pr-2">
        <button
          onClick={() => openPuzzle(3)}
          className="h-10 w-10 md:h-14 md:w-14 shrink-0 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-850 hover:scale-105 active:scale-95 transition-transform duration-300 shadow cursor-pointer"
        >
          <img src={currentSong.artworkUrl || '/placeholder.png'} alt={currentSong.title} className="h-full w-full object-cover" />
        </button>
        <div className="min-w-0 flex flex-col items-start pl-2 pr-1">
          <p className="font-bold text-zinc-100 text-xs truncate w-full text-left">{currentSong.title}</p>
          <p className="text-zinc-500 text-[10px] truncate mt-0.5 font-medium w-full text-left">{currentSong.artist?.name ?? 'Unknown Artist'}</p>
        </div>
        <button
          onClick={toggleLibrary}
          className="hidden sm:block cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0 text-zinc-500 hover:text-zinc-300 ml-2"
          title={isSaved ? "Remove from Library" : "Save to Library"}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${isSaved ? 'text-indigo-500 fill-indigo-500' : ''}`} />
        </button>
      </div>

      {/* Center: Controls + Seek Bar */}
      <div className="flex-1 max-w-xl px-4 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleShuffle}
            className={`cursor-pointer transition-colors p-1 rounded-full ${
              isShuffle ? 'text-indigo-400 hover:text-indigo-300' : 'text-zinc-500 hover:text-zinc-200'
            }`} 
            title={isShuffle ? "Shuffle On" : "Shuffle Off"}
          >
            <Shuffle className="h-4 w-4" />
          </button>

          <PlayerControls />

          <button 
            onClick={toggleRepeatMode}
            className={`cursor-pointer transition-colors p-1 rounded-full relative ${
              repeatMode !== 'off' ? 'text-indigo-400 hover:text-indigo-300' : 'text-zinc-500 hover:text-zinc-200'
            }`} 
            title={`Repeat Mode: ${repeatMode}`}
          >
            <Repeat className="h-4 w-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white rounded-full text-[6px] font-extrabold h-2.5 w-2.5 flex items-center justify-center border border-[#0d0e12]">1</span>
            )}
          </button>
        </div>

        {/* Progress Slider */}
        <div className="w-full flex items-center gap-2.5 text-[9px] font-bold text-zinc-500 font-mono">
          <span className="w-8 text-right text-zinc-400">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 rounded bg-zinc-800 accent-indigo-500 hover:accent-indigo-400 focus:outline-none transition-all cursor-pointer"
          />
          <span className="w-8 text-zinc-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4 w-auto md:w-1/4 justify-end text-sm shrink-0">
        <button className="hidden sm:block text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer" title="Lyrics">
          <Mic className="h-4 w-4" />
        </button>

        <button className="hidden sm:block text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer" title="Queue">
          <ListMusic className="h-4 w-4" />
        </button>

        <button className="hidden sm:block text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer" title="Connect to device">
          <Laptop className="h-4 w-4" />
        </button>

        {/* Volume Control */}
        <div className="hidden md:flex items-center gap-2 group">
          <button onClick={() => setVolume(volume > 0 ? 0 : 0.5)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 rounded bg-zinc-800 accent-indigo-500 cursor-pointer focus:outline-none"
          />
        </div>

        {/* Puzzle Modal trigger */}
        <button
          onClick={() => openPuzzle(3)}
          className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 border border-zinc-800 hover:border-indigo-500/30 rounded-xl bg-zinc-900 hover:bg-indigo-500/10 text-zinc-300 hover:text-indigo-400 text-[9px] md:text-[10px] font-bold shadow transition-all duration-300 cursor-pointer hover:scale-105"
          title="Open puzzle game"
        >
          <Puzzle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Jigsaw</span>
        </button>
      </div>
    </div>
  )
}