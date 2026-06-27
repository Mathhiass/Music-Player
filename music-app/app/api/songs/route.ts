import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || 'lofi'
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20)
  
  const discoveryNode = 'https://discoveryprovider.audius.co'
  
  try {
    const res = await fetch(`${discoveryNode}/v1/tracks/search?query=${encodeURIComponent(q)}`)
    const data = await res.json()
    
    // Map Audius track structure to our app's Song model
    const songs = (data.data || []).slice(0, limit).map((track: any) => ({
      id: track.id,
      title: track.title,
      audioUrl: `${discoveryNode}/v1/tracks/${track.id}/stream`,
      artworkUrl: track.artwork?.['480x480'] || track.artwork?.['150x150'] || '/placeholder.png',
      durationSeconds: track.duration || 180,
      artist: { name: track.user?.name || 'Unknown Artist' },
      album: { title: track.album?.title || 'Single' }
    }))

    return NextResponse.json({ songs })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch from Audius API' }, { status: 500 })
  }
}