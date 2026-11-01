<script setup lang="ts">
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import LandingReveal from '@/components/landing/LandingReveal.vue'

const features = [
  { title: 'Agenda par coiffeur', text: 'Les rendez-vous du jour et de la semaine, coiffeur par coiffeur.' },
  { title: 'Fiches clients', text: 'Coordonnées et historique des rendez-vous de chaque client.' },
  {
    title: 'Équipe et accès',
    text: 'Coiffeurs, réception et gérant : chacun ne voit que ce qui le concerne.',
  },
  {
    title: 'Paiements et caisse',
    text: 'Enregistrez chaque paiement, en espèces, par Mobile Money ou par carte.',
  },
  {
    title: 'Suivi des recettes',
    text: 'Ce que rapportent la journée, la semaine et le mois.',
    badge: 'Offre Pro',
  },
  {
    title: 'Sur tous vos écrans',
    text: 'Téléphone, tablette ou ordinateur, sans rien installer.',
  },
]
</script>

<template>
  <section id="fonctionnalites" class="border-b border-border px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
      <LandingReveal>
        <LandingSectionHeader
          title="Et le reste du quotidien du salon."
          description="Ce dont vous avez besoin chaque jour, sans les options que vous n’utiliserez jamais."
        />
      </LandingReveal>
      <dl class="grid gap-x-10 sm:grid-cols-2">
        <LandingReveal
          v-for="(feature, index) in features"
          :key="feature.title"
          :delay="(index % 2) * 0.08 + Math.floor(index / 2) * 0.08"
          class="group relative border-t border-border py-6"
        >
          <span
            class="absolute -top-px left-0 h-px w-0 bg-primary-600 transition-all duration-500 group-hover:w-full"
            aria-hidden="true"
          />
          <dt class="flex flex-wrap items-center gap-2 text-base font-semibold text-foreground">
            {{ feature.title }}
            <span
              v-if="feature.badge"
              class="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-800"
            >
              {{ feature.badge }}
            </span>
          </dt>
          <dd class="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{{ feature.text }}</dd>
        </LandingReveal>
      </dl>
    </div>
  </section>
</template>
