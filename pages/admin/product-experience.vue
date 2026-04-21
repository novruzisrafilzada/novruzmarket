<script setup lang="ts">
import { ArrowLeft, ExternalLink, Save } from 'lucide-vue-next'
import { defaultProductExperienceSettings, useProductExperienceStore, type ProductExperienceSettings } from '~/stores/productExperience'
import { useProductStore } from '~/stores/products'
import { useAdminPortal } from '~/composables/useAdminPortal'

definePageMeta({ layout: 'admin' })

const productExperienceStore = useProductExperienceStore()
const productStore = useProductStore()
const toastStore = useToastStore()
const { adminPath } = useAdminPortal()
const { lang } = useT()

const saving = ref(false)
const loading = ref(true)
const form = ref<ProductExperienceSettings>(defaultProductExperienceSettings())

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))
const localized = (value: any) => String(value?.[lang.value as 'az' | 'ru' | 'en'] || value?.az || '')
const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

if (!productStore.hydrated || !productStore.products.length) {
  await productStore.fetchProducts()
}

const hydrate = async () => {
  loading.value = true
  try {
    await productExperienceStore.fetchConfig()
    form.value = clone(productExperienceStore.config)
  } finally {
    loading.value = false
  }
}

await hydrate()

const previewProducts = computed(() => productStore.products.filter((item: any) => !item?.status || item.status === 'Aktiv').slice(0, 4))
const previewProduct = computed(() => {
  const explicitId = Number(form.value.previewProductId || 0)
  return previewProducts.value.find((item: any) => Number(item.id) === explicitId) || previewProducts.value[0] || null
})
const utilityCardItems = computed(() => ([
  {
    key: 'eta',
    label: 'Çatdırılma ETA yoxlaması',
    enabled: form.value.utilityCards.eta.enabled,
    placement: form.value.utilityCards.eta.placement
  },
  {
    key: 'policies',
    label: 'Çatdırılma və qaydalar',
    enabled: form.value.utilityCards.policies.enabled,
    placement: form.value.utilityCards.policies.placement
  },
  {
    key: 'priceAlert',
    label: 'Qiymət və stok bildirişi',
    enabled: form.value.utilityCards.priceAlert.enabled,
    placement: form.value.utilityCards.priceAlert.placement
  }
]))
const utilityCardsTopPreview = computed(() => utilityCardItems.value.filter((item) => item.enabled && item.placement === 'top'))
const utilityCardsBottomPreview = computed(() => utilityCardItems.value.filter((item) => item.enabled && item.placement === 'bottom'))

const addQuestion = () => {
  form.value.questions.push({
    id: makeId('question'),
    productIds: previewProduct.value ? [Number(previewProduct.value.id)] : [],
    question: { az: '', ru: '', en: '' },
    answer: { az: '', ru: '', en: '' },
    helpfulCount: 0
  })
}

const removeQuestion = (id: string) => {
  form.value.questions = form.value.questions.filter((item) => item.id !== id)
}

const addSpecCard = () => {
  form.value.specCards.push({
    id: makeId('spec'),
    enabled: true,
    icon: 'Sparkles',
    title: { az: '', ru: '', en: '' },
    description: { az: '', ru: '', en: '' }
  })
}

const removeSpecCard = (id: string) => {
  form.value.specCards = form.value.specCards.filter((item) => item.id !== id)
}

