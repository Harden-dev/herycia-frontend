<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { IconMessage } from '@tabler/icons-vue'

/** Écran 3 : la position passe de 3 à 2, puis le SMS « bientôt votre tour » arrive. */
const position = ref(3)
const sms = ref(false)
const timers: number[] = []

onMounted(() => {
  timers.push(window.setTimeout(() => (position.value = 2), 1000))
  timers.push(window.setTimeout(() => (sms.value = true), 2300))
})
onBeforeUnmount(() => timers.forEach((t) => window.clearTimeout(t)))
</script>

<template>
  <div class="relative flex h-full flex-col p-4">
    <AnimatePresence>
      <motion.div
        v-if="sms"
        class="absolute inset-x-2 top-2 z-10 flex gap-2 rounded-xl bg-foreground/95 p-2.5 text-left text-white shadow-lg"
        :initial="{ opacity: 0, y: -24, scale: 0.95 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :transition="{ type: 'spring', stiffness: 380, damping: 26 }"
      >
        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-600">
          <IconMessage :size="15" />
        </span>
        <span class="min-w-0">
          <span class="block text-[10px] text-white/60">SMS · maintenant</span>
          <span class="block text-[11px] leading-snug">C’est bientôt votre tour chez Salon Élégance.</span>
        </span>
      </motion.div>
    </AnimatePresence>

    <p class="mt-14 text-center text-xs text-muted-foreground">Votre position</p>
    <div class="relative mx-auto mt-1 h-20 w-20 overflow-hidden">
      <AnimatePresence>
        <motion.span
          :key="position"
          class="absolute inset-0 flex items-center justify-center font-display text-7xl font-semibold text-primary-700"
          :initial="{ y: 60, opacity: 0 }"
          :animate="{ y: 0, opacity: 1 }"
          :exit="{ y: -60, opacity: 0 }"
          :transition="{ type: 'spring', stiffness: 260, damping: 24 }"
        >
          {{ position }}
        </motion.span>
      </AnimatePresence>
    </div>
    <p class="text-center text-xs text-muted-foreground">
      {{ position - 1 }} personne{{ position > 2 ? 's' : '' }} avant vous
    </p>

    <div class="mx-4 mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
      <motion.div
        class="h-full rounded-full bg-primary-600"
        :initial="{ width: '35%' }"
        :animate="{ width: position === 2 ? '68%' : '35%' }"
        :transition="{ duration: 0.8, ease: 'easeOut' }"
      />
    </div>

    <dl class="mt-auto divide-y divide-border rounded-xl border border-border text-[11px]">
      <div class="flex justify-between px-3 py-2">
        <dt class="text-muted-foreground">Passage estimé</dt>
        <dd class="font-medium">vers {{ position === 2 ? '10:45' : '11:15' }}</dd>
      </div>
      <div class="flex justify-between px-3 py-2">
        <dt class="text-muted-foreground">Coiffeur</dt>
        <dd class="font-medium">Koffi</dd>
      </div>
    </dl>
  </div>
</template>
