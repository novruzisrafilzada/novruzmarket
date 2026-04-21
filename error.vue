<script setup lang="ts">
import { ArrowLeft, RefreshCcw, ShieldAlert } from 'lucide-vue-next'

const props = defineProps<{
  error?: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const statusCode = computed(() => Number(props.error?.statusCode || 500))
const title = computed(() => statusCode.value === 404 ? 'Səhifə tapılmadı' : 'Bir xəta baş verdi')
const description = computed(() => props.error?.statusMessage || props.error?.message || 'Sistem gözlənilməz xəta ilə qarşılaşdı.')

const handleHome = async () => {
  await clearError({ redirect: '/' })
}

const handleRetry = async () => {
  await clearError({ redirect: useRoute().fullPath })
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,#eef4ff_0%,#ffffff_48%,#f8fafc_100%)]">
    <div class="container min-h-screen flex items-center justify-center py-16">
      <div class="w-full max-w-3xl rounded-[2.5rem] border border-gray-100 bg-white/95 backdrop-blur shadow-[0_30px_100px_rgba(15,23,42,0.08)] p-8 sm:p-12 text-center">
        <div class="mx-auto w-20 h-20 rounded-[1.8rem] bg-blue-50 text-blue-600 flex items-center justify-center">
          <ShieldAlert class="w-10 h-10" />
        </div>
        <div class="mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-blue-600">Error {{ statusCode }}</div>
        <h1 class="mt-4 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">{{ title }}</h1>
        <p class="mt-4 max-w-2xl mx-auto text-sm sm:text-base font-medium leading-7 text-gray-500">{{ description }}</p>
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all" @click="handleRetry">
            <RefreshCcw class="w-4 h-4" />
            Yenidən yoxla
          </button>
          <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-700 transition-all" @click="handleHome">
            <ArrowLeft class="w-4 h-4" />
            Ana səhifəyə qayıt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
