import { promises as fs } from 'node:fs'
import path from 'node:path'
import { defaultProductExperienceSettings, type ProductExperienceSettings } from '~/stores/productExperience'
import { replaceJsonFile } from '~/server/utils/json-file'

const filePath = path.resolve(process.cwd(), '.data/product-experience.json')

const ensureFile = async () => {
  try {
    await fs.access(filePath)
  } catch {
    await replaceJsonFile(filePath, defaultProductExperienceSettings())
  }
}

const normalizeText = (value: any, fallback: { az: string; ru: string; en: string }) => ({
  az: String(value?.az || fallback.az || ''),
  ru: String(value?.ru || fallback.ru || ''),
  en: String(value?.en || fallback.en || '')
})

const normalizePlacement = (value: any, fallback: 'top' | 'bottom') => (
  String(value || '') === 'bottom' ? 'bottom' : fallback
)

const normalizeConfig = (value: any): ProductExperienceSettings => {
  const fallback = defaultProductExperienceSettings()
  const sections = Array.isArray(value?.sections) ? value.sections : []
  return {
    previewProductId: Number(value?.previewProductId || 0) || null,
    sections: fallback.sections.map((section) => {
      const matched = sections.find((item: any) => String(item?.key || '') === section.key)
      return {
        key: section.key,
        enabled: matched?.enabled !== undefined ? Boolean(matched.enabled) : section.enabled,
        badge: normalizeText(matched?.badge, section.badge),
        title: normalizeText(matched?.title, section.title),
        subtitle: normalizeText(matched?.subtitle, section.subtitle)
      }
    }),
    media: {
      enableZoom: value?.media?.enableZoom !== undefined ? Boolean(value.media.enableZoom) : fallback.media.enableZoom,
      enableVideo: value?.media?.enableVideo !== undefined ? Boolean(value.media.enableVideo) : fallback.media.enableVideo,
      enable360: value?.media?.enable360 !== undefined ? Boolean(value.media.enable360) : fallback.media.enable360,
      enableVariationMedia: value?.media?.enableVariationMedia !== undefined ? Boolean(value.media.enableVariationMedia) : fallback.media.enableVariationMedia,
      enableLifestyleStrip: value?.media?.enableLifestyleStrip !== undefined ? Boolean(value.media.enableLifestyleStrip) : fallback.media.enableLifestyleStrip,
      demoVideoUrl: String(value?.media?.demoVideoUrl || fallback.media.demoVideoUrl || '').trim(),
      demoVideoPoster: String(value?.media?.demoVideoPoster || fallback.media.demoVideoPoster || '').trim()
    },
    buyBox: {
      enableBuyNow: value?.buyBox?.enableBuyNow !== undefined ? Boolean(value.buyBox.enableBuyNow) : fallback.buyBox.enableBuyNow,
      enableInstallments: value?.buyBox?.enableInstallments !== undefined ? Boolean(value.buyBox.enableInstallments) : fallback.buyBox.enableInstallments,
      installmentMonths: Math.max(2, Math.min(24, Number(value?.buyBox?.installmentMonths || fallback.buyBox.installmentMonths || 3))),
      installmentLabel: normalizeText(value?.buyBox?.installmentLabel, fallback.buyBox.installmentLabel),
      enableCoupon: value?.buyBox?.enableCoupon !== undefined ? Boolean(value.buyBox.enableCoupon) : fallback.buyBox.enableCoupon,
      couponCode: String(value?.buyBox?.couponCode || fallback.buyBox.couponCode || '').trim(),
      couponLabel: normalizeText(value?.buyBox?.couponLabel, fallback.buyBox.couponLabel),
      enableVariationSummary: value?.buyBox?.enableVariationSummary !== undefined ? Boolean(value.buyBox.enableVariationSummary) : fallback.buyBox.enableVariationSummary
    },
    utilityCards: {
      eta: {
        enabled: value?.utilityCards?.eta?.enabled !== undefined ? Boolean(value.utilityCards.eta.enabled) : fallback.utilityCards.eta.enabled,
        placement: normalizePlacement(value?.utilityCards?.eta?.placement, fallback.utilityCards.eta.placement)
      },
      policies: {
        enabled: value?.utilityCards?.policies?.enabled !== undefined ? Boolean(value.utilityCards.policies.enabled) : fallback.utilityCards.policies.enabled,
        placement: normalizePlacement(value?.utilityCards?.policies?.placement, fallback.utilityCards.policies.placement)
      },
      priceAlert: {
        enabled: value?.utilityCards?.priceAlert?.enabled !== undefined ? Boolean(value.utilityCards.priceAlert.enabled) : fallback.utilityCards.priceAlert.enabled,
        placement: normalizePlacement(value?.utilityCards?.priceAlert?.placement, fallback.utilityCards.priceAlert.placement)
      }
    },
    sellerTrust: {
      enabled: value?.sellerTrust?.enabled !== undefined ? Boolean(value.sellerTrust.enabled) : fallback.sellerTrust.enabled,
      badge: normalizeText(value?.sellerTrust?.badge, fallback.sellerTrust.badge),
      title: normalizeText(value?.sellerTrust?.title, fallback.sellerTrust.title),
      subtitle: normalizeText(value?.sellerTrust?.subtitle, fallback.sellerTrust.subtitle),
      responseTime: normalizeText(value?.sellerTrust?.responseTime, fallback.sellerTrust.responseTime),
      originLabel: normalizeText(value?.sellerTrust?.originLabel, fallback.sellerTrust.originLabel)
    },
    reviews: {
      showSummary: value?.reviews?.showSummary !== undefined ? Boolean(value.reviews.showSummary) : fallback.reviews.showSummary,
      showBreakdown: value?.reviews?.showBreakdown !== undefined ? Boolean(value.reviews.showBreakdown) : fallback.reviews.showBreakdown,
      showSort: value?.reviews?.showSort !== undefined ? Boolean(value.reviews.showSort) : fallback.reviews.showSort,
      showPhotoRail: value?.reviews?.showPhotoRail !== undefined ? Boolean(value.reviews.showPhotoRail) : fallback.reviews.showPhotoRail,
      defaultSort: ['newest', 'highest', 'lowest', 'verified'].includes(String(value?.reviews?.defaultSort || ''))
        ? value.reviews.defaultSort
        : fallback.reviews.defaultSort
    },
    bundle: {
      enableSelection: value?.bundle?.enableSelection !== undefined ? Boolean(value.bundle.enableSelection) : fallback.bundle.enableSelection,
      enableAddAll: value?.bundle?.enableAddAll !== undefined ? Boolean(value.bundle.enableAddAll) : fallback.bundle.enableAddAll,
      showTotal: value?.bundle?.showTotal !== undefined ? Boolean(value.bundle.showTotal) : fallback.bundle.showTotal
    },
    specs: {
      enabled: value?.specs?.enabled !== undefined ? Boolean(value.specs.enabled) : fallback.specs.enabled,
      badge: normalizeText(value?.specs?.badge, fallback.specs.badge),
      title: normalizeText(value?.specs?.title, fallback.specs.title),
      subtitle: normalizeText(value?.specs?.subtitle, fallback.specs.subtitle)
    },
    questions: (Array.isArray(value?.questions) ? value.questions : fallback.questions).map((item: any, index: number) => ({
      id: String(item?.id || fallback.questions[index]?.id || `question-${index + 1}`),
      productIds: Array.isArray(item?.productIds) ? item.productIds.map((id: any) => Number(id)).filter((id: number) => Number.isFinite(id) && id > 0) : [],
      question: normalizeText(item?.question, fallback.questions[0].question),
      answer: normalizeText(item?.answer, fallback.questions[0].answer),
      helpfulCount: Math.max(0, Number(item?.helpfulCount || 0))
    })),
    specCards: (Array.isArray(value?.specCards) ? value.specCards : fallback.specCards).map((item: any, index: number) => ({
      id: String(item?.id || fallback.specCards[index]?.id || `spec-card-${index + 1}`),
      enabled: item?.enabled !== undefined ? Boolean(item.enabled) : (fallback.specCards[index]?.enabled ?? true),
      icon: String(item?.icon || fallback.specCards[index]?.icon || 'Sparkles'),
      title: normalizeText(item?.title, fallback.specCards[0].title),
      description: normalizeText(item?.description, fallback.specCards[0].description)
    }))
  }
}

export const readProductExperience = async (): Promise<ProductExperienceSettings> => {
  await ensureFile()
  const raw = await fs.readFile(filePath, 'utf8')
  return normalizeConfig(JSON.parse(raw))
}

export const writeProductExperience = async (value: ProductExperienceSettings) => {
  const normalized = normalizeConfig(value)
  await replaceJsonFile(filePath, normalized)
  return normalized
}
