<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { IconCheck } from '@tabler/icons-vue'

/** Écran 1 : le client réserve (le créneau 10:00 se sélectionne tout seul). */
const slots = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00']
const picked = ref<string | null>(null)
let timer: number | undefined

onMounted(() => {
  timer = window.setTimeout(() => (picked.value = '10:00'), 900)
})
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <div class="flex h-full flex-col gap-4 p-4">
    <div>
      <p class="text-[11px] text-muted-foreground">Réserver chez</p>
      <p class="text-sm font-semibold text-foreground">Salon Élégance</p>
    </div>

    <div>
      <p class="mb-1.5 text-[11px] font-medium text-muted-foreground">Prestation</p>
      <div class="flex flex-wrap gap-1.5">
        <span class="rounded-full bg-primary-600 px-2.5 py-1 text-[11px] font-medium text-white">
          Tresse · 2 h
        </span>
        <span class="rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground">
          Coupe
        </span>
        <span class="rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground">
          Barbe
        </span>
      </div>
    </div>

    <div>
      <p class="mb-1.5 text-[11px] font-medium text-muted-foreground">Coiffeur</p>
      <div class="flex gap-2">
        <span class="flex items-center gap-1.5 rounded-lg border border-primary-600 bg-primary-50 px-2 py-1.5 text-[11px] font-medium">
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[9px] text-white">K</span>
          Koffi
        </span>
        <span class="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-[11px]">
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[9px]">A</span>
          Aya
        </span>
      </div>
    </div>

    <div>
      <p class="mb-1.5 text-[11px] font-medium text-muted-foreground">Samedi 12</p>
      <div class="grid grid-cols-3 gap-1.5">
        <span
          v-for="slot in slots"
          :key="slot"
          class="relative rounded-lg border border-border py-1.5 text-center text-[11px] font-medium"
          :class="picked === slot ? 'text-white' : 'text-foreground'"
        >
          <motion.span
            v-if="picked === slot"
            layout-id="demo-slot"
            class="absolute inset-0 rounded-lg bg-primary-600"
            :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
          />
          <span class="relative">{{ slot }}</span>
        </span>
      </div>
    </div>

    <motion.div
      class="mt-auto flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold"
      :animate="picked ? { backgroundColor: '#9a6f09', color: '#ffffff' } : { backgroundColor: '#f4f4f5', color: '#71717a' }"
      :transition="{ duration: 0.3 }"
    >
      <IconCheck v-if="picked" :size="14" />
      {{ picked ? `Réserver à ${picked}` : 'Choisissez un horaire' }}
    </motion.div>
  </div>
</template>
