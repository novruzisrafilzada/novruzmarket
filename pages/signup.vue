<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Phone, MessageSquareMore } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const { t } = useT()

const mode = ref<'email' | 'phone'>('email')
const fullName = ref('')
const email = ref('')
const password = ref('')
const phone = ref('')
const phoneEmail = ref('')
const emailCode = ref('')
const phonePassword = ref('')
const phoneCode = ref('')
const acceptTerms = ref(false)
const sendingCode = ref(false)
const signingUp = ref(false)
const emailCodeSent = ref(false)
const phoneCodeSent = ref(false)

const submitLabel = computed(() => mode.value === 'phone' ? 'Telefonla hesab yarat' : 'Hesab yarat')
const emailVerificationEnabled = computed(() => Boolean(settingsStore.settings.integrations.emailVerificationEnabled))
const phoneVerificationEnabled = computed(() => Boolean(settingsStore.settings.integrations.phoneVerificationEnabled))

onMounted(async () => {
  if (!settingsStore.hydrated || !settingsStore.settings.siteName) {
    await settingsStore.fetchSettings()
  }
})

const requestEmailCode = async () => {
  if (!fullName.value || !email.value || !password.value || !acceptTerms.value) {
    toastStore.error('Ad, email, şifrə və şərt qəbulu vacibdir')
    return
  }
  if (!emailVerificationEnabled.value) {
    toastStore.error('Email kod doğrulaması deaktivdir')
    return
  }

  sendingCode.value = true
  try {
    await $fetch('/api/auth/email/request-code', {
      method: 'POST',
      body: { email: email.value }
    })
    emailCodeSent.value = true
    toastStore.success('Təsdiq kodu email ünvanına göndərildi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Kod göndərilmədi')
  } finally {
    sendingCode.value = false
  }
}

const requestPhoneCode = async () => {
  if (!fullName.value || !phone.value || !phonePassword.value || !acceptTerms.value) {
    toastStore.error('Ad, telefon, şifrə və şərt qəbulu vacibdir')
    return
  }
  if (!phoneVerificationEnabled.value) {
    toastStore.error('Telefon kod doğrulaması deaktivdir')
    return
  }

  sendingCode.value = true
  try {
    await $fetch('/api/auth/phone/request-code', {
      method: 'POST',
      body: { phone: phone.value }
    })
    phoneCodeSent.value = true
    toastStore.success('Təsdiq kodu göndərildi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Kod göndərilmədi')
  } finally {
    sendingCode.value = false
  }
}

