<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Save } from 'lucide-vue-next'
import { useProductStore } from '~/stores/products'
import { useTopDealsStore } from '~/stores/topDeals'

definePageMeta({ layout: 'admin' })

const productStore = useProductStore()
const topDealsStore = useTopDealsStore()

const enabled = ref(true)
const title = ref('')
const titleI18n = ref({ az: '', ru: '', en: '' })
const endAtLocal = ref('')
const productIds = ref<number[]>([])
const saving = ref(false)
const contentLang = ref<'az' | 'ru' | 'en'>('az')

const toBakuInput = (value: string) => {
  const s = String(value || '').trim()
  if (!s) return ''
  const d = new Date(s)
  if (!Number.isFinite(d.getTime())) return ''
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Baku',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d)
  return formatted.replace(' ', 'T')
}

const hydrateForm = () => {
  enabled.value = Boolean(topDealsStore.config.enabled)
  title.value = topDealsStore.config.title || 'Günün ən yaxşı təklifləri'
  titleI18n.value = {
    az: (topDealsStore.config.titleI18n?.az || topDealsStore.config.title || 'Günün ən yaxşı təklifləri'),
    ru: (topDealsStore.config.titleI18n?.ru || 'Лучшие предложения дня'),
    en: (topDealsStore.config.titleI18n?.en || 'Today’s best deals'),
  }
  endAtLocal.value = toBakuInput(topDealsStore.config.endAt)
  productIds.value = Array.isArray(topDealsStore.config.productIds) ? [...topDealsStore.config.productIds] : []
}

watch(() => topDealsStore.config, hydrateForm, { deep: true, immediate: true })

const products = computed(() => productStore.products)

const toggleProduct = (id: number) => {
  const idx = productIds.value.indexOf(id)
  if (idx === -1) productIds.value.push(id)
  else productIds.value.splice(idx, 1)
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    await topDealsStore.saveConfig({
      enabled: enabled.value,
      title: title.value,
      titleI18n: titleI18n.value,
      endAt: endAtLocal.value,
      productIds: productIds.value
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!topDealsStore.hydrated) await topDealsStore.fetchConfig()
  if (!productStore.hydrated) await productStore.fetchProducts()
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Günün Endirimi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Home səhifəsindəki “Günün ən yaxşı təklifləri” bölməsi.</p>
      </div>
      <button
        type="button"
        @click="save"
        :disabled="saving"
        :class="['px-8 py-3 rounded-2xl font-bold transition-all flex items-center justify-center', saving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200']"
      >
        <Save class="w-5 h-5 mr-2" />
        {{ saving ? 'Yadda saxlanılır…' : 'Yadda saxla' }}
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-gray-900">Bölmə aktivdir</div>
          <div class="text-xs text-gray-500 font-medium">Deaktiv etsəniz home-da görünməyəcək.</div>
        </div>
        <label class="inline-flex items-center cursor-pointer">
          <input v-model="enabled" type="checkbox" class="sr-only peer" />
          <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
            <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq (3 dil)</label>
          <div class="flex gap-2 mb-3">
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
          </div>
          <input v-model="titleI18n[contentLang]" type="text" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
          <input v-model="title" type="text" class="hidden" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bitmə vaxtı (Bakı)</label>
          <input v-model="endAtLocal" type="datetime-local" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-bold text-gray-900">Təklif məhsulları</div>
            <div class="text-xs text-gray-500 font-medium">Seçilməsə, avtomatik ilk məhsullar göstəriləcək.</div>
          </div>
          <div class="text-xs font-bold text-gray-400">Seçilən: {{ productIds.length }}</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <button
            v-for="p in products"
            :key="p.id"
            type="button"
            @click="toggleProduct(p.id)"
            :class="[
              'p-4 rounded-2xl border text-left transition-all flex items-center gap-4',
              productIds.includes(p.id) ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-white hover:bg-gray-50'
            ]"
          >
            <div class="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
              <img :src="p.image" :alt="p.name" class="w-full h-full object-contain" />
            </div>
            <div class="min-w-0">
              <div class="text-sm font-bold text-gray-900 truncate">{{ p.name }}</div>
              <div class="text-[10px] text-gray-500 font-medium truncate">{{ p.category }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
