<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CheckCircle2, CreditCard, Banknote, ArrowRight, ChevronLeft, Truck, MapPin, User, ShieldCheck, LocateFixed, LoaderCircle } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useOrderStore } from '~/stores/orders'
import { useProductStore } from '~/stores/products'
import { useSettingsStore } from '~/stores/settings'
import { useShippingStore } from '~/stores/shipping'
import { useToastStore } from '~/stores/toast'
import { AZERBAIJAN_LOCATIONS, matchAzerbaijanLocation, normalizeAzerbaijanLocation } from '~/utils/azerbaijan-locations'

definePageMeta({ middleware: 'require-auth' })

const cartStore = useCartStore()
const orderStore = useOrderStore()
const productStore = useProductStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const shippingStore = useShippingStore()
const toastStore = useToastStore()
const router = useRouter()
const route = useRoute()
const { formatMoney } = useMoney()
const { t, lang } = useT()
const { profileFor } = useMobileDensity()
const checkoutDensity = profileFor('checkout')

const step = ref(1)
const paymentMethod = ref('card') // 'card' or 'cash'
const submitting = ref(false)
const selectedShippingMethodId = ref<number | null>(null)
const cardMethodConfig = computed(() => settingsStore.settings.paymentMethods?.find((method) => method.key === 'card'))
const cashMethodConfig = computed(() => settingsStore.settings.paymentMethods?.find((method) => method.key === 'cash'))
const cardPaymentReady = computed(() => {
  const integrations = settingsStore.settings.integrations
  return Boolean(
    integrations?.paymentProvider === 'stripe'
    && cardMethodConfig.value?.enabled
    && integrations?.paymentApiKey?.trim()
    && integrations?.paymentSecret?.trim()
    && integrations?.paymentCallbackUrl?.trim()
  )
})
const cashPaymentReady = computed(() => Boolean(cashMethodConfig.value?.enabled))

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: ''
})
const cityDetectionLoading = ref(false)
const cityDetectionSource = ref('')
const cityDetectionMessage = ref('')
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
const isValidPhone = (value: string) => /^\+?[0-9\s\-()]{9,20}$/.test(String(value || '').trim())
const isValidName = (value: string) => String(value || '').trim().length >= 4
const isValidAddress = (value: string) => String(value || '').trim().length >= 8

const cityOptions = computed(() =>
  Array.from(new Set(AZERBAIJAN_LOCATIONS))
    .sort((left, right) => left.localeCompare(right, 'az'))
)
const normalizedSelectedCity = computed(() => {
  const exact = matchAzerbaijanLocation(formData.value.city)
  return normalizeAzerbaijanLocation(exact || formData.value.city)
})
const checkoutAccentStyle = computed(() => ({
  backgroundColor: checkoutUi.value?.checkoutAccentBg || '#EFF6FF',
  color: checkoutUi.value?.checkoutAccentText || '#1D4ED8'
}))
const checkoutAccentSoftStyle = computed(() => ({
  backgroundColor: `${checkoutUi.value?.checkoutAccentBg || '#EFF6FF'}CC`,
  borderColor: `${checkoutUi.value?.checkoutAccentText || '#1D4ED8'}22`
}))
const checkoutSummaryStyle = computed(() => ({
  backgroundColor: checkoutUi.value?.checkoutAccentText || '#1D4ED8',
  borderColor: `${checkoutUi.value?.checkoutAccentText || '#1D4ED8'}`
}))

const savedAddresses = computed(() => Array.isArray(authStore.user?.addresses) ? authStore.user!.addresses! : [])
const availableShippingMethods = computed(() => {
  const city = normalizedSelectedCity.value
  const methods = shippingStore.methods.filter((method) => {
    if (method.status !== 'Aktiv') return false
    if (!Array.isArray(method.regions) || method.regions.length === 0) return true
    if (!city) return true
    return method.regions.some((region) => {
      const normalizedRegion = normalizeAzerbaijanLocation(String(region || ''))
      return normalizedRegion === city || normalizedRegion.includes(city) || city.includes(normalizedRegion)
    })
  })
  if (methods.length === 0) {
    return shippingStore.methods.filter((method) => method.status === 'Aktiv')
  }
  return methods
})
const selectedShippingMethod = computed(() =>
  availableShippingMethods.value.find((method) => Number(method.id) === Number(selectedShippingMethodId.value))
  || availableShippingMethods.value[0]
  || null
)
const shippingFee = computed(() => {
  if (!selectedShippingMethod.value) return 0
  const subtotal = cartStore.totalPrice - Number(cartStore.discountAmount || 0)
  const freeOver = Number(selectedShippingMethod.value.freeOver || 0)
  if (freeOver > 0 && subtotal >= freeOver) return 0
  return Number(selectedShippingMethod.value.price || 0)
})
const checkoutTotal = computed(() => Math.max(0, cartStore.totalPrice - Number(cartStore.discountAmount || 0) + shippingFee.value))
const checkoutUi = computed(() => settingsStore.settings.cartCheckout)
const checkoutTrustBadges = computed(() => (checkoutUi.value?.checkoutTrustBadges || []).filter((item) => item.enabled && String(item.label || '').trim()))
const preferredCheckoutEmail = computed(() => {
  const typed = String(formData.value.email || '').trim()
  if (isValidEmail(typed)) return typed
  const accountEmail = String(authStore.user?.email || '').trim()
  if (isValidEmail(accountEmail)) return accountEmail
  return ''
})
const checkoutPrimaryActionLabel = computed(() => step.value === 1 ? 'Ödənişə keç' : (submitting.value ? String(t('sending')) : String(t('checkout_finish'))))
const checkoutFieldErrors = computed(() => ({
  fullName: !isValidName(formData.value.fullName),
  email: !preferredCheckoutEmail.value,
  phone: !isValidPhone(formData.value.phone),
  address: !isValidAddress(formData.value.address),
  city: !String(formData.value.city || '').trim(),
  shipping: !selectedShippingMethod.value
}))

