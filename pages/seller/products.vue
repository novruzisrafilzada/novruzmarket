<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Boxes, Globe, ImagePlus, Images, Info, ListTree, Package2, Pencil, Plus, Save, Sparkles, Trash2, UploadCloud } from 'lucide-vue-next'
import type { Variation } from '~/stores/products'

definePageMeta({
  layout: 'seller',
  middleware: ['require-seller']
})

const authStore = useAuthStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const categoryFilterStore = useCategoryFilterStore()
const toastStore = useToastStore()
const { formatMoney } = useMoney()

const saving = ref(false)
const uploading = ref(false)
const editingId = ref<number | null>(null)
const activeTab = ref<'general' | 'variations' | 'gallery' | 'seo'>('general')

const form = ref({
  name: '',
  brand: '',
  price: 0,
  oldPrice: 0,
  stock: 1,
  image: '',
  features: '',
  description: '',
  categoryId: null as number | null,
  status: 'Aktiv',
  tags: '',
  attributes: {} as Record<string, string>,
  gallery: [] as string[],
  variations: [] as Variation[],
  seo: {
    title: '',
    description: '',
    keywords: ''
  }
})

const categories = computed(() => categoryStore.categories.filter(c => c.parentId !== null))
const sellerProducts = computed(() => productStore.products.filter(p => p.sellerId === authStore.user?.id))
const childrenByParent = computed(() => {
  const map = new Map<number | null, typeof categoryStore.categories>()
  for (const category of categoryStore.categories) {
    const key = category.parentId === null ? null : Number(category.parentId)
    const list = map.get(key) || []
    list.push(category)
    map.set(key, list)
  }
  return map
})
const collectCategoryIds = (categoryId: number | null) => {
  const ids = new Set<number>()
  if (!categoryId) return ids
  const walk = (id: number) => {
    ids.add(id)
    for (const child of childrenByParent.value.get(id) || []) walk(Number(child.id))
  }
  walk(Number(categoryId))
  return ids
}
const relatedBrandOptionsFor = (categoryId: number | null) => {
  const ids = collectCategoryIds(categoryId)
  if (!ids.size) return [] as string[]
  return Array.from(new Set(
    productStore.products
      .filter((product) => ids.has(Number(product.categoryId || 0)))
      .map((product) => String(product.brand || '').trim())
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, 'az'))
}
const relatedBrandOptions = computed(() => relatedBrandOptionsFor(form.value.categoryId))
const selectedCategorySchema = computed(() => form.value.categoryId ? categoryFilterStore.getSchema(Number(form.value.categoryId)) : null)
const selectedCategoryGroups = computed(() => selectedCategorySchema.value?.groups || [])
const schemaSourceLabel = computed(() => selectedCategorySchema.value?.source === 'custom' ? 'Custom sxem' : 'Auto şablon')
const filledAttributeCount = computed(() =>
  selectedCategoryGroups.value.filter((group) => String(form.value.attributes?.[group.key] || '').trim()).length
)
const selectedAttributePreview = computed(() =>
  selectedCategoryGroups.value
    .map((group) => ({ label: group.label, value: String(form.value.attributes?.[group.key] || '').trim() }))
    .filter((item) => item.value)
    .slice(0, 4)
)
const productAttributePreview = (product: any) => Object.entries(product?.attributes || {})
  .map(([key, value]) => ({ key, value: String(value || '').trim() }))
  .filter((item) => item.value)
  .slice(0, 3)

watch(selectedCategoryGroups, (groups) => {
  const next: Record<string, string> = { ...(form.value.attributes || {}) }
  for (const group of groups) {
    if (next[group.key] === undefined) next[group.key] = ''
  }
  form.value.attributes = next
}, { immediate: true })

watch(() => form.value.categoryId, (next, prev) => {
  if (prev === undefined || next === prev) return
  const currentBrand = String(form.value.brand || '').trim()
  if (!currentBrand) return
  const allowed = relatedBrandOptionsFor(next)
  if (allowed.length > 0 && !allowed.includes(currentBrand)) {
    form.value.brand = ''
  }
})

