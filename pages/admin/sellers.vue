<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, Store, Boxes, Package, Crown, CreditCard, Save, ImagePlus, Check, X, FileText, UploadCloud, Trash2 } from 'lucide-vue-next'
import { cropImageFile, uploadPreparedImage } from '~/utils/seller-media'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const categoryStore = useCategoryStore()
const toastStore = useToastStore()
const query = ref('')
const sellers = ref<any[]>([])
const requests = ref<any[]>([])
const productRequests = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const processingId = ref<string | null>(null)
const sellerEditorOpen = ref(false)
const sellerEditor = ref<any | null>(null)
const settingsForm = ref({
  sectionEnabled: true,
  sectionLabel: 'Satıcılar',
  sectionTitleAz: 'Satıcılar',
  sectionSubtitleAz: 'Platformada önə çıxan mağazalar',
  sectionCtaAz: 'Hamısına bax',
  sectionLimit: 4,
  featuredBadgeText: 'PRO',
  paymentReceiverName: '',
  paymentReceiverCard: '',
  paymentReceiverBank: '',
  paymentInstructions: '',
  plans: [
    { days: 1, label: '1 gün', price: 5, enabled: true },
    { days: 3, label: '3 gün', price: 12, enabled: true },
    { days: 7, label: '7 gün', price: 25, enabled: true },
    { days: 15, label: '15 gün', price: 45, enabled: true },
    { days: 30, label: '1 ay', price: 75, enabled: true }
  ] as any[]
})

const filteredSellers = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return sellers.value
  return sellers.value.filter((seller) =>
    String(seller.shopName || '').toLowerCase().includes(q) ||
    String(seller.name || '').toLowerCase().includes(q) ||
    String(seller.email || '').toLowerCase().includes(q)
  )
})

const sellerCategoryOptions = computed(() =>
  categoryStore.categories
    .filter((category) => category.parentId === null)
    .map((category) => ({
      id: category.id,
      label: category.nameI18n.az || category.slug,
      image: category.image || ''
    }))
)

const syncSettingsForm = () => {
  const cfg = settingsStore.settings.sellerPromotion
  settingsForm.value = {
    sectionEnabled: Boolean(cfg?.sectionEnabled),
    sectionLabel: String(cfg?.sectionLabel || 'Satıcılar'),
    sectionTitleAz: String(cfg?.sectionTitle?.az || 'Satıcılar'),
    sectionSubtitleAz: String(cfg?.sectionSubtitle?.az || 'Platformada önə çıxan mağazalar'),
    sectionCtaAz: String(cfg?.sectionCta?.az || 'Hamısına bax'),
    sectionLimit: Number(cfg?.sectionLimit || 4),
    featuredBadgeText: String(cfg?.featuredBadgeText || 'PRO'),
    paymentReceiverName: String(cfg?.paymentReceiverName || ''),
    paymentReceiverCard: String(cfg?.paymentReceiverCard || ''),
    paymentReceiverBank: String(cfg?.paymentReceiverBank || ''),
    paymentInstructions: String(cfg?.paymentInstructions || ''),
    plans: Array.isArray(cfg?.plans) ? cfg.plans.map((plan: any) => ({ ...plan })) : []
  }
}

const loadAll = async () => {
  loading.value = true
  try {
    await Promise.all([
      settingsStore.fetchSettings(),
      categoryStore.fetchCategories()
    ])
    syncSettingsForm()
    const [sellerRes, requestRes, productRequestRes] = await Promise.all([
      $fetch('/api/sellers'),
      $fetch('/api/admin/seller-featured-requests'),
      $fetch('/api/admin/product-featured-requests')
    ])
    sellers.value = sellerRes as any[]
    requests.value = requestRes as any[]
    productRequests.value = productRequestRes as any[]
  } finally {
    loading.value = false
  }
}

const toggleSellerCategory = (seller: any, categoryId: number) => {
  const currentIds = Array.isArray(seller.categoryIds) ? seller.categoryIds.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value)) : []
  seller.categoryIds = currentIds.includes(categoryId)
    ? currentIds.filter((id: number) => id !== categoryId)
    : [...currentIds, categoryId]
}

