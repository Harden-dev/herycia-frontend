<script setup lang="ts">
import LandingButton from '@/components/landing/LandingButton.vue'
import LandingReveal from '@/components/landing/LandingReveal.vue'
</script>

<template>
  <section class="border-t border-border px-4 py-16 md:px-10 md:py-20">
    <LandingReveal
      class="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between"
    >
      <div class="max-w-xl">
        <h2 class="text-[28px] font-semibold leading-tight text-foreground md:text-[36px]">
          Essayez Herycia dans votre salon pendant 7 jours.
        </h2>
        <p class="mt-3 text-[16px] text-muted-foreground">
          Sans carte bancaire. Si ça ne vous convient pas, vous n’avez rien à faire.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <LandingButton variant="primary">
          <RouterLink to="/register">Créer mon compte</RouterLink>
        </LandingButton>
        <LandingButton variant="outline">
          <RouterLink to="/login">Se connecter</RouterLink>
        </LandingButton>
      </div>
    </LandingReveal>
  </section>
</template>
