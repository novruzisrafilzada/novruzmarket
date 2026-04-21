<script setup lang="ts">
import { ref, computed, nextTick, watch, watchEffect } from 'vue'
import { Package, Search, Plus, Filter, Edit, Trash2, Image as ImageIcon, X, Globe, ListTree, Layers } from 'lucide-vue-next'
import { useProductStore, type Product, type Variation, type UnitType } from '~/stores/products'
import { useCategoryStore, type Category } from '~/stores/categories'
import { useCategoryFilterStore } from '~/stores/categoryFilters'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const categoryFilterStore = useCategoryFilterStore()
const toastStore = useToastStore()
const { adminPath } = useAdminPortal()
const searchQuery = ref('')
const isModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const activeTab = ref('general') // general, variations, gallery, media, seo
const { formatMoney } = useMoney()
const activeVariationIndex = ref(0)
const variationRefs = ref<HTMLElement[]>([])
const MAX_PRODUCT_LONG_TEXT = 3000
const MAX_PRODUCT_MEDIUM_TEXT = 2500
const MAX_PRODUCT_SHORT_TEXT = 500

if (!categoryStore.hydrated || categoryStore.categories.length === 0) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const categories = await fetcher('/api/categories')
    categoryStore.setCategories(categories as any)
  } else {
    await categoryStore.fetchCategories()
  }
}

if (!categoryFilterStore.hydrated) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const schemas = await fetcher('/api/category-filters')
    categoryFilterStore.setSchemas(schemas as any)
  } else {
    await categoryFilterStore.fetchSchemas()
  }
}

const categoryById = computed(() => new Map(categoryStore.categories.map(c => [c.id, c] as const)))

const categoryDisplayName = (c: Category) => c.nameI18n.az || c.nameI18n.ru || c.nameI18n.en || c.slug

const categoryOptions = computed(() => {
  const parents = categoryStore.categories.filter(c => c.parentId === null).sort((a, b) => categoryDisplayName(a).localeCompare(categoryDisplayName(b), 'az'))
  const childrenByParent = new Map<number, Category[]>()
  for (const c of categoryStore.categories) {
    if (c.parentId === null) continue
    const list = childrenByParent.get(c.parentId) || []
    list.push(c)
    childrenByParent.set(c.parentId, list)
  }
  for (const [k, list] of childrenByParent.entries()) {
    childrenByParent.set(k, list.sort((a, b) => categoryDisplayName(a).localeCompare(categoryDisplayName(b), 'az')))
  }
  const out: { id: number; label: string }[] = []
  const walk = (cat: Category, depth: number) => {
    const prefix = depth > 0 ? `${'—'.repeat(depth)} ` : ''
    out.push({ id: cat.id, label: `${prefix}${categoryDisplayName(cat)}` })
    const kids = childrenByParent.get(cat.id) || []
    for (const child of kids) walk(child, depth + 1)
  }
  for (const p of parents) walk(p, 0)
  return out
})

const adminChildrenByParent = computed(() => {
  const map = new Map<number | null, Category[]>()
  for (const category of categoryStore.categories) {
    const key = category.parentId === null ? null : Number(category.parentId)
    const list = map.get(key) || []
    list.push(category)
    map.set(key, list)
  }
  return map
})

const collectAdminCategoryIds = (categoryId: number | null) => {
  const ids = new Set<number>()
  if (!categoryId) return ids
  const walk = (id: number) => {
    ids.add(id)
    for (const child of adminChildrenByParent.value.get(id) || []) {
      walk(Number(child.id))
    }
  }
  walk(Number(categoryId))
  return ids
}

const relatedBrandOptionsFor = (categoryId: number | null) => {
  const ids = collectAdminCategoryIds(categoryId)
  if (!ids.size) return [] as string[]
  return Array.from(new Set(
    productStore.products
      .filter((product) => ids.has(Number(product.categoryId || 0)))
      .map((product) => String(product.brand || '').trim())
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, 'az'))
}

