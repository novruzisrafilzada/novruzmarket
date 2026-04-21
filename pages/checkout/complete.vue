<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const loading = ref(true)
const message = ref('Ödəniş təsdiqlənir...')

onMounted(async () => {
  const sessionId = String(route.query.session_id || '').trim()
  if (!sessionId) {
    toastStore.error('Ödəniş sessiyası tapılmadı')
    router.replace('/checkout')
    return
  }

  try {
    const result = await $fetch<{ trackingCode?: string; orderId: string; email: string }>('/api/payments/confirm', {
      method: 'POST',
      body: { sessionId }
    })
    toastStore.success('Ödəniş uğurla tamamlandı')
    await router.replace({
      path: '/order-tracking',
      query: {
        trackingCode: result.trackingCode || '',
        email: result.email || ''
      }
    })
  } catch (error: any) {
    message.value = error?.data?.message || 'Ödəniş təsdiqlənə bilmədi'
    toastStore.error(message.value)
    window.setTimeout(() => {
      router.replace('/checkout')
    }, 1200)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-[70vh] bg-gray-50/60 flex items-center justify-center px-4">
    <div class="w-full max-w-xl rounded-[2.5rem] border border-gray-100 bg-white shadow-xl p-10 text-center">
      <div class="w-20 h-20 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-black">
        {{ loading ? '...' : '✓' }}
      </div>
      <h1 class="mt-6 text-3xl font-extrabold text-gray-900">Kart ödənişi</h1>
      <p class="mt-3 text-base font-medium text-gray-500">{{ message }}</p>
    </div>
  </div>
</template>
