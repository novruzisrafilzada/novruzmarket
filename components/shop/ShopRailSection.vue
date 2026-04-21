<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  products: any[]
}>()
</script>

<template>
  <section class="rounded-[2rem] border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
    <div class="flex items-center justify-between gap-4">
      <div>
        <div class="text-xl font-extrabold text-gray-900">{{ title }}</div>
        <div v-if="subtitle" class="mt-2 text-sm font-medium text-gray-500">{{ subtitle }}</div>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-px bg-gray-200 xl:grid-cols-4">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>
