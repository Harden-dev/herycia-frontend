<script setup lang="ts">
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

withDefaults(
  defineProps<{
    size?: LogoSize
  }>(),
  { size: 'md' },
)

const heightClass: Record<LogoSize, string> = {
  xs: 'h-7',
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-14',
  xl: 'h-16',
}
</script>

<template>
  <img
    src="/logo-herycia.png"
    alt="Herycia"
    :class="[heightClass[size], 'w-auto shrink-0 rounded-lg object-contain']"
  />
</template>
