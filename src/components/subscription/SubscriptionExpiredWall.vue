<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useSubscriptionStore } from '@/stores/subscription'

const router = useRouter()
const store = useSubscriptionStore()

function goToPayment() {
  void router.push({ name: 'settings', query: { payment: 'required' } })
}
</script>

<template>
  <div
    v-if="store.blocked"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-6 backdrop-blur-sm"
  >
    <div class="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
      <p class="text-lg font-semibold text-foreground">Abonnement expiré</p>
      <p class="mt-2 text-sm text-muted-foreground">
        Votre période d'essai ou votre abonnement est terminé. Payez votre plan pour continuer à
        utiliser Herycia.
      </p>
      <Button class="mt-6 bg-primary-600 text-white hover:bg-primary-800" @click="goToPayment">
        Payer mon abonnement
      </Button>
    </div>
  </div>
</template>
