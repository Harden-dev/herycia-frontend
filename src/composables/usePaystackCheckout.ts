import { ref } from 'vue'
import { getApiErrorMessage } from '@/lib/api'
import { initializeSubscriptionPayment } from '@/services/subscription.service'
import type { SalonPlanCode } from '@/types/plan'

export function usePaystackCheckout() {
  const paying = ref(false)
  const error = ref<string | null>(null)

  async function checkout(planCode: SalonPlanCode | string) {
    paying.value = true
    error.value = null
    try {
      const response = await initializeSubscriptionPayment(planCode)
      if (!response.success) throw new Error(response.message)
      window.location.href = response.data.authorization_url
    } catch (e) {
      error.value = getApiErrorMessage(e)
      paying.value = false
      throw e
    }
  }

  function resetError() {
    error.value = null
  }

  return { paying, error, checkout, resetError }
}
