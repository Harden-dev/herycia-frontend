<script setup lang="ts">
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'

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
      <LandingSectionHeader
        title="Et le reste du quotidien du salon."
        description="Ce dont vous avez besoin chaque jour, sans les options que vous n’utiliserez jamais."
      />
      <dl class="grid gap-x-10 sm:grid-cols-2">
        <div v-for="feature in features" :key="feature.title" class="border-t border-border py-6">
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
        </div>
      </dl>
    </div>
  </section>
</template>
