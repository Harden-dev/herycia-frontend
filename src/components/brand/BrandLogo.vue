<script setup lang="ts">
import { BRAND_NAME } from '@/lib/brand'

/** Logo MANYAN (or, fond transparent) : lisible sur fond clair comme sur fond noir. */
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const heights = { sm: 'h-4', md: 'h-5', lg: 'h-7' } as const
</script>

<template>
  <img
    src="/manyan-logo.png"
    :alt="BRAND_NAME"
    width="1251"
    height="183"
    :class="[heights[size], 'w-auto shrink-0 select-none']"
    draggable="false"
  />
</template>
