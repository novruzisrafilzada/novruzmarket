import { defineStore } from 'pinia'
import seedSettings from '~/data/seed-settings'

export interface SiteSettings {
  siteName: string
  siteLogo: string
  siteEmail: string
  sitePhone: string
  address: string
  language: 'az' | 'ru' | 'en'
  socials: {
    whatsapp: string
    instagram: string
    facebook: string
    youtube: string
  }
  heroAnimations: boolean
  appPromo: {
    enabled: boolean
    title: string
    subtitle: string
    image: string
    iosLink: string
    androidLink: string
  }
  creativeSuite: {
    recentSalesPopupEnabled: boolean
    waitlistEnabled: boolean
    lowStockThreshold: number
    loyaltyEnabled: boolean
    pointsPerOrderUnit: number
    firstOrderBonusPoints: number
    referralRewardPoints: number
    badgeThresholds: Array<{ label: string; minPoints: number }>
    searchSynonyms: Array<{ term: string; aliases: string[] }>
    didYouMeanEnabled: boolean
    popularSearchesEnabled: boolean
    seasonalTheme: 'none' | 'spring' | 'summer' | 'autumn' | 'winter'
    darkModeEnabled: boolean
    featuredSellerLabel: string
  }
  productUsageGuide: {
    enabled: boolean
    cards: Array<{
      enabled: boolean
      title: string
      text: string
    }>
  }
  contactPage: {
    heroBadge: string
    heroTitle: string
    heroSubtitle: string
    primaryCtaLabel: string
    primaryCtaHref: string
    secondaryCtaLabel: string
    secondaryCtaHref: string
    whatsappLabel: string
    showSocials: boolean
    showBusinessHours: boolean
    showFaq: boolean
    infoCards: Array<{
      key: 'address' | 'phone' | 'email' | 'whatsapp'
      enabled: boolean
      label: string
      description: string
    }>
    businessHours: Array<{
      day: string
      hours: string
    }>
    faqs: Array<{
      enabled: boolean
      question: string
      answer: string
    }>
  }
  cartCheckout: {
    cartBadge: string
    cartTitle: string
    cartSubtitle: string
    vatIncludedLabel: string
    vatIncludedDescription: string
    vatRatePercent: number
    showVatIncluded: boolean
    enableCityAutofill: boolean
    preferredCityDetection: 'device' | 'ip' | 'device_then_ip'
    cartAccentBg: string
    cartAccentText: string
    checkoutAccentBg: string
    checkoutAccentText: string
    cartHighlights: Array<{
      enabled: boolean
      label: string
    }>
    checkoutBadge: string
    checkoutTitle: string
    checkoutSubtitle: string
    checkoutSupportTitle: string
    checkoutSupportText: string
    showCartStickySummary: boolean
    showCheckoutSupport: boolean
    checkoutTrustBadges: Array<{
      enabled: boolean
      label: string
    }>
  }
  mobileExperience: {
    enabled: boolean
    compactTypography: boolean
    stickyHeader: boolean
    bottomTabBar: boolean
    hideHeavyFooterOnMobile: boolean
    catalogHelperHeadings: boolean
    densityProfiles: {
      home: 'compact' | 'comfortable'
      shop: 'compact' | 'comfortable'
      product: 'compact' | 'comfortable'
      cart: 'compact' | 'comfortable'
      checkout: 'compact' | 'comfortable'
    }
  }
  googleMapsEmbedUrl: string
  flashSale: {
    enabled: boolean
    badge: string
    text: string
  }
  homeFeatures: Array<{
    enabled: boolean
    icon: 'Truck' | 'ShieldCheck' | 'Headphones' | 'RotateCcw'
    title: { az: string; ru: string; en: string }
    description: { az: string; ru: string; en: string }
  }>
  productInfoBlocks: Array<{
    enabled: boolean
    icon: 'Truck' | 'BadgeCheck' | 'ShieldCheck' | 'CreditCard' | 'Sparkles'
    image: string
    title: { az: string; ru: string; en: string }
    description: { az: string; ru: string; en: string }
    detailTitle: { az: string; ru: string; en: string }
    detailIntro: { az: string; ru: string; en: string }
    detailRows: Array<{
      label: { az: string; ru: string; en: string }
      value: { az: string; ru: string; en: string }
    }>
    detailCards: Array<{
      title: { az: string; ru: string; en: string }
      description: { az: string; ru: string; en: string }
    }>
    detailNotes: Array<{
      text: { az: string; ru: string; en: string }
    }>
    detailHtml: { az: string; ru: string; en: string }
  }>
  newsletter: {
    enabled: boolean
    title: { az: string; ru: string; en: string }
    subtitle: { az: string; ru: string; en: string }
    placeholder: { az: string; ru: string; en: string }
    button: { az: string; ru: string; en: string }
  }
  newsletterAutomation: {
    enabled: boolean
    onNewProduct: boolean
    onNewBlog: boolean
    onNewBanner: boolean
    onNewSlider: boolean
  }
  emailAutomation: {
    enabled: boolean
    testTo: string
    onWelcomeSignup: boolean
    onWelcomeNewsletterSubscribe: boolean
    onOrderCreated: boolean
    onOrderStatusChanged: boolean
    welcomeSubject: string
    welcomeHtml: string
    newsletterWelcomeSubject: string
    newsletterWelcomeHtml: string
    orderCreatedSubject: string
    orderCreatedHtml: string
    orderStatusSubject: string
    orderStatusHtml: string
  }
  sellerPromotion: {
    sectionEnabled: boolean
    sectionTitle: { az: string; ru: string; en: string }
    sectionSubtitle: { az: string; ru: string; en: string }
    sectionCta: { az: string; ru: string; en: string }
    sectionLabel: string
    sectionLimit: number
    featuredBadgeText: string
    paymentReceiverName: string
    paymentReceiverCard: string
    paymentReceiverBank: string
    paymentInstructions: string
    plans: Array<{
      days: number
      label: string
      price: number
      enabled: boolean
    }>
  }
  sellerCommissionRate: number
  footerLinkGroups: Array<{
    key: string
    title: { az: string; ru: string; en: string }
    items: Array<{
      label: { az: string; ru: string; en: string }
      href: string
    }>
  }>
  footerContent: {
    aboutText: { az: string; ru: string; en: string }
    copyrightText: { az: string; ru: string; en: string }
  }
  customCode: {
    customCss: string
    headScript: string
    bodyEndScript: string
  }
  integrations: {
    emailVerificationEnabled: boolean
    phoneVerificationEnabled: boolean
    smsProvider: '' | 'twilio' | 'custom'
    smsApiKey: string
    smsApiSecret: string
    smsFrom: string
    smsWebhookUrl: string
    emailApiKey: string
    emailFrom: string
    hostingWebhook: string
    domainName: string
    paymentProvider: '' | 'stripe'
    paymentApiKey: string
    paymentSecret: string
    paymentCallbackUrl: string
    analyticsApiKey: string
  }
  paymentMethods: Array<{
    key: 'card' | 'cash'
    name: string
    provider: string
    description: string
    enabled: boolean
  }>
  entryExperience: {
    splashEnabled: boolean
    safeModeEnabled: boolean
    showOncePerSession: boolean
    maxDurationMs: number
    popupEnabled: boolean
    icon: 'Sparkles' | 'Bell' | 'Star' | 'Gem' | 'ShoppingBag'
    splashTitle: { az: string; ru: string; en: string }
    splashSubtitle: { az: string; ru: string; en: string }
    popupBadge: { az: string; ru: string; en: string }
    gradientFrom: string
    gradientVia: string
    gradientTo: string
    accentColor: string
    popupTitle: { az: string; ru: string; en: string }
    popupSubtitle: { az: string; ru: string; en: string }
    primaryActionLabel: { az: string; ru: string; en: string }
    primaryActionHref: string
    secondaryActionLabel: { az: string; ru: string; en: string }
    secondaryActionHref: string
  }
  design: {
    primaryColor: string
    accentColor: string
    appBg: string
    appText: string
    surfaceBg: string
    borderColor: string
    footerBg: string
    footerText: string
    footerMuted: string
    footerBorder: string
    headerShowLogo: boolean
    homeLayout: number
    heroHeightMobile: number
    heroHeightDesktop: number
    homeBannersLayout: 'carousel' | 'mosaic'
    homeBannersPlacement: 'afterFeatures' | 'afterTopDeals' | 'afterTopProducts'
    heroAutoplayEnabled: boolean
    heroAutoplayDelayMs: number
    heroTransitionSpeedMs: number
    heroEffect: 'slide' | 'fade'
    heroLoop: boolean
    heroPagination: boolean
    heroSectionBgDesktop: string
    headerNavBg: string
    headerNavLinkDefault: string
    headerNavLinkHover: string
    headerNavLinkActive: string
    deptBtnBg: string
    deptBtnBorder: string
    deptBtnText: string
    deptBtnHoverBg: string
    deptBtnHoverBorder: string
    deptBtnHoverText: string
    deptBtnActiveBg: string
    deptBtnActiveBorder: string
    deptBtnActiveText: string
    deptMenuWidth: number
    deptMenuMaxHeight: number
  }
  currency: string
  notifications: boolean
  maintenanceMode: boolean
  seo: {
    title: string
    description: string
    keywords: string
  }
}

const isPlainObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const mergeDeep = <T>(base: T, patch?: Partial<T>): T => {
  if (!patch) return base
  const output: any = Array.isArray(base) ? [...base] : { ...(base as any) }
  for (const [key, value] of Object.entries(patch as Record<string, any>)) {
    const current = output[key]
    if (isPlainObject(current) && isPlainObject(value)) {
      output[key] = mergeDeep(current, value)
    } else {
      output[key] = value
    }
  }
  return output
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    hydrated: false,
    settings: seedSettings as unknown as SiteSettings,
  }),
  actions: {
    setAll(settings: SiteSettings) {
      this.settings = settings
      this.hydrated = true
    },
    async fetchSettings() {
      const settings = await $fetch<SiteSettings>('/api/settings')
      this.setAll(settings)
      return settings
    },
    setSettings(next: Partial<SiteSettings>) {
      this.settings = mergeDeep(this.settings, next)
      this.hydrated = true
    },
    async saveSettings(next?: Partial<SiteSettings>) {
      const payload = next ? mergeDeep(this.settings, next) : this.settings
      const saved = await $fetch<SiteSettings>('/api/settings', { method: 'PUT', body: payload })
      this.setAll(saved)
      return saved
    }
  },
})
