<script setup lang="ts">
defineProps<{
  audienceLabel: string
  blocks: Array<{ title: string; subtitle: string; cta: string; href: string; image: string }>
}>()
</script>

<template>
  <section v-if="blocks.length" class="container py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <NuxtLink
        v-for="(block, index) in blocks"
        :key="index"
        :to="block.href || '/shop'"
        class="group relative overflow-hidden rounded-[2rem] min-h-[280px] border border-gray-100 shadow-sm"
      >
        <img :src="block.image" :alt="block.title" class="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-transparent"></div>
        <div class="relative z-10 h-full flex flex-col justify-end p-8 text-white">
          <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-blue-200">{{ audienceLabel }}</div>
          <div class="mt-3 text-3xl font-extrabold tracking-tight max-w-xl">{{ block.title }}</div>
          <div class="mt-3 text-sm font-medium text-white/80 max-w-lg">{{ block.subtitle }}</div>
          <div class="mt-6 inline-flex w-fit items-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 transition-all group-hover:bg-blue-50">
            {{ block.cta }}
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
