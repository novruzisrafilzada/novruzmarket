<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Edit, Plus, Save, Trash2, X } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const { adminPath } = useAdminPortal()
const pageStore = usePageStore()
const toastStore = useToastStore()

const saving = ref(false)
const isSectionModalOpen = ref(false)
const editingSectionIndex = ref<number | null>(null)
const isFaqModalOpen = ref(false)
const editingFaqIndex = ref<number | null>(null)
const slug = computed(() => String(route.params.slug || ''))

const emptyI18n = () => ({ az: '', ru: '', en: '' })
const emptySection = () => ({ titleI18n: emptyI18n(), contentI18n: emptyI18n() })
const emptyFaq = () => ({ questionI18n: emptyI18n(), answerI18n: emptyI18n() })

const form = ref({
  id: null as number | null,
  slug: '',
  status: 'Aktiv' as 'Aktiv' | 'Deaktiv',
  pageLayout: 'faq' as 'basic' | 'faq',
  titleI18n: emptyI18n(),
  contentI18n: emptyI18n(),
  sections: [emptySection()] as any[],
  faqs: [emptyFaq()] as any[]
})

const sectionForm = ref(emptySection())
const faqForm = ref(emptyFaq())

const loadPage = async () => {
  await pageStore.fetchPages()
  const page = pageStore.pages.find((entry) => entry.slug === slug.value)
  if (page) {
    form.value = {
      id: page.id,
      slug: page.slug,
      status: page.status,
      pageLayout: 'faq',
      titleI18n: {
        az: String(page.titleI18n?.az || page.title || ''),
        ru: String(page.titleI18n?.ru || page.titleI18n?.az || page.title || ''),
        en: String(page.titleI18n?.en || page.titleI18n?.az || page.title || '')
      },
      contentI18n: {
        az: String(page.contentI18n?.az || page.content || ''),
        ru: String(page.contentI18n?.ru || page.contentI18n?.az || page.content || ''),
        en: String(page.contentI18n?.en || page.contentI18n?.az || page.content || '')
      },
      sections: Array.isArray(page.sections) && page.sections.length
        ? page.sections.map((section: any) => ({
            titleI18n: {
              az: String(section?.titleI18n?.az || ''),
              ru: String(section?.titleI18n?.ru || section?.titleI18n?.az || ''),
              en: String(section?.titleI18n?.en || section?.titleI18n?.az || '')
            },
            contentI18n: {
              az: String(section?.contentI18n?.az || ''),
              ru: String(section?.contentI18n?.ru || section?.contentI18n?.az || ''),
              en: String(section?.contentI18n?.en || section?.contentI18n?.az || '')
            }
          }))
        : [emptySection()],
      faqs: Array.isArray(page.faqs) && page.faqs.length
        ? page.faqs.map((faq: any) => ({
            questionI18n: {
              az: String(faq?.questionI18n?.az || ''),
              ru: String(faq?.questionI18n?.ru || faq?.questionI18n?.az || ''),
              en: String(faq?.questionI18n?.en || faq?.questionI18n?.az || '')
            },
            answerI18n: {
              az: String(faq?.answerI18n?.az || ''),
              ru: String(faq?.answerI18n?.ru || faq?.answerI18n?.az || ''),
              en: String(faq?.answerI18n?.en || faq?.answerI18n?.az || '')
            }
          }))
        : [emptyFaq()]
    }
    return
  }

  form.value = {
    id: null,
    slug: slug.value,
    status: 'Aktiv',
    pageLayout: 'faq',
    titleI18n: emptyI18n(),
    contentI18n: emptyI18n(),
    sections: [emptySection()],
    faqs: [emptyFaq()]
  }
}

const openSectionModal = (index?: number) => {
  if (typeof index === 'number') {
    editingSectionIndex.value = index
    sectionForm.value = JSON.parse(JSON.stringify(form.value.sections[index]))
  } else {
    editingSectionIndex.value = null
    sectionForm.value = emptySection()
  }
  isSectionModalOpen.value = true
}

const closeSectionModal = () => {
  isSectionModalOpen.value = false
}

