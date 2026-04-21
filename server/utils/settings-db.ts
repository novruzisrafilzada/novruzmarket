import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedSettings from '~/data/seed-settings'
import type { SiteSettings } from '~/stores/settings'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const settingsPath = join(dataDir, 'settings.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(settingsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as SiteSettings) : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(settingsPath, value)
}

export const readSettings = async () => {
  const existing = await safeReadJson()
  if (existing) {
    const ex: any = existing
    const seed: any = seedSettings
    return {
      ...seed,
      ...ex,
      socials: { ...seed.socials, ...(ex.socials || {}) },
      appPromo: { ...seed.appPromo, ...(ex.appPromo || {}) },
      flashSale: { ...seed.flashSale, ...(ex.flashSale || {}) },
      seo: { ...seed.seo, ...(ex.seo || {}) },
      homeFeatures: Array.isArray(ex.homeFeatures) ? ex.homeFeatures : seed.homeFeatures,
      productInfoBlocks: Array.isArray(ex.productInfoBlocks)
        ? ex.productInfoBlocks.map((block: any, index: number) => ({
            ...(seed.productInfoBlocks[index] || {}),
            ...(block || {}),
            title: { ...(seed.productInfoBlocks[index]?.title || {}), ...(block?.title || {}) },
            description: { ...(seed.productInfoBlocks[index]?.description || {}), ...(block?.description || {}) },
            detailTitle: { ...(seed.productInfoBlocks[index]?.detailTitle || {}), ...(block?.detailTitle || {}) },
            detailIntro: { ...(seed.productInfoBlocks[index]?.detailIntro || {}), ...(block?.detailIntro || {}) },
            detailRows: Array.isArray(block?.detailRows)
              ? block.detailRows.map((row: any, rowIndex: number) => ({
                  ...(seed.productInfoBlocks[index]?.detailRows?.[rowIndex] || { label: { az: '', ru: '', en: '' }, value: { az: '', ru: '', en: '' } }),
                  ...(row || {}),
                  label: { az: '', ru: '', en: '', ...(seed.productInfoBlocks[index]?.detailRows?.[rowIndex]?.label || {}), ...(row?.label || {}) },
                  value: { az: '', ru: '', en: '', ...(seed.productInfoBlocks[index]?.detailRows?.[rowIndex]?.value || {}), ...(row?.value || {}) }
                }))
              : (seed.productInfoBlocks[index]?.detailRows || []),
            detailCards: Array.isArray(block?.detailCards)
              ? block.detailCards.map((card: any, cardIndex: number) => ({
                  ...(seed.productInfoBlocks[index]?.detailCards?.[cardIndex] || { title: { az: '', ru: '', en: '' }, description: { az: '', ru: '', en: '' } }),
                  ...(card || {}),
                  title: { az: '', ru: '', en: '', ...(seed.productInfoBlocks[index]?.detailCards?.[cardIndex]?.title || {}), ...(card?.title || {}) },
                  description: { az: '', ru: '', en: '', ...(seed.productInfoBlocks[index]?.detailCards?.[cardIndex]?.description || {}), ...(card?.description || {}) }
                }))
              : (seed.productInfoBlocks[index]?.detailCards || []),
            detailNotes: Array.isArray(block?.detailNotes)
              ? block.detailNotes.map((note: any, noteIndex: number) => ({
                  ...(seed.productInfoBlocks[index]?.detailNotes?.[noteIndex] || { text: { az: '', ru: '', en: '' } }),
                  ...(note || {}),
                  text: { az: '', ru: '', en: '', ...(seed.productInfoBlocks[index]?.detailNotes?.[noteIndex]?.text || {}), ...(note?.text || {}) }
                }))
              : (seed.productInfoBlocks[index]?.detailNotes || []),
            detailHtml: { ...(seed.productInfoBlocks[index]?.detailHtml || {}), ...(block?.detailHtml || {}) }
          }))
        : seed.productInfoBlocks,
      newsletter: {
        ...seed.newsletter,
        ...(ex.newsletter || {}),
        title: { ...seed.newsletter?.title, ...(ex.newsletter?.title || {}) },
        subtitle: { ...seed.newsletter?.subtitle, ...(ex.newsletter?.subtitle || {}) },
        placeholder: { ...seed.newsletter?.placeholder, ...(ex.newsletter?.placeholder || {}) },
        button: { ...seed.newsletter?.button, ...(ex.newsletter?.button || {}) },
      },
      newsletterAutomation: { ...seed.newsletterAutomation, ...(ex.newsletterAutomation || {}) },
      emailAutomation: { ...seed.emailAutomation, ...(ex.emailAutomation || {}) },
      sellerPromotion: {
        ...seed.sellerPromotion,
        ...(ex.sellerPromotion || {}),
        sectionTitle: { ...seed.sellerPromotion?.sectionTitle, ...(ex.sellerPromotion?.sectionTitle || {}) },
        sectionSubtitle: { ...seed.sellerPromotion?.sectionSubtitle, ...(ex.sellerPromotion?.sectionSubtitle || {}) },
        sectionCta: { ...seed.sellerPromotion?.sectionCta, ...(ex.sellerPromotion?.sectionCta || {}) },
        plans: Array.isArray(ex.sellerPromotion?.plans) ? ex.sellerPromotion.plans : seed.sellerPromotion.plans
      },
      footerLinkGroups: Array.isArray(ex.footerLinkGroups)
        ? ex.footerLinkGroups.map((group: any, index: number) => ({
            ...(seed.footerLinkGroups[index] || {}),
            ...group,
            title: { ...(seed.footerLinkGroups[index]?.title || {}), ...(group?.title || {}) },
            items: Array.isArray(group?.items)
              ? group.items.map((item: any, itemIndex: number) => ({
                  ...(seed.footerLinkGroups[index]?.items?.[itemIndex] || {}),
                  ...item,
                  label: { ...(seed.footerLinkGroups[index]?.items?.[itemIndex]?.label || {}), ...(item?.label || {}) }
                }))
              : (seed.footerLinkGroups[index]?.items || [])
          }))
        : seed.footerLinkGroups,
      footerContent: {
        ...seed.footerContent,
        ...(ex.footerContent || {}),
        aboutText: { ...seed.footerContent?.aboutText, ...(ex.footerContent?.aboutText || {}) },
        copyrightText: { ...seed.footerContent?.copyrightText, ...(ex.footerContent?.copyrightText || {}) }
      },
      customCode: { ...seed.customCode, ...(ex.customCode || {}) },
      integrations: { ...seed.integrations, ...(ex.integrations || {}) },
      paymentMethods: Array.isArray(ex.paymentMethods) ? ex.paymentMethods : seed.paymentMethods,
      entryExperience: {
        ...seed.entryExperience,
        ...(ex.entryExperience || {}),
        splashTitle: { ...seed.entryExperience?.splashTitle, ...(ex.entryExperience?.splashTitle || {}) },
        splashSubtitle: { ...seed.entryExperience?.splashSubtitle, ...(ex.entryExperience?.splashSubtitle || {}) },
        popupBadge: { ...seed.entryExperience?.popupBadge, ...(ex.entryExperience?.popupBadge || {}) },
        popupTitle: { ...seed.entryExperience?.popupTitle, ...(ex.entryExperience?.popupTitle || {}) },
        popupSubtitle: { ...seed.entryExperience?.popupSubtitle, ...(ex.entryExperience?.popupSubtitle || {}) },
        primaryActionLabel: { ...seed.entryExperience?.primaryActionLabel, ...(ex.entryExperience?.primaryActionLabel || {}) },
        secondaryActionLabel: { ...seed.entryExperience?.secondaryActionLabel, ...(ex.entryExperience?.secondaryActionLabel || {}) }
      },
      creativeSuite: {
        ...seed.creativeSuite,
        ...(ex.creativeSuite || {}),
        badgeThresholds: Array.isArray(ex.creativeSuite?.badgeThresholds) ? ex.creativeSuite.badgeThresholds : seed.creativeSuite.badgeThresholds,
        searchSynonyms: Array.isArray(ex.creativeSuite?.searchSynonyms) ? ex.creativeSuite.searchSynonyms : seed.creativeSuite.searchSynonyms
      },
      productUsageGuide: {
        ...seed.productUsageGuide,
        ...(ex.productUsageGuide || {}),
        cards: Array.isArray(ex.productUsageGuide?.cards) ? ex.productUsageGuide.cards : seed.productUsageGuide.cards
      },
      contactPage: {
        ...seed.contactPage,
        ...(ex.contactPage || {}),
        infoCards: Array.isArray(ex.contactPage?.infoCards) ? ex.contactPage.infoCards : seed.contactPage.infoCards,
        businessHours: Array.isArray(ex.contactPage?.businessHours) ? ex.contactPage.businessHours : seed.contactPage.businessHours,
        faqs: Array.isArray(ex.contactPage?.faqs) ? ex.contactPage.faqs : seed.contactPage.faqs
      },
      cartCheckout: {
        ...seed.cartCheckout,
        ...(ex.cartCheckout || {}),
        cartHighlights: Array.isArray(ex.cartCheckout?.cartHighlights) ? ex.cartCheckout.cartHighlights : seed.cartCheckout.cartHighlights,
        checkoutTrustBadges: Array.isArray(ex.cartCheckout?.checkoutTrustBadges) ? ex.cartCheckout.checkoutTrustBadges : seed.cartCheckout.checkoutTrustBadges
      },
      mobileExperience: {
        ...seed.mobileExperience,
        ...(ex.mobileExperience || {}),
        densityProfiles: {
          ...seed.mobileExperience.densityProfiles,
          ...((ex.mobileExperience && ex.mobileExperience.densityProfiles) || {})
        }
      },
      design: { ...seed.design, ...(ex.design || {}) }
    } as SiteSettings
  }
  await atomicWriteJson(seedSettings)
  return seedSettings as unknown as SiteSettings
}

export const writeSettings = async (settings: SiteSettings) => {
  await atomicWriteJson(settings)
}
