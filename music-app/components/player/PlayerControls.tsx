'use client'
import React from 'react'
import { usePlayerStore } from '@/store/playerStore'

export function PlayerControls() {
  const { isPlaying, setIsPlaying } = usePlayerStore()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: 8, borderRadius: 6 }}>
        {isPlaying ? '⏸' : '▶️'}
      </button>
    </div>
  )
}

export default PlayerControls
