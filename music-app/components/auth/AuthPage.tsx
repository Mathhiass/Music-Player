'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Puzzle, Eye, EyeOff } from 'lucide-react'

export default function AuthPage({ defaultTab }: { defaultTab: 'login' | 'register' }) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)

  // Sync tab with pathname in case user uses browser back/forward buttons
  useEffect(() => {
    if (pathname.includes('register')) {
      setActiveTab('register')
    } else {
      setActiveTab('login')
    }
  }, [pathname])

  // Read error parameter from URL (for failed social logins)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const err = params.get('error')
      if (err) {
        setError(decodeURIComponent(err))
        // Clear query parameters without page reload
        const newUrl = window.location.pathname + window.location.hash
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])

  // Form States
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTabChange = (tab: 'login' | 'register') => {
    setError('')
    setActiveTab(tab)
    // Next.js client-side navigation without full page reload or scroll reset
    router.push(tab === 'login' ? '/auth/login' : '/auth/register', { scroll: false })
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials')
      }

      router.push('/player')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          username: registerUsername,
          password: registerPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register')
      }

      router.push('/player')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const artworks = [
    '/artwork/cyberpunk_dreams.png',
    '/artwork/deep_space_ambient.png',
    '/artwork/echoes_of_midnight.png',
    '/artwork/electric_dreams.png',
    '/artwork/fading_horizon.png',
    '/artwork/golden_days.png',
    '/artwork/lofi_rainy_coffee.png',
    '/artwork/shadows_and_light.png',
    '/artwork/waves_of_time.png',
  ]

  return (
    <div className="flex min-h-screen bg-[#08090c] font-sans text-white select-none overflow-hidden">
      {/* Left panel: Mosaic Grid & Branding (Desktop Only) */}
      <div className="hidden md:flex md:w-3/5 relative overflow-hidden bg-zinc-950 border-r border-zinc-900/60">
        {/* Mosaic Grid */}
        <div className="absolute inset-0 grid grid-cols-3 gap-3 p-4 opacity-40 scale-105 pointer-events-none">
          {artworks.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-900/40 shadow-inner"
            >
              <img
                src={src}
                alt="Artwork"
                className="h-full w-full object-cover select-none pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Ambient Dark Overlay to ensure readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/70 to-[#08090c]/40"></div>

        {/* Tagline & Marketing copy */}
        <div className="absolute bottom-16 left-16 right-16 z-20 flex flex-col items-start text-left space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Puzzle className="h-6 w-6 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Harmoniq</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Listen, Solve,<br />Repeat.
            </h1>
            <p className="text-zinc-400 text-sm max-w-md leading-relaxed font-medium">
              The only music app where your album art becomes a puzzle. Stream, vibe, and challenge yourself — all at once.
            </p>
          </div>

          {/* Highlight feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['50M+ Songs', 'Puzzle Mode', 'Album Art Games', 'Hi-Fi Audio'].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: Sliding Forms & Action Controls */}
      <div className="w-full md:w-2/5 flex flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Glow Effects for Mobile */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-indigo-600/5 blur-[96px] md:hidden"></div>

        <div className="w-full max-w-md space-y-8 relative z-10 flex flex-col">
          {/* Header Mobile Logo */}
          <div className="flex md:hidden items-center justify-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
              <Puzzle className="h-5 w-5 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Harmoniq</span>
          </div>

          {/* Tab Switcher Container */}
          <div className="relative flex bg-[#101217] border border-zinc-900 p-1 rounded-full shadow-inner w-full">
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-full shadow transition-all duration-300 ease-in-out ${
                activeTab === 'login' ? 'left-1' : 'left-[calc(50%+3px)]'
              }`}
            ></div>

            {/* Sign In Button */}
            <button
              onClick={() => handleTabChange('login')}
              className={`z-10 flex-grow text-center py-2 text-xs font-bold transition-colors duration-300 cursor-pointer ${
                activeTab === 'login' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign In
            </button>

            {/* Create Account Button */}
            <button
              onClick={() => handleTabChange('register')}
              className={`z-10 flex-grow text-center py-2 text-xs font-bold transition-colors duration-300 cursor-pointer ${
                activeTab === 'register' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Sliding Forms Wrapper */}
          <div className="relative w-full overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                width: '200%',
                transform: activeTab === 'login' ? 'translateX(0%)' : 'translateX(-50%)',
              }}
            >
              {/* Form 1: LOGIN */}
              <div className="w-1/2 shrink-0 pr-4">
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2 text-left">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 pl-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#101217] border border-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-700 transition-all text-xs font-medium"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between pl-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-[10px] font-bold text-zinc-500 hover:text-indigo-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-[#101217] border border-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-700 transition-all text-xs font-medium"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors p-1"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-8 cursor-pointer"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </div>

              {/* Form 2: REGISTER */}
              <div className="w-1/2 shrink-0 pl-4">
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  {/* Username */}
                  <div className="space-y-2 text-left">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 pl-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#101217] border border-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-700 transition-all text-xs font-medium"
                      placeholder="johndoe"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2 text-left">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 pl-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#101217] border border-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-700 transition-all text-xs font-medium"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2 text-left">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 pl-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-[#101217] border border-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-700 transition-all text-xs font-medium"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors p-1"
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-8 cursor-pointer"
                  >
                    {loading ? 'Creating Account...' : 'Register'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Social Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-900/60"></div>
            <span className="flex-shrink mx-4 text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest">
              or continue with
            </span>
            <div className="flex-grow border-t border-zinc-900/60"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => window.location.href = '/api/auth/google/login'}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-900 bg-[#101217] hover:bg-zinc-900/50 text-zinc-300 hover:text-white text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="Google" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/api/auth/apple/login'}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-900 bg-[#101217] hover:bg-zinc-900/50 text-zinc-300 hover:text-white text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/475633/apple-color.svg" className="h-4 w-4" alt="Apple" />
              <span>Apple</span>
            </button>
          </div>

          <p className="text-center text-xs font-medium text-zinc-500 mt-6">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => handleTabChange('register')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => handleTabChange('login')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
