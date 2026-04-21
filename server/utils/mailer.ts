import { readSettings } from '~/server/utils/settings-db'

export const sendEmailViaResend = async (args: { to: string; subject: string; html: string }) => {
  const settings = await readSettings()
  const apiKey = process.env.RESEND_API_KEY || settings.integrations?.emailApiKey
  const from = process.env.RESEND_FROM || settings.integrations?.emailFrom
  if (!apiKey || !from) {
    throw new Error('Missing RESEND_API_KEY or RESEND_FROM')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html
    })
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Resend error (${res.status})`)
  }

  return await res.json().catch(() => ({}))
}