const checkoutCopy = computed(() => {
  if (lang.value === 'ru') {
    return {
      seoTitle: 'Оформление заказа',
      seoDescription: 'Безопасное оформление заказа с доставкой, сохранёнными адресами и прозрачной оплатой через Stripe Checkout.',
      personalInfo: 'Личные данные',
      fullName: 'Полное имя',
      fullNamePlaceholder: 'Имя и фамилия',
      email: 'Email',
      phone: 'Телефон',
      addressTitle: 'Адрес доставки',
      defaultAddress: 'Основной',
      address: 'Адрес',
      addressPlaceholder: 'Улица, квартира и т.д.',
      city: 'Город',
      cityPlaceholder: 'Баку',
      zip: 'Почтовый индекс',
      shippingMethod: 'Способ доставки',
      allRegions: 'Все регионы',
      paymentMethod: 'Способ оплаты',
      cardFallback: 'Оплата картой',
      cashFallback: 'Оплата наличными',
      cardReady: 'После подтверждения вы перейдёте на защищённую страницу Stripe для ввода данных карты.',
      cardNotReady: 'Метод откроется после настройки провайдера, API, secret и callback в админке.',
      cashReady: 'Оплата при получении активна.',
      cashNotReady: 'Включите этот метод снова в админке.',
      stripeTitle: 'Безопасная оплата через Stripe',
      stripeDescription: 'Номер карты, срок действия и CVC вводятся не здесь. После подтверждения вы будете перенаправлены на защищённую страницу Stripe.',
      stripePointOne: 'Защищённая платёжная страница Stripe',
      stripePointTwo: 'Возврат на сайт при отмене или успешной оплате',
      stripePointThree: 'Сумма заказа и доставка фиксируются до перехода',
      summaryTitle: 'Сводка заказа',
      shippingFee: 'Стоимость доставки',
      back: 'Назад',
      cancelled: 'Оплата картой отменена',
      fillRequired: 'Заполните данные и выберите способ доставки',
      cardDisabled: 'Оплата картой пока не активна',
      cashDisabled: 'Оплата наличными сейчас недоступна'
    }
  }
  if (lang.value === 'en') {
    return {
      seoTitle: 'Checkout',
      seoDescription: 'Secure checkout with delivery selection, saved addresses and transparent Stripe Checkout payment flow.',
      personalInfo: 'Personal information',
      fullName: 'Full name',
      fullNamePlaceholder: 'First and last name',
      email: 'Email',
      phone: 'Phone',
      addressTitle: 'Delivery address',
      defaultAddress: 'Primary',
      address: 'Address',
      addressPlaceholder: 'Street, apartment and more',
      city: 'City',
      cityPlaceholder: 'Baku',
      zip: 'Postal code',
      shippingMethod: 'Shipping method',
      allRegions: 'All regions',
      paymentMethod: 'Payment method',
      cardFallback: 'Pay by card',
      cashFallback: 'Cash on delivery',
      cardReady: 'You will be redirected to Stripe’s secure payment page to enter card details after confirmation.',
      cardNotReady: 'This method becomes available after provider, API, secret and callback are configured in admin.',
      cashReady: 'Cash on delivery is active.',
      cashNotReady: 'Re-enable this method in admin.',
      stripeTitle: 'Secure Stripe checkout',
      stripeDescription: 'Card number, expiry date and CVC are not collected here. After confirmation, you will continue on Stripe’s secure hosted page.',
      stripePointOne: 'Protected Stripe-hosted payment page',
      stripePointTwo: 'Returns to the site on cancel or success',
      stripePointThree: 'Order total and shipping are locked before redirect',
      summaryTitle: 'Order summary',
      shippingFee: 'Shipping fee',
      back: 'Go back',
      cancelled: 'Card payment was cancelled',
      fillRequired: 'Complete the customer details and delivery method',
      cardDisabled: 'Card payment is not active yet',
      cashDisabled: 'Cash payment is currently unavailable'
    }
  }
  return {
    seoTitle: 'Checkout',
    seoDescription: 'Çatdırılma seçimi, yadda saxlanmış ünvanlar və şəffaf Stripe Checkout axını ilə təhlükəsiz sifariş tamamlayın.',
    personalInfo: 'Şəxsi Məlumatlar',
    fullName: 'Tam Adınız',
    fullNamePlaceholder: 'Ad və Soyad',
    email: 'E-poçt',
    phone: 'Telefon',
    addressTitle: 'Çatdırılma Ünvanı',
    defaultAddress: 'Əsas',
    address: 'Ünvan',
    addressPlaceholder: 'Küçə, mənzil və s.',
    city: 'Şəhər',
    cityPlaceholder: 'Bakı',
    zip: 'Poçt İndeksi',
    shippingMethod: 'Çatdırılma üsulu',
    allRegions: 'Bütün bölgələr',
    paymentMethod: 'Ödəniş Metodu',
    cardFallback: 'Kart ilə ödəniş',
    cashFallback: 'Nağd ödəniş',
    cardReady: 'Təsdiqdən sonra kart məlumatlarını Stripe-in təhlükəsiz səhifəsində daxil edəcəksiniz.',
    cardNotReady: 'Admin paneldə provider, API, secret və callback əlavə olunanda açılır.',
    cashReady: 'Qapıda ödəniş aktivdir.',
    cashNotReady: 'Bu metodu admin paneldən yenidən aktiv etməlisiniz.',
    stripeTitle: 'Stripe ilə təhlükəsiz ödəniş',
    stripeDescription: 'Kart nömrəsi, müddət və CVC bu səhifədə toplanmır. Təsdiqdən sonra sizi Stripe-in təhlükəsiz ödəniş səhifəsinə yönləndirəcəyik.',
    stripePointOne: 'Stripe tərəfindən qorunan hosted payment page',
    stripePointTwo: 'Ləğv və ya uğurlu ödənişdən sonra sayta geri dönüş',
    stripePointThree: 'Redirect-dən əvvəl sifariş məbləği və çatdırılma yekunlaşır',
    summaryTitle: 'Sifarişin Xülasəsi',
    shippingFee: 'Çatdırılma haqqı',
    back: 'Geri qayıt',
    cancelled: 'Kart ödənişi ləğv edildi',
    fillRequired: 'Məlumatları və çatdırılma üsulunu tamamlayın',
    cardDisabled: 'Kartla ödəniş hələ aktiv deyil',
    cashDisabled: 'Nağd ödəniş hazırda aktiv deyil'
  }
})

