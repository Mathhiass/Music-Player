'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PlayerBar } from '@/components/player/PlayerBar'
import { PuzzleOverlay } from '@/components/puzzle/PuzzleOverlay'
import { AudioEngineProvider } from '@/components/player/AudioEngineProvider'
import { usePuzzleStore } from '@/store/puzzleStore'
import { usePlayerStore } from '@/store/playerStore'
import { Home, Compass, Music, Radio, Heart, Clock, LogOut, Puzzle } from 'lucide-react'

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [username, setUsername] = useState<string>('')
  const openPuzzle = usePuzzleStore(s => s.openPuzzle)
  const currentSong = usePlayerStore(s => s.currentSong)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json()
        router.replace('/auth/login')
      })
      .then(data => {
        if (data?.user) setUsername(data.user.username)
      })
      .catch(() => {
        router.replace('/auth/login')
      })
  }, [router])

  const handleLogout = async () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.replace('/auth/login')
  }

  const menuItems = [
    { name: 'Home', path: '/player', icon: Home },
    { name: 'Discover', path: '/player/search', icon: Compass },
    { name: 'Library', path: '/player/library', icon: Music },
    { name: 'Radio', path: '/player/search', icon: Radio },
  ]

  const libraryItems = [
    { name: 'Favorites', path: '/player/library', icon: Heart },
    { name: 'Recently Played', path: '/player', icon: Clock },
  ]

  const mockPlaylists = [
    { name: 'Chill Vibes', count: 24 },
    { name: 'Late Night Drive', count: 18 },
    { name: 'Focus Mode', count: 31 },
    { name: 'Workout Hits', count: 42 }
  ]

  const getInitials = (name: string) => {
    if (!name) return 'MH'
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <AudioEngineProvider>
      <div className="flex h-screen bg-[#0d0e12] font-sans text-zinc-100 overflow-hidden select-none">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 bg-[#08090c] flex-col justify-between shrink-0 px-5 py-6 border-r border-zinc-900/60 overflow-y-auto scrollbar-none">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Puzzle className="h-5 w-5 fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Harmoniq
              </span>
            </div>

            {/* Menu Section */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">Menu</p>
              <nav className="space-y-0.5">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500 rounded-l-none'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Library Section */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">Library</p>
              <nav className="space-y-0.5">
                {libraryItems.map((item) => {
                  const isActive = pathname === item.path
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500 rounded-l-none'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Playlists Section */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">Playlists</p>
              <div className="space-y-1">
                {mockPlaylists.map((pl) => (
                  <Link
                    key={pl.name}
                    href="/player/playlist"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-all"
                  >
                    <span className="truncate flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600"></span>
                      {pl.name}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-bold">{pl.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Area (Promo Card & Profile) */}
          <div className="mt-8 space-y-4 pt-4 border-t border-zinc-900/60">
            {/* Puzzle Mode Promo Card */}
            <div
              onClick={() => {
                if (currentSong) openPuzzle(3)
              }}
              className="bg-indigo-950/20 hover:bg-indigo-950/30 border border-indigo-500/15 rounded-xl p-3.5 text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-900/40 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">NEW</span>
                <span className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors">Puzzle Mode</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Solve cover artwork while listening</p>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center justify-between bg-zinc-900/20 border border-zinc-800/40 p-2.5 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/10 flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(username)}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-zinc-200 truncate">{username || 'Jamie Davis'}</span>
                  <span className="text-[9px] text-zinc-500 font-semibold mt-0.5 uppercase tracking-wide">Premium</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto pb-36 md:pb-28">
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#08090c] border-t border-zinc-900/60 flex md:hidden items-center justify-around z-50 px-4 text-zinc-400">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full py-1.5 transition-colors ${
                  isActive ? 'text-indigo-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-bold tracking-tight">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Global Player Components */}
        <PlayerBar />
        <PuzzleOverlay />
      </div>
    </AudioEngineProvider>
  )
}