const save = async () => {
  saving.value = true
  try {
    await productExperienceStore.saveConfig(form.value)
    form.value = clone(productExperienceStore.config)
    toastStore.success('Product experience yeniləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Product experience yadda saxlanılmadı')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div class="text-3xl font-extrabold text-gray-900">Product Experience</div>
        <div class="mt-2 text-sm font-medium text-gray-500">Məhsul səhifəsində görünən əsas section-ları buradan canlı preview ilə idarə et.</div>
      </div>
      <div class="flex flex-wrap gap-3">
        <NuxtLink :to="adminPath('products')" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-all hover:border-blue-200 hover:text-blue-700">
          <ArrowLeft class="h-4 w-4" />
          Məhsullara qayıt
        </NuxtLink>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-60" :disabled="saving || loading" @click="save">
          <Save class="h-4 w-4" />
          {{ saving ? 'Yadda saxlanır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="rounded-[2rem] border border-gray-100 bg-white p-8 text-sm font-bold text-gray-400 shadow-sm">
      Yüklənir...
    </div>

    <template v-else>
      <div class="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
        <div class="space-y-6">
          <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div class="text-lg font-extrabold text-gray-900">Preview məhsulu</div>
            <div class="mt-1 text-sm font-medium text-gray-500">Admin-də seçdiyin məhsul preview kart və section mock-larda görünür.</div>
            <select v-model="form.previewProductId" class="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-medium text-gray-800 outline-none transition-all focus:border-blue-600 focus:bg-white">
              <option :value="null">Avtomatik ilk məhsul</option>
              <option v-for="item in previewProducts" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </div>

          <div class="grid gap-5">
            <div v-for="section in form.sections" :key="section.key" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">{{ section.key }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-500">Bu bölmə storefront PDP-də real olaraq açılıb-bağlanır.</div>
                </div>
                <label class="inline-flex cursor-pointer items-center">
                  <input v-model="section.enabled" type="checkbox" class="peer sr-only" />
                  <div class="relative h-7 w-12 rounded-full bg-gray-200 transition-all peer-checked:bg-blue-600">
                    <div class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-all" :class="section.enabled ? 'translate-x-5' : ''"></div>
                  </div>
                </label>
              </div>
              <div class="mt-5 grid gap-4 md:grid-cols-3">
                <div class="space-y-2">
                  <label class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Badge</label>
                  <input v-model="section.badge[lang]" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue-600 focus:bg-white" />
                </div>
                <div class="space-y-2 md:col-span-2">
                  <label class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Başlıq</label>
                  <input v-model="section.title[lang]" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue-600 focus:bg-white" />
                </div>
                <div class="space-y-2 md:col-span-3">
                  <label class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Alt başlıq</label>
                  <textarea v-model="section.subtitle[lang]" rows="3" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue-600 focus:bg-white"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[2rem] border border-violet-100 bg-violet-50/60 p-6 shadow-sm">
            <div class="text-lg font-extrabold text-gray-900">Media Layer</div>
            <div class="mt-1 text-sm font-medium text-gray-500">Zoom, video, 360 və variation media davranışını buradan idarə et.</div>
            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Zoom aktiv</span><input v-model="form.media.enableZoom" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Video aktiv</span><input v-model="form.media.enableVideo" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>360 baxış aktiv</span><input v-model="form.media.enable360" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Variation media aktiv</span><input v-model="form.media.enableVariationMedia" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700 md:col-span-2"><span>Lifestyle strip aktiv</span><input v-model="form.media.enableLifestyleStrip" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="space-y-2 md:col-span-2">
                <div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Demo video URL</div>
                <input v-model="form.media.demoVideoUrl" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </label>
              <label class="space-y-2 md:col-span-2">
                <div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Video poster</div>
                <input v-model="form.media.demoVideoPoster" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </label>
            </div>
          </div>

          <div class="rounded-[2rem] border border-amber-100 bg-amber-50/60 p-6 shadow-sm">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div class="text-lg font-extrabold text-gray-900">Buy Box & Bundle</div>
                <div class="mt-1 text-sm font-medium text-gray-500">İndi al, hissəli ödəniş, kupon və bundle CTA-larını idarə et.</div>
              </div>
              <label class="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-sm">
                <span class="text-sm font-extrabold text-gray-800">
                  İndi al: {{ form.buyBox.enableBuyNow ? 'Aktiv' : 'Deaktiv' }}
                </span>
                <input v-model="form.buyBox.enableBuyNow" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
              </label>
            </div>
            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>İndi al düyməsi</span><input v-model="form.buyBox.enableBuyNow" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Variation summary aktiv</span><input v-model="form.buyBox.enableVariationSummary" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Installment aktiv</span><input v-model="form.buyBox.enableInstallments" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="space-y-2">
                <div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Ay sayı</div>
                <input v-model.number="form.buyBox.installmentMonths" type="number" min="2" max="24" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </label>
              <label class="space-y-2">
                <div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Installment label</div>
                <input v-model="form.buyBox.installmentLabel[lang]" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Kupon blokunu göstər</span><input v-model="form.buyBox.enableCoupon" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="space-y-2">
                <div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Kupon kodu</div>
                <input v-model="form.buyBox.couponCode" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </label>
              <label class="space-y-2 md:col-span-2">
                <div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Kupon mətni</div>
                <input v-model="form.buyBox.couponLabel[lang]" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Bundle seçim</span><input v-model="form.bundle.enableSelection" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Bundle add all</span><input v-model="form.bundle.enableAddAll" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700 md:col-span-2"><span>Bundle toplamını göstər</span><input v-model="form.bundle.showTotal" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
            </div>
          </div>

          <div class="rounded-[2rem] border border-indigo-100 bg-indigo-50/60 p-6 shadow-sm">
            <div class="text-lg font-extrabold text-gray-900">PDP utility blokları</div>
            <div class="mt-1 text-sm font-medium text-gray-500">ETA, qaydalar və qiymət/stok bildirişini yuxarıda və ya aşağıda göstər, istəsən tam söndür.</div>
            <div class="mt-5 grid gap-4">
              <div class="rounded-[1.5rem] border border-white bg-white p-4">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <div class="text-sm font-extrabold text-gray-900">Çatdırılma ETA yoxlaması</div>
                    <div class="mt-1 text-xs font-medium text-gray-500">Şəhərə görə çatdırılma müddəti bloku.</div>
                  </div>
                  <input v-model="form.utilityCards.eta.enabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
                </div>
                <select v-model="form.utilityCards.eta.placement" class="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="top">Yuxarıda göstər</option>
                  <option value="bottom">Aşağıda göstər</option>
                </select>
              </div>
              <div class="rounded-[1.5rem] border border-white bg-white p-4">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <div class="text-sm font-extrabold text-gray-900">Çatdırılma və qaydalar</div>
                    <div class="mt-1 text-xs font-medium text-gray-500">Policy accordion hissəsi.</div>
                  </div>
                  <input v-model="form.utilityCards.policies.enabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
                </div>
                <select v-model="form.utilityCards.policies.placement" class="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="top">Yuxarıda göstər</option>
                  <option value="bottom">Aşağıda göstər</option>
                </select>
              </div>
              <div class="rounded-[1.5rem] border border-white bg-white p-4">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <div class="text-sm font-extrabold text-gray-900">Qiymət və stok bildirişi</div>
                    <div class="mt-1 text-xs font-medium text-gray-500">Qiymət enişi və restock bildirişi formu.</div>
                  </div>
                  <input v-model="form.utilityCards.priceAlert.enabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
                </div>
                <select v-model="form.utilityCards.priceAlert.placement" class="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="top">Yuxarıda göstər</option>
                  <option value="bottom">Aşağıda göstər</option>
                </select>
              </div>
            </div>
          </div>

          <div class="rounded-[2rem] border border-blue-100 bg-blue-50/60 p-6 shadow-sm">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div class="text-lg font-extrabold text-gray-900">Popup məlumat blokları</div>
                <div class="mt-1 text-sm font-medium text-gray-500">PDP-də altda açılan çatdırılma, zəmanət və ödəniş popup blokları ayrıca `Məhsul səhifəsi blokları` səhifəsindən idarə olunur.</div>
              </div>
              <NuxtLink :to="adminPath('product-info-blocks')" class="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition-all hover:bg-blue-100">
                Blokları aç
                <ExternalLink class="h-4 w-4" />
              </NuxtLink>
            </div>
            <div class="mt-4 rounded-[1.5rem] border border-white bg-white px-4 py-4 text-sm font-medium text-gray-600">
              `Sections` hissəsində `infoBlocks` aktivdirsə və `Admin > Məhsul səhifəsi blokları` içində bloklar aktivdirsə, storefront-da həmin popup hissələr görünür.
            </div>
          </div>

          <div class="rounded-[2rem] border border-sky-100 bg-sky-50/60 p-6 shadow-sm">
            <div class="text-lg font-extrabold text-gray-900">Seller Trust & Reviews</div>
            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700 md:col-span-2"><span>Seller trust bloku aktiv</span><input v-model="form.sellerTrust.enabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Trust badge</div><input v-model="form.sellerTrust.badge[lang]" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" /></label>
              <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Trust title</div><input v-model="form.sellerTrust.title[lang]" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" /></label>
              <label class="space-y-2 md:col-span-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Trust subtitle</div><textarea v-model="form.sellerTrust.subtitle[lang]" rows="2" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600"></textarea></label>
              <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Response text</div><input v-model="form.sellerTrust.responseTime[lang]" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" /></label>
              <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Origin text</div><input v-model="form.sellerTrust.originLabel[lang]" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Review summary</span><input v-model="form.reviews.showSummary" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Review breakdown</span><input v-model="form.reviews.showBreakdown" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Review sort</span><input v-model="form.reviews.showSort" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700"><span>Photo review rail</span><input v-model="form.reviews.showPhotoRail" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="space-y-2 md:col-span-2">
                <div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Default sort</div>
                <select v-model="form.reviews.defaultSort" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600">
                  <option value="newest">Newest</option>
                  <option value="highest">Highest</option>
                  <option value="lowest">Lowest</option>
                  <option value="verified">Verified</option>
                </select>
              </label>
            </div>
          </div>

          <div class="rounded-[2rem] border border-emerald-100 bg-emerald-50/60 p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-lg font-extrabold text-gray-900">Product Q&amp;A</div>
                <div class="mt-1 text-sm font-medium text-gray-500">Məhsula bağlı real sual-cavab item-lərini idarə et.</div>
              </div>
              <button type="button" class="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white" @click="addQuestion">Sual əlavə et</button>
            </div>
            <div class="mt-5 space-y-4">
              <div v-for="question in form.questions" :key="question.id" class="rounded-[1.5rem] border border-white bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm font-extrabold text-gray-900">{{ localized(question.question) || 'Yeni sual' }}</div>
                  <button type="button" class="text-xs font-extrabold uppercase tracking-[0.18em] text-red-500" @click="removeQuestion(question.id)">Sil</button>
                </div>
                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  <label class="space-y-2 md:col-span-2">
                    <div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Məhsullar</div>
                    <select v-model="question.productIds" multiple class="min-h-[120px] w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                      <option v-for="item in previewProducts" :key="`q-${question.id}-${item.id}`" :value="item.id">{{ item.name }}</option>
                    </select>
                  </label>
                  <label class="space-y-2 md:col-span-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Sual</div><input v-model="question.question[lang]" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" /></label>
                  <label class="space-y-2 md:col-span-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Cavab</div><textarea v-model="question.answer[lang]" rows="3" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white"></textarea></label>
                  <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Helpful</div><input v-model.number="question.helpfulCount" type="number" min="0" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" /></label>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[2rem] border border-rose-100 bg-rose-50/60 p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-lg font-extrabold text-gray-900">Premium Specs kartları</div>
                <div class="mt-1 text-sm font-medium text-gray-500">“Kim üçündür”, “Niyə bunu alım” kimi kartları buradan idarə et.</div>
              </div>
              <button type="button" class="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-extrabold text-white" @click="addSpecCard">Kart əlavə et</button>
            </div>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <label class="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-gray-700 md:col-span-2"><span>Specs section aktiv</span><input v-model="form.specs.enabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" /></label>
              <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Badge</div><input v-model="form.specs.badge[lang]" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" /></label>
              <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Title</div><input v-model="form.specs.title[lang]" type="text" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" /></label>
              <label class="space-y-2 md:col-span-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Subtitle</div><textarea v-model="form.specs.subtitle[lang]" rows="2" class="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600"></textarea></label>
            </div>
            <div class="mt-5 space-y-4">
              <div v-for="card in form.specCards" :key="card.id" class="rounded-[1.5rem] border border-white bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm font-extrabold text-gray-900">{{ localized(card.title) || 'Yeni kart' }}</div>
                  <div class="flex items-center gap-4">
                    <label class="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-gray-500">
                      <span>{{ card.enabled !== false ? 'Aktiv' : 'Deaktiv' }}</span>
                      <input v-model="card.enabled" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600" />
                    </label>
                    <button type="button" class="text-xs font-extrabold uppercase tracking-[0.18em] text-red-500" @click="removeSpecCard(card.id)">Sil</button>
                  </div>
                </div>
                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Icon</div><select v-model="card.icon" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white"><option value="Sparkles">Sparkles</option><option value="BadgeCheck">BadgeCheck</option><option value="ShieldCheck">ShieldCheck</option><option value="Truck">Truck</option><option value="Store">Store</option></select></label>
                  <label class="space-y-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Title</div><input v-model="card.title[lang]" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" /></label>
                  <label class="space-y-2 md:col-span-2"><div class="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">Description</div><textarea v-model="card.description[lang]" rows="3" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white"></textarea></label>
                </div>
              </div>
            </div>

          <div class="rounded-[2rem] border border-rose-100 bg-rose-50/40 p-6 shadow-sm">
            <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-rose-600">Specs Preview</div>
            <div class="mt-2 text-lg font-extrabold text-gray-900">Why Buy kartları</div>
            <div class="mt-4 grid gap-3">
              <div v-for="card in form.specCards" :key="`preview-${card.id}`" class="rounded-[1.4rem] border px-4 py-4 transition-all" :class="card.enabled !== false ? 'border-rose-100 bg-white' : 'border-gray-200 bg-gray-50 opacity-55'">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm font-extrabold text-gray-900">{{ localized(card.title) || 'Yeni kart' }}</div>
                  <span class="rounded-full px-3 py-1 text-[11px] font-extrabold" :class="card.enabled !== false ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-white text-gray-400 border border-gray-200'">
                    {{ card.enabled !== false ? 'Aktiv' : 'Deaktiv' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">Canlı Preview</div>
            <div class="mt-2 text-lg font-extrabold text-gray-900">Storefront məhsul təcrübəsi</div>
            <div class="mt-2 text-sm font-medium text-gray-500">Aşağıdakı görünüş admin-də etdiyin section dəyişikliklərini dərhal göstərir.</div>
            <div v-if="previewProduct" class="mt-6">
              <ProductCard :product="previewProduct" />
            </div>
          </div>

          <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div class="space-y-4">
              <div v-for="section in form.sections" :key="`preview-${section.key}`" class="rounded-[1.6rem] border p-5 transition-all" :class="section.enabled ? 'border-blue-100 bg-blue-50/40' : 'border-gray-100 bg-gray-50 opacity-60'">
                <div class="text-[11px] font-extrabold uppercase tracking-[0.22em]" :class="section.enabled ? 'text-blue-600' : 'text-gray-400'">{{ localized(section.badge) || section.key }}</div>
                <div class="mt-2 text-lg font-extrabold text-gray-900">{{ localized(section.title) || section.key }}</div>
                <div class="mt-2 text-sm font-medium text-gray-500">{{ localized(section.subtitle) }}</div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="section.enabled ? 'bg-white text-blue-700 border border-blue-100' : 'bg-white text-gray-400 border border-gray-200'">
                    {{ section.enabled ? 'Storefront-da aktiv' : 'Storefront-da gizlidir' }}
                  </span>
                  <span class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-500">{{ section.key }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[2rem] border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
            <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-indigo-600">Layout Preview</div>
            <div class="mt-2 text-lg font-extrabold text-gray-900">Utility blokların yerləşimi</div>
            <div class="mt-4 rounded-[1.5rem] border border-white bg-white p-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Yuxarı hissə</div>
              <div v-if="utilityCardsTopPreview.length" class="mt-3 flex flex-wrap gap-2">
                <span v-for="item in utilityCardsTopPreview" :key="`top-${item.key}`" class="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-700">
                  {{ item.label }}
                </span>
              </div>
              <div v-else class="mt-3 text-sm font-medium text-gray-400">Yuxarı hissədə aktiv blok yoxdur.</div>
            </div>
            <div class="mt-4 rounded-[1.5rem] border border-white bg-white p-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Aşağı hissə</div>
              <div v-if="utilityCardsBottomPreview.length" class="mt-3 flex flex-wrap gap-2">
                <span v-for="item in utilityCardsBottomPreview" :key="`bottom-${item.key}`" class="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                  {{ item.label }}
                </span>
              </div>
              <div v-else class="mt-3 text-sm font-medium text-gray-400">Aşağı hissədə aktiv blok yoxdur.</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
