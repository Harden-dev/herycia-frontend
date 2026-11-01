<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    tone?: 'light' | 'dark'
  }>(),
  { tone: 'light' },
)
</script>

<template>
  <div class="mb-10 max-w-2xl md:mb-12">
    <h2
      class="text-[28px] font-semibold leading-tight md:text-[36px]"
      :class="tone === 'dark' ? 'text-white' : 'text-foreground'"
    >
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-3 text-[16px] leading-relaxed"
      :class="tone === 'dark' ? 'text-white/65' : 'text-muted-foreground'"
    >
      {{ description }}
    </p>
  </div>
</template>
