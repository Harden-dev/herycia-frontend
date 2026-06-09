<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePaystackCheckout } from '@/composables/usePaystackCheckout'
import { formatCFA } from '@/lib/utils'
import { useSubscriptionStore } from '@/stores/subscription'
import type { PublicPlan } from '@/types/plan'

const router = useRouter()
const store = useSubscriptionStore()
const { paying, checkout } = usePaystackCheckout()
const open = defineModel<boolean>('open', { default: false })

const upgradePlans = computed(() => store.upgradePlans)
const primaryUpgrade = computed(() => upgradePlans.value[0] ?? null)

watch(open, (isOpen) => {
  if (isOpen) void store.ensurePublicPlans()
})

async function onUpgrade(plan: PublicPlan) {
  if (!store.canCheckoutPlan(plan.code)) return
  open.value = false
  await checkout(plan.code)
}

function goToSettings() {
  open.value = false
  void router.push('/settings')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Passer à un plan supérieur</DialogTitle>
        <DialogDescription>
          Débloquez les analytiques, le suivi des recettes et plus de capacité pour votre équipe.
        </DialogDescription>
      </DialogHeader>

      <div v-if="upgradePlans.length" class="space-y-3">
        <div
          v-for="plan in upgradePlans"
          :key="plan.code"
          class="rounded-lg border border-primary-200 bg-primary-50/50 px-4 py-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-primary-900">{{ plan.name }}</p>
              <p class="text-xs text-muted-foreground">{{ plan.tagline }}</p>
              <p class="mt-1 text-lg font-semibold text-primary-800">
                {{ formatCFA(plan.price_fcfa) }}/mois
              </p>
            </div>
            <Button
              size="sm"
              class="shrink-0 bg-primary-600 text-white hover:bg-primary-800"
              :disabled="paying || !store.canCheckoutPlan(plan.code)"
              @click="onUpgrade(plan)"
            >
              {{ paying ? '…' : `Passer ${plan.name}` }}
            </Button>
          </div>
          <ul class="mt-2 space-y-1 text-xs text-muted-foreground">
            <li v-for="feature in plan.features.filter((f) => f.included).slice(0, 4)" :key="feature.key">
              • {{ feature.label }}
            </li>
          </ul>
        </div>
      </div>

      <p v-else class="text-sm text-muted-foreground">
        Consultez les options d'abonnement dans les paramètres.
      </p>

      <DialogFooter>
        <Button variant="outline" @click="open = false">Fermer</Button>
        <Button
          v-if="primaryUpgrade"
          class="bg-primary-600 text-white hover:bg-primary-800"
          :disabled="paying"
          @click="onUpgrade(primaryUpgrade)"
        >
          {{ paying ? 'Redirection…' : `Passer ${primaryUpgrade.name}` }}
        </Button>
        <Button v-else variant="outline" @click="goToSettings">Voir les plans</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
