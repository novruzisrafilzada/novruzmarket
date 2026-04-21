<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Check, ChevronRight, CreditCard, FileText, Heart, ImagePlus, LogOut, Mail, MapPin, RotateCcw, Save, Shield, ShoppingCart, Sparkles, Store, Truck, User } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useCategoryStore } from '~/stores/categories'
import { useOrderStore } from '~/stores/orders'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'
import { useWishlistStore } from '~/stores/wishlist'
import { useAdminPortal } from '~/composables/useAdminPortal'
import { cropImageFile, uploadPreparedImage } from '~/utils/seller-media'

const authStore = useAuthStore()
const cartStore = useCartStore()
const categoryStore = useCategoryStore()
const orderStore = useOrderStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const wishlistStore = useWishlistStore()
const { adminPath } = useAdminPortal()
const { formatMoney } = useMoney()
const { t, lang } = useT()
const savingSellerProfile = ref(false)
const savingAddresses = ref(false)
const uploadingProfileImage = ref(false)
const uploadingCoverImage = ref(false)
const orderRequestLoading = ref<string | null>(null)
const addressForm = ref({
  label: '',
  recipient: '',
  phone: '',
  city: '',
  address: '',
  zip: ''
})
const sellerForm = ref({
  shopName: '',
  phone: '',
  note: '',
  profileImage: '',
  profilePreview: '',
  coverImage: '',
  coverPreview: '',
  categoryIds: [] as number[]
})

const myOrders = computed(() =>
  [...orderStore.orders].sort((a, b) => new Date(String(b.date || '')).getTime() - new Date(String(a.date || '')).getTime())
)

const formatOrderDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  const locale = lang.value === 'ru' ? 'ru-RU' : lang.value === 'en' ? 'en-US' : 'az-AZ'
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale)
}

const profileCopy = computed(() => {
  if (lang.value === 'ru') {
    return {
      seoTitle: 'Профиль',
      seoDescription: 'Управляйте аккаунтом, адресами, заказами и счетами в одном кабинете.',
      bronze: 'Бронза',
      defaultLabel: 'Основной',
      setDefault: 'Сделать основным',
      invoice: 'Счёт',
      invoiceTitle: 'Счёт',
      customer: 'Клиент',
      date: 'Дата',
      tracking: 'Трекинг',
      product: 'Товар',
      qty: 'Кол-во',
      price: 'Цена',
      total: 'Итого',
      heroBadge: 'Центр аккаунта',
      pageTitle: 'Мой аккаунт',
      pageSubtitle: 'Профиль, адреса, заказы и быстрые переходы собраны в одном мобильном кабинете.',
      quickActions: 'Быстрые действия',
      activityLabel: 'Активность',
      activeOrders: 'Активные заказы',
      deliveredOrders: 'Доставлено',
      wishlistCount: 'Избранное',
      addressCount: 'Адреса',
      profileCompletion: 'Заполненность профиля',
      continueShopping: 'Продолжить покупки',
      trackingHub: 'Центр отслеживания',
      wishlistSubtitle: 'Сохранённые товары',
      cartSubtitle: 'Корзина к checkout',
      addressSubtitle: 'Адреса доставки',
      ordersSubtitle: 'Отслеживание и повтор заказа',
      sellerDesk: 'Кабинет продавца',
      adminDesk: 'Центр админа',
      logout: 'Выйти'
    }
  }
  if (lang.value === 'en') {
    return {
      seoTitle: 'Profile',
      seoDescription: 'Manage your account, addresses, orders and invoices from one place.',
      bronze: 'Bronze',
      defaultLabel: 'Default',
      setDefault: 'Set as default',
      invoice: 'Invoice',
      invoiceTitle: 'Invoice',
      customer: 'Customer',
      date: 'Date',
      tracking: 'Tracking',
      product: 'Product',
      qty: 'Qty',
      price: 'Price',
      total: 'Total',
      heroBadge: 'Account Center',
      pageTitle: 'My account',
      pageSubtitle: 'Your profile, addresses, orders and shortcuts are all collected in one mobile-friendly hub.',
      quickActions: 'Quick actions',
      activityLabel: 'Activity',
      activeOrders: 'Active orders',
      deliveredOrders: 'Delivered',
      wishlistCount: 'Wishlist',
      addressCount: 'Addresses',
      profileCompletion: 'Profile completion',
      continueShopping: 'Continue shopping',
      trackingHub: 'Tracking hub',
      wishlistSubtitle: 'Saved favorites',
      cartSubtitle: 'Ready to checkout',
      addressSubtitle: 'Delivery addresses',
      ordersSubtitle: 'Track and reorder',
      sellerDesk: 'Seller desk',
      adminDesk: 'Admin desk',
      logout: 'Log out'
    }
  }
  return {
    seoTitle: 'Profil',
    seoDescription: 'Hesab, ünvan, sifariş və invoice məlumatlarını bir yerdən idarə edin.',
    bronze: 'Bürünc',
    defaultLabel: 'Əsas',
    setDefault: 'Əsas et',
    invoice: 'Faktura',
    invoiceTitle: 'Faktura',
    customer: 'Müştəri',
    date: 'Tarix',
    tracking: 'İzləmə',
    product: 'Məhsul',
    qty: 'Say',
    price: 'Qiymət',
    total: 'Yekun',
    heroBadge: 'Hesab mərkəzi',
    pageTitle: 'Hesabım',
    pageSubtitle: 'Profil, ünvan, sifariş və əsas keçidlər bir mobil account mərkəzində toplanır.',
    quickActions: 'Tez keçidlər',
    activityLabel: 'Aktivlik',
    activeOrders: 'Aktiv sifariş',
    deliveredOrders: 'Çatdırılan',
    wishlistCount: 'Seçilmişlər',
    addressCount: 'Ünvanlar',
    profileCompletion: 'Profil doluluğu',
    continueShopping: 'Alışa davam et',
    trackingHub: 'İzləmə mərkəzi',
    wishlistSubtitle: 'Seçilən məhsullar',
    cartSubtitle: 'Hazır səbət',
    addressSubtitle: 'Çatdırılma ünvanları',
    ordersSubtitle: 'İzlə və təkrar sifariş et',
    sellerDesk: 'Satıcı masası',
    adminDesk: 'Admin mərkəzi',
    logout: 'Çıxış'
  }
})

