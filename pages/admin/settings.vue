<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Save, Globe, Mail, Phone, MapPin, Bell, Shield, CreditCard, Search, Lock, Clock3, HelpCircle, MessageCircle, Plus, Trash2, ShoppingCart, CheckCircle2 } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'
import { useAdminPortal } from '~/composables/useAdminPortal'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const toastStore = useToastStore()
const { adminPath, setAdminPathSegment } = useAdminPortal()

const contentLang = ref<'az' | 'ru' | 'en'>('az')
const footerLang = ref<'az' | 'ru' | 'en'>('az')
const featureIcons = ['Truck', 'ShieldCheck', 'Headphones', 'RotateCcw'] as const
const fetcher = process.server ? useRequestFetch() : $fetch
const securityForm = ref({
  currentPassword: '',
  nextPassword: '',
  confirmPassword: ''
})
const securitySaving = ref(false)
const adminPortalSaving = ref(false)
const adminProfileSaving = ref(false)
const adminPortalForm = ref({
  pathSegment: 'admin'
})
const adminProfileForm = ref({
  name: 'Admin',
  username: 'admin',
  email: 'admin'
})
const emailTestForm = ref({
  to: '',
  subject: 'OTP test email',
  html: '<h2>OTP test</h2><p>Sınaq kodu: <strong>123456</strong></p>'
})
const smsTestForm = ref({
  to: '',
  message: 'NovruzMarket sınaq kodu: 123456'
})
const emailTesting = ref(false)
const smsTesting = ref(false)
const integrationReadiness = computed(() => ({
  email: Boolean(settings.value.integrations.emailApiKey.trim() && settings.value.integrations.emailFrom.trim()),
  sms: Boolean(
    settings.value.integrations.smsProvider.trim()
    && (
      (settings.value.integrations.smsProvider === 'twilio' && settings.value.integrations.smsApiKey.trim() && settings.value.integrations.smsApiSecret.trim() && settings.value.integrations.smsFrom.trim())
      || (settings.value.integrations.smsProvider === 'custom' && settings.value.integrations.smsWebhookUrl.trim())
    )
  ),
  payment: Boolean(
    settings.value.integrations.paymentProvider.trim()
    && settings.value.paymentMethods?.some((method) => method.key === 'card' && method.enabled)
    && settings.value.integrations.paymentApiKey.trim()
    && settings.value.integrations.paymentSecret.trim()
    && settings.value.integrations.paymentCallbackUrl.trim()
  ),
  analytics: Boolean(settings.value.integrations.analyticsApiKey.trim()),
  deploy: Boolean(settings.value.integrations.hostingWebhook.trim() && settings.value.integrations.domainName.trim())
}))

const uploadLogo = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const body = new FormData()
  body.append('file', file)
  try {
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
    settings.value.siteLogo = `${res.url}?v=${Date.now()}`
    await settingsStore.saveSettings()
  } catch {
    toastStore.error('Logo yüklənmədi')
  } finally {
    input.value = ''
  }
}

const uploadAppPromoImage = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const body = new FormData()
  body.append('file', file)
  try {
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
    settings.value.appPromo.image = `${res.url}?v=${Date.now()}`
    await settingsStore.saveSettings()
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  } finally {
    input.value = ''
  }
}

const saveSettings = async () => {
  try {
    await settingsStore.saveSettings()
    toastStore.success('Ayarlar yadda saxlanıldı')
  } catch {
    toastStore.error('Ayarlar yadda saxlanılmadı')
  }
}

try {
  const [portal, profile] = await Promise.all([
    fetcher('/api/admin/portal'),
    fetcher('/api/admin/security/profile')
  ])
  adminPortalForm.value.pathSegment = String((portal as any)?.pathSegment || 'admin')
  adminProfileForm.value = {
    name: String((profile as any)?.name || 'Admin'),
    username: String((profile as any)?.username || 'admin'),
    email: String((profile as any)?.email || 'admin')
  }
  setAdminPathSegment(adminPortalForm.value.pathSegment)
} catch {}

