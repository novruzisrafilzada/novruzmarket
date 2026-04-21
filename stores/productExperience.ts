import { defineStore } from 'pinia'

export type ProductExperienceLocalizedText = {
  az: string
  ru: string
  en: string
}

export type ProductExperienceSectionKey = 'infoBlocks' | 'usageGuide' | 'faq' | 'bundle' | 'recommendations'

export type ProductExperienceSection = {
  key: ProductExperienceSectionKey
  enabled: boolean
  badge: ProductExperienceLocalizedText
  title: ProductExperienceLocalizedText
  subtitle: ProductExperienceLocalizedText
}

export type ProductExperienceMediaSettings = {
  enableZoom: boolean
  enableVideo: boolean
  enable360: boolean
  enableVariationMedia: boolean
  enableLifestyleStrip: boolean
  demoVideoUrl: string
  demoVideoPoster: string
}

export type ProductExperienceBuyBoxSettings = {
  enableBuyNow: boolean
  enableInstallments: boolean
  installmentMonths: number
  installmentLabel: ProductExperienceLocalizedText
  enableCoupon: boolean
  couponCode: string
  couponLabel: ProductExperienceLocalizedText
  enableVariationSummary: boolean
}

export type ProductExperienceSellerTrustSettings = {
  enabled: boolean
  badge: ProductExperienceLocalizedText
  title: ProductExperienceLocalizedText
  subtitle: ProductExperienceLocalizedText
  responseTime: ProductExperienceLocalizedText
  originLabel: ProductExperienceLocalizedText
}

export type ProductExperienceReviewSettings = {
  showSummary: boolean
  showBreakdown: boolean
  showSort: boolean
  showPhotoRail: boolean
  defaultSort: 'newest' | 'highest' | 'lowest' | 'verified'
}

export type ProductExperienceBundleSettings = {
  enableSelection: boolean
  enableAddAll: boolean
  showTotal: boolean
}

export type ProductExperienceUtilityPlacement = 'top' | 'bottom'

export type ProductExperienceUtilityCardSettings = {
  enabled: boolean
  placement: ProductExperienceUtilityPlacement
}

export type ProductExperienceUtilityCardsSettings = {
  eta: ProductExperienceUtilityCardSettings
  policies: ProductExperienceUtilityCardSettings
  priceAlert: ProductExperienceUtilityCardSettings
}

export type ProductExperienceSpecsSettings = {
  enabled: boolean
  badge: ProductExperienceLocalizedText
  title: ProductExperienceLocalizedText
  subtitle: ProductExperienceLocalizedText
}

export type ProductExperienceQuestionItem = {
  id: string
  productIds: number[]
  question: ProductExperienceLocalizedText
  answer: ProductExperienceLocalizedText
  helpfulCount: number
}

export type ProductExperienceSpecCard = {
  id: string
  enabled: boolean
  icon: string
  title: ProductExperienceLocalizedText
  description: ProductExperienceLocalizedText
}

export type ProductExperienceSettings = {
  previewProductId: number | null
  sections: ProductExperienceSection[]
  media: ProductExperienceMediaSettings
  buyBox: ProductExperienceBuyBoxSettings
  utilityCards: ProductExperienceUtilityCardsSettings
  sellerTrust: ProductExperienceSellerTrustSettings
  reviews: ProductExperienceReviewSettings
  bundle: ProductExperienceBundleSettings
  specs: ProductExperienceSpecsSettings
  questions: ProductExperienceQuestionItem[]
  specCards: ProductExperienceSpecCard[]
}

const localize = (az: string, ru: string, en: string): ProductExperienceLocalizedText => ({ az, ru, en })

