<script setup lang="ts">
defineProps<{
  promo: {
    enabled?: boolean
    title?: string
    subtitle?: string
    androidLink?: string
    iosLink?: string
    image?: string
  }
}>()
</script>

<template>
  <div v-if="promo?.enabled" class="container py-16">
    <div class="relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-3xl bg-blue-600 p-12 lg:flex-row">
      <div class="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl" />
      <div class="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl" />

      <div class="relative z-10 lg:w-1/2 text-white">
        <h2 class="mb-6 text-4xl font-extrabold leading-tight">{{ promo.title }}</h2>
        <p class="mb-10 text-lg leading-relaxed text-blue-100">{{ promo.subtitle }}</p>
        <div class="flex flex-wrap gap-4">
          <a :href="promo.androidLink" class="inline-flex items-center rounded-xl bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-gray-900 shadow-lg transition-all hover:bg-gray-100">
            Android
          </a>
          <a :href="promo.iosLink" class="inline-flex items-center rounded-xl border border-gray-800 bg-gray-900 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-black">
            iOS
          </a>
        </div>
      </div>

      <div class="relative z-10 flex justify-center lg:w-1/2">
        <img :src="promo.image" :alt="promo.title || 'App promo'" class="w-64 rounded-[3rem] border-8 border-gray-900 shadow-2xl transition-transform duration-500 hover:rotate-0 rotate-6" />
      </div>
    </div>
  </div>
</template>
