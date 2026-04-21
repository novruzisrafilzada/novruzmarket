<script setup lang="ts">
import { computed, ref } from 'vue'
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'
import { useAdminPortal } from '~/composables/useAdminPortal'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const { t } = useT()
const { adminPath, adminBasePath } = useAdminPortal()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isAdminLoginIntent = computed(() => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  return redirect === '/admin' || redirect.startsWith('/admin/') || redirect === adminBasePath.value || redirect.startsWith(`${adminBasePath.value}/`)
})

const handleLogin = async () => {
  if (email.value && password.value) {
    try {
      await authStore.login({ email: email.value, password: password.value, adminOnly: isAdminLoginIntent.value })
      toastStore.success(t('login_success'))
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
      const fallback = authStore.user?.role === 'Admin' ? adminPath() : authStore.user?.role === 'Satıcı' ? '/seller' : '/profile'
      router.push(redirect || fallback)
    } catch (error: any) {
      toastStore.error(error?.data?.message || (isAdminLoginIntent.value ? 'Admin giriş məlumatları yanlışdır' : 'Email və ya şifrə yanlışdır'))
    }
  } else {
    toastStore.error(t('required_fields'))
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-24 bg-gray-50/50">
    <div class="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl w-full max-w-lg">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">{{ t('welcome_title') }}</h1>
        <p class="text-gray-500 font-medium">{{ t('login_subtitle') }}</p>
        <div v-if="isAdminLoginIntent" class="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-left">
          <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Admin giriş</div>
          <div class="mt-2 text-sm font-medium text-gray-700">Admin panel üçün admin username və ya admin email daxil edin. Hazırkı standart giriş adı <span class="font-extrabold text-gray-900">admin</span>-dir.</div>
        </div>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-4">
          <div class="relative group">
            <Mail class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              v-model="email"
              type="text" 
              :placeholder="isAdminLoginIntent ? 'Admin username və ya admin email' : 'Email, telefon və ya admin giriş adı'"
              required
              class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
            />
          </div>
          <div class="relative group">
            <Lock class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              v-model="password"
              type="password" 
              :placeholder="t('password_placeholder')"
              required
              class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center cursor-pointer group">
            <input v-model="rememberMe" type="checkbox" class="hidden" />
            <div :class="['w-5 h-5 border-2 rounded-lg transition-all mr-3 flex items-center justify-center', rememberMe ? 'border-blue-600 bg-blue-600' : 'border-gray-200 group-hover:border-blue-600']">
              <div v-if="rememberMe" class="w-2.5 h-2.5 bg-white rounded-sm"></div>
            </div>
            <span class="text-gray-500 font-bold tracking-tight">{{ t('remember_me') }}</span>
          </label>
          <NuxtLink to="/forgot-password" class="text-blue-600 font-bold hover:underline">{{ t('forgot_password') }}</NuxtLink>
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 hover:shadow-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center group">
          {{ t('sign_in') }}
          <ArrowRight class="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div class="mt-12 pt-8 border-t border-gray-50 text-center">
        <p class="text-gray-500 font-medium">
          {{ t('no_account') }}
          <NuxtLink to="/signup" class="text-blue-600 font-extrabold hover:underline ml-2">{{ t('signup_now') }}</NuxtLink>
        </p>
        <p class="text-gray-500 font-medium mt-3">
          Satıcı kimi qoşulmaq istəyirsiniz?
          <NuxtLink to="/seller/register" class="text-emerald-600 font-extrabold hover:underline ml-2">Satıcı qeydiyyatı</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
