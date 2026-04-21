<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Banknote, CheckCircle2, CreditCard, Globe, Power, Save, ShieldCheck } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const { settings } = storeToRefs(settingsStore)

const ensureMethods = () => {
  if (!Array.isArray(settings.value.paymentMethods)) {
    settings.value.paymentMethods = []
  }
  if (!settings.value.paymentMethods.some((method) => method.key === 'card')) {
    settings.value.paymentMethods.push({
      key: 'card',
      name: 'Kart ilə ödəniş',
      provider: 'Stripe',
      description: 'Stripe hosted checkout ilə təhlükəsiz onlayn ödəniş',
      enabled: true
    })
  }
  if (!settings.value.paymentMethods.some((method) => method.key === 'cash')) {
    settings.value.paymentMethods.push({
      key: 'cash',
      name: 'Nağd ödəniş',
      provider: 'Qapıda ödəniş',
      description: 'Məhsul təhvilində ödəniş edin',
      enabled: true
    })
  }
}

onMounted(async () => {
  if (!settingsStore.hydrated || !settingsStore.settings.siteName) {
    await settingsStore.fetchSettings()
  }
  ensureMethods()
})

const cardMethod = computed(() => settings.value.paymentMethods.find((method) => method.key === 'card'))
const cashMethod = computed(() => settings.value.paymentMethods.find((method) => method.key === 'cash'))
const cardReady = computed(() => Boolean(
  settings.value.integrations.paymentProvider === 'stripe'
  && cardMethod.value?.enabled
  && settings.value.integrations.paymentApiKey.trim()
  && settings.value.integrations.paymentSecret.trim()
  && settings.value.integrations.paymentCallbackUrl.trim()
))

const saveSettings = async () => {
  ensureMethods()
  try {
    await settingsStore.saveSettings()
    toastStore.success('Ödəniş ayarları yadda saxlanıldı')
  } catch {
    toastStore.error('Ödəniş ayarları yadda saxlanılmadı')
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Ödəniş Metodları</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Checkout-da görünən ödəniş seçimləri və provider inteqrasiyası buradan idarə olunur.</p>
      </div>
      <button @click="saveSettings" class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all">
        <Save class="w-4 h-4 mr-2" /> Yadda Saxla
      </button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <div class="flex items-center gap-3 mb-8">
          <Globe class="w-6 h-6 text-blue-600" />
          <div>
            <div class="text-xl font-extrabold text-gray-900">Provider inteqrasiyası</div>
            <div class="text-sm font-medium text-gray-500 mt-1">Hazırda real kart ödənişi üçün Stripe hosted checkout istifadə olunur.</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Provider</label>
            <select v-model="settings.integrations.paymentProvider" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option value="">Seçilməyib</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
            <div :class="['rounded-2xl px-5 py-3.5 text-sm font-extrabold border', cardReady ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100']">
              {{ cardReady ? 'Kart ödənişi checkout-da aktivdir' : 'Kart ödənişi üçün provider açarları natamamdır' }}
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Secret Key</label>
            <input v-model="settings.integrations.paymentSecret" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="sk_live_..." />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">API Key</label>
            <input v-model="settings.integrations.paymentApiKey" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="pk_live_... və ya daxili açar" />
          </div>
          <div class="space-y-2 md:col-span-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Callback URL</label>
            <input v-model="settings.integrations.paymentCallbackUrl" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="https://sizin-domain.az" />
          </div>
        </div>
      </div>

      <div class="bg-gray-900 rounded-[2.5rem] text-white p-8 shadow-xl">
        <div class="text-[11px] font-extrabold uppercase tracking-[0.28em] text-white/50">Realtime status</div>
        <div class="mt-4 text-2xl font-extrabold">Checkout sinxronu</div>
        <div class="mt-3 text-sm font-medium text-white/70">Bu səhifədə etdiyiniz dəyişikliklər checkout və server order API tərəfindən birbaşa istifadə olunur.</div>
        <div class="mt-8 space-y-4">
          <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-4">
            <div class="text-sm font-bold">Kart provider</div>
            <div class="text-xs font-extrabold" :class="cardReady ? 'text-emerald-300' : 'text-amber-300'">{{ cardReady ? 'Hazır' : 'Gözləyir' }}</div>
          </div>
          <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-4">
            <div class="text-sm font-bold">Nağd ödəniş</div>
            <div class="text-xs font-extrabold" :class="cashMethod?.enabled ? 'text-emerald-300' : 'text-amber-300'">{{ cashMethod?.enabled ? 'Aktiv' : 'Deaktiv' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cardMethod && cashMethod" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard class="w-8 h-8" />
            </div>
            <div>
              <div class="text-xl font-extrabold text-gray-900">Kart metodu</div>
              <div class="text-sm font-medium text-gray-500 mt-1">Hosted checkout ilə real provider ödənişi.</div>
            </div>
          </div>
          <label class="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 border border-gray-100">
            <Power class="w-4 h-4 text-gray-400" />
            <input v-model="cardMethod.enabled" type="checkbox" class="w-5 h-5" />
          </label>
        </div>
        <div class="mt-8 space-y-5">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Görünən ad</label>
            <input v-model="cardMethod.name" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Provider etiketi</label>
            <input v-model="cardMethod.provider" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açıqlama</label>
            <textarea v-model="cardMethod.description" rows="3" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          </div>
          <div :class="['rounded-2xl border px-5 py-4 text-sm font-bold flex items-center gap-3', cardReady ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700']">
            <CheckCircle2 class="w-5 h-5" />
            {{ cardReady ? 'Kart ödənişi checkout-da açıqdır' : 'Checkout-da görünməsi üçün metod enabled olmalı və provider açarları dolu olmalıdır' }}
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote class="w-8 h-8" />
            </div>
            <div>
              <div class="text-xl font-extrabold text-gray-900">Nağd ödəniş</div>
              <div class="text-sm font-medium text-gray-500 mt-1">Çatdırılma zamanı ödəniş seçimi.</div>
            </div>
          </div>
          <label class="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 border border-gray-100">
            <Power class="w-4 h-4 text-gray-400" />
            <input v-model="cashMethod.enabled" type="checkbox" class="w-5 h-5" />
          </label>
        </div>
        <div class="mt-8 space-y-5">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Görünən ad</label>
            <input v-model="cashMethod.name" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Provider etiketi</label>
            <input v-model="cashMethod.provider" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açıqlama</label>
            <textarea v-model="cashMethod.description" rows="3" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          </div>
          <div class="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-600 flex items-center gap-3">
            <ShieldCheck class="w-5 h-5 text-gray-400" />
            Bu seçim deaktiv ediləndə checkout yalnız aktiv qalan metodları göstərəcək.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
