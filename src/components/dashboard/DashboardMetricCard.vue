<script setup lang="ts">
import type { Component } from 'vue'
import {
  IconCalendar,
  IconCash,
  IconTrendingDown,
  IconTrendingUp,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-vue'
defineProps<{
  label: string
  value: string | number
  trend?: 'up' | 'down' | null
  trendValue?: string
  iconKey: 'calendar' | 'users' | 'userCheck' | 'cash'
  accent: 'primary' | 'warning' | 'accent' | 'success'
}>()

const icons: Record<string, Component> = {
  calendar: IconCalendar,
  users: IconUsers,
  userCheck: IconUserCheck,
  cash: IconCash,
}

const accentStyles = {
  primary: 'bg-primary-50 text-primary-600',
  warning: 'bg-warning-50 text-warning-600',
  accent: 'bg-accent-50 text-accent-600',
  success: 'bg-success-50 text-success-600',
}
</script>

<template>
  <div
    class="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary-200 hover:shadow-[0_8px_24px_rgb(15_110_86_/_0.08)]"
  >
    <div class="mb-4 flex items-start justify-between">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        :class="accentStyles[accent]"
      >
        <component :is="icons[iconKey]" :size="20" :stroke-width="2" />
      </div>
      <span
        v-if="trendValue"
        class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
        :class="
          trend === 'up'
            ? 'bg-success-50 text-success-800'
            : 'bg-danger-50 text-danger-800'
        "
      >
        <IconTrendingUp v-if="trend === 'up'" :size="12" :stroke-width="2" />
        <IconTrendingDown v-else :size="12" :stroke-width="2" />
        {{ trend === 'up' ? '+' : '-' }}{{ trendValue }}
      </span>
    </div>
    <p class="text-xs text-muted-foreground">{{ label }}</p>
    <p class="mt-1 text-2xl font-medium tracking-tight text-foreground">{{ value }}</p>
  </div>
</template>
