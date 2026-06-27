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
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  audio: HTMLAudioElement | null
  setCurrentSong: (s: Song | null) => void
  setIsPlaying: (v: boolean) => void
  setVolume: (v: number) => void
  setProgress: (p: number) => void
  setDuration: (d: number) => void
  setAudio: (a: HTMLAudioElement | null) => void
  playNext: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  volume: 1,
  progress: 0,
  duration: 0,
  audio: null,
  setCurrentSong: (s) => set({ currentSong: s }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setVolume: (v) => set({ volume: v }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setAudio: (a) => set({ audio: a }),
  playNext: () => set(() => ({ /* TODO: implement playlist advance */ })),
}))

export type { Song }
