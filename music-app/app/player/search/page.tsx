'use client'
import React, { useEffect, useState } from 'react'
import { usePlayerStore, type Song } from '@/store/playerStore'
import { usePuzzleStore } from '@/store/puzzleStore'
import { Search as SearchIcon, Heart, Play, Pause, Puzzle } from 'lucide-react'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set())

  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayerStore()
  const openPuzzle = usePuzzleStore(s => s.openPuzzle)

  useEffect(() => {
    // Fetch user library on load to show hearts
    fetch('/api/library')
      .then(res => res.json())
      .then(data => {
        const ids = new Set<string>((data.songs || []).map((s: Song) => s.id))
        setLibraryIds(ids)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true)
      fetch(`/api/songs?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.songs || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const toggleLibrary = async (song: Song) => {
    const isSaved = libraryIds.has(song.id)
    const method = isSaved ? 'DELETE' : 'POST'
    const url = isSaved ? `/api/library?songId=${song.id}` : '/api/library'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isSaved ? undefined : JSON.stringify({
          songId: song.id,
          title: song.title,
          audioUrl: song.audioUrl,
          artworkUrl: song.artworkUrl,
          durationSeconds: song.durationSeconds,
          artistName: song.artist?.name
        }),
      })
      if (res.ok) {
        setLibraryIds(prev => {
          const next = new Set(prev)
          if (isSaved) next.delete(song.id)
          else next.add(song.id)
          return next
        })
      }
    } catch {}
  }

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song)
      setIsPlaying(true)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Search</h2>
        <p className="text-zinc-400 text-sm mt-1">Find tracks by title, artist, or album</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-100 placeholder-zinc-500 transition-all text-base shadow-lg"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/35 overflow-hidden">
            <div className="divide-y divide-zinc-800/60">
              {results.map((song) => {
                const isCurrent = currentSong?.id === song.id
                const isSaved = libraryIds.has(song.id)

                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-4 hover:bg-zinc-800/25 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Image w/ play trigger */}
                      <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-zinc-800">
                        <img src={song.artworkUrl || '/placeholder.png'} alt={song.title} className="h-full w-full object-cover" />
                        <button
                          onClick={() => handlePlaySong(song)}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs"
                        >
                          {isCurrent && isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
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
                      {/* Save Heart */}
                      <button
                        onClick={() => toggleLibrary(song)}
                        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        title={isSaved ? "Remove from Library" : "Save to Library"}
                      >
                        <Heart className={`h-5 w-5 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-zinc-500 hover:text-zinc-300'}`} />
                      </button>

                      {/* Jigsaw Puzzle Play button */}
                      <button
                        onClick={() => {
                          setCurrentSong(song)
                          setIsPlaying(true)
                          setTimeout(() => openPuzzle(3), 100)
                        }}
                        className="flex items-center gap-2 text-xs font-semibold cursor-pointer bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                      >
                        <Puzzle className="h-4 w-4 text-orange-500" /> Play Jigsaw
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : query ? (
          <p className="text-center text-zinc-500 py-12 text-sm">No results found for "{query}"</p>
        ) : (
          <p className="text-center text-zinc-500 py-12 text-sm">Search above to explore new sounds</p>
        )}
      </div>
    </div>
  )
}
