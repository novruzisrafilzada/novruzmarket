<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data, pending, refresh } = await useFetch('/api/admin/homepage-analytics', {
  default: () => ({ totalSectionClicks: 0, totalAddToCarts: 0, sections: [] })
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Homepage Analytics</h1>
        <p class="mt-2 text-sm font-medium text-gray-500">Homepage blok klikləri və ən çox istifadə olunan giriş nöqtələri.</p>
      </div>
      <button type="button" class="px-5 py-3 rounded-2xl bg-[color:var(--color-primary,#2B3E95)] text-white font-extrabold" @click="refresh()">Yenilə</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Total clicks</div>
        <div class="mt-3 text-4xl font-extrabold text-gray-900">{{ data.totalSectionClicks }}</div>
      </div>
      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Add to cart</div>
        <div class="mt-3 text-4xl font-extrabold text-gray-900">{{ data.totalAddToCarts }}</div>
      </div>
      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:col-span-2">
        <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Aktiv bölmələr</div>
        <div class="mt-3 text-4xl font-extrabold text-gray-900">{{ data.sections.length }}</div>
      </div>
    </div>

    <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div class="text-lg font-extrabold text-gray-900">Section click breakdown</div>
      <div v-if="pending" class="mt-4 text-sm font-medium text-gray-500">Yüklənir...</div>
      <div v-else-if="!data.sections.length" class="mt-4 text-sm font-medium text-gray-500">Hələ homepage click datası yoxdur.</div>
      <div v-else class="mt-6 space-y-4">
        <div v-for="section in data.sections" :key="section.section" class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div class="text-base font-extrabold text-gray-900">{{ section.section }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-500">Son klik: {{ section.lastClickedAt || '-' }}</div>
                  <div class="mt-1 text-sm font-medium text-gray-500">Son add to cart: {{ section.lastAddedToCartAt || '-' }}</div>
            </div>
                <div class="text-right">
                  <div class="text-2xl font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ section.clicks }}</div>
                  <div class="mt-1 text-sm font-bold text-emerald-600">Cart: {{ section.addToCarts }}</div>
                </div>
          </div>
          <div v-if="section.topTargets.length" class="mt-4 flex flex-wrap gap-2">
            <span v-for="target in section.topTargets" :key="`${section.section}-${target.target}`" class="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-gray-700 border border-gray-200">
              {{ target.target }} · {{ target.count }}
            </span>
          </div>
              <div v-if="section.topCartTargets.length" class="mt-3 flex flex-wrap gap-2">
                <span v-for="target in section.topCartTargets" :key="`${section.section}-cart-${target.target}`" class="rounded-full bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                  Cart {{ target.target }} · {{ target.count }}
                </span>
              </div>
        </div>
      </div>
    </div>
  </div>
</template>
