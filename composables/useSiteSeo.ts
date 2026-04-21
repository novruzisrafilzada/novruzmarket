import { computed, unref } from 'vue'

type SeoInput = string | undefined | null | { value: string | undefined | null }

const toCleanString = (value: SeoInput) => String(unref(value as any) || '').trim()

export const useSiteSeo = (options?: {
  title?: SeoInput
  description?: SeoInput
  image?: SeoInput
  path?: SeoInput
  type?: SeoInput
  noindex?: boolean | { value: boolean }
}) => {
  const settingsStore = useSettingsStore()
  const route = useRoute()
  const requestUrl = useRequestURL()

  const siteName = computed(() => String(settingsStore.settings.siteName || 'Novruzmarket').trim() || 'Novruzmarket')
  const baseUrl = computed(() => {
    const configured = String(settingsStore.settings.integrations?.domainName || '').trim().replace(/\/+$/, '')
    if (configured) return configured.startsWith('http') ? configured : `https://${configured}`
    return requestUrl.origin
  })

  const path = computed(() => {
    const explicit = toCleanString(options?.path)
    return explicit || route.path || '/'
  })

  const canonical = computed(() => `${baseUrl.value}${path.value.startsWith('/') ? path.value : `/${path.value}`}`)
  const defaultDescription = computed(() => String(settingsStore.settings.seo?.description || '').trim() || `${siteName.value} onlayn marketplace platforması.`)
  const title = computed(() => toCleanString(options?.title) || String(settingsStore.settings.seo?.title || '').trim() || siteName.value)
  const description = computed(() => toCleanString(options?.description) || defaultDescription.value)
  const keywords = computed(() => String(settingsStore.settings.seo?.keywords || '').trim())
  const rawImage = computed(() => toCleanString(options?.image) || String(settingsStore.settings.siteLogo || '').trim())
  const image = computed(() => {
    if (!rawImage.value) return ''
    if (/^https?:\/\//i.test(rawImage.value)) return rawImage.value
    return `${baseUrl.value}${rawImage.value.startsWith('/') ? rawImage.value : `/${rawImage.value}`}`
  })
  const type = computed(() => toCleanString(options?.type) || 'website')
  const noindex = computed(() => Boolean(unref(options?.noindex as any)))

  useHead(() => ({
    title: title.value,
    link: [
      { rel: 'canonical', href: canonical.value }
    ]
  }))

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogUrl: canonical,
    ogType: type,
    ogSiteName: siteName,
    ogImage: image,
    twitterCard: computed(() => image.value ? 'summary_large_image' : 'summary'),
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    keywords,
    robots: computed(() => noindex.value ? 'noindex, nofollow' : 'index, follow')
  })

  return {
    siteName,
    baseUrl,
    canonical
  }
}
