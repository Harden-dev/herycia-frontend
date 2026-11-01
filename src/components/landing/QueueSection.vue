<script setup lang="ts">
import { ref, watch } from 'vue'
import { AnimatePresence, motion, useInView } from 'motion-v'
import { IconClockExclamation, IconQrcode, IconUserPlus } from '@tabler/icons-vue'
import LandingReveal from '@/components/landing/LandingReveal.vue'

const cases = [
  {
    icon: IconClockExclamation,
    title: 'En retard ?',
    text: 'Au-delà du retard toléré (que vous réglez), le client choisit : passer après le dernier de la liste, ou revenir un autre jour à la même heure.',
  },
  {
    icon: IconUserPlus,
    title: 'Sans rendez-vous ?',
    text: 'Il choisit sa prestation et rejoint la file du coiffeur de son choix, ou du premier disponible. L’accueil peut aussi l’ajouter.',
  },
]

/** La position du client exemple descend de 4 à 2 quand l'écran devient visible. */
const phoneRef = ref<HTMLElement | null>(null)
const inView = useInView(phoneRef, { once: true, margin: '0px 0px -120px 0px' })
const position = ref(4)

watch(inView, (visible) => {
  if (!visible) return
  window.setTimeout(() => (position.value = 3), 700)
  window.setTimeout(() => (position.value = 2), 1600)
})
</script>

<template>
  <section id="au-salon" class="landing-cream px-4 py-20 md:px-10 md:py-28">
    <div class="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_360px] lg:gap-20">
      <div>
        <LandingReveal>
          <p class="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Au salon</p>
          <h2 class="mt-4 text-[30px] font-semibold uppercase leading-[1.08] tracking-tight md:text-[44px]">
            Les imprévus aussi,
            <span class="landing-serif text-[1.15em] text-primary-600">c’est prévu.</span>
          </h2>
        </LandingReveal>

        <div class="mt-10 space-y-8">
          <LandingReveal
            v-for="(item, index) in cases"
            :key="item.title"
            :delay="0.1 + index * 0.12"
            class="flex gap-4 border-t border-foreground/15 pt-8"
          >
            <component :is="item.icon" :size="26" class="mt-1 shrink-0 text-primary-600" />
            <div>
              <h3 class="text-xl font-semibold text-foreground">{{ item.title }}</h3>
              <p class="mt-2 text-[16px] leading-relaxed text-muted-foreground">{{ item.text }}</p>
            </div>
          </LandingReveal>
        </div>
      </div>

      <figure ref="phoneRef" class="mx-auto w-full max-w-[360px]">
        <motion.div
          class="rounded-3xl bg-foreground p-2 shadow-[0_40px_80px_-30px_rgb(61_43_2/0.45)]"
          :initial="{ opacity: 0, y: 40, rotate: 3 }"
          :while-in-view="{ opacity: 1, y: 0, rotate: 0 }"
          :in-view-options="{ once: true }"
          :transition="{ type: 'spring', stiffness: 120, damping: 18 }"
        >
          <div class="rounded-[1.25rem] bg-white p-6 text-foreground">
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <IconQrcode :size="16" aria-hidden="true" />
              Salon Élégance · avec Koffi
            </div>
            <div class="mt-6 text-center">
              <div class="relative mx-auto h-[64px] w-16 overflow-hidden">
                <AnimatePresence>
                  <motion.p
                    :key="position"
                    class="absolute inset-0 font-display text-6xl font-semibold leading-[64px] text-primary-700"
                    :initial="{ y: 64, opacity: 0 }"
                    :animate="{ y: 0, opacity: 1 }"
                    :exit="{ y: -64, opacity: 0 }"
                    :transition="{ type: 'spring', stiffness: 260, damping: 24 }"
                  >
                    {{ position }}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">position</p>
            </div>
            <dl class="mt-6 divide-y divide-border border-y border-border text-sm">
              <div class="flex justify-between py-3">
                <dt class="text-muted-foreground">Avant vous</dt>
                <dd class="font-medium">{{ position - 1 }} personne{{ position > 2 ? 's' : '' }}</dd>
              </div>
              <div class="flex justify-between py-3">
                <dt class="text-muted-foreground">Passage estimé</dt>
                <dd class="font-medium">vers 10:45</dd>
              </div>
            </dl>
            <p class="mt-4 text-center text-xs text-muted-foreground">Page mise à jour automatiquement</p>
          </div>
        </motion.div>
        <figcaption class="mt-3 text-center text-xs text-muted-foreground">
          Exemple : l’écran du client après le scan.
        </figcaption>
      </figure>
    </div>
  </section>
</template>
