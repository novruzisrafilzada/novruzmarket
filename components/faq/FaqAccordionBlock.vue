<script setup lang="ts">
import { ref } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title?: string
  items: Array<{
    id?: number | string
    question: string
    answer: string
  }>
  emptyText?: string
}>(), {
  title: '',
  emptyText: 'Heç bir sual əlavə olunmayıb.'
})

const activeId = ref<number | string | null>(null)

const getItemId = (item: { id?: number | string }, index: number) => item.id ?? index

const toggle = (id: number | string) => {
  activeId.value = activeId.value === id ? null : id
}
</script>

<template>
  <div class="max-w-4xl mx-auto bg-white border border-gray-100 rounded-[2.5rem] p-10 md:p-14 shadow-sm">
    <h1 v-if="title" class="text-4xl font-extrabold text-gray-900 tracking-tight mb-6 text-center">{{ title }}</h1>
    <div class="space-y-4">
      <div v-for="(item, index) in items" :key="getItemId(item, index)" class="border border-gray-100 rounded-2xl overflow-hidden">
        <button type="button" class="w-full px-6 py-5 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-all" @click="toggle(getItemId(item, index))">
          <div class="text-gray-900 font-extrabold">{{ item.question }}</div>
          <component :is="activeId === getItemId(item, index) ? Minus : Plus" class="w-5 h-5 text-gray-600 flex-shrink-0" />
        </button>
        <div v-if="activeId === getItemId(item, index)" class="px-6 py-5 text-gray-600 leading-relaxed font-medium bg-white whitespace-pre-line">
          {{ item.answer }}
        </div>
      </div>
      <div v-if="items.length === 0" class="text-center text-gray-500 font-medium py-10">
        {{ emptyText }}
      </div>
    </div>
  </div>
</template>
