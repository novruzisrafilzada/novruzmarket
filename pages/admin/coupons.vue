<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, Ticket, Search, Calendar, Tag } from 'lucide-vue-next'
import { useCouponStore, type Coupon } from '~/stores/coupons'

definePageMeta({ layout: 'admin' })

const couponStore = useCouponStore()
const toastStore = useToastStore()
const searchQuery = ref('')
const isModalOpen = ref(false)
const editingCoupon = ref<Coupon | null>(null)
const loading = ref(false)
const { formatMoney } = useMoney()

const couponForm = ref({
  code: '',
  discount: 0,
  type: 'Percentage' as Coupon['type'],
  expiryDate: '',
  status: 'Aktiv' as Coupon['status'],
  minSubtotal: 0,
  usageLimit: 0,
  allowedUserEmails: ''
})

const filteredCoupons = computed(() => {
  return couponStore.coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const openModal = (coupon?: Coupon) => {
  if (coupon) {
    editingCoupon.value = coupon
    couponForm.value = {
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      expiryDate: coupon.expiryDate,
      status: coupon.status,
      minSubtotal: Number(coupon.minSubtotal || 0),
      usageLimit: Number(coupon.usageLimit || 0),
      allowedUserEmails: Array.isArray(coupon.allowedUserEmails) ? coupon.allowedUserEmails.join(', ') : ''
    }
  } else {
    editingCoupon.value = null
    couponForm.value = {
      code: '',
      discount: 0,
      type: 'Percentage',
      expiryDate: '',
      status: 'Aktiv',
      minSubtotal: 0,
      usageLimit: 0,
      allowedUserEmails: ''
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingCoupon.value = null
}

const saveCoupon = async () => {
  const payload = {
    ...couponForm.value,
    code: couponForm.value.code.trim().toUpperCase(),
    minSubtotal: Number(couponForm.value.minSubtotal || 0),
    usageLimit: Number(couponForm.value.usageLimit || 0),
    allowedUserEmails: String(couponForm.value.allowedUserEmails || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  }
  try {
    if (editingCoupon.value) {
      await couponStore.updateCoupon(editingCoupon.value.id, payload as any)
    } else {
      await couponStore.addCoupon(payload as any)
    }
    toastStore.success('Kupon yadda saxlanıldı')
    closeModal()
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Kupon yadda saxlanılmadı')
  }
}

const deleteCoupon = async (id: number) => {
  if (confirm('Bu kuponu silmək istədiyinizə əminsiniz?')) {
    try {
      await couponStore.deleteCoupon(id)
      toastStore.success('Kupon silindi')
    } catch (error: any) {
      toastStore.error(error?.data?.message || 'Kupon silinmədi')
    }
  }
}

onMounted(async () => {
  if (!couponStore.hydrated) {
    loading.value = true
    try {
      await couponStore.fetchCoupons()
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Kupon İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Endirim kuponlarını yaradın və idarə edin.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Kupon
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Kupon kodu..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">Kupon</th>
              <th class="px-8 py-4">Endirim</th>
              <th class="px-8 py-4">Qaydalar</th>
              <th class="px-8 py-4">Bitmə Tarixi</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="coupon in filteredCoupons" :key="coupon.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-3 text-blue-600">
                    <Ticket class="w-5 h-5" />
                  </div>
                  <span class="text-sm font-bold text-gray-800">{{ coupon.code }}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="text-sm font-bold text-blue-600">
                  {{ coupon.type === 'Percentage' ? coupon.discount + '%' : formatMoney(coupon.discount) }}
                </span>
              </td>
              <td class="px-8 py-6 text-xs font-bold text-gray-500">
                <div>Min səbət: {{ coupon.minSubtotal ? formatMoney(coupon.minSubtotal) : 'Yoxdur' }}</div>
                <div class="mt-1">Limit: {{ coupon.usageLimit ? `${coupon.usedCount || 0}/${coupon.usageLimit}` : 'Limitsiz' }}</div>
              </td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">
                <div class="flex items-center">
                  <Calendar class="w-3 h-3 mr-2 text-gray-400" />
                  {{ coupon.expiryDate }}
                </div>
              </td>
              <td class="px-8 py-6">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', coupon.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ coupon.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="openModal(coupon)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit class="w-4 h-4" /></button>
                  <button @click="deleteCoupon(coupon.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Coupon Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingCoupon ? 'Kuponu Redaktə Et' : 'Yeni Kupon' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveCoupon" class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kupon Kodu</label>
            <input v-model="couponForm.code" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məs: YENI20" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Endirim</label>
              <input v-model.number="couponForm.discount" required type="number" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Növü</label>
              <select v-model="couponForm.type" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option value="Percentage">Faiz (%)</option>
                <option value="Fixed">Sabit (AZN)</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bitmə Tarixi</label>
              <input v-model="couponForm.expiryDate" required type="date" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select v-model="couponForm.status" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Aktiv</option>
                <option>Deaktiv</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Min səbət</label>
              <input v-model.number="couponForm.minSubtotal" type="number" min="0" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">İstifadə limiti</label>
              <input v-model.number="couponForm.usageLimit" type="number" min="0" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">İcazəli istifadəçi emailləri</label>
            <input v-model="couponForm.allowedUserEmails" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="user1@mail.com, user2@mail.com" />
          </div>

          <div class="sticky bottom-0 flex items-center space-x-4 border-t border-gray-100 bg-white/95 pt-4 backdrop-blur">
            <button type="button" @click="closeModal" class="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">Ləğv Et</button>
            <button type="submit" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Yadda Saxla</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
