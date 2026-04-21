<script setup lang="ts">
import { ChevronLeft, Star, ShoppingCart, Plus, Minus, CheckCircle, XCircle, Heart, ChevronDown, Cpu, ShieldCheck, Wifi, Monitor, HardDrive, Battery, Truck, CreditCard, BadgeCheck, Sparkles, Share2, X, ArrowRight, PlayCircle, ZoomIn, RotateCw, Store } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useFaqStore } from '~/stores/faq'
import { useProductStore } from '~/stores/products'
import { useShippingStore } from '~/stores/shipping'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import { useSettingsStore } from '~/stores/settings'
import { useShopExperienceStore } from '~/stores/shopExperience'
import { useProductExperienceStore } from '~/stores/productExperience'
import { canAddProductToCart, getCartDisabledReason, getEffectiveProductStock } from '~/utils/product-availability'
import { buildProductHref, parseProductRouteId } from '~/utils/product-route'

const cartStore = useCartStore()
const faqStore = useFaqStore()
const productStore = useProductStore()
const shippingStore = useShippingStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const settingsStore = useSettingsStore()
const shopExperienceStore = useShopExperienceStore()
const productExperienceStore = useProductExperienceStore()
const route = useRoute()
const router = useRouter()
const { formatMoney } = useMoney()
const { t, lang } = useT()
const { nameOf, descOf } = useProductText()
const { profileFor } = useMobileDensity()
const productDensity = profileFor('product')
const quantity = ref(1)
const selectedVariationId = ref<number | null>(null)
const activeImage = ref('')
const activeInfoTab = ref<'description' | 'additional' | 'reviews'>('description')
const mobileInfoOpen = ref<'description' | 'additional' | 'reviews' | null>('description')
const reviewFilter = ref<'all' | 'top' | 'verified' | 'photos'>('all')
const deliveryCity = ref('')
const activePolicyId = ref<'delivery' | 'returns' | 'support'>('delivery')

type Review = {
  id: number
  productId: number
  name: string
  email: string
  rating: number
  comment: string
  createdAt: string
  verifiedPurchase?: boolean
  images?: string[]
  helpfulCount?: number
}

const reviews = ref<Review[]>([])
const reviewsLoading = ref(false)
const reviewSubmitting = ref(false)
const waitlistSubmitting = ref(false)
const productAlertSubmitting = ref(false)
const waitlistEmail = ref('')
const reviewForm = ref({
  name: '',
  email: '',
  rating: 0,
  comment: '',
  imageUrls: ''
})
const reviewSort = ref<'newest' | 'highest' | 'lowest' | 'verified'>('newest')
const zoomedMedia = ref(false)
const media360Playing = ref(false)
const sellerTrust = ref<any | null>(null)
const bundleItems = ref<any[]>([])

if (!productStore.hydrated || productStore.products.length === 0) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const products = await fetcher('/api/products')
    productStore.setProducts(products as any)
  } else {
    await productStore.fetchProducts()
  }
}

const product = computed(() => {
  const id = parseProductRouteId(route.params.id as string)
  const p = productStore.products.find(p => p.id === id) || null
  if (p && !activeImage.value) activeImage.value = p.image
  return p
})
const canonicalProductHref = computed(() => product.value ? buildProductHref(product.value) : '')

if (!settingsStore.hydrated) {
  const fetcher = process.server ? useRequestFetch() : undefined
  const settings = await (fetcher ? fetcher('/api/settings') : $fetch('/api/settings'))
  settingsStore.setAll(settings as any)
}

if (!shopExperienceStore.hydrated) {
  const fetcher = process.server ? useRequestFetch() : undefined
  const config = await (fetcher ? fetcher('/api/shop-experience') : $fetch('/api/shop-experience'))
  shopExperienceStore.setConfig(config as any)
}

if (!productExperienceStore.hydrated) {
  const fetcher = process.server ? useRequestFetch() : undefined
  const config = await (fetcher ? fetcher('/api/product-experience') : $fetch('/api/product-experience'))
  productExperienceStore.setConfig(config as any)
}

if (!shippingStore.hydrated) {
  const fetcher = process.server ? useRequestFetch() : undefined
  const methods = await (fetcher ? fetcher('/api/shipping') : $fetch('/api/shipping'))
  shippingStore.setMethods(methods as any)
}

if (!faqStore.hydrated) {
  const fetcher = process.server ? useRequestFetch() : undefined
  const items = await (fetcher ? fetcher('/api/faq') : $fetch('/api/faq'))
  faqStore.setItems(items as any)
}

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Məhsul tapılmadı' })
}

if (product.value && String(route.params.id) !== String(canonicalProductHref.value.split('/product/')[1])) {
  if (process.server) {
    await navigateTo(canonicalProductHref.value, { redirectCode: 301, replace: true })
  } else {
    navigateTo(canonicalProductHref.value, { replace: true })
  }
}

const productInfoBlocks = computed(() => {
  const l = lang.value
  const list: any[] = Array.isArray((settingsStore.settings as any).productInfoBlocks) ? (settingsStore.settings as any).productInfoBlocks : []
  return list
    .filter(x => x && x.enabled)
    .map(x => ({
      icon: String(x.icon || ''),
      image: String(x.image || ''),
      title: String(x.title?.[l] || x.title?.az || ''),
      description: String(x.description?.[l] || x.description?.az || ''),
      detailTitle: String(x.detailTitle?.[l] || x.detailTitle?.az || x.title?.[l] || x.title?.az || ''),
      detailIntro: String(x.detailIntro?.[l] || x.detailIntro?.az || ''),
      detailRows: Array.isArray(x.detailRows)
        ? x.detailRows
            .map((row: any) => ({
              label: String(row?.label?.[l] || row?.label?.az || ''),
              value: String(row?.value?.[l] || row?.value?.az || '')
            }))
            .filter((row: any) => row.label || row.value)
        : [],
      detailCards: Array.isArray(x.detailCards)
        ? x.detailCards
            .map((card: any) => ({
              title: String(card?.title?.[l] || card?.title?.az || ''),
              description: String(card?.description?.[l] || card?.description?.az || '')
            }))
            .filter((card: any) => card.title || card.description)
        : [],
      detailNotes: Array.isArray(x.detailNotes)
        ? x.detailNotes
            .map((note: any) => ({ text: String(note?.text?.[l] || note?.text?.az || '') }))
            .filter((note: any) => note.text)
        : [],
    }))
    .filter(x => x.title || x.description)
})

useSiteSeo({
  title: computed(() => product.value?.seo?.title || nameOf(product.value) || 'Məhsul'),
  description: computed(() => product.value?.seo?.description || descOf(product.value) || ''),
  image: computed(() => product.value?.image || ''),
  path: computed(() => route.fullPath),
  type: 'product'
})

const productStructuredData = computed(() => {
  const target = product.value
  if (!target) return ''
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: nameOf(target),
    description: target.seo?.description || descOf(target) || '',
    image: target.image ? [target.image] : [],
    sku: target.productCode || String(target.id),
    aggregateRating: reviews.value.length
      ? {
          '@type': 'AggregateRating',
          ratingValue: Number((reviews.value.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.value.length).toFixed(1)),
          reviewCount: reviews.value.length
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: settingsStore.settings.currency || 'AZN',
      price: Number(target.price || 0),
      availability: Number(target.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana səhifə', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Məhsul', item: route.fullPath }
      ]
    }
  })
})

useHead(() => ({
  script: productStructuredData.value
    ? [{ key: 'product-structured-data', type: 'application/ld+json', children: productStructuredData.value }]
    : []
}))

