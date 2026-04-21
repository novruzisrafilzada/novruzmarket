<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessageSquare, Star, Trash2, CheckCircle, XCircle, Mail, Eye, X } from 'lucide-vue-next'
import { useFeedbackStore, type Feedback, type Message } from '~/stores/feedback'

definePageMeta({ layout: 'admin' })

const feedbackStore = useFeedbackStore()
const activeTab = ref('reviews') // reviews, messages
const isModalOpen = ref(false)
const selectedMessage = ref<Message | null>(null)

const openMessage = (msg: Message) => {
  selectedMessage.value = msg
  feedbackStore.markMessageAsRead(msg.id)
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedMessage.value = null
}

const updateReview = (id: number, status: Feedback['status']) => {
  feedbackStore.updateReviewStatus(id, status)
}

const deleteReview = (id: number) => {
  if (confirm('Bu rəyi silmək istədiyinizə əminsiniz?')) {
    feedbackStore.deleteReview(id)
  }
}

const deleteMessage = (id: number) => {
  if (confirm('Bu mesajı silmək istədiyinizə əminsiniz?')) {
    feedbackStore.deleteMessage(id)
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Mesajlar və Rəylər</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Müştəri rəylərini və gələn mesajları buradan idarə edin.</p>
      </div>
      <div class="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
        <button 
          @click="activeTab = 'reviews'"
          :class="['px-6 py-2.5 rounded-xl text-sm font-bold transition-all', activeTab === 'reviews' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600']"
        >
          Rəylər
        </button>
        <button 
          @click="activeTab = 'messages'"
          :class="['px-6 py-2.5 rounded-xl text-sm font-bold transition-all', activeTab === 'messages' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600']"
        >
          Mesajlar
        </button>
      </div>
    </div>

    <!-- Reviews Section -->
    <div v-if="activeTab === 'reviews'" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">İstifadəçi / Məhsul</th>
              <th class="px-8 py-4">Rəy</th>
              <th class="px-8 py-4">Reytinq</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="review in feedbackStore.reviews" :key="review.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ review.user }}</p>
                  <p class="text-[10px] text-blue-600 font-bold uppercase">{{ review.product }}</p>
                </div>
              </td>
              <td class="px-8 py-6">
                <p class="text-sm text-gray-500 font-medium line-clamp-2 max-w-xs">{{ review.comment }}</p>
              </td>
              <td class="px-8 py-6">
                <div class="flex text-yellow-400">
                  <Star v-for="i in 5" :key="i" :class="['w-3.5 h-3.5', i <= review.rating ? 'fill-current' : 'text-gray-200']" />
                </div>
              </td>
              <td class="px-8 py-6">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', 
                  review.status === 'Təsdiqləndi' ? 'bg-green-100 text-green-700' : 
                  review.status === 'Gözləyir' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">
                  {{ review.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button v-if="review.status === 'Gözləyir'" @click="updateReview(review.id, 'Təsdiqləndi')" class="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"><CheckCircle class="w-4 h-4" /></button>
                  <button v-if="review.status === 'Gözləyir'" @click="updateReview(review.id, 'Rədd edildi')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><XCircle class="w-4 h-4" /></button>
                  <button @click="deleteReview(review.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Messages Section -->
    <div v-if="activeTab === 'messages'" class="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div v-for="msg in feedbackStore.messages" :key="msg.id" 
        @click="openMessage(msg)"
        :class="['bg-white p-6 rounded-[2rem] border transition-all cursor-pointer group', msg.isRead ? 'border-gray-100' : 'border-blue-200 shadow-lg shadow-blue-50']"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center', msg.isRead ? 'bg-gray-50 text-gray-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-200']">
              <Mail class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center">
                <h3 class="font-bold text-gray-900 mr-3">{{ msg.name }}</h3>
                <span v-if="!msg.isRead" class="bg-blue-600 w-2 h-2 rounded-full"></span>
              </div>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">{{ msg.subject }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-xs text-gray-400 font-medium">{{ msg.date }}</span>
            <button @click.stop="deleteMessage(msg.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-500 line-clamp-1 ml-16">{{ msg.message }}</p>
      </div>
    </div>

    <!-- Message Detail Modal -->
    <div v-if="isModalOpen && selectedMessage" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900">Mesaj Detalları</h2>
            <p class="text-sm text-gray-500 font-medium">{{ selectedMessage.email }}</p>
          </div>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mövzu</label>
            <p class="text-lg font-bold text-gray-900">{{ selectedMessage.subject }}</p>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mesaj</label>
            <div class="bg-gray-50 p-6 rounded-2xl text-gray-700 text-sm leading-relaxed border border-gray-100">
              {{ selectedMessage.message }}
            </div>
          </div>
          <div class="flex justify-end text-xs text-gray-400 font-bold">
            {{ selectedMessage.date }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
