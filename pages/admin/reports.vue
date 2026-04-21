<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BarChart3, Clock3, Eye, MousePointerClick, RefreshCw, ShoppingBag, Users, Wallet, Globe2 } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const { formatMoney } = useMoney()
const toastStore = useToastStore()
const loading = ref(false)
const resetting = ref(false)
const report = ref<any>(null)

const formatStay = (seconds: number) => {
  const safeSeconds = Math.max(0, Number(seconds || 0))
  if (safeSeconds >= 60) {
    const minutes = Math.floor(safeSeconds / 60)
    const remainder = safeSeconds % 60
    return `${minutes} dəq ${remainder} san`
  }
  return `${safeSeconds} san`
}

const formatDurationMs = (durationMs: number) => formatStay(Math.round(Number(durationMs || 0) / 1000))

const loadReport = async () => {
  loading.value = true
  try {
    report.value = await $fetch('/api/admin/reports-summary')
  } finally {
    loading.value = false
  }
}

const resetLaunchData = async () => {
  if (!confirm('Bütün hesabat göstəriciləri, sifarişlər, məhsul baxışları və satılan sayları sıfırlansın?')) return
  resetting.value = true
  try {
    const result = await $fetch<{ clearedOrders: number; resetProducts: number; cleanedTempFiles: number }>('/api/admin/reports/reset', { method: 'POST' })
    await loadReport()
    toastStore.success(`${result.clearedOrders} sifariş və bütün launch statistikaları sıfırlandı`)
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Statistikalar sıfırlanmadı')
  } finally {
    resetting.value = false
  }
}

const statCards = computed(() => {
  const totals = report.value?.totals || {}
  return [
    { label: 'Sifariş sayı', value: Number(totals.orderCount || 0), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Dövriyyə', value: formatMoney(Number(totals.revenue || 0)), icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Məhsul baxışı', value: Number(totals.totalProductViews || 0), icon: Eye, color: 'text-amber-600 bg-amber-50' },
    { label: 'Sayt girişləri', value: Number(totals.totalVisits || 0), icon: Users, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Unikal ziyarətçi', value: Number(totals.uniqueVisitors || 0), icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Aktiv sessiyalar', value: Number(totals.uniqueSessions || 0), icon: BarChart3, color: 'text-rose-600 bg-rose-50' },
    { label: 'Orta qalma müddəti', value: formatStay(Number(totals.avgStaySeconds || 0)), icon: Clock3, color: 'text-violet-600 bg-violet-50' },
    { label: 'Konversiya', value: `%${Number(totals.conversionRate || 0)}`, icon: MousePointerClick, color: 'text-emerald-600 bg-emerald-50' }
  ]
})

