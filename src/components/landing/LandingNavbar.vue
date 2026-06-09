<script setup lang="ts">
import HeryciaLogo from '@/components/brand/HeryciaLogo.vue'
import LandingButton from '@/components/landing/LandingButton.vue'
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-10">
      <RouterLink to="/" class="min-w-0 shrink transition-opacity duration-150 hover:opacity-90">
        <span class="sm:hidden"><HeryciaLogo size="lg" /></span>
        <span class="hidden sm:inline"><HeryciaLogo size="xl" /></span>
      </RouterLink>

      <nav class="hidden items-center gap-6 md:flex">
        <a
          href="#reservation"
          class="text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          Réservation
        </a>
        <a
          href="#fonctionnalites"
          class="text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          Fonctionnalités
        </a>
        <a
          href="#tarifs"
          class="text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          Tarifs
        </a>
      </nav>

      <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <LandingButton variant="ghost" class="h-9 min-h-9 px-3 text-[12px] sm:h-10 sm:min-h-10 sm:px-5 sm:text-[13px]">
          <RouterLink to="/login">Se connecter</RouterLink>
        </LandingButton>
        <LandingButton variant="primary" class="h-9 min-h-9 px-3 text-[12px] sm:h-10 sm:min-h-10 sm:px-5 sm:text-[13px]">
          <RouterLink to="/register" class="text-white">Essayer 7 jours</RouterLink>
        </LandingButton>
      </div>
    </div>
  </header>
</template>
