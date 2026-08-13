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
): Promise<{ sent: boolean; throttled?: boolean; error?: string; channel?: 'resend' | 'console' }> {
  const db = await getDatabase()
  const user = await db.collection('users').findOne({ userId })
  if (!user) {
    return { sent: false, error: 'User not found' }
  }
  if (user.emailVerified) {
    return { sent: false, error: 'Email is already verified' }
  }

  const sentAtRaw = user.emailOtpSentAt
  const sentAt =
    sentAtRaw instanceof Date
      ? sentAtRaw.getTime()
      : typeof sentAtRaw === 'string'
        ? new Date(sentAtRaw).getTime()
        : 0
  const expiresAtRaw = user.emailOtpExpiresAt
  const expiresAt =
    expiresAtRaw instanceof Date
      ? expiresAtRaw
      : typeof expiresAtRaw === 'string'
        ? new Date(expiresAtRaw)
        : null
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

  const delivery = await sendOtpEmail(String(user.email), code, String(user.name))
  if (!delivery.ok) {
    console.error('Failed to send OTP:', delivery.error)
    return { sent: false, error: delivery.error }
  }

  if (delivery.channel === 'console') {
    console.info(`[DEV] Verification email for ${user.email} logged to server console`)
  }

  return { sent: true, channel: delivery.channel }
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

  const expiresAtRaw = user.emailOtpExpiresAt
  const expiresAt =
    expiresAtRaw instanceof Date
      ? expiresAtRaw
      : typeof expiresAtRaw === 'string'
        ? new Date(expiresAtRaw)
        : null
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
