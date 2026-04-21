<script setup lang="ts">
import { ref } from 'vue'
import { Mail, RotateCcw } from 'lucide-vue-next'

const toastStore = useToastStore()
const email = ref('')
const submitting = ref(false)

const submit = async () => {
  if (!email.value) {
    toastStore.error('Email daxil edin')
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    toastStore.success('Əgər hesab mövcuddursa, sıfırlama linki göndərildi')
  } catch {
    toastStore.error('Sorğu göndərilmədi')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-24 bg-gray-50/50">
    <div class="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl w-full max-w-lg">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900">Şifrəni unutmusunuz?</h1>
        <p class="mt-3 text-gray-500 font-medium">Hesabınızın email ünvanını daxil edin, sizə yeniləmə linki göndərək.</p>
      </div>

      <form @submit.prevent="submit" class="space-y-6">
        <div class="relative group">
          <Mail class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input v-model="email" type="email" placeholder="Email ünvanınız" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 inline-flex items-center justify-center gap-3 disabled:opacity-60" :disabled="submitting">
          <RotateCcw class="w-5 h-5" />
          {{ submitting ? 'Göndərilir...' : 'Sıfırlama linki göndər' }}
        </button>
      </form>
    </div>
  </div>
</template>
