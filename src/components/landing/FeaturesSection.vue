<script setup lang="ts">
import type { Component } from 'vue'
import {
  IconClipboardList,
  IconCalendar,
  IconCash,
  IconChartBar,
  IconLink,
  IconUsers,
} from '@tabler/icons-vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import ScrollReveal from '@/components/landing/ScrollReveal.vue'
import { LANDING_ICON_STROKE } from '@/lib/landing'

const features: {
  icon: Component
  title: string
  description: string
  iconBg: string
}[] = [
  {
    icon: IconClipboardList,
    title: 'Formulaire public de RDV',
    description:
      'Nom, téléphone, date, heure, coiffeur et service — sans application à télécharger',
    iconBg: 'bg-primary-50 text-primary-600',
  },
  {
    icon: IconCalendar,
    title: 'Agenda intelligent',
    description: 'Visualisez tous vos rendez-vous par jour, semaine et coiffeur',
    iconBg: 'bg-accent-50 text-accent-600',
  },
  {
    icon: IconUsers,
    title: "Gestion d'équipe",
    description: 'Coiffeurs, réceptionnistes, managers — rôles et accès par membre',
    iconBg: 'bg-warning-50 text-warning-600',
  },
  {
    icon: IconCash,
    title: 'Paiements Mobile Money',
    description: 'Orange Money, Wave, MTN — recettes suivies automatiquement',
    iconBg: 'bg-primary-50 text-primary-600',
  },
  {
    icon: IconLink,
    title: 'Suivi RDV en temps réel',
    description:
      'Après chaque réservation, le client suit son RDV via un lien dédié — sans application',
    iconBg: 'bg-accent-50 text-accent-600',
  },
  {
    icon: IconChartBar,
    title: 'Suivi des recettes',
    description: "Recettes du jour, de la semaine, du mois — en un coup d'œil",
    iconBg: 'bg-primary-50 text-primary-600',
  },
]
</script>

<template>
  <section id="fonctionnalites" class="bg-gray-50 px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <ScrollReveal>
        <LandingSectionHeader
          label="Ce que vous obtenez"
          title="Tout ce dont votre salon a besoin"
          description="Des outils pensés pour le rythme des salons ivoiriens — simples, rapides, efficaces."
          align="center"
        />
      </ScrollReveal>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ScrollReveal
          v-for="(feature, index) in features"
          :key="feature.title"
          :delay="index * 80"
          direction="up"
        >
          <div class="landing-card group h-full p-6">
            <div
              class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 shadow-[0_4px_12px_rgb(0_0_0_/_0.15)]"
              :class="feature.iconBg"
            >
              <component
                :is="feature.icon"
                :size="24"
                :stroke-width="LANDING_ICON_STROKE"
                class="text-primary-800"
              />
            </div>
            <p class="mb-2 text-base font-medium text-foreground">
              {{ feature.title }}
            </p>
            <p class="text-[13px] leading-relaxed text-muted-foreground">
              {{ feature.description }}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>
