<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowDown, ArrowUp, Plus, Save, Sparkles, Trash2 } from 'lucide-vue-next'
import { useBannerStore } from '~/stores/banners'
import { useHomeSectionsStore } from '~/stores/homeSections'
import { useProductStore } from '~/stores/products'
import { useSettingsStore } from '~/stores/settings'

definePageMeta({ layout: 'admin' })

const homeStore = useHomeSectionsStore()
const bannerStore = useBannerStore()
const productStore = useProductStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const saving = ref(false)
const supportedSectionKeys = ['hero', 'campaignBlocks', 'features', 'popularSearches', 'shopByBudget', 'shopByBrand', 'flashDeals', 'bannerAfterFeatures', 'storyNewArrivals', 'storyTrending', 'topDeals', 'bannerAfterTopDeals', 'topSelling', 'bestRatedProducts', 'frequentlyBoughtTogether', 'topProducts', 'bannerAfterTopProducts', 'storyWeeklyPick', 'storyEditorsPick', 'featuredCategories', 'featuredSellers', 'sellerTrustMetrics', 'verifiedSellers', 'sellerProducts', 'middleBanners', 'buyerProtection', 'trendingNow', 'lookbook', 'ugcShowcase', 'recentlyViewed', 'brandStrip', 'promoStrip', 'appPromo', 'marketHighlights'] as const
const experienceBackfillSectionKeys = ['features', 'popularSearches', 'shopByBudget', 'shopByBrand', 'flashDeals', 'bannerAfterFeatures', 'featuredCategories', 'sellerTrustMetrics', 'verifiedSellers', 'sellerProducts', 'middleBanners', 'buyerProtection', 'trendingNow', 'bestRatedProducts', 'frequentlyBoughtTogether', 'storyTrending', 'storyWeeklyPick', 'bannerAfterTopDeals', 'bannerAfterTopProducts', 'promoStrip', 'appPromo'] as const
const sectionLabels: Record<string, string> = {
  hero: 'Hero',
  campaignBlocks: 'Kampaniya blokları',
  storyNewArrivals: 'Yeni gələnlər',
  storyTrending: 'Trenddə olanlar',
  storyWeeklyPick: 'Bu həftənin seçimi',
  storyEditorsPick: 'Redaktor seçimi',
  features: 'Xidmət üstünlükləri',
  popularSearches: 'Populyar axtarışlar',
  shopByBudget: 'Büdcəyə görə alış-veriş',
  shopByBrand: 'Brendə görə alış-veriş',
  flashDeals: 'Flash deals spotlight',
  bannerAfterFeatures: 'Features sonrası bannerlar',
  featuredCategories: 'Kateqoriya vitrini',
  featuredSellers: 'Featured sellers',
  sellerTrustMetrics: 'Satıcı etibar göstəriciləri',
  verifiedSellers: 'Yoxlanılmış mağazalar',
  sellerProducts: 'Seller məhsulları',
  middleBanners: 'Orta bannerlar',
  buyerProtection: 'Alıcı qorunması',
  trendingNow: 'Trending now',
  marketHighlights: 'Market highlights',
  topDeals: 'Top deals',
  bannerAfterTopDeals: 'Top Deals sonrası bannerlar',
  topSelling: 'Top selling',
  bestRatedProducts: 'Ən yüksək reytinqli məhsullar',
  frequentlyBoughtTogether: 'Birlikdə tez-tez alınır',
  topProducts: 'Top products',
  bannerAfterTopProducts: 'Top Products sonrası bannerlar',
  newArrivals: 'Legacy new arrivals',
  recentlyViewed: 'Recently viewed',
  lookbook: 'Lookbook',
  ugcShowcase: 'UGC vitrini',
  promoStrip: 'Promo strip',
  appPromo: 'App promo'
}
const sectionEditorMeta: Record<string, { targetId?: string, label: string }> = {
  hero: { label: 'Hero ayrıca home/slider hissələrindən idarə olunur' },
  campaignBlocks: { targetId: 'campaign-blocks-editor', label: 'Aşağıdakı Kampaniya blokları hissəsində düzənlə' },
  storyNewArrivals: { targetId: 'storytelling-editor', label: 'Aşağıdakı Storytelling bloklarında düzənlə' },
  storyTrending: { targetId: 'storytelling-editor', label: 'Aşağıdakı Storytelling bloklarında düzənlə' },
  storyWeeklyPick: { targetId: 'storytelling-editor', label: 'Aşağıdakı Storytelling bloklarında məhsul seç' },
  storyEditorsPick: { targetId: 'storytelling-editor', label: 'Aşağıdakı Storytelling bloklarında məhsul seç' },
  lookbook: { targetId: 'lookbook-ugc-editor', label: 'Aşağıdakı Lookbook & UGC hissəsində düzənlə' },
  ugcShowcase: { targetId: 'lookbook-ugc-editor', label: 'Aşağıdakı Lookbook & UGC hissəsində düzənlə' },
  features: { targetId: 'section-order-manager', label: 'Bu blok auto hissədir, Experience Builder yalnız sırasını idarə edir' },
  popularSearches: { targetId: 'section-order-manager', label: 'Aşağıdakı home sections hissəsində Search Intelligence ilə idarə olunur' },
  shopByBudget: { targetId: 'section-order-manager', label: 'Aşağıdakı home sections hissəsində büdcə kartları ilə idarə olunur' },
  shopByBrand: { targetId: 'section-order-manager', label: 'Aşağıdakı home sections hissəsində brand kartları ilə idarə olunur' },
  flashDeals: { label: 'Top Deals admin datasının spotlight versiyasıdır' },
  bannerAfterFeatures: { targetId: 'section-order-manager', label: 'Features-dən sonra gələn banner bölməsi' },
  featuredCategories: { targetId: 'section-order-manager', label: 'Kateqoriya vitrinini kateqoriya/home ayarlarından doldur' },
  featuredSellers: { label: 'Featured seller datasını sellers bölməsindən idarə et' },
  verifiedSellers: { targetId: 'section-order-manager', label: 'PRO / featured sellers datasına əsasən işləyir' },
  sellerProducts: { targetId: 'section-order-manager', label: 'Seller məhsulları satıcı datalarından gəlir' },
  middleBanners: { targetId: 'section-order-manager', label: 'Orta hissədə görünən bannerlar' },
  buyerProtection: { targetId: 'section-order-manager', label: 'Aşağıdakı home sections hissəsində trust item-lərlə idarə olunur' },
  trendingNow: { targetId: 'section-order-manager', label: 'Trending now məhsul datasına əsasən auto qurulur' },
  marketHighlights: { label: 'Bu blok hazır vitrindir, burada yalnız sırası dəyişir' },
  topDeals: { label: 'Top Deals ayrıca admin bölməsindən idarə olunur' },
  bannerAfterTopDeals: { targetId: 'section-order-manager', label: 'Top Deals-dən sonra gələn banner bölməsi' },
  topSelling: { label: 'Top Selling ayrıca məhsul satış datasına əsaslanır' },
  bestRatedProducts: { targetId: 'section-order-manager', label: 'Məhsul rating datasına görə avtomatik qurulur' },
  topProducts: { label: 'Top Products ayrıca hissədən idarə olunur' },
  bannerAfterTopProducts: { targetId: 'section-order-manager', label: 'Top Products-dən sonra gələn banner bölməsi' },
  newArrivals: { label: 'Legacy new arrivals ayrıca hissədən idarə olunur' },
  recentlyViewed: { label: 'Recently viewed istifadəçi davranışından auto qurulur' },
  promoStrip: { targetId: 'section-order-manager', label: 'Aşağıdakı banner panelindən Home sections-a keçərək düzənlə' },
  appPromo: { targetId: 'section-order-manager', label: 'Aşağıdakı banner panelindən Settings səhifəsinə keçərək düzənlə' }
}
const bannerEditorMeta: Record<string, { label: string, href: string, button: string }> = {
  afterFeatures: { label: 'Features-dən sonrakı bannerlar', href: '/admin/banners', button: 'Bannerlərə keç' },
  afterTopDeals: { label: 'Top Deals-dən sonrakı bannerlar', href: '/admin/banners', button: 'Bannerlərə keç' },
  afterTopProducts: { label: 'Top Products-dən sonrakı bannerlar', href: '/admin/banners', button: 'Bannerlərə keç' },
  middle: { label: 'Orta bannerlar / Middle placement', href: '/admin/banners', button: 'Bannerlərə keç' },
  promoStrip: { label: 'Promo strip mətnləri', href: '/admin/home-sections', button: 'Home sections-a keç' },
  appPromo: { label: 'App promo banneri', href: '/admin/settings', button: 'Settings-ə keç' },
  bannerLayout: { label: 'Banner görünüş layout-u', href: '/admin/design', button: 'Design-ə keç' }
}

