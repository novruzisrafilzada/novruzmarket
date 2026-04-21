<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { 
  Phone, 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu, 
  ChevronDown,
  ChevronUp,
  LogOut,
  Settings,
  Store,
  Moon,
  Sun,
  X
} from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'
import { usePageStore } from '~/stores/pages'
import { useCategoryStore, type Category } from '~/stores/categories'
import { buildProductHref } from '~/utils/product-route'

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { themeMode, applyThemeMode } = useThemeMode()
const { settings } = storeToRefs(settingsStore)
const pageStore = usePageStore()
const categoryStore = useCategoryStore()
const { formatMoney } = useMoney()
const { t, lang } = useT()
const { adminPath } = useAdminPortal()
const { rootCategories, childrenByParent, labelOf, getChildren } = useCategoryTree()
const { iconFor, cardStyleFor, iconWrapStyleFor, iconColorStyleFor } = useCategoryPresentation()

const languageOptions = [
  { code: 'az', labelKey: 'lang_az' },
  { code: 'ru', labelKey: 'lang_ru' },
  { code: 'en', labelKey: 'lang_en' },
] as const

const isDeptOpen = ref(false)
const isLangOpen = ref(false)
const isAccountOpen = ref(false)
const isPagesOpen = ref(false)
const isSellerNavOpen = ref(false)
const isMobileMenuOpen = ref(false)
const isMobileDeptOpen = ref(false)
const activeDeptParentId = ref<number | null>(null)
const activeDeptChildId = ref<number | null>(null)
const mobileExpandedParentId = ref<number | null>(null)
const mobileExpandedChildId = ref<number | null>(null)
const clientReady = ref(false)
const route = useRoute()

const searchQuery = ref('')
const isSearchOpen = ref(false)
const activeSearchCategoryId = ref<number | null>(null)
const searchSuggestions = ref<any[]>([])
const popularSearchTerms = ref<string[]>([])
const searchLoading = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const currentLangLabel = computed(() => {
  const opt = languageOptions.find(o => o.code === lang.value) || languageOptions[0]
  return t(opt.labelKey as any)
})
const mobileExperience = computed(() => settings.value.mobileExperience || {
  enabled: true,
  compactTypography: true,
  stickyHeader: true,
  bottomTabBar: true,
  hideHeavyFooterOnMobile: true,
  catalogHelperHeadings: false
})
const showCatalogHelperHeadings = computed(() => Boolean(mobileExperience.value.catalogHelperHeadings))

const isShopRoute = computed(() => route.path.startsWith('/shop'))

const navPages = computed(() => {
  const excluded = new Set(['', 'home', 'about', 'shop', 'blog'])
  return pageStore.pages.filter(p => p.status === 'Aktiv' && !excluded.has(String(p.slug || '').toLowerCase()))
})

const sellerNavItems = computed(() => {
  const items = [
    { label: 'Bütün satıcılar', to: '/sellers' },
    { label: 'Satıcı ol', to: '/seller/register' }
  ]

  if (authStore.isLoggedIn && authStore.user?.role === 'Satıcı') {
    items.push(
      { label: 'Satıcı paneli', to: '/seller' },
      { label: 'Məhsullarım', to: '/seller/products' },
      { label: 'Sifarişlər', to: '/seller/orders' },
      { label: 'Ödənişlər', to: '/seller/payouts' }
    )
  }

  return items
})

const categoryLabel = (c: Category) => labelOf(c)

const parentCategories = computed(() => rootCategories.value)

watchEffect(() => {
  if (activeDeptParentId.value === null && parentCategories.value.length > 0) {
    activeDeptParentId.value = parentCategories.value[0].id
  }
  if (activeDeptParentId.value !== null) {
    const children = getChildren(activeDeptParentId.value)
    const currentExists = children.some(item => item.id === activeDeptChildId.value)
    activeDeptChildId.value = currentExists ? activeDeptChildId.value : (children[0]?.id ?? null)
  }
})

watch(
  () => route.fullPath,
  () => {
    isDeptOpen.value = false
    isMobileDeptOpen.value = false
    isMobileMenuOpen.value = false
    isPagesOpen.value = false
    isSellerNavOpen.value = false
    isSearchOpen.value = false
    mobileExpandedParentId.value = null
    mobileExpandedChildId.value = null
    activeDeptChildId.value = null
  }
)

const activeDeptChildren = computed(() => {
  if (!activeDeptParentId.value) return []
  return childrenByParent.value.get(activeDeptParentId.value) || []
})

const activeDeptParent = computed(() => {
  if (!activeDeptParentId.value) return null
  return parentCategories.value.find(p => p.id === activeDeptParentId.value) || null
})

const activeDeptGrandchildren = computed(() => {
  if (!activeDeptChildId.value) return []
  return getChildren(activeDeptChildId.value)
})

const activeDeptChild = computed(() => {
  if (!activeDeptChildId.value) return null
  return activeDeptChildren.value.find(child => child.id === activeDeptChildId.value) || null
})

const activeDeptCollections = computed(() =>
  activeDeptChildren.value.slice(0, 6).map((category) => {
    const items = getChildren(category.id)
    return {
      category,
      items: items.slice(0, 4),
      total: items.length
    }
  })
)

const activeDeptHighlights = computed(() => {
  if (activeDeptGrandchildren.value.length > 0) {
    return activeDeptGrandchildren.value.slice(0, 8)
  }
  return activeDeptChildren.value.slice(0, 8)
})

const activeDeptTargetId = computed(() => activeDeptChild.value?.id ?? activeDeptParent.value?.id ?? null)

const countNestedItems = (categoryId: number | null | undefined) => {
  if (categoryId === null || categoryId === undefined) return 0
  const children = getChildren(categoryId)
  return children.reduce((total, child) => total + 1 + getChildren(child.id).length, 0)
}

const goToCategory = (id: number) => {
  navigateTo({ path: '/shop', query: { categoryId: String(id) } })
  isDeptOpen.value = false
  isMobileMenuOpen.value = false
  isMobileDeptOpen.value = false
}

