<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { ChevronDown, ChevronRight, ChevronUp, Search } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import type { Category } from '~/stores/categories'

const props = defineProps<{
  categories: Category[]
  products: any[]
  activeCategoryId: number | null
  activeCategoryName?: string
  dense?: boolean
  mode?: 'accordion' | 'flyout'
}>()

const emit = defineEmits<{
  (e: 'select', id: number | null): void
}>()

const { t, lang } = useT()
const { iconFor, iconWrapStyleFor, iconColorStyleFor } = useCategoryPresentation()
const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const locale = computed(() => (lang.value === 'ru' ? 'ru' : lang.value === 'en' ? 'en' : 'az'))
const mode = computed(() => (props.mode === 'flyout' ? 'flyout' : 'accordion'))
const showCatalogHelperHeadings = computed(() => Boolean(settings.value.mobileExperience?.catalogHelperHeadings))
const rootEl = ref<HTMLElement | null>(null)
const isFlyoutOpen = ref(false)
const activeParentId = ref<number | null>(null)
const query = ref('')
const expanded = ref<Record<number, boolean>>({})

const categoryLabel = (category: Category | null | undefined) => {
  if (!category) return ''
  const code = lang.value
  return (category.nameI18n as any)?.[code] || category.nameI18n.az || category.nameI18n.ru || category.nameI18n.en || category.slug
}

const normalize = (value: string) => String(value || '').trim().toLocaleLowerCase(locale.value)
const sortCategories = (items: Category[]) => [...items].sort((left, right) => categoryLabel(left).localeCompare(categoryLabel(right), locale.value))

const byId = computed(() => new Map(props.categories.map(category => [category.id, category] as const)))

const parentById = computed(() => {
  const map = new Map<number, number | null>()
  for (const category of props.categories) map.set(category.id, category.parentId)
  return map
})

const legacyNameToId = computed(() => {
  const map = new Map<string, number>()
  for (const category of props.categories) {
    const legacy = String(category.nameI18n.az || '').trim()
    if (legacy) map.set(legacy, category.id)
  }
  return map
})

const activeResolvedId = computed(() => {
  if (props.activeCategoryId !== null && props.activeCategoryId !== undefined) return props.activeCategoryId
  const legacy = String(props.activeCategoryName || '').trim()
  if (!legacy) return null
  return legacyNameToId.value.get(legacy) || null
})

const childrenByParent = computed(() => {
  const map = new Map<number | null, Category[]>()
  for (const category of props.categories) {
    const key = category.parentId === null ? null : Number(category.parentId)
    const list = map.get(key) || []
    list.push(category)
    map.set(key, list)
  }
  for (const [key, list] of map.entries()) map.set(key, sortCategories(list))
  return map
})

const getChildren = (parentId: number | null | undefined) => {
  const key = parentId === null || parentId === undefined ? null : Number(parentId)
  return childrenByParent.value.get(key) || []
}

const parents = computed(() => getChildren(null))

const ownCountById = computed(() => {
  const map = new Map<number, number>()
  for (const product of props.products || []) {
    const pidRaw = product?.categoryId === null || product?.categoryId === undefined ? null : Number(product.categoryId)
    let id: number | null = null
    if (pidRaw !== null && Number.isFinite(pidRaw)) id = pidRaw
    if (id === null) {
      const legacy = String(product?.category || '').trim()
      if (legacy) id = legacyNameToId.value.get(legacy) || null
    }
    if (id !== null) map.set(id, (map.get(id) || 0) + 1)
  }
  return map
})

const totalCountById = computed(() => {
  const memo = new Map<number, number>()
  const dfs = (id: number): number => {
    if (memo.has(id)) return memo.get(id) as number
    let sum = ownCountById.value.get(id) || 0
    for (const child of getChildren(id)) sum += dfs(child.id)
    memo.set(id, sum)
    return sum
  }
  for (const category of props.categories) dfs(category.id)
  return memo
})

const allCount = computed(() => (props.products || []).length)
const searchTerm = computed(() => normalize(query.value))

