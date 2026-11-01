<script setup lang="ts">
import { ref, watch } from 'vue'
import { AnimatePresence, motion, useInView } from 'motion-v'
import { IconClockExclamation, IconQrcode, IconUserPlus } from '@tabler/icons-vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import LandingReveal from '@/components/landing/LandingReveal.vue'

/** La position du client exemple descend de 4 à 2 quand l'écran devient visible. */
const phoneRef = ref<HTMLElement | null>(null)
const inView = useInView(phoneRef, { once: true, margin: '0px 0px -120px 0px' })
const position = ref(4)

watch(inView, (visible) => {
  if (!visible) return
  window.setTimeout(() => (position.value = 3), 700)
  window.setTimeout(() => (position.value = 2), 1600)
})

const steps = [
  {
    title: 'Le client scanne le QR d’arrivée',
    text: 'Affiché à l’accueil. Il est reconnu par son rendez-vous ou son numéro de téléphone.',
  },
  {
    title: 'Il voit sa position',
    text: 'Le nombre de personnes avant lui et l’heure de passage estimée, mises à jour en continu.',
  },
  {
    title: 'Il est prévenu par SMS',
    text: 'Quand son tour approche, il peut patienter dehors sans perdre sa place.',
  },
]

const cases = [
  {
    icon: IconClockExclamation,
    title: 'En retard ?',
    text: 'Au-delà du retard toléré, le client choisit : passer après le dernier de la liste, ou revenir un autre jour à la même heure.',
  },
  {
    icon: IconUserPlus,
    title: 'Sans rendez-vous ?',
    text: 'Il choisit sa prestation et rejoint la file du coiffeur de son choix, ou du premier disponible.',
  },
]
</script>

<template>
  <section id="au-salon" class="landing-dark px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <LandingReveal>
        <LandingSectionHeader
          tone="dark"
          title="Au salon, chacun sait quand vient son tour."
          description="Fini la salle d’attente où l’on demande toutes les dix minutes « c’est bientôt moi ? »."
        />
      </LandingReveal>

      <div class="grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
        <div>
          <ol class="grid gap-8 sm:grid-cols-3 sm:gap-6">
            <LandingReveal v-for="(step, index) in steps" :key="step.title" as="li" :delay="index * 0.12">
              <p class="font-display text-sm font-semibold text-primary-400">0{{ index + 1 }}</p>
              <h3 class="mt-2 text-base font-semibold text-white">{{ step.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-white/65">{{ step.text }}</p>
            </LandingReveal>
          </ol>

          <div class="mt-12 grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-2">
            <LandingReveal
              v-for="(item, index) in cases"
              :key="item.title"
              :delay="0.2 + index * 0.12"
              class="flex gap-3"
            >
              <component :is="item.icon" :size="22" class="mt-0.5 shrink-0 text-primary-400" />
              <div>
                <h3 class="text-base font-semibold text-white">{{ item.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-white/65">{{ item.text }}</p>
              </div>
            </LandingReveal>
          </div>
        </div>

        <figure ref="phoneRef" class="mx-auto w-full max-w-[340px]">
          <motion.div
            class="rounded-2xl bg-white p-6 text-foreground"
            :initial="{ opacity: 0, y: 40, rotate: 2 }"
            :while-in-view="{ opacity: 1, y: 0, rotate: 0 }"
            :in-view-options="{ once: true }"
            :transition="{ type: 'spring', stiffness: 120, damping: 18 }"
          >
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <IconQrcode :size="16" aria-hidden="true" />
              Salon Élégance · avec Koffi
            </div>
            <div class="mt-6 text-center">
              <div class="relative mx-auto h-[60px] w-16 overflow-hidden">
                <AnimatePresence>
                  <motion.p
                    :key="position"
                    class="absolute inset-0 font-display text-6xl font-semibold leading-[60px] text-primary-700"
                    :initial="{ y: 60, opacity: 0 }"
                    :animate="{ y: 0, opacity: 1 }"
                    :exit="{ y: -60, opacity: 0 }"
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
                <dd class="font-medium">
                  {{ position - 1 }} personne{{ position > 2 ? 's' : '' }}
                </dd>
              </div>
              <div class="flex justify-between py-3">
                <dt class="text-muted-foreground">Passage estimé</dt>
                <dd class="font-medium">vers 10:45</dd>
              </div>
              <div class="flex justify-between py-3">
                <dt class="text-muted-foreground">Prestation</dt>
                <dd class="font-medium">Coupe homme</dd>
              </div>
            </dl>
            <p class="mt-4 text-center text-xs text-muted-foreground">
              Page mise à jour automatiquement
            </p>
          </motion.div>
          <figcaption class="mt-3 text-center text-xs text-white/50">
            Exemple : l’écran du client après le scan.
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
