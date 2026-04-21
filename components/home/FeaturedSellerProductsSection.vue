<script setup lang="ts">
import { getVisibleSellerProducts } from '~/utils/seller-products'

const homeStore = useHomeSectionsStore()
const { lang } = useT()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const { data: productsData } = await useFetch('/api/products', {
  default: () => []
})

const section = computed(() => homeStore.config?.sellerProducts)
const sellerProducts = computed(() =>
  getVisibleSellerProducts(productsData.value as any[] || [], Number(section.value?.limit || 8))
)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Seçilmiş satıcı məhsulları')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
</script>

<template>
  <div v-if="section?.enabled && sellerProducts.length" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading eyebrow="Satıcı məhsulları" :title="title" :subtitle="subtitle">
        <template #actions>
          <NuxtLink to="/shop" class="text-sm font-extrabold text-blue-600 hover:underline">Mağazaya keç</NuxtLink>
        </template>
      </HomeSectionHeading>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <ProductCard v-for="product in sellerProducts" :key="product.id" :product="product" tracking-section="sellerProducts" />
    </div>
  </div>
</template>
