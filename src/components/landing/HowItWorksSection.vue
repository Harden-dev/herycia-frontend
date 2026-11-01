<script setup lang="ts">
import { motion } from 'motion-v'
import LandingReveal from '@/components/landing/LandingReveal.vue'

const steps = [
  {
    title: 'Créez votre compte',
    text: 'Le nom du salon, la ville et votre numéro WhatsApp. L’essai de 7 jours commence tout de suite.',
  },
  {
    title: 'Ajoutez prestations et coiffeurs',
    text: 'Le prix et la durée de chaque prestation, puis les membres de votre équipe.',
  },
  {
    title: 'Partagez le lien, affichez le QR',
    text: 'Le lien de réservation pour vos clients, le QR d’arrivée à l’accueil. Les deux sont dans Paramètres.',
  },
]
</script>

<template>
  <section class="landing-dark landing-grain px-4 py-20 md:px-10 md:py-28">
    <div class="relative mx-auto max-w-6xl">
      <LandingReveal>
        <p class="text-xs font-medium uppercase tracking-[0.3em] text-white/50">Pour commencer</p>
        <h2 class="mt-4 text-[30px] font-semibold uppercase leading-[1.08] tracking-tight md:text-[44px]">
          Trois étapes,
          <span class="landing-serif text-[1.15em] text-primary-300">pas une de plus.</span>
        </h2>
      </LandingReveal>
      <ol class="mt-12 grid gap-5 md:grid-cols-3">
        <LandingReveal v-for="(step, index) in steps" :key="step.title" as="li" :delay="index * 0.12">
          <motion.div
            class="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:border-primary-400/60"
            :while-hover="{ y: -6 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 22 }"
          >
            <p class="landing-serif text-5xl text-primary-300">0{{ index + 1 }}</p>
            <h3 class="mt-6 text-lg font-semibold text-white">{{ step.title }}</h3>
            <p class="mt-2 text-[15px] leading-relaxed text-white/60">{{ step.text }}</p>
          </motion.div>
        </LandingReveal>
      </ol>
    </div>
  </section>
</template>
