<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
  inverse?: boolean
}>()
</script>

<template>
  <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div class="min-w-0 flex-1">
      <h2 :class="inverse ? 'text-white' : 'text-gray-900'" class="text-[30px] font-extrabold leading-tight tracking-tight md:text-[34px]">
        {{ title }}
      </h2>
      <div class="mt-4 flex items-center gap-0">
        <span class="h-[3px] w-24 flex-shrink-0 bg-[color:var(--color-accent,#FACC15)]" />
        <span
          :class="inverse ? 'bg-[color:var(--color-primary,#7aa2ff)]/45' : 'bg-[color:var(--color-primary,#2B3E95)]/28'"
          class="h-px flex-1"
        />
      </div>
      <p v-if="subtitle" :class="inverse ? 'text-white/75' : 'text-gray-500'" class="mt-3 text-sm font-medium md:text-base">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex-shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
