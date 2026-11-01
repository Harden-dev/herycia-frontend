<script setup lang="ts">
import { IconClockExclamation, IconQrcode, IconUserPlus } from '@tabler/icons-vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'

const steps = [
  {
    title: 'Le client scanne le QR d’arrivée',
    text: 'Affiché à l’accueil. Il est reconnu par son rendez-vous ou son numéro de téléphone.',
  },
  {
    title: 'Il voit sa position',
    text: 'Le nombre de personnes avant lui et l’heure de passage estimée, mises à jour en continu.',
  },
  {
    title: 'Il est prévenu par SMS',
    text: 'Quand son tour approche, il peut patienter dehors sans perdre sa place.',
  },
]

const cases = [
  {
    icon: IconClockExclamation,
    title: 'En retard ?',
    text: 'Au-delà du retard toléré, le client choisit : passer après le dernier de la liste, ou revenir un autre jour à la même heure.',
  },
  {
    icon: IconUserPlus,
    title: 'Sans rendez-vous ?',
    text: 'Il choisit sa prestation et rejoint la file du coiffeur de son choix, ou du premier disponible.',
  },
]
</script>

<template>
  <section id="au-salon" class="landing-dark px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <LandingSectionHeader
        tone="dark"
        title="Au salon, chacun sait quand vient son tour."
        description="Fini la salle d’attente où l’on demande toutes les dix minutes « c’est bientôt moi ? »."
      />

      <div class="grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
        <div>
          <ol class="grid gap-8 sm:grid-cols-3 sm:gap-6">
            <li v-for="(step, index) in steps" :key="step.title">
              <p class="font-display text-sm font-semibold text-primary-400">0{{ index + 1 }}</p>
              <h3 class="mt-2 text-base font-semibold text-white">{{ step.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-white/65">{{ step.text }}</p>
            </li>
          </ol>

          <div class="mt-12 grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-2">
            <div v-for="item in cases" :key="item.title" class="flex gap-3">
              <component :is="item.icon" :size="22" class="mt-0.5 shrink-0 text-primary-400" />
              <div>
                <h3 class="text-base font-semibold text-white">{{ item.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-white/65">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <figure class="mx-auto w-full max-w-[340px]">
          <div class="rounded-2xl bg-white p-6 text-foreground">
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <IconQrcode :size="16" aria-hidden="true" />
              Salon Élégance · avec Koffi
            </div>
            <div class="mt-6 text-center">
              <p class="font-display text-6xl font-semibold text-primary-700">2</p>
              <p class="mt-1 text-sm text-muted-foreground">position</p>
            </div>
            <dl class="mt-6 divide-y divide-border border-y border-border text-sm">
              <div class="flex justify-between py-3">
                <dt class="text-muted-foreground">Avant vous</dt>
                <dd class="font-medium">1 personne</dd>
              </div>
              <div class="flex justify-between py-3">
                <dt class="text-muted-foreground">Passage estimé</dt>
                <dd class="font-medium">vers 10:45</dd>
              </div>
              <div class="flex justify-between py-3">
                <dt class="text-muted-foreground">Prestation</dt>
                <dd class="font-medium">Coupe homme</dd>
              </div>
            </dl>
            <p class="mt-4 text-center text-xs text-muted-foreground">
              Page mise à jour automatiquement
            </p>
          </div>
          <figcaption class="mt-3 text-center text-xs text-white/50">
            Exemple : l’écran du client après le scan.
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