export const defaultProductExperienceSettings = (): ProductExperienceSettings => ({
  previewProductId: null,
  sections: [
    {
      key: 'infoBlocks',
      enabled: true,
      badge: localize('Etibar blokları', 'Блоки доверия', 'Trust blocks'),
      title: localize('Məhsul üstünlükləri', 'Преимущества товара', 'Product highlights'),
      subtitle: localize('Çatdırılma, zəmanət və dəstək bloklarını məhsul səhifəsində göstərir.', 'Показывает блоки доставки, гарантии и поддержки на странице товара.', 'Shows delivery, warranty and support blocks on the product page.')
    },
    {
      key: 'usageGuide',
      enabled: true,
      badge: localize('İstifadə', 'Использование', 'Usage'),
      title: localize('İstifadə bələdçisi', 'Руководство по использованию', 'Usage guide'),
      subtitle: localize('Qısa istifadə və uyğun seçim kartlarını göstərir.', 'Показывает карточки с краткими инструкциями и подборками.', 'Displays concise usage and matching guide cards.')
    },
    {
      key: 'faq',
      enabled: true,
      badge: localize('Sual-cavab', 'Вопросы и ответы', 'Questions'),
      title: localize('Sual-cavab', 'Вопросы и ответы', 'Questions and answers'),
      subtitle: localize('FAQ məzmununu məhsul səhifəsinə çıxarır.', 'Выводит FAQ на страницу товара.', 'Shows FAQ content on the product page.')
    },
    {
      key: 'bundle',
      enabled: true,
      badge: localize('Birlikdə al', 'Покупают вместе', 'Bundle'),
      title: localize('Birlikdə al', 'Покупают вместе', 'Frequently bought together'),
      subtitle: localize('Əlaqəli bundle təkliflərini kartlarla göstərir.', 'Показывает связанные bundle-предложения карточками.', 'Shows related bundle suggestions as cards.')
    },
    {
      key: 'recommendations',
      enabled: true,
      badge: localize('Smart seçim', 'Умный выбор', 'Smart picks'),
      title: localize('Sizə uyğun ola bilər', 'Может подойти вам', 'You may also like'),
      subtitle: localize('Oxşar və uyğun tövsiyələri məhsul kartı ilə göstərir.', 'Показывает похожие и подходящие рекомендации карточками.', 'Displays relevant recommendations using product cards.')
    }
  ],
  media: {
    enableZoom: true,
    enableVideo: true,
    enable360: true,
    enableVariationMedia: true,
    enableLifestyleStrip: true,
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    demoVideoPoster: ''
  },
  buyBox: {
    enableBuyNow: true,
    enableInstallments: true,
    installmentMonths: 3,
    installmentLabel: localize('Faizsiz hissəli ödəniş', 'Рассрочка без процентов', 'Interest-free installments'),
    enableCoupon: true,
    couponCode: 'WELCOME10',
    couponLabel: localize('İlk sifarişdə əlavə endirim', 'Скидка на первый заказ', 'Extra discount on first order'),
    enableVariationSummary: true
  },
  utilityCards: {
    eta: {
      enabled: true,
      placement: 'top'
    },
    policies: {
      enabled: true,
      placement: 'top'
    },
    priceAlert: {
      enabled: true,
      placement: 'top'
    }
  },
  sellerTrust: {
    enabled: true,
    badge: localize('Seller trust', 'Seller trust', 'Seller trust'),
    title: localize('Satıcı etibarı', 'Надежность продавца', 'Seller confidence'),
    subtitle: localize('Satıcı performansı və verification göstəriciləri.', 'Показатели продавца и верификации.', 'Seller performance and verification signals.'),
    responseTime: localize('Orta cavab: 15 dəqiqə', 'Средний ответ: 15 минут', 'Average response: 15 minutes'),
    originLabel: localize('Göndəriş mənşəyi: Azərbaycan', 'Отправка из: Азербайджан', 'Ships from: Azerbaijan')
  },
  reviews: {
    showSummary: true,
    showBreakdown: true,
    showSort: true,
    showPhotoRail: true,
    defaultSort: 'newest'
  },
  bundle: {
    enableSelection: true,
    enableAddAll: true,
    showTotal: true
  },
  specs: {
    enabled: true,
    badge: localize('Why buy', 'Почему купить', 'Why buy'),
    title: localize('Niyə bunu alasan', 'Почему это стоит купить', 'Why it is worth buying'),
    subtitle: localize('Uyğunluq, istifadə ssenarisi və əsas üstünlüklər.', 'Сценарии использования, совместимость и преимущества.', 'Use cases, compatibility and core advantages.')
  },
  questions: [
    {
      id: 'delivery-fit',
      productIds: [],
      question: localize('Bu məhsul neçə günə çatır?', 'За сколько дней доставляется?', 'How many days does delivery take?'),
      answer: localize('Şəhər və aktiv shipping metoduna görə ETA blokunda təxmini müddət göstərilir, yekun tarix checkout-da təsdiqlənir.', 'ETA рассчитывается по городу и активному способу доставки, финальная дата подтверждается на checkout.', 'ETA is estimated from city and active shipping methods, with the final date confirmed at checkout.'),
      helpfulCount: 18
    },
    {
      id: 'variation-help',
      productIds: [],
      question: localize('Variasiya seçəndə qiymət və stok yenilənir?', 'Меняются ли цена и остаток при выборе варианта?', 'Do price and stock update with variation selection?'),
      answer: localize('Bəli, seçilmiş variation üçün qiymət, stok və media avtomatik yenilənir.', 'Да, цена, остаток и медиа автоматически обновляются для выбранного варианта.', 'Yes, price, stock and media update automatically for the selected variation.'),
      helpfulCount: 12
    }
  ],
  specCards: [
    {
      id: 'who-for',
      enabled: true,
      icon: 'Sparkles',
      title: localize('Kim üçündür', 'Для кого', 'Who it is for'),
      description: localize('Gündəlik istifadə, hədiyyə və premium hiss üçün uyğun seçim.', 'Подходит для ежедневного использования, подарка и премиального ощущения.', 'A strong fit for daily use, gifting and a premium feel.'),
    },
    {
      id: 'why-buy',
      enabled: true,
      icon: 'BadgeCheck',
      title: localize('Niyə bunu alım', 'Почему купить', 'Why buy this'),
      description: localize('Əsas fərqləndiricilər, keyfiyyət hissi və uyğun aksessuar ekosistemi ilə seçilir.', 'Отличается ключевыми преимуществами, ощущением качества и совместимой экосистемой аксессуаров.', 'Stands out with clear differentiators, premium feel and matching accessory ecosystem.'),
    },
    {
      id: 'compatibility',
      enabled: true,
      icon: 'ShieldCheck',
      title: localize('Uyğunluq', 'Совместимость', 'Compatibility'),
      description: localize('Ölçü, xüsusiyyət və istifadə ssenarilərinə görə uyğunluğu əvvəlcədən aydın göstərir.', 'Заранее показывает совместимость по размеру, характеристикам и сценарию использования.', 'Clarifies fit by size, specs and intended usage before purchase.'),
    }
  ]
})

