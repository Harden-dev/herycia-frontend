<script setup lang="ts">
import { IconLink } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import { getBookingUrl } from '@/lib/booking'

/** Domaine réellement servi (production comprise), sans le protocole. */
const exampleLink = getBookingUrl('votre-salon').replace(/^https?:\/\//, '')

const steps = [
  {
    title: 'Vous partagez votre lien',
    text: 'Sur WhatsApp, Instagram, TikTok, ou via le QR de réservation imprimé en vitrine.',
  },
  {
    title: 'Le client choisit',
    text: 'La prestation, le coiffeur, le jour et l’heure parmi les créneaux libres. Aucune application à installer.',
  },
  {
    title: 'Il suit son rendez-vous',
    text: 'Après la réservation, il reçoit un lien personnel pour retrouver l’heure et le coiffeur.',
  },
]

const choices = [
  { label: 'Prestation', value: 'Tresse · 2 h · 8 000 F' },
  { label: 'Coiffeur', value: 'Koffi' },
  { label: 'Jour et heure', value: 'Samedi · 10:00' },
  { label: 'Nom et téléphone', value: 'Aïcha K. · 07 08 11 22 33' },
]
</script>

<template>
  <section id="reservation" class="px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <LandingSectionHeader
          title="Vos clients réservent seuls, à toute heure."
          description="Chaque salon a son lien de réservation. Vos prestations, vos coiffeurs et vos horaires y sont à jour automatiquement."
        />
        <ol class="space-y-6">
          <li v-for="(step, index) in steps" :key="step.title" class="flex gap-4">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border font-display text-sm font-semibold text-foreground"
            >
              {{ index + 1 }}
            </span>
            <div>
              <h3 class="text-base font-semibold text-foreground">{{ step.title }}</h3>
              <p class="mt-1 text-[15px] leading-relaxed text-muted-foreground">{{ step.text }}</p>
            </div>
          </li>
        </ol>
      </div>

      <figure class="self-center">
        <div class="rounded-xl border border-border bg-card">
          <div class="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <IconLink :size="16" class="shrink-0 text-muted-foreground" aria-hidden="true" />
            <span class="truncate font-mono text-sm text-foreground">{{ exampleLink }}</span>
          </div>
          <dl class="divide-y divide-border">
            <div
              v-for="choice in choices"
              :key="choice.label"
              class="flex items-baseline justify-between gap-4 px-5 py-3.5"
            >
              <dt class="text-sm text-muted-foreground">{{ choice.label }}</dt>
              <dd class="text-right text-sm font-medium text-foreground">{{ choice.value }}</dd>
            </div>
          </dl>
          <div class="border-t border-border p-4">
            <p class="rounded-lg bg-success-50 px-3 py-2.5 text-sm text-success-800">
              Rendez-vous confirmé. Un lien de suivi est envoyé au client.
            </p>
          </div>
        </div>
        <figcaption class="mt-3 text-xs text-muted-foreground">
          Exemple : ce que remplit votre client.
        </figcaption>
        <LandingButton variant="outline" class="mt-6">
          <RouterLink to="/register">Créer mon salon et obtenir mon lien</RouterLink>
        </LandingButton>
      </figure>
    </div>
  </section>
</template>
