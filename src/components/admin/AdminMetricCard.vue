<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string | number
  icon: Component
  accent: 'primary' | 'warning' | 'accent' | 'success'
}>()

const accentStyles = {
  primary: 'bg-primary-50 text-primary-600',
  warning: 'bg-warning-50 text-warning-600',
  accent: 'bg-accent-50 text-accent-600',
  success: 'bg-success-50 text-success-600',
}
</script>

<template>
  <div
    class="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary-200 hover:shadow-[0_8px_24px_rgb(184_134_11_/_0.08)]"
  >
    <div class="mb-4 flex items-start justify-between">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        :class="accentStyles[accent]"
      >
        <component :is="icon" :size="20" :stroke-width="2" />
      </div>
    </div>
    <p class="text-xs text-muted-foreground">{{ label }}</p>
    <p class="mt-1 text-2xl font-medium tracking-tight text-foreground">{{ value }}</p>
  </div>
</template>
