import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const song = await prisma.song.findUnique({ where: { id: params.id } })
  if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fetch from your object storage (S3-compatible)
  const upstream = await fetch(song.audioUrl, {
    headers: { range: req.headers.get('range') ?? '' },
  })

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'audio/mpeg',
      'Content-Length': upstream.headers.get('Content-Length') ?? '',
      'Content-Range': upstream.headers.get('Content-Range') ?? '',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}