const resetForm = () => {
  editingId.value = null
  activeTab.value = 'general'
  form.value = {
    name: '',
    brand: '',
    price: 0,
    oldPrice: 0,
    stock: 1,
    image: '',
    features: '',
    description: '',
    categoryId: null,
    status: 'Aktiv',
    tags: '',
    attributes: {},
    gallery: [],
    variations: [],
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  }
}

const startEdit = (product: any) => {
  editingId.value = product.id
  activeTab.value = 'general'
  form.value = {
    name: product.name,
    brand: String(product.brand || ''),
    price: Number(product.price || 0),
    oldPrice: Number(product.oldPrice || 0),
    stock: Number(product.stock || 0),
    image: product.image || '',
    features: Array.isArray(product.features) ? product.features.join(', ') : '',
    description: product.description || '',
    categoryId: product.categoryId ?? null,
    status: product.status || 'Aktiv',
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    attributes: product.attributes ? { ...(product.attributes as any) } : {},
    gallery: Array.isArray(product.gallery) ? [...product.gallery] : [],
    variations: Array.isArray(product.variations) ? JSON.parse(JSON.stringify(product.variations)) : [],
    seo: product.seo ? { ...product.seo } : {
      title: '',
      description: '',
      keywords: ''
    }
  }
}

const uploadImageFile = async (file: File) => {
  const body = new FormData()
  body.append('file', file)
  const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
  return res.url
}

const uploadImage = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    form.value.image = await uploadImageFile(file)
    toastStore.success('Şəkil yükləndi')
  } catch {
    toastStore.error('Şəkil yüklənə bilmədi')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

const addVariation = async () => {
  const newId = form.value.variations.length > 0
    ? Math.max(...form.value.variations.map(v => Number(v.id) || 0)) + 1
    : 1
  form.value.variations.push({
    id: newId,
    size: '',
    unit: 'ədəd',
    price: Number(form.value.price || 0),
    stock: Number(form.value.stock || 0),
    image: ''
  })
  await nextTick()
}

const removeVariation = (index: number) => {
  form.value.variations.splice(index, 1)
}

const uploadVariationImage = async (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    form.value.variations[index].image = await uploadImageFile(file)
    toastStore.success('Variasiya şəkli yükləndi')
  } catch {
    toastStore.error('Variasiya şəkli yüklənmədi')
  } finally {
    input.value = ''
  }
}

const addGalleryImage = () => {
  form.value.gallery.push('')
}

const removeGalleryImage = (index: number) => {
  form.value.gallery.splice(index, 1)
}

const uploadGalleryImage = async (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    form.value.gallery[index] = await uploadImageFile(file)
    toastStore.success('Qalereya şəkli yükləndi')
  } catch {
    toastStore.error('Qalereya şəkli yüklənmədi')
  } finally {
    input.value = ''
  }
}

