import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, effectScope, h } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import type * as SubscriptionService from '@/services/subscription.service'
import type { ApiResponse } from '@/types/api'
import type { PaystackInitializeResponse } from '@/types/plan'

const service = vi.hoisted(() => ({
  initializeSubscriptionPayment: vi.fn<typeof SubscriptionService.initializeSubscriptionPayment>(),
  fetchSubscriptionDetail: vi.fn<typeof SubscriptionService.fetchSubscriptionDetail>(),
}))
vi.mock('@/services/subscription.service', () => service)

const toast = vi.hoisted(() => ({
  success: vi.fn<(message: string) => void>(),
  error: vi.fn<(message: string) => void>(),
}))
vi.mock('@/lib/toast', () => ({ toast }))

import {
  IN_PROGRESS_MAX_RETRIES,
  IN_PROGRESS_RETRY_DELAY_MS,
  usePaystackCheckout,
} from '@/composables/usePaystackCheckout'
import {
  DEFAULT_PAYMENT_HOSTS,
  PAYMENT_ATTEMPT_TTL_MS,
  allowedPaymentHosts,
  generateIdempotencyKey,
} from '@/lib/payment-attempt'

const SALON_ID = 'salon-1'
const STORAGE_KEY = `manyan_payment_attempt:${SALON_ID}`
const PAY_URL = 'https://pay.genius.ci/checkout/MTX-A1'
const INVALID_URL_MESSAGE = 'Lien de paiement invalide. Réessayez ou contactez le support.'

function apiError(status: number, code?: string, headers: Record<string, string> = {}) {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig
  const response: AxiosResponse = {
    status,
    statusText: '',
    data: { success: false, message: `Erreur ${status}`, code },
    headers,
    config,
  }
  return new AxiosError(`Erreur ${status}`, String(status), config, null, response)
}

function success(
  data: Partial<PaystackInitializeResponse>,
): ApiResponse<PaystackInitializeResponse> {
  return {
    success: true,
    message: '',
    data: {
      access_code: 'a',
      reference: 'ref',
      amount: 5000,
      currency: 'XOF',
      plan: { code: 'basic', name: 'Basic', price_fcfa: 5000 },
      ...data,
    },
  }
}

const usedKeys = () => service.initializeSubscriptionPayment.mock.calls.map((call) => call[1])

/** Retour arrière depuis GeniusPay avec la page restaurée depuis le bfcache. */
function restoreFromBackForwardCache() {
  window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }))
}

