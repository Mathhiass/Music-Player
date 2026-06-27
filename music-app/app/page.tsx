'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) {
          router.replace('/player')
        } else {
          router.replace('/auth/login')
        }
      })
      .catch(() => {
        router.replace('/auth/login')
      })
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 font-sans text-white">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-zinc-400">Loading music experience...</p>
      </div>
    </div>
  )
}