useSiteSeo({
  title: computed(() => profileCopy.value.seoTitle),
  description: computed(() => profileCopy.value.seoDescription),
  path: computed(() => '/profile')
})

const orderItemsPreview = (order: any) => {
  const items = Array.isArray(order?.items) ? order.items : []
  if (!items.length) return 'Məhsul məlumatı yoxdur'
  const names = items
    .map((item: any) => String(item?.name || '').trim())
    .filter(Boolean)
  if (!names.length) return `${items.length} məhsul`
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
}

const isSeller = computed(() => authStore.user?.role === 'Satıcı')
const savedAddresses = computed(() => Array.isArray(authStore.user?.addresses) ? authStore.user!.addresses! : [])
const userOrders = computed(() => orderStore.orders.filter((item) => String(item.email || '').trim().toLowerCase() === String(authStore.user?.email || '').trim().toLowerCase()))
const loyaltyPoints = computed(() => {
  const cfg = settingsStore.settings.creativeSuite
  if (!cfg?.loyaltyEnabled) return 0
  const deliveredTotal = userOrders.value
    .filter((item) => ['Təsdiqləndi', 'Hazırlanır', 'Göndərildi', 'Çatdırıldı'].includes(item.status))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const firstOrderBonus = userOrders.value.length > 0 ? Number(cfg.firstOrderBonusPoints || 0) : 0
  return Math.round(deliveredTotal * Number(cfg.pointsPerOrderUnit || 0) + firstOrderBonus)
})
const loyaltyBadge = computed(() => {
  const thresholds = Array.isArray(settingsStore.settings.creativeSuite?.badgeThresholds) ? settingsStore.settings.creativeSuite.badgeThresholds : []
  return thresholds
    .slice()
    .sort((a: any, b: any) => Number(b.minPoints || 0) - Number(a.minPoints || 0))
    .find((item: any) => loyaltyPoints.value >= Number(item.minPoints || 0))
    || thresholds[0]
    || { label: profileCopy.value.bronze, minPoints: 0 }
})
const referralCode = computed(() => {
  const base = String(authStore.user?.username || authStore.user?.email || authStore.user?.name || 'REF').split('@')[0]
  return `${base.replace(/\s+/g, '').toUpperCase()}-${authStore.user?.id || 0}`
})
const categoryOptions = computed(() =>
  categoryStore.categories
    .filter((category) => category.parentId === null)
    .map((category) => ({
      id: category.id,
      label: category.nameI18n.az || category.slug,
      image: category.image || ''
    }))
)