const relatedBrandOptions = computed(() => relatedBrandOptionsFor(productForm.value.categoryId))
const schemaSourceLabel = computed(() => schemaGroups.value.length === 0 ? '' : (categoryFilterStore.getSchema(Number(productForm.value.categoryId || 0))?.source === 'custom' ? 'Custom sxem' : 'Auto şablon'))
const filledSchemaCount = computed(() => schemaGroups.value.filter((group) => String(productForm.value.attributes?.[group.key] || '').trim()).length)
const selectedAttributePreview = computed(() =>
  schemaGroups.value
    .map((group) => ({ label: group.label, value: String(productForm.value.attributes?.[group.key] || '').trim() }))
    .filter((item) => item.value)
    .slice(0, 4)
)
const productAttributePreview = (product: any) => Object.entries(product?.attributes || {})
  .map(([key, value]) => ({ key, value: String(value || '').trim() }))
  .filter((item) => item.value)
  .slice(0, 3)

watch(() => productForm.value.categoryId, (next, prev) => {
  if (prev === undefined || next === prev) return
  const currentBrand = String(productForm.value.brand || '').trim()
  if (!currentBrand) return
  const allowed = relatedBrandOptionsFor(next)
  if (allowed.length > 0 && !allowed.includes(currentBrand)) {
    productForm.value.brand = ''
  }
})

const scrollToVariation = async (index: number) => {
  activeVariationIndex.value = index
  await nextTick()
  variationRefs.value[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const uploadImage = async (file: File) => {
  const body = new FormData()
  body.append('file', file)
  const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
  return res.url
}

const onMainImageSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    productForm.value.image = await uploadImage(file)
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  }
  input.value = ''
}

const onVariationImageSelected = async (index: number, e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    productForm.value.variations[index].image = await uploadImage(file)
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  }
  input.value = ''
}

const onGalleryImageSelected = async (index: number, e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    productForm.value.gallery[index] = await uploadImage(file)
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  }
  input.value = ''
}

const onGalleryFilesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length === 0) return
  try {
    const urls = await Promise.all(files.map(uploadImage))
    productForm.value.gallery.push(...urls)
  } catch {
    toastStore.error('Şəkillər yüklənmədi')
  }
  input.value = ''
}

const onVideoPosterSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    productForm.value.media.videoPoster = await uploadImage(file)
  } catch {
    toastStore.error('Poster yüklənmədi')
  }
  input.value = ''
}

const onLifestyleImageSelected = async (index: number, e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    productForm.value.media.lifestyleImages[index] = await uploadImage(file)
  } catch {
    toastStore.error('Lifestyle şəkli yüklənmədi')
  }
  input.value = ''
}

const onLifestyleFilesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length === 0) return
  try {
    const urls = await Promise.all(files.map(uploadImage))
    productForm.value.media.lifestyleImages.push(...urls)
  } catch {
    toastStore.error('Lifestyle şəkilləri yüklənmədi')
  }
  input.value = ''
}

const productForm = ref({
  name: '',
  category: '',
  categoryId: null as number | null,
  brand: '',
  price: 0,
  oldPrice: 0,
  stock: 0,
  image: '',
  features: '',
  description: '',
  tags: '',
  attributes: {} as Record<string, string>,
  gallery: [] as string[],
  variations: [] as Variation[],
  seo: {
    title: '',
    description: '',
    keywords: ''
  },
  media: {
    videoUrl: '',
    videoPoster: '',
    lifestyleImages: [] as string[]
  }
})

