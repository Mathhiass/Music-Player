import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { signToken } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash)))
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = await signToken({ userId: user.id, email: user.email })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } })
  res.cookies.set('token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800 })
  return res
}