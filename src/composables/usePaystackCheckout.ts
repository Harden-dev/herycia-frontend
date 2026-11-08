import { computed, getCurrentScope, hasInjectionContext, onScopeDispose, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { getApiErrorDetails, getApiErrorMessage } from '@/lib/api'
import { clearPaymentAttempt, isAllowedPaymentUrl, paymentKeyFor } from '@/lib/payment-attempt'
import { toast } from '@/lib/toast'
import { initializeSubscriptionPayment } from '@/services/subscription.service'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import type { PaystackInitializeResponse, SalonPlanCode } from '@/types/plan'

/** Réessais automatiques, avec la même clé, quand une requête identique est en cours (409). */
export const IN_PROGRESS_MAX_RETRIES = 2
export const IN_PROGRESS_RETRY_DELAY_MS = 1500

const HTTP_CONFLICT = 409
const HTTP_UNPROCESSABLE = 422
const HTTP_TOO_MANY_REQUESTS = 429
const HTTP_BAD_GATEWAY = 502

const CODE_ALREADY_COMPLETED = 'payment_already_completed'
const CODE_KEY_EXPIRED = 'idempotency_key_expired'
const CODE_IN_PROGRESS = 'request_in_progress'
const CODE_TOO_MANY_PENDING = 'too_many_pending_payments'

const NO_SALON = 'no-salon'

const MESSAGES = {
  alreadyCompleted: 'Ce paiement est déjà confirmé : votre abonnement a été mis à jour.',
  keyExpired:
    'Le lien de paiement précédent a expiré ou a échoué. Cliquez à nouveau pour relancer le paiement.',
  inProgress:
    'Une demande de paiement est déjà en cours. Patientez quelques secondes puis réessayez.',
  tooManyPending:
    'Vous avez déjà plusieurs paiements en attente. Terminez un paiement ouvert ou réessayez dans environ 30 minutes.',
  tooManyRequests: 'Trop de tentatives de paiement.',
  unavailable: 'Service de paiement momentanément indisponible. Réessayez dans quelques instants.',
  missingUrl: 'Lien de paiement introuvable. Réessayez dans quelques instants.',
  invalidUrl: 'Lien de paiement invalide. Réessayez ou contactez le support.',
} as const

interface FailureOutcome {
  message: string
  /** La tentative est terminée : le prochain clic générera une nouvelle clé. */
  renewKey: boolean
}

/** Attente interrompue dès que la tentative est annulée (démontage, changement de route). */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', done)
      resolve()
    }
    const timer = setTimeout(done, ms)
    signal.addEventListener('abort', done, { once: true })
  })
}

function checkoutUrlOf(data: PaystackInitializeResponse): string | null {
  return data.checkout_url ?? data.authorization_url ?? null
}

function formatDelay(seconds: number): string {
  if (seconds < 60) return `${seconds} seconde${seconds > 1 ? 's' : ''}`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}

function isInProgress(error: unknown): boolean {
  const { status, code } = getApiErrorDetails(error)
  return status === HTTP_CONFLICT && code === CODE_IN_PROGRESS
}

function describeConflict(code: string | undefined, error: unknown): FailureOutcome {
  if (code === CODE_KEY_EXPIRED) return { message: MESSAGES.keyExpired, renewKey: true }
  if (code === CODE_IN_PROGRESS) return { message: MESSAGES.inProgress, renewKey: false }
  if (code === CODE_TOO_MANY_PENDING) return { message: MESSAGES.tooManyPending, renewKey: true }
  return { message: getApiErrorMessage(error), renewKey: false }
}

function describeFailure(error: unknown): FailureOutcome {
  const { status, code, retryAfterSeconds } = getApiErrorDetails(error)
  if (status === HTTP_CONFLICT) return describeConflict(code, error)
  if (status === HTTP_TOO_MANY_REQUESTS) {
    const delay =
      retryAfterSeconds === undefined
        ? 'Réessayez dans quelques instants.'
        : `Réessayez dans ${formatDelay(retryAfterSeconds)}.`
    return { message: `${MESSAGES.tooManyRequests} ${delay}`, renewKey: false }
  }
  if (status === HTTP_BAD_GATEWAY) return { message: MESSAGES.unavailable, renewKey: false }
  // 422 : en-tête invalide ou clé déjà utilisée pour un autre plan.
  if (status === HTTP_UNPROCESSABLE) return { message: getApiErrorMessage(error), renewKey: true }
  // Erreur réseau, timeout, lien refusé… : même tentative, même clé.
  return { message: getApiErrorMessage(error), renewKey: false }
}