const goToAllCategories = () => {
  navigateTo({ path: '/shop' })
  isDeptOpen.value = false
  isMobileMenuOpen.value = false
  isMobileDeptOpen.value = false
}

const openDepartmentCatalog = () => {
  if (isShopRoute.value) {
    isDeptOpen.value = false
    if (process.client) {
      const target = document.getElementById('shop-category-sidebar')
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    goToAllCategories()
    return
  }
  isDeptOpen.value = !isDeptOpen.value
  if (isDeptOpen.value && activeDeptParentId.value === null && parentCategories.value.length > 0) {
    activeDeptParentId.value = parentCategories.value[0].id
  }
}

const closeSearch = () => {
  isSearchOpen.value = false
}

const blurSearchInput = () => {
  if (!process.client) return
  searchInputRef.value?.blur()
}

const submitSearch = () => {
  const q = searchQuery.value.trim()
  if (!q) {
    closeSearch()
    blurSearchInput()
    return
  }
  navigateTo({
    path: '/shop',
    query: {
      q,
      ...(activeSearchCategoryId.value ? { categoryId: String(activeSearchCategoryId.value) } : {})
    }
  })
  closeSearch()
  blurSearchInput()
}

const loadPopularSearches = async () => {
  if (!settings.value.creativeSuite?.popularSearchesEnabled) {
    popularSearchTerms.value = []
    return
  }
  try {
    popularSearchTerms.value = await $fetch('/api/search/popular', {
      query: { limit: 6 }
    })
  } catch {
    popularSearchTerms.value = []
  }
}

const openSuggestion = async () => {
  isSearchOpen.value = true
  if (!searchQuery.value.trim()) {
    await loadPopularSearches()
  }
}

const handleSearchBlur = () => {
  if (!process.client) return
  window.setTimeout(() => {
    closeSearch()
  }, 120)
}

const selectSuggestion = (p: any) => {
  navigateTo(buildProductHref(p))
  searchQuery.value = ''
  closeSearch()
  blurSearchInput()
}

const selectPopularSearch = (term: string) => {
  searchQuery.value = term
  submitSearch()
}

watch([searchQuery, activeSearchCategoryId], () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  const q = searchQuery.value.trim()
  if (!q) {
    searchSuggestions.value = []
    void loadPopularSearches()
    searchLoading.value = false
    return
  }
  popularSearchTerms.value = []
  searchDebounceTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      searchSuggestions.value = await $fetch('/api/search/products', {
        query: {
          q,
          categoryId: activeSearchCategoryId.value || undefined,
          limit: 8,
          track: 'false'
        }
      })
    } catch {
      searchSuggestions.value = []
    } finally {
      searchLoading.value = false
    }
  }, 180)
})

const toggleLang = () => {
  isLangOpen.value = !isLangOpen.value
  if (isLangOpen.value) {
    isAccountOpen.value = false
  }
}

const setLang = (code: 'az' | 'ru' | 'en') => {
  settingsStore.setSettings({ language: code as any })
  isLangOpen.value = false
}

const toggleAccount = () => {
  isAccountOpen.value = !isAccountOpen.value
  if (isAccountOpen.value) isLangOpen.value = false
}

const togglePages = () => {
  isPagesOpen.value = !isPagesOpen.value
  if (isPagesOpen.value) isSellerNavOpen.value = false
}

const toggleSellerNav = () => {
  isSellerNavOpen.value = !isSellerNavOpen.value
  if (isSellerNavOpen.value) isPagesOpen.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isDeptOpen.value = false
    isMobileDeptOpen.value = false
    isLangOpen.value = false
    isAccountOpen.value = false
    isPagesOpen.value = false
    isSellerNavOpen.value = false
    mobileExpandedParentId.value = null
    mobileExpandedChildId.value = null
  }
}

const toggleMobileDept = () => {
  isMobileDeptOpen.value = !isMobileDeptOpen.value
  if (isMobileDeptOpen.value) {
    isMobileMenuOpen.value = false
    isLangOpen.value = false
    isAccountOpen.value = false
    isPagesOpen.value = false
    isSellerNavOpen.value = false
    mobileExpandedParentId.value = null
    mobileExpandedChildId.value = null
  }
}

const toggleMobileParent = (id: number) => {
  const next = mobileExpandedParentId.value === id ? null : id
  mobileExpandedParentId.value = next
  mobileExpandedChildId.value = null
}

const toggleMobileChild = (id: number) => {
  mobileExpandedChildId.value = mobileExpandedChildId.value === id ? null : id
}

const logout = async () => {
  await authStore.logout()
  isAccountOpen.value = false
  await navigateTo('/')
}

const onDocClick = () => {
  isDeptOpen.value = false
  isMobileDeptOpen.value = false
  isLangOpen.value = false
  isAccountOpen.value = false
  isPagesOpen.value = false
  isSellerNavOpen.value = false
  isMobileMenuOpen.value = false
  closeSearch()
  blurSearchInput()
}

if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}
if (!pageStore.hydrated || pageStore.pages.length === 0) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const pages = await fetcher('/api/pages')
    pageStore.setPages(pages as any)
  } else {
    await pageStore.fetchPages()
  }
}
if (!categoryStore.hydrated || categoryStore.categories.length === 0) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const categories = await fetcher('/api/categories')
    categoryStore.setCategories(categories as any)
  } else {
    await categoryStore.fetchCategories()
  }
}

onMounted(() => {
  if (process.server) return
  clientReady.value = true
  window.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  if (process.server) return
  window.removeEventListener('click', onDocClick)
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})

