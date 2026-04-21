<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({ layout: 'admin' })

const requests = ref<any[]>([])
const loading = ref(false)
const toastStore = useToastStore()
const { formatMoney } = useMoney()

const loadRequests = async () => {
  loading.value = true
  try {
    requests.value = await $fetch('/api/admin/seller-payouts')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id: string, status: 'Gözləyir' | 'Təsdiqləndi' | 'İmtina edildi') => {
  try {
    const updated = await $fetch(`/api/admin/seller-payouts/${encodeURIComponent(id)}`, { method: 'PUT', body: { status } })
    const index = requests.value.findIndex((item) => item.id === (updated as any).id)
    if (index !== -1) requests.value[index] = updated as any
    toastStore.success('Ödəniş sorğusunun statusu yeniləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Ödəniş sorğusunun statusu yenilənmədi')
  }
}

onMounted(loadRequests)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Satıcı ödənişləri</h1>
      <p class="mt-2 text-sm font-medium text-gray-500">Satıcıların ödəniş sorğularını burada təsdiqləyin və ya imtina edin.</p>
    </div>

    <div class="bg-white border border-gray-100 rounded-[2rem] p-6">
      <div v-if="loading" class="text-sm font-medium text-gray-500">Yüklənir...</div>
      <div v-else class="space-y-4">
        <div v-for="item in requests" :key="item.id" class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div class="text-sm font-extrabold text-gray-900">{{ item.id }}</div>
              <div class="mt-1 text-sm font-medium text-gray-500">{{ item.sellerName }}</div>
              <div class="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">{{ item.createdAt }}</div>
              <div v-if="item.note" class="mt-3 text-sm font-medium text-gray-600">{{ item.note }}</div>
            </div>
            <div class="flex flex-col items-start lg:items-end gap-3">
              <div class="text-lg font-extrabold text-gray-900">{{ formatMoney(item.amount) }}</div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="px-4 py-2 rounded-xl border border-gray-100 bg-white text-xs font-bold text-gray-700" @click="updateStatus(item.id, 'Gözləyir')">Gözləyir</button>
                <button type="button" class="px-4 py-2 rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-bold text-emerald-700" @click="updateStatus(item.id, 'Təsdiqləndi')">Təsdiqlə</button>
                <button type="button" class="px-4 py-2 rounded-xl border border-red-100 bg-red-50 text-xs font-bold text-red-700" @click="updateStatus(item.id, 'İmtina edildi')">İmtina et</button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!requests.length" class="text-sm font-medium text-gray-500">Hələ ödəniş sorğusu yoxdur.</div>
      </div>
    </div>
  </div>
</template>