const uploadSellerImage = async (seller: any, event: Event, kind: 'profile' | 'cover' = 'profile') => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  processingId.value = `upload-${seller.id}-${kind}`
  try {
    const prepared = await cropImageFile(file, kind === 'profile' ? { width: 720, height: 720 } : { width: 1600, height: 620 })
    const res = await uploadPreparedImage(prepared.file)
    if (kind === 'profile') {
      seller.profileImage = res.url
      seller.profilePreview = prepared.previewUrl
    } else {
      seller.coverImage = res.url
      seller.coverPreview = prepared.previewUrl
    }
    toastStore.success(kind === 'profile' ? 'Profil şəkli yükləndi' : 'Cover şəkli yükləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Şəkil yüklənmədi')
  } finally {
    processingId.value = null
    input.value = ''
  }
}

const addVerificationDocument = () => {
  if (!sellerEditor.value) return
  const docs = Array.isArray(sellerEditor.value.verificationDocuments) ? sellerEditor.value.verificationDocuments : []
  docs.push({
    id: `${sellerEditor.value.id}-doc-${Date.now()}`,
    title: '',
    url: '',
    status: 'pending',
    uploadedAt: new Date().toISOString(),
    reviewedAt: '',
    reviewedBy: '',
    note: ''
  })
  sellerEditor.value.verificationDocuments = docs
}

const removeVerificationDocument = (idx: number) => {
  if (!sellerEditor.value || !Array.isArray(sellerEditor.value.verificationDocuments)) return
  sellerEditor.value.verificationDocuments.splice(idx, 1)
}

const uploadVerificationDocument = async (event: Event, idx: number) => {
  if (!sellerEditor.value) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  processingId.value = `upload-doc-${sellerEditor.value.id}-${idx}`
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: form
    })
    if (!Array.isArray(sellerEditor.value.verificationDocuments)) sellerEditor.value.verificationDocuments = []
    if (!sellerEditor.value.verificationDocuments[idx]) addVerificationDocument()
    const current = sellerEditor.value.verificationDocuments[idx]
    current.url = res.url
    current.title = current.title || file.name
    current.uploadedAt = current.uploadedAt || new Date().toISOString()
    toastStore.success('Sənəd yükləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Sənəd yüklənmədi')
  } finally {
    processingId.value = null
    input.value = ''
  }
}

const saveSellerProfile = async (seller: any) => {
  processingId.value = `save-${seller.id}`
  try {
    await $fetch(`/api/admin/sellers/${seller.id}`, {
      method: 'PUT',
      body: {
        sellerProfile: {
          shopName: seller.shopName,
          phone: seller.phone,
          note: seller.note,
          profileImage: seller.profileImage,
          coverImage: seller.coverImage,
          categoryIds: seller.categoryIds || [],
          tagline: seller.tagline,
          storefrontLayout: seller.storefrontLayout,
          themeColor: seller.themeColor,
          campaignHeadline: seller.campaignHeadline,
          heroLabel: seller.heroLabel,
          verifiedStatus: seller.verifiedStatus,
          verifiedAt: seller.verifiedAt,
          verifiedByName: seller.verifiedByName,
          verifiedNote: seller.verifiedNote,
          verificationHistory: Array.isArray(seller.verificationHistory) ? seller.verificationHistory.map((item: any) => ({ ...item })) : [],
          verificationDocuments: Array.isArray(seller.verificationDocuments) ? seller.verificationDocuments.map((item: any) => ({ ...item })) : []
        }
      }
    })
    await loadAll()
    toastStore.success('Satıcı profili yeniləndi')
    return true
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Satıcı profili yenilənmədi')
    return false
  } finally {
    processingId.value = null
  }
}

const openSellerEditor = (seller: any) => {
  sellerEditor.value = {
    ...seller,
    profilePreview: seller.profileImage || '',
    coverPreview: seller.coverImage || '',
    verificationDocuments: Array.isArray(seller.verificationDocuments) ? seller.verificationDocuments.map((item: any) => ({ ...item })) : []
  }
  sellerEditorOpen.value = true
}