useSiteSeo({
  title: computed(() => checkoutCopy.value.seoTitle),
  description: computed(() => checkoutCopy.value.seoDescription),
  path: computed(() => route.fullPath)
})

watch(availableShippingMethods, (methods) => {
  if (methods.length > 0 && !methods.find((m) => Number(m.id) === Number(selectedShippingMethodId.value))) {
    selectedShippingMethodId.value = Number(methods[0].id)
  }
})

const syncCartWithProducts = (showToast = false) => {
  const validProductIds = new Set(productStore.products.map((product) => Number(product.id)))
  const removedKeys = cartStore.items
    .filter((item) => !validProductIds.has(Number(item.id)))
    .map((item) => item.cartKey)

  for (const cartKey of removedKeys) {
    cartStore.removeFromCart(cartKey)
  }

  if (showToast && removedKeys.length > 0) {
    toastStore.error(`Səbətdəki ${removedKeys.length} məhsul artıq mövcud olmadığı üçün silindi.`)
  }

  return removedKeys.length
}

const selectSavedAddress = (address: any) => {
  formData.value.fullName = String(address?.recipient || authStore.user?.name || '')
  if (!isValidEmail(formData.value.email)) {
    const addressEmail = String(address?.email || '')
    const accountEmail = String(authStore.user?.email || '')
    formData.value.email = isValidEmail(addressEmail) ? addressEmail : (isValidEmail(accountEmail) ? accountEmail : '')
  }
  formData.value.phone = String(address?.phone || authStore.user?.phone || '')
  formData.value.address = String(address?.address || '')
  formData.value.city = matchAzerbaijanLocation(String(address?.city || '')) || String(address?.city || '')
  formData.value.zip = String(address?.zip || '')
}

const applyDetectedCity = (city: string, source: string) => {
  const matched = matchAzerbaijanLocation(city)
  if (!matched) return false
  formData.value.city = matched
  cityDetectionSource.value = source
  cityDetectionMessage.value = `${matched} şəhəri avtomatik təyin olundu`
  return true
}

const guessCityFromIp = async () => {
  const result = await $fetch<{ city?: string; source?: string }>('/api/location/guess')
  return applyDetectedCity(String(result?.city || ''), 'IP')
}

