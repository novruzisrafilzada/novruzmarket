<script setup lang="ts">
import { ref, watch } from 'vue'
import { Mail, Save, Send, ShieldAlert } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()

if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}

const form = ref(JSON.parse(JSON.stringify(settingsStore.settings.emailAutomation)))
const testTo = ref(form.value.testTo || '')

watch(
  () => settingsStore.settings.emailAutomation,
  (v) => {
    form.value = JSON.parse(JSON.stringify(v))
    testTo.value = form.value.testTo || ''
  },
  { deep: true }
)

const save = async () => {
  settingsStore.setSettings({ emailAutomation: form.value as any })
  await settingsStore.saveSettings()
  toastStore.success('Yadda saxlandı')
}

const sendTest = async (kind: 'welcome' | 'newsletter' | 'orderCreated' | 'orderStatus') => {
  const to = String(testTo.value || '').trim()
  if (!to || !to.includes('@')) {
    toastStore.error('Test e-poçt ünvanını düzgün daxil edin')
    return
  }
  const vars = {
    siteName: settingsStore.settings.siteName,
    name: 'Test User',
    email: to,
    orderId: 12345,
    status: 'Təsdiqləndi'
  }

  const subject =
    kind === 'welcome'
      ? form.value.welcomeSubject
      : kind === 'newsletter'
        ? form.value.newsletterWelcomeSubject
        : kind === 'orderCreated'
          ? form.value.orderCreatedSubject
          : form.value.orderStatusSubject

  const html =
    kind === 'welcome'
      ? form.value.welcomeHtml
      : kind === 'newsletter'
        ? form.value.newsletterWelcomeHtml
        : kind === 'orderCreated'
          ? form.value.orderCreatedHtml
          : form.value.orderStatusHtml

  const renderedSubject = String(subject || '')
    .replace(/\{\{\s*siteName\s*\}\}/g, vars.siteName)
    .replace(/\{\{\s*name\s*\}\}/g, vars.name)
    .replace(/\{\{\s*email\s*\}\}/g, vars.email)
    .replace(/\{\{\s*orderId\s*\}\}/g, String(vars.orderId))
    .replace(/\{\{\s*status\s*\}\}/g, vars.status)

  const renderedHtml = String(html || '')
    .replace(/\{\{\s*siteName\s*\}\}/g, vars.siteName)
    .replace(/\{\{\s*name\s*\}\}/g, vars.name)
    .replace(/\{\{\s*email\s*\}\}/g, vars.email)
    .replace(/\{\{\s*orderId\s*\}\}/g, String(vars.orderId))
    .replace(/\{\{\s*status\s*\}\}/g, vars.status)

  await $fetch('/api/admin/email-test', { method: 'POST', body: { to, subject: renderedSubject, html: renderedHtml } })
  toastStore.success('Test email göndərildi')
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <Mail class="w-7 h-7 text-blue-600" />
          Email Avtomatlaşdırma
        </h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Xoş gəldiniz və sifariş bildirişlərini avtomatik göndərin.</p>
      </div>
      <button type="button" class="bg-blue-600 px-6 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all" @click="save">
        <Save class="w-4 h-4 mr-2" /> Yadda saxla
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 space-y-6">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="text-sm font-extrabold text-gray-900">Avtomat göndəriş</div>
            <div class="text-xs text-gray-500 font-medium">Resend API key və from email server env-də olmalıdır.</div>
          </div>
          <label class="inline-flex items-center gap-3 cursor-pointer">
            <span class="text-sm font-extrabold text-gray-700">{{ form.enabled ? 'Aktiv' : 'Deaktiv' }}</span>
            <input v-model="form.enabled" type="checkbox" class="w-5 h-5 accent-blue-600" />
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Test e-poçt</label>
            <input v-model="testTo" type="email" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="test@domain.com" />
            <div class="text-[11px] text-gray-500 font-medium">Test göndəriş üçün istifadə olunur.</div>
          </div>
          <div class="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-white border border-amber-100 flex items-center justify-center text-amber-700">
              <ShieldAlert class="w-5 h-5" />
            </div>
            <div class="text-sm text-amber-900 font-bold leading-relaxed">
              E-poçt göndərişi üçün server-də RESEND_API_KEY və RESEND_FROM qurulmalıdır.
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 cursor-pointer">
            <input v-model="form.onWelcomeSignup" type="checkbox" class="w-5 h-5 accent-blue-600" />
            <span class="text-sm font-extrabold text-gray-800">Signup xoş gəldin</span>
          </label>
          <label class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 cursor-pointer">
            <input v-model="form.onWelcomeNewsletterSubscribe" type="checkbox" class="w-5 h-5 accent-blue-600" />
            <span class="text-sm font-extrabold text-gray-800">Newsletter xoş gəldin</span>
          </label>
          <label class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 cursor-pointer">
            <input v-model="form.onOrderCreated" type="checkbox" class="w-5 h-5 accent-blue-600" />
            <span class="text-sm font-extrabold text-gray-800">Sifariş yaradıldı</span>
          </label>
          <label class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 cursor-pointer">
            <input v-model="form.onOrderStatusChanged" type="checkbox" class="w-5 h-5 accent-blue-600" />
            <span class="text-sm font-extrabold text-gray-800">Sifariş statusu</span>
          </label>
        </div>
      </div>

      <div class="p-8 space-y-10">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-lg font-extrabold text-gray-900">Signup: Xoş gəldiniz</div>
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-900 text-white font-extrabold text-xs hover:bg-black transition-all" @click="sendTest('welcome')">
              <Send class="w-4 h-4" /> Test göndər
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
              <input v-model="form.welcomeSubject" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 lg:col-span-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">HTML</label>
              <textarea v-model="form.welcomeHtml" rows="5" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all font-mono"></textarea>
              <div class="text-[11px] text-gray-500 font-medium">
                Placeholders:
                <code v-pre>{{siteName}}</code>,
                <code v-pre>{{name}}</code>,
                <code v-pre>{{email}}</code>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-lg font-extrabold text-gray-900">Newsletter: Xoş gəldiniz</div>
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-900 text-white font-extrabold text-xs hover:bg-black transition-all" @click="sendTest('newsletter')">
              <Send class="w-4 h-4" /> Test göndər
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
              <input v-model="form.newsletterWelcomeSubject" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 lg:col-span-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">HTML</label>
              <textarea v-model="form.newsletterWelcomeHtml" rows="5" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all font-mono"></textarea>
              <div class="text-[11px] text-gray-500 font-medium">
                Placeholders:
                <code v-pre>{{siteName}}</code>,
                <code v-pre>{{email}}</code>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-lg font-extrabold text-gray-900">Sifariş yaradıldı</div>
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-900 text-white font-extrabold text-xs hover:bg-black transition-all" @click="sendTest('orderCreated')">
              <Send class="w-4 h-4" /> Test göndər
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
              <input v-model="form.orderCreatedSubject" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 lg:col-span-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">HTML</label>
              <textarea v-model="form.orderCreatedHtml" rows="5" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all font-mono"></textarea>
              <div class="text-[11px] text-gray-500 font-medium">
                Placeholders:
                <code v-pre>{{siteName}}</code>,
                <code v-pre>{{orderId}}</code>,
                <code v-pre>{{status}}</code>,
                <code v-pre>{{email}}</code>,
                <code v-pre>{{name}}</code>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-lg font-extrabold text-gray-900">Sifariş statusu dəyişdi</div>
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-900 text-white font-extrabold text-xs hover:bg-black transition-all" @click="sendTest('orderStatus')">
              <Send class="w-4 h-4" /> Test göndər
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
              <input v-model="form.orderStatusSubject" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 lg:col-span-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">HTML</label>
              <textarea v-model="form.orderStatusHtml" rows="5" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all font-mono"></textarea>
              <div class="text-[11px] text-gray-500 font-medium">
                Placeholders:
                <code v-pre>{{siteName}}</code>,
                <code v-pre>{{orderId}}</code>,
                <code v-pre>{{status}}</code>,
                <code v-pre>{{email}}</code>,
                <code v-pre>{{name}}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
