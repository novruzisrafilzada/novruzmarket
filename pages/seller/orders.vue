<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

definePageMeta({
  layout: 'seller',
  middleware: ['require-seller']
})

const authStore = useAuthStore()
const productStore = useProductStore()
const orderStore = useOrderStore()
const toastStore = useToastStore()
const { formatMoney } = useMoney()
const loadingOrderId = ref('')

const sellerProducts = computed(() => productStore.products.filter(p => p.sellerId === authStore.user?.id))
const sellerProductIds = computed(() => new Set(sellerProducts.value.map(p => p.id)))
const sellerOrders = computed(() => {
  return orderStore.orders
    .map(order => {
      const items = (order.items || []).filter(item => sellerProductIds.value.has(item.id))
      if (!items.length) return null
      const amount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0)
      const sellerStatus = order.sellerStatuses?.[String(authStore.user?.id || '')]?.status || order.status || 'Gözləyir'
      return { ...order, items, amount, sellerStatus }
    })
    .filter(Boolean) as Array<any>
})

onMounted(async () => {
  await Promise.all([productStore.fetchProducts(), orderStore.fetchOrders()])
})

const updateOrderStatus = async (orderId: string, status: 'Hazırlanır' | 'Göndərildi' | 'Çatdırıldı') => {
  loadingOrderId.value = `${orderId}-${status}`
  try {
    await orderStore.updateOrderStatus(orderId, status)
    toastStore.success(`Sifariş statusu yeniləndi: ${status}`)
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Status yenilənmədi')
  } finally {
    loadingOrderId.value = ''
  }
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <div class="text-lg font-extrabold text-slate-900">Satıcı sifarişləri</div>
        <div class="text-sm font-medium text-slate-500 mt-1">Yalnız sizin məhsullarınız olan sifarişlər burada görünür.</div>
      </div>
      <div class="text-sm font-bold text-slate-500">{{ sellerOrders.length }} sifariş</div>
    </div>

    <div class="mt-6 space-y-5">
      <div v-for="order in sellerOrders" :key="order.id" class="border border-slate-100 rounded-[1.75rem] p-5">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div>
            <div class="text-base font-extrabold text-slate-900">#{{ order.id }}</div>
            <div class="mt-1 text-sm font-medium text-slate-500">{{ order.customer }} • {{ order.email }}</div>
            <div class="mt-1 text-sm font-medium text-slate-500">{{ order.address }}</div>
            <div class="mt-1 text-sm font-medium text-slate-500">{{ order.phone }}</div>
          </div>
          <div class="text-left lg:text-right">
            <div class="inline-flex px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600">{{ order.sellerStatus }}</div>
            <div class="mt-3 text-xl font-extrabold text-slate-900">{{ formatMoney(order.amount) }}</div>
            <div class="mt-1 text-sm font-medium text-slate-500">{{ order.date }}</div>
            <div class="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">{{ order.trackingCode || '-' }}</div>
          </div>
        </div>

        <div class="mt-5 border-t border-slate-100 pt-5 space-y-3">
          <div v-for="item in order.items" :key="`${order.id}-${item.id}`" class="flex items-center gap-4">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-14 h-14 rounded-2xl object-cover bg-slate-50" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-extrabold text-slate-900 truncate">{{ item.name }}</div>
              <div class="mt-1 text-xs font-medium text-slate-500">{{ item.qty }} ədəd × {{ formatMoney(item.price) }}</div>
            </div>
            <div class="text-sm font-extrabold text-slate-900">{{ formatMoney(Number(item.price || 0) * Number(item.qty || 0)) }}</div>
          </div>
        </div>
        <div class="mt-5 flex flex-wrap gap-2">
          <button type="button" class="px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-60" :disabled="loadingOrderId === `${order.id}-Hazırlanır`" @click="updateOrderStatus(order.id, 'Hazırlanır')">Hazırlanır</button>
          <button type="button" class="px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-60" :disabled="loadingOrderId === `${order.id}-Göndərildi`" @click="updateOrderStatus(order.id, 'Göndərildi')">Göndərildi</button>
          <button type="button" class="px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-60" :disabled="loadingOrderId === `${order.id}-Çatdırıldı`" @click="updateOrderStatus(order.id, 'Çatdırıldı')">Çatdırıldı</button>
        </div>
      </div>

      <div v-if="!sellerOrders.length" class="text-sm font-medium text-slate-500">Hələ sizin məhsullarınız üçün sifariş yoxdur.</div>
    </div>
  </div>
</template>
