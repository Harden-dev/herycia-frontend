<script setup lang="ts">
defineProps<{
  label: string
  title: string
  description?: string
  align?: 'left' | 'center'
}>()
</script>

<template>
  <div
    :class="['mb-10 md:mb-12', align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl']"
  >
    <div :class="['mb-4 flex items-center gap-3', align === 'center' ? 'justify-center' : '']">
      <span class="h-px w-8 bg-primary-400" aria-hidden="true" />
      <p class="text-xs font-medium text-primary-600">{{ label }}</p>
      <span v-if="align === 'center'" class="h-px w-8 bg-primary-400" aria-hidden="true" />
    </div>
    <h2 class="text-[28px] font-extrabold leading-tight text-foreground md:text-[34px]">
      {{ title }}
    </h2>
    <p v-if="description" class="mt-3 text-[15px] leading-relaxed text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>
