<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue'
import ScrollReveal from '@/components/landing/ScrollReveal.vue'
import { LANDING_ICON_STROKE } from '@/lib/landing'

const benefits = [
  'Réservations 24h/24',
  'Réduction des appels et messages',
  'Gestion simple des rendez-vous',
  'Accessible depuis smartphone et ordinateur',
]
</script>

<template>
  <section class="border-y border-primary-800 bg-primary-900">
    <div class="mx-auto max-w-6xl px-4 py-10 md:px-10 md:py-12">
      <ScrollReveal>
        <h2 class="text-center text-lg font-medium text-white md:text-xl">
          Pourquoi les salons choisissent Herycia ?
        </h2>
      </ScrollReveal>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <ScrollReveal
          v-for="(benefit, index) in benefits"
          :key="benefit"
          :delay="index * 70"
          direction="up"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-800 shadow-[0_4px_12px_rgb(0_0_0_/_0.15)]"
            >
              <IconCheck
                :size="16"
                :stroke-width="LANDING_ICON_STROKE"
                class="text-primary-100"
              />
            </div>
            <p class="text-[13px] leading-snug text-primary-100/90 md:text-sm">{{ benefit }}</p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>
