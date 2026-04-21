<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Edit, Trash2, X, Search, Globe, Image as ImageIcon } from 'lucide-vue-next'
import { useBrandStore, type Brand } from '~/stores/brands'

definePageMeta({ layout: 'admin' })

const brandStore = useBrandStore()
const productStore = useProductStore()
const searchQuery = ref('')
const isModalOpen = ref(false)
const editingBrand = ref<Brand | null>(null)

const brandForm = ref({
  name: '',
  logo: '',
  status: 'Aktiv' as Brand['status']
})

const filteredBrands = computed(() => {
  return brandStore.brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const usageCountFor = (name: string) => productStore.products.filter((product) => String(product.brand || '').trim().toLowerCase() === String(name || '').trim().toLowerCase()).length

if (!productStore.hydrated) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const products = await fetcher('/api/products')
    productStore.setProducts(products as any)
  } else {
    await productStore.fetchProducts()
  }
}

const openModal = (brand?: Brand) => {
  if (brand) {
    editingBrand.value = brand
    brandForm.value = {
      name: brand.name,
      logo: brand.logo,
      status: brand.status
    }
  } else {
    editingBrand.value = null
    brandForm.value = {
      name: '',
      logo: '',
      status: 'Aktiv'
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingBrand.value = null
}

const saveBrand = () => {
  if (editingBrand.value) {
    brandStore.updateBrand(editingBrand.value.id, brandForm.value)
  } else {
    brandStore.addBrand(brandForm.value)
  }
  closeModal()
}

const deleteBrand = (id: number) => {
  if (confirm('Bu brendi silmək istədiyinizə əminsiniz?')) {
    brandStore.deleteBrand(id)
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Brendlərin İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Mağazada təmsil olunan brendləri buradan idarə edin.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Brend
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Brend adı axtar..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">Brend</th>
              <th class="px-8 py-4">Loqo URL</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="brand in filteredBrands" :key="brand.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-2 mr-4 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img v-if="brand.logo" :src="brand.logo" :alt="brand.name" class="max-w-full max-h-full object-contain" />
                    <span v-else class="text-sm font-extrabold text-gray-500">{{ brand.name.slice(0, 1).toUpperCase() }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-bold text-gray-800">{{ brand.name }}</span>
                    <div class="mt-1 text-[11px] font-bold text-gray-400">{{ usageCountFor(brand.name) }} məhsulda istifadə olunur</div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-sm text-gray-400 font-medium truncate max-w-xs">{{ brand.logo }}</td>
              <td class="px-8 py-6">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', brand.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ brand.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="openModal(brand)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit class="w-4 h-4" /></button>
                  <button @click="deleteBrand(brand.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredBrands.length === 0" class="p-16 text-center">
        <ImageIcon class="mx-auto h-12 w-12 text-gray-200" />
        <div class="mt-4 text-sm font-extrabold text-gray-900">Brend tapılmadı</div>
        <div class="mt-2 text-sm font-medium text-gray-500">Axtarışı dəyişin və ya yeni brend əlavə edin.</div>
      </div>
    </div>

    <!-- Brand Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingBrand ? 'Brend Redaktə Et' : 'Yeni Brend' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveBrand" class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Brend Adı</label>
            <input v-model="brandForm.name" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məs: Apple" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Loqo URL</label>
            <input v-model="brandForm.logo" required type="url" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="https://..." />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
            <select v-model="brandForm.status" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option>Aktiv</option>
              <option>Deaktiv</option>
            </select>
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
