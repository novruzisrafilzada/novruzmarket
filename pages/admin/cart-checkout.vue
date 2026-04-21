<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ShoppingCart, ShieldCheck, Save, LocateFixed, Palette } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'
import { useAdminPortal } from '~/composables/useAdminPortal'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const { adminPath } = useAdminPortal()
const saving = ref(false)
const settings = computed(() => settingsStore.settings)

onMounted(async () => {
  if (!settingsStore.hydrated) {
    await settingsStore.fetchSettings()
  }
})

const save = async () => {
  saving.value = true
  try {
    await settingsStore.saveSettings()
    toastStore.success('Cart və checkout ayarları yadda saxlanıldı')
  } catch {
    toastStore.error('Cart və checkout ayarları yadda saxlanılmadı')
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
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
            <ShoppingCart class="h-4 w-4" />
            Səbət və checkout
          </div>
          <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">Cart və checkout idarəsi</h1>
          <p class="mt-3 max-w-3xl text-sm font-medium leading-7 text-gray-600">
            Cart, checkout, ƏDV görünüşü, şəhər auto-detect və həmin hissələrin rəng tonlarını ayrıca buradan idarə et.
          </p>
        </div>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-60" :disabled="saving" @click="save">
          <Save class="h-4 w-4" />
          {{ saving ? 'Yadda saxlanılır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <section class="space-y-6">
        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <ShoppingCart class="h-5 w-5 text-blue-600" />
            <div>
              <div class="text-sm font-extrabold text-gray-900">Cart hero və sticky summary</div>
              <div class="text-xs font-medium text-gray-500">Səbət səhifəsinin hero, sticky total və promo mətnlərini idarə et.</div>
            </div>
          </div>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Cart badge</label>
              <input v-model="settings.cartCheckout.cartBadge" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <label class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Mobil sticky summary</span>
              <input v-model="settings.cartCheckout.showCartStickySummary" type="checkbox" class="h-5 w-5" />
            </label>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Cart başlıq</label>
              <input v-model="settings.cartCheckout.cartTitle" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Cart alt mətn</label>
              <textarea v-model="settings.cartCheckout.cartSubtitle" rows="3" class="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
          </div>
          <div class="mt-5 grid gap-4 md:grid-cols-3">
            <div v-for="(item, idx) in settings.cartCheckout.cartHighlights" :key="`cart-highlight-admin-${idx}`" class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div class="mb-3 flex items-center justify-between">
                <div class="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Highlight {{ idx + 1 }}</div>
                <input v-model="item.enabled" type="checkbox" class="h-5 w-5" />
              </div>
              <input v-model="item.label" type="text" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600" />
            </div>
          </div>
        </div>

        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <ShieldCheck class="h-5 w-5 text-blue-600" />
            <div>
              <div class="text-sm font-extrabold text-gray-900">Checkout hero və support</div>
              <div class="text-xs font-medium text-gray-500">Checkout başlıq, trust badges və support mətnlərini idarə et.</div>
            </div>
          </div>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Checkout badge</label>
              <input v-model="settings.cartCheckout.checkoutBadge" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <label class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Checkout support göstər</span>
              <input v-model="settings.cartCheckout.showCheckoutSupport" type="checkbox" class="h-5 w-5" />
            </label>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Checkout başlıq</label>
              <input v-model="settings.cartCheckout.checkoutTitle" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Checkout alt mətn</label>
              <textarea v-model="settings.cartCheckout.checkoutSubtitle" rows="3" class="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Support başlıq</label>
              <input v-model="settings.cartCheckout.checkoutSupportTitle" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Support mətn</label>
              <input v-model="settings.cartCheckout.checkoutSupportText" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
          </div>
          <div class="mt-5 grid gap-4 md:grid-cols-3">
            <div v-for="(item, idx) in settings.cartCheckout.checkoutTrustBadges" :key="`checkout-trust-admin-${idx}`" class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div class="mb-3 flex items-center justify-between">
                <div class="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Trust {{ idx + 1 }}</div>
                <input v-model="item.enabled" type="checkbox" class="h-5 w-5" />
              </div>
              <input v-model="item.label" type="text" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600" />
            </div>
          </div>
        </div>

        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="text-sm font-extrabold text-gray-900">Əlaqəli bölmələr</div>
          <div class="mt-2 text-xs font-medium leading-6 text-gray-500">
            Şəhər/rayon siyahısına görə filterin düzgün işləməsi üçün regionları `Çatdırılma` səhifəsindən, trafik mənbələrini izləmək üçün isə `Hesabatlar` səhifəsindən idarə edin.
          </div>
          <div class="mt-4 flex flex-wrap gap-3">
            <NuxtLink :to="adminPath('shipping')" class="inline-flex items-center justify-center rounded-2xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100">
              Çatdırılma ayarlarını aç
            </NuxtLink>
            <NuxtLink :to="adminPath('reports')" class="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-black">
              Hesabatları aç
            </NuxtLink>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <Palette class="h-5 w-5 text-blue-600" />
            <div>
              <div class="text-sm font-extrabold text-gray-900">ƏDV və rəng tonları</div>
              <div class="text-xs font-medium text-gray-500">Cart və checkout total hissələrinin tonları və ƏDV mətnini ayrıca dəyiş.</div>
            </div>
          </div>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <label class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 md:col-span-2">
              <span class="text-sm font-bold text-gray-800">ƏDV məlumatını göstər</span>
              <input v-model="settings.cartCheckout.showVatIncluded" type="checkbox" class="h-5 w-5" />
            </label>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">ƏDV başlıq</label>
              <input v-model="settings.cartCheckout.vatIncludedLabel" type="text" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">ƏDV faiz</label>
              <input v-model.number="settings.cartCheckout.vatRatePercent" type="number" min="0" max="100" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">ƏDV izahı</label>
              <textarea v-model="settings.cartCheckout.vatIncludedDescription" rows="3" class="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Cart accent bg</label>
              <input v-model="settings.cartCheckout.cartAccentBg" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Cart accent text</label>
              <input v-model="settings.cartCheckout.cartAccentText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Checkout accent bg</label>
              <input v-model="settings.cartCheckout.checkoutAccentBg" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Checkout accent text</label>
              <input v-model="settings.cartCheckout.checkoutAccentText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
            </div>
          </div>
        </div>

        <div class="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <LocateFixed class="h-5 w-5 text-blue-600" />
            <div>
              <div class="text-sm font-extrabold text-gray-900">Şəhər auto-detect</div>
              <div class="text-xs font-medium text-gray-500">Checkout zamanı şəhərin cihaz və ya IP məlumatına görə avtomatik təyin olunmasını idarə et.</div>
            </div>
          </div>
          <div class="mt-5 grid gap-4">
            <label class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span class="text-sm font-bold text-gray-800">Şəhəri avtomatik təyin et</span>
              <input v-model="settings.cartCheckout.enableCityAutofill" type="checkbox" class="h-5 w-5" />
            </label>
            <label class="space-y-2">
              <div class="text-xs font-bold uppercase tracking-widest text-gray-400">Detection prioriteti</div>
              <select v-model="settings.cartCheckout.preferredCityDetection" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-blue-600 focus:bg-white">
                <option value="device_then_ip">Cihaz, sonra IP</option>
                <option value="device">Yalnız cihaz</option>
                <option value="ip">Yalnız IP header</option>
              </select>
            </label>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
