'use client'
import React, { useEffect, useState } from 'react'
import { usePlayerStore, type Song } from '@/store/playerStore'
import { usePuzzleStore } from '@/store/puzzleStore'

export default function Library() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayerStore()
  const openPuzzle = usePuzzleStore(s => s.openPuzzle)

  const fetchLibrary = () => {
    setLoading(true)
    fetch('/api/library')
      .then(res => res.json())
      .then(data => {
        setSongs(data.songs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchLibrary()
  }, [])

  const removeFromLibrary = async (songId: string) => {
    try {
      const res = await fetch(`/api/library?songId=${songId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSongs(prev => prev.filter(s => s.id !== songId))
      }
    } catch {}
  }

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song, songs)
      setIsPlaying(true)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Your Library</h2>
        <p className="text-zinc-400 text-sm mt-1">Your liked tracks and saved puzzles</p>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : songs.length > 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/35 overflow-hidden">
          <div className="divide-y divide-zinc-800/60">
            {songs.map((song) => {
              const isCurrent = currentSong?.id === song.id

              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/25 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Artwork w/ play hover */}
                    <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-zinc-800">
                      <img src={song.artworkUrl || '/placeholder.png'} alt={song.title} className="h-full w-full object-cover" />
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs"
                      >
                        {isCurrent && isPlaying ? '⏸' : '▶️'}
                      </button>
                    </div>

                    <div className="min-w-0">
                      <p className={`font-medium truncate text-sm ${isCurrent ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {song.title}
                      </p>
                      <p className="text-zinc-500 text-xs truncate mt-0.5">{song.artist?.name || 'Unknown Artist'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Remove Heart */}
                    <button
                      onClick={() => removeFromLibrary(song.id)}
                      className="text-red-500 hover:text-zinc-400 transition-colors text-base cursor-pointer"
                      title="Remove from library"
                    >
                      ❤️
                    </button>

                    {/* Jigsaw Play Button */}
                    <button
                      onClick={() => {
                        setCurrentSong(song)
                        setIsPlaying(true)
                        setTimeout(() => openPuzzle(3), 100)
                      }}
                      className="text-xs font-medium cursor-pointer bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all"
                    >
                      🧩 Solve Jigsaw
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center border border-dashed border-zinc-800 rounded-2xl py-16 text-zinc-500 text-sm">
          <p className="text-lg mb-2">No tracks in your library yet</p>
          <p className="text-zinc-600">Start liking songs or select "Puzzle" to add to your rotation!</p>
        </div>
      )}
    </div>
  )
}
