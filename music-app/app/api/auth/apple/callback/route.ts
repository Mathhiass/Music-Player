import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { signToken } from '@/lib/auth/jwt'
import { SignJWT, importPKCS8, decodeJwt } from 'jose'

async function getAppleClientSecret() {
  const teamId = process.env.APPLE_TEAM_ID
  const clientId = process.env.APPLE_CLIENT_ID
  const keyId = process.env.APPLE_KEY_ID
  const privateKeyPEM = process.env.APPLE_PRIVATE_KEY

  if (!teamId || !clientId || !keyId || !privateKeyPEM) {
    throw new Error('Apple OAuth credentials are not fully configured on the server')
  }

  const formattedPrivateKey = privateKeyPEM.replace(/\\n/g, '\n')
  const privateKey = await importPKCS8(formattedPrivateKey, 'ES256')

  return await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime('5m')
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .sign(privateKey)
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin
  
  try {
    const formData = await req.formData()
    const code = formData.get('code') as string
    const id_token = formData.get('id_token') as string
    const userString = formData.get('user') as string

    if (!code || !id_token) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Apple login parameters missing')}`)
    }

    const clientId = process.env.APPLE_CLIENT_ID
    const redirectUri = `${origin}/api/auth/apple/callback`

    if (!clientId) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Apple client ID is not configured')}`)
    }

    // 1. Generate client secret and exchange authorization code for tokens
    let validatedIdToken = id_token
    try {
      const clientSecret = await getAppleClientSecret()
      const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
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
      if (tokenRes.ok && tokenData.id_token) {
        validatedIdToken = tokenData.id_token
      } else {
        console.warn('Apple token exchange warning:', tokenData)
      }
    } catch (secretError) {
      console.error('Failed to generate Apple client secret or exchange code:', secretError)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Apple server authentication failed')}`)
    }

    // 2. Decode the validated ID token to get the user's email
    const payload = decodeJwt(validatedIdToken) as { email?: string; sub: string }
    const email = payload.email

    if (!email) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Apple sign-in did not return email')}`)
    }

    // 3. Find or create the user in the database
    let dbUser = await prisma.user.findUnique({ where: { email } })

    if (!dbUser) {
      // Parse optional user name details sent by Apple (only present on first login)
      let name = ''
      if (userString) {
        try {
          const parsedUser = JSON.parse(userString)
          if (parsedUser.name) {
            const first = parsedUser.name.firstName || ''
            const last = parsedUser.name.lastName || ''
            name = `${first} ${last}`.trim()
          }
        } catch (e) {
          console.error('Failed to parse Apple user name JSON:', e)
        }
      }

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

      dbUser = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash: null,
        },
      })
    }

    // 4. Generate app JWT token
    const token = await signToken({ userId: dbUser.id, email: dbUser.email })

    // 5. Set session cookie and redirect to player
    const res = NextResponse.redirect(`${origin}/player`)
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
    })
    return res
  } catch (err) {
    console.error('Apple Callback Error:', err)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Internal server error during Apple login')}`)
  }
}
