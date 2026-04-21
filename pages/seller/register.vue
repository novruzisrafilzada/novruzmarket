<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Building2, Check, ImagePlus, Lock, Mail, MessageSquareMore, Phone, Store, Tag, User as UserIcon } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { cropImageFile, uploadPreparedImage } from '~/utils/seller-media'

const router = useRouter()
const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()

const fullName = ref('')
const shopName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const note = ref('')
const emailCode = ref('')
const profileImage = ref('')
const profilePreview = ref('')
const coverImage = ref('')
const coverPreview = ref('')
const categoryIds = ref<number[]>([])
const acceptTerms = ref(false)
const sendingCode = ref(false)
const uploadingImage = ref(false)
const uploadingCover = ref(false)

onMounted(async () => {
  await Promise.all([
    (!categoryStore.hydrated || !categoryStore.categories.length) ? categoryStore.fetchCategories() : Promise.resolve(),
    (!settingsStore.hydrated || !settingsStore.settings.siteName) ? settingsStore.fetchSettings() : Promise.resolve()
  ])
})

const emailVerificationEnabled = computed(() => Boolean(settingsStore.settings.integrations.emailVerificationEnabled))

const categoryOptions = computed(() =>
  categoryStore.categories
    .filter((category) => category.parentId === null)
    .map((category) => ({
      id: category.id,
      label: category.nameI18n.az || category.slug,
      image: category.image || ''
    }))
)

const toggleCategory = (categoryId: number) => {
  if (categoryIds.value.includes(categoryId)) {
    categoryIds.value = categoryIds.value.filter((id) => id !== categoryId)
    return
  }
  categoryIds.value = [...categoryIds.value, categoryId]
}

const uploadSellerImage = async (event: Event, kind: 'profile' | 'cover') => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (kind === 'profile') uploadingImage.value = true
  else uploadingCover.value = true
  try {
    const prepared = await cropImageFile(file, kind === 'profile' ? { width: 720, height: 720 } : { width: 1600, height: 620 })
    const res = await uploadPreparedImage(prepared.file)
    if (kind === 'profile') {
      profileImage.value = res.url
      profilePreview.value = prepared.previewUrl
    } else {
      coverImage.value = res.url
      coverPreview.value = prepared.previewUrl
    }
    toastStore.success(kind === 'profile' ? 'Profil şəkli yükləndi' : 'Cover şəkli yükləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Şəkil yüklənmədi')
  } finally {
    if (kind === 'profile') uploadingImage.value = false
    else uploadingCover.value = false
    input.value = ''
  }
}

const requestEmailCode = async () => {
  if (!fullName.value || !shopName.value || !email.value || !password.value || !acceptTerms.value) {
    toastStore.error('Ad, mağaza adı, email, şifrə və şərt qəbulu vacibdir')
    return
  }
  if (!emailVerificationEnabled.value) {
    toastStore.error('Email kod doğrulaması hazırda deaktivdir')
    return
  }

  sendingCode.value = true
  try {
    await $fetch('/api/auth/email/request-code', {
      method: 'POST',
      body: { email: email.value }
    })
    toastStore.success('Təsdiq kodu email ünvanına göndərildi')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Kod göndərilmədi')
  } finally {
    sendingCode.value = false
  }
}

const handleSellerSignup = async () => {
  if (!fullName.value || !shopName.value || !email.value || !password.value || !acceptTerms.value || !categoryIds.value.length || (emailVerificationEnabled.value && !emailCode.value)) {
    toastStore.error('Bütün vacib sahələri, kateqoriyanı və kodu doldurun')
    return
  }

  try {
    await authStore.signupWithEmailCode({
      name: fullName.value,
      email: email.value,
      code: emailVerificationEnabled.value ? emailCode.value : undefined,
      password: password.value,
      role: 'Satıcı',
      phone: phone.value || undefined,
      sellerProfile: {
        shopName: shopName.value,
        phone: phone.value,
        note: note.value,
        profileImage: profileImage.value,
        coverImage: coverImage.value,
        categoryIds: categoryIds.value
      }
    })
    toastStore.success('Satıcı hesabı yaradıldı')
    router.push('/seller')
  } catch (error: any) {
    toastStore.error(error?.data?.message || 'Email kodu və ya məlumatlar yanlışdır')
  }
}
</script>

