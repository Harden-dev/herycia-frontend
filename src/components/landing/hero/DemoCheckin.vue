<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { IconCircleCheckFilled } from '@tabler/icons-vue'

/** Écran 2 : le client scanne le QR d'arrivée, puis il est enregistré. */
const done = ref(false)
let timer: number | undefined

onMounted(() => {
  timer = window.setTimeout(() => (done.value = true), 1700)
})
onBeforeUnmount(() => window.clearTimeout(timer))

/** Motif de QR déterministe (purement illustratif). */
const cells = Array.from({ length: 121 }, (_, i) => {
  const x = i % 11
  const y = Math.floor(i / 11)
  const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7)
  return finder || (x * 7 + y * 5 + x * y) % 3 === 0
})
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-5 p-4 text-center">
    <AnimatePresence mode="wait">
      <motion.div
        v-if="!done"
        key="scan"
        class="flex flex-col items-center gap-4"
        :exit="{ opacity: 0, scale: 0.9 }"
        :transition="{ duration: 0.25 }"
      >
        <p class="text-xs font-medium text-muted-foreground">Scannez le QR de l’accueil</p>
        <div class="relative rounded-2xl border-2 border-primary-600 p-3">
          <div class="grid grid-cols-11 gap-[2px]">
            <span
              v-for="(on, i) in cells"
              :key="i"
              class="h-[9px] w-[9px] rounded-[1px]"
              :class="on ? 'bg-foreground' : 'bg-transparent'"
            />
          </div>
          <motion.span
            class="absolute inset-x-2 h-0.5 rounded-full bg-primary-500 shadow-[0_0_12px_2px_rgb(201_154_46/0.6)]"
            :initial="{ top: '12%' }"
            :animate="{ top: ['12%', '86%', '12%'] }"
            :transition="{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }"
          />
        </div>
      </motion.div>

      <motion.div
        v-else
        key="ok"
        class="flex flex-col items-center gap-3"
        :initial="{ opacity: 0, scale: 0.85 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 22 }"
      >
        <IconCircleCheckFilled :size="52" class="text-success-600" />
        <p class="text-sm font-semibold text-foreground">Bonjour Aïcha !</p>
        <p class="text-xs text-muted-foreground">Votre arrivée est enregistrée.<br />Vous rejoignez la file de Koffi.</p>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
