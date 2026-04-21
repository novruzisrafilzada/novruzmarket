<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus, Edit, Trash2, X } from 'lucide-vue-next'
import { useFaqStore, type FaqItem } from '~/stores/faq'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const faqStore = useFaqStore()
const toastStore = useToastStore()

const isModalOpen = ref(false)
const editing = ref<FaqItem | null>(null)

const form = ref({
  question: '',
  answer: '',
  status: 'Aktiv' as FaqItem['status']
})

const items = computed(() => faqStore.items)

const openModal = (item?: FaqItem) => {
  if (item) {
    editing.value = item
    form.value = { question: item.question, answer: item.answer, status: item.status }
  } else {
    editing.value = null
    form.value = { question: '', answer: '', status: 'Aktiv' }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const save = async () => {
  if (!form.value.question.trim() || !form.value.answer.trim()) return
  if (editing.value) {
    await faqStore.updateItem(editing.value.id, form.value)
    toastStore.success('Yadda saxlanıldı')
  } else {
    await faqStore.addItem(form.value)
    toastStore.success('Əlavə olundu')
  }
  closeModal()
}

const remove = async (id: number) => {
  if (!confirm('Bu sualı silmək istədiyinizə əminsiniz?')) return
  await faqStore.deleteItem(id)
  toastStore.success('Silindi')
}

onMounted(async () => {
  if (!faqStore.hydrated) await faqStore.fetchItems()
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">FAQ</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Sual və cavabları buradan idarə edin.</p>
      </div>
      <button type="button" class="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center" @click="openModal()">
        <Plus class="w-5 h-5 mr-2" /> Yeni sual
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sual</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Əməliyyat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in items" :key="it.id" class="border-b border-gray-50 hover:bg-gray-50/50">
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900">{{ it.question }}</div>
                <div class="text-sm text-gray-500 mt-1 line-clamp-2">{{ it.answer }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="['px-3 py-1 rounded-full text-xs font-bold', it.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
                  {{ it.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button type="button" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all mr-2" @click="openModal(it)">
                  <Edit class="w-4 h-4" />
                </button>
                <button type="button" class="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all" @click="remove(it.id)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="3" class="px-6 py-10 text-center text-gray-500 font-medium">Heç bir sual yoxdur.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div class="shrink-0 p-6 border-b border-gray-100 flex items-center justify-between bg-white/95 backdrop-blur">
          <h2 class="text-xl font-extrabold text-gray-900">{{ editing ? 'Sualı redaktə et' : 'Yeni sual' }}</h2>
          <button type="button" class="p-2 rounded-xl hover:bg-gray-100 transition-all" @click="closeModal">
            <X class="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 pr-4 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sual</label>
            <input v-model="form.question" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cavab</label>
            <textarea v-model="form.answer" rows="5" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
            <select v-model="form.status" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option>Aktiv</option>
              <option>Deaktiv</option>
            </select>
          </div>
        </div>
        <div class="sticky bottom-0 p-6 border-t border-gray-100 flex justify-end gap-3 bg-white/95 backdrop-blur">
          <button type="button" class="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all" @click="closeModal">Ləğv et</button>
          <button type="button" class="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200" @click="save">Yadda saxla</button>
        </div>
      </div>
    </div>
  </div>
</template>
