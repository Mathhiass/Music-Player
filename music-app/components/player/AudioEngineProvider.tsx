'use client'
import React from 'react'
import { useAudioEngine } from '@/lib/audio/useAudioEngine'

export function AudioEngineProvider({ children }: { children: React.ReactNode }) {
  useAudioEngine()
  return <>{children}</>
}

export default AudioEngineProvider