const guessCityFromDevice = async () => {
  if (!process.client || !navigator.geolocation) return false
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 6000,
      maximumAge: 300000
    })
  })
  const result = await $fetch<{ city?: string; source?: string }>('/api/location/reverse', {
    query: {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    }
  })
  return applyDetectedCity(String(result?.city || ''), 'cihaz')
}

const autofillCity = async (force = false) => {
  if (!checkoutUi.value?.enableCityAutofill) return
  if (!force && String(formData.value.city || '').trim()) return
  cityDetectionLoading.value = true
  cityDetectionMessage.value = ''
  cityDetectionSource.value = ''
  const strategy = checkoutUi.value.preferredCityDetection || 'device_then_ip'
  try {
    let detected = false
    if (strategy === 'device_then_ip') {
      try {
        detected = await guessCityFromDevice()
      } catch {}
      if (!detected) detected = await guessCityFromIp()
    } else if (strategy === 'device') {
      detected = await guessCityFromDevice()
    } else {
      detected = await guessCityFromIp()
    }
    if (!detected) {
      cityDetectionMessage.value = 'Şəhər avtomatik təyin olunmadı, siyahıdan əl ilə seçə bilərsiniz.'
    }
  } catch {
    cityDetectionMessage.value = 'Şəhər avtomatik təyin olunmadı, siyahıdan əl ilə seçə bilərsiniz.'
  } finally {
    cityDetectionLoading.value = false
  }
}

onMounted(async () => {
  await authStore.fetchSession()
  if (!settingsStore.hydrated || !settingsStore.settings.siteName) {
    await settingsStore.fetchSettings()
  }
  if (!shippingStore.hydrated) {
    await shippingStore.fetchMethods()
  }
  if (!productStore.hydrated) {
    await productStore.fetchProducts()
  }
  syncCartWithProducts(true)
  const defaultAddress = savedAddresses.value.find((item: any) => item.isDefault) || savedAddresses.value[0]
  if (defaultAddress) {
    selectSavedAddress(defaultAddress)
  } else {
    formData.value.fullName = String(authStore.user?.name || '')
    formData.value.email = isValidEmail(String(authStore.user?.email || '')) ? String(authStore.user?.email || '') : ''
    formData.value.phone = String(authStore.user?.phone || '')
  }
  if (route.query.payment === 'cancelled') {
    toastStore.error(checkoutCopy.value.cancelled)
  }
  if (!cardPaymentReady.value) {
    paymentMethod.value = cashPaymentReady.value ? 'cash' : 'card'
  }
  if (availableShippingMethods.value.length > 0) {
    selectedShippingMethodId.value = Number(availableShippingMethods.value[0].id)
  }
  if (!String(formData.value.city || '').trim()) {
    await autofillCity()
  }
})

const handleCheckout = async () => {
  if (step.value === 1) {
    if (!checkoutFieldErrors.value.fullName && !checkoutFieldErrors.value.email && !checkoutFieldErrors.value.phone && !checkoutFieldErrors.value.address && !checkoutFieldErrors.value.city && !checkoutFieldErrors.value.shipping) {
      step.value = 2
    } else {
      toastStore.error('Ad, email, telefon, ünvan və çatdırılma məlumatlarını düzgün tamamlayın')
    }
  } else {
    if (cartStore.items.length === 0) {
      toastStore.error(t('cart_empty_short'))
      return
    }
    if (paymentMethod.value === 'card' && !cardPaymentReady.value) {
      paymentMethod.value = 'cash'
      toastStore.error(checkoutCopy.value.cardDisabled)
      return
    }
    if (paymentMethod.value === 'cash' && !cashPaymentReady.value) {
      toastStore.error(checkoutCopy.value.cashDisabled)
      return
    }
    if (!productStore.hydrated) {
      await productStore.fetchProducts()
    }
    if (syncCartWithProducts(true) > 0 || cartStore.items.length === 0) {
      toastStore.error('Səbət yeniləndi. Zəhmət olmasa sifarişi yenidən yoxlayın.')
      return
    }
    if (submitting.value) return
    submitting.value = true
    try {
      if (paymentMethod.value === 'card') {
        const session = await $fetch<{ url: string }>('/api/payments/create-session', {
          method: 'POST',
          body: {
            customer: formData.value.fullName,
            email: preferredCheckoutEmail.value,
            amount: checkoutTotal.value,
            address: `${formData.value.address}, ${formData.value.city}`,
            phone: formData.value.phone,
            items: cartStore.items.map(i => ({
              id: i.id,
              name: i.name,
              price: i.price,
              qty: i.quantity,
              image: i.image,
              variationId: i.variationId ?? null,
              variationLabel: i.variationLabel || ''
            })),
            couponCode: cartStore.couponCode || undefined,
            discountAmount: cartStore.discountAmount || undefined,
            shippingMethodId: selectedShippingMethod.value?.id,
            shippingMethodName: selectedShippingMethod.value?.name,
            shippingFee: shippingFee.value,
            shippingEta: selectedShippingMethod.value?.duration,
            shippingRegion: formData.value.city
          }
        })
        window.location.href = session.url
        return
      }
      const createdOrder = await orderStore.createOrder({
        customer: formData.value.fullName,
        email: preferredCheckoutEmail.value,
        amount: checkoutTotal.value,
        address: `${formData.value.address}, ${formData.value.city}`,
        phone: formData.value.phone,
        paymentMethod: paymentMethod.value as 'card' | 'cash',
        items: cartStore.items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.quantity,
          image: i.image,
          variationId: i.variationId ?? null,
          variationLabel: i.variationLabel || ''
        })),
        couponCode: cartStore.couponCode || undefined,
        discountAmount: cartStore.discountAmount || undefined,
        shippingMethodId: selectedShippingMethod.value?.id,
        shippingMethodName: selectedShippingMethod.value?.name,
        shippingFee: shippingFee.value,
        shippingEta: selectedShippingMethod.value?.duration,
        shippingRegion: formData.value.city
      })
      toastStore.success(`${t('order_success')} · ${createdOrder.trackingCode || createdOrder.id}`)
      cartStore.clearCart()
      router.push({
        path: '/order-tracking',
        query: {
          trackingCode: createdOrder.trackingCode || '',
          email: createdOrder.email || ''
        }
      })
    } catch (error: any) {
      toastStore.error(error?.data?.statusMessage || error?.data?.message || error?.message || t('order_failed'))
    } finally {
      submitting.value = false
    }
  }
}
</script>

