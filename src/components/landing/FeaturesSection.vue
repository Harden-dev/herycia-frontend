<script setup lang="ts">
import LandingReveal from '@/components/landing/LandingReveal.vue'

/** Fonctionnalités en mots géants numérotés, avec leur double en contour. */
const features = [
  { word: 'Agenda', text: 'Les rendez-vous du jour et de la semaine, coiffeur par coiffeur.' },
  { word: 'File d’attente', text: 'QR d’arrivée, position en direct et SMS quand le tour approche.' },
  { word: 'Clients', text: 'Coordonnées et historique des rendez-vous de chaque client.' },
  { word: 'Équipe', text: 'Coiffeurs, réception et gérant : chacun ne voit que ce qui le concerne.' },
  { word: 'Caisse', text: 'Chaque paiement enregistré, en espèces, par Mobile Money ou par carte.' },
  { word: 'Recettes', text: 'Ce que rapportent la journée, la semaine et le mois.', badge: 'Offre Pro' },
]
</script>

<template>
  <section id="fonctionnalites" class="landing-cream px-4 pb-20 pt-4 md:px-10 md:pb-28 md:pt-8">
    <div class="mx-auto max-w-6xl">
      <LandingReveal>
        <p class="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Et concrètement ?
        </p>
        <h2 class="mt-4 max-w-3xl text-[30px] font-semibold uppercase leading-[1.08] tracking-tight md:text-[44px]">
          Le quotidien du salon,
          <span class="landing-serif text-[1.15em] text-primary-600">au même endroit.</span>
        </h2>
      </LandingReveal>

      <ol class="mt-12 border-b border-foreground/15 md:mt-16">
        <LandingReveal
          v-for="(feature, index) in features"
          :key="feature.word"
          as="li"
          :delay="index * 0.06"
          :y="16"
          class="group grid cursor-default gap-3 border-t border-foreground/15 py-6 md:grid-cols-[64px_1fr_280px] md:items-center md:py-8"
        >
          <span class="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground">
            <span class="h-1.5 w-1.5 rounded-full bg-primary-600" />
            0{{ index + 1 }}
          </span>

          <h3 class="relative block">
            <span
              class="landing-outline absolute left-0 top-0 translate-x-3 translate-y-2 text-[40px] font-semibold uppercase leading-none tracking-tight text-foreground/25 transition-transform duration-500 group-hover:translate-x-8 group-hover:translate-y-3 md:text-[72px]"
              aria-hidden="true"
            >
              {{ feature.word }}
            </span>
            <span
              class="relative inline-block text-[40px] font-semibold uppercase leading-none tracking-tight text-foreground transition-[transform,color] duration-500 group-hover:translate-x-1 group-hover:text-primary-700 md:text-[72px]"
            >
              {{ feature.word }}
            </span>
          </h3>

          <span class="text-[15px] leading-relaxed text-muted-foreground transition-opacity duration-500 md:opacity-60 md:group-hover:opacity-100">
            <span
              v-if="feature.badge"
              class="mb-1.5 mr-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-800"
            >
              {{ feature.badge }}
            </span>
            {{ feature.text }}
          </span>
        </LandingReveal>
      </ol>
    </div>
  </section>
</template>
