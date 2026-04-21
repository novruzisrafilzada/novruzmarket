import { appendLog } from '~/server/utils/logs-db'
import { readSettings } from '~/server/utils/settings-db'
import { readSubscribers } from '~/server/utils/newsletter-db'
import { sendEmailViaResend } from '~/server/utils/mailer'

type EventType = 'newProduct' | 'newBlog' | 'newBanner' | 'newSlider'

const shouldSend = (settings: any, type: EventType) => {
  if (!settings?.newsletter?.enabled) return false
  if (!settings?.newsletterAutomation?.enabled) return false
  if (type === 'newProduct') return !!settings.newsletterAutomation.onNewProduct
  if (type === 'newBlog') return !!settings.newsletterAutomation.onNewBlog
  if (type === 'newBanner') return !!settings.newsletterAutomation.onNewBanner
  if (type === 'newSlider') return !!settings.newsletterAutomation.onNewSlider
  return false
}

export const autoNotifyNewsletter = async (args: {
  type: EventType
  subject: string
  html: string
  ip: string
}) => {
  const settings = await readSettings()
  if (!shouldSend(settings as any, args.type)) return { ok: true, skipped: true }

  try {
    const subs = (await readSubscribers()).filter(s => s.status === 'Aktiv')
    let sent = 0
    let failed = 0
    for (const s of subs) {
      try {
        await sendEmailViaResend({ to: s.email, subject: args.subject, html: args.html })
        sent++
      } catch {
        failed++
      }
    }
    await appendLog({ user: 'Admin', action: `Auto newsletter: ${args.type} (sent: ${sent}, failed: ${failed})`, ip: args.ip })
    return { ok: true, sent, failed }
  } catch (e: any) {
    await appendLog({ user: 'Admin', action: `Auto newsletter: ${args.type} (skipped: ${String(e?.message || e)})`, ip: args.ip })
    return { ok: false }
  }
}

