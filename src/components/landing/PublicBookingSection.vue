<script setup lang="ts">
import { IconArrowRight, IconLink } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import ScrollReveal from '@/components/landing/ScrollReveal.vue'
import { getBookingUrl } from '@/lib/booking'
import { LANDING_ICON_STROKE } from '@/lib/landing'

const exampleLink = getBookingUrl('michel-hair')

const fields = [
  'Nom du client',
  'Numéro de téléphone',
  'Date du rendez-vous',
  'Heure',
  'Coiffeur',
  'Service',
]
</script>

<template>
  <section id="reservation" class="px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <ScrollReveal>
        <LandingSectionHeader
          label="Réservation en ligne"
          title="Un lien unique par salon"
          description="À l'inscription, Herycia génère un lien public que vous partagez à vos clients. Chaque clic ouvre le formulaire avec vos services et coiffeurs. Après la réservation, le client reçoit un lien de suivi dédié."
          align="center"
        />
      </ScrollReveal>

      <div class="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <ScrollReveal direction="left">
          <div class="landing-card-elevated p-6 md:p-7">
            <p class="mb-4 text-sm font-medium text-foreground">Aperçu du formulaire client</p>
            <div class="flex flex-col gap-3">
              <div
                v-for="field in fields"
                :key="field"
                class="rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-[13px] text-muted-foreground"
              >
                {{ field }}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" :delay="100">
          <div class="landing-card-elevated p-6 md:p-7">
            <p class="mb-2 text-sm font-medium text-foreground">Exemple de lien généré</p>
            <div
              class="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5 font-mono text-[12px] text-primary-800"
            >
              <IconLink :size="16" :stroke-width="LANDING_ICON_STROKE" class="shrink-0" />
              <span class="break-all">{{ exampleLink }}</span>
            </div>
            <p class="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              Vos clients réservent via ce lien. Après confirmation, ils reçoivent un lien de suivi
              du type herycia.ci/rdv/BSFX8Dks9N — pas depuis la page d'accueil Herycia.
            </p>
            <LandingButton variant="primary" block class="mt-6">
              <RouterLink
                to="/register"
                class="inline-flex w-full items-center justify-center gap-2 text-white"
              >
                <IconArrowRight :size="16" :stroke-width="LANDING_ICON_STROKE" class="text-white" />
                Créer mon salon et obtenir mon lien
              </RouterLink>
            </LandingButton>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>
