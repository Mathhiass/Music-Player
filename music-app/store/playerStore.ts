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
  isShuffle: boolean
  repeatMode: 'off' | 'all' | 'one'
  volume: number
  progress: number
  duration: number
  audio: HTMLAudioElement | null
  setCurrentSong: (s: Song | null, newQueue?: Song[]) => void
  setQueue: (songs: Song[]) => void
  setIsPlaying: (v: boolean) => void
  toggleShuffle: () => void
  toggleRepeatMode: () => void
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
  isShuffle: false,
  repeatMode: 'off',
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
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeatMode: () => set((state) => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one']
    const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length
    return { repeatMode: modes[nextIndex] }
  }),
  setVolume: (v) => set({ volume: v }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setAudio: (a) => set({ audio: a }),
  playNext: () => set((state) => {
    if (state.queue.length === 0 || !state.currentSong) return {}
    
    // If shuffle is active, select a random song
    if (state.isShuffle) {
      let nextIndex = Math.floor(Math.random() * state.queue.length)
      const currentIndex = state.queue.findIndex(s => s.id === state.currentSong?.id)
      if (state.queue.length > 1 && nextIndex === currentIndex) {
        nextIndex = (nextIndex + 1) % state.queue.length
      }
      return { currentSong: state.queue[nextIndex], isPlaying: true }
    }

    const currentIndex = state.queue.findIndex(s => s.id === state.currentSong?.id)
    if (currentIndex === -1) return {}
    
    const nextIndex = currentIndex + 1
    if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'all') {
        return { currentSong: state.queue[0], isPlaying: true }
      } else {
        return { isPlaying: false }
      }
    }
    return { currentSong: state.queue[nextIndex], isPlaying: true }
  }),
  playPrevious: () => set((state) => {
    if (state.queue.length === 0 || !state.currentSong) return {}
    
    // If shuffle is active, select a random song
    if (state.isShuffle) {
      let prevIndex = Math.floor(Math.random() * state.queue.length)
      const currentIndex = state.queue.findIndex(s => s.id === state.currentSong?.id)
      if (state.queue.length > 1 && prevIndex === currentIndex) {
        prevIndex = (prevIndex + 1) % state.queue.length
      }
      return { currentSong: state.queue[prevIndex], isPlaying: true }
    }

    const currentIndex = state.queue.findIndex(s => s.id === state.currentSong?.id)
    if (currentIndex === -1) return {}
    
    const prevIndex = currentIndex - 1
    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        return { currentSong: state.queue[state.queue.length - 1], isPlaying: true }
      } else {
        return { currentSong: state.queue[0], isPlaying: true }
      }
    }
    return { currentSong: state.queue[prevIndex], isPlaying: true }
  }),
}))

export type { Song }
