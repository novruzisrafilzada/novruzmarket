<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ShoppingCart, Star, Minus, Plus } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useProductStore } from '~/stores/products'
import { buildProductHref } from '~/utils/product-route'

const props = defineProps<{
  modelValue: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const cartStore = useCartStore()
const productStore = useProductStore()
const { formatMoney } = useMoney()
const { t } = useT()
const { nameOf, descOf } = useProductText()

const open = computed(() => props.modelValue !== null)
const activeImageIndex = ref(0)
const qty = ref(1)
const imageFailed = ref(false)

const product = computed(() => {
  if (props.modelValue === null) return null
  return productStore.getProductById(props.modelValue) || null
})

const images = computed(() => {
  const p = product.value
  if (!p) return []
  const variationImgs = (p.variations || []).map(v => String(v.image || '').trim()).filter(Boolean)
  const raw = [p.image, ...(p.gallery || []), ...variationImgs].map(s => String(s || '').trim()).filter(Boolean)
  return Array.from(new Set(raw))
})

const activeImageSrc = computed(() => images.value[activeImageIndex.value] || product.value?.image || '')
const normalizedStock = computed(() => {
  const raw = Number(product.value?.stock || 0)
  return Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0
})
const maxQty = computed(() => Math.max(1, normalizedStock.value || 1))
const canAddToCart = computed(() => normalizedStock.value > 0)

const priceLabel = computed(() => {
  const p = product.value
  if (!p) return ''
  const prices = (p.variations || []).map(v => Number(v.price || 0)).filter(n => Number.isFinite(n) && n > 0)
  if (prices.length === 0) return formatMoney(p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatMoney(min) : `${formatMoney(min)} - ${formatMoney(max)}`
})

const skuLabel = computed(() => {
  const p = product.value
  if (!p) return ''
  const raw = (p as any).sku
  const sku = String(raw || '').trim()
  return sku || `SKU-${String(p.id).padStart(4, '0')}`
})

const close = () => emit('update:modelValue', null)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

watch(product, () => {
  activeImageIndex.value = 0
  qty.value = 1
  imageFailed.value = false
})

watch(activeImageSrc, () => {
  imageFailed.value = false
})

watch(open, (isOpen) => {
  if (process.server) return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

watch(open, async (isOpen) => {
  if (!isOpen || productStore.hydrated) return
  await productStore.fetchProducts()
})

watch(normalizedStock, (stock) => {
  qty.value = Math.max(1, Math.min(Math.max(1, stock || 1), qty.value))
})

onMounted(() => {
  if (process.server) return
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  if (process.server) return
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

const decQty = () => {
  qty.value = Math.max(1, qty.value - 1)
}

const incQty = () => {
  qty.value = Math.min(maxQty.value, qty.value + 1)
}

const addQtyToCart = (p: any) => {
  const times = Math.max(1, Math.floor(Number(qty.value) || 1))
  cartStore.addToCart(p, times)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm qv-fade-in" @click="close"></div>
    <div class="bg-white rounded-[1.75rem] w-full max-w-5xl relative z-10 overflow-hidden shadow-2xl qv-zoom-in">
      <button type="button" class="absolute top-5 right-5 w-10 h-10 bg-white rounded-full text-gray-500 hover:text-gray-900 transition-all border border-gray-100 shadow-sm" @click="close">
        ✕
      </button>

      <div v-if="product" class="p-5 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <div class="space-y-6">
          <div class="bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center w-full mx-auto max-w-[560px] aspect-[4/3] sm:aspect-square">
            <img v-if="activeImageSrc && !imageFailed" :src="activeImageSrc" :alt="nameOf(product)" class="w-[90%] h-[90%] object-contain" @error="imageFailed = true" />
            <div v-else class="text-sm font-bold text-gray-400">Şəkil yoxdur</div>
          </div>
          <div class="flex items-center gap-3 sm:gap-4 overflow-x-auto">
            <button
              v-for="(img, idx) in images"
              :key="img"
              type="button"
              @click="activeImageIndex = idx"
              :class="['w-16 h-16 sm:w-20 sm:h-20 rounded-xl border flex items-center justify-center bg-white overflow-hidden flex-shrink-0 transition-all', idx === activeImageIndex ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-100 hover:border-yellow-200']"
            >
              <img :src="img" :alt="nameOf(product)" class="w-full h-full object-contain" />
            </button>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{{ nameOf(product) }}</h2>
          </div>

          <div class="text-2xl font-extrabold text-gray-900">
            {{ priceLabel }}
          </div>

          <div v-if="Number((product as any).reviewCount || 0) > 0" class="flex items-center gap-2 text-gray-500">
            <div class="flex items-center">
              <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'" />
            </div>
            <span class="text-xs font-extrabold">{{ Number(product.rating || 0).toFixed(1) }}</span>
          </div>

          <div class="border-t pt-5 text-gray-600">
            <ul v-if="(product.features || []).length" class="space-y-2 text-sm font-medium list-disc pl-5">
              <li v-for="f in product.features?.slice(0, 4)" :key="f">{{ f }}</li>
            </ul>
            <p v-else class="text-sm font-medium leading-relaxed whitespace-pre-line">
              {{ descOf(product) || product.seo?.description || '' }}
            </p>
          </div>

          <div>
            <template v-if="canAddToCart">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border border-green-200 bg-green-50 text-green-700">
                <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {{ t('in_stock' as any) }}
              </span>
            </template>
            <template v-else>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border border-red-200 bg-red-50 text-red-700">
                <span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                {{ t('out_of_stock' as any) }}
              </span>
            </template>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden h-12 w-full sm:w-auto">
              <button type="button" class="w-12 h-12 flex items-center justify-center hover:bg-gray-50" @click="decQty">
                <Minus class="w-4 h-4 text-gray-700" />
              </button>
              <div class="flex-1 min-w-[56px] text-center font-bold text-gray-900">{{ qty }}</div>
              <button type="button" class="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50" :disabled="qty >= maxQty" @click="incQty">
                <Plus class="w-4 h-4 text-gray-700" />
              </button>
            </div>
            <button
              type="button"
              class="h-12 w-full sm:w-auto px-8 bg-yellow-400 text-gray-900 rounded-lg font-extrabold hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-100 flex items-center justify-center"
              :disabled="!canAddToCart"
              :class="!canAddToCart ? 'opacity-50 cursor-not-allowed' : ''"
              @click="addQtyToCart(product)"
            >
              <ShoppingCart class="w-5 h-5 mr-2" /> {{ t('add_to_cart') }}
            </button>
          </div>

          <div class="text-sm text-gray-600 space-y-2">
            <div><span class="font-bold text-gray-800">Məhsulun kodu:</span> <span class="ml-2">{{ skuLabel }}</span></div>
            <div><span class="font-bold text-gray-800">Categories:</span> <span class="ml-2">{{ product.category }}</span></div>
            <div v-if="(product.tags || []).length"><span class="font-bold text-gray-800">Tags:</span> <span class="ml-2">{{ product.tags?.join(', ') }}</span></div>
          </div>

          <div class="pt-2">
            <NuxtLink :to="buildProductHref(product)" class="inline-flex items-center font-bold text-gray-700 hover:text-blue-600 transition-colors" @click="close">
              Məhsula bax
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="bg-gray-50 rounded-[2rem] mx-auto w-full max-w-[367px] aspect-square animate-pulse"></div>
        <div class="space-y-4">
          <div class="h-8 w-40 bg-gray-100 rounded-xl animate-pulse"></div>
          <div class="h-4 w-full bg-gray-100 rounded-xl animate-pulse"></div>
          <div class="h-4 w-5/6 bg-gray-100 rounded-xl animate-pulse"></div>
          <div class="h-12 w-full bg-gray-100 rounded-2xl animate-pulse mt-6"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes qvFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes qvZoomIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.qv-fade-in {
  animation: qvFadeIn 160ms ease-out both;
}

.qv-zoom-in {
  animation: qvZoomIn 180ms ease-out both;
}
</style>
