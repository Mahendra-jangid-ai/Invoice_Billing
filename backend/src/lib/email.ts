export async function sendOtpEmail(to: string, code: string, name: string): Promise<void> {
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

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const from = process.env.EMAIL_FROM || 'Billing Studio <onboarding@resend.dev>'
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
      throw new Error(`Failed to send email (${response.status}): ${body}`)
    }
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info(`[DEV] OTP for ${to}: ${code}`)
    return
  }

  throw new Error('Email service is not configured')
}
