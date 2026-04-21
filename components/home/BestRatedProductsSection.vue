<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'

const homeStore = useHomeSectionsStore()
const productStore = useProductStore()
const { lang } = useT()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}
if (!productStore.hydrated) {
  await productStore.fetchProducts()
}

const section = computed(() => homeStore.config?.bestRatedProducts)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Ən yüksək reytinqli məhsullar')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
const items = computed(() =>
  productStore.products
    .filter((item: any) => item.status === 'Aktiv')
    .slice()
    .sort((a: any, b: any) => {
      if (Number(b.rating || 0) !== Number(a.rating || 0)) return Number(b.rating || 0) - Number(a.rating || 0)
      if (Number(b.reviewCount || 0) !== Number(a.reviewCount || 0)) return Number(b.reviewCount || 0) - Number(a.reviewCount || 0)
      if (Number(b.sold || 0) !== Number(a.sold || 0)) return Number(b.sold || 0) - Number(a.sold || 0)
      return Number(a.price || 0) - Number(b.price || 0)
    })
    .slice(0, Math.max(1, Number(section.value?.limit || 8)))
)
</script>

<template>
  <div v-if="section?.enabled && items.length" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading :title="title" :subtitle="subtitle">
        <template #actions>
          <NuxtLink to="/shop?sort=rating_desc" class="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 hover:text-gray-900 transition-colors">
            Hamısına bax
          </NuxtLink>
        </template>
      </HomeSectionHeading>
    </div>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      <ProductCard v-for="product in items" :key="product.id" :product="product" tracking-section="bestRatedProducts" />
    </div>
  </div>
</template>
