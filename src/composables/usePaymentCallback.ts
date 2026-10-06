import { useRoute, useRouter } from 'vue-router'
import { toast } from '@/lib/toast'
import { useSubscriptionStore } from '@/stores/subscription'

/** Vérifications de l'abonnement après un paiement encore en attente de confirmation Paystack. */
const PENDING_POLL_ATTEMPTS = 6
const PENDING_POLL_INTERVAL_MS = 5000

export function usePaymentCallback() {
  const route = useRoute()
  const router = useRouter()
  const subscriptionStore = useSubscriptionStore()

  function snapshot(): string {
    const sub = subscriptionStore.subscription
    return `${sub?.status ?? ''}|${sub?.ends_at ?? ''}|${sub?.plan?.code ?? ''}`
  }

  /**
   * Paiement pas encore confirmé (vérification Paystack en cours) : le backend l'activera
   * via le webhook ou la réconciliation. On recharge l'abonnement quelques fois pour
   * refléter l'activation dès qu'elle a lieu.
   */
  async function waitForActivation() {
    const before = snapshot()

    for (let attempt = 0; attempt < PENDING_POLL_ATTEMPTS; attempt++) {
      await new Promise((resolve) => window.setTimeout(resolve, PENDING_POLL_INTERVAL_MS))
      await subscriptionStore.load()
      if (snapshot() !== before) {
        toast.success('Paiement confirmé : abonnement activé !')
        return
      }
    }

    toast.success(
      'Paiement en cours de vérification. Votre abonnement sera activé automatiquement dès sa confirmation.',
    )
  }

  async function handlePaymentCallback() {
    const status = route.query.payment as string | undefined
    if (!status) return false

    if (status === 'success') {
      toast.success('Abonnement activé avec succès !')
      await subscriptionStore.load()
    } else if (status === 'pending') {
      toast.success('Paiement reçu, confirmation en cours…')
      void waitForActivation()
    } else if (status === 'failed') {
      toast.error('Le paiement a échoué. Veuillez réessayer.')
    } else if (status === 'required') {
      toast.error('Votre abonnement nécessite un paiement pour continuer.')
    }

    await router.replace({ query: {} })
    return true
  }

  return { handlePaymentCallback }
}
