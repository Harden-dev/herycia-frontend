<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion-v'

/**
 * Curseur personnalisé : un point qui suit la souris avec un léger ressort et
 * grossit au-dessus des liens et boutons. Désactivé au doigt et avec « réduire les animations ».
 */
const emit = defineEmits<{ active: [value: boolean] }>()

const enabled = ref(false)
const hovering = ref(false)
const visible = ref(false)
const reducedMotion = useReducedMotion()

const x = useMotionValue(-100)
const y = useMotionValue(-100)
const springX = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 })
const springY = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 })

function onMove(event: PointerEvent) {
  x.set(event.clientX)
  y.set(event.clientY)
  visible.value = true
  const target = event.target as Element | null
  hovering.value = Boolean(target?.closest('a, button, [role="tab"]'))
}

function onLeave() {
  visible.value = false
}

onMounted(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  enabled.value = finePointer && !reducedMotion.value
  emit('active', enabled.value)
  if (!enabled.value) return
  window.addEventListener('pointermove', onMove)
  document.documentElement.addEventListener('pointerleave', onLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  document.documentElement.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <motion.div
    v-if="enabled"
    class="pointer-events-none fixed left-0 top-0 z-[100] -ml-2 -mt-2 h-4 w-4 rounded-full bg-white mix-blend-difference"
    :style="{ x: springX, y: springY }"
    :animate="{ scale: hovering ? 3.2 : 1, opacity: visible ? 1 : 0 }"
    :transition="{ type: 'spring', stiffness: 400, damping: 28 }"
    aria-hidden="true"
  />
</template>
