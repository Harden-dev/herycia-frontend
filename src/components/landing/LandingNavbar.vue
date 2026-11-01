<script setup lang="ts">
import HeryciaWordmark from '@/components/brand/HeryciaWordmark.vue'
import LandingButton from '@/components/landing/LandingButton.vue'

const links = [
  { href: '#reservation', label: 'Réservation' },
  { href: '#au-salon', label: 'Au salon' },
  { href: '#tarifs', label: 'Tarifs' },
]
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border bg-background px-4 md:px-10">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 py-3">
      <RouterLink to="/" class="rounded-lg" aria-label="Herycia, accueil">
        <HeryciaWordmark />
      </RouterLink>

      <nav class="hidden items-center gap-7 md:flex" aria-label="Sections">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-sm text-muted-foreground hover:text-foreground"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="flex shrink-0 items-center gap-1 sm:gap-2">
        <LandingButton variant="ghost">
          <RouterLink to="/login">Se connecter</RouterLink>
        </LandingButton>
        <LandingButton variant="primary" class="h-9 px-3 text-sm sm:px-4">
          <RouterLink to="/register">Essayer 7 jours</RouterLink>
        </LandingButton>
      </div>
    </div>
  </header>
</template>
