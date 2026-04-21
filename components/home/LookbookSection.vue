<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  blocks: Array<{ title: string; subtitle: string; image: string; href: string }>
}>()
</script>

<template>
  <section v-if="blocks.length" class="container py-10">
    <div class="rounded-[2rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
      <div class="max-w-2xl">
        <HomeSectionHeading eyebrow="Stil vitrini" :title="title" :subtitle="subtitle" />
      </div>
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <NuxtLink v-for="(block, index) in blocks" :key="index" :to="block.href || '/shop'" class="group rounded-[1.8rem] overflow-hidden border border-gray-100 bg-gray-50">
          <img :src="block.image" :alt="block.title" class="w-full h-72 object-cover transition-all duration-500 group-hover:scale-105" />
          <div class="p-6">
            <div class="text-xl font-extrabold text-gray-900">{{ block.title }}</div>
            <div class="mt-2 text-sm font-medium text-gray-500">{{ block.subtitle }}</div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
