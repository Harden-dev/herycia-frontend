<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import ScrollReveal from '@/components/landing/ScrollReveal.vue'
import { LANDING_ICON_STROKE } from '@/lib/landing'
</script>

<template>
  <section class="relative overflow-hidden px-4 py-20 md:px-10 md:py-24">
    <div
      class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-800/30"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-600/20"
      aria-hidden="true"
    />

    <ScrollReveal direction="scale" :delay="80">
      <div
        class="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-primary-900 px-8 py-14 text-center md:px-16 md:py-16"
        style="box-shadow: 0 16px 48px rgb(15 110 86 / 0.25)"
      >
        <h2 class="text-[28px] font-medium leading-tight text-white md:text-[36px]">
          Prêt à moderniser votre salon ?
        </h2>
        <p class="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-primary-100/80">
          Rejoignez les premiers salons sur Herycia — 7 jours d'essai, sans carte bancaire.
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LandingButton variant="inverse">
            <RouterLink to="/register" class="inline-flex items-center gap-2 text-primary-800">
              <IconArrowRight :size="18" :stroke-width="LANDING_ICON_STROKE" />
              Créer mon compte — essai 7 jours
            </RouterLink>
          </LandingButton>
          <LandingButton
            variant="outline"
            class="h-12 border-primary-400/40 bg-transparent text-white hover:border-primary-300 hover:bg-primary-800/50 hover:text-white"
          >
            <RouterLink to="/login" class="inline-flex items-center text-inherit">
              Se connecter
            </RouterLink>
          </LandingButton>
        </div>

        <p class="mt-6 text-xs text-primary-100/60">
          Configuration en 5 minutes · Formulaire public inclus
        </p>
      </div>
    </ScrollReveal>
  </section>
</template>
