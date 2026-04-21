<script setup lang="ts">
defineProps<{
  items: string[]
  speed: number
  dark?: boolean
}>()
</script>

<template>
  <div v-if="items.length" :class="dark ? 'bg-[color:var(--color-primary,#2B3E95)] text-white' : 'border-y border-gray-200 bg-white text-gray-800'" class="overflow-hidden">
    <div class="container py-4">
      <div class="flex animate-marquee whitespace-nowrap text-sm font-extrabold uppercase tracking-widest" :style="{ animationDuration: speed + 's' }">
        <template v-for="rep in 2" :key="rep">
          <span v-for="(txt, idx) in items" :key="`${rep}-${idx}`" class="mx-10 flex items-center">
            <span v-if="!dark" class="mr-4 h-2 w-2 bg-[color:var(--color-accent,#FFD200)]" />
            {{ txt }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
