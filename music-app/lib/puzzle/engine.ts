import { create } from 'zustand'

interface Song { id: string; title: string; artworkUrl?: string; audioUrl: string; artist: { name: string } }

interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  queueIndex: number
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  playSong: (song: Song, queue?: Song[]) => void
  playNext: () => void
  playPrev: () => void
  setIsPlaying: (v: boolean) => void
  setProgress: (v: number) => void
  setDuration: (v: number) => void
  setVolume: (v: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  playSong: (song, queue = [song]) =>
    set({ currentSong: song, queue, queueIndex: queue.indexOf(song), isPlaying: true }),
  playNext: () => {
    const { queue, queueIndex } = get()
    const next = queueIndex + 1
    if (next < queue.length) set({ currentSong: queue[next], queueIndex: next, isPlaying: true })
  },
  playPrev: () => {
    const { queue, queueIndex } = get()
    const prev = queueIndex - 1
    if (prev >= 0) set({ currentSong: queue[prev], queueIndex: prev, isPlaying: true })
  },
  setIsPlaying: v => set({ isPlaying: v }),
  setProgress: v => set({ progress: v }),
  setDuration: v => set({ duration: v }),
  setVolume: v => set({ volume: v }),
}))