const saveSection = () => {
  const payload = JSON.parse(JSON.stringify(sectionForm.value))
  if (editingSectionIndex.value === null) {
    form.value.sections.push(payload)
  } else {
    form.value.sections[editingSectionIndex.value] = payload
  }
  closeSectionModal()
}

const removeSection = (index: number) => {
  form.value.sections.splice(index, 1)
  if (!form.value.sections.length) form.value.sections.push(emptySection())
}

const openFaqModal = (index?: number) => {
  if (typeof index === 'number') {
    editingFaqIndex.value = index
    faqForm.value = JSON.parse(JSON.stringify(form.value.faqs[index]))
  } else {
    editingFaqIndex.value = null
    faqForm.value = emptyFaq()
  }
  isFaqModalOpen.value = true
}

const closeFaqModal = () => {
  isFaqModalOpen.value = false
}

const saveFaq = () => {
  const payload = JSON.parse(JSON.stringify(faqForm.value))
  if (editingFaqIndex.value === null) {
    form.value.faqs.push(payload)
  } else {
    form.value.faqs[editingFaqIndex.value] = payload
  }
  closeFaqModal()
}

const removeFaq = (index: number) => {
  form.value.faqs.splice(index, 1)
  if (!form.value.faqs.length) form.value.faqs.push(emptyFaq())
}

const savePage = async () => {
  saving.value = true
  const payload = {
    slug: slug.value,
    status: form.value.status,
    pageLayout: 'faq',
    title: String(form.value.titleI18n.az || slug.value).trim(),
    content: String(form.value.contentI18n.az || '').trim(),
    titleI18n: form.value.titleI18n,
    contentI18n: form.value.contentI18n,
    sections: form.value.sections.map((section) => ({
      titleI18n: section.titleI18n,
      contentI18n: section.contentI18n
    })),
    faqs: form.value.faqs.map((faq) => ({
      questionI18n: faq.questionI18n,
      answerI18n: faq.answerI18n
    }))
  }
  try {
    if (form.value.id) {
      await pageStore.updatePage(Number(form.value.id), payload as any)
    } else {
      await pageStore.addPage(payload as any)
    }
    toastStore.success('Footer səhifəsi yadda saxlandı')
    await loadPage()
  } catch {
    toastStore.error('Footer səhifəsi yadda saxlanmadı')
  } finally {
    saving.value = false
  }
}

