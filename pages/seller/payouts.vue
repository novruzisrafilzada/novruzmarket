<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

definePageMeta({
  layout: 'seller',
  middleware: ['require-seller']
})

const authStore = useAuthStore()
const orderStore = useOrderStore()
const productStore = useProductStore()
const settingsStore = useSettingsStore()
const { formatMoney } = useMoney()
const toastStore = useToastStore()

const payoutRequests = ref<any[]>([])
const payoutAmount = ref(0)
const payoutNote = ref('')
const submitting = ref(false)

const sellerProductIds = computed(() => new Set(productStore.products.filter((item) => item.sellerId === authStore.user?.id).map((item) => item.id)))
const sellerOrders = computed(() =>
  orderStore.orders
    .filter((order) => String(order.status || '') === 'Çatdırıldı')
    .map((order) => {
      const items = (order.items || []).filter((item) => sellerProductIds.value.has(item.id))
      if (!items.length) return null
      const amount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0)
      return { ...order, items, amount }
    })
    .filter(Boolean) as any[]
)
const grossRevenue = computed(() => sellerOrders.value.reduce((sum, order) => sum + Number(order.amount || 0), 0))
const commissionRate = computed(() => Number(settingsStore.settings.sellerCommissionRate || 10))
const commissionAmount = computed(() => grossRevenue.value * (commissionRate.value / 100))
const netRevenue = computed(() => Math.max(0, grossRevenue.value - commissionAmount.value))
const reservedPayoutAmount = computed(() => payoutRequests.value.filter((item) => ['Gözləyir', 'Təsdiqləndi'].includes(String(item.status || ''))).reduce((sum, item) => sum + Number(item.amount || 0), 0))
const availableForPayout = computed(() => Math.max(0, netRevenue.value - reservedPayoutAmount.value))
const fulfillmentRate = computed(() => {
  if (!sellerOrders.value.length) return '0%'
  const delivered = sellerOrders.value.filter((item) => item.status === 'Çatdırıldı').length
  return `${Math.round((delivered / sellerOrders.value.length) * 100)}%`
})

const loadData = async () => {
  await Promise.all([
    authStore.fetchSession(),
    productStore.fetchProducts(),
    orderStore.fetchOrders(),
    settingsStore.fetchSettings()
  ])
  payoutRequests.value = await $fetch('/api/seller/payouts')
}

const requestPayout = async () => {
  if (!payoutAmount.value || payoutAmount.value <= 0) {
    toastStore.error('Məbləği daxil edin')
    return
  }
  if (payoutAmount.value > availableForPayout.value) {
    toastStore.error('Mövcud balansdan çox məbləğ seçildi')
    return
  }
  submitting.value = true
  try {
    const created = await $fetch('/api/seller/payouts', { method: 'POST', body: { amount: payoutAmount.value, note: payoutNote.value } })
    payoutRequests.value = [created as any, ...payoutRequests.value]
    payoutAmount.value = 0
    payoutNote.value = ''
    toastStore.success('Payout sorğusu göndərildi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Payout sorğusu göndərilmədi')
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
        <div class="text-sm font-bold text-slate-500">Gross revenue</div>
        <div class="mt-2 text-3xl font-extrabold text-slate-900">{{ formatMoney(grossRevenue) }}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
        <div class="text-sm font-bold text-slate-500">Komissiya ({{ commissionRate }}%)</div>
        <div class="mt-2 text-3xl font-extrabold text-slate-900">{{ formatMoney(commissionAmount) }}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
        <div class="text-sm font-bold text-slate-500">Çıxarıla bilən balans</div>
        <div class="mt-2 text-3xl font-extrabold text-slate-900">{{ formatMoney(availableForPayout) }}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
        <div class="text-sm font-bold text-slate-500">Fulfillment rate</div>
        <div class="mt-2 text-3xl font-extrabold text-slate-900">{{ fulfillmentRate }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[0.95fr,1.05fr] gap-6">
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
        <div class="text-lg font-extrabold text-slate-900">Payout sorğusu</div>
        <input v-model.number="payoutAmount" type="number" min="0" step="0.01" placeholder="Məbləğ" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium outline-none focus:border-blue-600" />
        <textarea v-model="payoutNote" rows="4" placeholder="Qeyd" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium outline-none focus:border-blue-600 resize-none"></textarea>
        <button type="button" class="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="submitting" @click="requestPayout">
          {{ submitting ? 'Göndərilir...' : 'Payout istəyi göndər' }}
        </button>
      </div>

      <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
        <div class="text-lg font-extrabold text-slate-900">Payout tarixçəsi</div>
        <div class="mt-5 space-y-4">
          <div v-for="item in payoutRequests" :key="item.id" class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-extrabold text-slate-900">{{ item.id }}</div>
                <div class="mt-1 text-xs font-medium text-slate-500">{{ item.createdAt }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-extrabold text-slate-900">{{ formatMoney(item.amount) }}</div>
                <div class="mt-1 text-xs font-bold text-blue-600">{{ item.status }}</div>
              </div>
            </div>
            <div v-if="item.note" class="mt-3 text-sm font-medium text-slate-500">{{ item.note }}</div>
            <div v-if="item.transferReference || item.failureReason || item.processedAt" class="mt-3 space-y-1 text-xs font-medium text-slate-500">
              <div v-if="item.transferReference">Transfer ref: {{ item.transferReference }}</div>
              <div v-if="item.failureReason">Səbəb: {{ item.failureReason }}</div>
              <div v-if="item.processedAt">İcra vaxtı: {{ item.processedAt }}</div>
            </div>
          </div>
          <div v-if="!payoutRequests.length" class="text-sm font-medium text-slate-500">Hələ payout sorğusu yoxdur.</div>
        </div>
      </div>
    </div>
  </div>
</template>