const profileAvatar = computed(() => String(authStore.user?.sellerProfile?.profileImage || '').trim())
const userInitials = computed(() =>
  String(authStore.user?.name || authStore.user?.email || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join('')
)
const activeOrdersCount = computed(() =>
  myOrders.value.filter((order) => !['Çatdırıldı', 'İptal edildi', 'Qaytarıldı'].includes(String(order.status || ''))).length
)
const deliveredOrdersCount = computed(() =>
  myOrders.value.filter((order) => String(order.status || '') === 'Çatdırıldı').length
)
const profileCompletion = computed(() => {
  const checks = [
    Boolean(String(authStore.user?.name || '').trim()),
    Boolean(String(authStore.user?.email || '').trim()),
    Boolean(String(authStore.user?.phone || '').trim()),
    savedAddresses.value.length > 0
  ]
  if (isSeller.value) {
    checks.push(Boolean(String(authStore.user?.sellerProfile?.shopName || '').trim()))
  }
  const completed = checks.filter(Boolean).length
  return Math.round((completed / checks.length) * 100)
})
const accountMetrics = computed(() => ([
  { key: 'active-orders', label: profileCopy.value.activeOrders, value: activeOrdersCount.value, icon: Truck },
  { key: 'delivered-orders', label: profileCopy.value.deliveredOrders, value: deliveredOrdersCount.value, icon: Check },
  { key: 'wishlist', label: profileCopy.value.wishlistCount, value: wishlistStore.totalItems, icon: Heart },
  { key: 'addresses', label: profileCopy.value.addressCount, value: savedAddresses.value.length, icon: MapPin }
]))
const accountQuickLinks = computed(() => {
  const links = [
    {
      key: 'orders',
      label: t('orders_label' as any),
      subtitle: profileCopy.value.ordersSubtitle,
      target: '#profile-orders',
      icon: ShoppingCart,
      badge: myOrders.value.length
    },
    {
      key: 'wishlist',
      label: t('wishlist_label' as any),
      subtitle: profileCopy.value.wishlistSubtitle,
      target: '/wishlist',
      icon: Heart,
      badge: wishlistStore.totalItems
    },
    {
      key: 'cart',
      label: t('cart_label' as any),
      subtitle: profileCopy.value.cartSubtitle,
      target: '/cart',
      icon: CreditCard,
      badge: cartStore.totalItems
    },
    {
      key: 'addresses',
      label: 'Ünvanlar',
      subtitle: profileCopy.value.addressSubtitle,
      target: '#profile-addresses',
      icon: MapPin,
      badge: savedAddresses.value.length
    },
    {
      key: 'tracking',
      label: profileCopy.value.trackingHub,
      subtitle: 'Sifarişi kod ilə yoxla',
      target: '/order-tracking',
      icon: FileText,
      badge: 0
    },
    {
      key: 'shop',
      label: profileCopy.value.continueShopping,
      subtitle: 'Yeni məhsullara bax',
      target: '/shop',
      icon: Sparkles,
      badge: 0
    }
  ] as Array<{ key: string; label: string; subtitle: string; target: string; icon: any; badge: number }>

  if (isSeller.value) {
    links.unshift({
      key: 'seller',
      label: profileCopy.value.sellerDesk,
      subtitle: 'Məhsul, sifariş və payout',
      target: '#profile-seller',
      icon: Store,
      badge: 0
    })
  }

  if (authStore.user?.role === 'Admin') {
    links.unshift({
      key: 'admin',
      label: profileCopy.value.adminDesk,
      subtitle: 'Bütün sistem idarəsi',
      target: adminPath(),
      icon: Shield,
      badge: 0
    })
  }

  return links
})

const goToAccountTarget = async (target: string) => {
  if (target.startsWith('#')) {
    if (!process.client) return
    const element = document.querySelector(target)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return
  }
  await navigateTo(target)
}

const logout = async () => {
  await authStore.logout()
  await navigateTo('/')
}

const syncSellerForm = () => {
  sellerForm.value = {
    shopName: authStore.user?.sellerProfile?.shopName || '',
    phone: authStore.user?.sellerProfile?.phone || authStore.user?.phone || '',
    note: authStore.user?.sellerProfile?.note || '',
    profileImage: authStore.user?.sellerProfile?.profileImage || '',
    profilePreview: authStore.user?.sellerProfile?.profileImage || '',
    coverImage: authStore.user?.sellerProfile?.coverImage || '',
    coverPreview: authStore.user?.sellerProfile?.coverImage || '',
    categoryIds: Array.isArray(authStore.user?.sellerProfile?.categoryIds) ? authStore.user!.sellerProfile!.categoryIds!.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value)) : []
  }
}

const uploadSellerMedia = async (event: Event, kind: 'profile' | 'cover') => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (kind === 'profile') uploadingProfileImage.value = true
  else uploadingCoverImage.value = true
  try {
    const prepared = await cropImageFile(file, kind === 'profile' ? { width: 720, height: 720 } : { width: 1600, height: 620 })
    const uploaded = await uploadPreparedImage(prepared.file)
    if (kind === 'profile') {
      sellerForm.value.profileImage = uploaded.url
      sellerForm.value.profilePreview = prepared.previewUrl
    } else {
      sellerForm.value.coverImage = uploaded.url
      sellerForm.value.coverPreview = prepared.previewUrl
    }
    toastStore.success(kind === 'profile' ? 'Profil şəkli hazırlandı' : 'Cover şəkli hazırlandı')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Şəkil hazırlana bilmədi')
  } finally {
    if (kind === 'profile') uploadingProfileImage.value = false
    else uploadingCoverImage.value = false
    input.value = ''
  }
}

const toggleSellerCategory = (categoryId: number) => {
  if (sellerForm.value.categoryIds.includes(categoryId)) {
    sellerForm.value.categoryIds = sellerForm.value.categoryIds.filter((id) => id !== categoryId)
    return
  }
  sellerForm.value.categoryIds = [...sellerForm.value.categoryIds, categoryId]
}