const pdpCopy = computed(() => {
  if (lang.value === 'ru') {
    return {
      backToShop: 'Вернуться в магазин',
      addReview: 'Оставить отзыв',
      lowStock: (count: number) => `Остаток заканчивается — доступно только ${count} шт.`,
      waitlistTitle: 'Лист ожидания / уведомление о наличии',
      waitlistDesc: 'Оставьте email, и мы сообщим, когда товар снова появится в наличии.',
      notifyMe: 'Сообщить мне',
      usageGuide: 'Карточки по использованию',
      packaging: 'Упаковка',
      seller: 'Продавец',
      tags: 'Теги',
      sizeSelect: 'Выберите размер:',
      addWishlist: 'Добавить в избранное',
      share: 'Поделиться',
      shortDescriptionFallback: 'Краткое описание товара.',
      qnaTitle: 'Вопросы и ответы',
      qnaDesc: 'Живые ответы из FAQ помогают быстрее принять решение по доставке, оплате и возврату.',
      etaTitle: 'Проверка ETA доставки',
      etaDesc: 'Укажите город и посмотрите ориентировочный срок доставки по активным способам.',
      etaPlaceholder: 'Например, Баку',
      etaEmpty: 'Введите город, чтобы увидеть доступный срок доставки.',
      etaNoMatch: 'Для этого города отдельный ETA не найден. Будет применён общий способ доставки.',
      etaResult: (name: string, duration: string) => `${name}: ${duration}`,
      reviewFilters: {
        all: 'Все отзывы',
        top: '5 звёзд',
        verified: 'Подтверждённые',
        photos: 'С фото'
      },
      noFilteredReviews: 'По выбранному фильтру отзывов пока нет.',
      policyTitle: 'Доставка и правила',
      policyDelivery: 'Доставка',
      policyReturns: 'Возврат',
      policySupport: 'Поддержка',
      policyDeliveryBody: 'Срок доставки рассчитывается по активным способам и выбранному городу. Точный метод будет подтверждён на checkout.',
      policyReturnsBody: 'Если заказ повреждён или не соответствует описанию, инициируйте возврат из профиля. Запрос уходит в историю заказа.',
      policySupportBody: 'Используйте страницу FAQ и отслеживание заказа для быстрых ответов по оплате, статусу и наличию.',
      bundleBadge: 'Комплекты и наборы',
      bundleTitle: 'Часто покупают вместе',
      bundleDesc: 'Добавьте совместимые товары в корзину одним сценарием.',
      smartBadge: 'Умные рекомендации',
      smartTitle: 'Похожие товары',
      allProducts: 'Смотреть все',
      namePlaceholder: 'Имя',
      emailPlaceholder: 'Email',
      commentPlaceholder: 'Напишите отзыв...',
      rating: 'Рейтинг',
      reviewLabel: 'Отзыв'
    }
  }
  if (lang.value === 'en') {
    return {
      backToShop: 'Back to shop',
      addReview: 'Add review',
      lowStock: (count: number) => `Low stock: only ${count} item(s) left.`,
      waitlistTitle: 'Waitlist / stock alert',
      waitlistDesc: 'Leave your email and we will let you know when this item is back in stock.',
      notifyMe: 'Notify me',
      usageGuide: 'Usage guide cards',
      packaging: 'Packaging',
      seller: 'Seller',
      tags: 'Tags',
      sizeSelect: 'Choose a size:',
      addWishlist: 'Add to wishlist',
      share: 'Share',
      shortDescriptionFallback: 'A short product summary.',
      qnaTitle: 'Q&A',
      qnaDesc: 'Live FAQ answers help buyers decide faster on delivery, payment and return details.',
      etaTitle: 'Delivery ETA check',
      etaDesc: 'Enter a city to preview the expected delivery window from active shipping methods.',
      etaPlaceholder: 'For example, Baku',
      etaEmpty: 'Enter a city to see the estimated delivery window.',
      etaNoMatch: 'No dedicated ETA matched this city. The general shipping method will apply.',
      etaResult: (name: string, duration: string) => `${name}: ${duration}`,
      reviewFilters: {
        all: 'All reviews',
        top: '5 stars',
        verified: 'Verified',
        photos: 'With photos'
      },
      noFilteredReviews: 'No reviews match the current filter yet.',
      policyTitle: 'Delivery and policies',
      policyDelivery: 'Delivery',
      policyReturns: 'Returns',
      policySupport: 'Support',
      policyDeliveryBody: 'Delivery ETA is calculated from active shipping methods and the selected city. The final method is confirmed at checkout.',
      policyReturnsBody: 'If the order arrives damaged or mismatched, start a return request from profile orders. The request is attached to order history.',
      policySupportBody: 'Use the FAQ and order-tracking pages for quick answers about payment, order status and availability.',
      bundleBadge: 'Bundles and sets',
      bundleTitle: 'Frequently bought together',
      bundleDesc: 'Add compatible products to the basket in one flow.',
      smartBadge: 'Smart recommendations',
      smartTitle: 'Similar products',
      allProducts: 'View all',
      namePlaceholder: 'Name',
      emailPlaceholder: 'Email',
      commentPlaceholder: 'Write your review...',
      rating: 'Rating',
      reviewLabel: 'Review'
    }
  }
  return {
    backToShop: 'Mağazaya qayıt',
    addReview: 'Rəy əlavə et',
    lowStock: (count: number) => `Stok azalır — yalnız ${count} ədəd qalıb. Gecikmədən sifariş edin.`,
    waitlistTitle: 'Stok bildirişi siyahısı',
    waitlistDesc: 'Məhsul stokda olduqda sizə email göndərək.',
    notifyMe: 'Mənə xəbər ver',
    usageGuide: 'İstifadə bələdçisi kartları',
    packaging: 'Qablaşdırma',
    seller: 'Satıcı',
    tags: 'Taglar',
    sizeSelect: 'Ölçü seçin:',
    addWishlist: 'Sevimlilərə əlavə et',
    share: 'Paylaş',
    shortDescriptionFallback: 'Məhsul haqqında qısa açıqlama.',
    qnaTitle: 'Sual-cavab',
    qnaDesc: 'FAQ-dan gələn real cavablar çatdırılma, ödəniş və qaytarma qərarını daha sürətli verir.',
    etaTitle: 'Çatdırılma ETA yoxlaması',
    etaDesc: 'Şəhəri daxil edin və aktiv çatdırılma üsullarına görə təxmini müddəti görün.',
    etaPlaceholder: 'Məsələn, Bakı',
    etaEmpty: 'Təxmini çatdırılma müddətini görmək üçün şəhər daxil edin.',
    etaNoMatch: 'Bu şəhər üçün ayrıca ETA tapılmadı. Ümumi çatdırılma üsulu tətbiq olunacaq.',
    etaResult: (name: string, duration: string) => `${name}: ${duration}`,
    reviewFilters: {
      all: 'Bütün rəylər',
      top: '5 ulduz',
      verified: 'Təsdiqlənmiş alış',
      photos: 'Şəkilli rəylər'
    },
    noFilteredReviews: 'Bu filtr üçün hələ rəy yoxdur.',
    policyTitle: 'Çatdırılma və qaydalar',
    policyDelivery: 'Çatdırılma',
    policyReturns: 'Qaytarma',
    policySupport: 'Dəstək',
    policyDeliveryBody: 'Çatdırılma ETA-sı aktiv shipping metodları və seçilmiş şəhərə görə hesablanır. Yekun metod checkout-da təsdiqlənir.',
    policyReturnsBody: 'Sifariş zədəli və ya təsvirə uyğun deyilsə, profil sifarişlərindən qaytarma istəyi yaradın. Sorğu sifariş tarixçəsinə yazılır.',
    policySupportBody: 'Ödəniş, sifariş statusu və stok sualları üçün FAQ və sifariş izləmə səhifələri sürətli cavab verir.',
    bundleBadge: 'Dəst və paket seçimləri',
    bundleTitle: 'Birlikdə alınanlar',
    bundleDesc: 'Uyğun məhsulları bir axında səbətə əlavə edin.',
    smartBadge: 'Ağıllı tövsiyələr',
    smartTitle: 'Oxşar məhsullar',
    allProducts: 'Hamısına bax',
    namePlaceholder: 'Ad',
    emailPlaceholder: 'E-poçt',
    commentPlaceholder: 'Rəy yazın...',
    rating: 'Reyting',
    reviewLabel: 'Rəy'
  }
})

const localizedText = (value: any) => String(value?.[lang.value as 'az' | 'ru' | 'en'] || value?.az || '')

const pdpUxCopy = computed(() => {
  if (lang.value === 'ru') {
    return {
      mediaVideo: 'Видео',
      mediaZoom: 'Увеличить',
      media360: '360 просмотр',
      lifestyle: 'Лайфстайл кадры',
      buyNow: 'Купить сейчас',
      variationSummary: 'Выбранный вариант',
      coupon: 'Купон',
      sellerScore: 'Индекс доверия',
      sellerOrders: 'Успешные заказы',
      sellerProducts: 'Активные товары',
      reviewSummary: 'Сводка отзывов',
      reviewPhotos: 'Фото от покупателей',
      reviewSortNewest: 'Сначала новые',
      reviewSortHighest: 'Высокий рейтинг',
      reviewSortLowest: 'Низкий рейтинг',
      reviewSortVerified: 'Только подтвержденные',
      reviewImageLabel: 'Фото URL-ы (через запятую)',
      bundleTotal: 'Общая сумма',
      addSelectedBundle: 'Добавить выбранные',
      addAllBundle: 'Добавить всё',
      qnaProduct: 'Вопросы по товару',
      helpful: 'полезно',
      specsTitle: 'Премиальные детали',
      shipsFrom: 'Отправка',
      averageResponse: 'Ответ',
      photoEmpty: 'Фото-отзывов пока нет.'
    }
  }
  if (lang.value === 'en') {
    return {
      mediaVideo: 'Video',
      mediaZoom: 'Zoom',
      media360: '360 view',
      lifestyle: 'Lifestyle media',
      buyNow: 'Buy now',
      variationSummary: 'Selected variation',
      coupon: 'Coupon',
      sellerScore: 'Trust score',
      sellerOrders: 'Successful orders',
      sellerProducts: 'Active products',
      reviewSummary: 'Review summary',
      reviewPhotos: 'Customer photo reviews',
      reviewSortNewest: 'Newest first',
      reviewSortHighest: 'Highest rated',
      reviewSortLowest: 'Lowest rated',
      reviewSortVerified: 'Verified only',
      reviewImageLabel: 'Photo URLs (comma separated)',
      bundleTotal: 'Bundle total',
      addSelectedBundle: 'Add selected',
      addAllBundle: 'Add all',
      qnaProduct: 'Product Q&A',
      helpful: 'helpful',
      specsTitle: 'Premium details',
      shipsFrom: 'Ships from',
      averageResponse: 'Response',
      photoEmpty: 'No photo reviews yet.'
    }
  }
  return {
    mediaVideo: 'Video',
    mediaZoom: 'Zoom',
    media360: '360 baxış',
    lifestyle: 'Lifestyle media',
    buyNow: 'İndi al',
    variationSummary: 'Seçilmiş variation',
    coupon: 'Kupon',
    sellerScore: 'Etibar xalı',
    sellerOrders: 'Uğurlu sifariş',
    sellerProducts: 'Aktiv məhsul',
    reviewSummary: 'Rəy xülasəsi',
    reviewPhotos: 'Alıcı fotoları',
    reviewSortNewest: 'Ən yeni',
    reviewSortHighest: 'Yüksək reytinq',
    reviewSortLowest: 'Aşağı reytinq',
    reviewSortVerified: 'Yalnız təsdiqlənmiş',
    reviewImageLabel: 'Foto URL-lər (vergüllə)',
    bundleTotal: 'Bundle toplamı',
    addSelectedBundle: 'Seçilənləri əlavə et',
    addAllBundle: 'Hamısını səbətə at',
    qnaProduct: 'Məhsula aid suallar',
    helpful: 'faydalı',
    specsTitle: 'Premium detallar',
    shipsFrom: 'Göndəriş',
    averageResponse: 'Cavab',
    photoEmpty: 'Hələ şəkilli rəy yoxdur.'
  }
})

const activeInfoBlockIndex = ref<number | null>(null)
const activeInfoModalIndex = ref<number | null>(null)

const infoIcon = (name: string) => {
  const map: Record<string, any> = { Truck, ShieldCheck, CreditCard, BadgeCheck, Sparkles }
  return map[name] || ShieldCheck
}

const normalizedInfoBlocks = computed(() =>
  productInfoBlocks.value.map((block: any, index: number) => ({
    ...block,
    shortDescription: String(block.description || '').slice(0, 80),
    isExpanded: activeInfoBlockIndex.value === index,
    hasDetails: Boolean(
      String(block.detailTitle || '').trim()
      || String(block.detailIntro || '').trim()
      || block.detailRows?.length
      || block.detailCards?.length
      || block.detailNotes?.length
    )
  }))
)

const recommendedProducts = computed(() => {
  if (!product.value) return []
  return productStore.products
    .filter((item) =>
      item.id !== product.value?.id
      && item.status === 'Aktiv'
      && (
        (product.value?.categoryId && item.categoryId === product.value.categoryId)
        || item.brand === product.value?.brand
      )
    )
    .slice(0, 4)
})
const fallbackBundleProducts = computed(() => recommendedProducts.value.slice(0, 2))
const lowStockThreshold = computed(() => Math.max(1, Number(settingsStore.settings.creativeSuite?.lowStockThreshold || 5)))
const effectiveStock = computed(() => getEffectiveProductStock(product.value as any, selectedVariationId.value))
const isLowStock = computed(() => effectiveStock.value > 0 && effectiveStock.value <= lowStockThreshold.value)
const maxPurchaseQty = computed(() => Math.max(1, effectiveStock.value > 0 ? effectiveStock.value : 1))
const usageGuideCards = computed(() =>
  (Array.isArray(settingsStore.settings.productUsageGuide?.cards) && settingsStore.settings.productUsageGuide.cards.length
    ? settingsStore.settings.productUsageGuide.cards
    : [
        { enabled: true, title: 'Size / fit guide', text: 'Məhsul ölçüləri və istifadə forması üçün xüsusiyyət və variasiyaları müqayisə edin.' },
        { enabled: true, title: 'Usage guide', text: 'Məhsulu uzunömürlü istifadə üçün texniki xüsusiyyətlərə uyğun formada istifadə edin.' },
        { enabled: true, title: 'Best pairing', text: 'Bu məhsulu uyğun aksesuar və oxşar məhsulla birlikdə almaq daha yaxşı təcrübə yaradır.' }
      ]
  ).filter((item: any) => item?.enabled !== false)
)

const setInfoBlockHover = (index: number | null) => {
  activeInfoBlockIndex.value = index
}

const activeInfoModal = computed(() => {
  if (activeInfoModalIndex.value === null) return null
  return normalizedInfoBlocks.value[activeInfoModalIndex.value] || null
})

const openInfoModal = (index: number) => {
  if (!normalizedInfoBlocks.value[index]?.hasDetails) return
  activeInfoModalIndex.value = index
}

const closeInfoModal = () => {
  activeInfoModalIndex.value = null
}

