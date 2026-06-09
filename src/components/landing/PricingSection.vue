<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IconCheck } from '@tabler/icons-vue'
import LandingButton from '@/components/landing/LandingButton.vue'
import LandingSectionHeader from '@/components/landing/LandingSectionHeader.vue'
import ScrollReveal from '@/components/landing/ScrollReveal.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api'
import { LANDING_ICON_STROKE } from '@/lib/landing'
import { SELECTED_PLAN_KEY } from '@/lib/subscription'
import { fetchPublicPlans } from '@/services/plans.service'
import type { PublicPlan, SalonPlanCode } from '@/types/plan'

const plans = ref<PublicPlan[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetchPublicPlans()
    if (!response.success) throw new Error(response.message)
    plans.value = response.data
  } catch (e) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
})

function onSelectPlan(code: SalonPlanCode) {
  localStorage.setItem(SELECTED_PLAN_KEY, code)
}

function isFeatured(plan: PublicPlan) {
  return plan.code === 'basic'
}

function includedFeatures(plan: PublicPlan) {
  return plan.features.filter((f) => f.included)
}
</script>

<template>
  <section id="tarifs" class="px-4 py-16 md:px-10 md:py-24">
    <div class="mx-auto max-w-6xl">
      <ScrollReveal>
        <LandingSectionHeader
          label="Tarifs"
          title="Tarifs abordables et adaptés à tous les budgets"
          description="7 jours d'essai inclus — Basic pour démarrer, Premium pour scaler."
          align="center"
        />
      </ScrollReveal>

      <p v-if="error" class="mb-6 text-center text-sm text-danger-600">{{ error }}</p>

      <div class="mx-auto grid max-w-4xl items-center gap-5 md:grid-cols-2">
        <template v-if="loading">
          <Skeleton v-for="i in 2" :key="i" class="h-[420px] rounded-xl" />
        </template>

        <ScrollReveal
          v-for="(plan, index) in plans"
          v-else
          :key="plan.id"
          :delay="index * 100"
          direction="up"
        >
          <div
            class="relative flex flex-col overflow-hidden bg-card transition-transform duration-300"
            :class="isFeatured(plan) ? 'landing-card-featured md:-mt-2' : 'landing-card'"
          >
            <div
              v-if="isFeatured(plan)"
              class="bg-primary-600 px-6 py-2.5 text-center text-xs font-medium text-white"
            >
              Le plus choisi par les salons
            </div>

            <div class="flex flex-1 flex-col p-6 md:p-7">
              <div class="mb-2 flex items-center justify-between">
                <p class="text-sm font-medium text-foreground">{{ plan.name }}</p>
                <span
                  v-if="isFeatured(plan)"
                  class="rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-medium text-primary-800"
                >
                  Populaire
                </span>
              </div>

              <p class="text-3xl font-medium text-foreground md:text-4xl">
                {{ plan.price_label.replace(' /mois', '') }}
                <span class="text-sm font-normal text-muted-foreground">/mois</span>
              </p>
              <p class="mb-6 mt-1.5 text-[13px] text-muted-foreground">{{ plan.tagline }}</p>

              <ul class="mb-8 flex flex-1 flex-col gap-2.5">
                <li
                  v-for="feature in includedFeatures(plan)"
                  :key="feature.key"
                  class="flex items-center text-[13px] text-foreground"
                >
                  <IconCheck
                    :size="16"
                    :stroke-width="LANDING_ICON_STROKE"
                    class="mr-2 shrink-0 text-primary-600"
                  />
                  {{ feature.label }}
                </li>
              </ul>

              <LandingButton
                :variant="isFeatured(plan) ? 'primary' : 'outline'"
                block
                class="h-[52px] min-h-[52px] text-base"
              >
                <RouterLink
                  :to="`/register?plan=${plan.code}`"
                  class="inline-flex h-full w-full items-center justify-center"
                  :class="isFeatured(plan) ? 'text-white' : 'text-primary-700'"
                  @click="onSelectPlan(plan.code)"
                >
                  S'inscrire — {{ plan.name }}
                </RouterLink>
              </LandingButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>
