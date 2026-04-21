<script setup lang="ts">
import { LayoutDashboard, Package, ClipboardList, Store, LogOut, Rocket, Wallet } from 'lucide-vue-next'

const authStore = useAuthStore()
const route = useRoute()

const links = [
  { to: '/seller', label: 'Panel', icon: LayoutDashboard },
  { to: '/seller/products', label: 'Məhsullar', icon: Package },
  { to: '/seller/orders', label: 'Sifarişlər', icon: ClipboardList },
  { to: '/seller/payouts', label: 'Payouts', icon: Wallet },
  { to: '/seller/promotions', label: 'Önə çıxarma', icon: Rocket }
]

const logout = async () => {
  await authStore.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[var(--theme-bg,var(--color-background,#F8FAFC))] text-[var(--theme-text,var(--color-text,#0F172A))]">
    <div class="border-b border-[var(--theme-border,#E2E8F0)] bg-[var(--theme-surface,#FFFFFF)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:h-20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
        <div class="flex items-center gap-4 min-w-0">
          <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
            <Store class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <div class="text-lg font-extrabold text-[var(--theme-text,#0F172A)] truncate">{{ authStore.user?.sellerProfile?.shopName || 'Satıcı paneli' }}</div>
            <div class="text-sm font-medium text-[var(--theme-text-muted,#64748B)] truncate">{{ authStore.user?.email }}</div>
          </div>
        </div>

        <div class="hidden lg:flex items-center gap-2">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :class="[
              'px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2',
              route.path === link.to ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-[var(--theme-text,#334155)] hover:bg-[var(--theme-surface-soft,#E2E8F0)]'
            ]"
          >
            <component :is="link.icon" class="w-4 h-4" />
            {{ link.label }}
          </NuxtLink>
        </div>

        <div class="flex w-full lg:w-auto items-center justify-between lg:justify-end gap-4">
          <NuxtLink to="/" class="hidden sm:inline-flex px-4 py-3 rounded-2xl border border-[var(--theme-border,#E2E8F0)] text-sm font-bold text-[var(--theme-text,#334155)] hover:bg-[var(--theme-surface-soft,#E2E8F0)] transition-all">
            Sayta qayıt
          </NuxtLink>
          <button type="button" class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all" @click="logout">
            <LogOut class="w-4 h-4" />
            Çıxış
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="lg:hidden mb-6 flex flex-wrap gap-2">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="[
            'px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2',
            route.path === link.to ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-[var(--theme-surface,#FFFFFF)] text-[var(--theme-text,#334155)] border border-[var(--theme-border,#E2E8F0)]'
          ]"
        >
          <component :is="link.icon" class="w-4 h-4" />
          {{ link.label }}
        </NuxtLink>
      </div>

      <slot />
    </div>
  </div>
</template>
