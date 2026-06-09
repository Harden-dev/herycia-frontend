<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IconSparkles } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { usePaystackCheckout } from '@/composables/usePaystackCheckout'
import { formatCFA } from '@/lib/utils'
import { useSubscriptionStore } from '@/stores/subscription'

const router = useRouter()
const store = useSubscriptionStore()
const { paying, checkout } = usePaystackCheckout()

const cta = computed(() => store.subscriptionCta)

const label = computed(() => {
  const plan = store.subscription?.plan
  if (!plan) return ''
  if (store.isTrialActive) {
    const days = store.trialDaysRemaining
    return `Essai ${plan.name} — ${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`
  }
  return `Renouvelez ${plan.name} — ${formatCFA(plan.price_fcfa)}/mois`
})

async function onCtaClick() {
  const current = cta.value
  if (current.type === 'pay' && store.canCheckoutPlan(current.planCode)) {
    await checkout(current.planCode)
    return
  }
  if (current.type === 'upgrade') {
    await router.push('/settings')
  }
}
</script>

<template>
  <div
    v-if="store.showTrialBanner || store.showPaymentCta"
    class="flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-start gap-3">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600/10">
        <IconSparkles :size="18" class="text-primary-700" />
      </div>
      <div>
        <p class="text-sm font-medium text-primary-900">{{ label }}</p>
        <p class="text-xs text-primary-700/80">
          Paiement sécurisé via Paystack — Mobile Money, Wave, carte.
        </p>
      </div>
    </div>
    <Button
      class="shrink-0 bg-primary-600 text-white hover:bg-primary-800"
      :disabled="paying || cta.type === 'none'"
      @click="onCtaClick"
    >
      {{
        paying
          ? 'Redirection…'
          : cta.type === 'upgrade'
            ? cta.label
            : cta.type === 'pay'
              ? cta.label
              : 'Voir les options'
      }}
    </Button>
  </div>
</template>
