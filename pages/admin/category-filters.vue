<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { SlidersHorizontal, Plus, Trash2, Save, ListTree } from 'lucide-vue-next'
import { useCategoryStore, type Category } from '~/stores/categories'
import { useCategoryFilterStore, type CategoryFilterGroup } from '~/stores/categoryFilters'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const categoryStore = useCategoryStore()
const filterStore = useCategoryFilterStore()
const toastStore = useToastStore()

if (!categoryStore.hydrated || categoryStore.categories.length === 0) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const categories = await fetcher('/api/categories')
    categoryStore.setCategories(categories as any)
  } else {
    await categoryStore.fetchCategories()
  }
}

if (!filterStore.hydrated) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const schemas = await fetcher('/api/category-filters')
    filterStore.setSchemas(schemas as any)
  } else {
    await filterStore.fetchSchemas()
  }
}

const categoryDisplayName = (c: Category) => c.nameI18n.az || c.nameI18n.ru || c.nameI18n.en || c.slug

const categoryOptions = computed(() => {
  const parents = categoryStore.categories
    .filter(c => c.parentId === null)
    .sort((a, b) => categoryDisplayName(a).localeCompare(categoryDisplayName(b), 'az'))
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

const normalizeKey = (raw: string) => {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\u00C0-\u017F\u0180-\u024F\u0600-\u06FF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const selectedCategoryId = ref<number | null>(null)
const groups = ref<CategoryFilterGroup[]>([])
const selectedSchema = computed(() => selectedCategoryId.value ? filterStore.getSchema(selectedCategoryId.value) : null)
const schemaSourceLabel = computed(() => selectedSchema.value?.source === 'custom' ? 'Custom sxem' : 'Auto şablon')
const schemaSourceTone = computed(() => selectedSchema.value?.source === 'custom'
  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
  : 'border-blue-200 bg-blue-50 text-blue-700'
)

watchEffect(() => {
  const id = selectedCategoryId.value
  if (!id) {
    groups.value = []
    return
  }
  const schema = filterStore.getSchema(id)
  groups.value = schema ? JSON.parse(JSON.stringify(schema.groups)) : []
})

const addGroup = () => {
  groups.value.push({ key: '', label: '', options: [] })
}

const removeGroup = (index: number) => {
  groups.value.splice(index, 1)
}

const addOption = (groupIndex: number) => {
  groups.value[groupIndex].options.push('')
}

const removeOption = (groupIndex: number, optionIndex: number) => {
  groups.value[groupIndex].options.splice(optionIndex, 1)
}

const save = async () => {
  if (!selectedCategoryId.value) {
    toastStore.error('Kateqoriya seçin')
    return
  }
  const cleaned = groups.value
    .map(g => {
      const label = String(g.label || '').trim()
      const key = normalizeKey(g.key || label)
      const options = Array.from(new Set((g.options || []).map(o => String(o || '').trim()).filter(Boolean)))
      return { key, label, options }
    })
    .filter(g => g.key && g.label && g.options.length > 0)
  await filterStore.upsertSchema(selectedCategoryId.value, cleaned as any)
  toastStore.success('Yadda saxlandı')
}

const removeSchema = async () => {
  if (!selectedCategoryId.value) return
  await filterStore.deleteSchema(selectedCategoryId.value)
  groups.value = []
  toastStore.success('Xüsusi sxem silindi, avtomatik şablon bərpa olundu')
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <SlidersHorizontal class="w-7 h-7 text-blue-600" />
          Kateqoriya Filtrləri
        </h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Hər kateqoriya üçün filtrləmə qrupları və seçimlərini buradan qurun. Saxlanmayan kateqoriyalar üçün uyğun default şablonlar avtomatik gəlir.</p>
      </div>
      <div class="flex items-center gap-3">
        <button type="button" class="px-5 py-3 rounded-2xl border border-gray-100 bg-white text-gray-700 font-extrabold text-sm hover:bg-gray-50 transition-all" @click="removeSchema" :disabled="!selectedCategoryId">
          <Trash2 class="w-4 h-4 inline-block mr-2" /> Sil
        </button>
        <button type="button" class="bg-blue-600 px-6 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all" @click="save" :disabled="!selectedCategoryId">
          <Save class="w-4 h-4 mr-2" /> Yadda saxla
        </button>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-6 space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kateqoriya</label>
            <select v-model.number="selectedCategoryId" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option :value="null">Kateqoriya seçin</option>
              <option v-for="opt in categoryOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
            </select>
          </div>
          <div class="lg:col-span-6 bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600">
              <ListTree class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <div class="text-sm font-extrabold text-gray-900">Filter sxemi mənbəyi</div>
                <span v-if="selectedCategoryId" :class="['rounded-full border px-3 py-1 text-[11px] font-extrabold', schemaSourceTone]">{{ schemaSourceLabel }}</span>
              </div>
              <div class="text-xs text-gray-500 font-medium break-words">
                <span v-if="selectedCategoryId && selectedSchema?.source === 'custom'">Bu kateqoriya üçün xüsusi sxem saxlanıb və storefront həmin sxemdən istifadə edir.</span>
                <span v-else-if="selectedCategoryId">Bu kateqoriya üçün avtomatik şablon işləyir. Saxlasanız custom sxemə çevriləcək.</span>
                <span v-else>Geyimdə ölçü və rəng, elektronikada yaddaş və bağlantı, avtomobildə qatılıq və uyğunluq kimi filterlər kateqoriyaya görə özü formalaşır.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-8 space-y-8">
        <div v-if="!selectedCategoryId" class="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-16 text-center">
          <p class="text-gray-500 font-bold">Başlamaq üçün kateqoriya seçin</p>
        </div>

        <div v-else class="space-y-6">
          <div class="flex items-center justify-between">
            <div class="text-sm font-extrabold text-gray-900">Filtr Qrupları</div>
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 text-blue-700 font-extrabold text-xs hover:bg-blue-100 transition-all" @click="addGroup">
              <Plus class="w-4 h-4" /> Qrup əlavə et
            </button>
          </div>

          <div v-if="groups.length === 0" class="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <p class="text-sm text-gray-500 font-medium">Bu kateqoriya üçün hələ xüsusi filtr qrupları yoxdur.</p>
            <p class="mt-2 text-xs font-medium text-gray-400">Avtomatik şablon işləyir. İstəsəniz aşağıdakı düymə ilə custom qrup əlavə edib override edə bilərsiniz.</p>
          </div>

          <div v-for="(g, gi) in groups" :key="gi" class="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
                <div class="md:col-span-6">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Qrup adı</div>
                  <input v-model="g.label" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məs: Qatılıq" />
                </div>
                <div class="md:col-span-6">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Açar (istəyə görə)</div>
                  <input v-model="g.key" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məs: viscosity" />
                </div>
              </div>
              <button type="button" class="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center" @click="removeGroup(gi)">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="text-xs font-extrabold text-gray-700">Seçimlər</div>
                <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-900 text-white font-extrabold text-xs hover:bg-black transition-all" @click="addOption(gi)">
                  <Plus class="w-4 h-4" /> Seçim əlavə et
                </button>
              </div>

              <div v-if="g.options.length === 0" class="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-sm text-gray-500 font-medium">
                Seçim əlavə edin (məs: 5W-30)
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="(opt, oi) in g.options" :key="oi" class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                  <input v-model="g.options[oi]" type="text" class="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="Məs: 5W-30" />
                  <button type="button" class="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center" @click="removeOption(gi, oi)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
