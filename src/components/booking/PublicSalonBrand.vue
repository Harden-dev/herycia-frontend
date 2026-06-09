<script setup lang="ts">
import { computed } from 'vue'
import { IconScissors } from '@tabler/icons-vue'
import { resolveMediaUrl } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    name: string
    logoUrl?: string | null
    subtitle?: string
    variant?: 'light' | 'dark'
    size?: 'sm' | 'md'
  }>(),
  {
    subtitle: 'Réservation en ligne',
    variant: 'light',
    size: 'md',
  },
)

const logoSrc = computed(() => resolveMediaUrl(props.logoUrl))

const isDark = computed(() => props.variant === 'dark')
const iconSize = computed(() => (props.size === 'sm' ? 18 : 22))
const boxClass = computed(() =>
  props.size === 'sm' ? 'h-10 w-10 rounded-xl' : 'h-11 w-11 rounded-xl',
)
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <div
      class="flex shrink-0 items-center justify-center overflow-hidden shadow-sm"
      :class="[
        boxClass,
        isDark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-primary-600',
      ]"
    >
      <img
        v-if="logoSrc"
        :src="logoSrc"
        :alt="`Logo ${name}`"
        class="h-full w-full object-cover"
      />
      <IconScissors
        v-else
        :size="iconSize"
        :class="isDark ? 'text-primary-100' : 'text-white'"
      />
    </div>
    <div class="min-w-0">
      <p
        class="truncate font-semibold"
        :class="[
          size === 'sm' ? 'text-base' : 'text-lg',
          isDark ? 'text-white' : 'text-foreground',
        ]"
      >
        {{ name }}
      </p>
      <p
        v-if="subtitle"
        class="text-xs"
        :class="isDark ? 'text-primary-100/70' : 'text-muted-foreground'"
      >
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
