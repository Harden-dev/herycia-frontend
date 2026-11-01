<script setup lang="ts">
/** Ce que fait réellement l'application, en mots simples. */
const features = [
  { title: 'Agenda', text: 'Les rendez-vous de chaque coiffeur, jour par jour.' },
  { title: 'Réservation en ligne', text: 'Vos clients réservent depuis votre lien ou votre QR code.' },
  { title: 'File d’attente', text: 'En arrivant au salon, chaque client voit son tour.' },
  { title: 'Rappels SMS', text: 'Vos clients sont prévenus avant leur passage.' },
]
</script>

<template>
  <aside class="auth-brand hidden flex-col justify-between p-12 lg:flex lg:w-[42%] xl:p-16">
    <div class="my-auto max-w-md">
      <h2 class="text-3xl font-semibold leading-tight text-white xl:text-4xl">
        Le carnet de rendez-vous de votre salon.
      </h2>
      <dl class="mt-10 divide-y divide-white/10 border-y border-white/10">
        <div v-for="feature in features" :key="feature.title" class="py-4">
          <dt class="text-sm font-medium text-white">{{ feature.title }}</dt>
          <dd class="mt-1 text-sm text-white/60">{{ feature.text }}</dd>
        </div>
      </dl>
    </div>

    <p class="text-xs text-white/50">Conçu pour les salons de coiffure en Côte d’Ivoire.</p>
  </aside>
</template>
