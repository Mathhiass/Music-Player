import { useRef, useCallback, useEffect } from 'react'
import { usePlayerStore } from '@/store/playerStore'

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { currentSong, isPlaying, volume, setIsPlaying, setProgress, setDuration } = usePlayerStore()

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'metadata'
    }
    const audio = audioRef.current

    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => { setIsPlaying(false); usePlayerStore.getState().playNext() }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    audio.src = `/api/songs/${currentSong.id}/stream`
    audio.load()
    if (isPlaying) audio.play()
  }, [currentSong?.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    isPlaying ? audio.play().catch(() => {}) : audio.pause()
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time
  }, [])

  return { seek }
}