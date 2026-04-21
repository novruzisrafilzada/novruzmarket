<script setup lang="ts">
const failedBrandIds = ref<number[]>([])

const markBrandFailed = (id: number) => {
  if (!failedBrandIds.value.includes(id)) failedBrandIds.value.push(id)
}

defineProps<{
  brands: Array<{
    id: number
    name: string
    logo: string
  }>
}>()
</script>

<template>
  <div v-if="brands.length" class="container py-12 sm:py-14">
    <div class="rounded-[2.25rem] border border-gray-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 p-5 sm:p-7">
      <div class="mb-6">
        <HomeSectionHeading eyebrow="Brendlər" title="Etibar etdiyimiz markalar" subtitle="Rəsmi və seçilmiş partnyor logoları" />
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div v-for="brand in brands" :key="brand.id" class="group rounded-[1.5rem] border border-white bg-white/90 shadow-sm px-4 py-5 flex items-center justify-center min-h-[92px] hover:-translate-y-0.5 hover:shadow-md transition-all">
          <img v-if="brand.logo && !failedBrandIds.includes(brand.id)" :src="brand.logo" :alt="brand.name" class="h-10 sm:h-12 object-contain grayscale-[0.2] opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" @error="markBrandFailed(brand.id)" />
          <span v-else class="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold tracking-[0.2em] text-slate-700 uppercase">{{ brand.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