const changeAdminPassword = async () => {
  if (!securityForm.value.currentPassword || !securityForm.value.nextPassword || !securityForm.value.confirmPassword) {
    toastStore.error('Bütün şifrə sahələrini doldurun')
    return
  }
  if (securityForm.value.nextPassword.length < 6) {
    toastStore.error('Yeni şifrə ən azı 6 simvol olmalıdır')
    return
  }
  if (securityForm.value.nextPassword !== securityForm.value.confirmPassword) {
    toastStore.error('Yeni şifrələr eyni deyil')
    return
  }
  securitySaving.value = true
  try {
    await $fetch('/api/admin/security/password', {
      method: 'PUT',
      body: {
        currentPassword: securityForm.value.currentPassword,
        nextPassword: securityForm.value.nextPassword
      }
    })
    securityForm.value = {
      currentPassword: '',
      nextPassword: '',
      confirmPassword: ''
    }
    toastStore.success('Admin giriş şifrəsi yeniləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || 'Şifrə yenilənmədi')
  } finally {
    securitySaving.value = false
  }
}

const saveAdminPortal = async () => {
  adminPortalSaving.value = true
  try {
    const next = await $fetch<{ pathSegment: string }>('/api/admin/portal', {
      method: 'PUT',
      body: { pathSegment: adminPortalForm.value.pathSegment }
    })
    adminPortalForm.value.pathSegment = String(next.pathSegment || 'admin')
    setAdminPathSegment(adminPortalForm.value.pathSegment)
    toastStore.success('Admin giriş yolu yeniləndi')
    if (process.client) {
      window.location.href = adminPath('settings')
      return
    }
    await navigateTo(adminPath('settings'))
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || 'Admin giriş yolu yenilənmədi')
  } finally {
    adminPortalSaving.value = false
  }
}

