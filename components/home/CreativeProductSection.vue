<script setup lang="ts">
defineProps<{
  badge?: string
  title: string
  subtitle?: string
  products: any[]
}>()
</script>

<template>
  <section v-if="products.length" class="container py-10">
    <div class="rounded-[2rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
      <HomeSectionHeading :eyebrow="badge" :title="title" :subtitle="subtitle">
        <template #actions>
          <NuxtLink to="/shop" class="text-sm font-extrabold text-blue-600 hover:underline">Hamısına bax</NuxtLink>
        </template>
      </HomeSectionHeading>
      <div class="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-4">
        <ProductCard
          v-for="item in products"
          :key="item.id"
          :product="item"
        />
      </div>
    </div>
  </section>
</template>