const branchMatches = (categoryId: number, term = searchTerm.value): boolean => {
  if (!term) return true
  const category = byId.value.get(categoryId)
  if (!category) return false
  if (normalize(categoryLabel(category)).includes(term)) return true
  return getChildren(categoryId).some((child) => branchMatches(child.id, term))
}

const countVisibleChildren = (categoryId: number) =>
  getChildren(categoryId).filter((child) => (totalCountById.value.get(child.id) || 0) > 0 && branchMatches(child.id)).length

const countNestedSections = (categoryId: number | null | undefined) => {
  if (categoryId === null || categoryId === undefined) return 0
  const walk = (id: number): number => {
    const children = getChildren(id).filter((child) => (totalCountById.value.get(child.id) || 0) > 0 && branchMatches(child.id))
    return children.reduce((sum, child) => sum + 1 + walk(child.id), 0)
  }
  return walk(categoryId)
}

const filteredParents = computed(() =>
  parents.value.filter((parent) => (totalCountById.value.get(parent.id) || 0) > 0 && branchMatches(parent.id))
)

const getRootFromActive = (id: number | null) => {
  if (!id) return null
  let current = id
  let parentId = parentById.value.get(current) ?? null
  while (parentId !== null) {
    current = parentId
    parentId = parentById.value.get(current) ?? null
  }
  return current
}

watchEffect(() => {
  if (Object.keys(expanded.value).length > 0) return
  for (const parent of parents.value) expanded.value[parent.id] = false
})

watchEffect(() => {
  if (mode.value !== 'flyout') return
  const activeId = activeResolvedId.value
  if (!activeId) return
  let current: number | null = activeId
  while (current !== null) {
    expanded.value[current] = true
    current = parentById.value.get(current) ?? null
  }
})

watchEffect(() => {
  const targetRoot = getRootFromActive(activeResolvedId.value)
  const fallbackRoot = filteredParents.value[0]?.id ?? null
  if (targetRoot && filteredParents.value.some((item) => item.id === targetRoot)) {
    activeParentId.value = targetRoot
    return
  }
  if (activeParentId.value !== null && filteredParents.value.some((item) => item.id === activeParentId.value)) return
  activeParentId.value = fallbackRoot
})

const activeParent = computed(() => filteredParents.value.find((item) => item.id === activeParentId.value) || null)

const activeParentChildren = computed(() => {
  if (!activeParent.value) return []
  return getChildren(activeParent.value.id).filter((child) => (totalCountById.value.get(child.id) || 0) > 0 && branchMatches(child.id))
})

const activeHighlights = computed(() => {
  const highlightSource = activeParentChildren.value.flatMap((child) => getChildren(child.id).filter((leaf) => (totalCountById.value.get(leaf.id) || 0) > 0 && branchMatches(leaf.id)))
  return highlightSource.slice(0, 10)
})

const activeCollections = computed(() =>
  activeParentChildren.value.slice(0, 8).map((category) => {
    const children = getChildren(category.id).filter((child) => (totalCountById.value.get(child.id) || 0) > 0 && branchMatches(child.id))
    return {
      category,
      items: children.slice(0, 4),
      total: children.length
    }
  })
)

const visibleChildren = (parentId: number) =>
  getChildren(parentId).filter((child) => (totalCountById.value.get(child.id) || 0) > 0 && branchMatches(child.id))

const visibleGrandchildren = (parentId: number) =>
  getChildren(parentId).filter((child) => (totalCountById.value.get(child.id) || 0) > 0 && branchMatches(child.id))

const isWithinBranch = (branchId: number, targetId: number | null) => {
  if (!targetId) return false
  if (branchId === targetId) return true
  return getChildren(branchId).some((child) => isWithinBranch(child.id, targetId))
}

const hasActiveCategory = computed(() => activeResolvedId.value !== null)
const isActive = (id: number | null) => id === null ? activeResolvedId.value === null : activeResolvedId.value === id
const isExpanded = (id: number) => Boolean(expanded.value[id])

