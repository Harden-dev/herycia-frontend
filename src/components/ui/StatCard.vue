<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string | number
  icon?: Component
  trend?: 'up' | 'down' | null
  trendValue?: string
}>()
</script>

<template>
  <div class="rounded-md bg-secondary p-4">
    <div class="mb-2 flex items-center justify-between">
      <p class="text-xs text-muted-foreground">{{ label }}</p>
      <component :is="icon" v-if="icon" :size="16" :stroke-width="1.5" class="text-muted-foreground" />
    </div>
    <p class="text-[22px] font-medium text-foreground">{{ value }}</p>
    <p
      v-if="trendValue"
      class="mt-1 text-xs"
      :class="trend === 'up' ? 'text-success-600' : 'text-danger-600'"
    >
      {{ trend === 'up' ? '+' : '-' }}{{ trendValue }} vs hier
    </p>
  </div>
</template>