const saveProduct = async () => {
  if (!form.value.name || !form.value.image || !form.value.categoryId || Number(form.value.price) <= 0) {
    toastStore.error('Məhsul adı, kateqoriya, şəkil və qiymət vacibdir')
    return
  }

  const category = categoryStore.categories.find(c => c.id === form.value.categoryId)
  if (!category) {
    toastStore.error('Kateqoriya seçin')
    return
  }

  saving.value = true
  const normalize = (value: any) => String(value || '').trim()
  const rawTags = String(form.value.tags || '').split(',').map(normalize).filter(Boolean)
  const tags = Array.from(new Set(rawTags))
  const attributes = Object.entries(form.value.attributes || {}).reduce((acc, [key, value]) => {
    const normalized = normalize(value)
    if (normalized) acc[key] = normalized
    return acc
  }, {} as Record<string, string>)
  const gallery = Array.from(new Set((form.value.gallery || []).map(normalize).filter(Boolean))).filter(img => img !== form.value.image)
  const variations = (form.value.variations || [])
    .map((variation) => ({
      ...variation,
      size: typeof variation.size === 'string' ? variation.size.trim() : variation.size,
      price: Number(variation.price || 0),
      stock: Number(variation.stock || 0)
    }))
    .filter((variation) => String(variation.size || '').trim() && Number(variation.price || 0) > 0)

  const payload = {
    name: form.value.name,
    brand: normalize(form.value.brand),
    price: Number(form.value.price),
    oldPrice: Number(form.value.oldPrice) || undefined,
    rating: 0,
    reviewCount: 0,
    stock: Number(form.value.stock),
    sold: editingId.value ? undefined : 0,
    total: Number(form.value.stock),
    image: form.value.image,
    category: category.nameI18n?.az || category.slug,
    categoryId: category.id,
    features: String(form.value.features || '').split(',').map(normalize).filter(Boolean),
    description: form.value.description,
    descriptionI18n: { az: form.value.description, ru: form.value.description, en: form.value.description },
    sellerId: authStore.user?.id || null,
    sellerName: authStore.user?.name || '',
    sellerShopName: authStore.user?.sellerProfile?.shopName || '',
    status: form.value.status,
    tags: tags.length ? tags : undefined,
    attributes: Object.keys(attributes).length ? attributes : undefined,
    gallery,
    variations: variations.length ? variations : undefined,
    seo: {
      title: normalize(form.value.seo.title),
      description: normalize(form.value.seo.description),
      keywords: normalize(form.value.seo.keywords)
    }
  } as any

  try {
    if (editingId.value) {
      await productStore.updateProduct(editingId.value, payload)
      toastStore.success('Məhsul yeniləndi')
    } else {
      await productStore.addProduct(payload)
      toastStore.success('Məhsul əlavə edildi')
    }
    resetForm()
  } catch {
    toastStore.error('Məhsul yadda saxlanmadı')
  } finally {
    saving.value = false
  }
}

const removeProduct = async (id: number) => {
  try {
    await productStore.deleteProduct(id)
    if (editingId.value === id) resetForm()
    toastStore.success('Məhsul silindi')
  } catch {
    toastStore.error('Məhsul silinmədi')
  }
}

