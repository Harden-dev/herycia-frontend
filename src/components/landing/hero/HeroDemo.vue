<script setup lang="ts">
import { computed } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { IconCalendarPlus, IconDoorEnter, IconMessageCheck } from '@tabler/icons-vue'
import DemoBooking from '@/components/landing/hero/DemoBooking.vue'
import DemoCheckin from '@/components/landing/hero/DemoCheckin.vue'
import DemoTracking from '@/components/landing/hero/DemoTracking.vue'

/**
 * Démonstration interactive du parcours client : un téléphone qui enchaîne
 * réservation → arrivée → suivi, et ce que le salon voit au même moment.
 */
const props = defineProps<{
  step: number
  /** Durée d'une étape en lecture automatique ; 0 = pas de barre de progression. */
  duration: number
  /** Incrémenté à chaque (re)démarrage d'étape pour relancer la barre. */
  cycle: number
}>()
const emit = defineEmits<{ select: [step: number] }>()

const steps = [
  { label: 'Réserver', screen: DemoBooking },
  { label: 'Arriver', screen: DemoCheckin },
  { label: 'Suivre son tour', screen: DemoTracking },
]

const salonEvents = [
  { icon: IconCalendarPlus, title: 'Nouveau rendez-vous', text: 'Aïcha · Tresse · samedi 10:00' },
  { icon: IconDoorEnter, title: 'Aïcha est arrivée', text: 'File de Koffi · 2e position' },
  { icon: IconMessageCheck, title: 'SMS envoyé', text: 'Aïcha passe dans 10 min' },
]

const current = computed(() => steps[props.step] ?? steps[0]!)
const event = computed(() => salonEvents[props.step] ?? salonEvents[0]!)
</script>

<template>
  <div class="relative">
    <!-- Onglets d'étapes -->
    <div class="mx-auto mb-6 flex max-w-sm gap-2" role="tablist" aria-label="Parcours client">
      <button
        v-for="(item, index) in steps"
        :key="item.label"
        type="button"
        role="tab"
        :aria-selected="step === index"
        class="group flex-1 cursor-pointer text-left"
        @click="emit('select', index)"
      >
        <span class="block h-1 overflow-hidden rounded-full bg-foreground/10">
          <motion.span
            v-if="step === index"
            :key="`${index}-${cycle}`"
            class="block h-full rounded-full bg-primary-600"
            :initial="{ width: duration ? '0%' : '100%' }"
            :animate="{ width: '100%' }"
            :transition="{ duration: duration / 1000, ease: 'linear' }"
          />
          <span v-else-if="index < step" class="block h-full w-full rounded-full bg-primary-600/40" />
        </span>
        <span
          class="mt-2 block text-xs font-medium transition-colors"
          :class="step === index ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'"
        >
          {{ index + 1 }}. {{ item.label }}
        </span>
      </button>
    </div>

    <div class="relative mx-auto w-[272px]">
      <!-- Événement côté salon -->
      <div class="pointer-events-none absolute -left-48 top-24 z-30 hidden w-56 xl:block">
        <AnimatePresence mode="wait">
          <motion.div
            :key="step"
            class="rounded-xl border border-border bg-card p-3 shadow-[0_12px_32px_rgb(0_0_0/0.08)]"
            :initial="{ opacity: 0, x: -24, scale: 0.95 }"
            :animate="{ opacity: 1, x: 0, scale: 1 }"
            :exit="{ opacity: 0, x: -12, scale: 0.97 }"
            :transition="{ type: 'spring', stiffness: 320, damping: 26, delay: 0.5 }"
          >
            <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Côté salon
            </p>
            <div class="flex gap-2.5">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <component :is="event.icon" :size="16" />
              </span>
              <span class="min-w-0">
                <span class="block text-xs font-semibold text-foreground">{{ event.title }}</span>
                <span class="block text-[11px] text-muted-foreground">{{ event.text }}</span>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <!-- Téléphone -->
      <motion.div
        class="relative h-[540px] rounded-[2.5rem] border-[10px] border-foreground bg-card shadow-[0_30px_80px_-20px_rgb(61_43_2/0.35)]"
        :initial="{ opacity: 0, y: 40, rotate: -2 }"
        :animate="{ opacity: 1, y: 0, rotate: 0 }"
        :transition="{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }"
      >
        <span class="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground" />
        <div class="h-full overflow-hidden rounded-[1.9rem] pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              :key="step"
              class="h-full"
              :initial="{ opacity: 0, x: 40, filter: 'blur(4px)' }"
              :animate="{ opacity: 1, x: 0, filter: 'blur(0px)' }"
              :exit="{ opacity: 0, x: -40, filter: 'blur(4px)' }"
              :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
            >
              <component :is="current.screen" />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  </div>
</template>
