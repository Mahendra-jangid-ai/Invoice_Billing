export type SendOtpResult =
  | { ok: true; channel: 'resend' | 'console' }
  | { ok: false; error: string }

function shouldLogOtpToConsole(): boolean {
  if (process.env.OTP_FORCE_CONSOLE === 'true') return true
  if (process.env.NODE_ENV === 'production') return false
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
  return frontend.includes('localhost') || frontend.includes('127.0.0.1')
}

function logOtpToConsole(to: string, code: string, reason?: string): void {
  const suffix = reason ? ` (${reason})` : ''
  console.info(`[DEV] OTP for ${to}: ${code}${suffix}`)
}

function parseResendError(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string }
    if (parsed.message?.includes('only send testing emails to your own email')) {
      return 'Resend test mode only delivers to your Resend account email. Verify a domain at resend.com to email other users.'
    }
    if (parsed.message) return parsed.message
  } catch {
    // ignore JSON parse errors
  }
  return 'Email provider rejected the message. Please try again later.'
}

export async function sendOtpEmail(to: string, code: string, name: string): Promise<SendOtpResult> {
  const subject = 'Your Billing Studio verification code'
  const text = [
    `Hi ${name},`,
    '',
    `Your verification code is: ${code}`,
    '',
    'This code expires in 10 minutes.',
    '',
    "If you didn't create an account, you can ignore this email.",
  ].join('\n')

  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (apiKey) {
    const from = process.env.EMAIL_FROM || 'Billing Studio <onboarding@resend.dev>'
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: [to], subject, text }),
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        if (shouldLogOtpToConsole()) {
          logOtpToConsole(to, code, `Resend ${response.status}: ${body}`)
          return { ok: true, channel: 'console' }
        }
        return { ok: false, error: parseResendError(body) }
      }

      return { ok: true, channel: 'resend' }
    } catch (error) {
      if (shouldLogOtpToConsole()) {
        logOtpToConsole(to, code, error instanceof Error ? error.message : 'network error')
        return { ok: true, channel: 'console' }
      }
      return { ok: false, error: 'Could not reach the email service. Please try again later.' }
    }
  }

  if (shouldLogOtpToConsole()) {
    logOtpToConsole(to, code)
    return { ok: true, channel: 'console' }
  }

  return { ok: false, error: 'Email service is not configured on the server.' }
}
