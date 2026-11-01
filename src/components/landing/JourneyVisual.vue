<script setup lang="ts">
import { IconCircleCheckFilled, IconLink, IconMessage } from '@tabler/icons-vue'
import { getBookingUrl } from '@/lib/booking'

/** Visuel d'une étape du parcours client (statique, illustratif). */
defineProps<{ step: number }>()

const link = getBookingUrl('votre-salon').replace(/^https?:\/\//, '')
const choices = [
  { label: 'Prestation', value: 'Tresse · 2 h' },
  { label: 'Coiffeur', value: 'Koffi' },
  { label: 'Jour et heure', value: 'Samedi · 10:00' },
]
const qr = Array.from({ length: 121 }, (_, i) => {
  const x = i % 11
  const y = Math.floor(i / 11)
  return (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7) || (x * 7 + y * 5 + x * y) % 3 === 0
})
</script>

<template>
  <div class="w-full max-w-sm rounded-2xl bg-white p-6 text-foreground shadow-[0_30px_80px_-30px_rgb(0_0_0/0.5)]">
    <template v-if="step === 0">
      <div class="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
        <IconLink :size="15" class="shrink-0 text-muted-foreground" />
        <span class="truncate font-mono text-xs">{{ link }}</span>
      </div>
      <dl class="mt-4 divide-y divide-border">
        <div v-for="choice in choices" :key="choice.label" class="flex justify-between py-3 text-sm">
          <dt class="text-muted-foreground">{{ choice.label }}</dt>
          <dd class="font-medium">{{ choice.value }}</dd>
        </div>
      </dl>
      <p class="mt-3 rounded-lg bg-primary-600 py-2.5 text-center text-sm font-semibold text-white">
        Réserver à 10:00
      </p>
    </template>

    <template v-else-if="step === 1">
      <p class="text-center text-xs text-muted-foreground">QR affiché à l’accueil</p>
      <div class="mx-auto mt-4 w-fit rounded-2xl border-2 border-primary-600 p-3">
        <div class="grid grid-cols-11 gap-[3px]">
          <span
            v-for="(on, i) in qr"
            :key="i"
            class="h-3 w-3 rounded-[2px]"
            :class="on ? 'bg-foreground' : 'bg-transparent'"
          />
        </div>
      </div>
      <p class="mt-5 flex items-center justify-center gap-2 text-sm font-semibold">
        <IconCircleCheckFilled :size="20" class="text-success-600" />
        Arrivée enregistrée
      </p>
    </template>

    <template v-else>
      <div class="flex gap-2 rounded-xl bg-foreground p-3 text-white">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-600">
          <IconMessage :size="16" />
        </span>
        <span class="text-xs leading-snug">
          <span class="block text-white/60">SMS · maintenant</span>
          C’est bientôt votre tour chez Salon Élégance.
        </span>
      </div>
      <p class="mt-6 text-center text-xs text-muted-foreground">Votre position</p>
      <p class="text-center font-display text-7xl font-semibold text-primary-700">2</p>
      <p class="text-center text-sm text-muted-foreground">Passage vers 10:45</p>
    </template>
  </div>
</template>