const saveSellerProfile = async () => {
  savingSellerProfile.value = true
  try {
    await $fetch('/api/profile/seller', {
      method: 'PUT',
      body: {
        sellerProfile: {
          shopName: sellerForm.value.shopName,
          phone: sellerForm.value.phone,
          note: sellerForm.value.note,
          profileImage: sellerForm.value.profileImage,
          coverImage: sellerForm.value.coverImage,
          categoryIds: sellerForm.value.categoryIds
        }
      }
    })
    await authStore.fetchSession()
    syncSellerForm()
    toastStore.success('Satıcı profilin yeniləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Profil yadda saxlanılmadı')
  } finally {
    savingSellerProfile.value = false
  }
}

const addAddress = async () => {
  if (!addressForm.value.label || !addressForm.value.recipient || !addressForm.value.phone || !addressForm.value.city || !addressForm.value.address) {
    toastStore.error('Ünvan sahələrini tamamlayın')
    return
  }
  savingAddresses.value = true
  try {
    const nextAddresses = [
      ...savedAddresses.value,
      {
        id: `addr-${Date.now()}`,
        ...addressForm.value,
        isDefault: savedAddresses.value.length === 0
      }
    ]
    await $fetch('/api/profile', {
      method: 'PUT',
      body: {
        name: authStore.user?.name,
        phone: authStore.user?.phone,
        addresses: nextAddresses
      }
    })
    await authStore.fetchSession()
    addressForm.value = { label: '', recipient: '', phone: '', city: '', address: '', zip: '' }
    toastStore.success('Ünvan əlavə olundu')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Ünvan əlavə olunmadı')
  } finally {
    savingAddresses.value = false
  }
}

const setDefaultAddress = async (addressId: string) => {
  savingAddresses.value = true
  try {
    const nextAddresses = savedAddresses.value.map((address: any) => ({
      ...address,
      isDefault: String(address.id) === String(addressId)
    }))
    await $fetch('/api/profile', {
      method: 'PUT',
      body: {
        name: authStore.user?.name,
        phone: authStore.user?.phone,
        addresses: nextAddresses
      }
    })
    await authStore.fetchSession()
    toastStore.success(`${profileCopy.value.defaultLabel} ünvan yeniləndi`)
  } catch (error: any) {
    toastStore.error(error?.data?.message || `${profileCopy.value.defaultLabel} ünvan yenilənmədi`)
  } finally {
    savingAddresses.value = false
  }
}

const reorder = (order: any) => {
  for (const item of Array.isArray(order?.items) ? order.items : []) {
    cartStore.addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || ''
    }, Number(item.qty || 1))
  }
  toastStore.success('Sifariş səbətə yenidən əlavə olundu')
}