watch(isMobileMenuOpen, (open) => {
  if (!process.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  if (!process.client) return
  document.body.style.overflow = ''
})

const navLinkClass = (path: string) => {
  const current = route.path
  const active =
    path === '/'
      ? current === '/'
      : current === path || current.startsWith(path + '/') || (path === '/shop' && current.startsWith('/product/'))
  return active
    ? 'text-[color:var(--header-nav-link-active,var(--color-accent,#FACC15))]'
    : 'text-[color:var(--header-nav-link-default,rgba(255,255,255,0.9))] hover:text-[color:var(--header-nav-link-hover,#FFFFFF)]'
}

const toggleThemeMode = () => {
  applyThemeMode(themeMode.value === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <header :class="[mobileExperience.enabled && mobileExperience.stickyHeader ? 'sticky top-0 z-50 md:static md:z-auto' : 'relative z-auto', 'w-full border-b border-white/10 bg-[color:var(--color-primary,#2B3E95)]']">
    <div class="hidden lg:block border-b border-white/10">
      <div class="container h-10 flex items-center justify-between text-white/90">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-4" @click.stop>
            <div class="relative">
              <button type="button" class="flex items-center gap-2 text-sm font-bold hover:text-white transition-colors" @click="toggleLang">
                <span>{{ currentLangLabel }}</span>
                <ChevronDown class="w-4 h-4 opacity-80" />
              </button>
              <div v-if="isLangOpen" class="absolute left-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-gray-800">
                <button v-for="opt in languageOptions" :key="opt.code" type="button" class="w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50" @click="setLang(opt.code as any)">
                  {{ t(opt.labelKey as any) }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 text-sm font-bold">
            <Phone class="w-4 h-4 text-[color:var(--color-accent,#FACC15)]" />
            <span>{{ settings.sitePhone || '+00 123 456 789' }}</span>
          </div>
        </div>

        <div class="flex items-center gap-6 text-sm font-bold">
          <NuxtLink to="/about" class="hover:text-white transition-colors">{{ t('nav_about') }}</NuxtLink>
          <NuxtLink to="/order-tracking" class="hover:text-white transition-colors">{{ t('nav_tracking') }}</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-white transition-colors">{{ t('nav_contact') }}</NuxtLink>
          <NuxtLink to="/faq" class="hover:text-white transition-colors">{{ t('nav_faq') }}</NuxtLink>
        </div>
      </div>
    </div>

    <div class="py-2.5 sm:py-4">
      <div class="container">
        <div class="grid grid-cols-[minmax(0,1fr),auto] gap-2.5 lg:gap-4 lg:grid-cols-[auto,1fr,auto] lg:items-center">
          <NuxtLink v-if="(settings as any).design?.headerShowLogo !== false" to="/" class="min-w-0 flex-shrink">
            <div class="flex items-center gap-2.5 min-w-0">
              <div v-if="settings.siteLogo" class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-2 flex-shrink-0">
                <img :src="settings.siteLogo" :alt="settings.siteName" class="max-w-full max-h-full object-contain" />
              </div>
              <h1 class="min-w-0 text-lg sm:text-2xl font-extrabold text-white flex items-center tracking-tight">
                <span class="text-white block truncate">{{ (settings.siteName || 'dukamarket').toLowerCase().replace(/\s+/g, '') }}</span>
              </h1>
            </div>
          </NuxtLink>

          <div class="col-span-2 row-start-2 lg:row-start-1 lg:col-span-1 lg:col-start-2 lg:flex lg:justify-center">
            <div class="relative w-full lg:w-[550px] lg:max-w-[550px]" @click.stop>
              <div class="flex items-center overflow-hidden border border-white/10 bg-white shadow-sm rounded-[4px] h-11 sm:h-11 lg:h-[50px]">
                <div class="relative hidden lg:flex h-[42px] w-[109px] shrink-0 items-center border-r border-gray-200 bg-white">
                  <select v-model.number="activeSearchCategoryId" class="h-full w-full bg-transparent pl-4 pr-8 text-[14px] font-medium text-gray-900 outline-none appearance-none">
                    <option :value="null">Kataloq</option>
                    <option v-for="c in parentCategories" :key="c.id" :value="c.id">{{ categoryLabel(c) }}</option>
                  </select>
                  <span class="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center text-gray-500">
                    <ChevronUp class="h-3 w-3 -mb-1" />
                    <ChevronDown class="h-3 w-3 -mt-1" />
                  </span>
                </div>
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('search_placeholder')"
                  class="min-w-0 flex-grow bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-500 lg:h-full lg:px-4 lg:text-[14px]"
                  @focus="openSuggestion"
                  @input="openSuggestion"
                  @blur="handleSearchBlur"
                  @keydown.enter.prevent="submitSearch"
                />
                <button type="button" class="flex h-11 w-12 items-center justify-center bg-[color:var(--color-accent,#FACC15)] text-[color:var(--color-primary,#2B3E95)] hover:opacity-90 sm:h-11 sm:w-12 lg:h-[50px] lg:w-[50px]" @click="submitSearch">
                  <Search class="w-5 h-5" />
                </button>
              </div>

              <div
                v-show="isSearchOpen && (searchQuery.trim().length > 0 || popularSearchTerms.length > 0)"
                class="absolute top-full left-0 right-0 mt-2 bg-white border shadow-xl rounded-2xl z-50 overflow-hidden max-h-[50vh] overflow-y-auto"
              >
                <div v-if="searchLoading" class="p-6 text-sm text-gray-500 font-medium">
                  Axtarılır...
                </div>
                <div v-else-if="!searchQuery.trim() && popularSearchTerms.length > 0" class="p-5">
                  <div class="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gray-400">Populyar axtarışlar</div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <button
                      v-for="term in popularSearchTerms"
                      :key="term"
                      type="button"
                      class="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      @click="selectPopularSearch(term)"
                    >
                      {{ term }}
                    </button>
                  </div>
                </div>
                <div v-else-if="searchSuggestions.length === 0" class="p-6 text-sm text-gray-500 font-medium">
                  {{ t('not_found') }}
                </div>
                <NuxtLink
                  v-for="p in searchSuggestions"
                  :key="p.id"
                  :to="buildProductHref(p)"
                  class="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  @click="searchQuery = ''; closeSearch(); blurSearchInput()"
                >
                  <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-2 flex-shrink-0 flex items-center justify-center">
                    <img :src="p.image" :alt="p.name" class="max-w-full max-h-full object-contain" />
                  </div>
                  <div class="flex-grow min-w-0">
                    <div class="text-sm font-bold text-gray-900 truncate">{{ p.name }}</div>
                    <div class="text-xs text-gray-400 font-bold uppercase tracking-widest truncate">{{ p.category }}</div>
                  </div>
                  <div class="text-sm font-extrabold text-blue-600 flex-shrink-0">{{ formatMoney(p.price) }}</div>
                </NuxtLink>
                <NuxtLink
                  v-if="searchSuggestions.length > 0"
                  :to="{ path: '/shop', query: { q: searchQuery.trim() } }"
                  class="w-full block px-5 py-4 text-sm font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors"
                  @click="closeSearch(); blurSearchInput()"
                >
                  Hamısına bax
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="row-start-1 col-start-2 flex items-center gap-2 md:gap-5 flex-shrink-0 justify-end lg:col-start-3 lg:row-start-1">
            <div class="hidden md:flex items-center gap-4 md:gap-5">
              <button v-if="settings.creativeSuite?.darkModeEnabled" type="button" class="w-11 h-11 rounded-2xl border border-white/15 bg-white/10 text-white inline-flex items-center justify-center hover:text-yellow-300 transition-colors" @click="toggleThemeMode">
                <Moon v-if="themeMode === 'light'" class="w-5 h-5" />
                <Sun v-else class="w-5 h-5" />
              </button>
              <div class="relative" @click.stop>
                <button type="button" class="flex items-center gap-2 text-white hover:text-yellow-300 transition-colors" @click="toggleAccount">
                  <User class="w-6 h-6" />
                  <span class="hidden xl:block text-sm font-bold">{{ t('my_account_label' as any) }}</span>
                  <ChevronDown class="w-4 h-4 opacity-80" />
                </button>
                <div v-if="isAccountOpen" class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div v-if="authStore.isLoggedIn" class="px-4 py-3 border-b border-gray-100">
                    <div class="text-xs font-bold text-gray-500">{{ authStore.user?.role }}</div>
                    <div class="text-sm font-extrabold text-gray-900 truncate">{{ authStore.user?.email }}</div>
                  </div>
                  <div class="p-2">
                    <NuxtLink v-if="!authStore.isLoggedIn" to="/login" class="flex items-center px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-50">
                      <User class="w-4 h-4 mr-2" /> {{ t('login') }}
                    </NuxtLink>
                    <NuxtLink v-if="!authStore.isLoggedIn" to="/signup" class="flex items-center px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-50">
                      <User class="w-4 h-4 mr-2" /> {{ t('signup_now' as any) }}
                    </NuxtLink>
                    <NuxtLink v-if="!authStore.isLoggedIn" to="/seller/register" class="flex items-center px-3 py-2 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-50">
                      <Store class="w-4 h-4 mr-2" /> Satıcı ol
                    </NuxtLink>
                    <NuxtLink v-else to="/profile" class="flex items-center px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-50">
                      <User class="w-4 h-4 mr-2" /> {{ t('profile') }}
                    </NuxtLink>
                    <NuxtLink v-if="authStore.isLoggedIn && authStore.user?.role === 'Satıcı'" to="/seller" class="flex items-center px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-50">
                      <Store class="w-4 h-4 mr-2" /> Satıcı paneli
                    </NuxtLink>
                    <NuxtLink v-if="authStore.isLoggedIn && authStore.user?.role === 'Admin'" :to="adminPath()" class="flex items-center px-3 py-2 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-50">
                      <Settings class="w-4 h-4 mr-2" /> Admin
                    </NuxtLink>
                    <button v-if="authStore.isLoggedIn" type="button" class="w-full flex items-center px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50" @click="logout">
                      <LogOut class="w-4 h-4 mr-2" /> Log out
                    </button>
                  </div>
                </div>
              </div>

              <NuxtLink to="/wishlist" class="relative flex items-center gap-2 text-white hover:text-yellow-300 transition-colors">
                <div class="relative">
                  <Heart class="w-6 h-6" />
                  <span class="absolute -top-2 -right-2 bg-[color:var(--color-accent,#FACC15)] text-[color:var(--color-primary,#2B3E95)] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold">{{ clientReady ? wishlistStore.totalItems : 0 }}</span>
                </div>
                <span class="hidden xl:block text-sm font-bold">{{ t('wishlist_label' as any) }}</span>
              </NuxtLink>
            </div>

            <NuxtLink :to="authStore.isLoggedIn ? (authStore.user?.role === 'Satıcı' ? '/seller' : '/profile') : '/login'" class="md:hidden w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-white inline-flex items-center justify-center">
              <User class="w-5 h-5" />
            </NuxtLink>

            <NuxtLink to="/cart" class="flex items-center gap-3 text-white hover:text-yellow-300 transition-colors w-11 h-11 md:w-auto md:h-auto rounded-xl md:rounded-none bg-white/10 md:bg-transparent border border-white/15 md:border-0 justify-center">
              <div class="relative">
                <ShoppingBag class="w-5 h-5 md:w-6 md:h-6" />
                <span class="absolute -top-2 -right-2 bg-[color:var(--color-accent,#FACC15)] text-[color:var(--color-primary,#2B3E95)] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold">{{ clientReady ? cartStore.totalItems : 0 }}</span>
              </div>
              <div class="hidden xl:block">
                <div class="text-sm font-extrabold leading-tight">{{ formatMoney(clientReady ? cartStore.totalPrice : 0) }}</div>
                <div class="text-[11px] font-bold text-white/80">{{ t('cart_label' as any) }}</div>
              </div>
            </NuxtLink>

            <button type="button" class="md:hidden w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-white inline-flex items-center justify-center" @click.stop="toggleMobileMenu" :aria-expanded="isMobileMenuOpen ? 'true' : 'false'" aria-label="Mobil menu">
              <X v-if="isMobileMenuOpen" class="w-5 h-5" />
              <Menu v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Bar -->
    <div class="bg-[color:var(--header-nav-bg,var(--color-primary,#2B3E95))] border-t border-white/10">
      <div class="container flex flex-col md:flex-row md:items-center md:h-16 py-2 md:py-0 gap-2 md:gap-0">
        <!-- Category Menu Button -->
        <div class="relative flex-shrink-0 w-full md:w-72" @click.stop>
          <button
            type="button"
            :class="[
              'md:hidden w-full h-11 flex items-center px-5 font-extrabold rounded-2xl border transition-colors',
              isMobileDeptOpen
                ? 'bg-[color:var(--dept-btn-active-bg,var(--color-accent,#FACC15))] text-[color:var(--dept-btn-active-text,var(--color-primary,#2B3E95))] border-[color:var(--dept-btn-active-border,var(--dept-btn-active-bg,var(--color-accent,#FACC15)))]'
                : 'bg-[color:var(--dept-btn-bg,rgba(255,255,255,0.10))] text-[color:var(--dept-btn-text,#FFFFFF)] border-[color:var(--dept-btn-border,rgba(255,255,255,0.15))] hover:bg-[color:var(--dept-btn-hover-bg,var(--color-accent,#FACC15))] hover:text-[color:var(--dept-btn-hover-text,var(--color-primary,#2B3E95))] hover:border-[color:var(--dept-btn-hover-border,var(--dept-btn-hover-bg,var(--color-accent,#FACC15)))]'
            ]"
            @click="toggleMobileDept"
          >
            <Menu class="w-5 h-5 mr-4" />
            <span class="font-extrabold">{{ t('product_catalog' as any) }}</span>
            <ChevronDown class="w-4 h-4 ml-auto opacity-90" />
          </button>

          <div v-if="isMobileDeptOpen" class="md:hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-[1.75rem] overflow-hidden z-50">
            <button type="button" class="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-100 font-medium text-sm text-gray-900" @click="goToAllCategories">
              <span class="w-10 h-10 rounded-2xl border border-white/70 flex items-center justify-center shrink-0 shadow-sm" :style="iconWrapStyleFor({ id: 0 })">
                <component :is="iconFor('Package')" class="w-4.5 h-4.5" />
              </span>
              <span>{{ t('all_categories' as any) }}</span>
            </button>
            <div class="max-h-[50vh] overflow-auto">
              <div v-for="p in parentCategories" :key="p.id" class="border-b border-gray-100 last:border-0">
                <button type="button" class="w-full flex items-center gap-3 px-5 py-4 font-medium text-sm transition-colors" :class="mobileExpandedParentId === p.id ? 'bg-gray-50 text-gray-900' : 'bg-white text-gray-900'" @click="toggleMobileParent(p.id)">
                  <span class="w-11 h-11 rounded-2xl border border-white/70 flex items-center justify-center shrink-0 shadow-sm" :style="iconWrapStyleFor(p)">
                    <component :is="iconFor(p)" class="w-5 h-5" />
                  </span>
                  <span class="flex-1 text-left">{{ categoryLabel(p) }}</span>
                  <ChevronUp v-if="mobileExpandedParentId === p.id" class="w-4 h-4 text-gray-400" :style="iconColorStyleFor(p)" />
                  <ChevronDown v-else class="w-4 h-4 text-gray-400" :style="iconColorStyleFor(p)" />
                </button>
                <div v-if="mobileExpandedParentId === p.id" class="px-4 pb-4">
                  <button type="button" class="w-full flex items-center gap-3 text-left px-4 py-3 rounded-2xl border font-medium text-sm text-gray-900 hover:bg-gray-50" :style="cardStyleFor(p)" @click="goToCategory(p.id)">
                    <span class="w-10 h-10 rounded-2xl border border-white/70 flex items-center justify-center shrink-0 shadow-sm" :style="iconWrapStyleFor(p)">
                      <component :is="iconFor(p)" class="w-4.5 h-4.5" />
                    </span>
                    <span class="flex-1">{{ categoryLabel(p) }}</span>
                  </button>
                  <div v-for="c in (childrenByParent.get(p.id) || [])" :key="c.id" class="mt-2">
                    <button type="button" class="w-full flex items-center gap-3 text-left px-4 py-3 rounded-2xl border font-medium text-sm text-gray-800 hover:bg-gray-50 transition-colors" :style="cardStyleFor(c)" @click="(childrenByParent.get(c.id) || []).length ? toggleMobileChild(c.id) : goToCategory(c.id)">
                      <span class="w-10 h-10 rounded-2xl border border-white/70 flex items-center justify-center shrink-0 shadow-sm" :style="iconWrapStyleFor(c)">
                        <component :is="iconFor(c)" class="w-4.5 h-4.5" />
                      </span>
                      <span class="flex-1">{{ categoryLabel(c) }}</span>
                      <ChevronUp v-if="(childrenByParent.get(c.id) || []).length && mobileExpandedChildId === c.id" class="w-4 h-4 text-gray-400" :style="iconColorStyleFor(c)" />
                      <ChevronDown v-else-if="(childrenByParent.get(c.id) || []).length" class="w-4 h-4 text-gray-400" :style="iconColorStyleFor(c)" />
                    </button>
                    <div v-if="(childrenByParent.get(c.id) || []).length && mobileExpandedChildId === c.id" class="mt-2 space-y-2 border-l border-gray-200 pl-4 ml-4">
                      <button
                        type="button"
                        class="w-full rounded-xl px-3 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                        @click="goToCategory(c.id)"
                      >
                        <component :is="iconFor(c)" class="w-3.5 h-3.5" :style="iconColorStyleFor(c)" />
                        <span>{{ categoryLabel(c) }} - hamısına bax</span>
                      </button>
                      <button
                        v-for="child in (childrenByParent.get(c.id) || [])"
                        :key="child.id"
                        type="button"
                        class="w-full text-left rounded-xl px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                        @click="goToCategory(child.id)"
                      >
                        <component :is="iconFor(child)" class="w-3.5 h-3.5" :style="iconColorStyleFor(child)" />
                        <span>{{ categoryLabel(child) }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            :class="[
              'hidden md:flex w-full h-16 items-center px-6 font-extrabold border-r transition-colors',
              isDeptOpen
                ? 'bg-[color:var(--dept-btn-active-bg,var(--color-accent,#FACC15))] text-[color:var(--dept-btn-active-text,var(--color-primary,#2B3E95))] border-white/10'
                : 'bg-[color:var(--dept-btn-bg,rgba(255,255,255,0.10))] text-[color:var(--dept-btn-text,#FFFFFF)] border-white/10 hover:bg-[color:var(--dept-btn-hover-bg,var(--color-accent,#FACC15))] hover:text-[color:var(--dept-btn-hover-text,var(--color-primary,#2B3E95))]'
            ]"
            @click="openDepartmentCatalog"
          >
            <Menu class="w-5 h-5 mr-4" />
            <span class="font-extrabold">{{ t('product_catalog' as any) }}</span>
            <ChevronDown class="w-4 h-4 ml-auto opacity-90" />
          </button>
          <div v-if="isDeptOpen && !isShopRoute" class="hidden md:block absolute top-full left-0 w-[min(1160px,calc(100vw-32px))] overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/95 shadow-[0_35px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur z-40">
            <div class="grid min-h-[720px] grid-cols-[290px,330px,1fr]">
              <div class="max-h-[720px] overflow-auto border-r border-slate-200/80 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-4">
                <div class="mb-3 rounded-[1.6rem] border border-white/70 bg-white/85 px-5 py-4 shadow-sm">
                  <div class="text-[11px] font-extrabold uppercase tracking-[0.28em] text-slate-400">Kataloq</div>
                  <div class="mt-1 text-lg font-extrabold text-slate-900">Bölmələr</div>
                  <div class="mt-1 text-xs font-medium text-slate-500">Bütün əsas hissələr və zəngin alt kataloqlar</div>
                </div>
                <button type="button" class="mb-2 w-full rounded-[1.6rem] border border-white/80 bg-white/90 px-5 py-4 text-left text-sm font-bold text-slate-900 shadow-sm transition hover:bg-white flex items-center gap-3" @click="goToAllCategories">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 shadow-sm" :style="iconWrapStyleFor({ id: 0 })">
                    <component :is="iconFor('Package')" class="h-4.5 w-4.5" />
                  </span>
                  <span>{{ t('all_categories' as any) }}</span>
                </button>
                <button
                  v-for="p in parentCategories"
                  :key="p.id"
                  type="button"
                  class="mb-2 flex w-full items-center gap-3 rounded-[1.6rem] border px-4 py-3 text-left text-sm font-medium transition-all last:mb-0"
                  :class="activeDeptParentId === p.id ? 'border-blue-200 bg-white text-slate-900 shadow-[0_18px_35px_-28px_rgba(37,99,235,0.85)]' : 'border-transparent bg-white/80 text-slate-800 hover:border-white hover:bg-white'"
                  @mouseenter="activeDeptParentId = p.id"
                  @click="activeDeptParentId = p.id"
                >
                  <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm" :style="iconWrapStyleFor(p)">
                    <component :is="iconFor(p)" class="h-5 w-5" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block line-clamp-2 text-[13px] font-bold leading-5">{{ categoryLabel(p) }}</span>
                  </span>
                  <span v-if="(childrenByParent.get(p.id) || []).length" class="text-lg leading-none text-slate-400">›</span>
                </button>
              </div>
              <div class="max-h-[720px] overflow-auto border-r border-slate-200/80 bg-white p-5">
                <div v-if="activeDeptParent" class="mb-5 rounded-[1.8rem] border border-slate-100 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-5 shadow-sm">
                  <div class="flex items-center gap-4">
                    <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] border border-white/70 shadow-sm" :style="iconWrapStyleFor(activeDeptParent)">
                      <component :is="iconFor(activeDeptParent)" class="h-6 w-6" />
                    </span>
                    <div class="min-w-0">
                      <div v-if="showCatalogHelperHeadings" class="mb-1 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Ana kataloq</div>
                      <div class="truncate text-lg font-extrabold text-slate-900">{{ categoryLabel(activeDeptParent) }}</div>
                    </div>
                  </div>
                  <button type="button" class="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-slate-800" @click="goToCategory(activeDeptParent.id)">
                    Hamısına bax
                  </button>
                </div>
                <div v-if="activeDeptChildren.length > 0" class="space-y-3">
                  <button
                    v-for="c in activeDeptChildren"
                    :key="c.id"
                    type="button"
                    class="w-full rounded-[1.55rem] border p-4 text-left transition"
                    :class="activeDeptChildId === c.id ? 'border-blue-200 bg-blue-50/70 shadow-[0_18px_35px_-30px_rgba(37,99,235,0.9)]' : 'border-slate-100 bg-slate-50/70 hover:border-slate-200 hover:bg-white'"
                    @mouseenter="activeDeptChildId = c.id"
                    @click="(childrenByParent.get(c.id) || []).length ? activeDeptChildId = c.id : goToCategory(c.id)"
                  >
                    <div class="flex items-start gap-3">
                      <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm" :style="iconWrapStyleFor(c)">
                        <component :is="iconFor(c)" class="h-5 w-5" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block line-clamp-2 font-bold text-slate-900">{{ categoryLabel(c) }}</span>
                        <span v-if="getChildren(c.id).length" class="mt-2 flex flex-wrap gap-1.5">
                          <span
                            v-for="leaf in getChildren(c.id).slice(0, 3)"
                            :key="leaf.id"
                            class="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 inline-flex items-center gap-1.5"
                          >
                            <component :is="iconFor(leaf)" class="h-3.5 w-3.5" :style="iconColorStyleFor(leaf)" />
                            <span>{{ categoryLabel(leaf) }}</span>
                          </span>
                        </span>
                      </span>
                      <span class="text-lg leading-none text-slate-400">›</span>
                    </div>
                  </button>
                </div>
                <div v-else class="rounded-[1.6rem] border border-dashed border-gray-200 px-6 py-10 text-center text-sm font-medium text-gray-500">
                  {{ t('not_found') }}
                </div>
              </div>
              <div class="max-h-[720px] overflow-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
                <div v-if="activeDeptChild || activeDeptParent" class="rounded-[1.9rem] border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <div v-if="showCatalogHelperHeadings" class="mb-1 text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">{{ activeDeptChild ? 'Seçilmiş bölmə' : 'Kataloq görünüşü' }}</div>
                      <div class="truncate text-xl font-extrabold text-slate-900">{{ categoryLabel(activeDeptChild || activeDeptParent) }}</div>
                      <div v-if="showCatalogHelperHeadings" class="mt-1 text-sm font-medium text-slate-500">
                        {{ activeDeptChild ? 'Alt kataloqları sürətli şəkildə açın və istədiyiniz hissəyə keçin.' : 'Ana bölməni seçin və uyğun alt kataloqlara dərhal baxın.' }}
                      </div>
                    </div>
                    <button
                      v-if="activeDeptTargetId !== null"
                      type="button"
                      class="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-blue-700"
                      @click="goToCategory(activeDeptTargetId)"
                    >
                      Hamısına bax
                    </button>
                  </div>
                  <div class="mt-5 grid grid-cols-1 gap-3">
                    <div class="rounded-[1.35rem] border border-slate-100 bg-slate-50 px-4 py-3">
                      <div class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Sürətli keçid</div>
                      <div class="mt-2 text-2xl font-extrabold text-slate-900">{{ activeDeptHighlights.length }}</div>
                    </div>
                  </div>
                </div>
                <div v-if="activeDeptHighlights.length > 0" class="mt-5">
                  <div v-if="showCatalogHelperHeadings" class="mb-3 flex items-center justify-between">
                    <div class="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Sürətli keçidlər</div>
                    <div class="text-xs font-medium text-slate-400">Ən faydalı alt bölmələr</div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      v-for="child in activeDeptHighlights"
                      :key="child.id"
                      type="button"
                      class="rounded-[1.35rem] border border-slate-100 bg-white px-4 py-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                      :style="cardStyleFor(child)"
                      @click="goToCategory(child.id)"
                    >
                      <span class="flex items-start gap-3">
                        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm" :style="iconWrapStyleFor(child)">
                          <component :is="iconFor(child)" class="h-4.5 w-4.5" />
                        </span>
                        <span class="min-w-0 flex-1">
                          <span class="block line-clamp-2 text-sm font-bold text-slate-800">{{ categoryLabel(child) }}</span>
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
                <div v-if="activeDeptCollections.length > 0" class="mt-6">
                  <div v-if="showCatalogHelperHeadings" class="mb-3 flex items-center justify-between">
                    <div class="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Bütün hissələr</div>
                    <div class="text-xs font-medium text-slate-400">Kart görünüşü</div>
                  </div>
                  <div class="grid gap-3 xl:grid-cols-2">
                    <div
                      v-for="group in activeDeptCollections"
                      :key="group.category.id"
                      class="rounded-[1.5rem] border border-slate-100 bg-white px-4 py-4 shadow-sm"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <button type="button" class="min-w-0 text-left flex items-start gap-3" @click="goToCategory(group.category.id)">
                          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm" :style="iconWrapStyleFor(group.category)">
                            <component :is="iconFor(group.category)" class="h-4.5 w-4.5" />
                          </span>
                          <span class="min-w-0">
                            <span class="block text-sm font-extrabold text-slate-900">{{ categoryLabel(group.category) }}</span>
                          </span>
                        </button>
                        <button type="button" class="shrink-0 text-xs font-extrabold text-blue-600 hover:underline" @click="goToCategory(group.category.id)">
                          Aç
                        </button>
                      </div>
                      <div v-if="group.items.length > 0" class="mt-3 flex flex-wrap gap-2">
                        <button
                          v-for="item in group.items"
                          :key="item.id"
                          type="button"
                          class="rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 inline-flex items-center gap-1.5"
                          @click="goToCategory(item.id)"
                        >
                          <component :is="iconFor(item)" class="h-3.5 w-3.5" :style="iconColorStyleFor(item)" />
                          <span>{{ categoryLabel(item) }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="activeDeptHighlights.length === 0 && activeDeptCollections.length === 0" class="rounded-[1.6rem] border border-dashed border-gray-200 px-6 py-10 text-center text-sm font-medium text-gray-500">
                  Bu bölmə üçün birbaşa kataloqa keçə bilərsiniz.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Navigation -->
        <nav class="md:ml-10 flex-1 w-full md:w-auto">
          <ul class="hidden md:flex flex-wrap md:flex-nowrap items-center gap-x-8 gap-y-2 font-bold text-sm">
            <li><NuxtLink to="/" :class="navLinkClass('/')">{{ t('nav_home') }}</NuxtLink></li>
            <li><NuxtLink to="/about" :class="navLinkClass('/about')">{{ t('nav_about') }}</NuxtLink></li>
            <li><NuxtLink to="/shop" :class="navLinkClass('/shop')">{{ t('nav_shop') }}</NuxtLink></li>
            <li><NuxtLink to="/blog" :class="navLinkClass('/blog')">{{ t('nav_blog') }}</NuxtLink></li>
            <li class="relative" @click.stop>
              <button type="button" :class="[navLinkClass('/sellers'), navLinkClass('/seller'), 'flex items-center gap-2 font-bold']" @click="toggleSellerNav">
                Satıcılar <ChevronDown class="w-4 h-4 opacity-80" />
              </button>
              <div v-if="isSellerNavOpen" class="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <NuxtLink
                  v-for="item in sellerNavItems"
                  :key="item.to"
                  :to="item.to"
                  class="block px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50"
                  @click="isSellerNavOpen = false"
                >
                  {{ item.label }}
                </NuxtLink>
              </div>
            </li>
            <li class="relative" @click.stop>
              <button type="button" :class="[navLinkClass('/pages' as any), 'flex items-center gap-2 font-bold']" @click="togglePages">
                {{ t('pages') }} <ChevronDown class="w-4 h-4 opacity-80" />
              </button>
              <div v-if="isPagesOpen" class="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <NuxtLink
                  v-for="p in navPages"
                  :key="p.id"
                  :to="'/' + p.slug"
                  class="block px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50"
                  @click="isPagesOpen = false"
                >
                  {{ p.title }}
                </NuxtLink>
                <div v-if="navPages.length === 0" class="px-4 py-3 text-sm font-medium text-gray-500">
                  Heç bir səhifə yoxdur
                </div>
              </div>
            </li>
          </ul>
        </nav>

        <!-- Right Side Promo/Link -->
        <div class="hidden xl:block">
          <p v-if="settings.flashSale?.enabled" class="text-sm font-extrabold text-white flex items-center">
            <span class="bg-[color:var(--color-accent,#FACC15)] text-[color:var(--color-primary,#2B3E95)] text-[10px] px-2 py-0.5 rounded-full mr-2">{{ settings.flashSale.badge || 'NEW' }}</span>
            {{ settings.flashSale.text || t('flash_sale') }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/50" @click="isMobileMenuOpen = false"></div>
      <div class="absolute top-0 right-0 flex h-full w-[86%] max-w-sm flex-col overflow-hidden bg-white shadow-2xl" @click.stop>
        <div class="shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="text-lg font-extrabold text-gray-900">{{ (settings.siteName || 'dukamarket') }}</div>
          <button type="button" class="p-2 rounded-xl hover:bg-gray-100" @click="isMobileMenuOpen = false">
            <X class="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <div class="px-5 py-4 border-b border-gray-100">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{{ t('mobile_language' as any) }}</div>
            <div class="flex gap-2">
              <button
                v-for="opt in languageOptions"
                :key="opt.code"
                type="button"
                :class="[
                  mobileExperience.compactTypography ? 'text-[11px]' : 'text-sm',
                  'flex-1 py-2.5 rounded-xl border font-extrabold',
                  lang === opt.code
                    ? 'bg-[color:var(--color-primary,#2B3E95)] text-white border-[color:var(--color-primary,#2B3E95)]'
                    : 'bg-white text-gray-800 border-gray-200'
                ]"
                @click="setLang(opt.code as any)"
              >
                {{ opt.code.toUpperCase() }}
              </button>
            </div>
          </div>

          <div class="px-5 py-4 border-b border-gray-100">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{{ t('mobile_menu' as any) }}</div>
            <div class="space-y-2">
              <NuxtLink to="/" :class="['block rounded-2xl bg-gray-50 px-4 py-3 font-extrabold text-gray-900', mobileExperience.compactTypography ? 'text-[12px]' : 'text-sm']" @click="isMobileMenuOpen = false">{{ t('nav_home') }}</NuxtLink>
              <NuxtLink to="/about" :class="['block rounded-2xl bg-gray-50 px-4 py-3 font-extrabold text-gray-900', mobileExperience.compactTypography ? 'text-[12px]' : 'text-sm']" @click="isMobileMenuOpen = false">{{ t('nav_about') }}</NuxtLink>
              <NuxtLink to="/shop" :class="['block rounded-2xl bg-gray-50 px-4 py-3 font-extrabold text-gray-900', mobileExperience.compactTypography ? 'text-[12px]' : 'text-sm']" @click="isMobileMenuOpen = false">{{ t('nav_shop') }}</NuxtLink>
              <NuxtLink to="/blog" :class="['block rounded-2xl bg-gray-50 px-4 py-3 font-extrabold text-gray-900', mobileExperience.compactTypography ? 'text-[12px]' : 'text-sm']" @click="isMobileMenuOpen = false">{{ t('nav_blog') }}</NuxtLink>
            </div>
          </div>

          <div class="px-5 py-4 border-b border-gray-100">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Satıcılar</div>
            <div class="space-y-2">
              <NuxtLink
                v-for="item in sellerNavItems"
                :key="item.to"
                :to="item.to"
                :class="['block rounded-2xl bg-gray-50 px-4 py-3 font-extrabold text-gray-900', mobileExperience.compactTypography ? 'text-[12px]' : 'text-sm']"
                @click="isMobileMenuOpen = false"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>

          <div class="px-5 py-4 border-b border-gray-100">
            <button type="button" :class="['flex w-full items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 font-extrabold text-gray-900', mobileExperience.compactTypography ? 'text-[12px]' : 'text-sm']" @click="isPagesOpen = !isPagesOpen">
              <span>{{ t('pages') }}</span>
              <ChevronDown class="w-5 h-5 text-gray-500" />
            </button>
            <div v-if="isPagesOpen" class="mt-2 space-y-2">
              <NuxtLink v-for="p in navPages" :key="p.id" :to="'/' + p.slug" :class="['block rounded-2xl border border-gray-100 px-4 py-3 font-bold text-gray-800', mobileExperience.compactTypography ? 'text-[12px]' : 'text-sm']" @click="isMobileMenuOpen = false; isPagesOpen = false">
                {{ p.title }}
              </NuxtLink>
              <div v-if="navPages.length === 0" class="px-4 py-3 text-sm font-medium text-gray-500">{{ t('mobile_no_pages' as any) }}</div>
            </div>
          </div>
        </div>

        <div class="shrink-0 border-t border-gray-100 bg-white px-5 py-5">
          <div class="grid grid-cols-2 gap-3">
            <NuxtLink to="/wishlist" class="flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--color-accent,#FACC15)] px-3 py-3 text-[13px] font-bold text-[color:var(--color-primary,#2B3E95)] shadow-[0_14px_30px_-22px_rgba(250,204,21,0.95)] transition-all hover:brightness-95" @click="isMobileMenuOpen = false">
              <Heart class="h-4 w-4" /> {{ t('wishlist_label' as any) }}
            </NuxtLink>
            <NuxtLink v-if="!authStore.isLoggedIn" to="/login" class="flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--color-primary,#2B3E95)] px-3 py-3 text-[13px] font-bold text-white" @click="isMobileMenuOpen = false">
              <User class="h-4 w-4" /> {{ t('login') }}
            </NuxtLink>
            <button v-else type="button" class="flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-3 text-[13px] font-bold text-red-600" @click="logout; isMobileMenuOpen = false">
              <LogOut class="h-4 w-4" /> {{ t('logout' as any) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
