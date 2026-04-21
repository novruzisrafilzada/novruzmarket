<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Search, Truck } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useOrderStore } from '~/stores/orders'

const trackingCode = ref('')
const email = ref('')
const route = useRoute()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const loading = ref(false)
const errorMessage = ref('')
const order = ref<any | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const myOrders = computed(() =>
  [...orderStore.orders].sort((a, b) => new Date(String(b.date || '')).getTime() - new Date(String(a.date || '')).getTime())
)

const formatOrderDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('az-AZ')
}

const formatAmount = (value: number) => `₼${Number(value || 0).toFixed(2)}`

const selectOrder = (nextOrder: any) => {
  order.value = nextOrder
  trackingCode.value = String(nextOrder?.trackingCode || '')
  email.value = String(nextOrder?.email || authStore.user?.email || '')
  errorMessage.value = ''
}

const loadMyOrders = async () => {
  if (!authStore.isLoggedIn) {
    await authStore.fetchSession()
  }
  if (!authStore.isLoggedIn) return
  await orderStore.fetchOrders()
  if (!order.value && myOrders.value.length > 0) {
    selectOrder(myOrders.value[0])
  }
}

const refreshCurrentOrder = async () => {
  if (authStore.isLoggedIn) {
    await orderStore.fetchOrders()
    if (order.value?.trackingCode) {
      const matched = myOrders.value.find((item) => item.trackingCode === order.value?.trackingCode)
      if (matched) order.value = matched
    }
    return
  }
  if (!trackingCode.value || !email.value) return
  try {
    order.value = await $fetch('/api/orders/track', {
      query: {
        trackingCode: trackingCode.value,
        email: email.value
      }
    })
  } catch {}
}

const trackOrder = async () => {
  if (!trackingCode.value || !email.value) {
    errorMessage.value = 'Tracking kodu və email vacibdir'
    return
  }
  loading.value = true
  errorMessage.value = ''
  order.value = null
  try {
    const tracked = await $fetch('/api/orders/track', {
      query: {
        trackingCode: trackingCode.value,
        email: email.value
      }
    })
    order.value = tracked
    const matched = myOrders.value.find((item) => item.trackingCode === tracked?.trackingCode)
    if (matched) {
      order.value = matched
    }
  } catch {
    errorMessage.value = 'Sifariş tapılmadı və ya məlumat yanlışdır'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadMyOrders()
  const queryTrackingCode = String(route.query.trackingCode || '')
  const queryEmail = String(route.query.email || '')
  if (queryTrackingCode && queryEmail) {
    trackingCode.value = queryTrackingCode
    email.value = queryEmail
    await trackOrder()
  }
  refreshTimer = setInterval(() => {
    refreshCurrentOrder()
  }, 15000)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <div class="container py-16 md:py-24">
    <div class="max-w-4xl">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Sifariş izləmə</h1>
      <p class="text-gray-500 text-lg font-medium">Sifarişdən sonra sizə görünən tracking kodu və email ilə statusu izləyin.</p>
    </div>

    <div class="mt-10 grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
      <div class="space-y-6">
        <div v-if="authStore.isLoggedIn && myOrders.length > 0" class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="text-sm font-extrabold text-gray-900">Sizin sifarişləriniz</div>
              <div class="mt-1 text-sm text-gray-500 font-medium">Admin paneldə status dəyişdikcə bu siyahı yenilənir.</div>
            </div>
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">{{ myOrders.length }} sifariş</div>
          </div>
          <div class="mt-5 space-y-3 max-h-[420px] overflow-auto pr-1">
            <button
              v-for="myOrder in myOrders"
              :key="myOrder.id"
              type="button"
              class="w-full rounded-2xl border px-4 py-4 text-left transition-all"
              :class="order?.trackingCode === myOrder.trackingCode ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-white'"
              @click="selectOrder(myOrder)"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div class="text-sm font-extrabold text-gray-900">{{ myOrder.id }}</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">{{ formatOrderDate(myOrder.date) }}</div>
                  <div class="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{{ myOrder.trackingCode || '-' }}</div>
                </div>
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap', myOrder.statusColor]">{{ myOrder.status }}</span>
              </div>
              <div class="mt-4 flex items-center justify-between gap-4">
                <div class="text-xs font-medium text-gray-500">{{ Array.isArray(myOrder.items) ? myOrder.items.length : 0 }} məhsul</div>
                <div class="text-sm font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ formatAmount(myOrder.amount) }}</div>
              </div>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-gray-600 mb-8">Sifarişinizi izləmək üçün aşağıdakı xanalara məlumatları daxil edin.</p>
        <div class="space-y-6">
          <input v-model="trackingCode" type="text" placeholder="Tracking kodu" class="w-full px-6 py-4 rounded-2xl border border-transparent focus:border-blue-600 outline-none" />
          <input v-model="email" type="email" placeholder="E-poçt" class="w-full px-6 py-4 rounded-2xl border border-transparent focus:border-blue-600 outline-none" />
          <button type="button" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60" :disabled="loading" @click="trackOrder">
            <Search class="w-5 h-5" />
            {{ loading ? 'Axtarılır...' : 'İzlə' }}
          </button>
        </div>
        <div v-if="errorMessage" class="mt-5 text-sm font-bold text-red-600">{{ errorMessage }}</div>
      </div>
      </div>

      <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div v-if="!order" class="h-full min-h-[320px] flex flex-col items-center justify-center text-center">
          <Truck class="w-14 h-14 text-blue-200" />
          <div class="mt-5 text-2xl font-extrabold text-gray-900">Sifariş məlumatı burada görünəcək</div>
          <div class="mt-2 text-gray-500 font-medium">Tracking kodunu daxil etdikdən sonra status, məbləğ və məhsullar siyahısı çıxacaq.</div>
        </div>

        <div v-else class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div class="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">Tracking</div>
              <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ order.trackingCode }}</div>
              <div class="mt-2 text-sm font-medium text-gray-500">{{ order.id }} · {{ formatOrderDate(order.date) }}</div>
            </div>
            <span :class="['px-4 py-2 rounded-full text-xs font-extrabold w-fit', order.statusColor]">{{ order.status }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="rounded-2xl bg-gray-50 p-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Müştəri</div>
              <div class="mt-2 text-lg font-extrabold text-gray-900">{{ order.customer }}</div>
            </div>
            <div class="rounded-2xl bg-gray-50 p-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Məbləğ</div>
              <div class="mt-2 text-lg font-extrabold text-gray-900">{{ formatAmount(order.amount) }}</div>
            </div>
            <div class="rounded-2xl bg-gray-50 p-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Ödəniş</div>
              <div class="mt-2 text-lg font-extrabold text-gray-900">{{ order.paymentMethod === 'card' ? 'Kart' : 'Nağd' }}</div>
            </div>
          </div>

          <div class="rounded-[1.75rem] border border-gray-100 divide-y divide-gray-100">
            <div v-for="item in order.items || []" :key="`${order.id}-${item.id}`" class="p-4 flex items-center gap-4">
              <img :src="item.image" :alt="item.name" class="w-16 h-16 rounded-2xl bg-gray-50 object-contain p-2 border border-gray-100" />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-extrabold text-gray-900">{{ item.name }}</div>
                <div class="mt-1 text-xs font-medium text-gray-500">{{ item.qty }} ədəd</div>
              </div>
              <div class="text-sm font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ formatAmount(item.price) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