const packagingSummary = computed(() => {
  if (selectedVariation.value?.size) {
    return `${selectedVariation.value.size} ${selectedVariation.value.unit || ''}`.trim()
  }
  const firstVariation = product.value.variations?.[0]
  if (firstVariation?.size) {
    return `${firstVariation.size} ${firstVariation.unit || ''}`.trim()
  }
  const attr = product.value.attributes || {}
  const packagingValue = attr.packaging || attr.hecm || attr.həcm || attr.volume || attr.size
  return String(packagingValue || '').trim()
})

const detailAttributes = computed(() => {
  const attrs = product.value.attributes || {}
  return Object.entries(attrs)
    .filter(([, value]) => String(value || '').trim())
    .map(([key, value]) => ({
      label: key,
      value: String(value || '').trim()
    }))
})

const galleryImages = computed(() => {
  const variationImgs = (product.value.variations || []).map(v => String(v.image || '').trim()).filter(Boolean)
  const imgs = [product.value.image, ...(product.value.gallery || []), ...variationImgs].map(s => String(s || '').trim()).filter(Boolean)
  return Array.from(new Set(imgs))
})
const productMedia = computed(() => ({
  videoUrl: String(product.value?.media?.videoUrl || '').trim(),
  videoPoster: String(product.value?.media?.videoPoster || '').trim(),
  lifestyleImages: Array.isArray(product.value?.media?.lifestyleImages)
    ? product.value.media.lifestyleImages.map((item: any) => String(item || '').trim()).filter(Boolean)
    : []
}))
const mediaConfig = computed(() => productExperienceStore.config.media)
const buyBoxConfig = computed(() => productExperienceStore.config.buyBox)
const sellerTrustConfig = computed(() => productExperienceStore.config.sellerTrust)
const reviewConfig = computed(() => productExperienceStore.config.reviews)
const bundleConfig = computed(() => productExperienceStore.config.bundle)
const specsConfig = computed(() => productExperienceStore.config.specs)
const resolvedVideoUrl = computed(() => productMedia.value.videoUrl || mediaConfig.value.demoVideoUrl || '')
const resolvedVideoPoster = computed(() => productMedia.value.videoPoster || mediaConfig.value.demoVideoPoster || galleryImages.value[0] || product.value.image || '')
const videoMediaKey = computed(() => resolvedVideoUrl.value ? `video::${resolvedVideoUrl.value}` : '')
const mediaItems = computed(() => {
  const baseImages = galleryImages.value.map((image) => ({ key: image, type: 'image' as const, src: image, thumb: image }))
  if (mediaConfig.value.enableVideo && resolvedVideoUrl.value) {
    return [
      { key: videoMediaKey.value, type: 'video' as const, src: resolvedVideoUrl.value, thumb: resolvedVideoPoster.value },
      ...baseImages
    ]
  }
  return baseImages
})
const lifestyleMediaItems = computed(() => {
  if (productMedia.value.lifestyleImages.length) {
    return productMedia.value.lifestyleImages.slice(0, 4).map((image) => ({ key: `life::${image}`, type: 'image' as const, src: image, thumb: image }))
  }
  return mediaItems.value.filter((item) => item.type === 'image').slice(1, 3)
})
const sidebarMediaItems = computed(() => {
  const items = [...mediaItems.value]
  if (mediaConfig.value.enableLifestyleStrip) {
    lifestyleMediaItems.value.forEach((item) => {
      if (!items.some((existing) => existing.key === item.key)) items.push(item)
    })
  }
  return items
})
const activeMediaItem = computed(() => sidebarMediaItems.value.find((item) => item.key === activeImage.value) || sidebarMediaItems.value[0] || null)
const bundleProducts = computed(() => bundleItems.value.length ? bundleItems.value : fallbackBundleProducts.value)
const bundleSelection = ref<number[]>([])

const tags = computed(() => {
  const fromArray = Array.isArray(product.value.tags) ? product.value.tags : []
  const fromSeo = String(product.value.seo?.keywords || '').split(',').map(s => s.trim()).filter(Boolean)
  const raw = [...fromArray, ...fromSeo].map(s => String(s || '').trim()).filter(Boolean)
  return Array.from(new Set(raw))
})

const sku = computed(() => {
  return String(product.value.productCode || `PRD-${String(product.value.id || 0).padStart(6, '0')}`)
})

const selectedVariation = computed(() => {
  if (!selectedVariationId.value) return null
  return product.value.variations?.find(v => v.id === selectedVariationId.value)
})

const currentPrice = computed(() => {
  return selectedVariation.value ? selectedVariation.value.price : product.value.price
})

const selectedTotalPrice = computed(() => {
  const safeQty = Math.max(1, Math.min(maxPurchaseQty.value, Math.floor(Number(quantity.value) || 1)))
  return Number(currentPrice.value || 0) * safeQty
})

const showSelectedTotalPrice = computed(() => {
  const safeQty = Math.max(1, Math.min(maxPurchaseQty.value, Math.floor(Number(quantity.value) || 1)))
  return safeQty >= 2
})

const canAddToCart = computed(() => {
  return canAddProductToCart(product.value as any, selectedVariationId.value)
})
const addToCartDisabledReason = computed(() => getCartDisabledReason(product.value as any, selectedVariationId.value))

const reviewCount = computed(() => reviews.value.length)
const productExperienceSections = computed(() => {
  const map = new Map(productExperienceStore.config.sections.map((section) => [section.key, section]))
  return {
    infoBlocks: map.get('infoBlocks'),
    usageGuide: map.get('usageGuide'),
    faq: map.get('faq'),
    bundle: map.get('bundle'),
    recommendations: map.get('recommendations')
  }
})
const utilityCardsConfig = computed(() => productExperienceStore.config.utilityCards)
const showEtaTop = computed(() => utilityCardsConfig.value.eta.enabled && utilityCardsConfig.value.eta.placement === 'top')
const showEtaBottom = computed(() => utilityCardsConfig.value.eta.enabled && utilityCardsConfig.value.eta.placement === 'bottom')
const showPoliciesTop = computed(() => utilityCardsConfig.value.policies.enabled && utilityCardsConfig.value.policies.placement === 'top')
const showPoliciesBottom = computed(() => utilityCardsConfig.value.policies.enabled && utilityCardsConfig.value.policies.placement === 'bottom')
const showPriceAlert = computed(() => shopExperienceStore.config.alertsEnabled && utilityCardsConfig.value.priceAlert.enabled)
const showPriceAlertTop = computed(() => showPriceAlert.value && utilityCardsConfig.value.priceAlert.placement === 'top')
const showPriceAlertBottom = computed(() => showPriceAlert.value && utilityCardsConfig.value.priceAlert.placement === 'bottom')
const reviewAvg = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
  return sum / reviews.value.length
})
const reviewStars = computed(() => Math.max(0, Math.min(5, Math.round(reviewAvg.value))))
const reviewFilterCounts = computed(() => ({
  all: reviews.value.length,
  top: reviews.value.filter((item) => Number(item.rating || 0) === 5).length,
  verified: reviews.value.filter((item) => item.verifiedPurchase).length,
  photos: reviews.value.filter((item: any) => Array.isArray(item.images) && item.images.length).length
}))
const reviewFilterOptions = computed(() => ([
  { key: 'all', label: pdpCopy.value.reviewFilters.all, count: reviewFilterCounts.value.all },
  { key: 'top', label: pdpCopy.value.reviewFilters.top, count: reviewFilterCounts.value.top },
  { key: 'verified', label: pdpCopy.value.reviewFilters.verified, count: reviewFilterCounts.value.verified },
  { key: 'photos', label: pdpCopy.value.reviewFilters.photos, count: reviewFilterCounts.value.photos }
]))
const reviewSortOptions = computed(() => ([
  { key: 'newest', label: pdpUxCopy.value.reviewSortNewest },
  { key: 'highest', label: pdpUxCopy.value.reviewSortHighest },
  { key: 'lowest', label: pdpUxCopy.value.reviewSortLowest },
  { key: 'verified', label: pdpUxCopy.value.reviewSortVerified }
]))
const filteredReviews = computed(() => {
  if (reviewFilter.value === 'top') return reviews.value.filter((item) => Number(item.rating || 0) === 5)
  if (reviewFilter.value === 'verified') return reviews.value.filter((item) => item.verifiedPurchase)
  if (reviewFilter.value === 'photos') return reviews.value.filter((item: any) => Array.isArray(item.images) && item.images.length)
  return reviews.value
})
const sortedReviews = computed(() => {
  const items = [...filteredReviews.value]
  if (reviewSort.value === 'highest') return items.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
  if (reviewSort.value === 'lowest') return items.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0))
  if (reviewSort.value === 'verified') return items.sort((a, b) => Number(Boolean(b.verifiedPurchase)) - Number(Boolean(a.verifiedPurchase)))
  return items.sort((a, b) => new Date(String(b.createdAt || '')).getTime() - new Date(String(a.createdAt || '')).getTime())
})
const reviewBreakdown = computed(() => [5, 4, 3, 2, 1].map((stars) => {
  const count = reviews.value.filter((item) => Number(item.rating || 0) === stars).length
  return {
    stars,
    count,
    percent: reviews.value.length ? Math.round((count / reviews.value.length) * 100) : 0
  }
}))
const photoReviews = computed(() => reviews.value.filter((item: any) => Array.isArray(item.images) && item.images.length))
const publicFaqItems = computed(() => {
  const productQuestions = (productExperienceStore.config.questions || []).filter((item: any) => {
    const ids = Array.isArray(item?.productIds) ? item.productIds.map((value: any) => Number(value)) : []
    return ids.length === 0 || ids.includes(Number(product.value?.id || 0))
  }).slice(0, 4)
  if (productQuestions.length) {
    return productQuestions.map((item: any) => ({
      id: item.id,
      question: localizedText(item.question),
      answer: localizedText(item.answer),
      helpfulCount: Number(item.helpfulCount || 0),
      source: 'product'
    }))
  }
  return faqStore.items.filter((item) => item.status === 'Aktiv').slice(0, 3).map((item: any) => ({
    ...item,
    helpfulCount: 0,
    source: 'faq'
  }))
})
const specCards = computed(() => (productExperienceStore.config.specCards || []).map((item: any) => ({
  ...item,
  titleText: localizedText(item.title),
  descriptionText: localizedText(item.description)
})).filter((item: any) => item.enabled !== false && (item.titleText || item.descriptionText)))
const activeShippingMethods = computed(() => shippingStore.methods.filter((item) => item.status === 'Aktiv'))
const matchedShippingMethod = computed(() => {
  const city = String(deliveryCity.value || '').trim().toLowerCase()
  if (!city) return null
  return activeShippingMethods.value.find((method) => {
    if (!Array.isArray(method.regions) || !method.regions.length) return false
    return method.regions.some((region) => String(region || '').trim().toLowerCase() === city)
  }) || activeShippingMethods.value[0] || null
})
const deliveryEtaMessage = computed(() => {
  if (!deliveryCity.value.trim()) return pdpCopy.value.etaEmpty
  if (!matchedShippingMethod.value) return pdpCopy.value.etaNoMatch
  return pdpCopy.value.etaResult(matchedShippingMethod.value.name, matchedShippingMethod.value.duration)
})
const policyItems = computed(() => ([
  { id: 'delivery', title: pdpCopy.value.policyDelivery, body: pdpCopy.value.policyDeliveryBody },
  { id: 'returns', title: pdpCopy.value.policyReturns, body: pdpCopy.value.policyReturnsBody },
  { id: 'support', title: pdpCopy.value.policySupport, body: pdpCopy.value.policySupportBody }
]))

