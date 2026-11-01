<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { motion, useReducedMotion } from 'motion-v'
import { IconArrowRight } from '@tabler/icons-vue'
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
  <section ref="heroRef" class="relative overflow-hidden px-4 md:px-10">
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
      class="relative mx-auto grid max-w-6xl items-center gap-14 py-14 md:py-20 lg:grid-cols-[1.25fr_1fr] lg:gap-10"
    >
      <div>

        <motion.h1
          :initial="{ y: 12 }"
          :animate="{ y: 0 }"
          :transition="{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }"
          class="text-[32px] font-semibold uppercase leading-[1.06] tracking-tight text-foreground md:text-[46px]"
        >
          Vos clients
          <template v-for="(verb, index) in verbs" :key="verb.label">
          <span class="whitespace-nowrap">
            <button
              type="button"
              class="relative cursor-pointer whitespace-nowrap uppercase transition-colors"
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
          <span class="landing-serif text-[1.18em] leading-none text-primary-600">sans un seul appel.</span>
        </motion.h1>


        <motion.div v-bind="enter(0.16)" class="mt-10 flex flex-wrap items-center gap-3">
          <LandingButton variant="primary" class="group h-12 rounded-full pl-6 pr-1.5">
            <RouterLink to="/register" class="inline-flex items-center gap-3">
              Essayer 7 jours gratuitement
              <span
                class="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:-rotate-45"
              >
                <IconArrowRight :size="18" />
              </span>
            </RouterLink>
          </LandingButton>
          <LandingButton variant="outline" class="h-12 rounded-full bg-transparent px-6">
            <a href="#tarifs">Voir les tarifs</a>
          </LandingButton>
        </motion.div>

        <motion.p v-bind="enter(0.24)" class="mt-4 text-sm text-muted-foreground">
          7 jours gratuits · Sans carte bancaire
        </motion.p>
      </div>

      <HeroDemo :step="step" :cycle="cycle" :duration="autoplay ? STEP_MS : 0" @select="select" />
    </div>
  </section>
</template>
