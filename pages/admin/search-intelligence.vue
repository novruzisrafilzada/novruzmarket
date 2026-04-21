<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RotateCcw, Save, Search, WandSparkles } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const insights = ref<any[]>([])
const saving = ref(false)
const resetting = ref(false)
const synonymsText = ref('')
const stopWordText = ref('a, an, and, or, the, for, of, in, on, with, to, və, ve, ilə, ile, bir, bu')

const parsedSynonyms = computed(() =>
  String(synonymsText.value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [term, aliases] = line.split(':')
      return {
        term: String(term || '').trim(),
        aliases: String(aliases || '').split('|').map((item) => item.trim()).filter(Boolean)
      }
    })
    .filter((item) => item.term)
)

const hydrate = () => {
  const synonyms = Array.isArray(settingsStore.settings.creativeSuite?.searchSynonyms) ? settingsStore.settings.creativeSuite.searchSynonyms : []
  synonymsText.value = synonyms.map((item: any) => `${item.term}:${(item.aliases || []).join('|')}`).join('\n')
}

const loadInsights = async () => {
  try {
    insights.value = await $fetch('/api/search/insights')
  } catch {
    insights.value = []
  }
}

const save = async () => {
  saving.value = true
  try {
    await settingsStore.saveSettings({
      creativeSuite: {
        ...settingsStore.settings.creativeSuite,
        searchSynonyms: parsedSynonyms.value
      }
    } as any)
    toastStore.success('Axtarış analitikası yadda saxlanıldı')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Axtarış analitikası yadda saxlanılmadı')
  } finally {
    saving.value = false
  }
}

const resetInsights = async () => {
  resetting.value = true
  try {
    await $fetch('/api/admin/search-intelligence/reset', { method: 'POST' })
    insights.value = []
    toastStore.success('Axtarış analitikası sıfırlandı')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Axtarış analitikası sıfırlanmadı')
  } finally {
    resetting.value = false
  }
}

onMounted(async () => {
  await settingsStore.fetchSettings()
  hydrate()
  await loadInsights()
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1400px] space-y-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Axtarış analitikası</h1>
        <p class="mt-2 text-sm font-medium text-gray-500">Populyar sorğular, sinonim mühərriki və “nəzərdə tutduğunuz” strategiyasını bu bölmədən idarə edin.</p>
      </div>
      <div class="flex items-center gap-3">
        <button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60" :disabled="resetting" @click="resetInsights">
          <RotateCcw class="w-4 h-4" />
          {{ resetting ? 'Sıfırlanır...' : 'Analitikanı sıfırla' }}
        </button>
        <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="saving" @click="save">
          <Save class="w-4 h-4" />
          {{ saving ? 'Yadda saxlanır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[0.95fr,1.05fr] gap-6">
      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm space-y-6">
        <div class="flex items-center gap-2 text-lg font-extrabold text-gray-900"><Search class="w-5 h-5 text-blue-600" /> Sinonim mühərriki</div>
        <div class="mt-2 text-sm font-medium text-gray-500">Format: əsas-söz:alias1|alias2</div>
        <textarea v-model="synonymsText" rows="14" class="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-medium outline-none focus:border-blue-600 resize-none"></textarea>
        <div class="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4">
          <div class="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-800">Yazı xətası / stop-word təmizlənməsi</div>
          <div class="mt-2 text-sm font-medium text-amber-900">Populyar axtarışlar siyahısı sinonim normallaşdırması və yazı xəta yaxınlaşması ilə təmizlənir. Aşağıdakı ümumi sözlər avtomatik nəzərə alınmır.</div>
          <textarea v-model="stopWordText" rows="3" readonly class="mt-4 w-full rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 text-xs font-bold text-amber-900 outline-none resize-none"></textarea>
        </div>
        <div class="rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4">
          <div class="flex items-center gap-2 text-sm font-extrabold text-blue-900"><WandSparkles class="w-4 h-4" /> Sinonim təsir önizləməsi</div>
          <div class="mt-4 space-y-3">
            <div v-for="item in parsedSynonyms.slice(0, 10)" :key="item.term" class="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
              <div class="text-sm font-extrabold text-gray-900">{{ item.term }}</div>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="alias in item.aliases" :key="`${item.term}-${alias}`" class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-blue-700">
                  {{ alias }}
                </span>
                <span v-if="!item.aliases.length" class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-600">
                  Alias yoxdur
                </span>
              </div>
            </div>
            <div v-if="!parsedSynonyms.length" class="text-sm font-medium text-gray-500">Hələ synonym təyin olunmayıb.</div>
          </div>
        </div>
      </div>
      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div class="text-lg font-extrabold text-gray-900">Populyar axtarışlar</div>
        <div class="mt-5 space-y-4">
          <div v-for="item in insights.slice(0, 20)" :key="item.term" class="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <div>
              <div class="text-sm font-extrabold text-gray-900">{{ item.term }}</div>
              <div class="mt-1 text-xs font-medium text-gray-500">{{ item.lastSearchedAt }}</div>
            </div>
            <div class="text-right">
              <div class="text-xl font-extrabold text-blue-600">{{ item.count }}</div>
              <div class="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Searches</div>
            </div>
          </div>
          <div v-if="!insights.length" class="text-sm font-medium text-gray-500">Hələ search analytics toplanmayıb.</div>
        </div>
      </div>
    </div>
  </div>
</template>
