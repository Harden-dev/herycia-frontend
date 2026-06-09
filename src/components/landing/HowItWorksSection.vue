<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import ScrollReveal from '@/components/landing/ScrollReveal.vue'
import { LANDING_ICON_STROKE } from '@/lib/landing'

const steps = [
  {
    title: 'Créez votre compte — essai 7 jours',
    description: 'Nom du salon, téléphone, ville — inscription en 60 secondes',
  },
  {
    title: 'Configurez vos services et coiffeurs',
    description: 'Ajoutez vos prestations avec prix et durée, invitez votre équipe',
  },
  {
    title: 'Partagez votre lien de réservation',
    description:
      'Ex. herycia.ci/booking/votre-slug — Instagram, Facebook, TikTok ou vitrine du salon',
  },
  {
    title: 'Les réservations arrivent automatiquement',
    description: "Vos clients réservent, vous gérez — plus d'oublis, plus de chaos",
  },
]
</script>

<template>
  <section class="bg-gray-50 px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <ScrollReveal>
        <LandingSectionHeader
          label="Comment ça marche"
          title="Opérationnel en 5 minutes"
          description="Pas de formation compliquée. Vous êtes prêt avant la fin de votre pause café."
          align="center"
        />
      </ScrollReveal>

      <div class="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div class="relative flex flex-col gap-0">
          <div class="absolute bottom-4 left-5 top-4 w-px bg-primary-200" aria-hidden="true" />
          <ScrollReveal
            v-for="(step, i) in steps"
            :key="step.title"
            :delay="i * 90"
            direction="left"
          >
            <div class="relative flex items-start gap-5 pb-6 last:pb-0 mt-2">
              <div
                class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary-200 bg-card text-sm font-medium text-primary-800 shadow-[0_2px_8px_rgb(15_110_86_/_0.1)]"
              >
                {{ i + 1 }}
              </div>
              <div class="landing-card flex-1 p-4 !shadow-[0_2px_12px_rgb(15_110_86_/_0.06)]">
                <p class="text-sm font-medium text-foreground">{{ step.title }}</p>
                <p class="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal direction="right" :delay="120">
          <div class="landing-card-elevated p-6 md:p-7">
            <div class="mb-5 flex items-center gap-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 shadow-[0_4px_12px_rgb(15_110_86_/_0.25)]"
              >
                <span class="text-sm font-medium text-white">S</span>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">Formulaire public</p>
                <p class="text-xs text-muted-foreground">Réservation en ligne</p>
              </div>
            </div>

            <div class="flex flex-col gap-2.5 text-[13px]">
              <div class="landing-card-flat rounded-lg px-3 py-2 text-muted-foreground">
                Nom · Awa Diallo
              </div>
              <div class="landing-card-flat rounded-lg px-3 py-2 text-muted-foreground">
                Tél · 07 08 44 55 66
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="landing-card-flat rounded-lg px-3 py-2 text-muted-foreground">
                  Date · 25/05
                </div>
                <div class="landing-card-flat rounded-lg px-3 py-2 text-muted-foreground">
                  Heure · 10h00
                </div>
              </div>
              <div class="landing-card-flat rounded-lg px-3 py-2 text-muted-foreground">
                Coiffeur · Koffi · Service · Coupe homme
              </div>
              <div
                class="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5 text-primary-800"
              >
                ✓ RDV confirmé · Suivi en temps réel activé
              </div>
            </div>

            <LandingButton variant="primary" block class="mt-6">
              <RouterLink
                to="/register"
                class="inline-flex w-full items-center justify-center gap-2 text-white"
              >
                <IconArrowRight :size="16" :stroke-width="LANDING_ICON_STROKE" class="text-white" />
                Activer mon formulaire public
              </RouterLink>
            </LandingButton>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>
