<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'
import { Input } from '@/components/ui/input'

defineProps<{
  placeholder?: string
}>()

const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="relative w-full max-w-md">
      <IconSearch
        :size="18"
        :stroke-width="2"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        v-model="search"
        :placeholder="placeholder ?? 'Rechercher...'"
        class="h-10 rounded-lg border-border bg-card pl-10 shadow-[0_1px_2px_rgb(0_0_0_/_0.03)]"
      />
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
