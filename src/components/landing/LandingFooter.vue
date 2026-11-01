<script setup lang="ts">
import HeryciaWordmark from '@/components/brand/HeryciaWordmark.vue'

const links = [
  { href: '#reservation', label: 'Réservation' },
  { href: '#au-salon', label: 'Au salon' },
  { href: '#tarifs', label: 'Tarifs' },
]
</script>

<template>
  <footer class="landing-dark px-4 py-12 md:px-10">
    <div class="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
      <div class="max-w-xs">
        <HeryciaWordmark tone="dark" />
        <p class="mt-3 text-sm text-white/60">
          Conçu pour les salons de coiffure en Côte d’Ivoire.
        </p>
      </div>
      <nav class="flex flex-wrap gap-x-8 gap-y-3 text-sm" aria-label="Pied de page">
        <a v-for="link in links" :key="link.href" :href="link.href" class="text-white/70 hover:text-white">
          {{ link.label }}
        </a>
        <RouterLink to="/login" class="text-white/70 hover:text-white">Se connecter</RouterLink>
        <RouterLink to="/register" class="text-white/70 hover:text-white">Créer un compte</RouterLink>
      </nav>
    </div>
    <p class="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/50">
      © {{ new Date().getFullYear() }} Herycia
    </p>
  </footer>
</template>