const printInvoice = (order: any) => {
  if (!process.client) return
  const items = (Array.isArray(order?.items) ? order.items : []).map((item: any) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${item.qty}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${formatMoney(item.price)}</td>
    </tr>
  `).join('')
  const invoiceWindow = window.open('', '_blank', 'width=900,height=700')
  if (!invoiceWindow) return
  invoiceWindow.document.write(`
    <html><head><title>${order.id}</title></head><body style="font-family:Arial;padding:32px;">
    <h1>${profileCopy.value.invoiceTitle} ${order.id}</h1>
    <p>${profileCopy.value.customer}: ${order.customer}</p>
    <p>Email: ${order.email}</p>
    <p>${profileCopy.value.date}: ${formatOrderDate(order.date)}</p>
    <p>${profileCopy.value.tracking}: ${order.trackingCode || '-'}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:24px;">
      <thead><tr><th align="left" style="padding:10px;border-bottom:1px solid #d1d5db;">${profileCopy.value.product}</th><th align="left" style="padding:10px;border-bottom:1px solid #d1d5db;">${profileCopy.value.qty}</th><th align="left" style="padding:10px;border-bottom:1px solid #d1d5db;">${profileCopy.value.price}</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <h2 style="margin-top:24px;">${profileCopy.value.total}: ${formatMoney(order.amount)}</h2>
    </body></html>
  `)
  invoiceWindow.document.close()
  invoiceWindow.focus()
  invoiceWindow.print()
}

const requestOrderAction = async (order: any, type: 'cancel' | 'return') => {
  orderRequestLoading.value = `${order.id}-${type}`
  try {
    await orderStore.requestOrderAction(order.id, type)
    toastStore.success(type === 'cancel' ? 'Ləğv istəyi göndərildi' : 'Qaytarma istəyi göndərildi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Sorğu göndərilmədi')
  } finally {
    orderRequestLoading.value = null
  }
}

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await authStore.fetchSession()
  }
  if (!authStore.isLoggedIn) return
  wishlistStore.hydrate()
  await Promise.all([
    orderStore.fetchOrders(),
    categoryStore.fetchCategories(),
    settingsStore.fetchSettings()
  ])
  syncSellerForm()
})
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f6f9ff_0%,#ffffff_20%,#ffffff_100%)]">
    <div class="container py-8 sm:py-12 lg:py-16">
    <div v-if="!authStore.isLoggedIn" class="max-w-xl mx-auto bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-12 text-center">
      <User class="w-16 h-16 text-gray-300 mx-auto mb-6" />
      <h1 class="text-2xl font-extrabold text-gray-900 mb-3">Profil</h1>
      <p class="text-gray-500 font-medium mb-8">Profilinizi görmək üçün daxil olun.</p>
      <NuxtLink to="/login" class="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 inline-flex items-center">
        Daxil ol
      </NuxtLink>
    </div>

    <div v-else class="mx-auto max-w-6xl space-y-6 sm:space-y-8 lg:space-y-10">
      <div class="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,#1d4ed8_0%,#2B3E95_48%,#0f172a_100%)] p-5 text-white shadow-[0_30px_70px_-38px_rgba(37,99,235,0.75)] sm:rounded-[2.5rem] sm:p-8 lg:p-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0 flex-1">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/80">
              <Sparkles class="h-4 w-4 text-[#FACC15]" />
              {{ profileCopy.heroBadge }}
            </div>
            <div class="mt-5 flex items-start gap-4 sm:items-center">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10 text-lg font-extrabold text-white shadow-lg shadow-black/10 sm:h-20 sm:w-20 sm:text-2xl">
                <img v-if="profileAvatar" :src="profileAvatar" :alt="authStore.user?.name || profileCopy.pageTitle" class="h-full w-full object-cover" />
                <span v-else>{{ userInitials }}</span>
              </div>
              <div class="min-w-0">
                <h1 class="truncate text-[28px] font-black tracking-tight text-white sm:text-[34px]">{{ profileCopy.pageTitle }}</h1>
                <div class="mt-1 truncate text-sm font-semibold text-white/75 sm:text-base">{{ authStore.user?.name }} · {{ authStore.user?.role || 'Müştəri' }}</div>
                <div class="mt-2 truncate text-sm font-medium text-white/70">{{ authStore.user?.email }}</div>
              </div>
            </div>
            <p class="mt-5 max-w-2xl text-sm font-medium leading-7 text-white/75 sm:text-base">
              {{ profileCopy.pageSubtitle }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:min-w-[320px] sm:grid-cols-2">
            <div v-for="metric in accountMetrics" :key="metric.key" class="rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <div class="flex items-center justify-between gap-3">
                <component :is="metric.icon" class="h-4 w-4 text-[#FACC15]" />
                <div class="text-2xl font-extrabold text-white">{{ metric.value }}</div>
              </div>
              <div class="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white/60">{{ metric.label }}</div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/60">{{ profileCopy.profileCompletion }}</div>
            <div class="mt-2 flex items-center gap-3">
              <div class="h-2.5 flex-1 rounded-full bg-white/10">
                <div class="h-2.5 rounded-full bg-[#FACC15]" :style="{ width: `${profileCompletion}%` }"></div>
              </div>
              <div class="text-sm font-extrabold text-white">{{ profileCompletion }}%</div>
            </div>
          </div>
          <div v-if="settingsStore.settings.creativeSuite?.loyaltyEnabled" class="grid grid-cols-3 gap-3 sm:min-w-[330px]">
            <div class="rounded-2xl bg-white/10 px-3 py-3">
              <div class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/55">Loyalty</div>
              <div class="mt-2 text-lg font-extrabold text-white">{{ loyaltyPoints }}</div>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-3">
              <div class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/55">Badge</div>
              <div class="mt-2 text-lg font-extrabold text-white">{{ loyaltyBadge.label }}</div>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-3">
              <div class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/55">Referral</div>
              <div class="mt-2 truncate text-sm font-extrabold text-white">{{ referralCode }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <div class="text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-600">{{ profileCopy.quickActions }}</div>
            <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Mobil account hub</h2>
            <p class="mt-2 text-sm font-medium text-gray-500">Ən vacib hissələrə bir toxunuşla keçid.</p>
          </div>
          <div class="flex items-center gap-3">
            <NuxtLink v-if="authStore.user?.role === 'Satıcı'" to="/seller" class="bg-emerald-600 text-white px-7 py-3.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all">
              Satıcı paneli
            </NuxtLink>
            <NuxtLink v-if="authStore.user?.role === 'Admin'" :to="adminPath()" class="bg-gray-900 text-white px-7 py-3.5 rounded-2xl font-bold hover:bg-black transition-all">
              Admin Panel
            </NuxtLink>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <button
            v-for="link in accountQuickLinks"
            :key="link.key"
            type="button"
            class="group rounded-[1.5rem] border border-gray-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_22px_40px_-30px_rgba(37,99,235,0.45)]"
            @click="goToAccountTarget(link.target)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <component :is="link.icon" class="h-5 w-5" />
              </div>
              <div v-if="link.badge" class="rounded-full bg-[#FFF7CC] px-2.5 py-1 text-[11px] font-extrabold text-[#8A6A00]">{{ link.badge }}</div>
            </div>
            <div class="mt-4 text-sm font-extrabold text-gray-900">{{ link.label }}</div>
            <div class="mt-1 text-xs font-medium leading-5 text-gray-500">{{ link.subtitle }}</div>
            <div class="mt-4 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
              Aç
              <ChevronRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
            <div class="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
              <User class="w-4 h-4 mr-2" />
              Ad
            </div>
            <div class="text-lg font-extrabold text-gray-900">{{ authStore.user?.name }}</div>
          </div>
          <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
            <div class="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Mail class="w-4 h-4 mr-2" />
              Email
            </div>
            <div class="text-lg font-extrabold text-gray-900">{{ authStore.user?.email }}</div>
          </div>
          <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
            <div class="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Shield class="w-4 h-4 mr-2" />
              Rol
            </div>
            <div class="text-lg font-extrabold text-gray-900">{{ authStore.user?.role || 'Müştəri' }}</div>
          </div>
          <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
            <div class="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Heart class="w-4 h-4 mr-2" />
              {{ profileCopy.wishlistCount }}
            </div>
            <div class="text-lg font-extrabold text-gray-900">{{ wishlistStore.totalItems }}</div>
          </div>
          <div v-if="authStore.user?.role === 'Satıcı'" class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
            <div class="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Shield class="w-4 h-4 mr-2" />
              Mağaza
            </div>
            <div class="text-lg font-extrabold text-gray-900">{{ authStore.user?.sellerProfile?.shopName || '-' }}</div>
          </div>
        </div>
        <div v-if="settingsStore.settings.creativeSuite?.loyaltyEnabled" class="mt-6 rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">Loyalty program</div>
              <div class="mt-3 text-3xl font-extrabold text-gray-900">{{ loyaltyPoints }}</div>
              <div class="mt-1 text-sm font-medium text-gray-500">Toplam loyalty points</div>
            </div>
            <div>
              <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">Badge level</div>
              <div class="mt-3 text-3xl font-extrabold text-gray-900">{{ loyaltyBadge.label }}</div>
              <div class="mt-1 text-sm font-medium text-gray-500">Cari səviyyəniz</div>
            </div>
            <div>
              <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">Referral code</div>
              <div class="mt-3 text-xl font-extrabold text-gray-900 break-all">{{ referralCode }}</div>
              <div class="mt-1 text-sm font-medium text-gray-500">Paylaşın və {{ settingsStore.settings.creativeSuite?.referralRewardPoints || 0 }} bonus qazanın</div>
            </div>
          </div>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-[1fr,auto]">
          <NuxtLink to="/shop" class="inline-flex items-center justify-center rounded-[1.25rem] bg-[#FACC15] px-5 py-4 text-sm font-extrabold text-gray-900 shadow-[0_18px_35px_-24px_rgba(250,204,21,0.95)] transition-all hover:-translate-y-0.5 hover:brightness-95">
            {{ profileCopy.continueShopping }}
          </NuxtLink>
          <button type="button" class="inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-red-100 bg-red-50 px-5 py-4 text-sm font-extrabold text-red-600 transition-all hover:bg-red-100" @click="logout">
            <LogOut class="h-4 w-4" />
            {{ profileCopy.logout }}
          </button>
        </div>
      </div>

      <div v-if="isSeller" id="profile-seller" class="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm sm:p-8 lg:p-10">
        <div class="flex items-center justify-between gap-4 mb-8">
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Store class="w-6 h-6 mr-3 text-emerald-600" />
            Satıcı profilim
          </h2>
          <button type="button" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all" :disabled="savingSellerProfile" @click="saveSellerProfile">
            <Save class="w-4 h-4" />
            {{ savingSellerProfile ? 'Yadda saxlanır...' : 'Yadda saxla' }}
          </button>
        </div>

        <div class="space-y-8">
          <div class="rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-50">
            <div class="relative h-56 bg-gradient-to-r from-blue-100 to-indigo-100">
              <img v-if="sellerForm.coverPreview || sellerForm.coverImage" :src="sellerForm.coverPreview || sellerForm.coverImage" alt="" class="w-full h-full object-cover" />
              <div class="absolute inset-x-0 bottom-0 p-6 flex items-end gap-5 bg-gradient-to-t from-slate-950/45 to-transparent">
                <div class="w-28 h-28 rounded-[2rem] border-4 border-white bg-white overflow-hidden shadow-xl shrink-0">
                  <img v-if="sellerForm.profilePreview || sellerForm.profileImage" :src="sellerForm.profilePreview || sellerForm.profileImage" alt="" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <User class="w-10 h-10" />
                  </div>
                </div>
                <div class="flex-1 min-w-0 text-white pb-2">
                  <div class="text-2xl font-extrabold">{{ sellerForm.shopName || authStore.user?.sellerProfile?.shopName || authStore.user?.name }}</div>
                  <div class="mt-1 text-sm font-medium text-white/80">{{ sellerForm.note || 'Mağaza haqqında qısa təsvir əlavə et' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6 space-y-4">
              <div class="text-lg font-extrabold text-gray-900">Profil şəkli</div>
              <div class="w-32 h-32 rounded-[2rem] border border-gray-100 bg-white overflow-hidden flex items-center justify-center">
                <img v-if="sellerForm.profilePreview || sellerForm.profileImage" :src="sellerForm.profilePreview || sellerForm.profileImage" alt="" class="w-full h-full object-cover" />
                <User v-else class="w-10 h-10 text-gray-300" />
              </div>
              <label class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                <ImagePlus class="w-4 h-4" />
                {{ uploadingProfileImage ? 'Crop edilir...' : 'Şəkil seç və crop et' }}
                <input type="file" accept="image/*" class="hidden" @change="uploadSellerMedia($event, 'profile')" />
              </label>
              <input v-model="sellerForm.profileImage" type="text" placeholder="Profil şəkli linki" class="w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            </div>

            <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6 space-y-4">
              <div class="text-lg font-extrabold text-gray-900">Mağaza cover şəkli</div>
              <div class="h-32 rounded-[2rem] border border-gray-100 bg-white overflow-hidden flex items-center justify-center">
                <img v-if="sellerForm.coverPreview || sellerForm.coverImage" :src="sellerForm.coverPreview || sellerForm.coverImage" alt="" class="w-full h-full object-cover" />
                <ImagePlus v-else class="w-10 h-10 text-gray-300" />
              </div>
              <label class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                <ImagePlus class="w-4 h-4" />
                {{ uploadingCoverImage ? 'Hazırlanır...' : 'Cover seç və preview et' }}
                <input type="file" accept="image/*" class="hidden" @change="uploadSellerMedia($event, 'cover')" />
              </label>
              <input v-model="sellerForm.coverImage" type="text" placeholder="Cover şəkli linki" class="w-full px-4 py-3 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <input v-model="sellerForm.shopName" type="text" placeholder="Mağaza adı" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="sellerForm.phone" type="text" placeholder="Əlaqə nömrəsi" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium" />
          </div>

          <textarea v-model="sellerForm.note" rows="4" placeholder="Mağaza haqqında qeyd" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium resize-none"></textarea>

          <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6">
            <div class="text-lg font-extrabold text-gray-900">Satış kateqoriyaları</div>
            <div class="mt-2 text-sm font-medium text-gray-500">Kateqoriya kartları şəkilli görünür, hərf fallback istifadə olunmur.</div>
            <div class="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[320px] overflow-auto pr-1">
              <button
                v-for="category in categoryOptions"
                :key="category.id"
                type="button"
                @click="toggleSellerCategory(category.id)"
                :class="['rounded-[1.5rem] border p-3 text-left transition-all', sellerForm.categoryIds.includes(category.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200']"
              >
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl border border-gray-100 bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    <img v-if="category.image" :src="category.image" alt="" class="w-full h-full object-cover" />
                    <Store v-else class="w-4 h-4 text-gray-300" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-extrabold" :class="sellerForm.categoryIds.includes(category.id) ? 'text-blue-700' : 'text-gray-900'">{{ category.label }}</div>
                  </div>
                  <div v-if="sellerForm.categoryIds.includes(category.id)" class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check class="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="profile-addresses" class="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm sm:p-8 lg:p-10">
        <div class="flex items-center justify-between gap-4 mb-8">
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <MapPin class="w-6 h-6 mr-3 text-blue-600" />
            Ünvan kitabçam
          </h2>
          <div class="text-sm font-bold text-gray-400">Cəmi: {{ savedAddresses.length }}</div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="address in savedAddresses"
              :key="address.id"
              class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="text-lg font-extrabold text-gray-900">{{ address.label }}</div>
                <div v-if="address.isDefault" class="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">{{ profileCopy.defaultLabel }}</div>
              </div>
              <div class="mt-3 text-sm font-medium text-gray-600">{{ address.recipient }}</div>
              <div class="mt-1 text-sm font-medium text-gray-500">{{ address.phone }}</div>
              <div class="mt-3 text-sm font-medium text-gray-500">{{ address.address }}, {{ address.city }}</div>
              <div v-if="address.zip" class="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">{{ address.zip }}</div>
              <button
                v-if="!address.isDefault"
                type="button"
                class="mt-5 inline-flex items-center rounded-2xl bg-white border border-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all"
                :disabled="savingAddresses"
                @click="setDefaultAddress(address.id)"
              >
                {{ profileCopy.setDefault }}
              </button>
            </div>
            <div v-if="savedAddresses.length === 0" class="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 p-8 text-sm font-medium text-gray-500">
              Hələ ünvan əlavə etməmisiniz.
            </div>
          </div>

          <div class="rounded-[2rem] border border-gray-100 bg-gray-50/70 p-6 space-y-4">
            <div class="text-lg font-extrabold text-gray-900">Yeni ünvan</div>
            <input v-model="addressForm.label" type="text" placeholder="Ev, Ofis və s." class="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="addressForm.recipient" type="text" placeholder="Qəbul edən şəxs" class="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="addressForm.phone" type="text" placeholder="+994..." class="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="addressForm.city" type="text" placeholder="Şəhər" class="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="addressForm.address" type="text" placeholder="Küçə, bina, mənzil" class="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <input v-model="addressForm.zip" type="text" placeholder="Poçt indeksi" class="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-blue-600 outline-none transition-all text-sm font-medium" />
            <button type="button" class="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-all disabled:opacity-60" :disabled="savingAddresses" @click="addAddress">
              {{ savingAddresses ? 'Yadda saxlanır...' : 'Ünvan əlavə et' }}
            </button>
          </div>
        </div>
      </div>

      <div id="profile-orders" class="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm sm:p-8 lg:p-10">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <ShoppingCart class="w-6 h-6 mr-3 text-blue-600" />
            Sifarişlərim
          </h2>
          <div class="text-sm font-bold text-gray-400">Cəmi: {{ myOrders.length }}</div>
        </div>

        <div v-if="myOrders.length === 0" class="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-12 text-center">
          <p class="text-gray-500 font-medium">Hələ sifarişiniz yoxdur.</p>
          <NuxtLink to="/shop" class="inline-flex mt-6 bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Mağazaya bax
          </NuxtLink>
        </div>

        <div v-else class="hidden md:block overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th class="px-6 py-4">ID</th>
                <th class="px-6 py-4">Tarix</th>
                <th class="px-6 py-4">Məhsullar</th>
                <th class="px-6 py-4">Tracking</th>
                <th class="px-6 py-4">Məbləğ</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="o in myOrders" :key="o.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-5 text-sm font-bold text-blue-600">{{ o.id }}</td>
                <td class="px-6 py-5 text-sm text-gray-500 font-medium">{{ formatOrderDate(o.date) }}</td>
                <td class="px-6 py-5">
                  <div class="text-sm font-bold text-gray-900">{{ orderItemsPreview(o) }}</div>
                  <div class="mt-1 text-xs font-medium text-gray-400">{{ Array.isArray(o.items) ? o.items.length : 0 }} məhsul</div>
                </td>
                <td class="px-6 py-5 text-sm font-extrabold text-gray-900">{{ o.trackingCode || '-' }}</td>
                <td class="px-6 py-5 text-sm font-extrabold text-gray-900">{{ formatMoney(o.amount) }}</td>
                <td class="px-6 py-5">
                  <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', o.statusColor]">{{ o.status.toUpperCase() }}</span>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" class="px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all" @click="reorder(o)">
                      Yenidən sifariş et
                    </button>
                    <button type="button" class="px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all" @click="printInvoice(o)">
                      {{ profileCopy.invoice }}
                    </button>
                    <button v-if="!['Çatdırıldı','İptal edildi','Qaytarıldı','Ləğv istəyi'].includes(o.status)" type="button" class="px-3 py-2 rounded-xl border border-amber-100 bg-amber-50 text-xs font-bold text-amber-700 transition-all disabled:opacity-60" :disabled="orderRequestLoading === `${o.id}-cancel`" @click="requestOrderAction(o, 'cancel')">
                      Ləğv istəyi
                    </button>
                    <button v-if="o.status === 'Çatdırıldı'" type="button" class="px-3 py-2 rounded-xl border border-amber-100 bg-amber-50 text-xs font-bold text-amber-700 transition-all disabled:opacity-60" :disabled="orderRequestLoading === `${o.id}-return`" @click="requestOrderAction(o, 'return')">
                      Qaytarma istəyi
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="myOrders.length > 0" class="md:hidden space-y-4">
          <div v-for="o in myOrders" :key="o.id" class="rounded-3xl border border-gray-100 bg-gray-50/70 p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-extrabold text-blue-600">{{ o.id }}</div>
                <div class="mt-1 text-xs font-medium text-gray-500">{{ formatOrderDate(o.date) }}</div>
              </div>
              <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', o.statusColor]">{{ o.status.toUpperCase() }}</span>
            </div>
            <div class="mt-4 rounded-2xl bg-white border border-gray-100 px-4 py-3">
              <div class="text-[11px] font-bold uppercase tracking-widest text-gray-400">Məhsullar</div>
              <div class="mt-2 text-sm font-bold text-gray-900">{{ orderItemsPreview(o) }}</div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div class="text-[11px] font-bold uppercase tracking-widest text-gray-400">Tracking</div>
                <div class="mt-1 font-bold text-gray-900">{{ o.trackingCode || '-' }}</div>
              </div>
              <div>
                <div class="text-[11px] font-bold uppercase tracking-widest text-gray-400">Məbləğ</div>
                <div class="mt-1 font-bold text-gray-900">{{ formatMoney(o.amount) }}</div>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button type="button" class="px-4 py-2 rounded-xl border border-gray-100 bg-white text-xs font-bold text-gray-700" @click="reorder(o)">
                Yenidən sifariş et
              </button>
              <button type="button" class="px-4 py-2 rounded-xl border border-gray-100 bg-white text-xs font-bold text-gray-700" @click="printInvoice(o)">
                {{ profileCopy.invoice }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
