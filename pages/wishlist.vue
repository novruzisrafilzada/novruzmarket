<script setup lang="ts">
import { computed } from 'vue'
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-vue-next'
import { buildProductHref } from '~/utils/product-route'

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const { formatMoney } = useMoney()
const { t, lang } = useT()

const wishlistCopy = computed(() => {
  if (lang.value === 'ru') {
    return {
      title: 'Список желаний',
      description: 'Сохраняйте понравившиеся товары и возвращайтесь к ним в любой момент.',
      clear: 'Очистить список',
      emptyTitle: 'Пока ничего не выбрано',
      emptyDesc: 'Добавьте товары из магазина, и они появятся здесь.',
      shop: 'Перейти в магазин'
    }
  }
  if (lang.value === 'en') {
    return {
      title: 'Wishlist',
      description: 'Save products you like and come back to them any time.',
      clear: 'Clear list',
      emptyTitle: 'No products saved yet',
      emptyDesc: 'Add products from the shop and they will appear here.',
      shop: 'Go to shop'
    }
  }
  return {
    title: 'İstək listəsi',
    description: 'Bəyəndiyiniz məhsulları burada saxlayın və istədiyiniz zaman səbətə əlavə edin.',
    clear: 'Siyahını təmizlə',
    emptyTitle: 'Hələ məhsul seçilməyib',
    emptyDesc: 'Mağazadan məhsul bəyənin, sonra onlar burada görünəcək.',
    shop: 'Mağazaya keç'
  }
})

useSiteSeo({
  title: computed(() => wishlistCopy.value.title),
  description: computed(() => wishlistCopy.value.description),
  path: computed(() => '/wishlist')
})

onMounted(() => {
  wishlistStore.hydrate()
})

const submitAlert = async (item: any) => {
  const type = Number(item?.stock || 0) > 0 ? 'price_drop' : 'restock'
  const email = String((authStore.user as any)?.email || '').trim()
  if (!email || !email.includes('@')) {
    toastStore.error(String(t('alert_email_label')))
    return
  }
  try {
    await $fetch('/api/product-alerts', {
      method: 'POST',
      body: {
        productId: Number(item?.id || 0),
        productName: String(item?.name || '').trim(),
        email,
        type
      }
    })
    toastStore.success(type === 'restock' ? String(t('alert_restock_saved')) : String(t('alert_price_drop_saved')))
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || String(t('order_failed')))
  }
}
</script>

<template>
  <div class="container py-16 md:py-24">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">{{ wishlistCopy.title }}</h1>
          <p class="mt-3 text-gray-500 font-medium">{{ wishlistCopy.description }}</p>
        </div>
        <button v-if="wishlistStore.items.length" type="button" class="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all" @click="wishlistStore.clear()">
          {{ wishlistCopy.clear }}
        </button>
      </div>

      <div v-if="!wishlistStore.items.length" class="bg-white border border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center shadow-sm">
        <Heart class="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <div class="text-2xl font-extrabold text-gray-900">{{ wishlistCopy.emptyTitle }}</div>
        <p class="mt-3 text-gray-500 font-medium">{{ wishlistCopy.emptyDesc }}</p>
        <NuxtLink to="/shop" class="inline-flex mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          {{ wishlistCopy.shop }}
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="item in wishlistStore.items" :key="item.id" class="bg-white border border-gray-100 rounded-[2.25rem] p-6 shadow-sm flex flex-col">
          <NuxtLink :to="buildProductHref(item)" class="rounded-[1.75rem] bg-gray-50 h-64 flex items-center justify-center overflow-hidden">
            <img :src="item.image" :alt="item.name" class="w-full h-full object-contain p-6" />
          </NuxtLink>

          <div class="mt-6 flex-1">
            <div class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{{ item.category || 'Məhsul' }}</div>
            <NuxtLink :to="buildProductHref(item)" class="mt-3 block text-xl font-extrabold text-gray-900 hover:text-blue-600 transition-colors">
              {{ item.name }}
            </NuxtLink>

            <div class="mt-4 flex items-center gap-2">
              <div class="flex items-center gap-1 text-amber-400">
                <Star v-for="index in 5" :key="index" class="w-4 h-4" :fill="index <= Math.round(Number(item.rating || 0)) ? 'currentColor' : 'none'" />
              </div>
              <span class="text-sm font-bold text-gray-500">{{ Number(item.rating || 0).toFixed(1) }}</span>
            </div>

            <div class="mt-4 flex items-end gap-3">
              <div class="text-2xl font-extrabold text-gray-900">{{ formatMoney(item.price) }}</div>
              <div v-if="item.oldPrice" class="text-sm font-bold text-gray-400 line-through">{{ formatMoney(item.oldPrice) }}</div>
            </div>

            <div class="mt-4 inline-flex px-3 py-1 rounded-full text-xs font-extrabold" :class="Number(item.stock || 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'">
              {{ Number(item.stock || 0) > 0 ? t('in_stock' as any) : t('out_of_stock' as any) }}
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button type="button" class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-60" :disabled="Number(item.stock || 0) <= 0" @click="cartStore.addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })">
              <ShoppingCart class="w-4 h-4" />
              {{ t('add_to_cart') }}
            </button>
            <button type="button" class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-red-50 hover:text-red-600 transition-all" @click="wishlistStore.remove(item.id)">
              <Trash2 class="w-4 h-4" />
              Sil
            </button>
          </div>
          <button type="button" class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700" @click="submitAlert(item)">
            <Heart class="w-4 h-4" />
            {{ Number(item.stock || 0) > 0 ? t('notify_price_drop') : t('notify_restock') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