const closeSellerEditor = () => {
  sellerEditorOpen.value = false
  sellerEditor.value = null
}

const saveSellerEditor = async () => {
  if (!sellerEditor.value) return
  const success = await saveSellerProfile(sellerEditor.value)
  if (success) closeSellerEditor()
}

const savePromotionSettings = async () => {
  saving.value = true
  try {
    settingsStore.settings = {
      ...settingsStore.settings,
      sellerPromotion: {
        ...settingsStore.settings.sellerPromotion,
        sectionEnabled: settingsForm.value.sectionEnabled,
        sectionLabel: settingsForm.value.sectionLabel,
        sectionTitle: {
          az: settingsForm.value.sectionTitleAz,
          ru: settingsForm.value.sectionTitleAz,
          en: settingsForm.value.sectionTitleAz
        },
        sectionSubtitle: {
          az: settingsForm.value.sectionSubtitleAz,
          ru: settingsForm.value.sectionSubtitleAz,
          en: settingsForm.value.sectionSubtitleAz
        },
        sectionCta: {
          az: settingsForm.value.sectionCtaAz,
          ru: settingsForm.value.sectionCtaAz,
          en: settingsForm.value.sectionCtaAz
        },
        sectionLimit: Number(settingsForm.value.sectionLimit || 4),
        featuredBadgeText: settingsForm.value.featuredBadgeText,
        paymentReceiverName: settingsForm.value.paymentReceiverName,
        paymentReceiverCard: settingsForm.value.paymentReceiverCard,
        paymentReceiverBank: settingsForm.value.paymentReceiverBank,
        paymentInstructions: settingsForm.value.paymentInstructions,
        plans: settingsForm.value.plans.map((plan) => ({
          days: Number(plan.days || 0),
          label: String(plan.label || `${plan.days} gün`),
          price: Number(plan.price || 0),
          enabled: Boolean(plan.enabled)
        }))
      }
    }
    await settingsStore.saveSettings()
    toastStore.success('Satıcı önə çıxarma ayarları yadda saxlandı')
  } catch {
    toastStore.error('Ayarlar yadda saxlanmadı')
  } finally {
    saving.value = false
  }
}

const updateRequestStatus = async (requestId: number, status: 'Təsdiqləndi' | 'Rədd edildi') => {
  processingId.value = `seller-${requestId}`
  try {
    await $fetch(`/api/admin/seller-featured-requests/${requestId}`, {
      method: 'PUT',
      body: {
        status
      }
    })
    await loadAll()
    toastStore.success(`Sorğu ${status === 'Təsdiqləndi' ? 'təsdiqləndi' : 'rədd edildi'}`)
  } catch {
    toastStore.error('Sorğu yenilənmədi')
  } finally {
    processingId.value = null
  }
}

const updateProductRequestStatus = async (requestId: number, status: 'Təsdiqləndi' | 'Rədd edildi') => {
  processingId.value = `product-${requestId}`
  try {
    await $fetch(`/api/admin/product-featured-requests/${requestId}`, {
      method: 'PUT',
      body: { status }
    })
    await loadAll()
    toastStore.success(`Məhsul sorğusu ${status === 'Təsdiqləndi' ? 'təsdiqləndi' : 'rədd edildi'}`)
  } catch {
    toastStore.error('Məhsul sorğusu yenilənmədi')
  } finally {
    processingId.value = null
  }
}

