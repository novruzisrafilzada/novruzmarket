<script setup lang="ts">
import { computed } from 'vue'
import { useHomeSectionsStore } from '~/stores/homeSections'
import { useProductStore } from '~/stores/products'

const homeStore = useHomeSectionsStore()
const productStore = useProductStore()
const { lang, t } = useT()
const { styleVars } = useHomeCardUi(homeStore)

const title = computed(() => {
  const l = lang.value
  return homeStore.config?.topProducts?.titleI18n?.[l] || homeStore.config?.topProducts?.titleI18n?.az || 'Top Məhsullar'
})

const items = computed(() => {
  const ids = homeStore.config?.topProducts?.productIds || []
  const picked = ids
    .map((id: number) => productStore.getProductById(id))
    .filter(Boolean) as any[]
  if (picked.length > 0) return picked.slice(0, 8)
  return [...productStore.products]
    .sort((a: any, b: any) => (Number(b.sold) || 0) - (Number(a.sold) || 0))
    .slice(0, 8)
})

</script>

<template>
  <div v-if="homeStore.config?.topProducts?.enabled && items.length" class="container py-16" :style="styleVars">
    <div class="mb-8">
      <HomeSectionHeading eyebrow="Seçilmiş məhsullar" :title="title">
        <template #actions>
          <NuxtLink to="/shop" class="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 hover:text-gray-900 transition-colors">
            {{ t('discover_now' as any) }}
          </NuxtLink>
        </template>
      </HomeSectionHeading>
    </div>
    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <ProductCard v-for="p in items" :key="p.id" :product="p" tracking-section="topProducts" />
    </div>
  </div>
</template>