const filteredProducts = computed(() => {
  return productStore.products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const openModal = (product?: Product) => {
  activeTab.value = 'general'
  activeVariationIndex.value = 0
  if (product) {
    editingProduct.value = JSON.parse(JSON.stringify(product))
    const legacyName = String(product.category || '').trim()
    const resolvedId =
      product.categoryId !== undefined && product.categoryId !== null
        ? Number(product.categoryId)
        : categoryStore.categories.find(c => categoryDisplayName(c) === legacyName)?.id || null
    productForm.value = {
      name: product.name,
      category: product.category,
      categoryId: Number.isFinite(resolvedId as any) ? (resolvedId as any) : null,
      brand: String(product.brand || ''),
      price: product.price,
      oldPrice: product.oldPrice || 0,
      stock: product.stock,
      image: product.image,
      features: product.features?.join(', ') || '',
      description: product.description || '',
      tags: product.tags ? product.tags.join(', ') : '',
      attributes: product.attributes ? { ...(product.attributes as any) } : {},
      gallery: product.gallery ? [...product.gallery] : [],
      variations: product.variations ? JSON.parse(JSON.stringify(product.variations)) : [],
      seo: product.seo ? { ...product.seo } : { title: '', description: '', keywords: '' },
      media: {
        videoUrl: String(product.media?.videoUrl || ''),
        videoPoster: String(product.media?.videoPoster || ''),
        lifestyleImages: Array.isArray(product.media?.lifestyleImages) ? [...product.media!.lifestyleImages!] : []
      }
    }
  } else {
    editingProduct.value = null
    productForm.value = {
      name: '',
      category: '',
      categoryId: null,
      brand: '',
      price: 0,
      oldPrice: 0,
      stock: 0,
      image: '',
      features: '',
      description: '',
      tags: '',
      attributes: {},
      gallery: [],
      variations: [],
      seo: { title: '', description: '', keywords: '' },
      media: { videoUrl: '', videoPoster: '', lifestyleImages: [] }
    }
  }
  isModalOpen.value = true
}

const schemaGroups = computed(() => {
  const id = productForm.value.categoryId
  if (!id) return []
  const schema = categoryFilterStore.getSchema(id)
  return schema?.groups || []
})

watchEffect(() => {
  const groups = schemaGroups.value
  if (groups.length === 0) return
  for (const g of groups) {
    if (productForm.value.attributes[g.key] === undefined) productForm.value.attributes[g.key] = ''
  }
})

const addVariation = async () => {
  const newId = productForm.value.variations.length > 0 
    ? Math.max(...productForm.value.variations.map(v => v.id)) + 1 
    : 1
  productForm.value.variations.push({
    id: newId,
    size: '',
    unit: 'ədəd',
    price: productForm.value.price,
    stock: 0,
    image: ''
  })
  await scrollToVariation(productForm.value.variations.length - 1)
}

const removeVariation = async (index: number) => {
  productForm.value.variations.splice(index, 1)
  await nextTick()
  const max = Math.max(0, productForm.value.variations.length - 1)
  activeVariationIndex.value = Math.min(activeVariationIndex.value, max)
}

const addGalleryImage = () => {
  productForm.value.gallery.push('')
}

const removeGalleryImage = (index: number) => {
  productForm.value.gallery.splice(index, 1)
}

const addLifestyleImage = () => {
  productForm.value.media.lifestyleImages.push('')
}

const removeLifestyleImage = (index: number) => {
  productForm.value.media.lifestyleImages.splice(index, 1)
}

const closeModal = () => {
  isModalOpen.value = false
  editingProduct.value = null
}

const saveProduct = async () => {
  const clampText = (value: any, limit: number) => String(value || '').slice(0, limit)
  const mainImage = productForm.value.image.trim()
  if (!mainImage) {
    toastStore.error('Əsas şəkil əlavə edin')
    activeTab.value = 'general'
    return
  }
  if (!productForm.value.categoryId) {
    toastStore.error('Kateqoriya seçin')
    activeTab.value = 'general'
    return
  }

  const normalize = (s: string) => s.trim()
  const unique = (arr: string[]) => Array.from(new Set(arr))
  const attributes = Object.entries(productForm.value.attributes || {}).reduce((acc, [rawKey, rawVal]) => {
    const key = normalize(String(rawKey || ''))
    const value = normalize(String(rawVal || ''))
    if (!key || !value) return acc
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
  const rawGallery = productForm.value.gallery.map(normalize).filter(Boolean)
  const gallery = unique(rawGallery).filter(img => img !== mainImage)
  const rawTags = String((productForm.value as any).tags || '').split(',').map(normalize).filter(Boolean)
  const tags = unique(rawTags)
  const cat = productForm.value.categoryId ? categoryById.value.get(Number(productForm.value.categoryId)) : null
  const categoryLegacy = cat ? categoryDisplayName(cat) : String(productForm.value.category || '').trim()

  const productData = {
    ...productForm.value,
    brand: clampText((productForm.value as any).brand, MAX_PRODUCT_SHORT_TEXT).trim(),
    features: clampText(productForm.value.features, MAX_PRODUCT_LONG_TEXT).split(',').map(f => f.trim()).filter(f => f),
    description: clampText((productForm.value as any).description, MAX_PRODUCT_LONG_TEXT).trim(),
    tags,
    attributes: Object.keys(attributes).length ? attributes : undefined,
    image: mainImage,
    gallery,
    media: {
      videoUrl: String(productForm.value.media.videoUrl || '').trim(),
      videoPoster: String(productForm.value.media.videoPoster || '').trim(),
      lifestyleImages: Array.from(new Set((productForm.value.media.lifestyleImages || []).map(normalize).filter(Boolean)))
    },
    seo: {
      title: clampText(productForm.value.seo.title, MAX_PRODUCT_SHORT_TEXT).trim(),
      description: clampText(productForm.value.seo.description, MAX_PRODUCT_MEDIUM_TEXT).trim(),
      keywords: clampText(productForm.value.seo.keywords, MAX_PRODUCT_SHORT_TEXT).trim()
    },
    categoryId: productForm.value.categoryId,
    category: categoryLegacy,
    sold: editingProduct.value?.sold || 0,
    total: editingProduct.value?.total || productForm.value.stock,
    rating: editingProduct.value?.rating ?? 0,
    reviewCount: editingProduct.value?.reviewCount ?? 0
  }

  if (editingProduct.value) {
    await productStore.updateProduct(editingProduct.value.id, productData)
  } else {
    await productStore.addProduct(productData)
  }
  closeModal()
}

const deleteProduct = async (id: number) => {
  if (confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) {
    await productStore.deleteProduct(id)
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Məhsulların İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Sistemdə olan bütün məhsulları buradan idarə edə bilərsiniz.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Məhsul Əlavə Et
      </button>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Məhsul adı və ya kateqoriya..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm font-bold text-gray-400">Ümumi: {{ filteredProducts.length }} məhsul</span>
          <button class="flex items-center text-gray-500 font-bold text-sm hover:text-blue-600 transition-colors">
            <Filter class="w-4 h-4 mr-2" /> Filtrlər
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">Məhsul</th>
              <th class="px-8 py-4">Kateqoriya</th>
              <th class="px-8 py-4">Brend / Atribut</th>
              <th class="px-8 py-4">Qiymət</th>
              <th class="px-8 py-4">Stok</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-2 mr-4 flex-shrink-0">
                    <img :src="product.image" :alt="product.name" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-800 line-clamp-1">{{ product.name }}</p>
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: #{{ product.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="text-sm font-medium text-gray-600">{{ product.categoryId && categoryById.get(Number(product.categoryId)) ? categoryDisplayName(categoryById.get(Number(product.categoryId)) as any) : product.category }}</span>
              </td>
              <td class="px-8 py-6">
                <div class="space-y-2">
                  <div v-if="product.brand" class="text-sm font-bold text-blue-700">{{ product.brand }}</div>
                  <div v-if="productAttributePreview(product).length" class="flex max-w-[260px] flex-wrap gap-2">
                    <span v-for="item in productAttributePreview(product)" :key="`${product.id}-${item.key}`" class="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold text-gray-600">{{ item.value }}</span>
                  </div>
                  <div v-if="!product.brand && !productAttributePreview(product).length" class="text-xs font-medium text-gray-400">Əlavə məlumat yoxdur</div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-blue-600">{{ formatMoney(product.price) }}</span>
                  <span v-if="product.oldPrice" class="text-[10px] text-gray-400 line-through font-bold">{{ formatMoney(product.oldPrice) }}</span>
                </div>
              </td>
              <td class="px-8 py-6 text-sm font-bold" :class="product.stock > 0 ? 'text-gray-700' : 'text-red-500'">
                {{ product.stock }} ədəd
              </td>
              <td class="px-8 py-6">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ product.stock > 0 ? 'AKTİV' : 'BİTİB' }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="openModal(product)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit class="w-4 h-4" /></button>
                  <button @click="deleteProduct(product.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="filteredProducts.length === 0" class="p-20 text-center">
        <Package class="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <p class="text-gray-400 font-bold uppercase tracking-widest text-sm">Məhsul tapılmadı</p>
      </div>
    </div>

    <!-- Product Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900">{{ editingProduct ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul' }}</h2>
            <p class="text-sm text-gray-500 font-medium">Məhsul məlumatlarını aşağıdakı xanalara daxil edin.</p>
          </div>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 hover:shadow-lg transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Tabs Navigation -->
        <div class="shrink-0 flex border-b border-gray-50 bg-white px-8">
          <button 
            v-for="tab in [
              { id: 'general', name: 'Ümumi', icon: Package },
              { id: 'variations', name: 'Variasiyalar', icon: ListTree },
              { id: 'gallery', name: 'Qalereya', icon: ImageIcon },
              { id: 'media', name: 'Media', icon: Layers },
              { id: 'seo', name: 'SEO', icon: Globe }
            ]" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center px-6 py-4 text-sm font-bold transition-all border-b-2',
              activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.name }}
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="flex-1 overflow-y-auto min-h-0 p-8 pr-5">
          <!-- General Tab -->
          <div v-if="activeTab === 'general'" class="space-y-6 animate-in fade-in duration-300">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Məhsulun Adı</label>
                <input v-model="productForm.name" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məsələn: iPhone 15 Pro" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kateqoriya</label>
                <select v-model.number="productForm.categoryId" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                  <option :value="null">Kateqoriya seçin</option>
                  <option v-for="opt in categoryOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Brend</label>
                <input
                  v-model="productForm.brand"
                  :disabled="!productForm.categoryId"
                  list="category-related-brands"
                  type="text"
                  class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  :placeholder="productForm.categoryId ? 'Bu kateqoriya üçün brend seçin və ya yeni daxil edin' : 'Əvvəlcə kateqoriya seçin'"
                />
                <datalist id="category-related-brands">
                  <option v-for="brand in relatedBrandOptions" :key="brand" :value="brand">{{ brand }}</option>
                </datalist>
                <div v-if="productForm.categoryId && relatedBrandOptions.length" class="flex flex-wrap gap-2 pt-1">
                  <button
                    v-for="brand in relatedBrandOptions"
                    :key="`brand-suggestion-${brand}`"
                    type="button"
                    :class="[
                      'rounded-full border px-3 py-1.5 text-xs font-extrabold transition-all',
                      productForm.brand === brand
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                    ]"
                    @click="productForm.brand = brand"
                  >
                    {{ brand }}
                  </button>
                </div>
                <p v-else-if="productForm.categoryId" class="text-[11px] font-medium text-gray-400">
                  Bu kateqoriya üçün hələ brend yaranmayıb. Yeni brendi əl ilə daxil edə bilərsiniz.
                </p>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Qiymət (AZN)</label>
                <input v-model.number="productForm.price" required type="number" step="0.01" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="0.00" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Köhnə Qiymət (AZN)</label>
                <input v-model.number="productForm.oldPrice" type="number" step="0.01" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="0.00" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Stok Miqdarı</label>
                <input v-model.number="productForm.stock" required type="number" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="0" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Əsas Şəkil URL</label>
                <input v-model="productForm.image" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="https://... və ya data:image/..." />
                <div class="flex items-center gap-3 pt-2">
                  <input @change="onMainImageSelected" type="file" accept="image/*" class="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                    <img v-if="productForm.image" :src="productForm.image" class="w-full h-full object-cover" />
                    <ImageIcon v-else class="w-full h-full p-4 text-gray-200" />
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Xüsusiyyətlər (vergüllə ayırın)</label>
              <textarea v-model="productForm.features" :maxlength="MAX_PRODUCT_LONG_TEXT" rows="3" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none" placeholder="Məsələn: 256GB yaddaş, 8GB RAM, OLED ekran"></textarea>
              <div class="text-right text-[11px] font-bold text-gray-400">{{ productForm.features.length }}/{{ MAX_PRODUCT_LONG_TEXT }}</div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açıqlama</label>
              <textarea v-model="productForm.description" :maxlength="MAX_PRODUCT_LONG_TEXT" rows="5" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none" placeholder="Məhsulun təsviri..."></textarea>
              <div class="text-right text-[11px] font-bold text-gray-400">{{ productForm.description.length }}/{{ MAX_PRODUCT_LONG_TEXT }}</div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Taglar (vergüllə ayırın)</label>
              <input v-model="productForm.tags" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məsələn: jersey, basketball" />
            </div>

            <div class="space-y-3">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Atributlar (bu kateqoriyanın filtrləri)</label>
              <div v-if="schemaGroups.length === 0" class="bg-amber-50 border border-dashed border-amber-200 rounded-2xl p-6 text-sm text-amber-800 font-medium">
                Bu kateqoriya üçün filtr sxemi qurulmayıb. Əvvəlcə <NuxtLink :to="adminPath('category-filters')" class="text-blue-600 font-extrabold hover:underline">Kateqoriya Filtrləri</NuxtLink> bölməsində yaradın.
              </div>
              <div v-else class="space-y-4">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700">{{ schemaSourceLabel }}</span>
                  <span class="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-extrabold text-gray-700">{{ filledSchemaCount }}/{{ schemaGroups.length }} doldurulub</span>
                </div>
                <div v-if="selectedAttributePreview.length" class="flex flex-wrap gap-2">
                  <span v-for="item in selectedAttributePreview" :key="`${item.label}-${item.value}`" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600">
                    {{ item.label }}: {{ item.value }}
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="g in schemaGroups" :key="g.key" class="space-y-2 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ g.label }}</div>
                  <select v-model="productForm.attributes[g.key]" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 appearance-none">
                    <option value="">Seçin</option>
                    <option v-for="opt in g.options" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Variations Tab -->
          <div v-if="activeTab === 'variations'" class="space-y-6 animate-in fade-in duration-300">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 flex items-center">
                <Layers class="w-4 h-4 mr-2 text-blue-600" />
                Məhsul Variasiyaları
              </h3>
              <button type="button" @click="addVariation" class="text-blue-600 text-xs font-bold flex items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                <Plus class="w-3 h-3 mr-1" /> Variasiya Əlavə Et
              </button>
            </div>
            
            <div v-if="productForm.variations.length === 0" class="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <p class="text-sm text-gray-400 font-medium">Hələ heç bir variasiya əlavə edilməyib.</p>
            </div>

            <div v-if="productForm.variations.length > 0" class="flex flex-col md:flex-row gap-6">
              <div class="flex md:flex-col gap-3 md:w-24 overflow-auto md:max-h-[520px]">
                <button
                  v-for="(variation, index) in productForm.variations"
                  :key="variation.id"
                  type="button"
                  @click="scrollToVariation(index)"
                  :class="['w-20 flex-shrink-0', activeVariationIndex === index ? 'opacity-100' : 'opacity-80 hover:opacity-100']"
                >
                  <div :class="['w-20 h-20 rounded-2xl border-2 overflow-hidden bg-gray-50 transition-all', activeVariationIndex === index ? 'border-blue-600' : 'border-transparent hover:border-gray-200']">
                    <img v-if="variation.image" :src="variation.image" class="w-full h-full object-cover" />
                    <ImageIcon v-else class="w-full h-full p-5 text-gray-200" />
                  </div>
                </button>
              </div>

              <div class="flex-1 space-y-4">
                <div
                  v-for="(variation, index) in productForm.variations"
                  :key="variation.id"
                  ref="variationRefs"
                  :class="['bg-gray-50 rounded-2xl p-6 relative group border', activeVariationIndex === index ? 'border-blue-200' : 'border-transparent']"
                >
                  <button @click="removeVariation(index)" type="button" class="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 p-2 rounded-xl shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ölçü/Miqdar</label>
                      <input v-model="variation.size" required type="text" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="Məs: 1" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vahid</label>
                      <select v-model="variation.unit" required class="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600">
                        <option value="ədəd">ədəd</option>
                        <option value="Litr">Litr</option>
                        <option value="Qram">Qram</option>
                        <option value="Kq-ram">Kq-ram</option>
                      </select>
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Qiymət (AZN)</label>
                      <input v-model.number="variation.price" required type="number" step="0.01" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="0.00" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stok</label>
                      <input v-model.number="variation.stock" required type="number" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="0" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil URL</label>
                      <input v-model="variation.image" type="text" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="https://... və ya data:image/..." />
                      <input @change="onVariationImageSelected(index, $event)" type="file" accept="image/*" class="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gallery Tab -->
          <div v-if="activeTab === 'gallery'" class="space-y-6 animate-in fade-in duration-300">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 flex items-center">
                <ImageIcon class="w-4 h-4 mr-2 text-blue-600" />
                Qalereya Şəkilləri
              </h3>
              <div class="flex items-center gap-2">
                <label class="text-blue-600 text-xs font-bold flex items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-all cursor-pointer">
                  <Plus class="w-3 h-3 mr-1" /> Fayl Yüklə
                  <input @change="onGalleryFilesSelected" type="file" accept="image/*" multiple class="hidden" />
                </label>
                <button type="button" @click="addGalleryImage" class="text-blue-600 text-xs font-bold flex items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                  <Plus class="w-3 h-3 mr-1" /> Link Əlavə Et
                </button>
              </div>
            </div>

            <div v-if="productForm.gallery.length === 0" class="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <p class="text-sm text-gray-400 font-medium">Hələ heç bir şəkil əlavə edilməyib.</p>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <div v-for="(image, index) in productForm.gallery" :key="index" class="flex items-center gap-4 group">
                <div class="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                  <img v-if="image" :src="image" class="w-full h-full object-cover" />
                  <ImageIcon v-else class="w-full h-full p-4 text-gray-200" />
                </div>
                <div class="flex-grow space-y-2">
                  <input v-model="productForm.gallery[index]" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Şəkil linki və ya data:image/..." />
                  <input @change="onGalleryImageSelected(index, $event)" type="file" accept="image/*" class="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <button @click="removeGalleryImage(index)" type="button" class="p-3 text-gray-400 hover:text-red-500 bg-white border border-gray-100 rounded-xl shadow-sm transition-all">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Media Tab -->
          <div v-if="activeTab === 'media'" class="space-y-6 animate-in fade-in duration-300">
            <div class="rounded-[2rem] border border-gray-100 bg-gray-50 p-6">
              <div class="text-sm font-bold text-gray-800 flex items-center">
                <Layers class="w-4 h-4 mr-2 text-blue-600" />
                Product Detail Media
              </div>
              <div class="mt-1 text-sm font-medium text-gray-500">Bu media sahələri PDP-də qlobal demo media-dan üstün tutulacaq.</div>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="space-y-2 md:col-span-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Video URL</label>
                <input v-model="productForm.media.videoUrl" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="https://... və ya /uploads/video.mp4" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Video Poster URL</label>
                <input v-model="productForm.media.videoPoster" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Poster şəkil linki..." />
                <input @change="onVideoPosterSelected" type="file" accept="image/*" class="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div class="rounded-2xl border border-gray-100 bg-white p-3">
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Poster preview</div>
                <div class="h-40 overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                  <img v-if="productForm.media.videoPoster" :src="productForm.media.videoPoster" class="h-full w-full object-cover" />
                  <div v-else class="flex h-full items-center justify-center text-sm font-bold text-gray-300">Poster yoxdur</div>
                </div>
              </div>
            </div>

            <div class="rounded-[2rem] border border-gray-100 bg-white p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <div class="text-sm font-bold text-gray-800">Lifestyle şəkilləri</div>
                  <div class="mt-1 text-sm font-medium text-gray-500">PDP-də əsas media blokunun altında ayrıca strip kimi göstəriləcək.</div>
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-blue-600 text-xs font-bold flex items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-all cursor-pointer">
                    <Plus class="w-3 h-3 mr-1" /> Fayl Yüklə
                    <input @change="onLifestyleFilesSelected" type="file" accept="image/*" multiple class="hidden" />
                  </label>
                  <button type="button" @click="addLifestyleImage" class="text-blue-600 text-xs font-bold flex items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
                    <Plus class="w-3 h-3 mr-1" /> Link Əlavə Et
                  </button>
                </div>
              </div>
              <div v-if="productForm.media.lifestyleImages.length === 0" class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm font-medium text-gray-400">
                Hələ lifestyle şəkli əlavə edilməyib.
              </div>
              <div v-else class="grid grid-cols-1 gap-4">
                <div v-for="(image, index) in productForm.media.lifestyleImages" :key="`life-${index}`" class="flex items-center gap-4 group">
                  <div class="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                    <img v-if="image" :src="image" class="w-full h-full object-cover" />
                    <ImageIcon v-else class="w-full h-full p-5 text-gray-200" />
                  </div>
                  <div class="flex-grow space-y-2">
                    <input v-model="productForm.media.lifestyleImages[index]" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Lifestyle şəkil linki..." />
                    <input @change="onLifestyleImageSelected(index, $event)" type="file" accept="image/*" class="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <button @click="removeLifestyleImage(index)" type="button" class="p-3 text-gray-400 hover:text-red-500 bg-white border border-gray-100 rounded-xl shadow-sm transition-all">
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- SEO Tab -->
          <div v-if="activeTab === 'seo'" class="space-y-6 animate-in fade-in duration-300">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SEO Başlıq</label>
              <input v-model="productForm.seo.title" :maxlength="MAX_PRODUCT_SHORT_TEXT" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Axtarış nəticələri üçün başlıq..." />
              <div class="text-right text-[11px] font-bold text-gray-400">{{ productForm.seo.title.length }}/{{ MAX_PRODUCT_SHORT_TEXT }}</div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SEO Təsvir</label>
              <textarea v-model="productForm.seo.description" :maxlength="MAX_PRODUCT_MEDIUM_TEXT" rows="4" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none" placeholder="Məhsulun qısa axtarış təsviri..."></textarea>
              <div class="text-right text-[11px] font-bold text-gray-400">{{ productForm.seo.description.length }}/{{ MAX_PRODUCT_MEDIUM_TEXT }}</div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açar Sözlər</label>
              <input v-model="productForm.seo.keywords" :maxlength="MAX_PRODUCT_SHORT_TEXT" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məsələn: iphone, telefon, apple..." />
              <div class="text-right text-[11px] font-bold text-gray-400">{{ productForm.seo.keywords.length }}/{{ MAX_PRODUCT_SHORT_TEXT }}</div>
            </div>
          </div>

          <div class="flex items-center space-x-4 pt-6 mt-10 border-t border-gray-50 sticky bottom-0 bg-white">
            <button type="button" @click="closeModal" class="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">Ləğv Et</button>
            <button type="submit" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Yadda Saxla</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
