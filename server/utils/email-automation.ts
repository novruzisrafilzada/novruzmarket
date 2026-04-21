import { appendLog } from '~/server/utils/logs-db'
import { readSettings } from '~/server/utils/settings-db'
import { sendEmailViaResend } from '~/server/utils/mailer'
import { renderTemplate } from '~/server/utils/email-template'

type EmailKind = 'welcomeSignup' | 'welcomeNewsletter' | 'orderCreated' | 'orderStatus'

const isValidEmail = (email: string) => {
  const e = String(email || '').trim()
  if (!e || !e.includes('@')) return false
  if (e.toLowerCase() === 'qonaq@mail.com') return false
  return true
}

export const maybeSendAutomationEmail = async (params: {
  kind: EmailKind
  to: string
  ip: string
  vars: Record<string, any>
}) => {
  const settings = await readSettings()
  const cfg: any = (settings as any).emailAutomation
  if (!cfg || !cfg.enabled) return { ok: false as const, skipped: true as const }
  if (!isValidEmail(params.to)) return { ok: false as const, skipped: true as const }

  const enabledForKind =
    (params.kind === 'welcomeSignup' && !!cfg.onWelcomeSignup) ||
    (params.kind === 'welcomeNewsletter' && !!cfg.onWelcomeNewsletterSubscribe) ||
    (params.kind === 'orderCreated' && !!cfg.onOrderCreated) ||
    (params.kind === 'orderStatus' && !!cfg.onOrderStatusChanged)

  if (!enabledForKind) return { ok: false as const, skipped: true as const }

  const toFinal = String(cfg.testTo || '').trim() && String(cfg.testTo || '').includes('@') ? String(cfg.testTo || '').trim() : params.to

  const vars = { siteName: settings.siteName, ...params.vars }
  const subjectTpl =
    params.kind === 'welcomeSignup'
      ? cfg.welcomeSubject
      : params.kind === 'welcomeNewsletter'
        ? cfg.newsletterWelcomeSubject
        : params.kind === 'orderCreated'
          ? cfg.orderCreatedSubject
          : cfg.orderStatusSubject
  const htmlTpl =
    params.kind === 'welcomeSignup'
      ? cfg.welcomeHtml
      : params.kind === 'welcomeNewsletter'
        ? cfg.newsletterWelcomeHtml
        : params.kind === 'orderCreated'
          ? cfg.orderCreatedHtml
          : cfg.orderStatusHtml

  const subject = renderTemplate(String(subjectTpl || ''), vars).trim()
  const html = renderTemplate(String(htmlTpl || ''), vars).trim()
  if (!subject || !html) return { ok: false as const, skipped: true as const }

  try {
    await sendEmailViaResend({ to: toFinal, subject, html })
    await appendLog({
      user: toFinal,
      action: `Email göndərildi (${params.kind}) → ${params.to === toFinal ? 'real' : `testTo, original: ${params.to}`}`,
      ip: params.ip
    })
    return { ok: true as const }
  } catch (e: any) {
    await appendLog({
      user: toFinal,
      action: `Email xətası (${params.kind}): ${String(e?.message || e)}`,
      ip: params.ip
    })
    return { ok: false as const, skipped: false as const }
  }
}

