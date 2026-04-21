<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'
import { useAdminPortal } from '~/composables/useAdminPortal'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const { adminPath } = useAdminPortal()

const lang = ref<'az' | 'ru' | 'en'>('az')
const saving = ref(false)
const productInfoIcons = ['Truck', 'BadgeCheck', 'ShieldCheck', 'CreditCard', 'Sparkles'] as const

const emptyI18n = () => ({ az: '', ru: '', en: '' })
const emptyRow = () => ({ label: emptyI18n(), value: emptyI18n() })
const emptyCard = () => ({ title: emptyI18n(), description: emptyI18n() })
const emptyNote = () => ({ text: emptyI18n() })
const emptyUsageGuideCard = () => ({ enabled: true, title: '', text: '' })

const normalizeBlocks = (list: any[] = []) =>
  (Array.isArray(list) ? list : []).map((block: any, index: number) => ({
    enabled: Boolean(block?.enabled ?? true),
    icon: block?.icon || productInfoIcons[Math.min(index, productInfoIcons.length - 1)],
    image: String(block?.image || ''),
    title: { ...emptyI18n(), ...(block?.title || {}) },
    description: { ...emptyI18n(), ...(block?.description || {}) },
    detailTitle: { ...emptyI18n(), ...(block?.detailTitle || {}) },
    detailIntro: { ...emptyI18n(), ...(block?.detailIntro || {}) },
    detailRows: Array.isArray(block?.detailRows) ? block.detailRows.map((row: any) => ({ label: { ...emptyI18n(), ...(row?.label || {}) }, value: { ...emptyI18n(), ...(row?.value || {}) } })) : [],
    detailCards: Array.isArray(block?.detailCards) ? block.detailCards.map((card: any) => ({ title: { ...emptyI18n(), ...(card?.title || {}) }, description: { ...emptyI18n(), ...(card?.description || {}) } })) : [],
    detailNotes: Array.isArray(block?.detailNotes) ? block.detailNotes.map((note: any) => ({ text: { ...emptyI18n(), ...(note?.text || {}) } })) : [],
    detailHtml: { ...emptyI18n(), ...(block?.detailHtml || {}) }
  }))

if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}

const blocks = ref(normalizeBlocks((settingsStore.settings as any).productInfoBlocks || []))
const usageGuide = ref({
  enabled: Boolean(settingsStore.settings.productUsageGuide?.enabled ?? true),
  cards: Array.isArray(settingsStore.settings.productUsageGuide?.cards)
    ? settingsStore.settings.productUsageGuide.cards.map((item: any) => ({ enabled: item?.enabled !== false, title: String(item?.title || ''), text: String(item?.text || '') }))
    : [emptyUsageGuideCard(), emptyUsageGuideCard(), emptyUsageGuideCard()]
})

const addRow = (block: any) => block.detailRows.push(emptyRow())
const addCard = (block: any) => block.detailCards.push(emptyCard())
const addNote = (block: any) => block.detailNotes.push(emptyNote())
const addUsageGuideCard = () => usageGuide.value.cards.push(emptyUsageGuideCard())

const uploadBlockImage = async (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const body = new FormData()
  body.append('file', file)
  try {
    const result = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
    blocks.value[index].image = result.url
    toastStore.success('Blok şəkli yükləndi')
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  } finally {
    input.value = ''
  }
}

