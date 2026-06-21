import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20)
  const offset = Number(req.nextUrl.searchParams.get('offset') ?? 0)

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { artist: { name: { contains: q, mode: 'insensitive' as const } } },
          { album: { title: { contains: q, mode: 'insensitive' as const } } },
        ],
      }
    : {}

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      where,
      include: { artist: true, album: true },
      take: limit,
      skip: offset,
      orderBy: { title: 'asc' },
    }),
    prisma.song.count({ where }),
  ])

  return NextResponse.json({ songs, total, limit, offset })
}