const sectionOrder = ref<string[]>([])
const audienceMode = ref<'general' | 'new' | 'returning' | 'vip'>('general')
const campaignBlocks = ref<any[]>([])
const story = ref<any>({
  newArrivals: { enabled: true, titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, limit: 8 },
  trending: { enabled: true, titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, limit: 8 },
  weeklyPick: { enabled: true, titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, productIds: [] as number[] },
  editorsPick: { enabled: true, titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, productIds: [] as number[] }
})
const lookbook = ref<any>({ enabled: true, titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, blocks: [] })
const ugcShowcase = ref<any>({ enabled: true, titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, cards: [] })
const products = computed(() => productStore.products.filter((item) => item.status === 'Aktiv'))
const normalizeSectionOrder = (value: string[] = []) => {
  const filtered = value.filter((item) => supportedSectionKeys.includes(item as any))
  const backfill = experienceBackfillSectionKeys.filter((item) => !filtered.includes(item))
  return [...new Set([...filtered, ...backfill])]
}
const availableSections = computed(() =>
  supportedSectionKeys.filter((item) => !sectionOrder.value.includes(item))
)
const bannerCounts = computed(() => ({
  afterFeatures: bannerStore.banners.filter((item) => item.status === 'Aktiv' && item.homePlacement === 'afterFeatures').length,
  afterTopDeals: bannerStore.banners.filter((item) => item.status === 'Aktiv' && item.homePlacement === 'afterTopDeals').length,
  afterTopProducts: bannerStore.banners.filter((item) => item.status === 'Aktiv' && item.homePlacement === 'afterTopProducts').length,
  middle: bannerStore.banners.filter((item) => item.status === 'Aktiv' && item.position === 'Middle').length,
  promoStrip: Array.isArray(homeStore.config?.promoStrip?.itemsI18n) ? homeStore.config.promoStrip.itemsI18n.filter((item: any) => String(item?.az || item?.ru || item?.en || '').trim()).length : 0,
  appPromo: Boolean(settingsStore.settings.appPromo?.enabled && settingsStore.settings.appPromo?.title)
}))
const bannerChecklist = computed(() => [
  { key: 'afterFeatures', label: 'Features sonrası bannerlar', ok: bannerCounts.value.afterFeatures > 0 },
  { key: 'afterTopDeals', label: 'Top Deals sonrası bannerlar', ok: bannerCounts.value.afterTopDeals > 0 },
  { key: 'afterTopProducts', label: 'Top Products sonrası bannerlar', ok: bannerCounts.value.afterTopProducts > 0 },
  { key: 'middle', label: 'Orta bannerlar', ok: bannerCounts.value.middle > 0 },
  { key: 'promoStrip', label: 'Promo strip', ok: bannerCounts.value.promoStrip > 0 },
  { key: 'appPromo', label: 'App promo', ok: bannerCounts.value.appPromo }
])