const fetchReviews = async () => {
  const productId = Number(product.value?.id)
  if (!Number.isFinite(productId) || productId <= 0) return
  reviewsLoading.value = true
  try {
    reviews.value = await $fetch<Review[]>('/api/reviews', { query: { productId } })
  } catch {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

const fetchSellerTrust = async () => {
  const sellerId = Number(product.value?.sellerId || 0)
  if (!sellerId) {
    sellerTrust.value = null
    return
  }
  try {
    sellerTrust.value = await $fetch(`/api/sellers/${sellerId}/trust`)
  } catch {
    sellerTrust.value = null
  }
}

const fetchBundleProducts = async () => {
  const productId = Number(product.value?.id || 0)
  if (!productId) {
    bundleItems.value = []
    return
  }
  try {
    const result = await $fetch<any[]>(`/api/products/${productId}/bundle`)
    bundleItems.value = (Array.isArray(result) ? result : []).map((item: any) => item.product).filter(Boolean)
  } catch {
    bundleItems.value = []
  }
}

const submitReview = async () => {
  const productId = Number(product.value?.id)
  const images = String(reviewForm.value.imageUrls || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
  const payload = {
    productId,
    name: reviewForm.value.name.trim(),
    email: reviewForm.value.email.trim(),
    rating: reviewForm.value.rating,
    comment: reviewForm.value.comment.trim(),
    images
  }
  if (!payload.name) {
    toastStore.error('Ad daxil edin')
    return
  }
  if (!payload.email || !payload.email.includes('@')) {
    toastStore.error('Düzgün e-poçt daxil edin')
    return
  }
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    toastStore.error('Reyting seçin')
    return
  }
  if (!payload.comment) {
    toastStore.error('Rəy yazın')
    return
  }
  if (reviewSubmitting.value) return
  reviewSubmitting.value = true
  try {
    await $fetch('/api/reviews', { method: 'POST', body: payload })
    reviewForm.value.comment = ''
    reviewForm.value.imageUrls = ''
    toastStore.success('Rəy göndərildi')
    await fetchReviews()
  } catch (e: any) {
    const msg = String(e?.data?.statusMessage || e?.statusMessage || e?.message || '')
    toastStore.error(msg || 'Rəy göndərilmədi')
  } finally {
    reviewSubmitting.value = false
  }
}

const featureIcon = (text: string) => {
  const s = String(text || '').toLowerCase()
  if (s.includes('cpu') || s.includes('prosessor')) return Cpu
  if (s.includes('wifi') || s.includes('wi-fi') || s.includes('bluetooth')) return Wifi
  if (s.includes('ekran') || s.includes('display') || s.includes('monitor')) return Monitor
  if (s.includes('ssd') || s.includes('hdd') || s.includes('yaddaş') || s.includes('storage')) return HardDrive
  if (s.includes('batareya') || s.includes('battery')) return Battery
  return ShieldCheck
}

const shortFeatureList = computed(() => {
  if (Array.isArray(product.value.features) && product.value.features.length) {
    return product.value.features.slice(0, 5)
  }
  return String(product.value.description || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)
})

const addToCart = () => {
  if (canAddToCart.value) {
    const safeQuantity = Math.max(1, Math.min(maxPurchaseQty.value, Math.floor(Number(quantity.value) || 1)))
    const itemToAdd = {
      ...product.value,
      price: currentPrice.value,
      variation: selectedVariation.value
    }
    return cartStore.addToCart(itemToAdd, safeQuantity)
  }
  return false
}

const buyNow = async () => {
  const added = addToCart()
  if (!added) return
  await navigateTo('/checkout')
}

const initializeBundleSelection = () => {
  bundleSelection.value = [Number(product.value?.id || 0), ...bundleProducts.value.map((item: any) => Number(item?.id || 0))].filter((value, index, list) => value > 0 && list.indexOf(value) === index)
}

const bundleCards = computed(() => [
  { product: { ...product.value, price: currentPrice.value }, locked: true },
  ...bundleProducts.value.map((item: any) => ({ product: item, locked: false }))
].filter((item) => item.product))

const bundleTotalPrice = computed(() =>
  bundleCards.value
    .filter((item) => item.locked || bundleSelection.value.includes(Number(item.product?.id || 0)))
    .reduce((sum, item) => sum + Number(item.product?.price || 0), 0)
)

const addSelectedBundleToCart = () => {
  bundleCards.value
    .filter((item) => item.locked || bundleSelection.value.includes(Number(item.product?.id || 0)))
    .forEach((item) => {
      cartStore.addToCart(item.product, 1)
    })
}

const toggleBundleItem = (productId: number) => {
  if (!bundleConfig.value.enableSelection) return
  if (bundleSelection.value.includes(productId)) {
    bundleSelection.value = bundleSelection.value.filter((value) => value !== productId)
    return
  }
  bundleSelection.value = [...bundleSelection.value, productId]
}

let media360Timer: ReturnType<typeof setInterval> | null = null
const stopMedia360 = () => {
  media360Playing.value = false
  if (media360Timer) {
    clearInterval(media360Timer)
    media360Timer = null
  }
}
const toggleMedia360 = () => {
  if (media360Playing.value) {
    stopMedia360()
    return
  }
  const images = galleryImages.value
  if (images.length < 2) return
  media360Playing.value = true
  let index = images.findIndex((item) => item === activeImage.value)
  media360Timer = setInterval(() => {
    index = (index + 1) % images.length
    activeImage.value = images[index]
  }, 1200)
}

const specCardIcon = (name: string) => {
  const map: Record<string, any> = { Sparkles, BadgeCheck, ShieldCheck, Truck, CreditCard, Store }
  return map[name] || Sparkles
}

const increaseProductQuantity = () => {
  quantity.value = Math.min(maxPurchaseQty.value, quantity.value + 1)
}

const toggleWishlist = () => {
  wishlistStore.toggleWishlist(product.value as any)
}

const joinWaitlist = async () => {
  const email = String(waitlistEmail.value || authStore.user?.email || '').trim()
  if (!email || !email.includes('@')) {
    toastStore.error('Email ünvanını düzgün daxil edin')
    return
  }
  waitlistSubmitting.value = true
  try {
    const result = await $fetch('/api/waitlist', {
      method: 'POST',
      body: {
        productId: product.value.id,
        email
      }
    })
    waitlistEmail.value = ''
    toastStore.success((result as any)?.alreadyExists ? 'Siz artıq waitlist-ə qoşulmusunuz' : 'Stok gələndə sizə xəbər veriləcək')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Waitlist sorğusu göndərilmədi')
  } finally {
    waitlistSubmitting.value = false
  }
}

const localizedShopAlertText = (value: any) => String(value?.[lang.value as 'az' | 'ru' | 'en'] || value?.az || '').trim()

const submitProductAlert = async () => {
  const email = String(waitlistEmail.value || authStore.user?.email || '').trim()
  if (!email || !email.includes('@')) {
    toastStore.error(String(t('alert_email_label')))
    return
  }
  productAlertSubmitting.value = true
  try {
    const type = effectiveStock.value > 0 ? 'price_drop' : 'restock'
    await $fetch('/api/product-alerts', {
      method: 'POST',
      body: {
        productId: Number(product.value?.id || 0),
        productName: String(nameOf(product.value) || '').trim(),
        email,
        type
      }
    })
    waitlistEmail.value = ''
    toastStore.success(type === 'restock' ? String(t('alert_restock_saved')) : String(t('alert_price_drop_saved')))
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || 'Bildiriş qurulmadı')
  } finally {
    productAlertSubmitting.value = false
  }
}

const shareProduct = async () => {
  const url = process.client ? window.location.href : buildProductHref(product.value || {})
  try {
    if (process.client && navigator.share) {
      await navigator.share({ title: product.value.name, url })
      return
    }
    if (process.client && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      toastStore.success('Link kopyalandı')
    }
  } catch {}
}

const goBack = () => {
  if (process.client && window.history.length > 1) {
    router.back()
    return
  }
  navigateTo('/shop')
}

watch(() => route.params.id, () => {
  stopMedia360()
  quantity.value = 1
  selectedVariationId.value = null
  activeImage.value = ''
  activeInfoTab.value = 'description'
  mobileInfoOpen.value = 'description'
  reviewForm.value.rating = 0
  reviewForm.value.comment = ''
  reviewForm.value.imageUrls = ''
  reviewSort.value = reviewConfig.value.defaultSort
  if (product.value && String(route.params.id) !== String(canonicalProductHref.value.split('/product/')[1])) {
    navigateTo(canonicalProductHref.value, { replace: true })
  }
  fetchReviews()
  fetchSellerTrust()
  fetchBundleProducts().then(() => initializeBundleSelection())
  if (product.value?.id) {
    $fetch(`/api/products/${product.value.id}/view`, { method: 'POST' }).catch(() => {})
  }
})

watch(() => selectedVariation.value, (newVal) => {
  quantity.value = Math.max(1, Math.min(maxPurchaseQty.value, quantity.value))
  if (mediaConfig.value.enableVariationMedia && newVal?.image) {
    stopMedia360()
    activeImage.value = newVal.image
  }
})

watch(bundleProducts, () => {
  initializeBundleSelection()
})

watch(effectiveStock, () => {
  quantity.value = Math.max(1, Math.min(maxPurchaseQty.value, quantity.value))
})

onMounted(async () => {
  reviewSort.value = reviewConfig.value.defaultSort
  if (authStore.user?.name) reviewForm.value.name = authStore.user.name
  if (authStore.user?.email) reviewForm.value.email = authStore.user.email
  if (product.value && String(route.params.id) !== String(canonicalProductHref.value.split('/product/')[1])) {
    navigateTo(canonicalProductHref.value, { replace: true })
  }
  fetchReviews()
  await fetchSellerTrust()
  await fetchBundleProducts()
  initializeBundleSelection()
  try {
    if (product.value?.id) {
      await $fetch(`/api/products/${product.value.id}/view`, { method: 'POST' })
    }
  } catch {}
})
</script>

<template>
  <div :class="['container pt-4 pb-20 sm:py-12 lg:py-12', `product-density-${productDensity}`]">
    <div v-if="product" class="max-w-6xl mx-auto">
      <div class="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-xs font-bold text-gray-400 sm:text-sm">
          <NuxtLink to="/" class="hover:text-blue-600 transition-colors">{{ t('nav_home') }}</NuxtLink>
          <span class="mx-2">/</span>
          <NuxtLink to="/shop" class="hover:text-blue-600 transition-colors">{{ t('nav_shop') }}</NuxtLink>
        </div>
        <button type="button" class="inline-flex w-fit items-center text-sm font-bold text-blue-600 transition-transform hover:-translate-x-1" @click="goBack">
          <ChevronLeft class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          {{ pdpCopy.backToShop }}
        </button>
      </div>
      
      <div class="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-[44%,56%] lg:gap-12">
        <div class="p-0 sm:p-2 lg:bg-transparent lg:p-0">
          <div class="flex flex-col self-start gap-3 md:gap-4 lg:rounded-none lg:bg-transparent lg:p-0">
          <div class="order-1 mx-auto w-full self-start max-w-full p-0 sm:max-w-[380px] sm:p-0 lg:w-[396px] lg:max-w-[396px]">
            <div class="relative flex h-[300px] sm:h-[360px] lg:h-[396px] items-center justify-center overflow-hidden bg-transparent">
              <iframe
                v-if="activeMediaItem?.type === 'video'"
                :src="String(activeMediaItem?.src || '')"
                class="h-full w-full rounded-[1.4rem]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
              <button
                v-else
                type="button"
                class="group flex h-full w-full items-center justify-center px-4 py-4 sm:px-5 sm:py-5"
                @click="mediaConfig.enableZoom ? zoomedMedia = true : undefined"
              >
                <img :src="String(activeMediaItem?.src || activeImage)" :alt="nameOf(product)" class="max-h-[92%] max-w-[90%] object-contain transition-transform duration-500 group-hover:scale-[1.06] sm:max-h-[90%] sm:max-w-[84%] lg:max-h-[86%] lg:max-w-[70%]" />
              </button>
              <div class="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                <div class="flex gap-2">
                  <button v-if="mediaConfig.enableZoom && activeMediaItem?.type === 'image'" type="button" class="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1.5 text-[10px] font-extrabold text-gray-700 sm:px-3 sm:text-[11px]" @click="zoomedMedia = true">
                    <ZoomIn class="h-3.5 w-3.5" /> {{ pdpUxCopy.mediaZoom }}
                  </button>
                  <button v-if="mediaConfig.enable360 && galleryImages.length > 1" type="button" class="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1.5 text-[10px] font-extrabold text-gray-700 sm:px-3 sm:text-[11px]" @click="toggleMedia360">
                    <RotateCw class="h-3.5 w-3.5" :class="media360Playing ? 'animate-spin' : ''" /> {{ pdpUxCopy.media360 }}
                  </button>
                </div>
                <span v-if="activeMediaItem?.type === 'video'" class="inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1.5 text-[10px] font-extrabold text-white sm:px-3 sm:text-[11px]">
                  <PlayCircle class="h-3.5 w-3.5" /> {{ pdpUxCopy.mediaVideo }}
                </span>
              </div>
            </div>
          </div>

          <div class="order-2 w-full" v-if="sidebarMediaItems.length > 1">
            <div class="mx-auto w-full max-w-[420px] p-0 sm:max-w-[460px] lg:max-w-[396px] lg:bg-transparent lg:p-0">
              <div class="flex w-full gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory">
            <button
              v-for="item in sidebarMediaItems"
              :key="item.key"
              type="button"
              @click="stopMedia360(); activeImage = item.key"
              :class="['relative h-[74px] w-[74px] flex-shrink-0 snap-start overflow-hidden rounded-[1.15rem] bg-transparent p-2 transition-all sm:h-[82px] sm:w-[82px] lg:h-[84px] lg:w-[84px]', activeImage === item.key ? 'opacity-100 scale-[1.02]' : 'opacity-70 hover:opacity-100']"
            >
              <img :src="item.thumb" class="w-full h-full object-contain" />
              <span v-if="item.type === 'video'" class="absolute inset-x-0 bottom-1 mx-auto inline-flex w-fit items-center rounded-full bg-black/75 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                <PlayCircle class="mr-1 h-3 w-3" /> {{ pdpUxCopy.mediaVideo }}
              </span>
            </button>
          </div>
          </div>
          </div>

        </div>
        </div>
        
        <div class="space-y-4 rounded-xl bg-white p-4 sm:space-y-5 sm:p-5 lg:rounded-none lg:bg-transparent lg:p-0">
          <h1 class="text-[18px] font-extrabold leading-[1.15] text-[color:var(--color-primary,#2B3E95)] sm:text-[28px] lg:text-[36px]">{{ nameOf(product) }}</h1>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 sm:text-sm">
            <div class="flex items-center gap-1.5">
              <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= reviewStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
            </div>
            <span class="font-bold">{{ reviewCount ? `(${reviewCount} ${reviewCount === 1 ? t('review') : t('reviews')})` : `(0 ${t('reviews')})` }}</span>
            <button type="button" class="font-medium hover:text-blue-600 transition-colors" @click="activeInfoTab = 'reviews'; mobileInfoOpen = 'reviews'">{{ pdpCopy.addReview }}</button>
          </div>

          <div class="rounded-lg bg-[#F8FAFC] px-4 py-4 sm:bg-transparent sm:p-0">
            <div class="text-[30px] font-extrabold text-gray-900 sm:text-[34px] lg:text-[38px]">{{ formatMoney(currentPrice) }}</div>
            <div v-if="product.oldPrice" class="mt-1 text-base font-bold text-gray-400 line-through sm:-mt-1 sm:text-lg">{{ formatMoney(product.oldPrice) }}</div>
            <div class="mt-3 flex items-center gap-3 text-sm">
              <span class="font-bold text-gray-700">{{ t('availability' as any) }}:</span>
              <span v-if="effectiveStock > 0" class="font-bold text-sky-600">{{ t('in_stock' as any) }}</span>
              <span v-else class="font-bold text-red-600">{{ t('out_of_stock' as any) }}</span>
            </div>
          </div>

          <div v-if="buyBoxConfig.enableInstallments || buyBoxConfig.enableCoupon" class="grid gap-3 sm:grid-cols-2">
            <div v-if="buyBoxConfig.enableInstallments" class="rounded-lg border border-violet-100 bg-violet-50 px-4 py-3">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet-700">{{ localizedText(buyBoxConfig.installmentLabel) }}</div>
              <div class="mt-1 text-sm font-bold text-gray-800">{{ formatMoney(currentPrice / Math.max(2, Number(buyBoxConfig.installmentMonths || 3))) }} x {{ buyBoxConfig.installmentMonths }}</div>
            </div>
            <div v-if="buyBoxConfig.enableCoupon" class="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700">{{ pdpUxCopy.coupon }}</div>
              <div class="mt-1 text-sm font-bold text-gray-800">{{ buyBoxConfig.couponCode }} · {{ localizedText(buyBoxConfig.couponLabel) }}</div>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-5">
            <ul v-if="shortFeatureList.length" class="space-y-3 text-sm text-gray-600 font-medium">
              <li v-for="f in shortFeatureList" :key="f" class="flex items-start">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 mr-3 flex-shrink-0"></span>
                <span class="leading-relaxed">{{ f }}</span>
              </li>
            </ul>
          </div>

          <div class="border border-gray-100 bg-[#F8FAFC] p-3 sm:p-0 sm:border-0 sm:bg-transparent">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="flex h-12 w-full items-center overflow-hidden border border-gray-200 bg-white sm:w-[148px]">
                <button @click="quantity > 1 && quantity--" class="flex h-12 w-12 items-center justify-center border-r border-gray-200 transition-colors hover:text-blue-600"><Minus class="w-4 h-4" /></button>
                <span class="flex-1 text-center font-extrabold text-base">{{ quantity }}</span>
                <button :disabled="quantity >= maxPurchaseQty || !canAddToCart" @click="increaseProductQuantity" class="flex h-12 w-12 items-center justify-center border-l border-gray-200 transition-colors hover:text-blue-600 disabled:opacity-40"><Plus class="w-4 h-4" /></button>
              </div>
              <div v-if="showSelectedTotalPrice" class="flex h-12 items-center justify-between border border-gray-200 bg-white px-4 text-sm sm:w-[190px]">
                <span class="font-bold text-gray-500">Məbləğ</span>
                <span class="font-extrabold text-gray-900">{{ formatMoney(selectedTotalPrice) }}</span>
              </div>
              <div class="grid w-full flex-1 gap-3">
                <button
                  @click="addToCart"
                  :disabled="!canAddToCart"
                  :class="['inline-flex h-[48px] w-full max-w-full items-center justify-center rounded-lg font-extrabold text-sm tracking-wide transition-all duration-300 sm:w-[170px]',
                    canAddToCart ? 'bg-[#FACC15] text-gray-900 shadow-[0_12px_30px_-18px_rgba(250,204,21,0.9)] hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-95 active:translate-y-0 active:scale-[0.99]' : 'bg-gray-200 text-gray-400 cursor-not-allowed']"
                >
                  {{ canAddToCart ? t('add_to_cart' as any) : addToCartDisabledReason }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="isLowStock" class="rounded-lg border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
            {{ pdpCopy.lowStock(effectiveStock) }}
          </div>
          <div v-if="effectiveStock <= 0 && settingsStore.settings.creativeSuite?.waitlistEnabled" class="rounded-lg border border-blue-100 bg-blue-50 px-5 py-5">
            <div class="text-sm font-extrabold text-gray-900">{{ pdpCopy.waitlistTitle }}</div>
            <div class="mt-1 text-sm font-medium text-gray-500">{{ pdpCopy.waitlistDesc }}</div>
            <div class="mt-4 flex flex-col sm:flex-row gap-3">
              <input v-model="waitlistEmail" type="email" :placeholder="t('alert_email_label')" class="flex-1 rounded-lg border border-blue-100 bg-white px-5 py-3.5 text-sm font-medium outline-none focus:border-blue-600" />
              <button type="button" class="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="waitlistSubmitting" @click="joinWaitlist">
                {{ waitlistSubmitting ? t('sending') : pdpCopy.notifyMe }}
              </button>
            </div>
          </div>
          <div v-if="showEtaTop || showPoliciesTop || showPriceAlertTop" class="space-y-4">
            <div v-if="showEtaTop || showPoliciesTop" class="grid gap-4 lg:grid-cols-2">
              <div v-if="showEtaTop" class="rounded-lg border border-gray-100 bg-gray-50 px-5 py-5">
                <div class="text-sm font-extrabold text-gray-900">{{ pdpCopy.etaTitle }}</div>
                <div class="mt-1 text-sm font-medium text-gray-500">{{ pdpCopy.etaDesc }}</div>
                <div class="mt-4 flex flex-col gap-3">
                  <input v-model="deliveryCity" type="text" :placeholder="pdpCopy.etaPlaceholder" class="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                  <div class="rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-blue-700">{{ deliveryEtaMessage }}</div>
                </div>
              </div>
              <div v-if="showPoliciesTop" class="rounded-lg border border-gray-100 bg-gray-50 px-5 py-5">
                <div class="text-sm font-extrabold text-gray-900">{{ pdpCopy.policyTitle }}</div>
                <div class="mt-4 space-y-3">
                  <button v-for="policy in policyItems" :key="policy.id" type="button" class="w-full rounded-lg border border-white bg-white px-4 py-4 text-left" @click="activePolicyId = policy.id as any">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-sm font-extrabold text-gray-900">{{ policy.title }}</span>
                      <ChevronDown class="h-4 w-4 text-gray-400" :class="activePolicyId === policy.id ? 'rotate-180' : ''" />
                    </div>
                    <div v-if="activePolicyId === policy.id" class="mt-3 text-sm font-medium leading-6 text-gray-600">{{ policy.body }}</div>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="showPriceAlertTop" class="rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-5">
              <div class="text-sm font-extrabold text-gray-900">{{ localizedShopAlertText(shopExperienceStore.config.alertTitle) }}</div>
              <div class="mt-1 text-sm font-medium text-gray-500">{{ localizedShopAlertText(shopExperienceStore.config.alertDescription) }}</div>
              <div class="mt-4 flex flex-col sm:flex-row gap-3">
                <input v-model="waitlistEmail" type="email" :placeholder="t('alert_email_label')" class="flex-1 rounded-lg border border-emerald-100 bg-white px-5 py-3.5 text-sm font-medium outline-none focus:border-emerald-600" />
                <button type="button" class="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60" :disabled="productAlertSubmitting" @click="submitProductAlert">
                  {{ productAlertSubmitting ? t('sending') : (effectiveStock > 0 ? t('notify_price_drop') : t('notify_restock')) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Variations Selection -->
          <div v-if="product.variations && product.variations.length > 0" class="space-y-3">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{{ pdpCopy.sizeSelect }}</label>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="v in product.variations" 
                :key="v.id"
                @click="selectedVariationId = v.id"
                :class="['px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all', Number(v.stock || 0) <= 0 ? 'border-red-200 bg-red-50 text-red-500' : selectedVariationId === v.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-500 hover:border-blue-200']"
              >
                {{ v.size }} {{ v.unit }}<span v-if="Number(v.stock || 0) <= 0"> - bitib</span>
              </button>
            </div>
            <div v-if="buyBoxConfig.enableVariationSummary && selectedVariation" class="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              {{ pdpUxCopy.variationSummary }}: {{ selectedVariation.size }} {{ selectedVariation.unit || '' }} · {{ formatMoney(currentPrice) }} · {{ effectiveStock > 0 ? `${effectiveStock} ${t('in_stock' as any)}` : t('out_of_stock' as any) }}
            </div>
          </div>
          
          <div v-if="showEtaBottom || showPoliciesBottom || showPriceAlertBottom" class="space-y-4">
            <div v-if="showEtaBottom || showPoliciesBottom" class="grid gap-4 lg:grid-cols-2">
              <div v-if="showEtaBottom" class="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
                <div class="text-sm font-extrabold text-gray-900">{{ pdpCopy.etaTitle }}</div>
                <div class="mt-1 text-sm font-medium text-gray-500">{{ pdpCopy.etaDesc }}</div>
                <div class="mt-4 flex flex-col gap-3">
                  <input v-model="deliveryCity" type="text" :placeholder="pdpCopy.etaPlaceholder" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                  <div class="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-blue-700">{{ deliveryEtaMessage }}</div>
                </div>
              </div>
              <div v-if="showPoliciesBottom" class="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
                <div class="text-sm font-extrabold text-gray-900">{{ pdpCopy.policyTitle }}</div>
                <div class="mt-4 space-y-3">
                  <button v-for="policy in policyItems" :key="policy.id" type="button" class="w-full rounded-2xl border border-white bg-white px-4 py-4 text-left" @click="activePolicyId = policy.id as any">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-sm font-extrabold text-gray-900">{{ policy.title }}</span>
                      <ChevronDown class="h-4 w-4 text-gray-400" :class="activePolicyId === policy.id ? 'rotate-180' : ''" />
                    </div>
                    <div v-if="activePolicyId === policy.id" class="mt-3 text-sm font-medium leading-6 text-gray-600">{{ policy.body }}</div>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="showPriceAlertBottom" class="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-5">
              <div class="text-sm font-extrabold text-gray-900">{{ localizedShopAlertText(shopExperienceStore.config.alertTitle) }}</div>
              <div class="mt-1 text-sm font-medium text-gray-500">{{ localizedShopAlertText(shopExperienceStore.config.alertDescription) }}</div>
              <div class="mt-4 flex flex-col sm:flex-row gap-3">
                <input v-model="waitlistEmail" type="email" :placeholder="t('alert_email_label')" class="flex-1 rounded-2xl border border-emerald-100 bg-white px-5 py-3.5 text-sm font-medium outline-none focus:border-emerald-600" />
                <button type="button" class="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60" :disabled="productAlertSubmitting" @click="submitProductAlert">
                  {{ productAlertSubmitting ? t('sending') : (effectiveStock > 0 ? t('notify_price_drop') : t('notify_restock')) }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-5 pt-1 text-sm font-medium text-gray-500 border-b border-gray-200 pb-4">
            <div class="flex flex-wrap items-center gap-6">
            <button type="button" class="flex items-center gap-2 hover:text-blue-600 transition-colors" @click="toggleWishlist">
              <Heart class="w-4 h-4" :class="{ 'fill-current text-red-600': wishlistStore.isInWishlist(product.id) }" />
              <span>{{ pdpCopy.addWishlist }}</span>
            </button>
            </div>
            <button type="button" class="flex items-center gap-2 hover:text-blue-600 transition-colors" @click="shareProduct">
              <Share2 class="w-4 h-4" />
              <span>{{ pdpCopy.share }}</span>
            </button>
          </div>

          <div v-if="productExperienceSections.infoBlocks?.enabled !== false && normalizedInfoBlocks.length" class="pt-6 border-t border-gray-100">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <button v-for="(b, idx) in normalizedInfoBlocks" :key="idx" type="button" :class="['group flex w-full text-left gap-4 rounded-[1.5rem] px-3 py-3 transition-all', b.hasDetails ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default']" @mouseenter="setInfoBlockHover(idx)" @mouseleave="setInfoBlockHover(null)" @click="openInfoModal(idx)">
                <div class="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img v-if="b.image" :src="b.image" :alt="b.title" class="w-full h-full object-contain" />
                  <component v-else :is="infoIcon(b.icon)" class="w-6 h-6 text-gray-700" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 text-sm font-extrabold text-gray-900 leading-tight">
                    <span>{{ b.title }}</span>
                    <ArrowRight v-if="b.hasDetails" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div v-if="b.description" :class="['text-xs text-gray-500 font-medium leading-relaxed mt-1 transition-all overflow-hidden', b.isExpanded ? 'max-h-32' : 'max-h-10']">
                    {{ b.isExpanded ? b.description : b.shortDescription }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div v-if="sellerTrustConfig.enabled && sellerTrust" class="pt-6 border-t border-gray-100">
            <div class="rounded-[1.75rem] border border-sky-100 bg-sky-50/70 p-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-sky-700">{{ localizedText(sellerTrustConfig.badge) }}</div>
              <div class="mt-2 text-lg font-extrabold text-gray-900">{{ localizedText(sellerTrustConfig.title) }}</div>
              <div class="mt-1 text-sm font-medium text-gray-500">{{ localizedText(sellerTrustConfig.subtitle) }}</div>
              <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-2xl border border-white bg-white px-4 py-4">
                  <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ pdpUxCopy.sellerScore }}</div>
                  <div class="mt-1 text-2xl font-extrabold text-gray-900">{{ sellerTrust.score }}</div>
                </div>
                <div class="rounded-2xl border border-white bg-white px-4 py-4">
                  <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ pdpUxCopy.sellerOrders }}</div>
                  <div class="mt-1 text-2xl font-extrabold text-gray-900">{{ sellerTrust.orderCount }}</div>
                </div>
                <div class="rounded-2xl border border-white bg-white px-4 py-4">
                  <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ pdpUxCopy.sellerProducts }}</div>
                  <div class="mt-1 text-2xl font-extrabold text-gray-900">{{ sellerTrust.productCount }}</div>
                </div>
                <div class="rounded-2xl border border-white bg-white px-4 py-4">
                  <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ pdpCopy.rating }}</div>
                  <div class="mt-1 text-2xl font-extrabold text-gray-900">{{ sellerTrust.ratingAvg || '0.0' }}</div>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-3 text-sm font-bold text-gray-600">
                <span class="inline-flex items-center gap-2 rounded-full border border-white bg-white px-4 py-2">
                  <BadgeCheck class="h-4 w-4 text-emerald-600" />
                  {{ sellerTrust.verifiedStatus }}
                </span>
                <span class="inline-flex items-center gap-2 rounded-full border border-white bg-white px-4 py-2">
                  <Truck class="h-4 w-4 text-sky-600" />
                  {{ localizedText(sellerTrustConfig.originLabel) }}
                </span>
                <span class="inline-flex items-center gap-2 rounded-full border border-white bg-white px-4 py-2">
                  <Sparkles class="h-4 w-4 text-violet-600" />
                  {{ localizedText(sellerTrustConfig.responseTime) }}
                </span>
                <NuxtLink :to="`/sellers/${product.sellerId}`" class="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sky-700 hover:border-sky-300">
                  <Store class="h-4 w-4" />
                  {{ sellerTrust.shopName || product.sellerShopName || product.sellerName }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100 text-sm font-bold text-gray-600 space-y-2">
            <div class="flex gap-3">
              <span class="w-24 text-gray-400">Məhsulun kodu:</span>
              <span>{{ sku }}</span>
            </div>
            <div v-if="product.sellerId" class="flex gap-3">
              <span class="w-24 text-gray-400">{{ pdpCopy.seller }}:</span>
              <NuxtLink :to="`/sellers/${product.sellerId}`" class="text-blue-600 hover:underline">
                {{ product.sellerShopName || product.sellerName || 'Satıcı mağazası' }}
              </NuxtLink>
            </div>
            <div class="flex gap-3">
              <span class="w-24 text-gray-400">{{ t('category') }}:</span>
              <span>{{ product.category }}</span>
            </div>
            <div v-if="packagingSummary" class="flex gap-3">
              <span class="w-24 text-gray-400">{{ pdpCopy.packaging }}:</span>
              <span>{{ packagingSummary }}</span>
            </div>
            <div v-for="attr in detailAttributes" :key="attr.label" class="flex gap-3">
              <span class="w-24 text-gray-400">{{ attr.label }}:</span>
              <span>{{ attr.value }}</span>
            </div>
            <div v-if="tags.length" class="flex gap-3">
              <span class="w-24 text-gray-400">{{ pdpCopy.tags }}:</span>
              <span class="flex flex-wrap gap-x-2 gap-y-1">
                <span v-for="t in tags" :key="t" class="text-gray-600">{{ t }}</span>
              </span>
            </div>
          </div>
          <div v-if="specsConfig.enabled && specCards.length" class="pt-6 border-t border-gray-100">
            <div class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-600">{{ localizedText(specsConfig.badge) }}</div>
            <div class="mt-2 text-lg font-extrabold text-gray-900">{{ localizedText(specsConfig.title) || pdpUxCopy.specsTitle }}</div>
            <div v-if="localizedText(specsConfig.subtitle)" class="mt-1 text-sm font-medium text-gray-500">{{ localizedText(specsConfig.subtitle) }}</div>
            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <div v-for="card in specCards" :key="card.id" class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <component :is="specCardIcon(card.icon)" class="h-5 w-5 text-blue-600" />
                <div class="mt-3 text-sm font-extrabold text-gray-900">{{ card.titleText }}</div>
                <div class="mt-2 text-sm font-medium leading-6 text-gray-600">{{ card.descriptionText }}</div>
              </div>
            </div>
          </div>
          <div v-if="productExperienceSections.usageGuide?.enabled !== false && settingsStore.settings.productUsageGuide?.enabled !== false && usageGuideCards.length" class="pt-6 border-t border-gray-100">
            <div class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-600">{{ productExperienceSections.usageGuide?.badge?.[lang] || pdpCopy.usageGuide }}</div>
            <div class="mt-2 text-sm font-extrabold text-gray-900">{{ productExperienceSections.usageGuide?.title?.[lang] || pdpCopy.usageGuide }}</div>
            <div v-if="productExperienceSections.usageGuide?.subtitle?.[lang]" class="mt-1 text-xs font-medium text-gray-500">{{ productExperienceSections.usageGuide?.subtitle?.[lang] }}</div>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div v-for="card in usageGuideCards" :key="card.title" class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div class="text-sm font-extrabold text-gray-900">{{ card.title }}</div>
                <div class="mt-2 text-xs font-medium text-gray-500">{{ card.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10 sm:mt-16 border-t border-gray-100 pt-8 sm:pt-10">
        <div class="hidden md:flex items-center gap-10 border-b border-gray-100 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            @click="activeInfoTab = 'description'"
            :class="['pb-4 text-sm font-extrabold tracking-tight border-b-2 transition-colors', activeInfoTab === 'description' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600']"
          >
            {{ t('tab_description' as any) }}
          </button>
          <button
            type="button"
            @click="activeInfoTab = 'additional'"
            :class="['pb-4 text-sm font-extrabold tracking-tight border-b-2 transition-colors', activeInfoTab === 'additional' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600']"
          >
            {{ t('tab_additional' as any) }}
          </button>
          <button
            type="button"
            @click="activeInfoTab = 'reviews'"
            :class="['pb-4 text-sm font-extrabold tracking-tight border-b-2 transition-colors', activeInfoTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600']"
          >
            {{ t('tab_reviews' as any) }} ({{ reviewCount }})
          </button>
        </div>

        <div class="py-6 sm:py-10">
          <div class="md:hidden space-y-3">
            <button type="button" class="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-extrabold text-gray-900" @click="mobileInfoOpen = mobileInfoOpen === 'description' ? null : 'description'">
              <span>{{ t('tab_description' as any) }}</span>
              <ChevronDown class="w-5 h-5 text-gray-500" :class="mobileInfoOpen === 'description' ? 'rotate-180' : ''" />
            </button>
            <div v-show="mobileInfoOpen === 'description'" class="px-5 py-4 border border-gray-100 rounded-2xl bg-white">
              <p class="text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                {{ descOf(product) || product.seo?.description || pdpCopy.shortDescriptionFallback }}
              </p>
            </div>

            <button type="button" class="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-extrabold text-gray-900" @click="mobileInfoOpen = mobileInfoOpen === 'additional' ? null : 'additional'">
              <span>{{ t('tab_additional' as any) }}</span>
              <ChevronDown class="w-5 h-5 text-gray-500" :class="mobileInfoOpen === 'additional' ? 'rotate-180' : ''" />
            </button>
            <div v-show="mobileInfoOpen === 'additional'" class="px-5 py-4 border border-gray-100 rounded-2xl bg-white space-y-3 text-sm font-bold text-gray-700">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">{{ t('category') }}</span>
                <span>{{ product.category }}</span>
              </div>
              <div v-if="packagingSummary" class="flex items-center justify-between">
                <span class="text-gray-400">{{ pdpCopy.packaging }}</span>
                <span>{{ packagingSummary }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Məhsulun kodu</span>
                <span>{{ sku }}</span>
              </div>
              <div v-for="attr in detailAttributes" :key="attr.label" class="flex items-center justify-between gap-4">
                <span class="text-gray-400">{{ attr.label }}</span>
                <span class="text-right">{{ attr.value }}</span>
              </div>
            </div>

            <button type="button" class="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-extrabold text-gray-900" @click="mobileInfoOpen = mobileInfoOpen === 'reviews' ? null : 'reviews'">
              <span>{{ t('tab_reviews' as any) }} ({{ reviewCount }})</span>
              <ChevronDown class="w-5 h-5 text-gray-500" :class="mobileInfoOpen === 'reviews' ? 'rotate-180' : ''" />
            </button>
            <div v-show="mobileInfoOpen === 'reviews'" class="px-5 py-4 border border-gray-100 rounded-2xl bg-white space-y-4">
              <div v-if="reviewConfig.showSummary" class="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">{{ pdpUxCopy.reviewSummary }}</div>
                <div class="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <div class="text-3xl font-extrabold text-gray-900">{{ reviewAvg.toFixed(1) }}</div>
                    <div class="mt-1 flex items-center gap-1">
                      <Star v-for="i in 5" :key="`mobile-summary-${i}`" class="h-4 w-4" :class="i <= reviewStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
                    </div>
                  </div>
                  <div class="text-sm font-bold text-gray-500">{{ reviewCount }} {{ t('reviews') }}</div>
                </div>
                <div v-if="reviewConfig.showBreakdown" class="mt-4 space-y-2">
                  <div v-for="item in reviewBreakdown" :key="`mobile-breakdown-${item.stars}`" class="flex items-center gap-3 text-xs font-bold text-gray-600">
                    <span class="w-10">{{ item.stars }}★</span>
                    <div class="h-2 flex-1 rounded-full bg-white">
                      <div class="h-2 rounded-full bg-blue-600" :style="{ width: `${item.percent}%` }"></div>
                    </div>
                    <span class="w-10 text-right">{{ item.count }}</span>
                  </div>
                </div>
              </div>
              <div v-if="reviewConfig.showPhotoRail" class="space-y-3">
                <div class="text-sm font-extrabold text-gray-900">{{ pdpUxCopy.reviewPhotos }}</div>
                <div v-if="photoReviews.length" class="grid grid-cols-3 gap-2">
                  <img v-for="image in photoReviews.flatMap((item: any) => item.images || []).slice(0, 6)" :key="`mobile-photo-${image}`" :src="image" class="h-20 w-full rounded-2xl object-cover" />
                </div>
                <div v-else class="text-xs font-bold text-gray-400">{{ pdpUxCopy.photoEmpty }}</div>
              </div>
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                <div class="space-y-2">
                  <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ pdpCopy.rating }}</div>
                  <div class="flex items-center gap-1">
                    <button v-for="i in 5" :key="i" type="button" class="p-1" @click="reviewForm.rating = i">
                      <Star class="w-5 h-5" :class="i <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-3">
                  <input v-model="reviewForm.name" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:border-blue-600 outline-none transition-all" :placeholder="pdpCopy.namePlaceholder" />
                  <input v-model="reviewForm.email" type="email" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:border-blue-600 outline-none transition-all" :placeholder="pdpCopy.emailPlaceholder" />
                  <textarea v-model="reviewForm.comment" rows="4" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 focus:border-blue-600 outline-none transition-all resize-none" :placeholder="pdpCopy.commentPlaceholder"></textarea>
                  <input v-model="reviewForm.imageUrls" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 focus:border-blue-600 outline-none transition-all" :placeholder="pdpUxCopy.reviewImageLabel" />
                  <button type="button" class="w-full bg-blue-600 text-white py-3 rounded-2xl font-extrabold shadow-lg shadow-blue-100 disabled:opacity-60 disabled:cursor-not-allowed" :disabled="reviewSubmitting" @click="submitReview">
                    {{ reviewSubmitting ? t('sending') : t('review_submit') }}
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button v-for="option in reviewFilterOptions" :key="`mobile-${option.key}`" type="button" :class="['rounded-full px-3 py-2 text-xs font-extrabold transition-all', reviewFilter === option.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600']" @click="reviewFilter = option.key as any">
                  {{ option.label }} ({{ option.count }})
                </button>
              </div>
              <select v-if="reviewConfig.showSort" v-model="reviewSort" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-blue-600">
                <option v-for="option in reviewSortOptions" :key="`mobile-sort-${option.key}`" :value="option.key">{{ option.label }}</option>
              </select>
              <div v-if="reviewsLoading" class="text-sm font-bold text-gray-400">{{ t('loading') }}</div>
              <div v-else-if="reviews.length === 0" class="text-sm font-bold text-gray-400">{{ t('no_reviews_yet') }}</div>
              <div v-else-if="sortedReviews.length === 0" class="text-sm font-bold text-gray-400">{{ pdpCopy.noFilteredReviews }}</div>
              <div v-else class="space-y-3">
                <div v-for="r in sortedReviews" :key="r.id" class="border border-gray-100 rounded-2xl p-5">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-extrabold text-gray-900 truncate">{{ r.name }}</div>
                      <div v-if="r.verifiedPurchase" class="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">{{ t('verified_purchase') }}</div>
                    </div>
                    <div class="flex items-center">
                      <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
                    </div>
                  </div>
                  <div class="text-[11px] font-bold text-gray-400 mt-1">{{ String(r.createdAt || '').split('T')[0] }}</div>
                  <p class="text-gray-600 font-medium leading-relaxed mt-3 whitespace-pre-line">{{ r.comment }}</p>
                  <div v-if="Array.isArray(r.images) && r.images.length" class="mt-3 grid grid-cols-3 gap-2">
                    <img v-for="image in r.images" :key="`${r.id}-${image}`" :src="image" class="h-20 w-full rounded-2xl object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeInfoTab === 'description'" class="hidden md:block space-y-6">
            <p class="text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                {{ descOf(product) || product.seo?.description || pdpCopy.shortDescriptionFallback }}
            </p>
          </div>

          <div v-else-if="activeInfoTab === 'additional'" class="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-bold text-gray-700">
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
              <span class="text-gray-400">{{ t('category') }}</span>
              <span>{{ product.category }}</span>
            </div>
            <div v-if="packagingSummary" class="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                <span class="text-gray-400">{{ pdpCopy.packaging }}</span>
              <span>{{ packagingSummary }}</span>
            </div>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
              <span class="text-gray-400">Məhsulun kodu</span>
              <span>{{ sku }}</span>
            </div>
            <div v-for="attr in detailAttributes" :key="attr.label" class="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between gap-6">
              <span class="text-gray-400">{{ attr.label }}</span>
              <span class="text-right">{{ attr.value }}</span>
            </div>
          </div>

          <div v-else class="hidden md:block space-y-8">
            <div v-if="reviewConfig.showSummary" class="grid gap-5 xl:grid-cols-[0.85fr,1.15fr]">
              <div class="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">{{ pdpUxCopy.reviewSummary }}</div>
                <div class="mt-3 text-4xl font-extrabold text-gray-900">{{ reviewAvg.toFixed(1) }}</div>
                <div class="mt-2 flex items-center gap-1">
                  <Star v-for="i in 5" :key="`desktop-summary-${i}`" class="h-5 w-5" :class="i <= reviewStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
                </div>
                <div class="mt-2 text-sm font-bold text-gray-500">{{ reviewCount }} {{ t('reviews') }}</div>
              </div>
              <div v-if="reviewConfig.showBreakdown" class="rounded-[2rem] border border-gray-100 bg-white p-6 space-y-3">
                <div v-for="item in reviewBreakdown" :key="`desktop-breakdown-${item.stars}`" class="flex items-center gap-4 text-sm font-bold text-gray-600">
                  <span class="w-12">{{ item.stars }}★</span>
                  <div class="h-2.5 flex-1 rounded-full bg-gray-100">
                    <div class="h-2.5 rounded-full bg-blue-600" :style="{ width: `${item.percent}%` }"></div>
                  </div>
                  <span class="w-12 text-right">{{ item.count }}</span>
                </div>
              </div>
            </div>
            <div v-if="reviewConfig.showPhotoRail" class="rounded-[2rem] border border-gray-100 bg-white p-6">
              <div class="text-sm font-extrabold text-gray-900">{{ pdpUxCopy.reviewPhotos }}</div>
              <div v-if="photoReviews.length" class="mt-4 grid grid-cols-6 gap-3">
                <img v-for="image in photoReviews.flatMap((item: any) => item.images || []).slice(0, 6)" :key="`desktop-photo-${image}`" :src="image" class="h-24 w-full rounded-2xl object-cover" />
              </div>
              <div v-else class="mt-3 text-sm font-bold text-gray-400">{{ pdpUxCopy.photoEmpty }}</div>
            </div>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="grid grid-cols-12 gap-6">
                <div class="col-span-6 space-y-2">
                  <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ pdpCopy.namePlaceholder }}</div>
                  <input v-model="reviewForm.name" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:border-blue-600 outline-none transition-all" />
                </div>
                <div class="col-span-6 space-y-2">
                  <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ pdpCopy.emailPlaceholder }}</div>
                  <input v-model="reviewForm.email" type="email" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:border-blue-600 outline-none transition-all" />
                </div>
                <div class="col-span-12 space-y-2">
                  <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ pdpCopy.rating }}</div>
                  <div class="flex items-center gap-1">
                    <button v-for="i in 5" :key="i" type="button" class="p-1" @click="reviewForm.rating = i">
                      <Star class="w-6 h-6" :class="i <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
                    </button>
                  </div>
                </div>
                <div class="col-span-12 space-y-2">
                  <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ pdpCopy.reviewLabel }}</div>
                  <textarea v-model="reviewForm.comment" rows="5" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 focus:border-blue-600 outline-none transition-all resize-none" :placeholder="pdpCopy.commentPlaceholder"></textarea>
                </div>
                <div class="col-span-12 space-y-2">
                  <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ pdpUxCopy.reviewImageLabel }}</div>
                  <input v-model="reviewForm.imageUrls" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 focus:border-blue-600 outline-none transition-all" />
                </div>
                <div class="col-span-12">
                  <button type="button" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-extrabold shadow-lg shadow-blue-100 disabled:opacity-60 disabled:cursor-not-allowed" :disabled="reviewSubmitting" @click="submitReview">
                    {{ reviewSubmitting ? t('sending') : t('review_submit') }}
                  </button>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button v-for="option in reviewFilterOptions" :key="`desktop-${option.key}`" type="button" :class="['rounded-full px-3 py-2 text-xs font-extrabold transition-all', reviewFilter === option.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600']" @click="reviewFilter = option.key as any">
                {{ option.label }} ({{ option.count }})
              </button>
              <select v-if="reviewConfig.showSort" v-model="reviewSort" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-blue-600">
                <option v-for="option in reviewSortOptions" :key="`desktop-sort-${option.key}`" :value="option.key">{{ option.label }}</option>
              </select>
            </div>
            <div v-if="reviewsLoading" class="text-sm font-bold text-gray-400">{{ t('loading') }}</div>
            <div v-else-if="reviews.length === 0" class="text-sm font-bold text-gray-400">{{ t('no_reviews_yet') }}</div>
            <div v-else-if="sortedReviews.length === 0" class="text-sm font-bold text-gray-400">{{ pdpCopy.noFilteredReviews }}</div>
            <div v-else class="space-y-4">
              <div v-for="r in sortedReviews" :key="r.id" class="bg-gray-50 border border-gray-100 rounded-2xl p-7">
                <div class="flex items-center justify-between mb-2">
                  <div class="font-extrabold text-gray-900">{{ r.name }}</div>
                  <div class="flex items-center">
                    <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
                  </div>
                </div>
                <div class="text-xs font-bold text-gray-400">{{ String(r.createdAt || '').split('T')[0] }}</div>
                <p class="text-gray-600 font-medium leading-relaxed mt-4 whitespace-pre-line">{{ r.comment }}</p>
                <div v-if="Array.isArray(r.images) && r.images.length" class="mt-4 grid grid-cols-4 gap-3">
                  <img v-for="image in r.images" :key="`${r.id}-desktop-${image}`" :src="image" class="h-28 w-full rounded-2xl object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="productExperienceSections.faq?.enabled !== false && publicFaqItems.length" class="container pb-12 md:pb-0">
      <div class="mt-10 rounded-xl border border-gray-100 bg-white p-6 sm:p-8">
        <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">{{ productExperienceSections.faq?.badge?.[lang] || pdpUxCopy.qnaProduct }}</div>
        <div class="mt-2 text-2xl font-extrabold text-gray-900">{{ productExperienceSections.faq?.title?.[lang] || pdpCopy.qnaTitle }}</div>
        <div class="mt-2 text-sm font-medium text-gray-500">{{ productExperienceSections.faq?.subtitle?.[lang] || pdpCopy.qnaDesc }}</div>
        <div class="mt-6 space-y-3">
          <div v-for="item in publicFaqItems" :key="item.id" class="rounded-lg border border-gray-100 bg-gray-50 px-5 py-4">
            <div class="text-sm font-extrabold text-gray-900">{{ item.question }}</div>
            <div class="mt-2 text-sm font-medium leading-6 text-gray-600">{{ item.answer }}</div>
            <div v-if="item.helpfulCount" class="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ item.helpfulCount }} {{ pdpUxCopy.helpful }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="productExperienceSections.bundle?.enabled !== false && bundleProducts.length" class="container pb-12 md:pb-0">
      <div class="mt-10 rounded-xl border border-gray-100 bg-white p-6 sm:p-8">
        <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">{{ productExperienceSections.bundle?.badge?.[lang] || pdpCopy.bundleBadge }}</div>
        <div class="mt-2 text-2xl font-extrabold text-gray-900">{{ productExperienceSections.bundle?.title?.[lang] || pdpCopy.bundleTitle }}</div>
        <div class="mt-2 text-sm font-medium text-gray-500">{{ productExperienceSections.bundle?.subtitle?.[lang] || pdpCopy.bundleDesc }}</div>
        <div v-if="bundleConfig.showTotal || bundleConfig.enableAddAll" class="mt-5 flex flex-col gap-3 rounded-lg border border-amber-100 bg-amber-50/60 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700">{{ pdpUxCopy.bundleTotal }}</div>
            <div class="mt-1 text-2xl font-extrabold text-gray-900">{{ formatMoney(bundleTotalPrice) }}</div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button v-if="bundleConfig.enableSelection" type="button" class="rounded-lg border border-amber-200 bg-white px-5 py-3 text-sm font-extrabold text-amber-700 hover:bg-amber-100" @click="addSelectedBundleToCart">{{ pdpUxCopy.addSelectedBundle }}</button>
            <button v-if="bundleConfig.enableAddAll" type="button" class="rounded-lg bg-[#FACC15] px-5 py-3 text-sm font-extrabold text-gray-900 hover:brightness-95" @click="bundleSelection = bundleCards.map((item) => Number(item.product?.id || 0)); addSelectedBundleToCart()">{{ pdpUxCopy.addAllBundle }}</button>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div v-for="item in bundleCards" :key="`bundle-${item.product.id}`" class="space-y-3">
            <label v-if="bundleConfig.enableSelection && !item.locked" class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-700">
              <span>{{ nameOf(item.product) }}</span>
              <input :checked="bundleSelection.includes(Number(item.product.id))" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600" @change="toggleBundleItem(Number(item.product.id))" />
            </label>
            <div v-else-if="item.locked" class="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              <span>{{ nameOf(product) }}</span>
              <span>Base</span>
            </div>
            <ProductCard :product="item.product" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="productExperienceSections.recommendations?.enabled !== false && recommendedProducts.length" class="container pb-24 md:pb-0">     
      <div class="mt-14 rounded-xl border border-gray-100 bg-white p-6 sm:p-8">
        <div class="flex items-center justify-between gap-4">
          <div>
            <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">{{ productExperienceSections.recommendations?.badge?.[lang] || pdpCopy.smartBadge }}</div>
            <div class="mt-2 text-2xl font-extrabold text-gray-900">{{ productExperienceSections.recommendations?.title?.[lang] || pdpCopy.smartTitle }}</div>
            <div v-if="productExperienceSections.recommendations?.subtitle?.[lang]" class="mt-2 text-sm font-medium text-gray-500">{{ productExperienceSections.recommendations?.subtitle?.[lang] }}</div>
          </div>
          <NuxtLink to="/shop" class="text-sm font-extrabold text-blue-600 hover:underline">{{ pdpCopy.allProducts }}</NuxtLink>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <ProductCard
            v-for="item in recommendedProducts"
            :key="item.id"
            :product="item"
          />
        </div>
      </div>
    </div>

    <div v-if="zoomedMedia && activeMediaItem?.type === 'image'" class="fixed inset-0 z-[125] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" @click.self="zoomedMedia = false">
      <div class="relative w-full max-w-5xl overflow-hidden rounded-xl bg-white p-4 sm:p-6">
        <button type="button" class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900" @click="zoomedMedia = false">
          <X class="h-5 w-5" />
        </button>
        <img :src="String(activeMediaItem?.src || '')" :alt="nameOf(product)" class="max-h-[80vh] w-full object-contain" />
      </div>
    </div>

    <div v-if="activeInfoModal" class="fixed inset-0 z-[130] bg-black/45 backdrop-blur-sm flex items-center justify-center px-4 py-6" @click.self="closeInfoModal">
      <div class="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl border border-gray-100">
        <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100">
          <div>
            <div class="text-2xl font-extrabold text-gray-900">{{ activeInfoModal.detailTitle || activeInfoModal.title }}</div>
            <div v-if="activeInfoModal.description" class="mt-1 text-sm font-medium text-gray-500">{{ activeInfoModal.description }}</div>
          </div>
          <button type="button" class="w-11 h-11 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center justify-center" @click="closeInfoModal">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="overflow-auto max-h-[calc(90vh-88px)] px-6 sm:px-8 py-6">
          <div class="space-y-5">
            <p v-if="activeInfoModal.detailIntro" class="text-sm sm:text-base font-medium text-gray-600 leading-7">{{ activeInfoModal.detailIntro }}</p>

            <div v-if="activeInfoModal.detailRows?.length" class="rounded-lg border border-gray-100 overflow-hidden">
              <div
                v-for="(row, rowIdx) in activeInfoModal.detailRows"
                :key="`row-${rowIdx}`"
                class="grid grid-cols-[140px,1fr] sm:grid-cols-[180px,1fr] border-b border-gray-100 last:border-b-0"
              >
                <div class="bg-gray-50 px-4 sm:px-5 py-4 text-sm font-bold text-gray-700">{{ row.label }}</div>
                <div class="px-4 sm:px-5 py-4 text-sm font-medium text-gray-600">{{ row.value }}</div>
              </div>
            </div>

            <div v-if="activeInfoModal.detailCards?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="(card, cardIdx) in activeInfoModal.detailCards"
                :key="`card-${cardIdx}`"
                class="rounded-lg border border-gray-100 bg-gray-50 p-5"
              >
                <div class="text-base font-extrabold text-gray-900">{{ card.title }}</div>
                <div v-if="card.description" class="mt-2 text-sm font-medium text-gray-600 leading-6">{{ card.description }}</div>
              </div>
            </div>

            <div v-if="activeInfoModal.detailNotes?.length" class="space-y-3">
              <div
                v-for="(note, noteIdx) in activeInfoModal.detailNotes"
                :key="`note-${noteIdx}`"
                class="rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800 leading-6"
              >
                {{ note.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .product-density-compact :deep(.text-3xl.font-extrabold),
  .product-density-compact :deep(.text-3xl.font-black) {
    font-size: 1.625rem;
    line-height: 2rem;
  }
  .product-density-compact :deep(.text-2xl.font-extrabold) {
    font-size: 1.25rem;
    line-height: 1.7rem;
  }
  .product-density-compact :deep(.p-6) {
    padding: 1rem;
  }
  .product-density-compact :deep(.px-5.py-5) {
    padding: 1rem;
  }
  .product-density-compact :deep(.px-5.py-4) {
    padding: 0.875rem;
  }
}
</style>
