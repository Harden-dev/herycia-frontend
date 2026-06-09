<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { IconSparkles } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaystackCheckout } from '@/composables/usePaystackCheckout'
import { formatCFA, isoToDMY } from '@/lib/utils'
import { useSubscriptionStore } from '@/stores/subscription'
import type { PublicPlan } from '@/types/plan'

const store = useSubscriptionStore()
const { paying, error, checkout, resetError } = usePaystackCheckout()

const sub = computed(() => store.subscription)
const plan = computed(() => sub.value?.plan)

onMounted(async () => {
  await Promise.all([store.load(), store.ensurePublicPlans()])
})

async function onPay(planCode: string) {
  if (!store.canCheckoutPlan(planCode)) return
  resetError()
  try {
    await checkout(planCode)
  } catch {
    // error affiché via paying/error
  }
}

function upgradeLabel(target: PublicPlan) {
  return `Passer ${target.name}`
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card p-6">
    <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Abonnement</p>
    <h2 class="mt-1 text-lg font-semibold text-foreground">Mon plan Herycia</h2>

    <template v-if="store.loading && !sub">
      <Skeleton class="mt-4 h-24 w-full rounded-lg" />
    </template>

    <template v-else-if="sub && plan">
      <div
        v-if="store.isTrialActive"
        class="mt-4 flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-start gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600/10">
            <IconSparkles :size="18" class="text-primary-700" />
          </div>
          <div>
            <p class="text-sm font-medium text-primary-900">
              Essai {{ plan.name }} —
              <strong>{{ store.trialDaysRemaining }} jour(s) restant(s)</strong>
            </p>
            <p class="text-xs text-primary-700/80">
              Activez votre abonnement pour continuer après la période d'essai.
            </p>
          </div>
        </div>
        <Button
          class="shrink-0 bg-primary-600 text-white hover:bg-primary-800"
          :disabled="paying || !store.canCheckoutPlan(plan.code)"
          @click="onPay(plan.code)"
        >
          {{ paying ? 'Redirection…' : `Activer (${formatCFA(plan.price_fcfa)}/mois)` }}
        </Button>
      </div>

      <div
        v-else-if="store.blocked"
        class="mt-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3"
      >
        <p class="text-sm font-medium text-danger-900">Essai ou abonnement expiré</p>
        <p class="mt-1 text-xs text-danger-800">
          Payez votre plan {{ plan.name }} pour retrouver l'accès à Herycia.
        </p>
        <Button
          class="mt-3 bg-primary-600 text-white hover:bg-primary-800"
          :disabled="paying"
          @click="onPay(plan.code)"
        >
          {{ paying ? 'Redirection…' : 'Payer pour continuer' }}
        </Button>
      </div>

      <div v-else-if="store.isSubscriptionActive" class="mt-4 rounded-lg border border-border bg-secondary/30 px-4 py-3">
        <p class="text-sm font-medium text-foreground">
          Plan {{ plan.name }} actif
          <span v-if="sub.ends_at" class="text-muted-foreground">
            jusqu'au {{ isoToDMY(sub.ends_at) }}
          </span>
        </p>
        <p
          v-if="store.renewalDaysRemaining !== null && store.renewalDaysRemaining <= 7"
          class="mt-1 text-xs text-warning-800"
        >
          Renouvellement dans {{ store.renewalDaysRemaining }} jour(s).
        </p>
      </div>

      <div
        v-if="store.isSubscriptionActive && store.canCheckoutPlan(plan.code)"
        class="mt-4"
      >
        <Button
          variant="outline"
          :disabled="paying"
          @click="onPay(plan.code)"
        >
          {{ paying ? 'Redirection…' : `Renouveler ${plan.name}` }}
        </Button>
      </div>

      <div v-if="store.upgradePlans.length" class="mt-6 space-y-3">
        <h3 class="text-sm font-medium text-foreground">Passer à un plan supérieur</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="upgradePlan in store.upgradePlans"
            :key="upgradePlan.code"
            class="rounded-lg border border-primary-200 bg-primary-50/40 p-4"
          >
            <p class="font-medium text-primary-900">{{ upgradePlan.name }}</p>
            <p class="text-xs text-muted-foreground">{{ upgradePlan.tagline }}</p>
            <p class="mt-2 text-sm font-semibold text-primary-800">{{ upgradePlan.price_label }}</p>
            <Button
              class="mt-3 w-full bg-primary-600 text-white hover:bg-primary-800"
              :disabled="paying || !store.canCheckoutPlan(upgradePlan.code)"
              @click="onPay(upgradePlan.code)"
            >
              {{ paying ? 'Redirection…' : upgradeLabel(upgradePlan) }}
            </Button>
          </div>
        </div>
      </div>

      <div
        v-if="store.usage && store.usage.max_employees !== null"
        class="mt-4 text-xs text-muted-foreground"
      >
        Employés : {{ store.usage.active_employees }}/{{ store.usage.max_employees }}
        <span v-if="store.usage.employees_remaining !== null">
          ({{ store.usage.employees_remaining }} restant(s))
        </span>
      </div>
    </template>

    <p v-if="error" class="mt-4 rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-800">
      {{ error }}
    </p>
  </section>
</template>