const hydrate = () => {
  const cfg: any = homeStore.config
  if (!cfg) return
  sectionOrder.value = normalizeSectionOrder([...(cfg.experienceBuilder?.sectionOrder || [])])
  audienceMode.value = cfg.experienceBuilder?.audienceMode || 'general'
  campaignBlocks.value = JSON.parse(JSON.stringify(cfg.campaignBlocks || []))
  story.value = JSON.parse(JSON.stringify(cfg.storytelling || story.value))
  lookbook.value = JSON.parse(JSON.stringify(cfg.lookbook || lookbook.value))
  ugcShowcase.value = JSON.parse(JSON.stringify(cfg.ugcShowcase || ugcShowcase.value))
}

const moveSection = (index: number, direction: -1 | 1) => {
  const target = index + direction
  if (target < 0 || target >= sectionOrder.value.length) return
  const next = [...sectionOrder.value]
  ;[next[index], next[target]] = [next[target], next[index]]
  sectionOrder.value = next
}

const addSection = (sectionKey: string) => {
  if (sectionOrder.value.includes(sectionKey)) return
  sectionOrder.value = [...sectionOrder.value, sectionKey]
}

const removeSection = (sectionKey: string) => {
  sectionOrder.value = sectionOrder.value.filter((item) => item !== sectionKey)
}

const save = async () => {
  saving.value = true
  try {
    await homeStore.saveConfig({
      experienceBuilder: { audienceMode: audienceMode.value, sectionOrder: sectionOrder.value },
      campaignBlocks: campaignBlocks.value,
      storytelling: story.value,
      lookbook: lookbook.value,
      ugcShowcase: ugcShowcase.value
    } as any)
    toastStore.success('Experience builder yeniləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Experience builder yadda saxlanılmadı')
  } finally {
    saving.value = false
  }
}

const addCampaignBlock = () => campaignBlocks.value.push({
  enabled: true,
  audience: 'all',
  titleI18n: { az: '', ru: '', en: '' },
  subtitleI18n: { az: '', ru: '', en: '' },
  ctaLabelI18n: { az: '', ru: '', en: '' },
  href: '/shop',
  image: ''
})