const saveAdminProfile = async () => {
  adminProfileSaving.value = true
  try {
    const res = await $fetch<any>('/api/admin/security/profile', {
      method: 'PUT',
      body: adminProfileForm.value
    })
    adminProfileForm.value = {
      name: String(res?.profile?.name || adminProfileForm.value.name),
      username: String(res?.profile?.username || adminProfileForm.value.username),
      email: String(res?.profile?.email || adminProfileForm.value.email)
    }
    toastStore.success('Admin giriş məlumatları yeniləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || 'Admin giriş məlumatları yenilənmədi')
  } finally {
    adminProfileSaving.value = false
  }
}

const sendEmailTest = async () => {
  if (!emailTestForm.value.to || !emailTestForm.value.to.includes('@')) {
    toastStore.error('Test email ünvanını düzgün daxil edin')
    return
  }
  emailTesting.value = true
  try {
    await $fetch('/api/admin/email-test', {
      method: 'POST',
      body: emailTestForm.value
    })
    toastStore.success('Test email göndərildi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || error?.data?.statusMessage || 'Test email göndərilmədi')
  } finally {
    emailTesting.value = false
  }
}

const sendSmsTest = async () => {
  if (!smsTestForm.value.to) {
    toastStore.error('Test telefon nömrəsini daxil edin')
    return
  }
  smsTesting.value = true
  try {
    await $fetch('/api/admin/sms-test', {
      method: 'POST',
      body: smsTestForm.value
    })
    toastStore.success('Test SMS göndərildi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || error?.data?.statusMessage || 'Test SMS göndərilmədi')
  } finally {
    smsTesting.value = false
  }
}

const addContactHour = () => {
  settings.value.contactPage.businessHours.push({
    day: 'Yeni gün',
    hours: '09:00 - 18:00'
  })
}

const removeContactHour = (index: number) => {
  settings.value.contactPage.businessHours.splice(index, 1)
}

const addContactFaq = () => {
  settings.value.contactPage.faqs.push({
    enabled: true,
    question: 'Yeni sual',
    answer: 'Cavabı buraya yazın.'
  })
}

const removeContactFaq = (index: number) => {
  settings.value.contactPage.faqs.splice(index, 1)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Sistem Ayarları</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Mağazanın qlobal tənzimləmələrini buradan idarə edə bilərsiniz.</p>
      </div>
      <button 
        @click="saveSettings"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Save class="w-4 h-4 mr-2" /> Ayarları Yadda Saxla
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- General Settings -->
      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-8 flex items-center">
            <Globe class="w-6 h-6 mr-3 text-blue-600" />
            Ümumi Məlumatlar
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Saytın Adı</label>
              <input v-model="settings.siteName" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Saytın Loqosu (URL)</label>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                  <img :src="settings.siteLogo" class="max-w-full max-h-full object-contain" />
                </div>
                <input v-model="settings.siteLogo" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
              <input @change="uploadLogo" type="file" accept="image/*" class="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Əsas Valyuta</label>
              <select v-model="settings.currency" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>AZN</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Dil</label>
              <select v-model="settings.language" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option value="az">Azərbaycan</option>
                <option value="ru">Rus</option>
                <option value="en">English</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Əlaqə Email</label>
              <input v-model="settings.siteEmail" type="email" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Əlaqə Telefon</label>
              <input v-model="settings.sitePhone" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div class="mt-8 flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
            <div>
              <div class="text-sm font-bold text-gray-900">Hero animasiyalar</div>
              <div class="text-xs text-gray-500 font-medium">Ana səhifə slider animasiyalarını aç/söndür.</div>
            </div>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="settings.heroAnimations" type="checkbox" class="sr-only peer" />
              <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Sosial Linklər</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                <input v-model="settings.socials.whatsapp" type="url" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Instagram</label>
                <input v-model="settings.socials.instagram" type="url" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Facebook</label>
                <input v-model="settings.socials.facebook" type="url" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">YouTube</label>
                <input v-model="settings.socials.youtube" type="url" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>
          </div>
          <div class="mt-6 space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Fiziki Ünvan</label>
            <textarea v-model="settings.address" rows="3" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          </div>
          <div class="mt-6 space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Google Maps Embed URL</label>
            <input v-model="settings.googleMapsEmbedUrl" type="url" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="https://www.google.com/maps/embed?..." />
            <div class="text-[11px] text-gray-500 font-medium">
              Google Maps-da “Share → Embed a map” bölməsindən src linkini götürüb buraya yazın.
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Header Flash Satış</h3>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-gray-900">Aktivdir</div>
                  <div class="text-xs text-gray-500 font-medium">Header-də sağ tərəfdə görsənəcək.</div>
                </div>
                <label class="inline-flex items-center cursor-pointer">
                  <input v-model="settings.flashSale.enabled" type="checkbox" class="sr-only peer" />
                  <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                    <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Badge</label>
                  <input v-model="settings.flashSale.badge" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" placeholder="NEW" />
                </div>
                <div class="space-y-2 md:col-span-1">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mətn</label>
                  <input v-model="settings.flashSale.text" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">App Download CTA</h3>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-gray-900">Aktivdir</div>
                  <div class="text-xs text-gray-500 font-medium">Ana səhifənin aşağı hissəsində görünür.</div>
                </div>
                <label class="inline-flex items-center cursor-pointer">
                  <input v-model="settings.appPromo.enabled" type="checkbox" class="sr-only peer" />
                  <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                    <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2 md:col-span-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
                  <input v-model="settings.appPromo.title" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
                <div class="space-y-2 md:col-span-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Alt mətn</label>
                  <textarea v-model="settings.appPromo.subtitle" rows="3" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all resize-none"></textarea>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Android link</label>
                  <input v-model="settings.appPromo.androidLink" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">iOS link</label>
                  <input v-model="settings.appPromo.iosLink" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
                <div class="space-y-2 md:col-span-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil (URL)</label>
                  <input v-model="settings.appPromo.image" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                  <input @change="uploadAppPromoImage" type="file" accept="image/*" class="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Əlaqə səhifəsi</h3>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="rounded-2xl bg-white border border-gray-100 p-5 space-y-5">
                <div class="flex items-center gap-3">
                  <MessageCircle class="w-5 h-5 text-blue-600" />
                  <div>
                    <div class="text-sm font-extrabold text-gray-900">Hero və CTA</div>
                    <div class="text-xs font-medium text-gray-500">Contact səhifəsini daha modern edən əsas başlıq, alt mətn və hərəkət düymələri.</div>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Badge</label>
                    <input v-model="settings.contactPage.heroBadge" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
                    <input v-model="settings.contactPage.heroTitle" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Alt mətn</label>
                    <textarea v-model="settings.contactPage.heroSubtitle" rows="3" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Primary CTA label</label>
                    <input v-model="settings.contactPage.primaryCtaLabel" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Primary CTA href</label>
                    <input v-model="settings.contactPage.primaryCtaHref" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Secondary CTA label</label>
                    <input v-model="settings.contactPage.secondaryCtaLabel" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Secondary CTA href</label>
                    <input v-model="settings.contactPage.secondaryCtaHref" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
                  <div class="flex items-center gap-3">
                    <Phone class="w-5 h-5 text-blue-600" />
                    <div>
                      <div class="text-sm font-extrabold text-gray-900">Sürətli info kartları</div>
                      <div class="text-xs font-medium text-gray-500">Ünvan, telefon, email və WhatsApp kartlarını ayrıca idarə et.</div>
                    </div>
                  </div>
                  <div v-for="(card, idx) in settings.contactPage.infoCards" :key="`${card.key}-${idx}`" class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="text-sm font-extrabold text-gray-900 uppercase">{{ card.key }}</div>
                      <input v-model="card.enabled" type="checkbox" class="w-5 h-5" />
                    </div>
                    <input v-model="card.label" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all" placeholder="Başlıq" />
                    <input v-model="card.description" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all" placeholder="Açıqlama" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp label</label>
                    <input v-model="settings.contactPage.whatsappLabel" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <span class="text-sm font-bold text-gray-800">Sosiallar görün</span>
                      <input v-model="settings.contactPage.showSocials" type="checkbox" class="w-5 h-5" />
                    </label>
                    <label class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <span class="text-sm font-bold text-gray-800">İş saatları görün</span>
                      <input v-model="settings.contactPage.showBusinessHours" type="checkbox" class="w-5 h-5" />
                    </label>
                  </div>
                </div>

                <div class="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <Clock3 class="w-5 h-5 text-blue-600" />
                      <div>
                        <div class="text-sm font-extrabold text-gray-900">İş saatları</div>
                        <div class="text-xs font-medium text-gray-500">Əlaqə səhifəsində ayrıca kart kimi görünür.</div>
                      </div>
                    </div>
                    <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700" @click="addContactHour">
                      <Plus class="w-4 h-4" /> Əlavə et
                    </button>
                  </div>
                  <div v-for="(row, idx) in settings.contactPage.businessHours" :key="`hour-${idx}`" class="grid grid-cols-[1fr,1fr,auto] gap-3 items-center">
                    <input v-model="row.day" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="B.e - C." />
                    <input v-model="row.hours" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="09:00 - 18:00" />
                    <button type="button" class="inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-3 text-red-600" @click="removeContactHour(idx)">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <HelpCircle class="w-5 h-5 text-blue-600" />
                    <div>
                      <div class="text-sm font-extrabold text-gray-900">Contact FAQ</div>
                      <div class="text-xs font-medium text-gray-500">Əlaqə səhifəsində ən çox verilən sualları accordion şəklində göstər.</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <label class="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2">
                      <span class="text-xs font-extrabold text-gray-700">Aktiv</span>
                      <input v-model="settings.contactPage.showFaq" type="checkbox" class="w-4 h-4" />
                    </label>
                    <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700" @click="addContactFaq">
                      <Plus class="w-4 h-4" /> FAQ əlavə et
                    </button>
                  </div>
                </div>
                <div v-for="(faq, idx) in settings.contactPage.faqs" :key="`faq-${idx}`" class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-extrabold text-gray-900">Sual #{{ idx + 1 }}</div>
                    <div class="flex items-center gap-3">
                      <input v-model="faq.enabled" type="checkbox" class="w-5 h-5" />
                      <button type="button" class="text-red-600" @click="removeContactFaq(idx)">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input v-model="faq.question" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all" placeholder="Sual" />
                  <textarea v-model="faq.answer" rows="3" class="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-600 outline-none transition-all resize-none" placeholder="Cavab"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Cart və Checkout</h3>
            <div class="rounded-2xl border border-blue-100 bg-blue-50/70 p-6">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="flex items-start gap-3">
                  <ShoppingCart class="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <div class="text-sm font-extrabold text-gray-900">Ayrı idarə səhifəsinə daşınıb</div>
                    <div class="mt-1 text-xs font-medium leading-6 text-gray-600">
                      Cart, checkout, ƏDV, şəhər auto-detect və həmin hissələrin tonları artıq ayrıca səhifədən idarə olunur.
                    </div>
                  </div>
                </div>
                <NuxtLink :to="adminPath('cart-checkout')" class="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700">
                  Cart & Checkout səhifəsini aç
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Ana səhifə Xüsusiyyətlər</h3>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="flex flex-wrap items-center gap-3">
                <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Dil</div>
                <div class="flex gap-2">
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
                </div>
              </div>

              <div class="space-y-4">
                <div v-for="(f, idx) in settings.homeFeatures" :key="idx" class="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-extrabold text-gray-900">Feature #{{ idx + 1 }}</div>
                    <label class="inline-flex items-center cursor-pointer">
                      <input v-model="f.enabled" type="checkbox" class="sr-only peer" />
                      <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                        <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="space-y-2">
                      <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">İkon</label>
                      <select v-model="f.icon" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                        <option v-for="ic in featureIcons" :key="ic" :value="ic">{{ ic }}</option>
                      </select>
                    </div>
                    <div class="space-y-2 md:col-span-2">
                      <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
                      <input v-model="f.title[contentLang]" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                    </div>
                    <div class="space-y-2 md:col-span-3">
                      <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açıqlama</label>
                      <input v-model="f.description[contentLang]" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Məhsul səhifəsi blokları</h3>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="rounded-2xl bg-white border border-gray-100 px-5 py-4">
                <div class="text-sm font-bold text-gray-900">Məhsul detalındakı üstünlük kartları</div>
                <div class="mt-1 text-xs font-medium text-gray-500">Pulsuz çatdırılma, sifariş qarantisi, təhlükəsiz ödəmələr və digər bloklar üçün ayrıca redaktə səhifəsi ayrılıb.</div>
              </div>
              <div class="rounded-2xl bg-white border border-gray-100 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div class="text-sm font-bold text-gray-900">Ayrı redaktə bölməsi</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">Bu blokların popup məzmunu, cədvəl sətirləri, kartları və qeydləri artıq kod yazmadan ayrıca səhifədən idarə olunur.</div>
                </div>
                <NuxtLink :to="adminPath('product-info-blocks')" class="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
                  Məhsul bloklarını aç
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Footer və Copyright</h3>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="flex flex-wrap items-center gap-3">
                <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Dil</div>
                <div class="flex gap-2">
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="footerLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="footerLang = 'az'">AZ</button>
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="footerLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="footerLang = 'ru'">RU</button>
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="footerLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="footerLang = 'en'">EN</button>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Footer haqqında mətn</label>
                <textarea v-model="settings.footerContent.aboutText[footerLang]" rows="4" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all resize-none"></textarea>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Copyright mətn</label>
                <textarea v-model="settings.footerContent.copyrightText[footerLang]" rows="3" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all resize-none"></textarea>
                <div class="text-[11px] text-gray-500 font-medium"><span v-pre class="font-mono">{{siteName}}</span> yazdıqda saytın adı avtomatik yerləşdirilir.</div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Xüsusi Kod</h3>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="rounded-2xl bg-white border border-gray-100 px-5 py-4">
                <div class="text-sm font-bold text-gray-900">Admin paneldən kod əlavəsi</div>
                <div class="mt-1 text-xs font-medium text-gray-500">Buradan xüsusi CSS və script əlavə edib dizayn və inteqrasiyaları kod səviyyəsində genişləndirə bilərsiniz.</div>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Custom CSS</label>
                <textarea v-model="settings.customCode.customCss" rows="8" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all resize-y font-mono"></textarea>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Head Script</label>
                <textarea v-model="settings.customCode.headScript" rows="7" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all resize-y font-mono"></textarea>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Body Sonu Script</label>
                <textarea v-model="settings.customCode.bodyEndScript" rows="7" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all resize-y font-mono"></textarea>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h3 class="text-sm font-extrabold text-gray-900 mb-4">Newsletter</h3>
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-gray-900">Aktivdir</div>
                  <div class="text-xs text-gray-500 font-medium">Footer hissəsində abunə bloku görünəcək.</div>
                </div>
                <label class="inline-flex items-center cursor-pointer">
                  <input v-model="settings.newsletter.enabled" type="checkbox" class="sr-only peer" />
                  <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                    <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>

              <div class="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4">
                <div>
                  <div class="text-sm font-bold text-gray-900">Avtomatik email göndər</div>
                  <div class="text-xs text-gray-500 font-medium">Yeni məzmun əlavə olunanda abunələrə göndər.</div>
                </div>
                <label class="inline-flex items-center cursor-pointer">
                  <input v-model="settings.newsletterAutomation.enabled" type="checkbox" class="sr-only peer" />
                  <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                    <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 cursor-pointer">
                  <div class="text-sm font-bold text-gray-900">Yeni məhsul</div>
                  <input v-model="settings.newsletterAutomation.onNewProduct" type="checkbox" class="w-5 h-5" />
                </label>
                <label class="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 cursor-pointer">
                  <div class="text-sm font-bold text-gray-900">Yeni bloq</div>
                  <input v-model="settings.newsletterAutomation.onNewBlog" type="checkbox" class="w-5 h-5" />
                </label>
                <label class="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 cursor-pointer">
                  <div class="text-sm font-bold text-gray-900">Yeni banner</div>
                  <input v-model="settings.newsletterAutomation.onNewBanner" type="checkbox" class="w-5 h-5" />
                </label>
                <label class="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 cursor-pointer">
                  <div class="text-sm font-bold text-gray-900">Yeni slider</div>
                  <input v-model="settings.newsletterAutomation.onNewSlider" type="checkbox" class="w-5 h-5" />
                </label>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Dil</div>
                <div class="flex gap-2">
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
                  <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2 md:col-span-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
                  <input v-model="settings.newsletter.title[contentLang]" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
                <div class="space-y-2 md:col-span-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Alt mətn</label>
                  <textarea v-model="settings.newsletter.subtitle[contentLang]" rows="3" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all resize-none"></textarea>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Placeholder</label>
                  <input v-model="settings.newsletter.placeholder[contentLang]" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Button</label>
                  <input v-model="settings.newsletter.button[contentLang]" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-8 flex items-center">
            <Search class="w-6 h-6 mr-3 text-green-600" />
            SEO Tənzimləmələri
          </h2>
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Meta Başlıq (Site Title)</label>
              <input v-model="settings.seo.title" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Meta Təsvir (Meta Description)</label>
              <textarea v-model="settings.seo.description" rows="3" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Açar Sözlər (Keywords)</label>
              <input v-model="settings.seo.keywords" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-8 flex items-center">
            <CreditCard class="w-6 h-6 mr-3 text-amber-600" />
            API və İnteqrasiya Ayarları
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div :class="['rounded-2xl border px-5 py-4', integrationReadiness.email ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70']">
              <div class="text-xs font-bold uppercase tracking-widest" :class="integrationReadiness.email ? 'text-emerald-600' : 'text-amber-600'">Email</div>
              <div class="mt-2 text-sm font-extrabold text-gray-900">{{ integrationReadiness.email ? 'Aktivdir' : 'API gözləyir' }}</div>
              <div class="mt-1 text-xs font-medium text-gray-500">Mail bildirişləri və email əsaslı axınlar bu sahədən idarə olunur.</div>
            </div>
            <div :class="['rounded-2xl border px-5 py-4', integrationReadiness.sms ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70']">
              <div class="text-xs font-bold uppercase tracking-widest" :class="integrationReadiness.sms ? 'text-emerald-600' : 'text-amber-600'">SMS</div>
              <div class="mt-2 text-sm font-extrabold text-gray-900">{{ integrationReadiness.sms ? 'OTP göndərişi hazırdır' : 'Provider qurulmayıb' }}</div>
              <div class="mt-1 text-xs font-medium text-gray-500">Twilio və ya lokal provider qoşulduqda telefon OTP real SMS ilə işləyir.</div>
            </div>
            <div :class="['rounded-2xl border px-5 py-4', integrationReadiness.payment ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70']">
              <div class="text-xs font-bold uppercase tracking-widest" :class="integrationReadiness.payment ? 'text-emerald-600' : 'text-amber-600'">Kartla ödəniş</div>
              <div class="mt-2 text-sm font-extrabold text-gray-900">{{ integrationReadiness.payment ? 'Checkout-da aktivdir' : 'Açarlar natamamdır' }}</div>
              <div class="mt-1 text-xs font-medium text-gray-500">API key, secret və callback dolduqda checkout-da avtomatik açılır.</div>
            </div>
            <div :class="['rounded-2xl border px-5 py-4', integrationReadiness.analytics ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70']">
              <div class="text-xs font-bold uppercase tracking-widest" :class="integrationReadiness.analytics ? 'text-emerald-600' : 'text-amber-600'">Analytics</div>
              <div class="mt-2 text-sm font-extrabold text-gray-900">{{ integrationReadiness.analytics ? 'Xarici açar hazırdır' : 'Daxili tracking aktivdir' }}</div>
              <div class="mt-1 text-xs font-medium text-gray-500">Hesabatlar bölməsi daxili izləmə ilə işləyir, açar əlavə edilərsə genişlənə bilər.</div>
            </div>
            <div :class="['rounded-2xl border px-5 py-4', integrationReadiness.deploy ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70']">
              <div class="text-xs font-bold uppercase tracking-widest" :class="integrationReadiness.deploy ? 'text-emerald-600' : 'text-amber-600'">Deploy</div>
              <div class="mt-2 text-sm font-extrabold text-gray-900">{{ integrationReadiness.deploy ? 'Webhook hazırdır' : 'Əlavə qurulum lazımdır' }}</div>
              <div class="mt-1 text-xs font-medium text-gray-500">Hosting webhook və domain əlavə ediləndə açıq yayım axını daha rahat olur.</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 md:col-span-2 flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-extrabold text-gray-900">Email kod doğrulaması</div>
                <div class="mt-1 text-xs font-medium text-gray-500">Deaktiv olanda signup və seller register kod istəmədən işləyir, aktiv olanda email API üzərindən kod tələb olunur.</div>
              </div>
              <input v-model="settings.integrations.emailVerificationEnabled" type="checkbox" class="w-5 h-5" />
            </div>
            <div class="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 md:col-span-2 flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-extrabold text-gray-900">Telefon kod doğrulaması</div>
                <div class="mt-1 text-xs font-medium text-gray-500">Deaktiv olanda telefonla qeydiyyat kodsuz işləyir, aktiv olanda SMS kod tələb olunur. Real SMS göndərişi üçün ayrıca provider inteqrasiyası lazımdır.</div>
              </div>
              <input v-model="settings.integrations.phoneVerificationEnabled" type="checkbox" class="w-5 h-5" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SMS Provider</label>
              <select v-model="settings.integrations.smsProvider" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all">
                <option value="">Seçilməyib</option>
                <option value="twilio">Twilio</option>
                <option value="custom">Lokal / Custom API</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SMS API Key / Account SID</label>
              <input v-model="settings.integrations.smsApiKey" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SMS API Secret / Auth Token</label>
              <input v-model="settings.integrations.smsApiSecret" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SMS Göndərən Nömrə / Sender ID</label>
              <input v-model="settings.integrations.smsFrom" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SMS Webhook URL (Lokal provider üçün)</label>
              <input v-model="settings.integrations.smsWebhookUrl" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email API Key</label>
              <input v-model="settings.integrations.emailApiKey" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Göndərən Email</label>
              <input v-model="settings.integrations.emailFrom" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hosting Webhook / Deploy URL</label>
              <input v-model="settings.integrations.hostingWebhook" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Domain adı</label>
              <input v-model="settings.integrations.domainName" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ödəniş API Key</label>
              <input v-model="settings.integrations.paymentApiKey" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ödəniş Secret</label>
              <input v-model="settings.integrations.paymentSecret" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ödəniş callback URL</label>
              <input v-model="settings.integrations.paymentCallbackUrl" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Analytics API Key</label>
              <input v-model="settings.integrations.analyticsApiKey" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Seller komissiyası (%)</label>
              <input v-model.number="settings.sellerCommissionRate" type="number" min="0" step="0.1" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="md:col-span-2 rounded-[2rem] border border-gray-100 bg-white px-6 py-6">
              <div class="text-sm font-extrabold text-gray-900">OTP test göndərişi</div>
              <div class="mt-1 text-xs font-medium text-gray-500">Email və telefon kanalını admin paneldən ayrıca sınaqdan keçirə bilərsiniz.</div>
              <div class="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-4">
                  <div class="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                    <Mail class="w-4 h-4 text-blue-600" />
                    Email OTP test
                  </div>
                  <input v-model="emailTestForm.to" type="email" placeholder="test@domain.com" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                  <button type="button" class="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="emailTesting" @click="sendEmailTest">
                    {{ emailTesting ? 'Göndərilir...' : 'Test email göndər' }}
                  </button>
                </div>
                <div class="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-4">
                  <div class="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                    <Phone class="w-4 h-4 text-blue-600" />
                    Telefon OTP test
                  </div>
                  <input v-model="smsTestForm.to" type="text" placeholder="+994501112233" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                  <button type="button" class="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="smsTesting" @click="sendSmsTest">
                    {{ smsTesting ? 'Göndərilir...' : 'Test SMS göndər' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 class="text-xl font-bold text-gray-900 flex items-center">
              <Bell class="w-6 h-6 mr-3 text-blue-600" />
              Açılış Bildirişi və Animasiya
            </h2>
            <NuxtLink :to="adminPath('entry-experience')" class="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-all">
              Ayrı paneldə önizlə
            </NuxtLink>
          </div>
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
                <div>
                  <div class="text-sm font-bold text-gray-900">Açılış animasiyası</div>
                  <div class="text-xs font-medium text-gray-500 mt-1">Sayt açılarkən qısa splash animasiyası göstər.</div>
                </div>
                <input v-model="settings.entryExperience.splashEnabled" type="checkbox" class="w-5 h-5" />
              </label>
              <label class="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
                <div>
                  <div class="text-sm font-bold text-gray-900">Popup bildiriş</div>
                  <div class="text-xs font-medium text-gray-500 mt-1">Sayt açılarkən admin idarəli modern popup göstər.</div>
                </div>
                <input v-model="settings.entryExperience.popupEnabled" type="checkbox" class="w-5 h-5" />
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input v-model="settings.entryExperience.popupTitle.az" type="text" placeholder="Başlıq (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input v-model="settings.entryExperience.popupTitle.ru" type="text" placeholder="Başlıq (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input v-model="settings.entryExperience.popupTitle.en" type="text" placeholder="Başlıq (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <textarea v-model="settings.entryExperience.popupSubtitle.az" rows="3" placeholder="Alt başlıq (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
              <textarea v-model="settings.entryExperience.popupSubtitle.ru" rows="3" placeholder="Alt başlıq (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
              <textarea v-model="settings.entryExperience.popupSubtitle.en" rows="3" placeholder="Alt başlıq (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="rounded-2xl border border-gray-100 p-5 space-y-4">
                <div class="text-sm font-bold text-gray-900">Sol seçim kartı</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input v-model="settings.entryExperience.primaryActionLabel.az" type="text" placeholder="Label (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  <input v-model="settings.entryExperience.primaryActionLabel.ru" type="text" placeholder="Label (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  <input v-model="settings.entryExperience.primaryActionLabel.en" type="text" placeholder="Label (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all md:col-span-2" />
                </div>
                <input v-model="settings.entryExperience.primaryActionHref" type="text" placeholder="/shop?gender=women" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>

              <div class="rounded-2xl border border-gray-100 p-5 space-y-4">
                <div class="text-sm font-bold text-gray-900">Sağ seçim kartı</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input v-model="settings.entryExperience.secondaryActionLabel.az" type="text" placeholder="Label (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  <input v-model="settings.entryExperience.secondaryActionLabel.ru" type="text" placeholder="Label (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                  <input v-model="settings.entryExperience.secondaryActionLabel.en" type="text" placeholder="Label (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all md:col-span-2" />
                </div>
                <input v-model="settings.entryExperience.secondaryActionHref" type="text" placeholder="/shop?gender=men" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-8 flex items-center">
            <Shield class="w-6 h-6 mr-3 text-purple-600" />
            Təhlükəsizlik və Bildirişlər
          </h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div class="flex items-center">
                <Bell class="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p class="text-sm font-bold text-gray-800">Email Bildirişləri</p>
                  <p class="text-xs text-gray-400 font-medium">Yeni sifarişlər zamanı email göndərilsin</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="settings.notifications" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div class="flex items-center">
                <Save class="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p class="text-sm font-bold text-gray-800">Texniki Xidmət Rejimi</p>
                  <p class="text-xs text-gray-400 font-medium">Saytı istifadəçilər üçün bağla</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="settings.maintenanceMode" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <div class="rounded-[2rem] border border-gray-100 bg-white p-5 space-y-4">
              <div class="flex items-center gap-3">
                <Lock class="w-5 h-5 text-blue-600" />
                <div>
                  <div class="text-sm font-bold text-gray-900">Admin giriş yolu</div>
                  <div class="text-xs text-gray-500 font-medium">Admin panel üçün görünən giriş yolunu buradan dəyişə bilərsiniz.</div>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-end">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Giriş yolu</label>
                  <div class="flex items-center rounded-2xl border border-gray-100 bg-gray-50 px-4">
                    <span class="text-sm font-bold text-gray-400 shrink-0">/</span>
                    <input v-model="adminPortalForm.pathSegment" type="text" class="w-full bg-transparent px-2 py-3.5 text-sm outline-none" placeholder="admin" />
                  </div>
                </div>
                <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60" :disabled="adminPortalSaving" @click="saveAdminPortal">
                  <Save class="w-4 h-4" />
                  {{ adminPortalSaving ? 'Yadda saxlanır...' : 'Yolu yenilə' }}
                </button>
              </div>
            </div>
            <div class="rounded-[2rem] border border-gray-100 bg-white p-5 space-y-4">
              <div class="flex items-center gap-3">
                <Lock class="w-5 h-5 text-blue-600" />
                <div>
                  <div class="text-sm font-bold text-gray-900">Admin giriş məlumatları</div>
                  <div class="text-xs text-gray-500 font-medium">Hazırda default giriş adı və şifrə admin olaraq işləyir. Buradan admin adını və emailini dəyişə bilərsiniz.</div>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input v-model="adminProfileForm.name" type="text" placeholder="Admin adı" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                <input v-model="adminProfileForm.username" type="text" placeholder="Admin giriş adı" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                <input v-model="adminProfileForm.email" type="text" placeholder="Admin email və ya login" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
              <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all disabled:opacity-60" :disabled="adminProfileSaving" @click="saveAdminProfile">
                <Save class="w-4 h-4" />
                {{ adminProfileSaving ? 'Yenilənir...' : 'Giriş məlumatlarını yenilə' }}
              </button>
            </div>
            <div class="rounded-[2rem] border border-gray-100 bg-white p-5 space-y-4">
              <div class="flex items-center gap-3">
                <Lock class="w-5 h-5 text-blue-600" />
                <div>
                  <div class="text-sm font-bold text-gray-900">Admin giriş açarını dəyiş</div>
                  <div class="text-xs text-gray-500 font-medium">Admin panelə daxil olmaq üçün istifadə etdiyiniz şifrəni buradan yeniləyin.</div>
                </div>
              </div>
              <div class="grid grid-cols-1 gap-4">
                <input v-model="securityForm.currentPassword" type="password" placeholder="Cari şifrə" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                <input v-model="securityForm.nextPassword" type="password" placeholder="Yeni şifrə" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                <input v-model="securityForm.confirmPassword" type="password" placeholder="Yeni şifrə təkrarı" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
              <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60" :disabled="securitySaving" @click="changeAdminPassword">
                <Lock class="w-4 h-4" />
                {{ securitySaving ? 'Yenilənir...' : 'Admin şifrəsini yenilə' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Info Card -->
      <div class="space-y-8">
        <div class="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200 group">
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <h2 class="text-xl font-bold mb-6 relative z-10">Sistem Məlumatı</h2>
          <div class="space-y-4 relative z-10">
            <div class="flex justify-between text-sm">
              <span class="font-bold opacity-60 uppercase tracking-widest text-[10px]">Nuxt Versiya</span>
              <span class="font-bold">v3.10.0</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-bold opacity-60 uppercase tracking-widest text-[10px]">PHP Versiya</span>
              <span class="font-bold">v8.2.0</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-bold opacity-60 uppercase tracking-widest text-[10px]">Server</span>
              <span class="font-bold">Apache/2.4</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-bold opacity-60 uppercase tracking-widest text-[10px]">Verilənlər Bazası</span>
              <span class="font-bold">MySQL 8.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
