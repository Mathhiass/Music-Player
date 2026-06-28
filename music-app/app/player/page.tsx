'use client'
import React, { useEffect, useState } from 'react'
import { usePlayerStore, type Song } from '@/store/playerStore'
import { usePuzzleStore } from '@/store/puzzleStore'
import { Search, Bell, Upload, Play, Pause, Puzzle, Heart, Share2, Flame } from 'lucide-react'

export default function PlayerHome() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [username, setUsername] = useState('')

  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayerStore()
  const openPuzzle = usePuzzleStore(s => s.openPuzzle)

  useEffect(() => {
    // Fetch user details
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data?.user) setUsername(data.user.username)
      })
      .catch(() => {})

    // Fetch songs
    fetch('/api/songs')
      .then(res => res.json())
      .then(data => {
        const loadedSongs = data.songs || []
        setSongs(loadedSongs)
        setLoading(false)
        if (loadedSongs.length > 0 && !usePlayerStore.getState().currentSong) {
          setCurrentSong(loadedSongs[0], loadedSongs)
        }
      })
      .catch(() => setLoading(false))

    // Fetch library
    fetch('/api/library')
      .then(res => res.json())
      .then(data => {
        const ids = new Set<string>((data.songs || []).map((s: Song) => s.id))
        setLibraryIds(ids)
      })
      .catch(() => {})
  }, [setCurrentSong])

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song, songs)
      setIsPlaying(true)
    }
  }

  const isSaved = (id: string) => libraryIds.has(id)

  const toggleLibrary = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation()
    const saved = isSaved(song.id)
    const method = saved ? 'DELETE' : 'POST'
    const url = saved ? `/api/library?songId=${song.id}` : '/api/library'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: saved ? undefined : JSON.stringify({
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
          if (saved) next.delete(song.id)
          else next.add(song.id)
          return next
        })
      }
    } catch {}
  }

  // Filter songs based on search query
  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.artist?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Use currently playing song for Hero details, falling back to first song
  const heroSong = currentSong || songs[0]

  const getInitials = (name: string) => {
    if (!name) return 'JD'
    return name.slice(0, 2).toUpperCase()
  }

  const formatDuration = (sec: number) => {
    if (!sec) return '3:45'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-[#0d0e12]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 bg-[#0d0e12] min-h-screen text-white select-none pb-12">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-6 pb-2 border-b border-zinc-900/40">
        {/* Search Input */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full pl-11 pr-4 py-2 rounded-full bg-[#101217] border border-zinc-900 focus:outline-none focus:border-zinc-800 text-xs placeholder-zinc-500 text-zinc-100 transition-colors"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="text-zinc-400 hover:text-zinc-200 p-2 hover:bg-zinc-900 rounded-full transition-colors cursor-pointer relative">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-[#101217] hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 rounded-full text-xs font-bold transition-all cursor-pointer">
            <Upload className="h-4 w-4" /> Upload
          </button>

          {/* User Initial Circle Badge */}
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-indigo-500/30">
            {getInitials(username)}
          </div>
        </div>
      </div>

      {/* Hero Header Area (Synthwave / Featured Album) */}
      {heroSong && (
        <div className="relative bg-gradient-to-r from-indigo-950/20 via-zinc-950/40 to-indigo-950/5 border border-indigo-500/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full md:w-auto">
            {/* Artwork Cover */}
            <div className="h-32 w-32 md:h-36 md:w-36 rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-2xl border border-zinc-800/80">
              <img src={heroSong.artworkUrl || '/placeholder.png'} alt={heroSong.title} className="h-full w-full object-cover" />
            </div>

            {/* Metadata Text */}
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-900/40 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                  {currentSong?.id === heroSong.id ? 'Now Playing' : 'Featured Album'}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/20 px-2 py-0.5 rounded-md">
                  Synthwave
                </span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">{heroSong.title}</h2>
              <p className="text-sm font-semibold text-zinc-400">{heroSong.artist?.name || 'Unknown Artist'}</p>
              <p className="text-[10px] text-zinc-500 font-medium">
                {heroSong.album?.title || 'Single'} • 2023 • 12.4M plays
              </p>

              {/* Quick Actions Panel */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handlePlaySong(heroSong)}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  {currentSong?.id === heroSong.id && isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-current" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" /> Play Now
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => toggleLibrary(heroSong, e)}
                  className={`p-2 rounded-full border transition-all cursor-pointer hover:scale-105 ${
                    isSaved(heroSong.id)
                      ? 'border-indigo-500 bg-indigo-950/20 text-indigo-400'
                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Like Song"
                >
                  <Heart className={`h-4 w-4 ${isSaved(heroSong.id) ? 'fill-current' : ''}`} />
                </button>

                <button
                  className="p-2 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer hover:scale-105"
                  title="Share Album"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    setCurrentSong(heroSong)
                    setIsPlaying(true)
                    setTimeout(() => openPuzzle(3), 100)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:border-indigo-500/20 rounded-full text-xs font-semibold text-zinc-300 hover:text-indigo-400 transition-all cursor-pointer hover:scale-105"
                >
                  <Puzzle className="h-3.5 w-3.5" /> Puzzle Mode
                </button>
              </div>
            </div>
          </div>

          {/* Far Right: Visualizer Bars */}
          <div className="hidden md:flex items-end gap-1 h-16 px-4 z-10 shrink-0">
            {[35, 60, 45, 75, 55, 90, 65, 80, 40, 60, 50, 70, 45, 60, 30].map((val, idx) => (
              <span
                key={idx}
                className="w-1 bg-indigo-500/40 rounded-t-sm"
                style={{
                  height: `${val}%`,
                  animationName: isPlaying ? 'bounce' : 'none',
                  animationDuration: '1s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDirection: 'alternate',
                  animationDelay: `${idx * 0.08}s`
                }}
              />
            ))}
          </div>

          {/* Background Gradients */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none rounded-r-2xl"></div>
        </div>
      )}

      {/* Trending Now numbered track list (matches Figma layout) */}
      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="text-base font-bold tracking-tight text-zinc-200">Trending Now</h3>
          </div>
          <button className="text-xs font-bold text-zinc-500 hover:text-indigo-400 transition-colors">See all</button>
        </div>

        <div className="rounded-xl border border-zinc-900/60 bg-[#0a0b0f] overflow-hidden">
          <div className="divide-y divide-zinc-900/40">
            {songs.slice(0, 6).map((song, index) => {
              const isCurrent = currentSong?.id === song.id
              const playCountMock = `${[12.4, 9.8, 7.2, 18.1, 31.5, 5.9][index] || 4.2}M plays`
              return (
                <div
                  key={`trending-${song.id}`}
                  onClick={() => handlePlaySong(song)}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors group ${
                    isCurrent ? 'bg-indigo-950/15 text-indigo-400' : 'hover:bg-zinc-900/20'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Index or Play icon */}
                    <span className="w-5 text-center text-zinc-600 font-mono text-xs font-bold group-hover:text-indigo-400">
                      {index + 1}
                    </span>

                    {/* Image Cover */}
                    <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-zinc-800">
                      <img src={song.artworkUrl || '/placeholder.png'} alt={song.title} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        {isCurrent && isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                      </div>
                    </div>

                    {/* Song Detail */}
                    <div className="min-w-0">
                      <p className={`font-semibold text-xs truncate ${isCurrent ? 'text-indigo-400' : 'text-zinc-200'}`}>
                        {song.title}
                      </p>
                      <p className="text-zinc-500 text-[10px] truncate mt-0.5 font-medium">{song.artist?.name || 'Unknown Artist'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-xs font-semibold text-zinc-500 shrink-0">
                    <span className="hidden sm:inline font-medium">{playCountMock}</span>
                    <span className="font-mono text-[10px] w-10 text-right">{formatDuration(song.durationSeconds ?? 0)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recommended Albums Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-yellow-500">⭐</span>
            <h3 className="text-base font-bold tracking-tight text-zinc-200">Recommended Albums</h3>
          </div>
          <button className="text-xs font-bold text-zinc-500 hover:text-indigo-400 transition-colors">See all</button>
        </div>

        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredSongs.map((song) => {
            const isCurrent = currentSong?.id === song.id
            return (
              <div
                key={song.id}
                className="group flex flex-col cursor-pointer bg-[#0e0f14] hover:bg-[#14161f] border border-zinc-900 hover:border-zinc-800/80 p-3.5 rounded-2xl transition-all duration-300 hover:shadow-xl"
                onClick={() => handlePlaySong(song)}
              >
                {/* Image Cover */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-800 shadow-md">
                  <img src={song.artworkUrl || '/placeholder.png'} alt={song.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:scale-110 transition-transform">
                      {isCurrent && isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                    </div>
                  </div>

                  {/* Puzzle Overlay Button on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentSong(song)
                      setIsPlaying(true)
                      setTimeout(() => openPuzzle(3), 100)
                    }}
                    className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-black/70 hover:bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer transition-all hover:scale-105"
                    title="Solve Jigsaw Puzzle"
                  >
                    <Puzzle className="h-4 w-4" />
                  </button>
                </div>

                {/* Meta details */}
                <div className="mt-3.5 text-left min-w-0">
                  <h4 className={`font-bold text-xs truncate ${isCurrent ? 'text-indigo-400' : 'text-zinc-200'}`}>{song.title}</h4>
                  <p className="text-[10px] text-zinc-500 truncate mt-1 font-medium">{song.artist?.name || 'Unknown Artist'}</p>
                  <p className="text-[9px] text-zinc-600 mt-0.5 font-bold uppercase tracking-wider">2023</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recently Played Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-indigo-400">🕒</span>
            <h3 className="text-base font-bold tracking-tight text-zinc-200">Recently Played</h3>
          </div>
        </div>

        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {filteredSongs.slice(0, 8).map((song) => {
            const isCurrent = currentSong?.id === song.id
            return (
              <div
                key={`recent-${song.id}`}
                className="group flex flex-col cursor-pointer bg-[#0e0f14] hover:bg-[#14161f] border border-zinc-900 hover:border-zinc-800/80 p-2.5 rounded-xl transition-all duration-300 hover:shadow-lg text-center"
                onClick={() => handlePlaySong(song)}
              >
                {/* Artwork */}
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-800">
                  <img src={song.artworkUrl || '/placeholder.png'} alt={song.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>

                {/* Subtext */}
                <div className="mt-2 text-left min-w-0">
                  <h4 className="font-bold text-[10px] truncate text-zinc-200">{song.title}</h4>
                  <p className="text-[9px] text-zinc-500 truncate mt-0.5">{song.artist?.name || 'Unknown Artist'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
