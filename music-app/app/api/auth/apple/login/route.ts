import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const redirectUri = `${origin}/api/auth/apple/callback`
  const clientId = process.env.APPLE_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ error: 'Apple Client ID is not configured' }, { status: 500 })
  }

  const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code%20id_token&scope=${encodeURIComponent(
    'name email'
  )}&response_mode=form_post`

  return NextResponse.redirect(appleAuthUrl)
}
