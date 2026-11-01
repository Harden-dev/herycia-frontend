<script setup lang="ts">
import { IconScissors } from '@tabler/icons-vue'

/** Marque typographique : même pastille que la barre latérale de l'application. */
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span
      class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600"
      aria-hidden="true"
    >
      <IconScissors :size="17" :stroke-width="1.75" class="text-white" />
    </span>
    <span
      class="font-display text-lg font-semibold tracking-tight"
      :class="tone === 'dark' ? 'text-white' : 'text-foreground'"
    >
      Herycia
    </span>
  </span>
</template>
