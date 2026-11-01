<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LandingButton from '@/components/landing/LandingButton.vue'

/** Exemple statique de la file d'un coiffeur, telle qu'elle apparaît dans l'application. */
const queue = [
  { time: '10:00', name: 'Aïcha K.', service: 'Tresse', status: 'in_progress', note: '' },
  { time: '10:45', name: 'Yao B.', service: 'Coupe homme', status: 'waiting', note: 'Arrivé, 1er' },
  { time: '11:10', name: 'Sans RDV', service: 'Barbe', status: 'waiting', note: 'Arrivé, 2e' },
  { time: '11:30', name: 'Mariam T.', service: 'Coloration', status: 'confirmed', note: 'Attendue' },
]
</script>

<template>
  <section class="border-b border-border px-4 py-14 md:px-10 md:py-20">
    <div class="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <div>
        <h1
          class="text-[38px] font-semibold leading-[1.1] tracking-tight text-foreground md:text-[52px]"
        >
          Les rendez-vous et la file d’attente de votre salon, au même endroit.
        </h1>
        <p class="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Vos clients réservent en ligne, signalent leur arrivée en scannant un QR code et voient
          leur tour. Vous suivez chaque coiffeur depuis votre téléphone.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <LandingButton variant="primary">
            <RouterLink to="/register">Essayer 7 jours gratuitement</RouterLink>
          </LandingButton>
          <LandingButton variant="outline">
            <a href="#tarifs">Voir les tarifs</a>
          </LandingButton>
        </div>
        <p class="mt-4 text-sm text-muted-foreground">Aucune carte bancaire demandée.</p>
      </div>

      <figure>
        <div class="rounded-xl border border-border bg-card">
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p class="text-sm font-semibold text-foreground">Koffi</p>
              <p class="text-xs text-muted-foreground">File du jour</p>
            </div>
            <span class="text-xs text-muted-foreground">3 clients au salon</span>
          </div>
          <ol class="divide-y divide-border">
            <li
              v-for="row in queue"
              :key="row.time"
              class="flex items-center gap-4 px-5 py-3.5"
            >
              <span class="w-11 shrink-0 font-mono text-sm text-muted-foreground">{{ row.time }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-foreground">{{ row.name }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ row.service }}</p>
              </div>
              <span v-if="row.note" class="hidden text-xs text-muted-foreground sm:inline">{{
                row.note
              }}</span>
              <StatusBadge :status="row.status" />
            </li>
          </ol>
        </div>
        <figcaption class="mt-3 text-xs text-muted-foreground">
          Exemple : la file d’un coiffeur, telle que l’accueil la voit.
        </figcaption>
      </figure>
    </div>
  </section>
</template>
