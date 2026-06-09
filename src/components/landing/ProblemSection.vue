<script setup lang="ts">
import { IconArrowRight, IconCheck, IconX } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import ScrollReveal from '@/components/landing/ScrollReveal.vue'
import { LANDING_ICON_STROKE } from '@/lib/landing'

const problems = [
  'Les clients appellent, vous oubliez — rendez-vous ratés, clients perdus',
  'Les rendez-vous se mélangent — impossible de savoir qui arrive et quand',
  'Aucun suivi des recettes — impossible de savoir si le mois a été bon',
  "Gérer 3 coiffeurs en même temps sans outil, c'est le chaos",
]

const solutions = [
  'Formulaire public + suivi RDV en temps réel pour vos clients',
  'Agenda partagé et suivi client en temps réel pour toute l\'équipe',
  'Tableau de bord recettes jour / semaine / mois',
  'Agenda multi-coiffeurs synchronisé en temps réel',
]
</script>

<template>
  <section class="px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <ScrollReveal>
        <LandingSectionHeader
          label="Le problème"
          title="Votre salon mérite mieux qu'un carnet et des appels"
          description="La plupart des salons en Côte d'Ivoire perdent du temps et de l'argent faute d'outils adaptés."
          align="center"
        />
      </ScrollReveal>

      <div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <ScrollReveal direction="left" :delay="80">
          <div
            class="landing-card-flat h-full border-danger-600/15 bg-danger-50/40 p-6 md:p-7 shadow-[0_16px_48px_rgb(15_110_86_/_0.25)]"
          >
            <p class="mb-5 text-sm font-medium text-danger-800">Sans Herycia</p>
            <div class="flex flex-col gap-3">
              <div
                v-for="(problem, i) in problems"
                :key="i"
                class="landing-card-flat flex items-start gap-3 p-4 !shadow-none"
              >
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger-50"
                >
                  <IconX :size="16" :stroke-width="LANDING_ICON_STROKE" class="text-danger-600" />
                </div>
                <p class="text-[13px] leading-relaxed text-muted-foreground">{{ problem }}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" :delay="160">
          <div
            class="landing-card-elevated h-full border-primary-600/15 bg-primary-50/30 p-6 md:p-7 shadow-[0_16px_48px_rgb(15_110_86_/_0.25)]"
          >
            <p class="mb-5 text-sm font-medium text-primary-800">Avec Herycia</p>
            <div class="flex flex-col gap-3">
              <div
                v-for="(solution, i) in solutions"
                :key="i"
                class="landing-card-flat flex items-start gap-3 border-primary-200/60 p-4 !shadow-none"
              >
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50"
                >
                  <IconCheck
                    :size="16"
                    :stroke-width="LANDING_ICON_STROKE"
                    class="text-primary-600"
                  />
                </div>
                <p class="text-[13px] leading-relaxed text-foreground">{{ solution }}</p>
              </div>
            </div>

            <LandingButton variant="primary" block class="mt-6">
              <RouterLink
                to="/register"
                class="inline-flex w-full items-center justify-center gap-2 text-white"
              >
                <IconArrowRight :size="16" :stroke-width="LANDING_ICON_STROKE" class="text-white" />
                Essayer 7 jours
              </RouterLink>
            </LandingButton>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>
