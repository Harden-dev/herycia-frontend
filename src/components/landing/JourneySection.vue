<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion-v'
import JourneyVisual from '@/components/landing/JourneyVisual.vue'
import LandingReveal from '@/components/landing/LandingReveal.vue'

/**
 * Parcours client en section épinglée : en défilant, les étapes 01 → 03
 * s'enchaînent (index numéroté, grand numéro en filigrane). Liste simple sur mobile.
 */
const steps = [
  {
    label: 'Réserver',
    title: 'Le client réserve',
    accent: 'tout seul.',
    text: 'Depuis votre lien ou le QR de réservation : prestation, coiffeur, jour et heure parmi vos créneaux libres. Il reçoit ensuite un lien pour suivre son rendez-vous.',
  },
  {
    label: 'Arriver',
    title: 'Il scanne le QR',
    accent: 'en arrivant.',
    text: 'Reconnu par son rendez-vous ou son numéro, il rejoint la file de son coiffeur. En retard, il choisit : passer après le dernier ou revenir un autre jour à la même heure.',
  },
  {
    label: 'Suivre son tour',
    title: 'Il voit son tour',
    accent: 'arriver.',
    text: 'Sa position et l’heure de passage se mettent à jour. Un SMS le prévient quand c’est bientôt à lui : il peut patienter dehors sans perdre sa place.',
  },
]

const trackRef = ref<HTMLElement | null>(null)
const active = ref(0)
const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
useMotionValueEvent(scrollYProgress, 'change', (value) => {
  active.value = Math.min(steps.length - 1, Math.floor(value * steps.length))
})
</script>

<template>
  <section id="reservation" class="landing-dark landing-grain" aria-label="Le parcours client">
    <!-- Grand écran : section épinglée -->
    <div ref="trackRef" class="relative hidden h-[300vh] lg:block">
      <div class="sticky top-0 flex h-screen items-center overflow-hidden px-10">
        <div class="relative mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-16">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
              <span class="text-primary-400">0{{ active + 1 }}</span> / Le parcours client
            </p>
            <div class="relative mt-8 min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  :key="active"
                  :initial="{ opacity: 0, y: 40 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :exit="{ opacity: 0, y: -30 }"
                  :transition="{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }"
                >
                  <p class="text-xs font-medium uppercase tracking-[0.25em] text-primary-400">
                    {{ steps[active]!.label }}
                  </p>
                  <h2 class="mt-4 text-[56px] font-semibold uppercase leading-[1.02] tracking-tight">
                    {{ steps[active]!.title }}<br />
                    <span class="landing-serif text-[1.15em] text-primary-300">{{ steps[active]!.accent }}</span>
                  </h2>
                  <p class="mt-6 max-w-lg text-[17px] leading-relaxed text-white/65">
                    {{ steps[active]!.text }}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div class="relative flex w-[400px] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                :key="active"
                class="flex w-full justify-center"
                :initial="{ opacity: 0, scale: 0.92, rotate: 3 }"
                :animate="{ opacity: 1, scale: 1, rotate: 0 }"
                :exit="{ opacity: 0, scale: 0.95, rotate: -2 }"
                :transition="{ type: 'spring', stiffness: 160, damping: 20 }"
              >
                <JourneyVisual :step="active" />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        <!-- Index vertical -->
        <ol class="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col gap-3 text-[11px] font-medium tracking-widest xl:right-10">
            <li
              v-for="(step, index) in steps"
              :key="step.label"
              class="flex items-center gap-2 transition-colors"
              :class="index === active ? 'text-white' : 'text-white/30'"
            >
              <span
                class="h-px bg-current transition-all duration-500"
                :class="index === active ? 'w-6' : 'w-0'"
              />
              0{{ index + 1 }}
            </li>
          </ol>

        <!-- Grand numéro en filigrane -->
        <AnimatePresence mode="wait">
          <motion.span
            :key="active"
            class="landing-outline pointer-events-none absolute -bottom-12 right-16 font-display text-[280px] font-semibold leading-none text-white/20"
            :initial="{ opacity: 0, y: 80 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -40 }"
            :transition="{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }"
            aria-hidden="true"
          >
            0{{ active + 1 }}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>

    <!-- Mobile et tablette : liste simple -->
    <div class="px-4 py-20 md:px-10 lg:hidden">
      <p class="text-xs font-medium uppercase tracking-[0.3em] text-white/50">Le parcours client</p>
      <ol class="mt-10 space-y-16">
        <LandingReveal v-for="(step, index) in steps" :key="step.label" as="li">
          <p class="text-xs font-medium uppercase tracking-[0.25em] text-primary-400">
            0{{ index + 1 }} · {{ step.label }}
          </p>
          <h2 class="mt-3 text-[34px] font-semibold uppercase leading-[1.05] tracking-tight">
            {{ step.title }}
            <span class="landing-serif text-[1.15em] text-primary-300">{{ step.accent }}</span>
          </h2>
          <p class="mt-4 text-[16px] leading-relaxed text-white/65">{{ step.text }}</p>
          <div class="mt-8 flex justify-center">
            <JourneyVisual :step="index" />
          </div>
        </LandingReveal>
      </ol>
    </div>
  </section>
</template>