const save = async () => {
  saving.value = true
  try {
    await settingsStore.saveSettings({
      productInfoBlocks: normalizeBlocks(blocks.value) as any,
      productUsageGuide: {
        enabled: usageGuide.value.enabled,
        cards: usageGuide.value.cards.map((item: any) => ({
          enabled: item?.enabled !== false,
          title: String(item?.title || ''),
          text: String(item?.text || '')
        }))
      }
    } as any)
    toastStore.success('Məhsul səhifəsi blokları yeniləndi')
  } catch {
    toastStore.error('Məhsul səhifəsi blokları yenilənmədi')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div class="text-3xl font-extrabold text-gray-900">Məhsul səhifəsi blokları</div>
        <div class="mt-2 text-sm font-medium text-gray-500">Məhsul detalındakı çatdırılma, zəmanət və ödəniş bloklarını buradan kodsuz şəkildə redaktə edin.</div>
      </div>
      <div class="flex flex-wrap gap-3">
        <NuxtLink :to="adminPath('settings')" class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-700 transition-all">
          <ArrowLeft class="w-4 h-4" />
          Ayarlara qayıt
        </NuxtLink>
        <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60" :disabled="saving" @click="save">
          <Save class="w-4 h-4" />
          {{ saving ? 'Yadda saxlanır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Dil</div>
        <div class="flex gap-2">
          <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="lang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="lang = 'az'">AZ</button>
          <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="lang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="lang = 'ru'">RU</button>
          <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="lang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="lang = 'en'">EN</button>
        </div>
      </div>
    </div>

    <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm space-y-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="text-lg font-extrabold text-gray-900">Usage guide kartları</div>
          <div class="mt-1 text-sm font-medium text-gray-500">Məhsul detal səhifəsində görünən əlavə usage guide kartlarını buradan aktiv/deaktiv edin.</div>
        </div>
        <div class="flex items-center gap-3">
          <label class="inline-flex items-center cursor-pointer">
            <input v-model="usageGuide.enabled" type="checkbox" class="sr-only peer" />
            <div class="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative transition-all">
              <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all" :class="usageGuide.enabled ? 'translate-x-5' : ''"></div>
            </div>
          </label>
          <button type="button" class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-700 transition-all" @click="addUsageGuideCard">
            <Plus class="w-4 h-4" />
            Kart əlavə et
          </button>
        </div>
      </div>
      <div class="grid gap-4 xl:grid-cols-3">
        <div v-for="(card, cardIndex) in usageGuide.cards" :key="cardIndex" class="rounded-[1.6rem] border border-gray-100 bg-gray-50 p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-extrabold text-gray-900">Kart #{{ cardIndex + 1 }}</div>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="card.enabled" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative transition-all">
                <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all" :class="card.enabled ? 'translate-x-5' : ''"></div>
              </div>
            </label>
          </div>
          <input v-model="card.title" type="text" placeholder="Başlıq" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
          <textarea v-model="card.text" rows="4" placeholder="Mətn" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 resize-none"></textarea>
        </div>
      </div>
    </div>

  <div class="mx-auto w-full max-w-[1500px] space-y-6">
      <div v-for="(block, idx) in blocks" :key="idx" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm space-y-6">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div class="text-lg font-extrabold text-gray-900">Blok #{{ idx + 1 }}</div>
            <div class="mt-1 text-sm font-medium text-gray-500">Məhsul səhifəsində görünən əsas kart və klikdən sonra açılan popup məzmunu.</div>
          </div>
          <label class="inline-flex items-center cursor-pointer">
            <input v-model="block.enabled" type="checkbox" class="sr-only peer" />
            <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
              <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">İkon</label>
                <select v-model="block.icon" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                  <option v-for="ic in productInfoIcons" :key="ic" :value="ic">{{ ic }}</option>
                </select>
              </div>
              <div class="space-y-2 md:col-span-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kart başlığı</label>
                <input v-model="block.title[lang]" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
              <div class="space-y-2 md:col-span-3">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kart açıqlaması</label>
                <textarea v-model="block.description[lang]" rows="3" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
              </div>
              <div class="space-y-2 md:col-span-3">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Blok şəkli</label>
                <input v-model="block.image" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                <label class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 text-sm font-bold cursor-pointer hover:bg-blue-100 transition-all">
                  <ImagePlus class="w-4 h-4" />
                  Şəkil yüklə
                  <input type="file" accept="image/*" class="hidden" @change="uploadBlockImage(idx, $event)" />
                </label>
              </div>
            </div>

            <div class="rounded-3xl border border-gray-100 bg-gray-50 p-5 space-y-4">
              <div class="text-sm font-extrabold text-gray-900">Popup məzmunu</div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Popup başlıq</label>
                <input v-model="block.detailTitle[lang]" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Giriş mətni</label>
                <textarea v-model="block.detailIntro[lang]" rows="3" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all resize-none"></textarea>
              </div>
            </div>
          </div>

          <div class="space-y-5">
            <div class="rounded-3xl border border-gray-100 bg-gray-50 p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-gray-900">Məlumat cədvəli</div>
                <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-700 transition-all" @click="addRow(block)">
                  <Plus class="w-4 h-4" />
                  Sətir əlavə et
                </button>
              </div>
              <div class="space-y-3">
                <div v-for="(row, rowIdx) in block.detailRows" :key="rowIdx" class="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3">
                  <input v-model="row.label[lang]" type="text" placeholder="Məs: Çatdırılma vaxtı" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all" />
                  <input v-model="row.value[lang]" type="text" placeholder="Məs: 1-4 iş günü" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all" />
                  <button type="button" class="w-12 h-12 rounded-2xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all flex items-center justify-center" @click="block.detailRows.splice(rowIdx, 1)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-gray-100 bg-gray-50 p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-gray-900">Üstünlük kartları</div>
                <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-700 transition-all" @click="addCard(block)">
                  <Plus class="w-4 h-4" />
                  Kart əlavə et
                </button>
              </div>
              <div class="space-y-3">
                <div v-for="(card, cardIdx) in block.detailCards" :key="cardIdx" class="rounded-2xl border border-white bg-white p-4 space-y-3">
                  <div class="grid grid-cols-[1fr,auto] gap-3 items-start">
                    <input v-model="card.title[lang]" type="text" placeholder="Kart başlığı" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all" />
                    <button type="button" class="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-all flex items-center justify-center" @click="block.detailCards.splice(cardIdx, 1)">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                  <textarea v-model="card.description[lang]" rows="3" placeholder="Kart açıqlaması" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all resize-none"></textarea>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-gray-100 bg-gray-50 p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-gray-900">Qeydlər</div>
                <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-700 transition-all" @click="addNote(block)">
                  <Plus class="w-4 h-4" />
                  Qeyd əlavə et
                </button>
              </div>
              <div class="space-y-3">
                <div v-for="(note, noteIdx) in block.detailNotes" :key="noteIdx" class="grid grid-cols-[1fr,auto] gap-3">
                  <textarea v-model="note.text[lang]" rows="3" placeholder="İstifadəçiyə görünəcək əlavə qeyd" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all resize-none"></textarea>
                  <button type="button" class="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-all flex items-center justify-center" @click="block.detailNotes.splice(noteIdx, 1)">
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
