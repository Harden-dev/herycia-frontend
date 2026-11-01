<script setup lang="ts">
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'

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
      <LandingSectionHeader title="Pour commencer, trois étapes." />
      <ol class="grid gap-6 md:grid-cols-3">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="rounded-xl border border-border bg-card p-6"
        >
          <p class="font-display text-3xl font-semibold text-primary-600">{{ index + 1 }}</p>
          <h3 class="mt-4 text-base font-semibold text-foreground">{{ step.title }}</h3>
          <p class="mt-2 text-[15px] leading-relaxed text-muted-foreground">{{ step.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
