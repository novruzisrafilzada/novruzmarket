<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Home, ShoppingBag, Heart, User, ShoppingCart } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'

const settingsStore = useSettingsStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const route = useRoute()
const { t } = useT()

const homeLayout = computed(() => Number((settingsStore.settings as any)?.design?.homeLayout || 1))
const useV4 = computed(() => homeLayout.value === 4 || homeLayout.value === 5 || homeLayout.value === 6)
const mobileExperience = computed(() => settingsStore.settings.mobileExperience || {
  enabled: true,
  compactTypography: true,
  stickyHeader: true,
  bottomTabBar: true,
  hideHeavyFooterOnMobile: true
})

const mobileTabItems = computed(() => [
  {
    key: 'home',
    label: String(t('nav_home')),
    to: '/',
    icon: Home,
    badge: 0,
    active: route.path === '/'
  },
  {
    key: 'shop',
    label: String(t('nav_shop')),
    to: '/shop',
    icon: ShoppingBag,
    badge: 0,
    active: route.path === '/shop' || route.path.startsWith('/shop/') || route.path.startsWith('/product/')
  },
  {
    key: 'wishlist',
    label: String(t('wishlist_label' as any)),
    to: '/wishlist',
    icon: Heart,
    badge: wishlistStore.totalItems,
    active: route.path === '/wishlist'
  },
  {
    key: 'cart',
    label: String(t('cart_label' as any)),
    to: '/cart',
    icon: ShoppingCart,
    badge: cartStore.totalItems,
    active: route.path === '/cart' || route.path === '/checkout'
  },
  {
    key: 'account',
    label: String(t('my_account_label' as any)),
    to: authStore.isLoggedIn ? '/profile' : '/login',
    icon: User,
    badge: 0,
    active: route.path === '/profile' || route.path === '/login' || route.path === '/signup' || route.path.startsWith('/seller')
  }
])

onMounted(() => {
  wishlistStore.hydrate()
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_16%,#ffffff_100%)] text-[color:var(--app-text,#1F2937)]">
    <TheHeader v-if="useV4" />
    <LayoutHeader v-else />
    <main :class="['flex-grow', mobileExperience.enabled && mobileExperience.bottomTabBar ? 'pb-24 md:pb-0' : 'pb-0']">
      <slot />
    </main>
    <div :class="mobileExperience.enabled && mobileExperience.hideHeavyFooterOnMobile ? 'hidden md:block' : 'block'">
      <TheFooter v-if="useV4" />
      <LayoutFooter v-else />
    </div>
    <nav v-if="mobileExperience.enabled && mobileExperience.bottomTabBar" class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/80 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-3 shadow-[0_-14px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur md:hidden">
      <div class="mx-auto grid max-w-xl grid-cols-5 gap-2">
        <NuxtLink
          v-for="item in mobileTabItems"
          :key="item.key"
          :to="item.to"
          :class="[
            'relative flex min-h-[56px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-all duration-200',
            item.active
              ? 'border-[color:var(--color-accent,#FACC15)] bg-[#FFF7CC] text-[color:var(--color-primary,#2B3E95)] shadow-[0_12px_24px_-20px_rgba(250,204,21,0.95)]'
              : 'border-transparent bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'
          ]"
        >
          <span
            v-if="item.badge > 0"
            class="absolute right-3 top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--color-accent,#FACC15)] px-1.5 text-[10px] font-extrabold text-[color:var(--color-primary,#2B3E95)]"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
          <component :is="item.icon" :class="mobileExperience.compactTypography ? 'h-[18px] w-[18px]' : 'h-5 w-5'" />
          <span :class="['mt-1 font-extrabold leading-none', mobileExperience.compactTypography ? 'text-[10px]' : 'text-[11px]']">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
