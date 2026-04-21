import { readSettings } from '~/server/utils/settings-db'

export const sendSmsMessage = async (args: { to: string; message: string }) => {
  const settings = await readSettings()
  const provider = String(settings.integrations?.smsProvider || '').trim()
  const apiKey = String(settings.integrations?.smsApiKey || '').trim()
  const apiSecret = String(settings.integrations?.smsApiSecret || '').trim()
  const from = String(settings.integrations?.smsFrom || '').trim()
  const webhookUrl = String(settings.integrations?.smsWebhookUrl || '').trim()
  const to = String(args.to || '').trim()
  const message = String(args.message || '').trim()

  if (!to || !message) {
    throw new Error('Telefon nömrəsi və mesaj vacibdir')
  }

  if (provider === 'twilio') {
    if (!apiKey || !apiSecret || !from) {
      throw new Error('Twilio üçün Account SID, Auth Token və göndərən nömrə vacibdir')
    }

    const body = new URLSearchParams({
      To: to,
      From: from,
      Body: message
    })

    const token = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(apiKey)}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `Twilio error (${res.status})`)
    }

    return await res.json().catch(() => ({}))
  }

  if (provider === 'custom') {
    if (!webhookUrl) {
      throw new Error('Lokal SMS provider üçün webhook URL vacibdir')
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        ...(apiSecret ? { 'X-API-Secret': apiSecret } : {})
      },
      body: JSON.stringify({
        to,
        message,
        from
      })
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `SMS provider error (${res.status})`)
    }

    return await res.json().catch(() => ({}))
  }

  throw new Error('SMS provider seçilməyib')
}
