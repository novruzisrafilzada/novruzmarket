<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, Truck, DollarSign, Clock } from 'lucide-vue-next'
import { useShippingStore, type ShippingMethod } from '~/stores/shipping'
import { AZERBAIJAN_LOCATIONS } from '~/utils/azerbaijan-locations'

definePageMeta({ layout: 'admin' })

const shippingStore = useShippingStore()
const toastStore = useToastStore()
const isModalOpen = ref(false)
const editingMethod = ref<ShippingMethod | null>(null)
const saving = ref(false)
const { formatMoney } = useMoney()

const methodForm = ref({
  name: '',
  price: 0,
  duration: '',
  status: 'Aktiv' as ShippingMethod['status'],
  regions: '',
  freeOver: 0,
  etaDaysMin: 1,
  etaDaysMax: 3
})
const allLocationOptions = Array.from(new Set(AZERBAIJAN_LOCATIONS)).sort((left, right) => left.localeCompare(right, 'az'))

const openModal = (method?: ShippingMethod) => {
  if (method) {
    editingMethod.value = method
    methodForm.value = {
      name: method.name,
      price: method.price,
      duration: method.duration,
      status: method.status,
      regions: Array.isArray(method.regions) ? method.regions.join(', ') : '',
      freeOver: Number(method.freeOver || 0),
      etaDaysMin: Number(method.etaDaysMin || 0),
      etaDaysMax: Number(method.etaDaysMax || 0)
    }
  } else {
    editingMethod.value = null
    methodForm.value = {
      name: '',
      price: 0,
      duration: '',
      status: 'Aktiv',
      regions: '',
      freeOver: 0,
      etaDaysMin: 1,
      etaDaysMax: 3
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingMethod.value = null
}

const fillAllRegions = () => {
  methodForm.value.regions = allLocationOptions.join(', ')
}

const saveMethod = async () => {
  const payload = {
    ...methodForm.value,
    regions: String(methodForm.value.regions || '').split(',').map((item) => item.trim()).filter(Boolean),
    freeOver: Number(methodForm.value.freeOver || 0),
    etaDaysMin: Number(methodForm.value.etaDaysMin || 0),
    etaDaysMax: Number(methodForm.value.etaDaysMax || 0)
  }
  if (editingMethod.value) {
    shippingStore.updateMethod(editingMethod.value.id, payload)
  } else {
    shippingStore.addMethod(payload)
  }
  await shippingStore.saveMethods()
  toastStore.success('Çatdırılma üsulu yadda saxlanıldı')
  closeModal()
}

const deleteMethod = async (id: number) => {
  if (confirm('Bu çatdırılma üsulunu silmək istədiyinizə əminsiniz?')) {
    shippingStore.deleteMethod(id)
    await shippingStore.saveMethods()
    toastStore.success('Çatdırılma üsulu silindi')
  }
}

onMounted(async () => {
  if (!shippingStore.hydrated) {
    saving.value = true
    try {
      await shippingStore.fetchMethods()
    } finally {
      saving.value = false
    }
  }
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Çatdırılma Ayarları</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Mağaza üçün müxtəlif çatdırılma üsullarını və qiymətlərini təyin edin.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Üsul
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="method in shippingStore.methods" :key="method.id" class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative group">
        <div class="flex items-center justify-between mb-6">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Truck class="w-7 h-7" />
          </div>
          <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', method.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ method.status.toUpperCase() }}
          </span>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ method.name }}</h3>
        <div class="space-y-3 mb-8">
          <div class="flex items-center text-sm font-medium text-gray-500">
            <DollarSign class="w-4 h-4 mr-2 text-gray-400" />
            Qiymət: <span class="text-blue-600 font-bold ml-1">{{ formatMoney(method.price) }}</span>
          </div>
          <div class="flex items-center text-sm font-medium text-gray-500">
            <Clock class="w-4 h-4 mr-2 text-gray-400" />
            Müddət: <span class="text-gray-800 ml-1">{{ method.duration }}</span>
          </div>
          <div class="text-xs font-bold uppercase tracking-widest text-gray-400">
            Bölgələr: {{ Array.isArray(method.regions) && method.regions.length ? method.regions.join(', ') : 'Bütün bölgələr' }}
          </div>
          <div class="text-xs font-bold uppercase tracking-widest text-gray-400">
            Pulsuz hədd: {{ Number(method.freeOver || 0) > 0 ? formatMoney(Number(method.freeOver || 0)) : 'Yoxdur' }}
          </div>
        </div>
        <div class="flex items-center space-x-2 pt-6 border-t border-gray-50">
          <button @click="openModal(method)" class="flex-1 bg-gray-50 text-gray-600 py-3 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-all">Redaktə Et</button>
          <button @click="deleteMethod(method.id)" class="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 class="w-4 h-4" /></button>
        </div>
      </div>
    </div>

    <!-- Shipping Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingMethod ? 'Üsulu Redaktə Et' : 'Yeni Çatdırılma Üsulu' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveMethod" class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Üsulun Adı</label>
            <input v-model="methodForm.name" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məs: Kuryerlə çatdırılma" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Qiymət (AZN)</label>
              <input v-model.number="methodForm.price" required type="number" step="0.01" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Müddət</label>
              <input v-model="methodForm.duration" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məs: 2-3 gün" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
            <select v-model="methodForm.status" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option>Aktiv</option>
              <option>Deaktiv</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bölgələr</label>
            <input v-model="methodForm.regions" list="shipping-azerbaijan-locations" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Bakı, Sumqayıt" />
            <datalist id="shipping-azerbaijan-locations">
              <option v-for="city in allLocationOptions" :key="city" :value="city" />
            </datalist>
            <div class="flex items-center justify-between gap-3">
              <div class="text-[11px] font-medium text-gray-500">Bölgələri vergüllə ayırın. Azərbaycan şəhər və rayon siyahısı dropdown-da görünür.</div>
              <button type="button" class="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-extrabold text-blue-700" @click="fillAllRegions">
                Hamısını doldur
              </button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pulsuz hədd</label>
              <input v-model.number="methodForm.freeOver" type="number" min="0" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">ETA min</label>
              <input v-model.number="methodForm.etaDaysMin" type="number" min="0" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">ETA max</label>
              <input v-model.number="methodForm.etaDaysMax" type="number" min="0" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
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