const handleSignup = async () => {
  if (!acceptTerms.value) {
    toastStore.error(t('accept_terms'))
    return
  }

  signingUp.value = true
  try {
    if (mode.value === 'phone') {
      if (!fullName.value || !phone.value || !phonePassword.value || (phoneVerificationEnabled.value && !phoneCode.value)) {
        toastStore.error('Telefonla qeydiyyat üçün bütün sahələri doldurun')
        return
      }
      await authStore.signupWithPhone({
        name: fullName.value,
        phone: phone.value,
        code: phoneVerificationEnabled.value ? phoneCode.value : '',
        password: phonePassword.value,
        email: phoneEmail.value || undefined
      })
    } else if (fullName.value && email.value && password.value && (!emailVerificationEnabled.value || emailCode.value)) {
      await authStore.signupWithEmailCode({
        name: fullName.value,
        email: email.value,
        code: emailVerificationEnabled.value ? emailCode.value : undefined,
        password: password.value,
        phone: phone.value || undefined
      })
    } else {
      toastStore.error(t('required_fields'))
      return
    }

    toastStore.success(t('signup_success'))
    router.push('/profile')
  } catch (error: any) {
    toastStore.error(error?.data?.message || (mode.value === 'phone' ? 'Kod, telefon və ya şifrə məlumatı yanlışdır' : 'Email kodu və ya qeydiyyat məlumatı yanlışdır'))
  } finally {
    signingUp.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-24 bg-gray-50/50">
    <div class="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl w-full max-w-2xl">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Qeydiyyat</h1>
        <p class="text-gray-500 font-medium">Email və ya telefon nömrəsi ilə hesab yaradın.</p>
      </div>

      <div class="grid grid-cols-2 gap-3 p-2 rounded-3xl bg-gray-100 mb-8">
        <button type="button" class="px-5 py-3 rounded-[1.25rem] font-bold transition-all" :class="mode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'" @click="mode = 'email'">
          Email ilə
        </button>
        <button type="button" class="px-5 py-3 rounded-[1.25rem] font-bold transition-all" :class="mode === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'" @click="mode = 'phone'">
          Telefon ilə
        </button>
      </div>

      <form @submit.prevent="handleSignup" class="space-y-6">
        <div class="space-y-4">
          <div class="relative group">
            <UserIcon class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              v-model="fullName"
              type="text"
              placeholder="Adınız və Soyadınız"
              required
              class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
            />
          </div>

          <template v-if="mode === 'email'">
            <div class="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
              <div class="relative group">
                <Mail class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="E-poçt ünvanınız"
                  required
                  class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
                />
              </div>
              <button v-if="emailVerificationEnabled" type="button" class="px-6 py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all disabled:opacity-60" :disabled="sendingCode" @click="requestEmailCode">
                {{ sendingCode ? 'Göndərilir...' : (emailCodeSent ? 'Yenidən göndər' : 'Kod göndər') }}
              </button>
            </div>
            <div v-if="emailVerificationEnabled" class="relative group">
              <MessageSquareMore class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                v-model="emailCode"
                type="text"
                placeholder="Email ünvanınıza gələn 6 rəqəmli kod"
                required
                class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
              />
            </div>
            <div v-else class="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
              Email kod doğrulaması hazırda deaktivdir. API əlavə olunana qədər qeydiyyat birbaşa davam edir.
            </div>
            <div class="relative group">
              <Phone class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                v-model="phone"
                type="tel"
                placeholder="Telefon nömrəsi (istəyə bağlı)"
                class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
              />
            </div>
            <div class="relative group">
              <Lock class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                v-model="password"
                type="password"
                placeholder="Şifrəniz"
                required
                class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
              />
            </div>
          </template>

          <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
              <div class="relative group">
                <Phone class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  v-model="phone"
                  type="tel"
                  placeholder="Telefon nömrəsi"
                  required
                  class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
                />
              </div>
              <button type="button" class="px-6 py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all disabled:opacity-60" :disabled="sendingCode" @click="requestPhoneCode">
                {{ sendingCode ? 'Göndərilir...' : (phoneCodeSent ? 'Yenidən göndər' : 'Kod göndər') }}
              </button>
            </div>
            <div v-if="phoneVerificationEnabled" class="relative group">
              <MessageSquareMore class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                v-model="phoneCode"
                type="text"
                placeholder="Telefonunuza gələn 6 rəqəmli kod"
                required
                class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
              />
            </div>
            <div v-else class="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
              Telefon kod doğrulaması hazırda deaktivdir. SMS provider qoşulana qədər telefonla qeydiyyat kodsuz davam edir.
            </div>
            <div class="relative group">
              <Mail class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                v-model="phoneEmail"
                type="email"
                placeholder="E-poçt ünvanı (istəyə bağlı)"
                class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
              />
            </div>
            <div class="relative group">
              <Lock class="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                v-model="phonePassword"
                type="password"
                placeholder="Şifrəniz"
                required
                class="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm"
              />
            </div>
          </template>
        </div>

        <div class="flex items-start space-x-3 text-sm">
          <label class="flex items-center cursor-pointer group pt-1">
            <input v-model="acceptTerms" type="checkbox" class="hidden" />
            <div :class="['w-5 h-5 border-2 rounded-lg transition-all mr-3 flex items-center justify-center', acceptTerms ? 'border-blue-600 bg-blue-600' : 'border-gray-200 group-hover:border-blue-600']">
              <div v-if="acceptTerms" class="w-2.5 h-2.5 bg-white rounded-sm"></div>
            </div>
          </label>
          <span class="text-gray-500 font-medium leading-relaxed">
            Mən <NuxtLink to="/terms" class="text-blue-600 font-bold hover:underline">Qaydalar və Şərtləri</NuxtLink> qəbul edirəm.
          </span>
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 hover:shadow-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center group disabled:opacity-60" :disabled="signingUp">
          {{ signingUp ? 'Yaradılır...' : submitLabel }}
          <ShieldCheck class="w-5 h-5 ml-3 group-hover:scale-110 transition-transform" />
        </button>
      </form>

      <div class="mt-12 pt-8 border-t border-gray-50 text-center">
        <p class="text-gray-500 font-medium">
          Artıq hesabınız var?
          <NuxtLink to="/login" class="text-blue-600 font-extrabold hover:underline ml-2">Daxil olun</NuxtLink>
        </p>
        <p class="text-gray-500 font-medium mt-3">
          Satıcı kimi qeydiyyatdan keçmək istəyirsiniz?
          <NuxtLink to="/seller/register" class="text-emerald-600 font-extrabold hover:underline ml-2">Satıcı ol</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
