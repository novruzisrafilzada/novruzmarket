<script setup lang="ts">
import { ref } from 'vue'
import { Lock, ShieldCheck } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const password = ref('')
const passwordRepeat = ref('')
const saving = ref(false)

const submit = async () => {
  if (!password.value || password.value.length < 6) {
    toastStore.error('Şifrə ən azı 6 simvol olmalıdır')
    return
  }
  if (password.value !== passwordRepeat.value) {
    toastStore.error('Şifrələr eyni deyil')
    return
  }

  saving.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: route.params.token,
        password: password.value
      }
    })
    toastStore.success('Şifrəniz yeniləndi')
    await router.push('/login')
  } catch {
    toastStore.error('Link etibarsızdır və ya vaxtı bitib')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-24 bg-gray-50/50">
    <div class="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl w-full max-w-lg">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900">Yeni şifrə qurun</h1>
        <p class="mt-3 text-gray-500 font-medium">Yeni şifrənizi daxil edin və hesabınıza yenidən daxil olun.</p>
      </div>

      <form @submit.prevent="submit" class="space-y-5">
        <div class="relative group">
          <Lock class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input v-model="password" type="password" placeholder="Yeni şifrə" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
        </div>
        <div class="relative group">
          <ShieldCheck class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input v-model="passwordRepeat" type="password" placeholder="Şifrəni təkrar edin" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 inline-flex items-center justify-center gap-3 disabled:opacity-60" :disabled="saving">
          <ShieldCheck class="w-5 h-5" />
          {{ saving ? 'Yenilənir...' : 'Şifrəni yenilə' }}
        </button>
      </form>
    </div>
  </div>
</template>
