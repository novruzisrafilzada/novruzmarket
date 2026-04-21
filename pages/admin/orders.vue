<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ShoppingCart, Search, Plus, Filter, MoreVertical, Edit, Trash2, Eye, X, CheckCircle } from 'lucide-vue-next'
import { useOrderStore, type Order } from '~/stores/orders'

definePageMeta({ layout: 'admin' })

const orderStore = useOrderStore()
const toastStore = useToastStore()
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedOrder = ref<Order | null>(null)
const { formatMoney } = useMoney()

const filteredOrders = computed(() => {
  return orderStore.orders.filter(o => 
    o.customer.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    String(o.trackingCode || '').toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const openModal = (order: Order) => {
  selectedOrder.value = order
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedOrder.value = null
}

const updateStatus = async (status: Order['status']) => {
  if (selectedOrder.value) {
    try {
      const updated = await orderStore.updateOrderStatus(selectedOrder.value.id, status)
      selectedOrder.value = updated
      toastStore.success(`Sifariş statusu yeniləndi: ${status}`)
      closeModal()
    } catch (error: any) {
      toastStore.error(error?.data?.message || 'Sifariş statusu yenilənmədi')
    }
  }
}

onMounted(async () => {
  await orderStore.fetchOrders()
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Sifarişlərin İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Bütün müştəri sifarişlərini buradan izləyə bilərsiniz.</p>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Sifariş ID, tracking və ya müştəri..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
        <button class="flex items-center text-gray-500 font-bold text-sm hover:text-blue-600 transition-colors">
          <Filter class="w-4 h-4 mr-2" /> Filtrlər
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">Sifariş ID</th>
              <th class="px-8 py-4">Müştəri</th>
              <th class="px-8 py-4">Tarix</th>
              <th class="px-8 py-4">Məbləğ</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6 text-sm font-bold text-blue-600">{{ order.id }}</td>
              <td class="px-8 py-6">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-800">{{ order.customer }}</span>
                  <span class="text-[10px] text-gray-400 font-medium">{{ order.email }}</span>
                </div>
              </td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">{{ order.date }}</td>
              <td class="px-8 py-6 text-sm font-extrabold text-gray-900">{{ formatMoney(order.amount) }}</td>
              <td class="px-8 py-6">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', order.statusColor]">
                  {{ order.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="openModal(order)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye class="w-4 h-4" /></button>
                  <button @click="openModal(order)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="filteredOrders.length === 0" class="p-20 text-center">
        <ShoppingCart class="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <p class="text-gray-400 font-bold uppercase tracking-widest text-sm">Sifariş tapılmadı</p>
      </div>
    </div>

    <!-- Order Detail/Status Modal -->
    <div v-if="isModalOpen && selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900">Sifariş Detalları</h2>
            <p class="text-sm text-gray-500 font-medium">ID: {{ selectedOrder.id }}</p>
          </div>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 hover:shadow-lg transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center pb-4 border-b border-gray-50">
              <span class="text-sm font-bold text-gray-400">Müştəri</span>
              <span class="text-sm font-bold text-gray-900">{{ selectedOrder.customer }}</span>
            </div>
            <div class="flex justify-between items-center pb-4 border-b border-gray-50">
              <span class="text-sm font-bold text-gray-400">Məbləğ</span>
              <span class="text-sm font-extrabold text-blue-600">{{ formatMoney(selectedOrder.amount) }}</span>
            </div>
            <div class="flex justify-between items-center pb-4 border-b border-gray-50">
              <span class="text-sm font-bold text-gray-400">Tracking</span>
              <span class="text-sm font-extrabold text-gray-900">{{ selectedOrder.trackingCode || '-' }}</span>
            </div>
            <div class="flex justify-between items-center pb-4 border-b border-gray-50">
              <span class="text-sm font-bold text-gray-400">Ünvan</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedOrder.address }}</span>
            </div>
            <div class="flex justify-between items-center pb-4 border-b border-gray-50">
              <span class="text-sm font-bold text-gray-400">Telefon</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedOrder.phone || '-' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-gray-400">Ödəniş</span>
              <span class="text-sm font-bold text-gray-900">{{ selectedOrder.paymentMethod === 'card' ? 'Kartla' : 'Nağd' }}</span>
            </div>
          </div>

          <div class="space-y-4">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Statusu Dəyiş</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                v-for="status in ['Gözləyir', 'Təsdiqləndi', 'Hazırlanır', 'Göndərildi', 'Çatdırıldı', 'Ləğv istəyi', 'Qaytarma istəyi', 'İptal edildi', 'Qaytarıldı']" 
                :key="status"
                @click="updateStatus(status as any)"
                :class="[
                  'px-4 py-3 rounded-xl text-xs font-bold transition-all border',
                  selectedOrder.status === status ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                ]"
              >
                {{ status }}
              </button>
            </div>
            <div v-if="selectedOrder.customerRequestNote" class="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-700">
              <div class="text-xs font-extrabold uppercase tracking-widest mb-2">Müştəri qeydi</div>
              {{ selectedOrder.customerRequestNote }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
