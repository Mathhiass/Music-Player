import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const librarySongs = await prisma.librarySong.findMany({
      where: { userId: payload.userId },
      include: {
        song: {
          include: { artist: true, album: true }
        }
      },
      orderBy: { savedAt: 'desc' }
    })

    return NextResponse.json({ songs: librarySongs.map(ls => ls.song) })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const { songId, title, audioUrl, artworkUrl, durationSeconds, artistName } = await req.json()

    if (!songId) {
      return NextResponse.json({ error: 'Missing songId' }, { status: 400 })
    }

    // Dynamic Database Sync: Ensure Artist and Song exist in our local DB
    let dbSong = await prisma.song.findUnique({ where: { id: songId } })
    if (!dbSong) {
      let dbArtist = await prisma.artist.findFirst({ where: { name: artistName || 'Unknown Artist' } })
      if (!dbArtist) {
        dbArtist = await prisma.artist.create({
          data: { name: artistName || 'Unknown Artist' }
        })
      }

      dbSong = await prisma.song.create({
        data: {
          id: songId,
          title: title || 'Unknown Song',
          audioUrl: audioUrl || '',
          artworkUrl: artworkUrl || '',
          durationSeconds: Number(durationSeconds || 180),
          artistId: dbArtist.id
        }
      })
    }

    // Check if already in library
    const existing = await prisma.librarySong.findUnique({
      where: {
        userId_songId: {
          userId: payload.userId,
          songId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ message: 'Already in library' })
    }

    await prisma.librarySong.create({
      data: {
        userId: payload.userId,
        songId
      }
    })

    return NextResponse.json({ message: 'Added to library' }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add to library' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const songId = req.nextUrl.searchParams.get('songId')

    if (!songId) {
      return NextResponse.json({ error: 'Missing songId' }, { status: 400 })
    }

    await prisma.librarySong.delete({
      where: {
        userId_songId: {
          userId: payload.userId,
          songId
        }
      }
    })

    return NextResponse.json({ message: 'Removed from library' })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove from library' }, { status: 500 })
  }
}