const addLookbookBlock = () => lookbook.value.blocks.push({ titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, image: '', href: '/shop' })
const addUgcCard = () => ugcShowcase.value.cards.push({ creator: '', handle: '', textI18n: { az: '', ru: '', en: '' }, image: '', href: '/shop' })
const removeCampaignBlock = (index: number) => campaignBlocks.value.splice(index, 1)
const removeLookbookBlock = (index: number) => lookbook.value.blocks.splice(index, 1)
const removeUgcCard = (index: number) => ugcShowcase.value.cards.splice(index, 1)
const jumpToEditor = (targetId?: string) => {
  if (!process.client || !targetId) return
  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const previewStateBySection = computed<Record<string, { status: 'ready' | 'empty' | 'static' | 'disabled', detail: string, badge: string, previewText: string }>>(() => ({
  hero: { status: 'ready', detail: 'Ana səhifənin əvvəlində görünür', badge: 'Hero canlıdır', previewText: 'Storefront hero preview' },
  campaignBlocks: campaignBlocks.value.some((item) => item?.enabled && item?.titleI18n?.az)
    ? { status: 'ready', detail: `${campaignBlocks.value.filter((item) => item?.enabled).length} aktiv blok hazırdır`, badge: 'Kampaniya', previewText: campaignBlocks.value.find((item) => item?.enabled && item?.titleI18n?.az)?.titleI18n?.az || 'Campaign ready' }
    : campaignBlocks.value.length
      ? { status: 'disabled', detail: 'Bloklar var, amma aktiv deyil', badge: 'Disabled', previewText: 'Aktiv et ki storefront-da görünsün' }
      : { status: 'empty', detail: 'Aktiv başlıq və CTA daxil edilməyib', badge: 'Boşdur', previewText: 'Başlıq, CTA və şəkil daxil edin' },
  storyNewArrivals: Boolean(story.value?.newArrivals?.enabled)
    ? { status: 'ready', detail: `Limit ${Number(story.value?.newArrivals?.limit || 8)} məhsul`, badge: 'Story row', previewText: story.value?.newArrivals?.titleI18n?.az || 'Yeni gələnlər' }
    : { status: 'disabled', detail: 'Blok söndürülüb', badge: 'Disabled', previewText: 'Enable edin ki görünsün' },
  storyTrending: Boolean(story.value?.trending?.enabled)
    ? { status: 'ready', detail: `Trend sıralaması ${Number(story.value?.trending?.limit || 8)} məhsul`, badge: 'Trend row', previewText: story.value?.trending?.titleI18n?.az || 'Trenddə olanlar' }
    : { status: 'disabled', detail: 'Blok söndürülüb', badge: 'Disabled', previewText: 'Enable edin ki görünsün' },
  storyWeeklyPick: !story.value?.weeklyPick?.enabled
    ? { status: 'disabled', detail: 'Blok söndürülüb', badge: 'Disabled', previewText: 'Enable edin ki görünsün' }
    : Array.isArray(story.value?.weeklyPick?.productIds) && story.value.weeklyPick.productIds.length > 0
      ? { status: 'ready', detail: `${story.value.weeklyPick.productIds.length} məhsul seçilib`, badge: 'Weekly pick', previewText: story.value?.weeklyPick?.titleI18n?.az || 'Bu həftənin seçimi' }
      : products.value.length
        ? { status: 'ready', detail: 'Məhsul seçilməsə də storefront fallback məhsulları göstərəcək', badge: 'Fallback', previewText: story.value?.weeklyPick?.titleI18n?.az || 'Bu həftənin seçimi' }
        : { status: 'empty', detail: 'Hələ məhsul seçilməyib', badge: 'Boşdur', previewText: 'Ən azı 1 məhsul seçin' },
  storyEditorsPick: !story.value?.editorsPick?.enabled
    ? { status: 'disabled', detail: 'Blok söndürülüb', badge: 'Disabled', previewText: 'Enable edin ki görünsün' }
    : Array.isArray(story.value?.editorsPick?.productIds) && story.value.editorsPick.productIds.length > 0
      ? { status: 'ready', detail: `${story.value.editorsPick.productIds.length} məhsul seçilib`, badge: 'Editor pick', previewText: story.value?.editorsPick?.titleI18n?.az || 'Redaktor seçimi' }
      : { status: 'empty', detail: 'Hələ məhsul seçilməyib', badge: 'Boşdur', previewText: 'Ən azı 1 məhsul seçin' },
  lookbook: lookbook.value?.enabled === false
    ? { status: 'disabled', detail: 'Lookbook söndürülüb', badge: 'Disabled', previewText: 'Enable edin ki storefront-a düşsün' }
    : Array.isArray(lookbook.value?.blocks) && lookbook.value.blocks.length > 0
      ? { status: 'ready', detail: `${lookbook.value.blocks.length} lookbook bloku hazırdır`, badge: 'Lookbook', previewText: lookbook.value.blocks[0]?.titleI18n?.az || 'Lookbook ready' }
      : { status: 'empty', detail: 'Şəkil və başlıqlı blok yoxdur', badge: 'Boşdur', previewText: 'Şəkil əlavə edin' },
  ugcShowcase: ugcShowcase.value?.enabled === false
    ? { status: 'disabled', detail: 'UGC vitrini söndürülüb', badge: 'Disabled', previewText: 'Enable edin ki storefront-a düşsün' }
    : Array.isArray(ugcShowcase.value?.cards) && ugcShowcase.value.cards.length > 0
      ? { status: 'ready', detail: `${ugcShowcase.value.cards.length} UGC kartı hazırdır`, badge: 'UGC', previewText: ugcShowcase.value.cards[0]?.creator || 'UGC creator' }
      : { status: 'empty', detail: 'UGC kartları boşdur', badge: 'Boşdur', previewText: 'Creator və şəkil əlavə edin' },
  features: { status: 'static', detail: 'Sistem bölməsi, builder order ilə idarə olunur', badge: 'Auto', previewText: 'Xidmət üstünlükləri' },
  popularSearches: { status: 'static', detail: 'Search analytics datası ilə işləyir', badge: 'Search', previewText: 'Populyar axtarış çipləri' },
  shopByBudget: Array.isArray(homeStore.config?.shopByBudget?.cards) && homeStore.config.shopByBudget.cards.length > 0
    ? { status: 'ready', detail: `${homeStore.config.shopByBudget.cards.length} büdcə kartı hazırdır`, badge: 'Budget', previewText: homeStore.config.shopByBudget.cards[0]?.labelI18n?.az || 'Büdcəyə görə alış-veriş' }
    : { status: 'empty', detail: 'Büdcə kartları boşdur', badge: 'Boşdur', previewText: 'Ən azı 1 büdcə kartı əlavə edin' },
  bannerAfterFeatures: bannerCounts.value.afterFeatures > 0
    ? { status: 'ready', detail: `${bannerCounts.value.afterFeatures} aktiv banner`, badge: 'Banner', previewText: 'Features sonrası bannerlar' }
    : { status: 'empty', detail: 'Bu placement üçün aktiv banner yoxdur', badge: 'Boşdur', previewText: 'Banner əlavə edin' },
  featuredCategories: { status: 'static', detail: 'Kateqoriya datalarına əsasən göstərilir', badge: 'Auto', previewText: 'Featured categories' },
  featuredSellers: { status: 'static', detail: 'Featured seller datalarına əsasən göstərilir', badge: 'Auto', previewText: 'Featured sellers' },
  sellerProducts: { status: 'static', detail: 'Satıcı məhsullarından avtomatik qurulur', badge: 'Auto', previewText: 'Seller showcase' },
  middleBanners: bannerCounts.value.middle > 0
    ? { status: 'ready', detail: `${bannerCounts.value.middle} aktiv banner`, badge: 'Banner', previewText: 'Middle banner showcase' }
    : { status: 'empty', detail: 'Middle placement üçün aktiv banner yoxdur', badge: 'Boşdur', previewText: 'Banner əlavə edin' },
  trendingNow: { status: 'static', detail: 'Məhsul datalarına əsasən göstərilir', badge: 'Auto', previewText: 'Trending now' },
  marketHighlights: { status: 'static', detail: 'Sabit vitrindir, order dəyişir', badge: 'Auto', previewText: 'Market highlights' },
  topDeals: { status: 'static', detail: 'Top Deals bölməsi ayrıca idarə olunur', badge: 'Auto', previewText: 'Top deals' },
  bannerAfterTopDeals: bannerCounts.value.afterTopDeals > 0
    ? { status: 'ready', detail: `${bannerCounts.value.afterTopDeals} aktiv banner`, badge: 'Banner', previewText: 'Top Deals sonrası bannerlar' }
    : { status: 'empty', detail: 'Bu placement üçün aktiv banner yoxdur', badge: 'Boşdur', previewText: 'Banner əlavə edin' },
  topSelling: { status: 'static', detail: 'Top Selling ayrıca idarə olunur', badge: 'Auto', previewText: 'Top selling' },
  bestRatedProducts: { status: 'static', detail: 'Məhsul rating datasına əsasən göstərilir', badge: 'Rating', previewText: 'Best rated products' },
  frequentlyBoughtTogether: { status: 'static', detail: 'Order tarixçəsində birlikdə alınan cütlüklərə əsaslanır', badge: 'Orders', previewText: 'Frequently bought together' },
  topProducts: { status: 'static', detail: 'Top Products ayrıca idarə olunur', badge: 'Auto', previewText: 'Top products' },
  bannerAfterTopProducts: bannerCounts.value.afterTopProducts > 0
    ? { status: 'ready', detail: `${bannerCounts.value.afterTopProducts} aktiv banner`, badge: 'Banner', previewText: 'Top Products sonrası bannerlar' }
    : { status: 'empty', detail: 'Bu placement üçün aktiv banner yoxdur', badge: 'Boşdur', previewText: 'Banner əlavə edin' },
  newArrivals: { status: 'static', detail: 'Legacy new arrivals ayrıca idarə olunur', badge: 'Auto', previewText: 'Legacy new arrivals' },
  recentlyViewed: { status: 'static', detail: 'İstifadəçi baxış tarixçəsindən qurulur', badge: 'Auto', previewText: 'Recently viewed' },
  verifiedSellers: { status: 'static', detail: 'Featured seller datasından verified showcase qurulur', badge: 'Seller', previewText: 'Verified sellers' },
  sellerTrustMetrics: { status: 'static', detail: 'Seller score order/product/verification datasından hesablanır', badge: 'Trust', previewText: 'Seller trust metrics' },
  buyerProtection: Array.isArray(homeStore.config?.buyerProtection?.items) && homeStore.config.buyerProtection.items.length > 0
    ? { status: 'ready', detail: `${homeStore.config.buyerProtection.items.length} trust item hazırdır`, badge: 'Trust', previewText: homeStore.config.buyerProtection.items[0]?.titleI18n?.az || 'Alıcı qorunması' }
    : { status: 'empty', detail: 'Trust item-lər boşdur', badge: 'Boşdur', previewText: 'Ən azı 1 item əlavə edin' },
  promoStrip: bannerCounts.value.promoStrip > 0
    ? { status: 'ready', detail: `${bannerCounts.value.promoStrip} promo mətn`, badge: 'Banner', previewText: 'Scrolling promo strip' }
    : { status: 'empty', detail: 'Promo strip mətnləri boşdur', badge: 'Boşdur', previewText: 'Home sections-da doldur' },
  appPromo: bannerCounts.value.appPromo
    ? { status: 'ready', detail: 'App promo aktivdir', badge: 'Banner', previewText: 'App install promo' }
    : { status: 'empty', detail: 'App promo deaktiv və ya boşdur', badge: 'Boşdur', previewText: 'Settings-də doldur' }
}))
const previewChecklist = computed(() => [
  { key: 'campaignBlocks', label: 'Kampaniya blokları', ok: campaignBlocks.value.some((item) => item?.enabled && item?.titleI18n?.az), targetId: 'campaign-blocks-editor' },
  { key: 'features', label: 'Xidmət üstünlükləri', ok: sectionOrder.value.includes('features'), targetId: 'section-order-manager' },
  { key: 'popularSearches', label: 'Populyar axtarışlar', ok: sectionOrder.value.includes('popularSearches') && Boolean(homeStore.config?.popularSearches?.enabled), targetId: 'section-order-manager' },
  { key: 'shopByBudget', label: 'Büdcəyə görə alış-veriş', ok: sectionOrder.value.includes('shopByBudget') && Array.isArray(homeStore.config?.shopByBudget?.cards) && homeStore.config.shopByBudget.cards.length > 0, targetId: 'section-order-manager' },
  { key: 'shopByBrand', label: 'Brendə görə alış-veriş', ok: sectionOrder.value.includes('shopByBrand') && Array.isArray(homeStore.config?.shopByBrand?.cards) && homeStore.config.shopByBrand.cards.length > 0, targetId: 'section-order-manager' },
  { key: 'flashDeals', label: 'Flash deals spotlight', ok: sectionOrder.value.includes('flashDeals') && Boolean(homeStore.config?.flashDeals?.enabled), targetId: 'section-order-manager' },
  { key: 'bannerAfterFeatures', label: 'Features sonrası bannerlar', ok: sectionOrder.value.includes('bannerAfterFeatures') && bannerCounts.value.afterFeatures > 0, targetId: 'section-order-manager' },
  { key: 'featuredCategories', label: 'Kateqoriya vitrini', ok: sectionOrder.value.includes('featuredCategories'), targetId: 'section-order-manager' },
  { key: 'storyNewArrivals', label: 'Yeni gələnlər', ok: Boolean(story.value?.newArrivals?.enabled), targetId: 'storytelling-editor' },
  { key: 'storyTrending', label: 'Trenddə olanlar', ok: Boolean(story.value?.trending?.enabled), targetId: 'storytelling-editor' },
  { key: 'storyWeeklyPick', label: 'Bu həftənin seçimi', ok: (Array.isArray(story.value?.weeklyPick?.productIds) && story.value.weeklyPick.productIds.length > 0) || (Boolean(story.value?.weeklyPick?.enabled) && products.value.length > 0), targetId: 'storytelling-editor' },
  { key: 'storyEditorsPick', label: 'Redaktor seçimi', ok: Array.isArray(story.value?.editorsPick?.productIds) && story.value.editorsPick.productIds.length > 0, targetId: 'storytelling-editor' },
  { key: 'sellerProducts', label: 'Seller məhsulları', ok: sectionOrder.value.includes('sellerProducts'), targetId: 'section-order-manager' },
  { key: 'middleBanners', label: 'Orta bannerlar', ok: sectionOrder.value.includes('middleBanners') && bannerCounts.value.middle > 0, targetId: 'section-order-manager' },
  { key: 'verifiedSellers', label: 'Yoxlanılmış mağazalar', ok: sectionOrder.value.includes('verifiedSellers') && Boolean(homeStore.config?.verifiedSellers?.enabled), targetId: 'section-order-manager' },
  { key: 'sellerTrustMetrics', label: 'Satıcı etibar göstəriciləri', ok: sectionOrder.value.includes('sellerTrustMetrics') && Boolean(homeStore.config?.sellerTrustMetrics?.enabled), targetId: 'section-order-manager' },
  { key: 'buyerProtection', label: 'Alıcı qorunması', ok: sectionOrder.value.includes('buyerProtection') && Array.isArray(homeStore.config?.buyerProtection?.items) && homeStore.config.buyerProtection.items.length > 0, targetId: 'section-order-manager' },
  { key: 'trendingNow', label: 'Trending now', ok: sectionOrder.value.includes('trendingNow'), targetId: 'section-order-manager' },
  { key: 'bannerAfterTopDeals', label: 'Top Deals sonrası bannerlar', ok: sectionOrder.value.includes('bannerAfterTopDeals') && bannerCounts.value.afterTopDeals > 0, targetId: 'section-order-manager' },
  { key: 'bestRatedProducts', label: 'Ən yüksək reytinqli məhsullar', ok: sectionOrder.value.includes('bestRatedProducts') && Boolean(homeStore.config?.bestRatedProducts?.enabled), targetId: 'section-order-manager' },
  { key: 'frequentlyBoughtTogether', label: 'Birlikdə tez-tez alınır', ok: sectionOrder.value.includes('frequentlyBoughtTogether') && Boolean(homeStore.config?.frequentlyBoughtTogether?.enabled), targetId: 'section-order-manager' },
  { key: 'bannerAfterTopProducts', label: 'Top Products sonrası bannerlar', ok: sectionOrder.value.includes('bannerAfterTopProducts') && bannerCounts.value.afterTopProducts > 0, targetId: 'section-order-manager' },
  { key: 'lookbook', label: 'Lookbook', ok: Array.isArray(lookbook.value?.blocks) && lookbook.value.blocks.length > 0, targetId: 'lookbook-ugc-editor' },
  { key: 'ugcShowcase', label: 'UGC vitrini', ok: Array.isArray(ugcShowcase.value?.cards) && ugcShowcase.value.cards.length > 0, targetId: 'lookbook-ugc-editor' },
  { key: 'promoStrip', label: 'Promo strip', ok: sectionOrder.value.includes('promoStrip') && bannerCounts.value.promoStrip > 0, targetId: 'section-order-manager' },
  { key: 'appPromo', label: 'App promo', ok: sectionOrder.value.includes('appPromo') && bannerCounts.value.appPromo, targetId: 'section-order-manager' }
])
const orderedPreviewRows = computed(() =>
  sectionOrder.value.map((sectionKey) => ({
    key: sectionKey,
    label: sectionLabels[sectionKey] || sectionKey,
    editorLabel: sectionEditorMeta[sectionKey]?.label || 'Bu blok ayrıca hissədən idarə olunur',
    targetId: sectionEditorMeta[sectionKey]?.targetId || '',
    ...(previewStateBySection.value[sectionKey] || { status: 'static' as const, detail: 'Order ilə idarə olunur' })
  }))
)

onMounted(async () => {
  await Promise.all([
    homeStore.fetchConfig(),
    productStore.fetchProducts(),
    bannerStore.fetchBanners(),
    settingsStore.fetchSettings()
  ])
  hydrate()
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] space-y-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Experience Builder</h1>
        <p class="mt-2 text-sm font-medium text-gray-500">Ana səhifənin kreativ bloklarını, audience layout-u və storytelling cərgələrini bu səhifədən idarə edin.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="saving" @click="save">
        <Save class="w-4 h-4" />
        {{ saving ? 'Yadda saxlanır...' : 'Yadda saxla' }}
      </button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[0.9fr,1.1fr] gap-6">
      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div class="text-lg font-extrabold text-gray-900">Audience layout</div>
        <select v-model="audienceMode" class="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-medium outline-none focus:border-blue-600">
          <option value="general">General</option>
          <option value="new">Yeni müştəri</option>
          <option value="returning">Qayıdan müştəri</option>
          <option value="vip">VIP</option>
        </select>
        <div id="section-order-manager" class="mt-6 text-lg font-extrabold text-gray-900">Section sırası</div>
        <div class="mt-2 text-sm font-medium text-gray-500">Buradan hansı blokların ana səhifədə görünəcəyini seç, sırasını dəyiş və istəmədiklərini sil.</div>
        <div class="mt-4 space-y-3">
          <div v-for="(sectionKey, index) in sectionOrder" :key="sectionKey + index" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm font-bold text-gray-700">{{ sectionLabels[sectionKey] || sectionKey }}</div>
                <div class="mt-1 text-xs font-medium text-gray-500">{{ sectionEditorMeta[sectionKey]?.label || 'Bu blok Experience Builder sırası ilə idarə olunur' }}</div>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="rounded-xl border border-gray-100 bg-white p-2" @click="moveSection(index, -1)"><ArrowUp class="w-4 h-4" /></button>
                <button type="button" class="rounded-xl border border-gray-100 bg-white p-2" @click="moveSection(index, 1)"><ArrowDown class="w-4 h-4" /></button>
                <button type="button" class="rounded-xl border border-red-100 bg-white p-2 text-red-600" @click="removeSection(sectionKey)"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
          <div class="text-sm font-extrabold text-blue-900">Əlavə edilə bilən bloklar</div>
          <div class="mt-2 text-xs font-medium text-blue-800">Aşağıdakı bloklar sırada yoxdursa buradan bir kliklə əlavə et.</div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="sectionKey in availableSections"
              :key="`available-${sectionKey}`"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-800"
              @click="addSection(sectionKey)"
            >
              <Plus class="w-3.5 h-3.5" />
              {{ sectionLabels[sectionKey] || sectionKey }}
            </button>
            <div v-if="!availableSections.length" class="text-xs font-semibold text-gray-500">Butun section-lar artıq sıradadır.</div>
          </div>
        </div>
        <div class="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div class="text-sm font-extrabold text-amber-800">Canlı preview checklist</div>
          <div class="mt-3 space-y-2">
            <div v-for="item in previewChecklist" :key="item.label" class="rounded-2xl border border-white/60 bg-white/70 px-3 py-3">
              <div class="flex items-center justify-between gap-4 text-sm">
                <span class="font-medium text-amber-900">{{ item.label }}</span>
                <span :class="item.ok ? 'text-emerald-600' : 'text-amber-700'" class="font-extrabold">{{ item.ok ? 'Hazır' : 'Boşdur' }}</span>
              </div>
              <div class="mt-2 flex items-center justify-between gap-3">
                <div class="text-xs font-medium text-amber-800">{{ sectionEditorMeta[item.key]?.label }}</div>
                <button type="button" class="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-800" @click="jumpToEditor(item.targetId)">
                  Düzənlə
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <div class="text-sm font-extrabold text-blue-900">Ana səhifədə görünəcək real sıra</div>
          <div class="mt-3 space-y-2">
            <div v-for="item in orderedPreviewRows" :key="item.key" class="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div :class="item.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : item.status === 'disabled' ? 'bg-slate-200 text-slate-600' : item.status === 'empty' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'" class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold">
                    {{ item.label.slice(0, 1) }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-extrabold text-gray-900">{{ item.label }}</div>
                    <div class="mt-1 line-clamp-1 text-xs font-semibold text-gray-500">{{ item.previewText }}</div>
                  </div>
                </div>
                <span
                  :class="item.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : item.status === 'disabled' ? 'bg-slate-200 text-slate-700' : item.status === 'empty' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'"
                  class="inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
                >
                  {{ item.status === 'ready' ? 'Canlı' : item.status === 'disabled' ? 'Gizlidir' : item.status === 'empty' ? 'Boş blok' : 'Auto' }}
                </span>
              </div>
              <div class="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">{{ item.badge }}</div>
                <div class="text-xs font-medium text-gray-500 text-right">{{ item.detail }}</div>
              </div>
              <div class="mt-2 flex items-center justify-between gap-3">
                <div class="text-xs font-semibold text-slate-600">{{ item.editorLabel }}</div>
                <button v-if="item.targetId" type="button" class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-700" @click="jumpToEditor(item.targetId)">
                  Ora keç
                </button>
              </div>
            </div>
          </div>
        </div>
        <div id="banner-manager" class="mt-6 rounded-2xl border border-fuchsia-100 bg-fuchsia-50/70 p-4">
          <div class="text-sm font-extrabold text-fuchsia-900">Banner hissələri</div>
          <div class="mt-2 text-xs font-medium text-fuchsia-800">Banner sahələri ayrıca banner/settings səhifələrindən idarə olunur, amma burada ümumi status və keçidlər görünür.</div>
          <div class="mt-4 space-y-3">
            <div v-for="item in bannerChecklist" :key="item.key" class="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <div class="text-sm font-extrabold text-gray-900">{{ item.label }}</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">{{ bannerEditorMeta[item.key]?.label }}</div>
                </div>
                <span :class="item.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'" class="inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]">
                  {{ item.ok ? 'Hazır' : 'Boşdur' }}
                </span>
              </div>
              <div class="mt-3 flex items-center justify-between gap-3">
                <div class="text-xs font-semibold text-fuchsia-700">
                  <template v-if="item.key === 'appPromo'">{{ bannerCounts.appPromo ? 'App promo aktivdir' : 'App promo hələ aktiv deyil' }}</template>
                  <template v-else>{{ bannerCounts[item.key] }} aktiv element</template>
                </div>
                <NuxtLink :to="bannerEditorMeta[item.key]?.href || '/admin/banners'" class="rounded-xl border border-fuchsia-200 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-fuchsia-800">
                  {{ bannerEditorMeta[item.key]?.button || 'Aç' }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div id="campaign-blocks-editor" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div class="text-lg font-extrabold text-gray-900">Kampaniya blokları</div>
            <button type="button" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-700" @click="addCampaignBlock">Əlavə et</button>
          </div>
          <div class="mt-5 space-y-4">
            <div v-for="(item, index) in campaignBlocks" :key="index" class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div class="flex items-center justify-between gap-3">
                <div class="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500">Kampaniya {{ index + 1 }}</div>
                <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-red-600" @click="removeCampaignBlock(index)">
                  <Trash2 class="w-3.5 h-3.5" />
                  Sil
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input v-model="item.titleI18n.az" type="text" placeholder="Başlıq (az)" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                <input v-model="item.ctaLabelI18n.az" type="text" placeholder="CTA (az)" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </div>
              <input v-model="item.subtitleI18n.az" type="text" placeholder="Alt mətn (az)" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select v-model="item.audience" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600">
                  <option value="all">All</option>
                  <option value="new">New</option>
                  <option value="returning">Returning</option>
                  <option value="vip">VIP</option>
                </select>
                <input v-model="item.href" type="text" placeholder="/shop" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                <input v-model="item.image" type="text" placeholder="Şəkil URL" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div id="storytelling-editor" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <div class="text-lg font-extrabold text-gray-900">Storytelling blokları</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div class="text-sm font-extrabold text-gray-900">Yeni gələnlər</div>
              <input v-model="story.newArrivals.titleI18n.az" type="text" placeholder="Başlıq" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <input v-model="story.newArrivals.subtitleI18n.az" type="text" placeholder="Alt mətn" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <input v-model.number="story.newArrivals.limit" type="number" min="1" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
            </div>
            <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div class="text-sm font-extrabold text-gray-900">Trenddə olanlar</div>
              <input v-model="story.trending.titleI18n.az" type="text" placeholder="Başlıq" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <input v-model="story.trending.subtitleI18n.az" type="text" placeholder="Alt mətn" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <input v-model.number="story.trending.limit" type="number" min="1" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div class="text-sm font-extrabold text-gray-900">Bu həftənin seçimi</div>
              <input v-model="story.weeklyPick.titleI18n.az" type="text" placeholder="Başlıq" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <div class="max-h-44 overflow-y-auto space-y-2">
                <label v-for="item in products" :key="item.id" class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2 text-sm font-medium text-gray-700">
                  <input :checked="story.weeklyPick.productIds.includes(item.id)" type="checkbox" @change="($event) => { const checked = ($event.target as HTMLInputElement).checked; story.weeklyPick.productIds = checked ? [...story.weeklyPick.productIds, item.id] : story.weeklyPick.productIds.filter((id: number) => id !== item.id) }" />
                  <span>{{ item.name }}</span>
                </label>
              </div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div class="text-sm font-extrabold text-gray-900">Redaktor seçimi</div>
              <input v-model="story.editorsPick.titleI18n.az" type="text" placeholder="Başlıq" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <div class="max-h-44 overflow-y-auto space-y-2">
                <label v-for="item in products" :key="`${item.id}-editor`" class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2 text-sm font-medium text-gray-700">
                  <input :checked="story.editorsPick.productIds.includes(item.id)" type="checkbox" @change="($event) => { const checked = ($event.target as HTMLInputElement).checked; story.editorsPick.productIds = checked ? [...story.editorsPick.productIds, item.id] : story.editorsPick.productIds.filter((id: number) => id !== item.id) }" />
                  <span>{{ item.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div id="lookbook-ugc-editor" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div class="text-lg font-extrabold text-gray-900">Lookbook & UGC</div>
            <Sparkles class="w-5 h-5 text-blue-600" />
          </div>
          <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-4">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-extrabold text-gray-900">Lookbook blokları</div>
                <button type="button" class="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700" @click="addLookbookBlock">Əlavə et</button>
              </div>
              <div v-for="(block, index) in lookbook.blocks" :key="index" class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500">Lookbook {{ index + 1 }}</div>
                  <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-red-600" @click="removeLookbookBlock(index)">
                    <Trash2 class="w-3.5 h-3.5" />
                    Sil
                  </button>
                </div>
                <input v-model="block.titleI18n.az" type="text" placeholder="Başlıq" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                <input v-model="block.subtitleI18n.az" type="text" placeholder="Alt mətn" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                <input v-model="block.image" type="text" placeholder="Şəkil URL" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-extrabold text-gray-900">UGC kartları</div>
                <button type="button" class="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700" @click="addUgcCard">Əlavə et</button>
              </div>
              <div v-for="(card, index) in ugcShowcase.cards" :key="index" class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500">UGC {{ index + 1 }}</div>
                  <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-red-600" @click="removeUgcCard(index)">
                    <Trash2 class="w-3.5 h-3.5" />
                    Sil
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input v-model="card.creator" type="text" placeholder="Creator" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                  <input v-model="card.handle" type="text" placeholder="@handle" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                </div>
                <input v-model="card.textI18n.az" type="text" placeholder="Mətn" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                <input v-model="card.image" type="text" placeholder="Şəkil URL" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
