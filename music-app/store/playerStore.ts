import { create } from 'zustand'

interface Song {
  id: string
  title: string
  audioUrl: string
  artworkUrl?: string
  durationSeconds?: number
  artist?: { name?: string }
  album?: { title?: string }
}

interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  audio: HTMLAudioElement | null
  setCurrentSong: (s: Song | null, newQueue?: Song[]) => void
  setQueue: (songs: Song[]) => void
  setIsPlaying: (v: boolean) => void
  setVolume: (v: number) => void
  setProgress: (p: number) => void
  setDuration: (d: number) => void
  setAudio: (a: HTMLAudioElement | null) => void
  playNext: () => void
  playPrevious: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  volume: 1,
  progress: 0,
  duration: 0,
  audio: null,
  setCurrentSong: (s, newQueue) => set((state) => {
    const updates: Partial<PlayerState> = { currentSong: s }
    if (newQueue) {
      updates.queue = newQueue
    } else if (s && !state.queue.some(item => item.id === s.id)) {
      updates.queue = [...state.queue, s]
    }
    return updates
  }),
  setQueue: (songs) => set({ queue: songs }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setVolume: (v) => set({ volume: v }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setAudio: (a) => set({ audio: a }),
  playNext: () => set((state) => {
    if (state.queue.length === 0 || !state.currentSong) return {}
    const currentIndex = state.queue.findIndex(s => s.id === state.currentSong?.id)
    if (currentIndex === -1) return {}
    const nextIndex = (currentIndex + 1) % state.queue.length
    return { currentSong: state.queue[nextIndex], isPlaying: true }
  }),
  playPrevious: () => set((state) => {
    if (state.queue.length === 0 || !state.currentSong) return {}
    const currentIndex = state.queue.findIndex(s => s.id === state.currentSong?.id)
    if (currentIndex === -1) return {}
    const prevIndex = (currentIndex - 1 + state.queue.length) % state.queue.length
    return { currentSong: state.queue[prevIndex], isPlaying: true }
  }),
}))

export type { Song }