onMounted(loadReport)
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Hesabatlar</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Məhsul baxışı, ziyarətçi axını, qalma müddəti, ən aktiv səhifələr və sifariş dövriyyəsi buradan izlənir.</p>
        <p v-if="report?.totals?.lastVisitAt" class="text-xs font-bold text-gray-400 mt-3 uppercase tracking-widest">
          Son ziyarət: {{ new Date(report.totals.lastVisitAt).toLocaleString('az-AZ') }}
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700 transition-all hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="resetting"
        @click="resetLaunchData"
      >
        <RefreshCw class="w-4 h-4" :class="resetting ? 'animate-spin' : ''" />
        {{ resetting ? 'Sıfırlanır...' : 'Launch statistikalarını sıfırla' }}
      </button>
    </div>

    <div v-if="loading" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 text-sm font-medium text-gray-500">
      Hesabatlar yüklənir...
    </div>

    <template v-else-if="report">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
        <div v-for="card in statCards" :key="card.label" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="text-sm font-bold text-gray-500">{{ card.label }}</div>
              <div class="mt-3 text-3xl font-extrabold text-gray-900">{{ card.value }}</div>
            </div>
            <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center', card.color]">
              <component :is="card.icon" class="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex items-center gap-3">
            <Eye class="w-5 h-5 text-blue-600" />
            <div class="text-2xl font-extrabold text-gray-900">Ən çox baxılan məhsullar</div>
          </div>
          <div class="p-8 space-y-4">
            <div v-for="product in report.topProducts" :key="product.id" class="rounded-[1.5rem] border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="text-sm font-extrabold text-gray-900 truncate">{{ product.name }}</div>
                <div class="mt-1 text-xs font-medium text-gray-400">{{ product.productCode || product.id }}</div>
              </div>
              <div class="text-lg font-extrabold text-blue-600">{{ product.viewCount || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex items-center gap-3">
            <BarChart3 class="w-5 h-5 text-violet-600" />
            <div class="text-2xl font-extrabold text-gray-900">Ən çox baxılan səhifələr</div>
          </div>
          <div class="p-8 space-y-4">
            <div v-for="page in report.topPages" :key="page.path" class="rounded-[1.5rem] border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div class="text-sm font-bold text-gray-700 truncate">{{ page.path }}</div>
              <div class="text-lg font-extrabold text-violet-600">{{ page.views }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex items-center gap-3">
            <Globe2 class="w-5 h-5 text-cyan-600" />
            <div class="text-2xl font-extrabold text-gray-900">Giriş mənbələri</div>
          </div>
          <div class="p-8 space-y-4">
            <div v-for="source in report.topSources" :key="source.source" class="rounded-[1.5rem] border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div class="text-sm font-bold text-gray-700 truncate">{{ source.source }}</div>
              <div class="text-lg font-extrabold text-cyan-600">{{ source.views }}</div>
            </div>
            <div v-if="!report.topSources?.length" class="rounded-[1.5rem] border border-dashed border-gray-200 p-4 text-sm font-medium text-gray-500">
              Hələ source məlumatı toplanmayıb.
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex items-center gap-3">
            <Users class="w-5 h-5 text-indigo-600" />
            <div class="text-2xl font-extrabold text-gray-900">Referrer-lər</div>
          </div>
          <div class="p-8 space-y-4">
            <div v-for="referrer in report.topReferrers" :key="referrer.referrer" class="rounded-[1.5rem] border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div class="text-sm font-bold text-gray-700 truncate">{{ referrer.referrer }}</div>
              <div class="text-lg font-extrabold text-indigo-600">{{ referrer.views }}</div>
            </div>
            <div v-if="!report.topReferrers?.length" class="rounded-[1.5rem] border border-dashed border-gray-200 p-4 text-sm font-medium text-gray-500">
              Hələ referrer məlumatı toplanmayıb.
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex items-center gap-3">
            <MousePointerClick class="w-5 h-5 text-emerald-600" />
            <div class="text-2xl font-extrabold text-gray-900">UTM kampaniyaları</div>
          </div>
          <div class="p-8 space-y-4">
            <div v-for="campaign in report.topCampaigns" :key="campaign.campaign" class="rounded-[1.5rem] border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div class="text-sm font-bold text-gray-700 truncate">{{ campaign.campaign }}</div>
              <div class="text-lg font-extrabold text-emerald-600">{{ campaign.views }}</div>
            </div>
            <div v-if="!report.topCampaigns?.length" class="rounded-[1.5rem] border border-dashed border-gray-200 p-4 text-sm font-medium text-gray-500">
              UTM kampaniya datası hələ gəlməyib.
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex items-center gap-3">
          <Clock3 class="w-5 h-5 text-indigo-600" />
          <div class="text-2xl font-extrabold text-gray-900">Ən çox vaxt keçirilən səhifələr</div>
        </div>
        <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="page in report.topDurationPages" :key="`${page.path}-duration`" class="rounded-[1.5rem] border border-gray-100 p-4 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="text-sm font-bold text-gray-700 truncate">{{ page.path }}</div>
              <div class="mt-1 text-xs font-medium text-gray-400">Qalınan vaxt</div>
            </div>
            <div class="text-lg font-extrabold text-indigo-600">{{ formatDurationMs(page.durationMs) }}</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex items-center gap-3">
          <ShoppingBag class="w-5 h-5 text-emerald-600" />
          <div class="text-2xl font-extrabold text-gray-900">Son sifarişlər</div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th class="px-8 py-4">Sifariş</th>
                <th class="px-8 py-4">Tracking</th>
                <th class="px-8 py-4">Müştəri</th>
                <th class="px-8 py-4">Məbləğ</th>
                <th class="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="order in report.latestOrders" :key="order.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-8 py-6 text-sm font-bold text-blue-600">{{ order.id }}</td>
                <td class="px-8 py-6 text-sm font-extrabold text-gray-900">{{ order.trackingCode || '-' }}</td>
                <td class="px-8 py-6 text-sm text-gray-600 font-medium">{{ order.customer }}</td>
                <td class="px-8 py-6 text-sm font-extrabold text-gray-900">{{ formatMoney(order.amount) }}</td>
                <td class="px-8 py-6">
                  <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', order.statusColor]">{{ order.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