onMounted(loadPage)
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <NuxtLink :to="adminPath('footer-links')" class="inline-flex items-center gap-2 text-sm font-extrabold text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft class="w-4 h-4" />
          Footer linklərinə qayıt
        </NuxtLink>
        <h1 class="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">/{{ slug }}</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Footerdəki bütün iç səhifələr üçün sual-cavab tipli redaktə burada aktivdir. İstəsən izah bölmələri də əlavə edə bilərsən.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-60" :disabled="saving" @click="savePage">
        <Save class="w-5 h-5" />
        {{ saving ? 'Yadda saxlanır...' : 'Yadda saxla' }}
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <input v-model="form.titleI18n.az" type="text" placeholder="Başlıq (AZ)" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
        <input v-model="form.titleI18n.ru" type="text" placeholder="Başlıq (RU)" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
        <input v-model="form.titleI18n.en" type="text" placeholder="Başlıq (EN)" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
        <select v-model="form.status" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all">
          <option value="Aktiv">Aktiv</option>
          <option value="Deaktiv">Deaktiv</option>
        </select>
      </div>

      <div class="space-y-3">
        <div class="text-sm font-extrabold text-gray-900">Giriş mətni</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <textarea v-model="form.contentI18n.az" rows="5" placeholder="Giriş mətni (AZ)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
          <textarea v-model="form.contentI18n.ru" rows="5" placeholder="Giriş mətni (RU)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
          <textarea v-model="form.contentI18n.en" rows="5" placeholder="Giriş mətni (EN)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div class="text-sm font-extrabold text-gray-900">İzah / şərt bölmələri</div>
          <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all" @click="openSectionModal()">
            <Plus class="w-4 h-4" />
            Bölmə əlavə et
          </button>
        </div>
        <div v-for="(section, index) in form.sections" :key="`section-${index}`" class="rounded-[1.5rem] border border-gray-100 p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-sm font-extrabold text-gray-900">{{ section.titleI18n.az || `Bölmə #${index + 1}` }}</div>
              <div class="mt-1 text-sm text-gray-500 font-medium line-clamp-3">{{ section.contentI18n.az || 'İzah əlavə edilməyib' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" @click="openSectionModal(index)">
                <Edit class="w-4 h-4" />
              </button>
              <button type="button" class="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all" @click="removeSection(index)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div class="text-sm font-extrabold text-gray-900">Sual-cavab hissəsi</div>
          <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all" @click="openFaqModal()">
            <Plus class="w-4 h-4" />
            Sual əlavə et
          </button>
        </div>
        <div v-for="(faq, index) in form.faqs" :key="`faq-${index}`" class="rounded-[1.5rem] border border-gray-100 p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-sm font-extrabold text-gray-900">{{ faq.questionI18n.az || `Sual #${index + 1}` }}</div>
              <div class="mt-1 text-sm text-gray-500 font-medium line-clamp-3">{{ faq.answerI18n.az || 'Cavab əlavə edilməyib' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" @click="openFaqModal(index)">
                <Edit class="w-4 h-4" />
              </button>
              <button type="button" class="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all" @click="removeFaq(index)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isSectionModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeSectionModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div class="shrink-0 p-6 border-b border-gray-100 flex items-center justify-between bg-white/95 backdrop-blur">
          <h2 class="text-xl font-extrabold text-gray-900">{{ editingSectionIndex === null ? 'Yeni bölmə' : 'Bölməni redaktə et' }}</h2>
          <button type="button" class="p-2 rounded-xl hover:bg-gray-100 transition-all" @click="closeSectionModal">
            <X class="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 pr-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input v-model="sectionForm.titleI18n.az" type="text" placeholder="Bölmə başlığı (AZ)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
            <input v-model="sectionForm.titleI18n.ru" type="text" placeholder="Bölmə başlığı (RU)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
            <input v-model="sectionForm.titleI18n.en" type="text" placeholder="Bölmə başlığı (EN)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <textarea v-model="sectionForm.contentI18n.az" rows="6" placeholder="İzah (AZ)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
            <textarea v-model="sectionForm.contentI18n.ru" rows="6" placeholder="İzah (RU)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
            <textarea v-model="sectionForm.contentI18n.en" rows="6" placeholder="İzah (EN)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
          </div>
        </div>
        <div class="sticky bottom-0 p-6 border-t border-gray-100 flex justify-end gap-3 bg-white/95 backdrop-blur">
          <button type="button" class="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all" @click="closeSectionModal">Ləğv et</button>
          <button type="button" class="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200" @click="saveSection">Yadda saxla</button>
        </div>
      </div>
    </div>

    <div v-if="isFaqModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeFaqModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div class="shrink-0 p-6 border-b border-gray-100 flex items-center justify-between bg-white/95 backdrop-blur">
          <h2 class="text-xl font-extrabold text-gray-900">{{ editingFaqIndex === null ? 'Yeni sual' : 'Sualı redaktə et' }}</h2>
          <button type="button" class="p-2 rounded-xl hover:bg-gray-100 transition-all" @click="closeFaqModal">
            <X class="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 pr-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input v-model="faqForm.questionI18n.az" type="text" placeholder="Sual (AZ)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
            <input v-model="faqForm.questionI18n.ru" type="text" placeholder="Sual (RU)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
            <input v-model="faqForm.questionI18n.en" type="text" placeholder="Sual (EN)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <textarea v-model="faqForm.answerI18n.az" rows="6" placeholder="Cavab (AZ)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
            <textarea v-model="faqForm.answerI18n.ru" rows="6" placeholder="Cavab (RU)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
            <textarea v-model="faqForm.answerI18n.en" rows="6" placeholder="Cavab (EN)" class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none text-sm font-medium transition-all resize-none"></textarea>
          </div>
        </div>
        <div class="sticky bottom-0 p-6 border-t border-gray-100 flex justify-end gap-3 bg-white/95 backdrop-blur">
          <button type="button" class="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all" @click="closeFaqModal">Ləğv et</button>
          <button type="button" class="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200" @click="saveFaq">Yadda saxla</button>
        </div>
      </div>
    </div>
  </div>
</template>
