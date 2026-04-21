<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ExternalLink, FileText, Plus, Save, Trash2 } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const { adminPath } = useAdminPortal()

const saving = ref(false)
const groups = ref<any[]>([])

const emptyItem = () => ({
  label: { az: '', ru: '', en: '' },
  href: '/'
})

const emptyGroup = () => ({
  key: `group-${Date.now()}`,
  title: { az: '', ru: '', en: '' },
  items: [emptyItem()]
})

const slugFromHref = (href: string) => {
  const clean = String(href || '').trim()
  if (!clean.startsWith('/')) return ''
  const slug = clean.replace(/^\/+/, '').split('?')[0].split('#')[0]
  if (!slug || slug.includes('/')) return ''
  const reserved = new Set(['', 'shop', 'faq', 'contact', 'profile', 'order-tracking', 'compare', 'wishlist', 'cart', 'login', 'signup'])
  return reserved.has(slug) ? '' : slug
}

const loadData = async () => {
  await settingsStore.fetchSettings()
  groups.value = Array.isArray(settingsStore.settings.footerLinkGroups)
    ? settingsStore.settings.footerLinkGroups.map((group: any) => ({
        key: String(group?.key || `group-${Date.now()}`),
        title: {
          az: String(group?.title?.az || ''),
          ru: String(group?.title?.ru || group?.title?.az || ''),
          en: String(group?.title?.en || group?.title?.az || '')
        },
        items: Array.isArray(group?.items) && group.items.length
          ? group.items.map((item: any) => ({
              label: {
                az: String(item?.label?.az || ''),
                ru: String(item?.label?.ru || item?.label?.az || ''),
                en: String(item?.label?.en || item?.label?.az || '')
              },
              href: String(item?.href || '/')
            }))
          : [emptyItem()]
      }))
    : []
}

const addGroup = () => {
  groups.value.push(emptyGroup())
}

const removeGroup = (index: number) => {
  groups.value.splice(index, 1)
}

const addItem = (groupIndex: number) => {
  groups.value[groupIndex].items.push(emptyItem())
}

const removeItem = (groupIndex: number, itemIndex: number) => {
  groups.value[groupIndex].items.splice(itemIndex, 1)
  if (!groups.value[groupIndex].items.length) {
    groups.value[groupIndex].items.push(emptyItem())
  }
}

const saveGroups = async () => {
  saving.value = true
  try {
    settingsStore.settings = {
      ...settingsStore.settings,
      footerLinkGroups: groups.value.map((group) => ({
        key: String(group.key || '').trim() || `group-${Date.now()}`,
        title: {
          az: String(group.title.az || '').trim(),
          ru: String(group.title.ru || group.title.az || '').trim(),
          en: String(group.title.en || group.title.az || '').trim()
        },
        items: (group.items || [])
          .map((item: any) => ({
            label: {
              az: String(item.label.az || '').trim(),
              ru: String(item.label.ru || item.label.az || '').trim(),
              en: String(item.label.en || item.label.az || '').trim()
            },
            href: String(item.href || '/').trim() || '/'
          }))
          .filter((item: any) => item.label.az && item.href)
      }))
    }
    await settingsStore.saveSettings()
    toastStore.success('Footer linkləri yadda saxlandı')
    await loadData()
  } catch {
    toastStore.error('Footer linkləri yadda saxlanmadı')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Footer Linkləri</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Burada yalnız footer sütunlarını və linkləri düzənlə. Linkin iç məzmununu ayrıca səhifəyə daxil olub redaktə et.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <NuxtLink :to="adminPath('pages')" class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold hover:border-blue-600 hover:text-blue-600 transition-all">
          <ExternalLink class="w-4 h-4" />
          Səhifələrə keç
        </NuxtLink>
        <button type="button" class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all" @click="addGroup">
          <Plus class="w-4 h-4" />
          Yeni sütun
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div v-for="(group, groupIndex) in groups" :key="`${group.key}-${groupIndex}`" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
          <div class="text-lg font-extrabold text-gray-900">Sütun #{{ groupIndex + 1 }}</div>
          <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-all" @click="removeGroup(groupIndex)">
            <Trash2 class="w-4 h-4" />
            Sil
          </button>
        </div>

        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <input v-model="group.key" type="text" placeholder="Sistem açarı" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
            <input v-model="group.title.az" type="text" placeholder="Başlıq (AZ)" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
            <input v-model="group.title.ru" type="text" placeholder="Başlıq (RU)" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
            <input v-model="group.title.en" type="text" placeholder="Başlıq (EN)" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
          </div>

          <div class="space-y-4">
            <div v-for="(item, itemIndex) in group.items" :key="`${group.key}-item-${itemIndex}`" class="rounded-[1.5rem] border border-gray-100 p-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr,1fr,1fr,1.2fr,120px] gap-3">
                <input v-model="item.label.az" type="text" placeholder="Link adı (AZ)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
                <input v-model="item.label.ru" type="text" placeholder="Link adı (RU)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
                <input v-model="item.label.en" type="text" placeholder="Link adı (EN)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
                <input v-model="item.href" type="text" placeholder="/terms və ya /contact" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
                <button type="button" class="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-all" @click="removeItem(groupIndex, itemIndex)">
                  <Trash2 class="w-4 h-4" />
                  Sil
                </button>
              </div>

              <div v-if="item.href === '/faq'" class="rounded-[1.25rem] bg-blue-50/60 border border-blue-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 text-sm font-extrabold text-blue-700">
                    <FileText class="w-4 h-4" />
                    Bu link əsas header FAQ səhifəsinə gedir
                  </div>
                  <div class="mt-1 text-sm font-medium text-blue-700/80">Header və footer FAQ eyni admin bölməsindən idarə olunur</div>
                </div>
                <NuxtLink :to="adminPath('faq')" class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all">
                  <FileText class="w-4 h-4" />
                  FAQ idarəsinə keç
                </NuxtLink>
              </div>
              <div v-else-if="slugFromHref(item.href)" class="rounded-[1.25rem] bg-blue-50/60 border border-blue-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 text-sm font-extrabold text-blue-700">
                    <FileText class="w-4 h-4" />
                    Bu link üçün ayrıca iç səhifə redaktəsi var
                  </div>
                  <div class="mt-1 text-sm font-medium text-blue-700/80">Slug: /{{ slugFromHref(item.href) }}</div>
                </div>
                <NuxtLink :to="adminPath(`footer-links/content/${slugFromHref(item.href)}`)" class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all">
                  <FileText class="w-4 h-4" />
                  İçəriyə daxil ol
                </NuxtLink>
              </div>
              <div v-else class="rounded-[1.25rem] bg-amber-50 border border-amber-100 p-4 text-sm font-medium text-amber-700">
                Bu link hazır route-a və ya xarici ünvana gedir. FAQ tipli ayrıca iç səhifə yaratmaq üçün sadə custom slug istifadə et, məsələn: /delivery-info
              </div>
            </div>

            <button type="button" class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all" @click="addItem(groupIndex)">
              <Plus class="w-4 h-4" />
              Link əlavə et
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button type="button" class="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60" :disabled="saving" @click="saveGroups">
        <Save class="w-5 h-5" />
        {{ saving ? 'Yadda saxlanır...' : 'Yadda saxla' }}
      </button>
    </div>
  </div>
</template>
