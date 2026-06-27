import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const playlists = await prisma.playlist.findMany({
      where: { userId: payload.userId },
      include: {
        songs: {
          include: {
            song: {
              include: { artist: true, album: true }
            }
          },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ playlists })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        userId: payload.userId
      },
      include: {
        songs: true
      }
    })

    return NextResponse.json({ playlist }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const { playlistId, songId, action, title, audioUrl, artworkUrl, durationSeconds, artistName } = await req.json()

    if (!playlistId || !songId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify playlist ownership
    const playlist = await prisma.playlist.findFirst({
      where: { id: playlistId, userId: payload.userId }
    })

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    if (action === 'remove') {
      await prisma.playlistSong.delete({
        where: {
          playlistId_songId: { playlistId, songId }
        }
      })
      return NextResponse.json({ message: 'Removed song from playlist' })
    } else {
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

      // Add song to playlist
      // Find the next position
      const count = await prisma.playlistSong.count({
        where: { playlistId }
      })

      // Check if already in playlist
      const existing = await prisma.playlistSong.findUnique({
        where: {
          playlistId_songId: { playlistId, songId }
        }
      })

      if (existing) {
        return NextResponse.json({ message: 'Already in playlist' })
      }

      await prisma.playlistSong.create({
        data: {
          playlistId,
          songId,
          position: count + 1
        }
      })

      return NextResponse.json({ message: 'Added song to playlist' })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 })
  }
}