<template>
  <div :class="['bg-gray-50/50 min-h-screen py-16 md:py-24', `checkout-density-${checkoutDensity}`]">
    <div class="container">
      <div class="max-w-6xl mx-auto">
        <div class="mb-10 rounded-xl border border-gray-100 bg-white p-7 shadow-sm md:p-9">
          <div class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div>
              <div class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" :style="checkoutAccentStyle">
                <ShieldCheck class="h-4 w-4" />
                {{ checkoutUi.checkoutBadge || 'Checkout' }}
              </div>
              <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">{{ checkoutUi.checkoutTitle || checkoutCopy.seoTitle }}</h1>
              <p class="mt-3 max-w-2xl text-sm font-medium leading-7 text-gray-600 md:text-base">
                {{ checkoutUi.checkoutSubtitle || checkoutCopy.seoDescription }}
              </p>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <div v-for="(item, idx) in checkoutTrustBadges" :key="`checkout-trust-${idx}`" class="rounded-lg border px-4 py-4 text-sm font-extrabold" :style="checkoutAccentSoftStyle">
                {{ item.label }}
              </div>
              <div v-if="!checkoutTrustBadges.length" class="rounded-lg border px-4 py-4 text-sm font-extrabold" :style="checkoutAccentSoftStyle">Qorunan checkout</div>
            </div>
          </div>
        </div>

        <!-- Steps Indicator -->
        <div class="flex items-center justify-center mb-16">
          <div class="flex items-center w-full max-w-md">
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all', step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500']">1</div>
            <div :class="['flex-grow h-1 mx-4 rounded-lg transition-all', step >= 2 ? 'bg-blue-600' : 'bg-gray-200']"></div>
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all', step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500']">2</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <!-- Main Form Area -->
          <div class="lg:col-span-8">
            <div v-if="step === 1" class="bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm space-y-10">
              <div>
                <h2 class="text-2xl font-extrabold text-gray-900 mb-8 flex items-center tracking-tight">
                  <User class="w-6 h-6 mr-4 text-blue-600" />
                  {{ checkoutCopy.personalInfo }}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">{{ checkoutCopy.fullName }}</label>
                    <input v-model="formData.fullName" type="text" :placeholder="checkoutCopy.fullNamePlaceholder" autocomplete="name" :aria-invalid="checkoutFieldErrors.fullName" :class="['w-full px-6 py-4 rounded-lg bg-gray-50 border outline-none transition-all font-medium', checkoutFieldErrors.fullName ? 'border-red-200 focus:border-red-500' : 'border-transparent focus:border-blue-600 focus:bg-white']" />
                    <div v-if="checkoutFieldErrors.fullName" class="text-xs font-medium text-red-500">Ad və soyad ən az 4 simvol olmalıdır.</div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">{{ checkoutCopy.email }}</label>
                    <input v-model="formData.email" type="email" placeholder="nümunə@mail.com" autocomplete="email" :aria-invalid="checkoutFieldErrors.email" :class="['w-full px-6 py-4 rounded-lg bg-gray-50 border outline-none transition-all font-medium', checkoutFieldErrors.email ? 'border-red-200 focus:border-red-500' : 'border-transparent focus:border-blue-600 focus:bg-white']" />
                    <div v-if="checkoutFieldErrors.email" class="text-xs font-medium text-red-500">Düzgün email daxil edin.</div>
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">{{ checkoutCopy.phone }}</label>
                    <input v-model="formData.phone" type="tel" placeholder="+994 50 123 45 67" autocomplete="tel" :aria-invalid="checkoutFieldErrors.phone" :class="['w-full px-6 py-4 rounded-lg bg-gray-50 border outline-none transition-all font-medium', checkoutFieldErrors.phone ? 'border-red-200 focus:border-red-500' : 'border-transparent focus:border-blue-600 focus:bg-white']" />
                    <div v-if="checkoutFieldErrors.phone" class="text-xs font-medium text-red-500">Telefon nömrəsini düzgün formatda daxil edin.</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 class="text-2xl font-extrabold text-gray-900 mb-8 flex items-center tracking-tight">
                  <MapPin class="w-6 h-6 mr-4 text-blue-600" />
                  {{ checkoutCopy.addressTitle }}
                </h2>
                <div v-if="savedAddresses.length" class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    v-for="address in savedAddresses"
                    :key="address.id"
                    type="button"
                    class="rounded-lg border border-gray-100 bg-gray-50 px-5 py-4 text-left transition-all hover:border-blue-200 hover:bg-white"
                    @click="selectSavedAddress(address)"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div class="text-sm font-extrabold text-gray-900">{{ address.label }}</div>
                      <div v-if="address.isDefault" class="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">{{ checkoutCopy.defaultAddress }}</div>
                    </div>
                    <div class="mt-2 text-sm font-medium text-gray-500">{{ address.recipient }} · {{ address.phone }}</div>
                    <div class="mt-1 text-xs font-medium text-gray-400">{{ address.address }}, {{ address.city }}</div>
                  </button>
                </div>
                <div class="space-y-6">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">{{ checkoutCopy.address }}</label>
                    <input v-model="formData.address" type="text" :placeholder="checkoutCopy.addressPlaceholder" autocomplete="street-address" :aria-invalid="checkoutFieldErrors.address" :class="['w-full px-6 py-4 rounded-lg bg-gray-50 border outline-none transition-all font-medium', checkoutFieldErrors.address ? 'border-red-200 focus:border-red-500' : 'border-transparent focus:border-blue-600 focus:bg-white']" />
                    <div v-if="checkoutFieldErrors.address" class="text-xs font-medium text-red-500">Ünvan daha detallı yazılmalıdır.</div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">{{ checkoutCopy.city }}</label>
                      <input v-model="formData.city" list="azerbaijan-city-options" type="text" :placeholder="checkoutCopy.cityPlaceholder" autocomplete="address-level2" :aria-invalid="checkoutFieldErrors.city" :class="['w-full px-6 py-4 rounded-lg bg-gray-50 border outline-none transition-all font-medium', checkoutFieldErrors.city ? 'border-red-200 focus:border-red-500' : 'border-transparent focus:border-blue-600 focus:bg-white']" />
                      <datalist id="azerbaijan-city-options">
                        <option v-for="city in cityOptions" :key="city" :value="city" />
                      </datalist>
                      <button
                        v-if="checkoutUi.enableCityAutofill"
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-extrabold transition hover:bg-white"
                        :style="checkoutAccentSoftStyle"
                        @click="autofillCity(true)"
                      >
                        <LoaderCircle v-if="cityDetectionLoading" class="h-4 w-4 animate-spin" />
                        <LocateFixed v-else class="h-4 w-4" />
                        {{ cityDetectionLoading ? 'Şəhər yoxlanır...' : 'Şəhəri avtomatik təyin et' }}
                      </button>
                      <div v-if="cityDetectionMessage" class="text-xs font-medium leading-5 text-gray-500">
                        {{ cityDetectionMessage }}<span v-if="cityDetectionSource"> · Mənbə: {{ cityDetectionSource }}</span>
                      </div>
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">{{ checkoutCopy.zip }}</label>
                    <input v-model="formData.zip" type="text" placeholder="AZ1000" autocomplete="postal-code" class="w-full px-6 py-4 rounded-lg bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 class="text-2xl font-extrabold text-gray-900 mb-8 flex items-center tracking-tight">
                  <Truck class="w-6 h-6 mr-4 text-blue-600" />
                  {{ checkoutCopy.shippingMethod }}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    v-for="method in availableShippingMethods"
                    :key="method.id"
                    type="button"
                    class="rounded-xl border-2 p-6 text-left transition-all"
                    :class="Number(selectedShippingMethodId) === Number(method.id) ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-gray-50 hover:border-blue-200'"
                    @click="selectedShippingMethodId = method.id"
                  >
                    <div class="flex items-center justify-between gap-4">
                      <div>
                        <div class="text-lg font-extrabold text-gray-900">{{ method.name }}</div>
                        <div class="mt-1 text-sm font-medium text-gray-500">{{ method.duration }}</div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-extrabold text-blue-600">{{ formatMoney((Number(method.freeOver || 0) > 0 && cartStore.totalPrice - Number(cartStore.discountAmount || 0) >= Number(method.freeOver || 0)) ? 0 : Number(method.price || 0)) }}</div>
                        <div class="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">{{ Array.isArray(method.regions) && method.regions.length ? method.regions.join(', ') : checkoutCopy.allRegions }}</div>
                      </div>
                    </div>
                  </button>
                </div>
                <div class="mt-4 rounded-lg border px-4 py-4 text-sm font-medium" :style="checkoutAccentSoftStyle">
                  Seçim Azərbaycan şəhər və rayon siyahısına uyğun filtr olunur. Əgər şəhər avtomatik təyin olunmazsa, siyahıdan əl ilə seçə bilərsiniz.
                </div>
              </div>
            </div>

            <div v-if="step === 2" class="bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm">
              <h2 class="text-2xl font-extrabold text-gray-900 mb-10 flex items-center tracking-tight">
                <CreditCard class="w-6 h-6 mr-4 text-blue-600" />
                {{ checkoutCopy.paymentMethod }}
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  @click="cardPaymentReady && (paymentMethod = 'card')"
                  :class="['p-8 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-4 group', cardPaymentReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-60', paymentMethod === 'card' && cardPaymentReady ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-gray-50', cardPaymentReady ? 'hover:border-blue-200' : '']"
                >
                  <div :class="['w-16 h-16 rounded-lg flex items-center justify-center transition-all', paymentMethod === 'card' && cardPaymentReady ? 'bg-blue-600 text-white' : 'bg-white text-gray-400']">
                    <CreditCard class="w-8 h-8" />
                  </div>
                  <span :class="['font-bold text-lg', paymentMethod === 'card' && cardPaymentReady ? 'text-blue-600' : 'text-gray-500']">{{ cardMethodConfig?.name || checkoutCopy.cardFallback }}</span>
                  <div class="text-center text-xs font-bold" :class="cardPaymentReady ? 'text-emerald-600' : 'text-amber-600'">
                    {{ cardPaymentReady ? (cardMethodConfig?.description || checkoutCopy.cardReady) : checkoutCopy.cardNotReady }}
                  </div>
                  <div v-if="paymentMethod === 'card' && cardPaymentReady" class="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 class="w-4 h-4 text-white" />
                  </div>
                </div>

                <div 
                  @click="cashPaymentReady && (paymentMethod = 'cash')"
                  :class="['p-8 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-4 group', cashPaymentReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-60', paymentMethod === 'cash' && cashPaymentReady ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-gray-50', cashPaymentReady ? 'hover:border-blue-200' : '']"
                >
                  <div :class="['w-16 h-16 rounded-lg flex items-center justify-center transition-all', paymentMethod === 'cash' ? 'bg-blue-600 text-white' : 'bg-white text-gray-400']">
                    <Banknote class="w-8 h-8" />
                  </div>
                  <span :class="['font-bold text-lg', paymentMethod === 'cash' ? 'text-blue-600' : 'text-gray-500']">{{ cashMethodConfig?.name || checkoutCopy.cashFallback }}</span>
                  <div class="text-center text-xs font-bold" :class="cashPaymentReady ? 'text-emerald-600' : 'text-amber-600'">
                    {{ cashPaymentReady ? (cashMethodConfig?.description || checkoutCopy.cashReady) : checkoutCopy.cashNotReady }}
                  </div>
                  <div v-if="paymentMethod === 'cash'" class="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 class="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <div v-if="paymentMethod === 'card'" class="mt-12 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">
                <div class="flex items-start gap-4">
                  <div class="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-100">
                    <ShieldCheck class="h-7 w-7" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-lg font-extrabold text-gray-900">{{ checkoutCopy.stripeTitle }}</div>
                    <div class="mt-2 text-sm font-medium leading-6 text-gray-600">{{ checkoutCopy.stripeDescription }}</div>
                  </div>
                </div>
              <div class="mt-6 grid gap-3 sm:grid-cols-3">
                  <div class="rounded-lg border border-white bg-white/90 px-4 py-4 text-sm font-bold text-gray-700">{{ checkoutCopy.stripePointOne }}</div>
                  <div class="rounded-lg border border-white bg-white/90 px-4 py-4 text-sm font-bold text-gray-700">{{ checkoutCopy.stripePointTwo }}</div>
                  <div class="rounded-lg border border-white bg-white/90 px-4 py-4 text-sm font-bold text-gray-700">{{ checkoutCopy.stripePointThree }}</div>
                </div>
              <div class="mt-4 rounded-lg border border-blue-100 bg-white/90 px-4 py-4 text-sm font-medium text-gray-600">
                Sifarişdən sonra izləmə kodu təqdim olunur, support komandası isə checkout məlumatlarınıza əsasən sizinlə əlaqə saxlaya bilir.
              </div>
              </div>
            </div>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="lg:col-span-4">
            <div class="rounded-xl border p-5 sm:p-6 md:p-10 text-white shadow-xl md:shadow-2xl lg:sticky lg:top-8" :style="checkoutSummaryStyle">
              <h3 class="mb-6 border-b border-white/10 pb-4 text-xl font-bold tracking-tight sm:mb-8 sm:pb-5 sm:text-2xl">{{ checkoutCopy.summaryTitle }}</h3>
              
              <div class="mb-7 space-y-4 sm:mb-10 sm:space-y-6">
                <div class="flex justify-between gap-3 text-sm text-white/70 font-medium sm:text-base">
                  <span>{{ t('subtotal') }}</span>
                  <span class="text-white">{{ formatMoney(cartStore.totalPrice) }}</span>
                </div>
                <div class="flex justify-between gap-3 text-sm text-white/70 font-medium sm:text-base">
                  <span>{{ t('shipping') }}</span>
                  <span class="text-white">{{ selectedShippingMethod?.name || '-' }}</span>
                </div>
                <div class="flex justify-between gap-3 text-sm text-white/70 font-medium sm:text-base">
                  <span>{{ checkoutCopy.shippingFee }}</span>
                  <span class="font-bold" :class="shippingFee > 0 ? 'text-white' : 'text-green-100'">{{ shippingFee > 0 ? formatMoney(shippingFee) : t('free') }}</span>
                </div>
                <div v-if="cartStore.discountAmount > 0" class="flex justify-between gap-3 text-sm text-white/70 font-medium sm:text-base">
                  <span>{{ t('discount') }}</span>
                  <span class="text-green-100 font-bold">-{{ formatMoney(cartStore.discountAmount) }}</span>
                </div>
                <div class="flex items-end justify-between gap-3 border-t border-white/10 pt-4 sm:pt-6">
                  <span class="text-base font-bold text-white/75 sm:text-lg">{{ t('grand_total') }}</span>
                  <span class="text-3xl font-black tracking-tighter text-white sm:text-4xl">{{ formatMoney(checkoutTotal) }}</span>
                </div>
                <div
                  v-if="checkoutUi.showVatIncluded"
                  class="rounded-lg border border-white/20 bg-white/10 px-3.5 py-3.5 sm:px-4 sm:py-4"
                >
                  <div class="text-[13px] font-extrabold text-white sm:text-sm">
                    {{ checkoutUi.vatIncludedLabel || t('vat_included') }}
                  </div>
                  <div class="mt-1 text-[11px] font-medium leading-5 text-white/75 sm:text-xs sm:leading-6">
                    {{ checkoutUi.vatIncludedDescription }}
                  </div>
                </div>
              </div>

              <div class="space-y-3 sm:space-y-4">
                <button 
                  @click="handleCheckout"
                  :disabled="submitting"
                  :class="['flex w-full items-center justify-center rounded-lg py-4 text-sm font-extrabold transition-all duration-300 sm:py-5 sm:text-base group shadow-[0_16px_35px_-22px_rgba(250,204,21,0.95)]', submitting ? 'cursor-not-allowed bg-[#FDE68A] text-gray-700' : 'bg-[#FACC15] text-gray-900 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-95 active:translate-y-0 active:scale-[0.99]']"
                >
                  {{ step === 1 ? 'Ödənişə keç' : submitting ? t('sending') : t('checkout_finish') }}
                  <ArrowRight class="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  v-if="step === 2"
                  @click="step = 1"
                  class="flex w-full items-center justify-center rounded-lg bg-white/10 py-3.5 text-sm font-bold text-white/80 transition-all hover:bg-white/20 sm:py-4 sm:text-base"
                >
                  <ChevronLeft class="w-5 h-5 mr-2" />
                  {{ checkoutCopy.back }}
                </button>
              </div>

              <div v-if="checkoutUi.showCheckoutSupport" class="mt-5 rounded-lg border border-white/10 bg-white/10 px-4 py-4 sm:mt-6">
                <div class="text-sm font-extrabold text-white">{{ checkoutUi.checkoutSupportTitle }}</div>
                <div class="mt-2 text-xs font-medium leading-5 text-white/75 sm:text-sm sm:leading-6">{{ checkoutUi.checkoutSupportText }}</div>
              </div>

              <div class="mt-8 flex items-center justify-center space-x-5 text-white/60 sm:mt-12 sm:space-x-6">
                <Truck class="w-6 h-6" />
                <div class="h-4 w-px bg-white/20"></div>
                <CheckCircle2 class="w-6 h-6" />
                <div class="h-4 w-px bg-white/20"></div>
                <ShieldCheck class="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .checkout-density-compact :deep(.text-3xl.font-extrabold) {
    font-size: 1.875rem;
    line-height: 2.2rem;
  }
  .checkout-density-compact :deep(.text-2xl.font-extrabold) {
    font-size: 1.25rem;
    line-height: 1.7rem;
  }
  .checkout-density-compact :deep(.p-8) {
    padding: 1rem;
  }
  .checkout-density-compact :deep(.md\:p-12) {
    padding: 1rem;
  }
}
</style>