export const useProductExperienceStore = defineStore('productExperience', {
  state: () => ({
    config: defaultProductExperienceSettings(),
    hydrated: false
  }),
  actions: {
    setConfig(next: Partial<ProductExperienceSettings>) {
      const fallback = defaultProductExperienceSettings()
      const incomingSections = Array.isArray(next.sections) ? next.sections : this.config.sections
      const incomingQuestions = Array.isArray(next.questions) ? next.questions : this.config.questions
      const incomingSpecCards = Array.isArray(next.specCards) ? next.specCards : this.config.specCards
      this.config = {
        ...fallback,
        ...this.config,
        ...next,
        media: {
          ...fallback.media,
          ...(this.config.media || {}),
          ...(next.media || {})
        },
        buyBox: {
          ...fallback.buyBox,
          ...(this.config.buyBox || {}),
          ...(next.buyBox || {}),
          installmentLabel: {
            ...fallback.buyBox.installmentLabel,
            ...(this.config.buyBox?.installmentLabel || {}),
            ...(next.buyBox?.installmentLabel || {})
          },
          couponLabel: {
            ...fallback.buyBox.couponLabel,
            ...(this.config.buyBox?.couponLabel || {}),
            ...(next.buyBox?.couponLabel || {})
          }
        },
        utilityCards: {
          eta: {
            ...fallback.utilityCards.eta,
            ...(this.config.utilityCards?.eta || {}),
            ...(next.utilityCards?.eta || {})
          },
          policies: {
            ...fallback.utilityCards.policies,
            ...(this.config.utilityCards?.policies || {}),
            ...(next.utilityCards?.policies || {})
          },
          priceAlert: {
            ...fallback.utilityCards.priceAlert,
            ...(this.config.utilityCards?.priceAlert || {}),
            ...(next.utilityCards?.priceAlert || {})
          }
        },
        sellerTrust: {
          ...fallback.sellerTrust,
          ...(this.config.sellerTrust || {}),
          ...(next.sellerTrust || {}),
          badge: {
            ...fallback.sellerTrust.badge,
            ...(this.config.sellerTrust?.badge || {}),
            ...(next.sellerTrust?.badge || {})
          },
          title: {
            ...fallback.sellerTrust.title,
            ...(this.config.sellerTrust?.title || {}),
            ...(next.sellerTrust?.title || {})
          },
          subtitle: {
            ...fallback.sellerTrust.subtitle,
            ...(this.config.sellerTrust?.subtitle || {}),
            ...(next.sellerTrust?.subtitle || {})
          },
          responseTime: {
            ...fallback.sellerTrust.responseTime,
            ...(this.config.sellerTrust?.responseTime || {}),
            ...(next.sellerTrust?.responseTime || {})
          },
          originLabel: {
            ...fallback.sellerTrust.originLabel,
            ...(this.config.sellerTrust?.originLabel || {}),
            ...(next.sellerTrust?.originLabel || {})
          }
        },
        reviews: {
          ...fallback.reviews,
          ...(this.config.reviews || {}),
          ...(next.reviews || {})
        },
        bundle: {
          ...fallback.bundle,
          ...(this.config.bundle || {}),
          ...(next.bundle || {})
        },
        specs: {
          ...fallback.specs,
          ...(this.config.specs || {}),
          ...(next.specs || {}),
          badge: {
            ...fallback.specs.badge,
            ...(this.config.specs?.badge || {}),
            ...(next.specs?.badge || {})
          },
          title: {
            ...fallback.specs.title,
            ...(this.config.specs?.title || {}),
            ...(next.specs?.title || {})
          },
          subtitle: {
            ...fallback.specs.subtitle,
            ...(this.config.specs?.subtitle || {}),
            ...(next.specs?.subtitle || {})
          }
        },
        sections: fallback.sections.map((section) => {
          const matched = incomingSections.find((item: any) => item?.key === section.key)
          return {
            ...section,
            ...matched,
            badge: { ...section.badge, ...(matched?.badge || {}) },
            title: { ...section.title, ...(matched?.title || {}) },
            subtitle: { ...section.subtitle, ...(matched?.subtitle || {}) }
          }
        }),
        questions: incomingQuestions.map((item: any, index: number) => ({
          id: String(item?.id || `question-${index + 1}`),
          productIds: Array.isArray(item?.productIds) ? item.productIds.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value) && value > 0) : [],
          question: { ...fallback.questions[0].question, ...(item?.question || {}) },
          answer: { ...fallback.questions[0].answer, ...(item?.answer || {}) },
          helpfulCount: Math.max(0, Number(item?.helpfulCount || 0))
        })),
        specCards: incomingSpecCards.map((item: any, index: number) => ({
          id: String(item?.id || `spec-card-${index + 1}`),
          enabled: item?.enabled !== undefined ? Boolean(item.enabled) : true,
          icon: String(item?.icon || 'Sparkles'),
          title: { ...fallback.specCards[0].title, ...(item?.title || {}) },
          description: { ...fallback.specCards[0].description, ...(item?.description || {}) }
        }))
      }
      this.hydrated = true
    },
    async fetchConfig() {
      const config = await $fetch<ProductExperienceSettings>('/api/product-experience')
      this.setConfig(config)
    },
    async saveConfig(next?: Partial<ProductExperienceSettings>) {
      const payload = next ? { ...this.config, ...next } : this.config
      const saved = await $fetch<ProductExperienceSettings>('/api/product-experience', {
        method: 'PUT',
        body: payload
      })
      this.setConfig(saved)
    }
  }
})