async function initializeWithRetry(planCode: string, key: string, signal: AbortSignal) {
  for (let retry = 0; ; retry++) {
    try {
      return await initializeSubscriptionPayment(planCode, key, signal)
    } catch (e) {
      if (signal.aborted || !isInProgress(e) || retry >= IN_PROGRESS_MAX_RETRIES) throw e
      await wait(IN_PROGRESS_RETRY_DELAY_MS, signal)
      if (signal.aborted) throw e
    }
  }
}

/**
 * Paiement d'abonnement GeniusPay. L'état (verrou, erreur, requête en cours) est partagé via le
 * store `subscription` ; la clé d'idempotence est persistée par salon (voir `payment-attempt`).
 */
export function usePaystackCheckout() {
  const subscriptionStore = useSubscriptionStore()
  const authStore = useAuthStore()
  const {
    paymentPaying: paying,
    paymentError: error,
    paymentCooldown: cooldown,
  } = storeToRefs(subscriptionStore)
  /** Bouton « Payer » inactif : paiement en cours ou délai `Retry-After` non écoulé. */
  const locked = computed(() => paying.value || cooldown.value)

  let controller = new AbortController()
  function cancel() {
    controller.abort()
    controller = new AbortController()
  }
  if (getCurrentScope()) onScopeDispose(() => controller.abort())
  if (hasInjectionContext()) {
    const router = useRouter()
    if (router) watch(() => router.currentRoute.value.fullPath, cancel)
  }

  const salonId = () => authStore.user?.salon?.id ?? NO_SALON

  async function handleFailure(e: unknown, signal: AbortSignal) {
    const { status, code, retryAfterSeconds } = getApiErrorDetails(e)
    if (status === HTTP_CONFLICT && code === CODE_ALREADY_COMPLETED) {
      clearPaymentAttempt(salonId())
      await subscriptionStore.load()
      if (!signal.aborted) toast.success(MESSAGES.alreadyCompleted)
      return
    }
    const { message, renewKey } = describeFailure(e)
    if (renewKey) clearPaymentAttempt(salonId())
    if (status === HTTP_TOO_MANY_REQUESTS && retryAfterSeconds !== undefined) {
      subscriptionStore.blockPaymentFor(retryAfterSeconds)
    }
    if (signal.aborted) return
    error.value = message
    toast.error(message)
  }

  function redirect(url: string) {
    // Retour arrière depuis GeniusPay avec page restaurée (bfcache) : réactiver les boutons.
    window.addEventListener(
      'pageshow',
      (event) => {
        if (event.persisted) paying.value = false
      },
      { once: true },
    )
    window.location.href = url
  }

  async function run(planCode: string, signal: AbortSignal) {
    paying.value = true
    error.value = null
    try {
      // La clé est conservée après la redirection : un retour arrière + clic rejoue la tentative.
      const key = paymentKeyFor(salonId(), planCode)
      const response = await initializeWithRetry(planCode, key, signal)
      if (!response.success) throw new Error(response.message)
      const url = checkoutUrlOf(response.data)
      if (!url) throw new Error(MESSAGES.missingUrl)
      if (!isAllowedPaymentUrl(url)) throw new Error(MESSAGES.invalidUrl)
      if (signal.aborted) {
        paying.value = false
        return
      }
      redirect(url)
    } catch (e) {
      if (!signal.aborted) await handleFailure(e, signal)
      paying.value = false
    }
  }

  async function checkout(planCode: SalonPlanCode | string) {
    if (subscriptionStore.paymentRequest) return subscriptionStore.paymentRequest
    if (locked.value) return
    const request = run(planCode, controller.signal).finally(() => {
      subscriptionStore.paymentRequest = null
    })
    subscriptionStore.paymentRequest = request
    return request
  }

  function resetError() {
    error.value = null
  }

  return { paying, locked, error, checkout, resetError }
}
