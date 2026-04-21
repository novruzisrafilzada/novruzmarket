<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Save, Smartphone, Type, PanelBottomOpen, Rows3 } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const saving = ref(false)
const settings = computed(() => settingsStore.settings)
const densityOptions = [
  { value: 'compact', label: 'Kompakt' },
  { value: 'comfortable', label: 'Rahat' }
]
const densityProfiles = computed(() => settings.value.mobileExperience.densityProfiles)

onMounted(async () => {
  if (!settingsStore.hydrated) {
    await settingsStore.fetchSettings()
  }
})

const save = async () => {
  saving.value = true
  try {
    await settingsStore.saveSettings()
    toastStore.success('Mobil tətbiq görünüş ayarları yadda saxlanıldı')
  } catch {
    toastStore.error('Mobil tətbiq görünüş ayarları yadda saxlanılmadı')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-[#FFF7CC] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8A6A00]">
            <Smartphone class="h-4 w-4" />
            Mobil tətbiq görünüşü
          </div>
          <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">Mobil storefront idarəsi</h1>
          <p class="mt-3 max-w-3xl text-sm font-medium leading-7 text-gray-600">
            Mobil cihazlarda app-tipli görünüş, yazı sıxlığı, sticky header və alt tab bar kimi hissələri buradan aktiv və ya deaktiv et.
          </p>
        </div>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-5 py-3 text-sm font-extrabold text-gray-900 transition hover:brightness-95 disabled:opacity-60" :disabled="saving" @click="save">
          <Save class="h-4 w-4" />
          {{ saving ? 'Yadda saxlanılır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
      <section class="space-y-6">
        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <Smartphone class="h-5 w-5 text-[#8A6A00]" />
            <div>
              <div class="text-sm font-extrabold text-gray-900">Mobil app-shell</div>
              <div class="text-xs font-medium text-gray-500">Aşağı tab bar və app-tipli mobil skeleti idarə et.</div>
            </div>
          </div>
          <div class="mt-5 grid gap-4">
            <label class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Mobil app görünüşünü aktiv et</span>
              <input v-model="settings.mobileExperience.enabled" type="checkbox" class="h-5 w-5" />
            </label>
            <label class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Alt tab bar göstər</span>
              <input v-model="settings.mobileExperience.bottomTabBar" type="checkbox" class="h-5 w-5" />
            </label>
            <label class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Mobil ağır footer-i gizlət</span>
              <input v-model="settings.mobileExperience.hideHeavyFooterOnMobile" type="checkbox" class="h-5 w-5" />
            </label>
            <label class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Kataloq başlıq və köməkçi mətnləri göstər</span>
              <input v-model="settings.mobileExperience.catalogHelperHeadings" type="checkbox" class="h-5 w-5" />
            </label>
          </div>
        </div>

        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <Type class="h-5 w-5 text-[#8A6A00]" />
            <div>
              <div class="text-sm font-extrabold text-gray-900">Yazı və ölçü sıxlığı</div>
              <div class="text-xs font-medium text-gray-500">Mobil görünüşdə font və label ölçülərini daha balanslı saxla.</div>
            </div>
          </div>
          <div class="mt-5 grid gap-4">
            <label class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Kompakt yazı ölçüsü</span>
              <input v-model="settings.mobileExperience.compactTypography" type="checkbox" class="h-5 w-5" />
            </label>
          </div>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <label class="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">Home</div>
              <select v-model="densityProfiles.home" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none">
                <option v-for="option in densityOptions" :key="`home-${option.value}`" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">Shop</div>
              <select v-model="densityProfiles.shop" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none">
                <option v-for="option in densityOptions" :key="`shop-${option.value}`" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">Product</div>
              <select v-model="densityProfiles.product" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none">
                <option v-for="option in densityOptions" :key="`product-${option.value}`" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">Cart</div>
              <select v-model="densityProfiles.cart" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none">
                <option v-for="option in densityOptions" :key="`cart-${option.value}`" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 md:col-span-2">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">Checkout</div>
              <select v-model="densityProfiles.checkout" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none">
                <option v-for="option in densityOptions" :key="`checkout-${option.value}`" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
          </div>
        </div>

        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <Rows3 class="h-5 w-5 text-[#8A6A00]" />
            <div>
              <div class="text-sm font-extrabold text-gray-900">Sticky hissələr</div>
              <div class="text-xs font-medium text-gray-500">Mobil header və əsas shell davranışını sabit saxla.</div>
            </div>
          </div>
          <div class="mt-5 grid gap-4">
            <label class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Sticky header aktiv olsun</span>
              <input v-model="settings.mobileExperience.stickyHeader" type="checkbox" class="h-5 w-5" />
            </label>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <PanelBottomOpen class="h-5 w-5 text-[#8A6A00]" />
            <div>
              <div class="text-sm font-extrabold text-gray-900">Tövsiyə olunan kombinasiya</div>
              <div class="text-xs font-medium text-gray-500">Mobil sifariş axını üçün daha rahat variant.</div>
            </div>
          </div>
          <div class="mt-5 rounded-xl border border-[#FDE68A] bg-[#FFFBEA] p-5 text-sm font-medium leading-7 text-gray-700">
            <div class="font-extrabold text-gray-900">Tövsiyə:</div>
            <div class="mt-2">`Mobil app görünüşü`: aktiv</div>
            <div>`Kompakt yazı ölçüsü`: aktiv</div>
            <div>`Sticky header`: aktiv</div>
            <div>`Alt tab bar`: aktiv</div>
            <div>`Ağır footer-i gizlət`: aktiv</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
