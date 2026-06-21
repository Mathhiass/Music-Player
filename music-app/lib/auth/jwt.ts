import { SignJWT, jwtVerify } from 'jose'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('Missing JWT_SECRET environment variable')
const secret = new TextEncoder().encode(jwtSecret)

export async function signToken(payload: { userId: string; email: string }) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('7d')
		.sign(secret)
}

export async function verifyToken(token: string) {
	const { payload } = await jwtVerify(token, secret)
	return payload as { userId: string; email: string }
}
