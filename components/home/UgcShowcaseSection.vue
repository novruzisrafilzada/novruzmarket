<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  cards: Array<{ creator: string; handle: string; text: string; image: string; href: string }>
}>()
</script>

<template>
  <section v-if="cards.length" class="container py-10">
    <div class="rounded-[2rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
      <div class="max-w-2xl">
        <HomeSectionHeading eyebrow="İlham vitrini" :title="title" :subtitle="subtitle" />
      </div>
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <NuxtLink v-for="(card, index) in cards" :key="index" :to="card.href || '/shop'" class="group rounded-[1.8rem] overflow-hidden border border-gray-100 bg-gray-50">
          <img :src="card.image" :alt="card.creator" class="w-full h-64 object-cover transition-all duration-500 group-hover:scale-105" />
          <div class="p-5">
            <div class="text-sm font-extrabold text-gray-900">{{ card.creator }}</div>
            <div class="mt-1 text-xs font-bold uppercase tracking-widest text-blue-600">{{ card.handle }}</div>
            <div class="mt-3 text-sm font-medium text-gray-500">{{ card.text }}</div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