const select = (id: number | null) => emit('select', id)
const closeDescendants = (id: number) => {
  for (const child of getChildren(id)) {
    expanded.value[child.id] = false
    closeDescendants(child.id)
  }
}
const toggle = (id: number) => {
  const next = !isExpanded(id)
  const parentId = parentById.value.get(id) ?? null

  for (const sibling of getChildren(parentId)) {
    if (sibling.id === id) continue
    expanded.value[sibling.id] = false
    closeDescendants(sibling.id)
  }

  expanded.value[id] = next
  if (!next) closeDescendants(id)
}
const openParent = (id: number) => {
  activeParentId.value = id
  isFlyoutOpen.value = true
}

const selectAndMaybeClose = (id: number | null) => {
  select(id)
  if (mode.value === 'flyout') isFlyoutOpen.value = false
}

const onDocClick = (event: MouseEvent) => {
  if (mode.value !== 'flyout') return
  const root = rootEl.value
  const target = event.target as Node | null
  if (root && target && root.contains(target)) return
  isFlyoutOpen.value = false
}

onMounted(() => {
  if (process.server) return
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  if (process.server) return
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div v-if="mode === 'flyout'" ref="rootEl" class="relative z-40 overflow-visible">
    <div class="overflow-hidden rounded-xl border border-slate-200/80 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] shadow-sm">
      <div class="border-b border-slate-200/80 px-4 py-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <div class="text-[11px] font-extrabold uppercase tracking-[0.26em] text-slate-400">Shop kataloqu</div>
            <div class="mt-1 text-base font-extrabold text-slate-900">Rahat seçim</div>
          </div>
          <span class="rounded-lg bg-white px-3 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">{{ filteredParents.length }}</span>
        </div>
        <div class="flex items-center rounded-lg border border-slate-200 bg-white px-3">
          <Search class="h-4 w-4 text-slate-400" />
          <input v-model="query" type="text" placeholder="Kateqoriya axtar" class="h-11 w-full bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" />
        </div>
      </div>

      <div class="p-3">
        <button
          type="button"
          class="mb-2 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition"
          :class="isActive(null) ? 'border-blue-200 bg-white text-slate-900 shadow-sm' : 'border-transparent bg-white/80 text-slate-800 hover:border-slate-200 hover:bg-white'"
          @click="selectAndMaybeClose(null)"
        >
          <span class="flex items-center gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/70 shadow-sm" :style="iconWrapStyleFor({ id: 0 })">
              <component :is="iconFor('Package')" class="h-4.5 w-4.5" />
            </span>
            <span class="text-sm font-bold">{{ t('all_categories' as any) }}</span>
          </span>
          <span class="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{{ allCount }}</span>
        </button>

        <div class="max-h-[62vh] space-y-2 overflow-auto">
          <button
            v-for="parent in filteredParents"
            :key="parent.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
            :class="isWithinBranch(parent.id, activeResolvedId) ? 'border-blue-200 bg-white text-slate-900 shadow-[0_18px_35px_-30px_rgba(37,99,235,0.8)]' : activeParentId === parent.id && hasActiveCategory ? 'border-slate-200 bg-white text-slate-900' : 'border-transparent bg-white/75 text-slate-800 hover:border-slate-200 hover:bg-white'"
            @mouseenter="openParent(parent.id)"
            @click="openParent(parent.id)"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/70 shadow-sm" :style="iconWrapStyleFor(parent)">
              <component :is="iconFor(parent)" class="h-5 w-5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block line-clamp-2 text-sm font-bold">{{ categoryLabel(parent) }}</span>
            </span>
            <span class="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{{ totalCountById.get(parent.id) || 0 }}</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isFlyoutOpen && activeParent"
      class="absolute left-[calc(100%+14px)] top-0 w-[min(760px,calc(100vw-410px))] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_30px_70px_-30px_rgba(15,23,42,0.4)]"
    >
      <div class="border-b border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div v-if="showCatalogHelperHeadings" class="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Seçilmiş bölmə</div>
            <div class="mt-1 truncate text-xl font-extrabold text-slate-900">{{ categoryLabel(activeParent) }}</div>
            <div v-if="showCatalogHelperHeadings" class="mt-1 text-sm font-medium text-slate-500">Alt kataloqları kart görünüşündə seçin və birbaşa keçin.</div>
          </div>
          <button type="button" class="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-slate-800" @click="selectAndMaybeClose(activeParent.id)">
            Hamısına bax
          </button>
        </div>
        <div v-if="showCatalogHelperHeadings" class="mt-4 grid grid-cols-3 gap-3">
          <div class="rounded-lg border border-slate-100 bg-white px-4 py-3">
            <div class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Bölmə</div>
            <div class="mt-2 text-2xl font-extrabold text-slate-900">{{ activeParentChildren.length }}</div>
          </div>
          <div class="rounded-lg border border-slate-100 bg-white px-4 py-3">
            <div class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Alt kataloq</div>
            <div class="mt-2 text-2xl font-extrabold text-slate-900">{{ countNestedSections(activeParent.id) }}</div>
          </div>
          <div class="rounded-lg border border-slate-100 bg-white px-4 py-3">
            <div class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Məhsul</div>
            <div class="mt-2 text-2xl font-extrabold text-slate-900">{{ totalCountById.get(activeParent.id) || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="max-h-[62vh] overflow-auto p-5">
        <div v-if="activeHighlights.length" class="mb-5">
          <div v-if="showCatalogHelperHeadings" class="mb-3 flex items-center justify-between">
            <div class="text-[11px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Sürətli keçidlər</div>
            <div class="text-xs font-medium text-slate-400">Ən çox seçilən hissələr</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in activeHighlights"
              :key="item.id"
              type="button"
              class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 inline-flex items-center gap-1.5"
              @click="selectAndMaybeClose(item.id)"
            >
              <component :is="iconFor(item)" class="h-3.5 w-3.5" :style="iconColorStyleFor(item)" />
              <span>{{ categoryLabel(item) }}</span>
            </button>
          </div>
        </div>

        <div v-if="activeCollections.length" class="grid gap-3 xl:grid-cols-2">
          <div
            v-for="group in activeCollections"
            :key="group.category.id"
            class="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white"
          >
            <div class="flex items-start justify-between gap-3">
              <button type="button" class="min-w-0 text-left flex items-start gap-3" @click="selectAndMaybeClose(group.category.id)">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 shadow-sm" :style="iconWrapStyleFor(group.category)">
                  <component :is="iconFor(group.category)" class="h-4.5 w-4.5" />
                </span>
                <span class="min-w-0">
                  <span class="block line-clamp-2 text-sm font-extrabold text-slate-900">{{ categoryLabel(group.category) }}</span>
                </span>
              </button>
              <button type="button" class="shrink-0 rounded-lg bg-white px-3 py-1 text-[11px] font-extrabold text-blue-700 ring-1 ring-slate-200 transition hover:bg-blue-50" @click="selectAndMaybeClose(group.category.id)">
                Aç
              </button>
            </div>
            <div v-if="group.items.length" class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                class="rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700 inline-flex items-center gap-1.5"
                @click="selectAndMaybeClose(item.id)"
              >
                <component :is="iconFor(item)" class="h-3.5 w-3.5" :style="iconColorStyleFor(item)" />
                <span>{{ categoryLabel(item) }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm font-medium text-slate-500">
          {{ t('not_found') }}
        </div>
      </div>
    </div>
  </div>

  <div v-else class="space-y-3">
    <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <div class="text-[11px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Kateqoriya seçimi</div>
          <div class="mt-1 text-base font-extrabold text-slate-900">Mobil kataloq</div>
        </div>
      </div>
      <div class="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
        <Search class="h-4 w-4 text-slate-400" />
        <input v-model="query" type="text" placeholder="Kateqoriya axtar" class="h-11 w-full bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" />
      </div>
      <button
        type="button"
        class="mt-3 flex w-full items-center justify-between rounded-lg border px-4 py-3 transition"
        :class="isActive(null) ? 'border-[color:var(--color-primary,#2B3E95)] bg-[color:var(--color-primary,#2B3E95)] text-white' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'"
        @click="select(null)"
      >
        <span class="flex items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/70 shadow-sm" :style="iconWrapStyleFor({ id: 0 })">
            <component :is="iconFor('Package')" class="h-4.5 w-4.5" />
          </span>
          <span class="text-sm font-bold">{{ t('all_categories' as any) }}</span>
        </span>
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <div :class="[dense ? 'space-y-2' : 'max-h-[72vh] space-y-3 overflow-auto pr-1']">
      <div
        v-for="parent in filteredParents"
        :key="parent.id"
        class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm"
      >
        <div class="flex items-center gap-3 px-4 py-4" :class="isWithinBranch(parent.id, activeResolvedId) ? 'bg-blue-50/60' : 'bg-white'">
          <button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" @click="toggle(parent.id)">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/70 shadow-sm" :style="iconWrapStyleFor(parent)">
              <component :is="iconFor(parent)" class="h-5 w-5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block line-clamp-2 text-sm font-extrabold text-slate-900">{{ categoryLabel(parent) }}</span>
              <span class="mt-1 block text-[11px] font-medium text-slate-400">Alt kataloqları açmaq üçün toxunun</span>
            </span>
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-slate-50 p-2 text-slate-500 ring-1 ring-slate-200"
            @click="toggle(parent.id)"
          >
            <ChevronUp v-if="isExpanded(parent.id)" class="h-4 w-4" />
            <ChevronDown v-else class="h-4 w-4" />
          </button>
        </div>

        <div v-if="isExpanded(parent.id)" class="border-t border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
          <div class="mb-3 flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3">
            <div class="min-w-0">
              <div class="text-sm font-extrabold text-slate-900">{{ categoryLabel(parent) }}</div>
              <div class="mt-1 text-[11px] font-medium text-slate-400">Ana kataloqu birbaşa seçmək üçün düymədən istifadə edin</div>
            </div>
            <button type="button" class="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-extrabold text-white" @click="select(parent.id)">
              Seç
            </button>
          </div>
          <div
            v-if="visibleChildren(parent.id).length"
            class="space-y-3"
          >
            <div
              v-for="child in visibleChildren(parent.id)"
              :key="child.id"
              class="rounded-lg border border-slate-100 bg-white p-4"
            >
              <div class="flex items-start gap-3">
                <button
                  type="button"
                  class="flex min-w-0 flex-1 items-start gap-3 text-left"
                  @click="visibleGrandchildren(child.id).length ? toggle(child.id) : select(child.id)"
                >
                  <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/70 shadow-sm" :style="iconWrapStyleFor(child)">
                    <component :is="iconFor(child)" class="h-5 w-5" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block line-clamp-2 text-sm font-bold text-slate-900">{{ categoryLabel(child) }}</span>
                    <span class="mt-1 block text-[11px] font-medium text-slate-400">
                      {{ visibleGrandchildren(child.id).length ? 'Alt kataloqları göstər' : 'Birbaşa seçim' }}
                    </span>
                  </span>
                  <span
                    v-if="visibleGrandchildren(child.id).length"
                    class="shrink-0 rounded-lg bg-slate-50 p-2 text-slate-500 ring-1 ring-slate-200"
                  >
                    <ChevronUp v-if="isExpanded(child.id)" class="h-4 w-4" />
                    <ChevronDown v-else class="h-4 w-4" />
                  </span>
                </button>
                <button type="button" class="shrink-0 rounded-lg bg-slate-50 px-3 py-1 text-[11px] font-extrabold text-blue-700 ring-1 ring-slate-200 transition hover:bg-blue-50" @click="select(child.id)">
                  Seç
                </button>
              </div>

              <div
                v-if="visibleGrandchildren(child.id).length && isExpanded(child.id)"
                class="mt-3 flex flex-wrap gap-2 rounded-lg bg-slate-50 p-3"
              >
                <button
                  v-for="leaf in visibleGrandchildren(child.id).slice(0, 8)"
                  :key="leaf.id"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700"
                  @click="select(leaf.id)"
                >
                  <component :is="iconFor(leaf)" class="h-3.5 w-3.5" :style="iconColorStyleFor(leaf)" />
                  <span>{{ categoryLabel(leaf) }}</span>
                  <ChevronRight class="h-3 w-3" />
                </button>
              </div>

              <div
                v-else-if="visibleGrandchildren(child.id).length"
                class="mt-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-[11px] font-medium text-slate-400"
              >
                Alt kataloqları görmək üçün ox düyməsinə toxunun.
              </div>
            </div>
          </div>

          <div v-else class="rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center text-sm font-medium text-slate-500">
            {{ t('not_found') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
