<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: { label: string; value: number }[]
  formatValue?: (n: number) => string
  barClass?: string
}>()

const max = computed(() => Math.max(...props.data.map((d) => d.value), 1))

function heightPercent(value: number) {
  return `${Math.round((value / max.value) * 100)}%`
}

function defaultFormat(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return String(n)
}
</script>

<template>
  <div class="flex h-48 items-end gap-2 sm:gap-3">
    <div
      v-for="point in data"
      :key="point.label"
      class="flex min-w-0 flex-1 flex-col items-center gap-2"
    >
      <span class="text-[10px] font-medium text-muted-foreground">
        {{ (formatValue ?? defaultFormat)(point.value) }}
      </span>
      <div class="flex w-full flex-1 items-end">
        <div
          class="w-full min-h-[4px] rounded-t-md transition-all duration-500"
          :class="barClass ?? 'bg-primary-600'"
          :style="{ height: heightPercent(point.value) }"
        />
      </div>
      <span class="truncate text-[10px] text-muted-foreground">{{ point.label }}</span>
    </div>
  </div>
</template>
