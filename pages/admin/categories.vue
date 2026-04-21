<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { Package, Search, Plus, Edit, Trash2, X, Tag, ImagePlus, ChevronRight, FolderTree } from 'lucide-vue-next'
import { useCategoryStore, type Category } from '~/stores/categories'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const categoryStore = useCategoryStore()
const toastStore = useToastStore()
const { rootCategories, getChildren, getDescendantIds, getBreadcrumb, flatOptions } = useCategoryTree()
const searchQuery = ref('')
const isModalOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const activeRootId = ref<number | null>(null)
const activeBranchId = ref<number | null>(null)

const categoryForm = ref({
  parentId: null as number | null,
  nameAz: '',
  nameRu: '',
  nameEn: '',
  descriptionAz: '',
  descriptionRu: '',
  descriptionEn: '',
  slug: '',
  icon: 'Package',
  image: '',
  featuredOnHome: false
})

if (!categoryStore.hydrated || categoryStore.categories.length === 0) {
  await categoryStore.fetchCategories()
}

const displayName = (c: Category) => c.nameI18n.az || c.nameI18n.ru || c.nameI18n.en || c.slug
const displayDescription = (c: Category) => c.descriptionI18n?.az || c.descriptionI18n?.ru || c.descriptionI18n?.en || ''

const byId = computed(() => {
  return new Map(categoryStore.categories.map(c => [c.id, c] as const))
})

const orderedCategories = computed(() => {
  const parents = categoryStore.categories.filter(c => c.parentId === null).sort((a, b) => displayName(a).localeCompare(displayName(b), 'az'))
  const childrenByParent = new Map<number, Category[]>()
  for (const c of categoryStore.categories) {
    if (c.parentId === null) continue
    const list = childrenByParent.get(c.parentId) || []
    list.push(c)
    childrenByParent.set(c.parentId, list)
  }
  for (const [k, list] of childrenByParent.entries()) {
    childrenByParent.set(k, list.sort((a, b) => displayName(a).localeCompare(displayName(b), 'az')))
  }
  const out: { category: Category; depth: number }[] = []
  const walk = (cat: Category, depth: number) => {
    out.push({ category: cat, depth })
    const kids = childrenByParent.get(cat.id) || []
    for (const child of kids) walk(child, depth + 1)
  }
  for (const p of parents) walk(p, 0)
  return out
})

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const base = orderedCategories.value.map(r => r.category)
  if (!q) return base
  return base.filter(c => {
    const s = `${c.slug} ${c.nameI18n.az} ${c.nameI18n.ru} ${c.nameI18n.en} ${c.descriptionI18n?.az || ''} ${c.descriptionI18n?.ru || ''} ${c.descriptionI18n?.en || ''}`.toLowerCase()
    return s.includes(q)
  })
})

const allowedParentOptions = computed(() => {
  const blockedIds = new Set<number>()
  if (editingCategory.value) {
    blockedIds.add(editingCategory.value.id)
    for (const id of getDescendantIds(editingCategory.value.id)) blockedIds.add(id)
  }
  return flatOptions.value.filter(option => !blockedIds.has(option.id))
})

const levelLabel = computed(() => {
  if (categoryForm.value.parentId === null) return 'Ana kataloq'
  const depth = getBreadcrumb(categoryForm.value.parentId).length
  if (depth <= 1) return 'Alt kataloq'
  return `${depth + 1}-cü səviyyə`
})

const activeRoot = computed(() => {
  if (activeRootId.value === null) return rootCategories.value[0] || null
  return rootCategories.value.find(category => category.id === activeRootId.value) || rootCategories.value[0] || null
})

const activeChildren = computed(() => (activeRoot.value ? getChildren(activeRoot.value.id) : []))

const activeBranch = computed(() => {
  if (activeBranchId.value === null) return activeChildren.value[0] || null
  return activeChildren.value.find(category => category.id === activeBranchId.value) || activeChildren.value[0] || null
})

const activeGrandchildren = computed(() => (activeBranch.value ? getChildren(activeBranch.value.id) : []))

watchEffect(() => {
  if (activeRootId.value === null && rootCategories.value.length > 0) {
    activeRootId.value = rootCategories.value[0].id
  }
  if (activeRoot.value) {
    const currentExists = activeChildren.value.some(category => category.id === activeBranchId.value)
    activeBranchId.value = currentExists ? activeBranchId.value : (activeChildren.value[0]?.id ?? null)
  }
})

