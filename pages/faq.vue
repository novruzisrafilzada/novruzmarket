<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useFaqStore } from '~/stores/faq'

const faqStore = useFaqStore()

const items = computed(() => faqStore.items.filter(i => i.status === 'Aktiv'))
const faqItems = computed(() => items.value.map((item) => ({
  id: item.id,
  question: item.question,
  answer: item.answer
})))

useHead(() => ({
  script: faqItems.value.length
    ? [{
        key: 'faq-structured-data',
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.value.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        })
      }]
    : []
}))

onMounted(async () => {
  if (!faqStore.hydrated) await faqStore.fetchItems()
})
</script>

<template>
  <div class="bg-gray-50/50 py-16 md:py-24">
    <div class="container">
      <FaqAccordionBlock title="Tez-tez Verilən Suallar (FAQ)" :items="faqItems" />
    </div>
  </div>
</template>
