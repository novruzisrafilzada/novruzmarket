import { useFaqStore } from '~/stores/faq'

export default defineNuxtPlugin(async () => {
  const faqStore = useFaqStore()
  if (faqStore.hydrated && faqStore.items.length > 0) return
  const fetcher = useRequestFetch()
  const items = await fetcher('/api/faq')
  faqStore.setItems(items as any)
})