onMounted(async () => {
  await loadAll()
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Satıcılar</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Platformada qeydiyyatdan keçmiş bütün satıcıları və mağazalarını buradan izləyin.</p>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input v-model="query" type="text" placeholder="Satıcı və ya mağaza axtar..." class="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <div class="text-sm font-bold text-gray-500">{{ filteredSellers.length }} satıcı</div>
      </div>

      <div v-if="loading" class="p-10 text-sm font-medium text-gray-500">Yüklənir...</div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6 p-8">
        <div v-for="seller in filteredSellers" :key="seller.id" class="border border-gray-100 rounded-[1.75rem] p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.24em] text-blue-600">{{ settingsForm.sectionLabel || 'Satıcılar' }}</div>
              <div class="mt-2 text-2xl font-extrabold text-gray-900">{{ seller.shopName }}</div>
              <div class="mt-2 text-sm font-medium text-gray-500">{{ seller.name }}</div>
              <div class="mt-1 text-xs font-medium text-gray-400">{{ seller.email }}</div>
            </div>
            <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden border border-blue-100">
              <img v-if="seller.profileImage" :src="seller.profileImage" alt="" class="w-full h-full object-cover" />
              <Store v-else class="w-7 h-7" />
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <div class="rounded-2xl bg-gray-50 px-4 py-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Məhsul</div>
              <div class="mt-2 text-2xl font-extrabold text-gray-900 inline-flex items-center gap-2"><Package class="w-5 h-5 text-blue-600" /> {{ seller.productCount }}</div>
            </div>
            <div class="rounded-2xl bg-gray-50 px-4 py-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Stok</div>
              <div class="mt-2 text-2xl font-extrabold text-gray-900 inline-flex items-center gap-2"><Boxes class="w-5 h-5 text-emerald-600" /> {{ seller.stockTotal }}</div>
            </div>
          </div>

          <div class="mt-5 flex items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', seller.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
                {{ seller.status }}
              </span>
              <span v-if="seller.isFeatured" class="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                <Crown class="w-3 h-3" />
                {{ seller.featuredBadgeText || 'PRO' }}
              </span>
            </div>
            <div class="flex items-center gap-4">
              <button type="button" class="text-sm font-extrabold text-emerald-600 hover:underline" @click="openSellerEditor(seller)">
                Popup redaktə
              </button>
              <NuxtLink :to="`/sellers/${seller.id}`" class="text-sm font-extrabold text-blue-600 hover:underline">
                Mağazaya bax
              </NuxtLink>
            </div>
          </div>

          <div class="mt-6 rounded-[1.5rem] border border-gray-100 bg-gray-50/70 overflow-hidden">
            <div class="h-28 bg-gradient-to-r from-slate-100 to-blue-50">
              <img v-if="seller.coverImage" :src="seller.coverImage" alt="" class="w-full h-full object-cover" />
            </div>
            <div class="p-5">
              <div class="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-400">Mağaza qeydi</div>
              <div class="mt-2 text-sm font-medium text-gray-600 line-clamp-3">{{ seller.note || 'Qeyd əlavə edilməyib' }}</div>
              <div class="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-gray-400">Satış kateqoriyaları</div>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="category in sellerCategoryOptions.filter((item) => Array.isArray(seller.categoryIds) && seller.categoryIds.includes(item.id))"
                  :key="`${seller.id}-${category.id}`"
                  class="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700"
                >
                  <span class="w-6 h-6 rounded-full overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                    <img v-if="category.image" :src="category.image" alt="" class="w-full h-full object-cover" />
                    <Store v-else class="w-3 h-3 text-gray-400" />
                  </span>
                  {{ category.label }}
                </span>
                <span v-if="!sellerCategoryOptions.some((item) => Array.isArray(seller.categoryIds) && seller.categoryIds.includes(item.id))" class="inline-flex items-center rounded-full bg-white border border-gray-200 px-3 py-2 text-xs font-bold text-gray-500">
                  Kateqoriya seçilməyib
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 2xl:grid-cols-[1.1fr,0.9fr] gap-8">
      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50">
          <div class="flex items-center gap-3">
            <CreditCard class="w-5 h-5 text-blue-600" />
            <h2 class="text-2xl font-extrabold text-gray-900">Önə çıxarma ayarları</h2>
          </div>
        </div>
        <div class="p-8 space-y-5">
          <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
            <div>
              <div class="text-sm font-bold text-gray-900">Ana səhifədə bölmə aktiv olsun</div>
              <div class="text-xs font-medium text-gray-500 mt-1">Satıcılar / Mağazalar hissəsi göstərilsin.</div>
            </div>
            <input v-model="settingsForm.sectionEnabled" type="checkbox" class="w-5 h-5" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input v-model="settingsForm.sectionLabel" type="text" placeholder="Bölmə qısa adı" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
            <input v-model="settingsForm.sectionTitleAz" type="text" placeholder="Ana başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-[1fr,180px] gap-4">
            <input v-model="settingsForm.sectionSubtitleAz" type="text" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
            <input v-model.number="settingsForm.sectionLimit" type="number" min="1" max="12" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input v-model="settingsForm.sectionCtaAz" type="text" placeholder="CTA mətn" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
            <input v-model="settingsForm.featuredBadgeText" type="text" placeholder="Badge mətn" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input v-model="settingsForm.paymentReceiverName" type="text" placeholder="Ödəniş alan şəxs / şirkət" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
            <input v-model="settingsForm.paymentReceiverCard" type="text" placeholder="Kart və ya hesab nömrəsi" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
            <input v-model="settingsForm.paymentReceiverBank" type="text" placeholder="Bank / qeyd" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
          </div>
          <textarea v-model="settingsForm.paymentInstructions" rows="4" placeholder="Satıcıya görünəcək ödəniş təlimatı" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium resize-none"></textarea>

          <div class="rounded-[1.75rem] border border-gray-100 p-5">
            <div class="text-sm font-extrabold text-gray-900">Plan qiymətləri</div>
            <div class="mt-4 space-y-3">
              <div v-for="plan in settingsForm.plans" :key="plan.days" class="grid grid-cols-1 md:grid-cols-[120px,1fr,120px,90px] gap-3">
                <input v-model.number="plan.days" type="number" min="1" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium" />
                <input v-model="plan.label" type="text" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium" />
                <input v-model.number="plan.price" type="number" min="0" step="0.01" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium" />
                <label class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm font-bold text-gray-700">
                  <input v-model="plan.enabled" type="checkbox" />
                  Aktiv
                </label>
              </div>
            </div>
          </div>

          <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60" :disabled="saving" @click="savePromotionSettings">
            <Save class="w-5 h-5" />
            {{ saving ? 'Yadda saxlanır...' : 'Ayarları yadda saxla' }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50">
          <div class="flex items-center gap-3">
            <Crown class="w-5 h-5 text-amber-500" />
            <h2 class="text-2xl font-extrabold text-gray-900">Önə çıxarma sorğuları</h2>
          </div>
        </div>
        <div class="p-8 space-y-4">
          <div v-if="!requests.length" class="rounded-[1.75rem] border border-dashed border-gray-200 p-8 text-sm font-medium text-gray-500">
            Hələ sorğu yoxdur.
          </div>
          <div v-for="request in requests" :key="request.id" class="rounded-[1.75rem] border border-gray-100 p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-lg font-extrabold text-gray-900">{{ request.shopName }}</div>
                <div class="mt-1 text-sm font-medium text-gray-500">{{ request.sellerName }}</div>
                <div class="mt-1 text-xs font-medium text-gray-400">{{ new Date(request.submittedAt).toLocaleString('az-AZ') }}</div>
              </div>
              <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', request.status === 'Təsdiqləndi' ? 'bg-green-100 text-green-700' : request.status === 'Rədd edildi' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700']">
                {{ request.status }}
              </span>
            </div>
            <div class="mt-4 flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-bold text-gray-500">{{ request.planLabel }}</div>
                <div class="text-2xl font-extrabold text-blue-600">₼{{ Number(request.amount || 0).toFixed(2) }}</div>
              </div>
              <div class="flex items-center gap-2" v-if="request.status === 'Gözləyir'">
                <button type="button" class="px-4 py-2 rounded-xl bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-all disabled:opacity-60" :disabled="processingId === `seller-${request.id}`" @click="updateRequestStatus(request.id, 'Təsdiqləndi')">
                  Təsdiqlə
                </button>
                <button type="button" class="px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-all disabled:opacity-60" :disabled="processingId === `seller-${request.id}`" @click="updateRequestStatus(request.id, 'Rədd edildi')">
                  Rədd et
                </button>
              </div>
            </div>
            <div v-if="request.paymentNote" class="mt-3 text-sm font-medium text-gray-500">{{ request.paymentNote }}</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50">
          <div class="flex items-center gap-3">
            <Package class="w-5 h-5 text-blue-600" />
            <h2 class="text-2xl font-extrabold text-gray-900">Məhsul önə çıxarma sorğuları</h2>
          </div>
        </div>
        <div class="p-8 space-y-4">
          <div v-if="!productRequests.length" class="rounded-[1.75rem] border border-dashed border-gray-200 p-8 text-sm font-medium text-gray-500">
            Hələ məhsul sorğusu yoxdur.
          </div>
          <div v-for="request in productRequests" :key="request.id" class="rounded-[1.75rem] border border-gray-100 p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-lg font-extrabold text-gray-900">{{ request.productName }}</div>
                <div class="mt-1 text-sm font-medium text-gray-500">{{ request.shopName }} · {{ request.sellerName }}</div>
                <div class="mt-1 text-xs font-medium text-gray-400">{{ new Date(request.submittedAt).toLocaleString('az-AZ') }}</div>
              </div>
              <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', request.status === 'Təsdiqləndi' ? 'bg-green-100 text-green-700' : request.status === 'Rədd edildi' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700']">
                {{ request.status }}
              </span>
            </div>
            <div class="mt-4 flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-bold text-gray-500">{{ request.planLabel }}</div>
                <div class="text-2xl font-extrabold text-blue-600">₼{{ Number(request.amount || 0).toFixed(2) }}</div>
              </div>
              <div class="flex items-center gap-2" v-if="request.status === 'Gözləyir'">
                <button type="button" class="px-4 py-2 rounded-xl bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-all disabled:opacity-60" :disabled="processingId === `product-${request.id}`" @click="updateProductRequestStatus(request.id, 'Təsdiqləndi')">
                  Təsdiqlə
                </button>
                <button type="button" class="px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-all disabled:opacity-60" :disabled="processingId === `product-${request.id}`" @click="updateProductRequestStatus(request.id, 'Rədd edildi')">
                  Rədd et
                </button>
              </div>
            </div>
            <div v-if="request.paymentNote" class="mt-3 text-sm font-medium text-gray-500">{{ request.paymentNote }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="sellerEditorOpen && sellerEditor" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" @click="closeSellerEditor"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl">
        <div class="shrink-0 flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white/95 backdrop-blur">
          <div>
            <div class="text-2xl font-extrabold text-gray-900">Satıcı profil redaktəsi</div>
            <div class="mt-1 text-sm font-medium text-gray-500">{{ sellerEditor.shopName }} · {{ sellerEditor.email }}</div>
          </div>
          <button type="button" class="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 hover:text-red-500 transition-all flex items-center justify-center" @click="closeSellerEditor">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-50">
            <div class="relative h-52 bg-gradient-to-r from-blue-100 to-indigo-100">
              <img v-if="sellerEditor.coverPreview || sellerEditor.coverImage" :src="sellerEditor.coverPreview || sellerEditor.coverImage" alt="" class="w-full h-full object-cover" />
              <div class="absolute inset-x-0 bottom-0 p-6 flex items-end gap-5 bg-gradient-to-t from-slate-950/40 to-transparent">
                <div class="w-24 h-24 rounded-[1.8rem] border-4 border-white bg-white overflow-hidden shadow-lg">
                  <img v-if="sellerEditor.profilePreview || sellerEditor.profileImage" :src="sellerEditor.profilePreview || sellerEditor.profileImage" alt="" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <Store class="w-8 h-8" />
                  </div>
                </div>
                <div class="text-white">
                  <div v-if="sellerEditor.heroLabel" class="text-[10px] font-extrabold uppercase tracking-[0.22em] text-blue-100">{{ sellerEditor.heroLabel }}</div>
                  <div class="text-2xl font-extrabold">{{ sellerEditor.shopName }}</div>
                  <div class="mt-1 text-sm font-semibold text-white/90">{{ sellerEditor.tagline || sellerEditor.note || 'Qısa mağaza təsviri' }}</div>
                  <div v-if="sellerEditor.campaignHeadline" class="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80">{{ sellerEditor.campaignHeadline }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6 space-y-4">
              <div class="text-lg font-extrabold text-gray-900">Profil şəkli</div>
              <div class="w-32 h-32 rounded-[2rem] border border-gray-100 bg-white overflow-hidden flex items-center justify-center">
                <img v-if="sellerEditor.profilePreview || sellerEditor.profileImage" :src="sellerEditor.profilePreview || sellerEditor.profileImage" alt="" class="w-full h-full object-cover" />
                <Store v-else class="w-10 h-10 text-gray-300" />
              </div>
              <label class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                <ImagePlus class="w-4 h-4" />
                {{ processingId === `upload-${sellerEditor.id}-profile` ? 'Crop edilir...' : 'Şəkil seç və crop et' }}
                <input type="file" accept="image/*" class="hidden" @change="uploadSellerImage(sellerEditor, $event, 'profile')" />
              </label>
              <input v-model="sellerEditor.profileImage" type="text" placeholder="Profil şəkli linki" class="w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            </div>

            <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6 space-y-4">
              <div class="text-lg font-extrabold text-gray-900">Mağaza cover şəkli</div>
              <div class="h-32 rounded-[2rem] border border-gray-100 bg-white overflow-hidden flex items-center justify-center">
                <img v-if="sellerEditor.coverPreview || sellerEditor.coverImage" :src="sellerEditor.coverPreview || sellerEditor.coverImage" alt="" class="w-full h-full object-cover" />
                <ImagePlus v-else class="w-10 h-10 text-gray-300" />
              </div>
              <label class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                <ImagePlus class="w-4 h-4" />
                {{ processingId === `upload-${sellerEditor.id}-cover` ? 'Hazırlanır...' : 'Cover seç və preview et' }}
                <input type="file" accept="image/*" class="hidden" @change="uploadSellerImage(sellerEditor, $event, 'cover')" />
              </label>
              <input v-model="sellerEditor.coverImage" type="text" placeholder="Cover şəkli linki" class="w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input v-model="sellerEditor.shopName" type="text" placeholder="Mağaza adı" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="sellerEditor.phone" type="text" placeholder="Əlaqə nömrəsi" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input v-model="sellerEditor.tagline" type="text" placeholder="Tagline" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="sellerEditor.heroLabel" type="text" placeholder="Hero label" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <input v-model="sellerEditor.campaignHeadline" type="text" placeholder="Campaign headline" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <select v-model="sellerEditor.storefrontLayout" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium">
              <option value="classic">Classic</option>
              <option value="editorial">Editorial</option>
              <option value="premium">Premium</option>
            </select>
            <input v-model="sellerEditor.themeColor" type="text" placeholder="#2563eb" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <select v-model="sellerEditor.verifiedStatus" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium">
              <option value="Yoxdur">Verification yoxdur</option>
              <option value="Gözləyir">Gözləyir</option>
              <option value="Təsdiqləndi">Təsdiqləndi</option>
            </select>
            <input v-model="sellerEditor.verifiedAt" type="text" placeholder="Verified at ISO date" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input v-model="sellerEditor.verifiedByName" type="text" placeholder="Təsdiqləyən admin" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="sellerEditor.verifiedNote" type="text" placeholder="Verification qeydi" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
          </div>

          <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6">
            <div class="text-lg font-extrabold text-gray-900">Verification tarixçəsi</div>
            <div v-if="!Array.isArray(sellerEditor.verificationHistory) || !sellerEditor.verificationHistory.length" class="mt-3 text-sm font-medium text-gray-500">
              Hələ verification tarixçəsi yoxdur.
            </div>
            <div v-else class="mt-4 space-y-3">
              <div v-for="(item, idx) in sellerEditor.verificationHistory" :key="`${sellerEditor.id}-history-${idx}`" class="rounded-2xl border border-gray-100 bg-white p-4">
                <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div class="text-sm font-extrabold text-gray-900">{{ item.fromStatus }} -> {{ item.toStatus }}</div>
                  <div class="text-xs font-bold text-gray-400">{{ item.at }}</div>
                </div>
                <div class="mt-2 text-sm font-medium text-gray-600">Admin: {{ item.by || '-' }}</div>
                <div v-if="item.note" class="mt-1 text-sm font-medium text-gray-500">{{ item.note }}</div>
              </div>
            </div>
          </div>

          <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-lg font-extrabold text-gray-900">Verification sənədləri</div>
                <div class="mt-1 text-sm font-medium text-gray-500">Sənəd yüklə, status ver və approval metadata saxla.</div>
              </div>
              <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 text-sm font-extrabold text-gray-700" @click="addVerificationDocument">
                <FileText class="w-4 h-4" />
                Sənəd əlavə et
              </button>
            </div>
            <div v-if="!Array.isArray(sellerEditor.verificationDocuments) || !sellerEditor.verificationDocuments.length" class="mt-4 text-sm font-medium text-gray-500">
              Hələ verification sənədi yoxdur.
            </div>
            <div v-else class="mt-5 space-y-4">
              <div v-for="(doc, idx) in sellerEditor.verificationDocuments" :key="doc.id || idx" class="rounded-2xl border border-gray-100 bg-white p-4 space-y-4">
                <div class="flex items-center justify-between gap-4">
                  <div class="text-sm font-extrabold text-gray-900">Sənəd {{ idx + 1 }}</div>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.14em] text-red-600" @click="removeVerificationDocument(idx)">
                    <Trash2 class="w-3.5 h-3.5" />
                    Sil
                  </button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <input v-model="doc.title" type="text" placeholder="Sənəd adı" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
                  <select v-model="doc.status" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input v-model="doc.url" type="text" placeholder="Sənəd linki" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium lg:col-span-2" />
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <label class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                    <UploadCloud class="w-4 h-4" />
                    {{ processingId === `upload-doc-${sellerEditor.id}-${idx}` ? 'Yüklənir...' : 'Sənəd yüklə' }}
                    <input type="file" class="hidden" @change="uploadVerificationDocument($event, idx)" />
                  </label>
                  <a v-if="doc.url" :href="doc.url" target="_blank" class="text-sm font-extrabold text-blue-600 hover:underline">Aç</a>
                  <div class="text-xs font-medium text-gray-400">Uploaded: {{ doc.uploadedAt || '-' }}</div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <input v-model="doc.reviewedBy" type="text" placeholder="Reviewed by" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
                  <input v-model="doc.reviewedAt" type="text" placeholder="Reviewed at" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
                  <input v-model="doc.note" type="text" placeholder="Sənəd qeydi" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
                </div>
              </div>
            </div>
          </div>

          <textarea v-model="sellerEditor.note" rows="4" placeholder="Mağaza qeydi" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium resize-none"></textarea>

          <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6">
            <div class="text-lg font-extrabold text-gray-900">Satış kateqoriyaları</div>
            <div class="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[320px] overflow-auto pr-1">
              <button
                v-for="category in sellerCategoryOptions"
                :key="`${sellerEditor.id}-${category.id}`"
                type="button"
                @click="toggleSellerCategory(sellerEditor, category.id)"
                :class="['rounded-[1.5rem] border p-3 text-left transition-all', Array.isArray(sellerEditor.categoryIds) && sellerEditor.categoryIds.includes(category.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200']"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    <img v-if="category.image" :src="category.image" alt="" class="w-full h-full object-cover" />
                    <Store v-else class="w-4 h-4 text-gray-300" />
                  </div>
                  <div class="min-w-0 flex-1 text-sm font-bold" :class="Array.isArray(sellerEditor.categoryIds) && sellerEditor.categoryIds.includes(category.id) ? 'text-blue-700' : 'text-gray-800'">
                    {{ category.label }}
                  </div>
                  <div v-if="Array.isArray(sellerEditor.categoryIds) && sellerEditor.categoryIds.includes(category.id)" class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check class="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div class="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white/95 pt-4 backdrop-blur">
            <button type="button" class="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all" @click="closeSellerEditor">
              Bağla
            </button>
            <button type="button" class="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all" :disabled="processingId === `save-${sellerEditor.id}`" @click="saveSellerEditor">
              {{ processingId === `save-${sellerEditor.id}` ? 'Yadda saxlanır...' : 'Dəyişiklikləri yadda saxla' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
