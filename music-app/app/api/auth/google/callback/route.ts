import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { signToken } from '@/lib/auth/jwt'

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Google login was cancelled or failed')}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Authorization code missing')}`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${origin}/api/auth/google/callback`

  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials not configured')
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Google OAuth is not configured on the server')}`)
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error('Token exchange failed:', tokenData)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Failed to exchange Google authorization code')}`)
    }

    const { access_token } = tokenData

    // 2. Fetch user profile from Google API
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const userData = await userRes.json()
    if (!userRes.ok) {
      console.error('Fetching user info failed:', userData)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Failed to fetch user profile from Google')}`)
    }

    const { email, name } = userData

    if (!email) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Google account has no associated email')}`)
    }

    // 3. Find or create the user in the database
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Generate a unique username
      let baseUsername = (name || email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')
      if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`
      
      let username = baseUsername
      let isUsernameTaken = true
      let attempt = 0

      while (isUsernameTaken) {
        const existingUser = await prisma.user.findUnique({ where: { username } })
        if (!existingUser) {
          isUsernameTaken = false
        } else {
          attempt++
          username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`
        }
      }

      user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash: null, // social login
        },
      })
    }

    // 4. Generate app JWT token
    const token = await signToken({ userId: user.id, email: user.email })

    // 5. Set session cookie and redirect to player
    const res = NextResponse.redirect(`${origin}/player`)
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800, // 7 days
    })
    return res
  } catch (err) {
    console.error('Google Callback Error:', err)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Internal server error during Google login')}`)
  }
}
