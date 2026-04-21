<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Crown, Rocket, TimerReset } from 'lucide-vue-next'

definePageMeta({
  layout: 'seller',
  middleware: ['require-seller']
})

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const requests = ref<any[]>([])

const sellerPromotion = computed(() => settingsStore.settings.sellerPromotion || {
  paymentReceiverName: '',
  paymentReceiverCard: '',
  paymentReceiverBank: '',
  paymentInstructions: '',
  featuredBadgeText: 'PRO',
  plans: []
})

const plans = computed(() => (sellerPromotion.value.plans || []).filter((plan: any) => plan.enabled))

const loadData = async () => {
  await settingsStore.fetchSettings()
  requests.value = await $fetch('/api/seller/featured-requests')
}

onMounted(loadData)
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div class="text-xs font-extrabold uppercase tracking-[0.26em] text-amber-500">Önə çıxarma</div>
          <div class="mt-3 text-3xl font-extrabold text-slate-900">Mağazanızı ana səhifədə önə çıxarın</div>
          <div class="mt-3 text-sm font-medium text-slate-500 max-w-2xl">{{ sellerPromotion.paymentInstructions }}</div>
        </div>
        <div class="rounded-[1.5rem] bg-amber-50 px-6 py-5 text-amber-700 min-w-[280px]">
          <div class="text-[11px] font-extrabold uppercase tracking-[0.18em]">Aktiv status</div>
          <div class="mt-2 text-2xl font-extrabold">{{ authStore.user?.sellerProfile?.featuredStatus || 'Yoxdur' }}</div>
          <div v-if="authStore.user?.sellerProfile?.featuredUntil" class="mt-2 text-sm font-bold">
            Bitmə tarixi: {{ new Date(authStore.user?.sellerProfile?.featuredUntil || '').toLocaleDateString('az-AZ') }}
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6">
      <div class="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8">
        <div class="flex items-center gap-3">
          <Rocket class="w-5 h-5 text-blue-600" />
          <div class="text-xl font-extrabold text-slate-900">Plan seçin</div>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink
            v-for="plan in plans"
            :key="plan.days"
            :to="`/seller/promotions/payment/${plan.days}`"
            class="rounded-[1.75rem] border p-5 text-left transition-all border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Plan</div>
                <div class="mt-2 text-2xl font-extrabold text-slate-900">{{ plan.label }}</div>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-amber-500">
                <Crown class="w-5 h-5" />
              </div>
            </div>
            <div class="mt-4 text-3xl font-extrabold text-blue-600">₼{{ Number(plan.price || 0).toFixed(2) }}</div>
            <div class="mt-2 text-sm font-medium text-slate-500">{{ sellerPromotion.featuredBadgeText || 'PRO' }} ikonuyla önə çıxır</div>
            <div class="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-blue-600">
              Ödəniş et
              <ArrowRight class="w-4 h-4" />
            </div>
          </NuxtLink>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
          <div class="flex items-center gap-3">
            <TimerReset class="w-5 h-5 text-emerald-600" />
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

        <div class="bg-white border border-slate-200 rounded-[2rem] p-6">
          <div class="text-xl font-extrabold text-slate-900">Sorğu tarixçəsi</div>
          <div class="mt-5 space-y-4">
            <div v-if="!requests.length" class="rounded-[1.5rem] border border-dashed border-slate-300 p-6 text-sm font-medium text-slate-500">
              Hələ önə çıxarma sorğusu göndərilməyib.
            </div>
            <div v-for="request in requests" :key="request.id" class="rounded-[1.5rem] border border-slate-200 p-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">{{ request.planLabel }}</div>
                  <div class="mt-1 text-xs font-medium text-slate-500">{{ new Date(request.submittedAt).toLocaleString('az-AZ') }}</div>
                </div>
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', request.status === 'Təsdiqləndi' ? 'bg-green-100 text-green-700' : request.status === 'Rədd edildi' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700']">
                  {{ request.status }}
                </span>
              </div>
              <div class="mt-3 text-lg font-extrabold text-blue-600">₼{{ Number(request.amount || 0).toFixed(2) }}</div>
              <div v-if="request.paymentNote" class="mt-2 text-sm font-medium text-slate-500">{{ request.paymentNote }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
