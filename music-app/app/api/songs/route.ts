import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

const PUBLIC = ['/login', '/register', '/api/auth']

export async function middleware(req: NextRequest) {
  const isPublic = PUBLIC.some(p => req.nextUrl.pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    const payload = await verifyToken(token)
    const res = NextResponse.next()
    res.headers.set('x-user-id', payload.userId)
    return res
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = { matcher: ['/((?!_next|favicon.ico).*)'] }