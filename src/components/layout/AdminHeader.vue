<script setup lang="ts">
import UserMenu from '@/components/layout/UserMenu.vue'

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="mb-6 flex items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <p class="text-[11px] font-medium uppercase tracking-wider text-primary-600">Super Admin</p>
      <h1 class="mt-1 text-[22px] font-medium text-foreground">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-[13px] text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <div class="flex shrink-0 items-center gap-3">
      <slot name="actions" />
      <UserMenu />
    </div>
  </header>
</template>
