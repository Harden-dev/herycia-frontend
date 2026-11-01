<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { motion, useReducedMotion } from 'motion-v'
import { IconArrowRight, IconCheck } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import HeroDemo from '@/components/landing/hero/HeroDemo.vue'

/** Durée d'une étape de la démo en lecture automatique. */
const STEP_MS = 5200

/** Les trois verbes du titre, chacun relié à une étape de la démo (avec sa ponctuation). */
const verbs = [
  { label: 'réservent', after: ',' },
  { label: 'arrivent', after: ' et' },
  { label: 'suivent leur tour', after: ',' },
]

const step = ref(0)
const cycle = ref(0)
const heroRef = ref<HTMLElement | null>(null)
const visible = ref(true)
const reducedMotion = useReducedMotion()
const autoplay = computed(() => visible.value && !reducedMotion.value)
let timer: number | undefined

useIntersectionObserver(heroRef, ([entry]) => {
  visible.value = entry?.isIntersecting ?? true
})

function schedule() {
  window.clearTimeout(timer)
  if (!autoplay.value) return
  timer = window.setTimeout(() => {
    step.value = (step.value + 1) % verbs.length
    cycle.value++
    schedule()
  }, STEP_MS)
}

function select(index: number) {
  step.value = index
  cycle.value++
  schedule()
}

watch(autoplay, schedule, { immediate: true })
onBeforeUnmount(() => window.clearTimeout(timer))

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})
</script>

<template>
  <section ref="heroRef" class="relative overflow-hidden border-b border-border px-4 md:px-10">
    <!-- Halos dorés qui dérivent lentement -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="landing-dots absolute inset-0" />
      <motion.div
        class="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-primary-200/50 blur-3xl"
        :animate="reducedMotion ? {} : { x: [0, -60, 0], y: [0, 40, 0] }"
        :transition="{ duration: 18, repeat: Infinity, ease: 'easeInOut' }"
      />
      <motion.div
        class="absolute -bottom-48 -left-40 h-[460px] w-[460px] rounded-full bg-primary-100/70 blur-3xl"
        :animate="reducedMotion ? {} : { x: [0, 70, 0], y: [0, -30, 0] }"
        :transition="{ duration: 22, repeat: Infinity, ease: 'easeInOut' }"
      />
    </div>

    <div
      class="relative mx-auto grid max-w-6xl items-center gap-14 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10"
    >
      <div>
        <motion.a
          href="#au-salon"
          v-bind="enter(0)"
          class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 py-1 pl-1.5 pr-3 text-xs font-medium text-foreground backdrop-blur hover:border-primary-400"
        >
          <span class="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            Nouveau
          </span>
          File d’attente par QR code
          <IconArrowRight :size="13" class="text-muted-foreground" />
        </motion.a>

        <motion.h1
          v-bind="enter(0.08)"
          class="mt-6 text-[38px] font-semibold leading-[1.12] tracking-tight text-foreground md:text-[54px]"
        >
          Vos clients
          <template v-for="(verb, index) in verbs" :key="verb.label">
          <span class="whitespace-nowrap">
            <button
              type="button"
              class="relative cursor-pointer whitespace-nowrap transition-colors"
              :class="step === index ? 'text-primary-600' : 'text-foreground hover:text-primary-600'"
              :aria-label="`Voir l’étape : ${verb.label}`"
              @click="select(index)"
            >
              <motion.span
                v-if="step === index"
                layout-id="hero-underline"
                class="absolute -bottom-1 left-0 right-0 h-[5px] rounded-full bg-primary-300"
                :transition="{ type: 'spring', stiffness: 380, damping: 32 }"
              />{{ verb.label }}</button
            >{{ verb.after }}</span
          >{{ ' ' }}
          </template>
          sans un seul appel.
        </motion.h1>

        <motion.p
          v-bind="enter(0.16)"
          class="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground"
        >
          Herycia gère la réservation en ligne, l’arrivée par QR code et la file d’attente de
          chaque coiffeur. Vous suivez tout depuis votre téléphone.
        </motion.p>

        <motion.div v-bind="enter(0.24)" class="mt-8 flex flex-wrap items-center gap-3">
          <LandingButton variant="primary" class="group h-12 px-6">
            <RouterLink to="/register" class="inline-flex items-center gap-2">
              Essayer 7 jours gratuitement
              <IconArrowRight :size="18" class="transition-transform group-hover:translate-x-1" />
            </RouterLink>
          </LandingButton>
          <LandingButton variant="outline" class="h-12 px-6">
            <a href="#tarifs">Voir les tarifs</a>
          </LandingButton>
        </motion.div>

        <motion.ul
          v-bind="enter(0.32)"
          class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"
        >
          <li v-for="item in ['Aucune carte bancaire', 'Sans installation', 'Téléphone ou ordinateur']" :key="item" class="flex items-center gap-1.5">
            <IconCheck :size="16" class="text-primary-600" />
            {{ item }}
          </li>
        </motion.ul>
      </div>

      <HeroDemo :step="step" :cycle="cycle" :duration="autoplay ? STEP_MS : 0" @select="select" />
    </div>
  </section>
</template>
