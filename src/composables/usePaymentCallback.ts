import { useRoute, useRouter } from 'vue-router'
import { toast } from '@/lib/toast'
import { useSubscriptionStore } from '@/stores/subscription'

export function usePaymentCallback() {
  const route = useRoute()
  const router = useRouter()
  const subscriptionStore = useSubscriptionStore()

  async function handlePaymentCallback() {
    const status = route.query.payment as string | undefined
    if (!status) return false

    if (status === 'success') {
      toast.success('Abonnement activé avec succès !')
      await subscriptionStore.load()
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
