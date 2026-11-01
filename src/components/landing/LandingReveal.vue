<script setup lang="ts">
import { motion } from 'motion-v'

/** Apparition douce au défilement (une seule fois), façon motion.dev. */
withDefaults(
  defineProps<{
    delay?: number
    y?: number
    as?: 'div' | 'li' | 'section' | 'article'
  }>(),
  { delay: 0, y: 24, as: 'div' },
)
</script>

<template>
  <component
    :is="motion[as]"
    :initial="{ opacity: 0, y }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :in-view-options="{ once: true, margin: '0px 0px -80px 0px' }"
    :transition="{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }"
  >
    <slot />
  </component>
</template>