describe('usePaystackCheckout', () => {
  let location: { href: string }

  beforeEach(() => {
    sessionStorage.clear()
    localStorage.setItem('manyan_user', JSON.stringify({ salon: { id: SALON_ID } }))
    setActivePinia(createPinia())
    vi.clearAllMocks()
    location = { href: '' }
    vi.stubGlobal('location', location)
    let n = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(
      () => `00000000-0000-4000-8000-00000000000${++n}` as ReturnType<typeof crypto.randomUUID>,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('envoie une clé et redirige vers checkout_url', async () => {
    service.initializeSubscriptionPayment.mockResolvedValue(
      success({ checkout_url: PAY_URL, authorization_url: 'https://pay.genius.ci/old' }),
    )
    const { checkout, paying } = usePaystackCheckout()

    await checkout('basic')

    expect(usedKeys()).toEqual(['00000000-0000-4000-8000-000000000001'])
    expect(location.href).toBe(PAY_URL)
    expect(paying.value).toBe(true)
  })

  it('se replie sur authorization_url', async () => {
    service.initializeSubscriptionPayment.mockResolvedValue(
      success({ authorization_url: 'https://pay.genius.ci/old' }),
    )
    await usePaystackCheckout().checkout('basic')
    expect(location.href).toBe('https://pay.genius.ci/old')
  })

  it('garde la clé après la redirection : retour arrière + clic renvoie la même clé', async () => {
    service.initializeSubscriptionPayment.mockResolvedValue(success({ checkout_url: PAY_URL }))
    const { checkout, paying } = usePaystackCheckout()

    await checkout('basic')
    restoreFromBackForwardCache()
    expect(paying.value).toBe(false)
    await checkout('basic')

    const [k1, k2] = usedKeys()
    expect(k2).toBe(k1)
  })

  it('garde la même clé après une erreur réseau ou un 502', async () => {
    service.initializeSubscriptionPayment
      .mockRejectedValueOnce(new AxiosError('Network Error'))
      .mockRejectedValueOnce(apiError(502))
      .mockResolvedValueOnce(success({ checkout_url: PAY_URL }))
    const { checkout, error, paying } = usePaystackCheckout()

    await checkout('basic')
    await checkout('basic')
    expect(error.value).toBe(
      'Service de paiement momentanément indisponible. Réessayez dans quelques instants.',
    )
    expect(paying.value).toBe(false)
    await checkout('basic')

    expect(new Set(usedKeys()).size).toBe(1)
  })

  it('génère une nouvelle clé quand le plan change', async () => {
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(502))
    const { checkout } = usePaystackCheckout()

    await checkout('basic')
    await checkout('premium')

    const [k1, k2] = usedKeys()
    expect(k2).not.toBe(k1)
  })

  it.each([
    [409, 'idempotency_key_expired'],
    [409, 'too_many_pending_payments'],
    [422, undefined],
  ])('génère une nouvelle clé après un %i %s', async (status, code) => {
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(status, code))
    const { checkout } = usePaystackCheckout()

    await checkout('basic')
    await checkout('basic')

    const [k1, k2] = usedKeys()
    expect(k2).not.toBe(k1)
    expect(service.initializeSubscriptionPayment).toHaveBeenCalledTimes(2)
  })

  it('garde la même clé après un 409 au code inconnu', async () => {
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(409, 'code_inconnu'))
    const { checkout } = usePaystackCheckout()

    await checkout('basic')
    await checkout('basic')

    const [k1, k2] = usedKeys()
    expect(k2).toBe(k1)
  })

  it('affiche un message sans réessayer sur too_many_pending_payments', async () => {
    service.initializeSubscriptionPayment.mockRejectedValue(
      apiError(409, 'too_many_pending_payments'),
    )
    const { checkout, error } = usePaystackCheckout()

    await checkout('basic')

    expect(service.initializeSubscriptionPayment).toHaveBeenCalledTimes(1)
    expect(error.value).toContain('30 minutes')
  })

  it('double clic : une seule requête', async () => {
    service.initializeSubscriptionPayment.mockResolvedValue(success({ checkout_url: PAY_URL }))
    const { checkout } = usePaystackCheckout()

    await Promise.all([checkout('basic'), checkout('basic')])

    expect(service.initializeSubscriptionPayment).toHaveBeenCalledTimes(1)
  })

  it('deux composants sur le même plan partagent la clé et la requête', async () => {
    let resolve: (value: ApiResponse<PaystackInitializeResponse>) => void = () => {}
    service.initializeSubscriptionPayment.mockReturnValueOnce(
      new Promise((r) => {
        resolve = r
      }),
    )
    const banner = usePaystackCheckout()
    const settings = usePaystackCheckout()

    const first = banner.checkout('basic')
    const second = settings.checkout('basic')
    expect(settings.paying.value).toBe(true)
    resolve(success({ checkout_url: PAY_URL }))
    await Promise.all([first, second])

    expect(service.initializeSubscriptionPayment).toHaveBeenCalledTimes(1)
    expect(location.href).toBe(PAY_URL)
  })

  it('persiste la tentative en sessionStorage par salon et la reprend après rechargement', async () => {
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(502))
    await usePaystackCheckout().checkout('basic')

    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    expect(stored).toMatchObject({ planCode: 'basic', key: usedKeys()[0] })

    setActivePinia(createPinia())
    await usePaystackCheckout().checkout('basic')

    const [k1, k2] = usedKeys()
    expect(k2).toBe(k1)
  })

  it('renouvelle la clé après expiration du TTL', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-08T10:00:00Z'))
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(502))
    const { checkout } = usePaystackCheckout()

    await checkout('basic')
    vi.setSystemTime(Date.now() + PAYMENT_ATTEMPT_TTL_MS - 1000)
    await checkout('basic')
    vi.setSystemTime(Date.now() + 2000)
    await checkout('basic')

    const [k1, k2, k3] = usedKeys()
    expect(k2).toBe(k1)
    expect(k3).not.toBe(k1)
  })

  it('ignore une tentative stockée illisible', async () => {
    sessionStorage.setItem(STORAGE_KEY, '{pas du json')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(502))

    await usePaystackCheckout().checkout('basic')

    expect(usedKeys()).toEqual(['00000000-0000-4000-8000-000000000001'])
  })

  it.each([
    'javascript:alert(1)',
    'http://pay.genius.ci/checkout/x',
    'https://evil.example/checkout',
    'https://pay.genius.ci.evil.example/x',
    'pas une url',
  ])('refuse le lien de paiement « %s » sans rediriger', async (url) => {
    service.initializeSubscriptionPayment.mockResolvedValue(success({ checkout_url: url }))
    const { checkout, error, paying } = usePaystackCheckout()

    await checkout('basic')

    expect(location.href).toBe('')
    expect(error.value).toBe(INVALID_URL_MESSAGE)
    expect(toast.error).toHaveBeenCalledWith(INVALID_URL_MESSAGE)
    expect(paying.value).toBe(false)
  })

  it('lit la liste blanche dans VITE_PAYMENT_HOSTS', async () => {
    vi.stubEnv('VITE_PAYMENT_HOSTS', ' Pay.Autre.ci , pay.genius.ci ')
    expect(allowedPaymentHosts()).toEqual(['pay.autre.ci', 'pay.genius.ci'])
    service.initializeSubscriptionPayment.mockResolvedValue(
      success({ checkout_url: 'https://pay.autre.ci/c' }),
    )
    await usePaystackCheckout().checkout('basic')
    expect(location.href).toBe('https://pay.autre.ci/c')

    vi.stubEnv('VITE_PAYMENT_HOSTS', '')
    expect(allowedPaymentHosts()).toEqual(DEFAULT_PAYMENT_HOSTS)
  })

  it('réessaie automatiquement avec la même clé sur request_in_progress', async () => {
    vi.useFakeTimers()
    service.initializeSubscriptionPayment
      .mockRejectedValueOnce(apiError(409, 'request_in_progress'))
      .mockResolvedValueOnce(success({ checkout_url: PAY_URL }))

    const pending = usePaystackCheckout().checkout('basic')
    await vi.advanceTimersByTimeAsync(IN_PROGRESS_RETRY_DELAY_MS)
    await pending

    const [k1, k2] = usedKeys()
    expect(k2).toBe(k1)
    expect(location.href).toBe(PAY_URL)
  })

  it('borne les réessais sur request_in_progress puis garde la clé', async () => {
    vi.useFakeTimers()
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(409, 'request_in_progress'))
    const { checkout, error } = usePaystackCheckout()

    const pending = checkout('basic')
    await vi.advanceTimersByTimeAsync(IN_PROGRESS_RETRY_DELAY_MS * IN_PROGRESS_MAX_RETRIES)
    await pending

    expect(service.initializeSubscriptionPayment).toHaveBeenCalledTimes(IN_PROGRESS_MAX_RETRIES + 1)
    expect(error.value).toContain('déjà en cours')
    vi.useRealTimers()
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(502))
    await checkout('basic')
    expect(new Set(usedKeys()).size).toBe(1)
  })

  it('arrête les réessais au démontage, sans toast ni redirection', async () => {
    vi.useFakeTimers()
    service.initializeSubscriptionPayment.mockRejectedValue(apiError(409, 'request_in_progress'))
    const scope = effectScope()
    const checkout = scope.run(() => usePaystackCheckout())!

    const pending = checkout.checkout('basic')
    await vi.advanceTimersByTimeAsync(0)
    scope.stop()
    await vi.advanceTimersByTimeAsync(IN_PROGRESS_RETRY_DELAY_MS * IN_PROGRESS_MAX_RETRIES)
    await pending

    expect(service.initializeSubscriptionPayment).toHaveBeenCalledTimes(1)
    expect(service.initializeSubscriptionPayment.mock.calls[0]?.[2]?.aborted).toBe(true)
    expect(toast.error).not.toHaveBeenCalled()
    expect(checkout.error.value).toBeNull()
    expect(checkout.paying.value).toBe(false)
    expect(location.href).toBe('')
  })

  it('arrête les réessais quand la route change', async () => {
    vi.useFakeTimers()
    service.initializeSubscriptionPayment
      .mockRejectedValueOnce(apiError(409, 'request_in_progress'))
      .mockResolvedValue(success({ checkout_url: PAY_URL }))
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/settings', component: { render: () => null } },
        { path: '/queue', component: { render: () => null } },
      ],
    })
    await router.push('/settings')
    let pay: ReturnType<typeof usePaystackCheckout> | undefined
    mount(
      defineComponent({
        setup() {
          pay = usePaystackCheckout()
          return () => h('div')
        },
      }),
      { global: { plugins: [router] } },
    )

    const pending = pay!.checkout('basic')
    await vi.advanceTimersByTimeAsync(0)
    await router.push('/queue')
    await vi.advanceTimersByTimeAsync(IN_PROGRESS_RETRY_DELAY_MS)
    await pending

    expect(service.initializeSubscriptionPayment).toHaveBeenCalledTimes(1)
    expect(toast.error).not.toHaveBeenCalled()
    expect(location.href).toBe('')
  })

  it('indique le délai Retry-After sur 429, bloque le bouton jusqu’à son terme et garde la clé', async () => {
    vi.useFakeTimers()
    service.initializeSubscriptionPayment.mockRejectedValue(
      apiError(429, undefined, { 'retry-after': '42' }),
    )
    const { checkout, error, locked } = usePaystackCheckout()

    await checkout('basic')
    expect(error.value).toBe('Trop de tentatives de paiement. Réessayez dans 42 secondes.')
    expect(locked.value).toBe(true)
    await checkout('basic')
    expect(service.initializeSubscriptionPayment).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(42_000)
    expect(locked.value).toBe(false)
    await checkout('basic')

    const [k1, k2] = usedKeys()
    expect(k2).toBe(k1)
  })

  it('ignore un en-tête Retry-After vide', async () => {
    service.initializeSubscriptionPayment.mockRejectedValue(
      apiError(429, undefined, { 'retry-after': '' }),
    )
    const { checkout, error, locked } = usePaystackCheckout()

    await checkout('basic')

    expect(error.value).toBe('Trop de tentatives de paiement. Réessayez dans quelques instants.')
    expect(locked.value).toBe(false)
  })

  it('rafraîchit l’abonnement sans repayer sur payment_already_completed, puis nouvelle clé', async () => {
    service.initializeSubscriptionPayment.mockRejectedValue(
      apiError(409, 'payment_already_completed'),
    )
    service.fetchSubscriptionDetail.mockResolvedValue({
      success: false,
      message: 'indisponible',
      data: undefined as never,
    })
    const { checkout, error } = usePaystackCheckout()

    await checkout('basic')

    expect(service.fetchSubscriptionDetail).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalled()
    expect(error.value).toBeNull()
    expect(location.href).toBe('')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('generateIdempotencyKey', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('se replie sur crypto.getRandomValues sans Math.random', () => {
    const random = vi.spyOn(Math, 'random')
    const realCrypto = globalThis.crypto
    const getRandomValues = vi.fn<(array: Uint8Array<ArrayBuffer>) => Uint8Array<ArrayBuffer>>(
      (array) => realCrypto.getRandomValues(array),
    )
    vi.stubGlobal('crypto', { getRandomValues })

    const key = generateIdempotencyKey()

    expect(key).toMatch(/^[0-9a-f]{32}$/)
    expect(getRandomValues).toHaveBeenCalledTimes(1)
    expect(random).not.toHaveBeenCalled()
  })
})
