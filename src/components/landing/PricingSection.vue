<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IconCheck } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import { FALLBACK_PUBLIC_PLANS } from '@/lib/plans-fallback'
import { SELECTED_PLAN_KEY } from '@/lib/subscription'
import { fetchPublicPlans } from '@/services/plans.service'
import type { PublicPlan, SalonPlanCode } from '@/types/plan'

/** Les offres s'affichent tout de suite ; l'API les remplace dès qu'elle répond. */
const plans = ref<PublicPlan[]>(FALLBACK_PUBLIC_PLANS)

onMounted(async () => {
  try {
    const response = await fetchPublicPlans()
    if (response.success && response.data.length > 0) plans.value = response.data
  } catch {
    // On garde les offres de secours : la section ne doit jamais être vide.
  }
})

function onSelectPlan(code: SalonPlanCode) {
  try {
    localStorage.setItem(SELECTED_PLAN_KEY, code)
  } catch {
    // Stockage indisponible : l'offre reste transmise par l'URL.
  }
}

function isFeatured(plan: PublicPlan) {
  return plan.code === 'basic'
}

function includedFeatures(plan: PublicPlan) {
  return plan.features.filter((f) => f.included)
}

function price(plan: PublicPlan) {
  return plan.price_label.replace(/\s*\/mois$/, '')
}
</script>

<template>
  <section id="tarifs" class="px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <LandingSectionHeader
        title="Deux offres, sans engagement."
        description="7 jours d’essai gratuit sur chaque offre, sans carte bancaire. Vous choisissez ensuite."
      />

      <div class="grid max-w-4xl gap-6 md:grid-cols-2" data-testid="pricing-plans">
        <article
          v-for="plan in plans"
          :key="plan.id"
          class="flex flex-col rounded-xl border bg-card p-6 md:p-8"
          :class="isFeatured(plan) ? 'border-primary-600 ring-1 ring-primary-600' : 'border-border'"
        >
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-foreground">{{ plan.name }}</h3>
            <span
              v-if="isFeatured(plan)"
              class="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-800"
            >
              Pour démarrer
            </span>
          </div>
          <p v-if="plan.tagline" class="mt-1 text-sm text-muted-foreground">{{ plan.tagline }}</p>

          <p class="mt-6 font-display text-4xl font-semibold text-foreground">
            {{ price(plan) }}
            <span class="font-sans text-sm font-normal text-muted-foreground">/ mois</span>
          </p>

          <ul class="mb-8 mt-6 flex flex-1 flex-col gap-3 border-t border-border pt-6">
            <li
              v-for="feature in includedFeatures(plan)"
              :key="feature.key"
              class="flex items-start gap-2.5 text-[15px] text-foreground"
            >
              <IconCheck :size="18" class="mt-0.5 shrink-0 text-primary-600" />
              {{ feature.label }}
            </li>
          </ul>

          <LandingButton :variant="isFeatured(plan) ? 'primary' : 'outline'" block>
            <RouterLink :to="`/register?plan=${plan.code}`" @click="onSelectPlan(plan.code)">
              Commencer avec {{ plan.name }}
            </RouterLink>
          </LandingButton>
        </article>
      </div>
    </div>
  </section>
</template>