const openModal = (category?: Category) => {
  if (category) {
    editingCategory.value = category
    categoryForm.value = {
      parentId: category.parentId,
      nameAz: category.nameI18n.az || '',
      nameRu: category.nameI18n.ru || '',
      nameEn: category.nameI18n.en || '',
      descriptionAz: category.descriptionI18n?.az || '',
      descriptionRu: category.descriptionI18n?.ru || '',
      descriptionEn: category.descriptionI18n?.en || '',
      slug: category.slug,
      icon: category.icon,
      image: category.image || '',
      featuredOnHome: Boolean(category.featuredOnHome)
    }
  } else {
    editingCategory.value = null
    categoryForm.value = {
      parentId: null,
      nameAz: '',
      nameRu: '',
      nameEn: '',
      descriptionAz: '',
      descriptionRu: '',
      descriptionEn: '',
      slug: '',
      icon: 'Package',
      image: '',
      featuredOnHome: false
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingCategory.value = null
}

const saveCategory = async () => {
  const payload = {
    parentId: categoryForm.value.parentId,
    slug: categoryForm.value.slug,
    icon: categoryForm.value.icon,
    image: categoryForm.value.image || undefined,
    featuredOnHome: Boolean(categoryForm.value.featuredOnHome),
    nameI18n: {
      az: categoryForm.value.nameAz,
      ru: categoryForm.value.nameRu,
      en: categoryForm.value.nameEn,
    },
    descriptionI18n: {
      az: categoryForm.value.descriptionAz,
      ru: categoryForm.value.descriptionRu,
      en: categoryForm.value.descriptionEn,
    },
  }
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, payload as any)
    } else {
      await categoryStore.addCategory(payload as any)
    }
    closeModal()
  } catch (e: any) {
    toastStore.error(e?.data?.message || 'Xəta baş verdi')
  }
}

const deleteCategory = async (id: number) => {
  if (confirm('Bu kateqoriyanı silmək istədiyinizə əminsiniz?')) {
    try {
      await categoryStore.deleteCategory(id)
    } catch (e: any) {
      toastStore.error(e?.data?.message || 'Xəta baş verdi')
    }
  }
}

