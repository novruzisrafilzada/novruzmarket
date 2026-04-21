<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, ShieldCheck, TicketPercent, Truck, ChevronRight, Sparkles, CreditCard } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { buildProductHref } from '~/utils/product-route'

const cartStore = useCartStore()
const settingsStore = useSettingsStore()
const { formatMoney } = useMoney()
const { t } = useT()
const { profileFor } = useMobileDensity()
const cartDensity = profileFor('cart')

useSiteSeo({
  title: computed(() => String(t('cart_title'))),
  description: computed(() => String(t('cart_empty_desc'))),
  path: computed(() => '/cart')
})

const couponInput = ref('')
const couponLoading = ref(false)

const applyCoupon = async () => {
  couponLoading.value = true
  try {
    const applied = await cartStore.applyCoupon(couponInput.value)
    if (applied) couponInput.value = ''
  } finally {
    couponLoading.value = false
  }
}

const cartUi = computed(() => settingsStore.settings.cartCheckout)
const cartHighlights = computed(() => (cartUi.value?.cartHighlights || []).filter((item) => item.enabled && String(item.label || '').trim()))
const cartAccentStyle = computed(() => ({
  backgroundColor: cartUi.value?.cartAccentBg || '#EFF6FF',
  color: cartUi.value?.cartAccentText || '#1D4ED8'
}))
const vatCardStyle = computed(() => ({
  backgroundColor: cartUi.value?.cartAccentBg || '#EFF6FF',
  borderColor: `${cartUi.value?.cartAccentText || '#1D4ED8'}22`
}))
const cartItemKinds = computed(() => new Set(cartStore.items.map((item) => String(item.id))).size)
const checkoutProgress = computed(() => {
  if (!cartStore.items.length) return 25
  if (cartStore.couponCode) return 90
  return 65
})
const cartMetrics = computed(() => ([
  { key: 'items', label: 'Məhsul', value: cartStore.totalItems, icon: ShoppingBag },
  { key: 'types', label: 'Növ', value: cartItemKinds.value, icon: Sparkles },
  { key: 'discount', label: 'Endirim', value: cartStore.discountAmount > 0 ? formatMoney(cartStore.discountAmount) : '-', icon: TicketPercent },
  { key: 'total', label: 'Yekun', value: formatMoney(cartStore.grandTotal), icon: CreditCard }
]))
const cartJourneyCards = computed(() => ([
  { key: 'safe', label: 'Təhlükəsiz rezerv', icon: ShieldCheck, tone: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'delivery', label: 'Çatdırılma checkout-da seçilir', icon: Truck, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { key: 'coupon', label: 'Kupon burada tətbiq olunur', icon: TicketPercent, tone: 'bg-amber-50 text-amber-700 border-amber-100' }
]))

onMounted(async () => {
  if (!settingsStore.hydrated || !settingsStore.settings.siteName) {
    await settingsStore.fetchSettings()
  }
})
</script>

<template>
  <div :class="['bg-[linear-gradient(180deg,#f6f9ff_0%,#ffffff_18%,#ffffff_100%)]', `cart-density-${cartDensity}`]">
    <div class="container py-8 pb-10 sm:py-10 lg:py-16">
    <div class="mb-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,#1d4ed8_0%,#2B3E95_48%,#0f172a_100%)] p-5 text-white shadow-[0_30px_70px_-38px_rgba(37,99,235,0.75)] sm:mb-8 sm:p-8">
      <div class="grid gap-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">
            <ShoppingBag class="h-4 w-4" />
            {{ cartUi.cartBadge || t('cart_title') }}
          </div>
          <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">{{ cartUi.cartTitle || t('cart_title') }}</h1>
          <p class="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/75 md:text-base">
            {{ cartUi.cartSubtitle || t('cart_empty_desc') }}
          </p>
          <div class="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/60">Checkout hazırlaşması</div>
                <div class="mt-1 text-sm font-semibold text-white/80">Səbətdən checkout-a keçid üçün vəziyyət</div>
              </div>
              <div class="text-lg font-extrabold text-white">{{ checkoutProgress }}%</div>
            </div>
            <div class="mt-3 h-2.5 rounded-full bg-white/10">
              <div class="h-2.5 rounded-full bg-[#FACC15]" :style="{ width: `${checkoutProgress}%` }"></div>
            </div>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="metric in cartMetrics" :key="metric.key" class="rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
            <div class="flex items-center justify-between gap-3">
              <component :is="metric.icon" class="h-4 w-4 text-[#FACC15]" />
              <div class="text-right text-xl font-extrabold text-white">{{ metric.value }}</div>
            </div>
            <div class="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white/60">{{ metric.label }}</div>
          </div>
        </div>
      </div>
      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <div v-for="(item, idx) in cartHighlights" :key="`cart-highlight-${idx}`" class="rounded-[1.25rem] border border-white/10 bg-white/10 px-4 py-4 text-sm font-extrabold text-white/85">
          {{ item.label }}
        </div>
        <div v-if="!cartHighlights.length" class="rounded-[1.25rem] border border-white/10 bg-white/10 px-4 py-4 text-sm font-extrabold text-white/85">Təhlükəsiz sifariş axını</div>
      </div>
    </div>

    <div v-if="cartStore.items.length === 0" class="rounded-[2rem] border border-dashed border-gray-200 bg-white py-24 text-center shadow-sm">
      <ShoppingBag class="w-20 h-20 text-gray-300 mx-auto mb-6" />
      <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ t('cart_empty_title') }}</h2>
      <p class="text-gray-500 mb-8 max-w-md mx-auto">{{ t('cart_empty_desc') }}</p>
      <NuxtLink to="/shop" class="inline-flex items-center rounded-lg bg-[#FACC15] px-8 py-4 font-bold text-gray-900 shadow-[0_16px_35px_-22px_rgba(250,204,21,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-95">
        <ArrowLeft class="w-5 h-5 mr-2" />
        {{ t('back_to_shop') }}
      </NuxtLink>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-10">
      <!-- Cart Items -->
      <div class="lg:w-2/3 space-y-6">
          <div class="rounded-[1.75rem] border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <div class="grid gap-3 sm:grid-cols-3">
              <div v-for="card in cartJourneyCards" :key="card.key" :class="['flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold', card.tone]">
                <component :is="card.icon" class="h-4 w-4" /> {{ card.label }}
              </div>
            </div>
          </div>

          <div v-for="item in cartStore.items" :key="item.cartKey || item.id" class="mx-[15px] rounded-[1.75rem] border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md group sm:mx-0 sm:p-6">
          <div class="flex items-start gap-4">
          <NuxtLink :to="buildProductHref(item)" class="w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 rounded-[1.25rem] bg-gray-50 p-3 sm:p-4 block">
            <img :src="item.image" :alt="item.name" class="w-full h-full object-contain group-hover:scale-110 transition-transform" />
          </NuxtLink>
          <div class="flex-grow min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <NuxtLink :to="buildProductHref(item)" class="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 block">{{ item.name }}</NuxtLink>
                <p v-if="item.variationLabel" class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{{ item.variationLabel }}</p>
                <p class="text-blue-600 font-extrabold text-base sm:text-xl mt-2">{{ formatMoney(item.price) }}</p>
                <p class="lg:hidden text-xs font-bold text-gray-500 mt-1">{{ formatMoney(item.price * item.quantity) }}</p>
              </div>
              <button @click="cartStore.removeFromCart(item.cartKey || item.id)" class="text-red-500 hover:text-red-700 p-2 transition-colors flex-shrink-0">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>

            <div class="mt-3 flex items-center justify-between">
              <div class="flex items-center border border-gray-100 rounded-2xl bg-gray-50 px-2 py-1">
                <button type="button" class="w-9 h-9 flex items-center justify-center hover:text-blue-600" @click="cartStore.decreaseQuantity(item.cartKey || item.id)"><Minus class="w-4 h-4" /></button>
                <span class="px-3 font-extrabold text-gray-800 text-sm">{{ item.quantity }}</span>
                <button type="button" class="w-9 h-9 flex items-center justify-center hover:text-blue-600 disabled:opacity-40" :disabled="Number(item.stock || 0) > 0 && item.quantity >= Number(item.stock || 0)" @click="cartStore.increaseQuantity(item.cartKey || item.id)"><Plus class="w-4 h-4" /></button>
              </div>
              <div v-if="Number(item.stock || 0) > 0" class="text-[11px] font-bold text-gray-400">
                {{ item.quantity }}/{{ Number(item.stock || 0) }} {{ t('in_stock') }}
              </div>
            </div>
          </div>
          <div class="hidden lg:block text-right">
            <p class="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Cəmi</p>
            <p class="text-2xl font-extrabold text-gray-900">{{ formatMoney(item.price * item.quantity) }}</p>
          </div>
        </div>
          <div class="mt-4 flex items-center justify-between gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-3 lg:hidden">
            <div>
              <div class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-400">Məbləğ</div>
              <div class="mt-1 text-lg font-extrabold text-gray-900">{{ formatMoney(item.price * item.quantity) }}</div>
            </div>
            <NuxtLink :to="buildProductHref(item)" class="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600">
              Məhsula bax
              <ChevronRight class="h-4 w-4" />
            </NuxtLink>
          </div>
          </div>

      </div>

      <!-- Order Summary -->
      <div class="lg:w-1/3">
        <div class="mx-[15px] rounded-[1.75rem] border border-gray-100 bg-white p-4 shadow-sm sm:mx-0 sm:p-6 lg:sticky lg:top-8 lg:p-8">
          <div class="mb-5 rounded-[1.25rem] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_100%)] p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">Checkout panel</div>
                <h2 class="mt-2 text-xl font-bold text-gray-900">{{ t('order_summary') }}</h2>
              </div>
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <CreditCard class="h-5 w-5" />
              </div>
            </div>
            <p class="mt-3 text-sm font-medium leading-6 text-gray-600">Məbləğ, kupon və checkout keçidi bir paneldə toplanıb.</p>
          </div>
          <div class="mb-7 space-y-4">
            <div class="flex items-start justify-between gap-3 text-gray-600 font-medium">
              <span>{{ t('subtotal') }}</span>
              <span class="text-gray-900">{{ formatMoney(cartStore.totalPrice) }}</span>
            </div>
            <div class="flex items-start justify-between gap-3 text-gray-600 font-medium">
              <span>{{ t('shipping') }}</span>
              <span class="text-green-600 font-bold">{{ t('free') }}</span>
            </div>
            <div v-if="cartStore.discountAmount > 0" class="flex items-start justify-between gap-3 text-gray-600 font-medium">
              <span>{{ t('discount') }}</span>
              <span class="text-emerald-600 font-bold">-{{ formatMoney(cartStore.discountAmount) }}</span>
            </div>
            <div class="mt-4 flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
              <span class="text-lg font-bold text-gray-900 sm:text-xl">{{ t('grand_total') }}</span>
              <span class="text-right text-xl font-extrabold text-blue-600 sm:text-2xl">{{ formatMoney(cartStore.grandTotal) }}</span>
            </div>
            <div
              v-if="cartUi.showVatIncluded"
              class="rounded-lg border px-4 py-4"
              :style="vatCardStyle"
            >
              <div class="flex items-start gap-3">
                <div class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-current/10 bg-white/70">
                  <ShieldCheck class="h-5 w-5" :style="{ color: cartUi.cartAccentText || '#1D4ED8' }" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-extrabold" :style="{ color: cartUi.cartAccentText || '#1D4ED8' }">
                    {{ cartUi.vatIncludedLabel || t('vat_included') }}
                  </div>
                  <div class="mt-1 text-xs font-medium leading-6 text-gray-600">
                    {{ cartUi.vatIncludedDescription }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-7">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">{{ t('coupon_code') }}</div>
            <div class="flex flex-col gap-3 sm:flex-row">
              <input v-model="couponInput" type="text" class="min-w-0 flex-1 rounded-lg border border-gray-100 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 outline-none transition-all focus:border-[#FACC15]" />
              <button type="button" class="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-5 py-3.5 text-sm font-extrabold text-white transition-all hover:bg-black disabled:opacity-60 sm:w-auto sm:min-w-[132px]" :disabled="couponLoading" @click="applyCoupon">{{ couponLoading ? t('loading') : t('apply') }}</button>
            </div>
            <div v-if="cartStore.couponCode" class="mt-3 text-xs font-bold text-gray-500">
              {{ t('coupon_code') }}: <span class="text-gray-900">{{ cartStore.couponCode }}</span>
              <button type="button" class="ml-3 text-red-600 hover:underline" @click="cartStore.removeCoupon()">x</button>
            </div>
          </div>
          <NuxtLink to="/checkout" class="group mb-4 flex w-full items-center justify-center rounded-[1.25rem] bg-[#FACC15] px-4 py-4 text-center font-extrabold text-gray-900 shadow-[0_16px_35px_-22px_rgba(250,204,21,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-95 active:translate-y-0 active:scale-[0.99] sm:py-5">
            {{ t('order_now') }}
            <ArrowLeft class="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
          <NuxtLink to="/shop" class="w-full text-center block text-gray-500 font-bold text-sm hover:text-blue-600 transition-colors uppercase tracking-widest">
            {{ t('continue_shopping') }}
          </NuxtLink>

          <div class="mt-6 rounded-lg border border-gray-100 px-4 py-4 text-sm font-medium" :style="cartAccentStyle">
            Sifarişi checkout-da tamamlayanda ünvan, çatdırılma və ödəniş axını ayrıca təsdiqlənir.
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .cart-density-compact :deep(.text-3xl.font-extrabold) {
    font-size: 1.875rem;
    line-height: 2.2rem;
  }
  .cart-density-compact :deep(.text-2xl.font-extrabold) {
    font-size: 1.25rem;
    line-height: 1.7rem;
  }
  .cart-density-compact :deep(.p-6),
  .cart-density-compact :deep(.sm\:p-6) {
    padding: 1rem;
  }
  .cart-density-compact :deep(.rounded-\[1\.75rem\].border.border-gray-100.bg-white.p-4) {
    padding: 0.875rem;
  }
}
</style>
