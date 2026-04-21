<script setup lang="ts">
import { CircleCheck, CircleX, Info } from 'lucide-vue-next'
import { useToastStore } from '~/stores/toast'

const toastStore = useToastStore()

const iconFor = (type: string) => {
  if (type === 'success') return CircleCheck
  if (type === 'error') return CircleX
  return Info
}

const classFor = (type: string) => {
  if (type === 'success') return 'bg-emerald-600 text-white'
  if (type === 'error') return 'bg-red-600 text-white'
  return 'bg-gray-900 text-white'
}
</script>

<template>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3 items-center w-[90vw] max-w-[400px]">
    <div
      v-for="t in toastStore.items"
      :key="t.id"
      :class="['w-full rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in zoom-in duration-200', classFor(t.type)]"
      role="status"
      @click="toastStore.dismiss(t.id)"
    >
      <component :is="iconFor(t.type)" class="w-5 h-5 flex-shrink-0" />
      <div class="text-sm font-bold leading-snug">{{ t.message }}</div>
    </div>
  </div>
</template>
