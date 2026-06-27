import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const payload = await verifyToken(token)
    const { songId, completionMs, score, gridSize } = await req.json()

    if (!songId || completionMs === undefined || score === undefined || !gridSize) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const savedScore = await prisma.puzzleScore.create({
      data: {
        userId: payload.userId,
        songId,
        completionMs,
        score,
        gridSize: Number(gridSize),
      },
      include: {
        user: { select: { username: true } },
      },
    })

    return NextResponse.json({ score: savedScore }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const songId = req.nextUrl.searchParams.get('songId')
  const gridSize = Number(req.nextUrl.searchParams.get('gridSize') ?? 3)

  if (!songId) {
    return NextResponse.json({ error: 'Missing songId' }, { status: 400 })
  }

  try {
    const scores = await prisma.puzzleScore.findMany({
      where: {
        songId,
        gridSize,
      },
      include: {
        user: { select: { username: true } },
      },
      orderBy: {
        score: 'desc',
      },
      take: 10,
    })

    return NextResponse.json({ scores })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 })
  }
}
