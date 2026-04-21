<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-vue-next'

definePageMeta({
  layout: 'seller',
  middleware: ['require-seller']
})

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()

const paymentNote = ref('')
const selectedPlanDays = ref<number | null>(null)
const saving = ref(false)

await settingsStore.fetchSettings()

const { data: product } = await useFetch(`/api/products/${route.params.id}`)
const sellerPromotion = computed(() => settingsStore.settings.sellerPromotion || {})
const plans = computed(() => (sellerPromotion.value.plans || []).filter((plan: any) => plan.enabled))
const selectedPlan = computed(() => plans.value.find((plan: any) => Number(plan.days) === Number(selectedPlanDays.value)))

const submitRequest = async () => {
  if (!product.value || !selectedPlan.value) {
    toastStore.error('Məhsul və plan seçimi vacibdir')
    return
  }
  saving.value = true
  try {
    await $fetch('/api/seller/product-featured-requests', {
      method: 'POST',
      body: {
        productId: Number(product.value.id),
        planDays: Number(selectedPlan.value.days),
        paymentNote: paymentNote.value
      }
    })
    toastStore.success('Məhsul üçün önə çıxarma sorğusu göndərildi')
    await router.push('/seller/products')
  } catch {
    toastStore.error('Sorğu göndərilmədi')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="product" class="space-y-8">
    <NuxtLink to="/seller/products" class="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-blue-600">
      <ArrowLeft class="w-4 h-4" />
      Məhsullara qayıt
    </NuxtLink>

    <div class="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6">
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8">
        <div class="text-xs font-extrabold uppercase tracking-[0.24em] text-amber-500">Məhsul önə çıxarma</div>
        <div class="mt-3 text-3xl font-extrabold text-slate-900">{{ product.name }}</div>
        <div class="mt-3 text-sm font-medium text-slate-500">Bu məhsulu ana səhifə və seçilmiş vitrin hissələrində önə çıxarmaq üçün plan seçin.</div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="plan in plans"
            :key="plan.days"
            type="button"
            :class="['rounded-[1.75rem] border p-5 text-left transition-all', selectedPlanDays === plan.days ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-50' : 'border-slate-200 hover:border-blue-300']"
            @click="selectedPlanDays = plan.days"
          >
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Plan</div>
            <div class="mt-2 text-2xl font-extrabold text-slate-900">{{ plan.label }}</div>
            <div class="mt-3 text-3xl font-extrabold text-blue-600">₼{{ Number(plan.price || 0).toFixed(2) }}</div>
          </button>
        </div>

        <div class="mt-6 space-y-4">
          <textarea v-model="paymentNote" rows="5" placeholder="Ödəniş qeydi, köçürmə adı və ya qeyd" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium resize-none"></textarea>
          <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60" :disabled="saving || !selectedPlan" @click="submitRequest">
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