const uploadImage = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const body = new FormData()
    body.append('file', file)
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
    categoryForm.value.image = res.url
  } catch (e: any) {
    toastStore.error(e?.data?.message || 'Şəkil yüklənmədi')
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Kateqoriya İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Mağaza kateqoriyalarını buradan idarə edə bilərsiniz.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Kateqoriya
      </button>
    </div>

    <div class="grid gap-6 xl:grid-cols-[280px,320px,1fr]">
      <div class="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center gap-2 px-2">
          <FolderTree class="h-5 w-5 text-blue-600" />
          <div class="text-lg font-extrabold text-gray-900">Ana kataloqlar</div>
        </div>
        <div class="space-y-2">
          <button
            v-for="category in rootCategories"
            :key="category.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-[1.4rem] border px-4 py-3 text-left transition"
            :class="activeRoot?.id === category.id ? 'border-blue-200 bg-blue-50/70 text-gray-900' : 'border-gray-100 bg-gray-50/60 text-gray-800 hover:bg-white'"
            @mouseenter="activeRootId = category.id"
            @click="activeRootId = category.id"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <img v-if="category.image" :src="category.image" alt="" class="h-full w-full object-cover" />
              <Tag v-else class="h-4 w-4 text-gray-300" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-extrabold">{{ displayName(category) }}</span>
              <span v-if="displayDescription(category)" class="mt-1 block line-clamp-2 text-[11px] font-medium text-gray-400">{{ displayDescription(category) }}</span>
            </span>
            <ChevronRight class="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3 px-2">
          <div>
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Alt kataloqlar</div>
            <div class="mt-1 text-lg font-extrabold text-gray-900">{{ activeRoot ? displayName(activeRoot) : '—' }}</div>
          </div>
        </div>
        <div v-if="activeChildren.length" class="space-y-2">
          <button
            v-for="category in activeChildren"
            :key="category.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-[1.4rem] border px-4 py-3 text-left transition"
            :class="activeBranch?.id === category.id ? 'border-blue-200 bg-blue-50/70 text-gray-900' : 'border-gray-100 bg-gray-50/60 text-gray-800 hover:bg-white'"
            @mouseenter="activeBranchId = category.id"
            @click="activeBranchId = category.id"
          >
            <span class="flex-1">
              <span class="block text-sm font-bold">{{ displayName(category) }}</span>
              <span v-if="displayDescription(category)" class="mt-1 block line-clamp-2 text-[11px] font-medium text-gray-400">{{ displayDescription(category) }}</span>
            </span>
            <ChevronRight class="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div v-else class="rounded-[1.5rem] border border-dashed border-gray-200 px-4 py-8 text-center text-sm font-medium text-gray-500">
          Bu ana kataloq üçün hələ alt kateqoriya yoxdur.
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm">
        <div class="mb-4 px-2">
          <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">3-cü səviyyə</div>
          <div class="mt-1 text-lg font-extrabold text-gray-900">{{ activeBranch ? displayName(activeBranch) : '—' }}</div>
        </div>
        <div v-if="activeGrandchildren.length" class="grid gap-2 md:grid-cols-2">
          <div
            v-for="category in activeGrandchildren"
            :key="category.id"
            class="rounded-[1.4rem] border border-gray-100 bg-gray-50/60 px-4 py-4 text-sm font-bold text-gray-800"
          >
            <div>{{ displayName(category) }}</div>
            <div v-if="displayDescription(category)" class="mt-1 text-[11px] font-medium text-gray-400">{{ displayDescription(category) }}</div>
          </div>
        </div>
        <div v-else class="rounded-[1.5rem] border border-dashed border-gray-200 px-4 py-8 text-center text-sm font-medium text-gray-500">
          Bu alt kataloq üçün daha dərin alt kateqoriya əlavə edə bilərsiniz.
        </div>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Kateqoriya axtar..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">ID</th>
              <th class="px-8 py-4">Kateqoriya Adı</th>
              <th class="px-8 py-4">Yol</th>
              <th class="px-8 py-4">Slug</th>
              <th class="px-8 py-4">Açıqlama</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="category in filteredCategories" :key="category.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6 text-sm font-bold text-blue-600">#{{ category.id }}</td>
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3 text-blue-600 overflow-hidden">
                    <img v-if="category.image" :src="category.image" alt="" class="w-full h-full object-cover" />
                    <Tag v-else class="w-5 h-5" />
                  </div>
                  <div>
                    <span class="text-sm font-bold text-gray-800">{{ displayName(category) }}</span>
                    <div v-if="category.featuredOnHome" class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-600 mt-1">Ana səhifə</div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">
                {{ getBreadcrumb(category.id).map(item => displayName(item)).join(' / ') }}
              </td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">{{ category.slug }}</td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">{{ displayDescription(category) || '—' }}</td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="openModal(category)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit class="w-4 h-4" /></button>
                  <button @click="deleteCategory(category.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingCategory ? 'Kateqoriyanı Redaktə Et' : 'Yeni Kateqoriya' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveCategory" class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Parent Kateqoriya</label>
            <select v-model="categoryForm.parentId" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option :value="null">—</option>
              <option v-for="option in allowedParentOptions" :key="option.id" :value="option.id">
                {{ `${'— '.repeat(option.depth)}${option.label}` }}
              </option>
            </select>
            <div class="text-xs font-medium text-gray-500">Seçilən struktur: {{ levelLabel }}</div>
          </div>
          <div class="grid gap-4 lg:grid-cols-3">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ad (AZ)</label>
              <input v-model="categoryForm.nameAz" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məsələn: Elektronika" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ad (RU)</label>
              <input v-model="categoryForm.nameRu" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Например: Электроника" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ad (EN)</label>
              <input v-model="categoryForm.nameEn" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="e.g. Electronics" />
            </div>
          </div>
          <div class="grid gap-4 lg:grid-cols-3">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açıqlama (AZ)</label>
              <textarea v-model="categoryForm.descriptionAz" rows="4" class="w-full resize-none bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Kateqoriya haqqında qısa məlumat"></textarea>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açıqlama (RU)</label>
              <textarea v-model="categoryForm.descriptionRu" rows="4" class="w-full resize-none bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Краткое описание категории"></textarea>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açıqlama (EN)</label>
              <textarea v-model="categoryForm.descriptionEn" rows="4" class="w-full resize-none bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Short category description"></textarea>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Slug</label>
            <input v-model="categoryForm.slug" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="elektronika" />
          </div>
          <div class="space-y-3">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kateqoriya şəkli</label>
            <label class="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-2xl border border-dashed border-gray-300 text-gray-600 font-bold cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-all">
              <ImagePlus class="w-5 h-5" />
              Şəkil yüklə
              <input type="file" accept="image/*" class="hidden" @change="uploadImage" />
            </label>
            <input v-model="categoryForm.image" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Şəkil linki" />
            <img v-if="categoryForm.image" :src="categoryForm.image" alt="" class="w-full h-36 object-cover rounded-2xl border border-gray-100" />
          </div>
          <label class="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
            <div>
              <div class="text-sm font-bold text-gray-900">Ana səhifədə göstər</div>
              <div class="text-xs font-medium text-gray-500 mt-1">Kateqoriya showcase hissəsində göstərilir.</div>
            </div>
            <input v-model="categoryForm.featuredOnHome" type="checkbox" class="w-5 h-5" />
          </label>

          <div class="sticky bottom-0 flex items-center space-x-4 border-t border-gray-100 bg-white/95 pt-4 backdrop-blur">
            <button type="button" @click="closeModal" class="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">Ləğv Et</button>
            <button type="submit" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Yadda Saxla</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
