<script setup lang="ts">
import { motion } from 'motion-v'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
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
  <section class="bg-secondary px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <LandingReveal>
        <LandingSectionHeader title="Pour commencer, trois étapes." />
      </LandingReveal>
      <ol class="grid gap-6 md:grid-cols-3">
        <LandingReveal v-for="(step, index) in steps" :key="step.title" as="li" :delay="index * 0.12">
          <motion.div
            class="h-full rounded-xl border border-border bg-card p-6 hover:border-primary-300"
            :while-hover="{ y: -6 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 22 }"
          >
          <p class="font-display text-3xl font-semibold text-primary-600">{{ index + 1 }}</p>
          <h3 class="mt-4 text-base font-semibold text-foreground">{{ step.title }}</h3>
          <p class="mt-2 text-[15px] leading-relaxed text-muted-foreground">{{ step.text }}</p>
          </motion.div>
        </LandingReveal>
      </ol>
    </div>
  </section>
</template>
