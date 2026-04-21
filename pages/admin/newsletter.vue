<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Mail, Send, Users } from 'lucide-vue-next'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

type Subscriber = {
  id: number
  email: string
  status: 'Aktiv' | 'Deaktiv'
  createdAt: string
}

const toastStore = useToastStore()
const subscribers = ref<Subscriber[]>([])
const loading = ref(false)

const form = ref({
  testTo: '',
  subject: '',
  html: ''
})

const activeCount = computed(() => subscribers.value.filter(s => s.status === 'Aktiv').length)

const fetchSubscribers = async () => {
  loading.value = true
  try {
    subscribers.value = await $fetch<Subscriber[]>('/api/admin/newsletter-subscribers')
  } catch {
    toastStore.error('Abunələr yüklənmədi')
  } finally {
    loading.value = false
  }
}

const send = async () => {
  if (!form.value.subject.trim() || !form.value.html.trim()) return
  loading.value = true
  try {
    const res = await $fetch<{ sent: number; failed: number; errors?: string[] }>('/api/admin/newsletter-send', {
      method: 'POST',
      body: {
        subject: form.value.subject,
        html: form.value.html,
        testTo: form.value.testTo.trim() || undefined
      }
    })
    toastStore.success(`Göndərildi: ${res.sent}, Xəta: ${res.failed}`)
  } catch {
    toastStore.error('Email göndərilmədi')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchSubscribers()
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Newsletter</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Abunələri izləyin və email göndərin.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="px-5 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-3">
          <Users class="w-5 h-5 text-blue-600" />
          <div class="text-sm font-extrabold text-gray-900">{{ activeCount }}</div>
          <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Aktiv</div>
        </div>
        <button type="button" class="px-6 py-3 rounded-2xl bg-gray-900 text-white font-extrabold hover:bg-black transition-all" @click="fetchSubscribers" :disabled="loading" :class="loading ? 'opacity-60 cursor-not-allowed' : ''">
          Yenilə
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-gray-900 flex items-center">
            <Mail class="w-6 h-6 mr-3 text-blue-600" />
            Email göndər
          </h2>
        </div>
        <div class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Test email (istəyə görə)</label>
            <input v-model="form.testTo" type="email" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="test@mail.com" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mövzu</label>
            <input v-model="form.subject" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">HTML məzmun</label>
            <textarea v-model="form.html" rows="10" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none" placeholder="<h1>Salam</h1>"></textarea>
          </div>
          <button type="button" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-extrabold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center" @click="send" :disabled="loading" :class="loading ? 'opacity-60 cursor-not-allowed' : ''">
            <Send class="w-5 h-5 mr-2" /> Göndər
          </button>
          <div class="text-xs text-gray-500 font-medium">
            Email göndərilməsi üçün server environment dəyişənləri lazımdır: RESEND_API_KEY və RESEND_FROM.
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50">
          <h2 class="text-xl font-extrabold text-gray-900">Abunələr</h2>
          <p class="text-gray-500 mt-1 font-medium text-sm">Son əlavə olunanlar yuxarıda.</p>
        </div>
        <div class="p-6">
          <div v-if="subscribers.length === 0" class="text-center text-gray-500 font-medium py-10">Heç bir abunə yoxdur.</div>
          <div v-else class="space-y-3 max-h-[520px] overflow-auto pr-2">
            <div v-for="s in subscribers" :key="s.id" class="border border-gray-100 rounded-2xl px-4 py-3">
              <div class="text-sm font-extrabold text-gray-900 truncate">{{ s.email }}</div>
              <div class="mt-1 flex items-center justify-between">
                <div class="text-xs font-bold text-gray-400">{{ String(s.createdAt || '').split('T')[0] }}</div>
                <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold', s.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
                  {{ s.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

