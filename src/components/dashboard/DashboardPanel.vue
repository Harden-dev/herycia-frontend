<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  title: string
  description?: string
  class?: string
}>()
</script>

<template>
  <div
    :class="
      cn(
        'rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_6px_20px_rgb(15_110_86_/_0.06)] md:p-6',
        $props.class,
      )
    "
  >
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-base font-medium text-foreground">{{ title }}</h2>
        <p v-if="description" class="mt-0.5 text-xs text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>
