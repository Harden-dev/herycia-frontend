<script setup lang="ts">
import { cn } from '@/lib/utils'
import { useScrollReveal } from '@/lib/landing'

const props = withDefaults(
  defineProps<{
    delay?: number
    direction?: 'up' | 'left' | 'right' | 'scale'
    class?: string
  }>(),
  {
    delay: 0,
    direction: 'up',
  },
)

const { target, isVisible } = useScrollReveal()

const hiddenByDirection = {
  up: 'translate-y-10 opacity-0',
  left: '-translate-x-10 opacity-0',
  right: 'translate-x-10 opacity-0',
  scale: 'scale-[0.96] opacity-0',
}
</script>

<template>
  <div
    ref="target"
    :class="
      cn(
        'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-none motion-reduce:opacity-100 motion-reduce:transition-none',
        isVisible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : hiddenByDirection[direction],
        props.class,
      )
    "
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <slot />
  </div>
</template>
