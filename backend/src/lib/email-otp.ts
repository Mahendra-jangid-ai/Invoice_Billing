import { getDatabase } from './mongodb.js'
import { hashToken } from './auth.js'
import { sendOtpEmail } from './email.js'

const OTP_EXPIRY_MS = 10 * 60 * 1000
const OTP_RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function createAndSendEmailOtp(
  userId: string,
  options?: { force?: boolean },
): Promise<{ sent: boolean; throttled?: boolean }> {
  const db = await getDatabase()
  const user = await db.collection('users').findOne({ userId })
  if (!user || user.emailVerified) {
    return { sent: false }
  }

  const sentAt = user.emailOtpSentAt instanceof Date ? user.emailOtpSentAt.getTime() : 0
  const expiresAt = user.emailOtpExpiresAt instanceof Date ? user.emailOtpExpiresAt : null
  const otpStillValid = Boolean(expiresAt && expiresAt.getTime() > Date.now())

  if (
    !options?.force &&
    otpStillValid &&
    sentAt > 0 &&
    Date.now() - sentAt < OTP_RESEND_COOLDOWN_MS
  ) {
    return { sent: true, throttled: true }
  }

  const code = generateOtpCode()
  const hashed = hashToken(code)
  const nextExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS)
  const now = new Date()

  await db.collection('users').updateOne(
    { userId },
    {
      $set: {
        emailOtpHash: hashed,
        emailOtpExpiresAt: nextExpiresAt,
        emailOtpSentAt: now,
        emailOtpAttempts: 0,
        updatedAt: now,
      },
    },
  )

  try {
    await sendOtpEmail(String(user.email), code, String(user.name))
    return { sent: true }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[DEV] OTP for ${user.email}: ${code}`)
      return { sent: true }
    }
    console.error('Failed to send OTP:', error instanceof Error ? error.message : error)
    return { sent: false }
  }
}

export async function verifyEmailOtp(
  userId: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDatabase()
  const user = await db.collection('users').findOne({ userId })

  if (!user) {
    return { ok: false, error: 'User not found' }
  }

  if (user.emailVerified) {
    return { ok: true }
  }

  const attempts = typeof user.emailOtpAttempts === 'number' ? user.emailOtpAttempts : 0
  if (attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: 'Too many failed attempts. Please request a new code.' }
  }

  const expiresAt = user.emailOtpExpiresAt instanceof Date ? user.emailOtpExpiresAt : null
  if (!expiresAt || expiresAt.getTime() < Date.now()) {
    return { ok: false, error: 'Verification code has expired. Please request a new one.' }
  }

  const hashed = hashToken(code)
  if (user.emailOtpHash !== hashed) {
    await db.collection('users').updateOne(
      { userId },
      { $set: { emailOtpAttempts: attempts + 1, updatedAt: new Date() } },
    )
    return { ok: false, error: 'Invalid verification code' }
  }

  await db.collection('users').updateOne(
    { userId },
    {
      $set: { emailVerified: true, updatedAt: new Date() },
      $unset: {
        emailOtpHash: '',
        emailOtpExpiresAt: '',
        emailOtpSentAt: '',
        emailOtpAttempts: '',
      },
    },
  )

  return { ok: true }
}
