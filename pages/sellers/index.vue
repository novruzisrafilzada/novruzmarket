<script setup lang="ts">
import { Store, Package, Boxes } from 'lucide-vue-next'

const { data: sellers } = await useFetch('/api/sellers', {
  default: () => []
})
</script>

<template>
  <div class="bg-[var(--theme-bg,var(--color-background,#F8FAFC))] py-16 md:py-24">
    <div class="container">
      <div class="max-w-3xl">
        <div class="text-xs font-extrabold uppercase tracking-[0.28em] text-blue-600">Satıcılar</div>
        <h1 class="mt-4 text-4xl md:text-5xl font-extrabold text-[var(--theme-text,#0F172A)] tracking-tight">Platformada satış edən mağazalar</h1>
        <p class="mt-4 text-[var(--theme-text-muted,#64748B)] text-lg font-medium">Qeydiyyatdan keçən satıcılar burada görünür. Mağazaya daxil olub məhsullarını görə bilərsiniz.</p>
      </div>

      <div class="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <NuxtLink
          v-for="seller in sellers"
          :key="seller.id"
          :to="`/sellers/${seller.id}`"
          class="bg-[var(--theme-surface,#FFFFFF)] rounded-[2rem] border border-[var(--theme-border,#E5E7EB)] p-7 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.24em] text-blue-600">Satıcı</div>
              <div class="mt-2 text-2xl font-extrabold text-[var(--theme-text,#0F172A)] leading-tight">{{ seller.shopName }}</div>
              <div class="mt-2 text-sm font-medium text-[var(--theme-text-muted,#64748B)]">{{ seller.name }}</div>
              <div v-if="seller.categoryNames?.length" class="mt-4 flex flex-wrap gap-2">
                <span v-for="categoryName in seller.categoryNames.slice(0, 3)" :key="`${seller.id}-${categoryName}`" class="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold text-blue-700">
                  {{ categoryName }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden border border-blue-100">
                <img v-if="seller.profileImage" :src="seller.profileImage" alt="" class="w-full h-full object-cover" />
                <Store v-else class="w-7 h-7" />
              </div>
              <span v-if="seller.isFeatured" class="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                {{ seller.featuredBadgeText || 'PRO' }}
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-[var(--theme-surface-soft,#F8FAFC)] px-4 py-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--theme-text-muted,#94A3B8)]">Məhsul</div>
              <div class="mt-2 text-2xl font-extrabold text-[var(--theme-text,#0F172A)]">{{ seller.productCount }}</div>
            </div>
            <div class="rounded-2xl bg-[var(--theme-surface-soft,#F8FAFC)] px-4 py-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--theme-text-muted,#94A3B8)]">Stok</div>
              <div class="mt-2 text-2xl font-extrabold text-[var(--theme-text,#0F172A)]">{{ seller.stockTotal }}</div>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-5 text-sm font-bold text-[var(--theme-text-muted,#64748B)]">
            <span class="inline-flex items-center gap-2"><Package class="w-4 h-4" /> Aktiv satıcı</span>
            <span class="inline-flex items-center gap-2"><Boxes class="w-4 h-4" /> Mağazaya bax</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