<template>
  <div class="min-h-[85vh] bg-slate-50 py-16">
    <div class="max-w-3xl mx-auto px-4">
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div class="px-8 sm:px-12 py-10 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] text-white">
          <div class="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-xs font-extrabold uppercase tracking-[0.2em]">Seller Portal</div>
          <h1 class="mt-5 text-3xl sm:text-4xl font-extrabold">Satıcı qeydiyyatı</h1>
          <p class="mt-3 text-white/80 font-medium max-w-2xl">Mağazanızı açın, məhsullarınızı yükləyin, stok və sifarişləri vahid paneldən idarə edin.</p>
        </div>

        <div class="p-8 sm:p-12">
          <form @submit.prevent="handleSellerSignup" class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="relative group">
                <UserIcon class="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input v-model="fullName" type="text" placeholder="Ad və soyad" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
              </div>
              <div class="relative group">
                <Store class="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input v-model="shopName" type="text" placeholder="Mağaza adı" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
              </div>
              <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-[1fr,auto] gap-5">
                <div class="relative group">
                  <Mail class="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input v-model="email" type="email" placeholder="E-poçt" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
                </div>
                <button v-if="emailVerificationEnabled" type="button" class="px-6 py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all disabled:opacity-60" :disabled="sendingCode" @click="requestEmailCode">
                  {{ sendingCode ? 'Göndərilir...' : 'Kod göndər' }}
                </button>
              </div>
              <div v-if="!emailVerificationEnabled" class="md:col-span-2 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
                Email kod doğrulaması hazırda deaktivdir. Aktiv ediləndə bu hissə birbaşa email API ilə işləyəcək.
              </div>
              <div class="relative group">
                <Phone class="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input v-model="phone" type="text" placeholder="Əlaqə nömrəsi" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
              </div>
              <div class="md:col-span-2 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
                <div class="flex flex-col md:flex-row md:items-center gap-5">
                  <div class="w-24 h-24 rounded-[1.5rem] border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                    <img v-if="profilePreview || profileImage" :src="profilePreview || profileImage" alt="" class="w-full h-full object-cover" />
                    <ImagePlus v-else class="w-8 h-8 text-slate-300" />
                  </div>
                  <div class="flex-1 space-y-3">
                    <div>
                      <div class="text-sm font-extrabold text-slate-900">Mağaza profil şəkli</div>
                      <div class="text-xs font-medium text-slate-500 mt-1">Bu şəkil admin paneldə və mağaza kartlarında istifadə oluna bilər.</div>
                    </div>
                    <label class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                      <ImagePlus class="w-4 h-4" />
                      {{ uploadingImage ? 'Crop edilir...' : 'Şəkil seç və crop et' }}
                      <input type="file" accept="image/*" class="hidden" @change="uploadSellerImage($event, 'profile')" />
                    </label>
                    <input v-model="profileImage" type="text" placeholder="Şəkil linki" class="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-blue-600 outline-none transition-all font-medium text-sm" />
                  </div>
                </div>
              </div>
              <div class="md:col-span-2 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
                <div class="space-y-4">
                  <div>
                    <div class="text-sm font-extrabold text-slate-900">Mağaza cover şəkli</div>
                    <div class="text-xs font-medium text-slate-500 mt-1">Mağaza vitrininin yuxarı hissəsində geniş banner kimi istifadə olunacaq.</div>
                  </div>
                  <div class="h-40 rounded-[1.5rem] border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                    <img v-if="coverPreview || coverImage" :src="coverPreview || coverImage" alt="" class="w-full h-full object-cover" />
                    <ImagePlus v-else class="w-8 h-8 text-slate-300" />
                  </div>
                  <div class="flex flex-col sm:flex-row gap-3">
                    <label class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer">
                      <ImagePlus class="w-4 h-4" />
                      {{ uploadingCover ? 'Hazırlanır...' : 'Cover seç və preview et' }}
                      <input type="file" accept="image/*" class="hidden" @change="uploadSellerImage($event, 'cover')" />
                    </label>
                    <input v-model="coverImage" type="text" placeholder="Cover linki" class="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-blue-600 outline-none transition-all font-medium text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-[1fr,1.15fr] gap-5">
              <div class="relative group">
                <Lock class="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input v-model="password" type="password" placeholder="Şifrə" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
              </div>
              <div class="relative group">
                <Building2 class="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input v-model="note" type="text" placeholder="Biznes qeydi / fəaliyyət sahəsi" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
              </div>
              <div v-if="emailVerificationEnabled" class="relative group md:col-span-2">
                <MessageSquareMore class="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input v-model="emailCode" type="text" placeholder="Email ünvanınıza gələn 6 rəqəmli kod" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-sm" />
              </div>
            </div>

            <div class="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-6">
              <div class="flex items-center gap-3">
                <Tag class="w-5 h-5 text-blue-600" />
                <div>
                  <div class="text-base font-extrabold text-slate-900">Satış kateqoriyaları</div>
                  <div class="text-sm font-medium text-slate-500 mt-1">Mağazanızın əsas hansı kateqoriyalar üzrə məhsul satacağını seçin.</div>
                </div>
              </div>
              <div class="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-auto pr-1">
                <button
                  v-for="category in categoryOptions"
                  :key="category.id"
                  type="button"
                  @click="toggleCategory(category.id)"
                  :class="['rounded-[1.5rem] border p-4 text-left transition-all', categoryIds.includes(category.id) ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200']"
                >
                  <div class="flex items-start gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      <img v-if="category.image" :src="category.image" alt="" class="w-full h-full object-cover" />
                      <Store v-else class="w-5 h-5 text-slate-400" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-extrabold" :class="categoryIds.includes(category.id) ? 'text-blue-700' : 'text-slate-900'">{{ category.label }}</div>
                      <div class="mt-1 text-xs font-medium" :class="categoryIds.includes(category.id) ? 'text-blue-500' : 'text-slate-500'">Satıcı vitrininizdə görünəcək</div>
                    </div>
                    <div v-if="categoryIds.includes(category.id)" class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check class="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div class="rounded-[2rem] border border-emerald-100 bg-emerald-50 px-6 py-5">
              <div class="text-sm font-extrabold text-emerald-900">Satıcı hesabı ilə nə edə biləcəksiniz?</div>
              <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-medium text-emerald-800">
                <div>Məhsul əlavə etmək və redaktə etmək</div>
                <div>Stok və qiymətləri idarə etmək</div>
                <div>Öz sifarişlərinizi və satışları izləmək</div>
              </div>
            </div>

            <label class="flex items-start gap-3 cursor-pointer">
              <input v-model="acceptTerms" type="checkbox" class="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              <span class="text-sm text-slate-600 font-medium"> <NuxtLink to="/seller-terms" class="text-emerald-600 font-extrabold hover:underline">Satıcı qaydalarını</NuxtLink> qəbul edirəm və təqdim etdiyim məlumatların doğru olduğunu təsdiqləyirəm.</span>
            </label>

            <button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 hover:shadow-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center group">
              Satıcı hesabı yarat
              <ArrowRight class="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div class="mt-10 pt-8 border-t border-slate-100 text-center">
            <p class="text-slate-500 font-medium">
              Artıq hesabınız var?
              <NuxtLink to="/login" class="text-blue-600 font-extrabold hover:underline ml-2">Daxil olun</NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
