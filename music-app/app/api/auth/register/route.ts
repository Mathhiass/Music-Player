import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { signToken } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  const { email, username, password } = await req.json()

  if (!email || !username || !password)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (existing)
    return NextResponse.json({ error: 'Email or username taken' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true },
  })

  const token = await signToken({ userId: user.id, email: user.email })
  const res = NextResponse.json({ user }, { status: 201 })
  res.cookies.set('token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800 })
  return res
}