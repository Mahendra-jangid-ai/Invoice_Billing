import { createRemoteJWKSet, jwtVerify } from 'jose'

export interface GoogleProfile {
  sub: string
  email: string
  name: string
  picture?: string
}

function getGoogleClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured')
  }
  return clientId
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim())
}

const googleJwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const clientId = getGoogleClientId()

  const { payload } = await jwtVerify(idToken, googleJwks, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  })

  if (!payload.email || typeof payload.email !== 'string') {
    throw new Error('Google account did not provide an email address')
  }

  if (payload.email_verified !== true) {
    throw new Error('Google email is not verified')
  }

  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Invalid Google account token')
  }

  const name =
    typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim()
      : payload.email.split('@')[0]

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name,
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
  }
}
