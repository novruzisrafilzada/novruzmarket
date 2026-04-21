export default defineNuxtPlugin((nuxtApp) => {
  const visitorStorageKey = 'analyticsVisitorId'
  const sessionStorageKey = 'analyticsSessionId'
  const ensureId = (storage: Storage, key: string) => {
    const existing = storage.getItem(key)
    if (existing) return existing
    const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    storage.setItem(key, created)
    return created
  }
  const visitorId = ensureId(window.localStorage, visitorStorageKey)
  const sessionId = ensureId(window.sessionStorage, sessionStorageKey)
  let currentPath = window.location.pathname + window.location.search
  let startedAt = Date.now()
  let sent = false
  let heartbeatTimer: number | null = null

  const getSourcePayload = () => {
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source') || ''
    const utmMedium = params.get('utm_medium') || ''
    const utmCampaign = params.get('utm_campaign') || ''
    const referrerUrl = document.referrer || ''
    let source = 'direct'
    if (utmSource) source = utmMedium ? `${utmSource} / ${utmMedium}` : utmSource
    else if (referrerUrl) {
      try {
        source = new URL(referrerUrl).hostname || 'referral'
      } catch {
        source = 'referral'
      }
    }
    return {
      source,
      referrer: referrerUrl || 'direct',
      campaign: utmCampaign
    }
  }

  const sendVisit = async () => {
    if (sent) return
    sent = true
    const durationMs = Math.max(0, Date.now() - startedAt)
    const sourcePayload = getSourcePayload()
    try {
      await $fetch('/api/analytics/visit', {
        method: 'POST',
        body: {
          path: currentPath,
          durationMs,
          visitorId,
          sessionId,
          ...sourcePayload
        }
      })
    } catch {}
  }

  const resetWindow = (nextPath?: string) => {
    if (typeof nextPath === 'string') currentPath = nextPath
    startedAt = Date.now()
    sent = false
  }

  window.setTimeout(() => {
    sendVisit()
    resetWindow()
  }, 1200)

  heartbeatTimer = window.setInterval(() => {
    sendVisit()
    resetWindow()
  }, 15000)

  nuxtApp.hook('page:finish', () => {
    const nextPath = window.location.pathname + window.location.search
    if (nextPath !== currentPath) {
      sendVisit()
      resetWindow(nextPath)
    }
  })

  nuxtApp.hook('app:beforeUnmount', () => {
    if (heartbeatTimer) window.clearInterval(heartbeatTimer)
  })
})
