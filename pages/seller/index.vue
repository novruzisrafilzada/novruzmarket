<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Boxes, ClipboardList, PackageCheck, Store } from 'lucide-vue-next'

definePageMeta({
  layout: 'seller',
  middleware: ['require-seller']
})

const authStore = useAuthStore()
const productStore = useProductStore()
const orderStore = useOrderStore()
const { formatMoney } = useMoney()

const sellerProducts = computed(() => productStore.products.filter(p => p.sellerId === authStore.user?.id))
const sellerProductIds = computed(() => new Set(sellerProducts.value.map(p => p.id)))
const sellerOrders = computed(() => {
  return orderStore.orders
    .map(order => {
      const items = (order.items || []).filter(item => sellerProductIds.value.has(item.id))
      if (!items.length) return null
      const amount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0)
      return { ...order, items, amount }
    })
    .filter(Boolean) as Array<any>
})

const metrics = computed(() => {
  const totalStock = sellerProducts.value.reduce((sum, p) => sum + Number(p.stock || 0), 0)
  const totalSold = sellerProducts.value.reduce((sum, p) => sum + Number(p.sold || 0), 0)
  const totalRevenue = sellerOrders.value.reduce((sum, o) => sum + Number(o.amount || 0), 0)
  const deliveredOrders = sellerOrders.value.filter((item) => item.status === 'Çatdırıldı').length
  const shippedOrders = sellerOrders.value.filter((item) => item.status === 'Göndərildi').length
  const fulfillmentRate = sellerOrders.value.length ? `${Math.round((deliveredOrders / sellerOrders.value.length) * 100)}%` : '0%'
  const responseRate = sellerOrders.value.length ? `${Math.round(((deliveredOrders + shippedOrders) / sellerOrders.value.length) * 100)}%` : '0%'
  return [
    { label: 'Məhsullar', value: sellerProducts.value.length, icon: Store },
    { label: 'Stok cəmi', value: totalStock, icon: Boxes },
    { label: 'Sifarişlər', value: sellerOrders.value.length, icon: ClipboardList },
    { label: 'Satış dövriyyəsi', value: formatMoney(totalRevenue), icon: PackageCheck },
    { label: 'Fulfillment rate', value: fulfillmentRate, icon: PackageCheck },
    { label: 'Response score', value: responseRate, icon: ClipboardList }
  ]
})

onMounted(async () => {
  await Promise.all([productStore.fetchProducts(), orderStore.fetchOrders()])
})
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white border border-slate-200 rounded-[2rem] p-8">
      <div class="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Satıcı paneli</div>
      <h1 class="mt-3 text-3xl font-extrabold text-slate-900">{{ authStore.user?.sellerProfile?.shopName || 'Mağaza paneli' }}</h1>
      <p class="mt-2 text-slate-500 font-medium">Məhsullarınızı, stok vəziyyətini və sifarişlərinizi bu paneldən idarə edin.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div v-for="metric in metrics" :key="metric.label" class="bg-white border border-slate-200 rounded-[2rem] p-6">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <component :is="metric.icon" class="w-6 h-6" />
        </div>
        <div class="mt-5 text-sm font-bold text-slate-500">{{ metric.label }}</div>
        <div class="mt-2 text-3xl font-extrabold text-slate-900">{{ metric.value }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[1fr,1.1fr] gap-6">
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
        <div class="flex items-center justify-between">
          <div class="text-lg font-extrabold text-slate-900">Son məhsullar</div>
          <NuxtLink to="/seller/products" class="text-sm font-bold text-blue-600 hover:underline">Hamısına bax</NuxtLink>
        </div>
        <div class="mt-6 space-y-4">
          <div v-for="product in sellerProducts.slice(0, 5)" :key="product.id" class="flex items-center gap-4 border border-slate-100 rounded-2xl p-4">
            <img :src="product.image" :alt="product.name" class="w-16 h-16 rounded-2xl object-cover bg-slate-50" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-extrabold text-slate-900 truncate">{{ product.name }}</div>
              <div class="mt-1 text-xs font-medium text-slate-500">Stok: {{ product.stock }} • Satılıb: {{ product.sold }}</div>
            </div>
            <div class="text-sm font-extrabold text-slate-900">{{ formatMoney(product.price) }}</div>
          </div>
          <div v-if="!sellerProducts.length" class="text-sm font-medium text-slate-500">Hələ məhsul əlavə edilməyib.</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
        <div class="flex items-center justify-between">
          <div class="text-lg font-extrabold text-slate-900">Son sifarişlər</div>
          <NuxtLink to="/seller/orders" class="text-sm font-bold text-blue-600 hover:underline">Sifarişlərə keç</NuxtLink>
        </div>
        <div class="mt-6 space-y-4">
          <div v-for="order in sellerOrders.slice(0, 5)" :key="order.id" class="border border-slate-100 rounded-2xl p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-extrabold text-slate-900">#{{ order.id }}</div>
                <div class="mt-1 text-xs font-medium text-slate-500">{{ order.customer }} • {{ order.date }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-extrabold text-slate-900">{{ formatMoney(order.amount) }}</div>
                <div class="mt-1 text-xs font-bold text-blue-600">{{ order.status }}</div>
              </div>
            </div>
          </div>
          <div v-if="!sellerOrders.length" class="text-sm font-medium text-slate-500">Hələ sifariş yoxdur.</div>
        </div>
      </div>
    </div>
  </div>
</template>
