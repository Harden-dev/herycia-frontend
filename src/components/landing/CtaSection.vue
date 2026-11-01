<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import LandingReveal from '@/components/landing/LandingReveal.vue'
</script>

<template>
  <section class="landing-dark landing-grain border-b border-white/10 px-4 py-24 md:px-10 md:py-32">
    <LandingReveal class="relative mx-auto max-w-6xl">
      <h2 class="max-w-4xl text-[36px] font-semibold uppercase leading-[1.04] tracking-tight md:text-[68px]">
        Essayez Herycia dans votre salon,
        <span class="landing-serif text-[1.12em] text-primary-300">pendant 7 jours.</span>
      </h2>
      <p class="mt-6 max-w-xl text-[17px] text-white/60">
        Sans carte bancaire. Si ça ne vous convient pas, vous n’avez rien à faire.
      </p>
      <div class="mt-10 flex flex-wrap items-center gap-4">
        <LandingButton variant="inverse" class="group h-14 rounded-full pl-7 pr-2 text-base">
          <RouterLink to="/register" class="inline-flex items-center gap-4">
            Créer mon compte
            <span
              class="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-white transition-transform duration-300 group-hover:-rotate-45"
            >
              <IconArrowRight :size="18" class="text-white" />
            </span>
          </RouterLink>
        </LandingButton>
        <RouterLink
          to="/login"
          class="text-sm font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
        >
          J’ai déjà un compte
        </RouterLink>
      </div>
    </LandingReveal>
  </section>
</template>