onMounted(async () => {
  await Promise.all([productStore.fetchProducts(), categoryStore.fetchCategories(), categoryFilterStore.fetchSchemas()])
})
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
    <div class="bg-white border border-slate-200 rounded-[2rem] p-6 h-fit">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-lg font-extrabold text-slate-900">{{ editingId ? 'Məhsulu redaktə et' : 'Yeni məhsul əlavə et' }}</div>
          <div class="text-sm font-medium text-slate-500 mt-1">Admin paneldəki məhsul formuna yaxın genişləndirilmiş satıcı məhsul formu.</div>
        </div>
        <button v-if="editingId" type="button" class="text-sm font-bold text-slate-500 hover:text-slate-900" @click="resetForm">Sıfırla</button>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <button type="button" :class="['inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all', activeTab === 'general' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']" @click="activeTab = 'general'">
          <Package2 class="w-4 h-4" />
          Əsas
        </button>
        <button type="button" :class="['inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all', activeTab === 'variations' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']" @click="activeTab = 'variations'">
          <ListTree class="w-4 h-4" />
          Variasiyalar
        </button>
        <button type="button" :class="['inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all', activeTab === 'gallery' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']" @click="activeTab = 'gallery'">
          <Images class="w-4 h-4" />
          Qalereya
        </button>
        <button type="button" :class="['inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all', activeTab === 'seo' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']" @click="activeTab = 'seo'">
          <Globe class="w-4 h-4" />
          SEO
        </button>
      </div>

      <div v-if="activeTab === 'general'" class="mt-6 space-y-4">
        <input v-model="form.name" type="text" placeholder="Məhsul adı" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Məhsul təsviri</label>
          <textarea v-model="form.description" rows="4" placeholder="Məhsul təsviri" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium resize-none"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Qiymət (AZN)</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Köhnə qiymət (AZN)</label>
            <input v-model.number="form.oldPrice" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <input v-model.number="form.stock" type="number" min="0" placeholder="Stok" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
          <select v-model="form.categoryId" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium">
            <option :value="null">Kateqoriya seçin</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.nameI18n.az }}</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Brend</label>
          <input
            v-model="form.brand"
            :disabled="!form.categoryId"
            list="seller-category-related-brands"
            type="text"
            :placeholder="form.categoryId ? 'Bu kateqoriya üçün brend seçin və ya yeni daxil edin' : 'Əvvəlcə kateqoriya seçin'"
            class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          />
          <datalist id="seller-category-related-brands">
            <option v-for="brand in relatedBrandOptions" :key="brand" :value="brand">{{ brand }}</option>
          </datalist>
          <div v-if="form.categoryId && relatedBrandOptions.length" class="flex flex-wrap gap-2">
            <button
              v-for="brand in relatedBrandOptions"
              :key="`seller-brand-${brand}`"
              type="button"
              :class="[
                'rounded-full border px-3 py-1.5 text-xs font-extrabold transition-all',
                form.brand === brand
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              ]"
              @click="form.brand = brand"
            >
              {{ brand }}
            </button>
          </div>
          <p v-else-if="form.categoryId" class="text-[11px] font-medium text-slate-400">
            Bu kateqoriya üçün hələ brend yaranmayıb. Yeni brendi əl ilə daxil edə bilərsiniz.
          </p>
        </div>

        <div class="space-y-3">
          <label class="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-2xl border border-dashed border-slate-300 text-slate-600 font-bold cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-all">
            <ImagePlus class="w-5 h-5" />
            {{ uploading ? 'Yüklənir...' : 'Şəkil yüklə' }}
            <input type="file" accept="image/*" class="hidden" @change="uploadImage" />
          </label>
          <input v-model="form.image" type="text" placeholder="və ya şəkil linki" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
          <img v-if="form.image" :src="form.image" alt="" class="w-full h-48 object-cover rounded-2xl border border-slate-200" />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Xüsusiyyətlər (vergüllə ayırın)</label>
          <textarea v-model="form.features" rows="3" placeholder="Məsələn: 5W-30, tam sintetik, uzunmüddətli qoruma" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium resize-none"></textarea>
        </div>

        <input v-model="form.tags" type="text" placeholder="Taglar: məsələn jersey, nike, premium" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />

        <div v-if="selectedCategoryGroups.length" class="space-y-4 rounded-[1.5rem] border border-slate-200 p-4 bg-slate-50/60">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-sm font-extrabold text-slate-900">Kateqoriya atributları</div>
              <div class="mt-1 text-xs font-medium text-slate-500">Bu sahələr shop filterlərində görünəcək.</div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700">{{ schemaSourceLabel }}</span>
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-extrabold text-slate-700">{{ filledAttributeCount }}/{{ selectedCategoryGroups.length }} doldurulub</span>
            </div>
          </div>
          <div v-if="selectedAttributePreview.length" class="flex flex-wrap gap-2">
            <span v-for="item in selectedAttributePreview" :key="`${item.label}-${item.value}`" class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
              {{ item.label }}: {{ item.value }}
            </span>
          </div>
          <div v-for="group in selectedCategoryGroups" :key="group.key" class="space-y-2">
            <div class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{{ group.label }}</div>
            <select v-model="form.attributes[group.key]" class="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:border-blue-600 text-sm font-medium">
              <option value="">Seçin</option>
              <option v-for="option in group.options" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
        </div>
        <div v-else-if="form.categoryId" class="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-600">
          <div class="flex items-start gap-3">
            <Info class="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <div class="font-extrabold text-slate-800">Bu kateqoriya üçün atribut sxemi yoxdur</div>
              <div class="mt-1 text-xs font-medium leading-5 text-slate-500">Məhsul əsas sahələrlə yayımlanacaq. İstəsəniz admin paneldən bu kateqoriya üçün filter sxemi yarada bilərsiniz.</div>
            </div>
          </div>
        </div>

        <button type="button" class="w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60" :disabled="saving || uploading" @click="saveProduct">
          <component :is="editingId ? Save : Plus" class="w-5 h-5" />
          {{ editingId ? 'Məhsulu yenilə' : 'Məhsul əlavə et' }}
        </button>
      </div>

      <div v-if="activeTab === 'variations'" class="mt-6 space-y-4">
        <button type="button" class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all" @click="addVariation">
          <Plus class="w-4 h-4" />
          Variasiya əlavə et
        </button>

        <div v-if="!form.variations.length" class="rounded-[1.75rem] border border-dashed border-slate-300 p-8 text-center text-sm font-medium text-slate-500">
          Hələ variasiya yoxdur.
        </div>

        <div v-for="(variation, index) in form.variations" :key="variation.id" class="rounded-[1.75rem] border border-slate-200 p-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-sm font-extrabold text-slate-900">Variasiya #{{ index + 1 }}</div>
            <button type="button" class="text-sm font-bold text-red-600 hover:text-red-700" @click="removeVariation(index)">Sil</button>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Ölçü / Miqdar</label>
              <input v-model="variation.size" type="text" placeholder="Məs. 1" class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Vahid</label>
              <select v-model="variation.unit" class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium">
                <option value="ədəd">ədəd</option>
                <option value="Litr">Litr</option>
                <option value="Qram">Qram</option>
                <option value="Kq-ram">Kq-ram</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Qiymət (AZN)</label>
              <input v-model.number="variation.price" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">Stok</label>
              <input v-model.number="variation.stock" type="number" min="0" placeholder="0" class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium" />
            </div>
          </div>
          <div class="space-y-3">
            <label class="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-2xl border border-dashed border-slate-300 text-slate-600 font-bold cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-all">
              <UploadCloud class="w-4 h-4" />
              Variasiya şəkli yüklə
              <input type="file" accept="image/*" class="hidden" @change="uploadVariationImage($event, index)" />
            </label>
            <input v-model="variation.image" type="text" placeholder="Variasiya şəkil linki" class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium" />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'gallery'" class="mt-6 space-y-4">
        <button type="button" class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all" @click="addGalleryImage">
          <Plus class="w-4 h-4" />
          Qalereya şəkli əlavə et
        </button>

        <div v-if="!form.gallery.length" class="rounded-[1.75rem] border border-dashed border-slate-300 p-8 text-center text-sm font-medium text-slate-500">
          Qalereya üçün əlavə şəkillər hələ yoxdur.
        </div>

        <div v-for="(image, index) in form.gallery" :key="index" class="rounded-[1.75rem] border border-slate-200 p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-sm font-extrabold text-slate-900">Şəkil #{{ index + 1 }}</div>
            <button type="button" class="text-sm font-bold text-red-600 hover:text-red-700" @click="removeGalleryImage(index)">Sil</button>
          </div>
          <label class="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-2xl border border-dashed border-slate-300 text-slate-600 font-bold cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-all">
            <UploadCloud class="w-4 h-4" />
            Şəkil yüklə
            <input type="file" accept="image/*" class="hidden" @change="uploadGalleryImage($event, index)" />
          </label>
          <input v-model="form.gallery[index]" type="text" placeholder="Qalereya şəkil linki" class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium" />
          <img v-if="image" :src="image" alt="" class="w-full h-36 object-cover rounded-2xl border border-slate-200" />
        </div>
      </div>

      <div v-if="activeTab === 'seo'" class="mt-6 space-y-4">
        <input v-model="form.seo.title" type="text" placeholder="SEO başlıq" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
        <textarea v-model="form.seo.description" rows="4" placeholder="SEO təsvir" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium resize-none"></textarea>
        <input v-model="form.seo.keywords" type="text" placeholder="SEO açar sözlər" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium" />
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-lg font-extrabold text-slate-900">Mənim məhsullarım</div>
          <div class="text-sm font-medium text-slate-500 mt-1">Öz məhsullarınızı, stok və satış statistikasını burada görün.</div>
        </div>
        <div class="text-sm font-bold text-slate-500">{{ sellerProducts.length }} məhsul</div>
      </div>

      <div class="mt-6 space-y-4">
        <div v-for="product in sellerProducts" :key="product.id" class="border border-slate-100 rounded-[1.75rem] p-4 flex flex-col md:flex-row gap-4">
          <img :src="product.image" :alt="product.name" class="w-full md:w-28 h-28 rounded-2xl object-cover bg-slate-50" />
          <div class="flex-1 min-w-0">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <div class="text-base font-extrabold text-slate-900">{{ product.name }}</div>
                <div class="mt-1 text-sm font-medium text-slate-500">{{ product.category }}</div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-if="product.brand" class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700">{{ product.brand }}</span>
                  <span v-for="item in productAttributePreview(product)" :key="`${product.id}-${item.key}`" class="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600">{{ item.value }}</span>
                </div>
                <div v-if="product.featuredStatus === 'Aktiv'" class="mt-2 inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase tracking-[0.16em]">
                  {{ product.featuredBadgeText || 'PRO' }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-base font-extrabold text-slate-900">{{ formatMoney(product.price) }}</div>
                <div class="mt-1 text-sm font-medium text-slate-500">Stok: {{ product.stock }}</div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="rounded-2xl bg-slate-50 px-4 py-3">
                <div class="text-xs font-bold text-slate-400 uppercase">Satılıb</div>
                <div class="mt-1 text-lg font-extrabold text-slate-900">{{ product.sold }}</div>
              </div>
              <div class="rounded-2xl bg-slate-50 px-4 py-3">
                <div class="text-xs font-bold text-slate-400 uppercase">Toplam</div>
                <div class="mt-1 text-lg font-extrabold text-slate-900">{{ product.total }}</div>
              </div>
              <div class="rounded-2xl bg-slate-50 px-4 py-3">
                <div class="text-xs font-bold text-slate-400 uppercase">Reytinq</div>
                <div class="mt-1 text-lg font-extrabold text-slate-900">{{ Number(product.rating || 0).toFixed(1) }}</div>
              </div>
              <div class="rounded-2xl bg-slate-50 px-4 py-3">
                <div class="text-xs font-bold text-slate-400 uppercase">Rəy sayı</div>
                <div class="mt-1 text-lg font-extrabold text-slate-900">{{ Number(product.reviewCount || 0) }}</div>
              </div>
            </div>
          </div>
          <div class="flex md:flex-col gap-2">
            <NuxtLink :to="`/seller/products/${product.id}/promote`" class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition-all">
              <Boxes class="w-4 h-4" />
              Önə çıxar
            </NuxtLink>
            <button type="button" class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-all" @click="startEdit(product)">
              <Pencil class="w-4 h-4" />
              Redaktə
            </button>
            <button type="button" class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all" @click="removeProduct(product.id)">
              <Trash2 class="w-4 h-4" />
              Sil
            </button>
          </div>
        </div>

        <div v-if="!sellerProducts.length" class="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
          <Sparkles class="mx-auto h-10 w-10 text-slate-300" />
          <div class="mt-4 text-base font-extrabold text-slate-900">Mağazanız üçün ilk məhsulu əlavə edin</div>
          <div class="mt-2 text-sm font-medium leading-6 text-slate-500">Brand, atribut və şəkillərlə dolu məhsullar shop filterlərində daha görünən olur.</div>
          <button type="button" class="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 transition-all" @click="resetForm">
            <Plus class="h-4 w-4" />
            Yeni məhsul əlavə et
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
