<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-vue-next'

definePageMeta({
  layout: 'seller',
  middleware: ['require-seller']
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()

const paymentNote = ref('')
const saving = ref(false)

await settingsStore.fetchSettings()

const sellerPromotion = computed(() => settingsStore.settings.sellerPromotion || {})
const plan = computed(() => (sellerPromotion.value.plans || []).find((item: any) => Number(item.days) === Number(route.params.days) && item.enabled))

const submitRequest = async () => {
  if (!plan.value) {
    toastStore.error('Plan tapılmadı')
    return
  }
  saving.value = true
  try {
    await $fetch('/api/seller/featured-requests', {
      method: 'POST',
      body: {
        planDays: Number(plan.value.days),
        paymentNote: paymentNote.value
      }
    })
    toastStore.success('Sorğu göndərildi')
    await authStore.fetchSession()
    await router.push('/seller/promotions')
  } catch {
    toastStore.error('Sorğu göndərilmədi')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="plan" class="space-y-8">
    <NuxtLink to="/seller/promotions" class="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-blue-600">
      <ArrowLeft class="w-4 h-4" />
      Planlara qayıt
    </NuxtLink>

    <div class="grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8">
        <div class="text-xs font-extrabold uppercase tracking-[0.24em] text-amber-500">Ödəniş səhifəsi</div>
        <div class="mt-3 text-3xl font-extrabold text-slate-900">{{ plan.label }} planı</div>
        <div class="mt-3 text-sm font-medium text-slate-500">{{ sellerPromotion.paymentInstructions }}</div>

        <div class="mt-8 rounded-[1.75rem] bg-blue-50 p-6">
          <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">Məbləğ</div>
          <div class="mt-2 text-4xl font-extrabold text-blue-700">₼{{ Number(plan.price || 0).toFixed(2) }}</div>
          <div class="mt-2 text-sm font-medium text-blue-700/80">{{ sellerPromotion.featuredBadgeText || 'PRO' }} badge ilə mağazanız önə çıxır</div>
        </div>

        <div class="mt-8 space-y-4">
          <textarea v-model="paymentNote" rows="5" placeholder="Ödəniş qeydi, köçürmə zamanı yazılan ad və ya əlavə qeyd" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium resize-none"></textarea>
          <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60" :disabled="saving" @click="submitRequest">
            <ShieldCheck class="w-5 h-5" />
            {{ saving ? 'Göndərilir...' : 'Ödənişi etdim, sorğunu göndər' }}
          </button>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8">
        <div class="flex items-center gap-3">
          <CreditCard class="w-5 h-5 text-emerald-600" />
          <div class="text-xl font-extrabold text-slate-900">Ödəniş məlumatları</div>
        </div>
        <div class="mt-6 space-y-4 text-sm">
          <div>
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Qəbul edən</div>
            <div class="mt-1 font-bold text-slate-900">{{ sellerPromotion.paymentReceiverName || 'Ödəniş alan məlumatı əlavə edilməyib' }}</div>
          </div>
          <div>
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Kart / Hesab</div>
            <div class="mt-1 font-bold text-slate-900 break-all">{{ sellerPromotion.paymentReceiverCard || 'Kart və ya hesab nömrəsi əlavə edilməyib' }}</div>
          </div>
          <div>
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Bank / Qeyd</div>
            <div class="mt-1 font-bold text-slate-900">{{ sellerPromotion.paymentReceiverBank || 'Bank məlumatı əlavə edilməyib' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
