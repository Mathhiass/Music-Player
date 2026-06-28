'use client'
import React, { useEffect, useState } from 'react'
import { usePlayerStore, type Song } from '@/store/playerStore'
import { usePuzzleStore } from '@/store/puzzleStore'

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)

  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayerStore()
  const openPuzzle = usePuzzleStore(s => s.openPuzzle)

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/playlists')
      const data = await res.json()
      setPlaylists(data.playlists || [])
      setLoading(false)
      if (data.playlists?.length > 0 && !selectedPlaylistId) {
        setSelectedPlaylistId(data.playlists[0].id)
      }
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName }),
      })
      if (res.ok) {
        const data = await res.json()
        setPlaylists(prev => [data.playlist, ...prev])
        setSelectedPlaylistId(data.playlist.id)
        setNewPlaylistName('')
      }
    } catch {}
  }

  const handleRemoveSong = async (playlistId: string, songId: string) => {
    try {
      const res = await fetch('/api/playlists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, songId, action: 'remove' }),
      })
      if (res.ok) {
        setPlaylists(prev =>
          prev.map(p => {
            if (p.id === playlistId) {
              return {
                ...p,
                songs: p.songs.filter((ps: any) => ps.songId !== songId),
              }
            }
            return p
          })
        )
      }
    } catch {}
  }

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      const playlistSongs = activePlaylist?.songs?.map((ps: any) => ps.song) || []
      setCurrentSong(song, playlistSongs)
      setIsPlaying(true)
    }
  }

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId)

  return (
    <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
      {/* Playlists list + Create form */}
      <div className="space-y-6 md:col-span-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">Playlists</h2>
          <p className="text-zinc-500 text-xs mt-1 font-medium">Create and manage your music collection</p>
        </div>

        {/* Create playlist form */}
        <form onSubmit={handleCreatePlaylist} className="flex gap-2">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name..."
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Create
          </button>
        </form>

        {/* Playlists items list */}
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : playlists.length > 0 ? (
          <div className="space-y-2">
            {playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlaylistId(p.id)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all duration-200 cursor-pointer flex justify-between items-center ${
                  p.id === selectedPlaylistId
                    ? 'bg-zinc-800 border-emerald-500/30 text-emerald-400 font-semibold'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/40 hover:text-zinc-100'
                }`}
              >
                <span className="truncate">{p.name}</span>
                <span className="text-zinc-500 text-xs shrink-0">{p.songs?.length || 0} tracks</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-xs">No playlists created yet.</p>
        )}
      </div>

      {/* Playlist tracks detail */}
      <div className="md:col-span-2 space-y-4">
        {activePlaylist ? (
          <div className="space-y-4">
            <div className="pb-4 border-b border-zinc-800 flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-bold text-zinc-100">{activePlaylist.name}</h3>
                <p className="text-zinc-500 text-xs mt-1">Playlist • {activePlaylist.songs?.length || 0} tracks</p>
              </div>
            </div>

            {activePlaylist.songs?.length > 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
                <div className="divide-y divide-zinc-800/60">
                  {activePlaylist.songs.map((ps: any, index: number) => {
                    const song = ps.song
                    const isCurrent = currentSong?.id === song.id

                    return (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-3 hover:bg-zinc-800/20 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="w-4 text-center text-xs text-zinc-500 font-semibold">{index + 1}</span>

                          {/* Image w/ play trigger */}
                          <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden bg-zinc-800">
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

                        <div className="flex items-center gap-3">
                          {/* Solve Jigsaw */}
                          <button
                            onClick={() => {
                              setCurrentSong(song)
                              setIsPlaying(true)
                              setTimeout(() => openPuzzle(3), 100)
                            }}
                            className="text-xs cursor-pointer bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 px-2 py-1 rounded transition-all"
                          >
                            🧩 Solve
                          </button>

                          {/* Remove from Playlist */}
                          <button
                            onClick={() => handleRemoveSong(activePlaylist.id, song.id)}
                            className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                            title="Remove from playlist"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                This playlist is empty. Go back to Home or Search, select "Add to Playlist" to populate it!
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">
            Select a playlist or create a new one to view its tracks.
          </div>
        )}
      </div>
    </div>
  )
}
