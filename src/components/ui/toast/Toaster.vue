<script setup lang="ts">
import { IconCheck, IconX } from '@tabler/icons-vue'
import { useToasts } from '@/lib/toast'
import { cn } from '@/lib/utils'

const toasts = useToasts()

function dismiss(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}
</script>

<template>
  <div
    class="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col items-end gap-2 px-4 sm:px-0"
    aria-live="polite"
    aria-label="Notifications"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-4 opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-4 opacity-0"
    >
      <div
        v-for="item in toasts"
        :key="item.id"
        class="pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_8px_24px_rgb(0_0_0_/_0.12)]"
        :class="
          cn(
            item.variant === 'success' && 'border-success-200 bg-success-50 text-success-900',
            item.variant === 'error' && 'border-danger-200 bg-danger-50 text-danger-900',
          )
        "
        role="alert"
      >
        <IconCheck
          v-if="item.variant === 'success'"
          :size="18"
          :stroke-width="2"
          class="mt-0.5 shrink-0 text-success-600"
        />
        <IconX v-else :size="18" :stroke-width="2" class="mt-0.5 shrink-0 text-danger-600" />
        <p class="min-w-0 flex-1 text-sm font-medium leading-snug">{{ item.message }}</p>
        <button
          type="button"
          class="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Fermer"
          @click="dismiss(item.id)"
        >
          <IconX :size="14" :stroke-width="2" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
