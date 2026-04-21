<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Save, Zap } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const saving = ref(false)
const form = ref<any>(null)

const hydrate = () => {
  form.value = JSON.parse(JSON.stringify(settingsStore.settings.creativeSuite || {}))
}

const badgeThresholdsText = computed({
  get: () => Array.isArray(form.value?.badgeThresholds) ? form.value.badgeThresholds.map((item: any) => `${item.label}:${item.minPoints}`).join(', ') : '',
  set: (value: string) => {
    form.value.badgeThresholds = String(value || '').split(',').map((item) => item.trim()).filter(Boolean).map((item) => {
      const [label, minPoints] = item.split(':')
      return { label: String(label || '').trim(), minPoints: Number(minPoints || 0) }
    }).filter((item) => item.label)
  }
})

const save = async () => {
  saving.value = true
  try {
    await settingsStore.saveSettings({ creativeSuite: form.value })
    toastStore.success('Böyümə mərkəzi ayarları yadda saxlanıldı')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Ayarlar yadda saxlanılmadı')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await settingsStore.fetchSettings()
  hydrate()
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1400px] space-y-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Böyümə mərkəzi</h1>
        <p class="mt-2 text-sm font-medium text-gray-500">Etibar UX-i, loyallıq, referral, qaranlıq rejim və mövsümi tema ayarlarını bu bölmədən idarə edin.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="saving || !form" @click="save">
        <Save class="w-4 h-4" />
        {{ saving ? 'Yadda saxlanır...' : 'Yadda saxla' }}
      </button>
    </div>

    <div v-if="form" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div class="flex items-center gap-2 text-lg font-extrabold text-gray-900"><Zap class="w-5 h-5 text-blue-600" /> Etibar UX-i</div>
        <label class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 text-sm font-bold text-gray-700"><span>Canlı satış popup</span><input v-model="form.recentSalesPopupEnabled" type="checkbox" class="w-5 h-5" /></label>
        <label class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 text-sm font-bold text-gray-700"><span>Stok bildirişi siyahısı</span><input v-model="form.waitlistEnabled" type="checkbox" class="w-5 h-5" /></label>
        <div>
          <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Az stok həddi</label>
          <input v-model.number="form.lowStockThreshold" type="number" min="1" class="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
        </div>
        <div>
          <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Seçilmiş satıcı etiketi</label>
          <input v-model="form.featuredSellerLabel" type="text" class="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div class="text-lg font-extrabold text-gray-900">Oyunlaşdırma</div>
        <label class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 text-sm font-bold text-gray-700"><span>Loyallıq xalları</span><input v-model="form.loyaltyEnabled" type="checkbox" class="w-5 h-5" /></label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Vahid üzrə xal</label>
            <input v-model.number="form.pointsPerOrderUnit" type="number" min="0" class="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
          </div>
          <div>
            <label class="text-xs font-bold uppercase tracking-widest text-gray-400">İlk sifariş bonusu</label>
            <input v-model.number="form.firstOrderBonusPoints" type="number" min="0" class="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
          </div>
          <div>
            <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Dəvət mükafatı</label>
            <input v-model.number="form.referralRewardPoints" type="number" min="0" class="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
          </div>
        </div>
        <div>
          <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Etiket hədləri</label>
          <input v-model="badgeThresholdsText" type="text" class="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" placeholder="Bürünc:0, Gümüş:150, Qızıl:400" />
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div class="text-lg font-extrabold text-gray-900">Vizual temalar</div>
        <label class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 text-sm font-bold text-gray-700"><span>Qaranlıq rejim</span><input v-model="form.darkModeEnabled" type="checkbox" class="w-5 h-5" /></label>
        <div>
          <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Mövsümi tema</label>
          <select v-model="form.seasonalTheme" class="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600">
            <option value="none">Yoxdur</option>
            <option value="spring">Yaz</option>
            <option value="summer">Yay</option>
            <option value="autumn">Payız</option>
            <option value="winter">Qış</option>
          </select>
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div class="text-lg font-extrabold text-gray-900">Axtarış analitikası toggle-ları</div>
        <label class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 text-sm font-bold text-gray-700"><span>Populyar axtarışlar</span><input v-model="form.popularSearchesEnabled" type="checkbox" class="w-5 h-5" /></label>
        <label class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 text-sm font-bold text-gray-700"><span>Nəzərdə tutduğunuz</span><input v-model="form.didYouMeanEnabled" type="checkbox" class="w-5 h-5" /></label>
      </div>
    </div>
  </div>
</template>
