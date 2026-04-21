<script setup lang="ts">
import { useProductStore } from '~/stores/products'

const productStore = useProductStore()

const mainProduct = computed(() => productStore.products.find(p => p.id === 1) || productStore.products[0])

const otherProducts = computed(() => productStore.products.slice(1, 5))
const items = computed(() => [mainProduct.value, ...otherProducts.value].filter(Boolean))
</script>

<template>
  <div v-if="items.length" class="container py-16">
    <div class="grid grid-cols-2 gap-4 xl:grid-cols-5">
      <ProductCard
        v-for="product in items"
        :key="product.id"
        :product="product"
        tracking-section="featuredProduct"
      />
    </div>
  </div>
</template>
