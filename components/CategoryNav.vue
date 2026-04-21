<script setup lang="ts">
import { ChevronDown, ChevronRight, Menu } from 'lucide-vue-next'
import { useCategoryStore } from '~/stores/categories'

const categoryStore = useCategoryStore()
const { t, lang } = useT()
const { iconFor, cardStyleFor, iconWrapStyleFor, iconColorStyleFor } = useCategoryPresentation()

if (!categoryStore.hydrated) {
  await categoryStore.fetchCategories()
}

const open = ref(false)
const activeParentId = ref<number | null>(null)

const label = (c: any) => {
  const l = lang.value
  return c?.nameI18n?.[l] || c?.nameI18n?.az || c?.name || ''
}

const parents = computed(() => categoryStore.categories.filter((c: any) => !c.parentId))
const childrenByParent = computed(() => {
  const map = new Map<number, any[]>()
  for (const c of categoryStore.categories) {
    if (c.parentId) {
      if (!map.has(c.parentId)) map.set(c.parentId, [])
      map.get(c.parentId)!.push(c)
    }
  }
  return map
})

watchEffect(() => {
  if (activeParentId.value === null) activeParentId.value = parents.value[0]?.id ?? null
})

const rootEl = ref<HTMLElement | null>(null)
const close = () => {
  open.value = false
}

const onDocClick = (e: MouseEvent) => {
  const el = rootEl.value
  if (!el) return
  const target = e.target as Node | null
  if (target && el.contains(target)) return
  close()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="w-full h-14 flex items-center px-6 font-extrabold border border-[#FFD200] bg-[#FFD200] text-gray-900 hover:brightness-95 transition-colors"
      @mouseenter="open = true"
      @click="open = !open"
    >
      <Menu class="w-5 h-5 mr-4" />
      <span class="flex items-center gap-3">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/75 shadow-sm" :style="iconWrapStyleFor({ id: 0 })">
          <component :is="iconFor('Package')" class="h-4.5 w-4.5" />
        </span>
        <span class="font-extrabold">{{ t('all_categories' as any) }}</span>
      </span>
      <ChevronDown class="w-4 h-4 ml-auto opacity-80" />
    </button>

    <div v-if="open" class="absolute top-full left-0 w-[760px] max-w-[90vw] bg-white border border-gray-200 shadow-xl z-50 overflow-hidden" @mouseleave="close">
      <div class="grid grid-cols-[280px,1fr]">
        <div class="border-r border-gray-200 bg-gray-50/40 max-h-[420px] overflow-auto">
          <button type="button" class="w-full text-left px-5 py-4 border-b border-gray-200 text-sm font-medium text-gray-900 hover:bg-[#FACC15] flex items-center gap-3" @mouseenter="activeParentId = null" @click="navigateTo('/shop'); close()">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/75 shadow-sm" :style="iconWrapStyleFor({ id: 0 })">
              <component :is="iconFor('Package')" class="h-4.5 w-4.5" />
            </span>
            <span>{{ t('all_categories' as any) }}</span>
          </button>
          <button
            v-for="p in parents"
            :key="p.id"
            type="button"
            class="w-full text-left px-5 py-4 border-b border-gray-200 last:border-0 text-sm font-medium transition-colors flex items-center gap-3"
            :class="activeParentId === p.id ? 'bg-white text-gray-900' : 'text-gray-800 hover:bg-[#FACC15] hover:text-gray-900'"
            @mouseenter="activeParentId = p.id"
            @click="navigateTo({ path: '/shop', query: { categoryId: String(p.id) } }); close()"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm" :style="iconWrapStyleFor(p)">
              <component :is="iconFor(p)" class="h-5 w-5" />
            </span>
            <span class="flex-1">{{ label(p) }}</span>
            <ChevronRight class="w-4 h-4 text-gray-400" :style="iconColorStyleFor(p)" />
          </button>
        </div>

        <div class="p-6 max-h-[420px] overflow-auto">
          <div v-if="activeParentId !== null" class="grid grid-cols-2 gap-2.5">
            <button
              v-for="c in (childrenByParent.get(activeParentId) || [])"
              :key="c.id"
              type="button"
              class="rounded-[1.3rem] border p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              :style="cardStyleFor(c)"
              @click="navigateTo({ path: '/shop', query: { categoryId: String(c.id) } }); close()"
            >
              <div class="flex items-start gap-3">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/70 shadow-sm" :style="iconWrapStyleFor(c)">
                  <component :is="iconFor(c)" class="h-4.5 w-4.5" />
                </span>
                <span class="min-w-0">
                  <span class="block text-[13px] font-extrabold leading-5 text-gray-900">{{ label(c) }}</span>
                </span>
              </div>
            </button>
          </div>
          <div v-else class="grid grid-cols-2 gap-2.5">
            <button
              v-for="p in parents"
              :key="p.id"
              type="button"
              class="rounded-[1.3rem] border p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              :style="cardStyleFor(p)"
              @click="navigateTo({ path: '/shop', query: { categoryId: String(p.id) } }); close()"
            >
              <div class="flex items-start gap-3">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-white/70 shadow-sm" :style="iconWrapStyleFor(p)">
                  <component :is="iconFor(p)" class="h-4.5 w-4.5" />
                </span>
                <span class="min-w-0">
                  <span class="block text-[13px] font-extrabold leading-5 text-gray-900">{{ label(p) }}</span>
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
