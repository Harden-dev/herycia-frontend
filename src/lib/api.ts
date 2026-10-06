import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { ApiErrorBody } from '@/types/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Ne pas tenter de rafraîchir le jeton sur 401 (appel de rafraîchissement lui-même). */
    skipAuthRefresh?: boolean
    /** Requête déjà rejouée après un rafraîchissement. */
    _retried?: boolean
  }
}

/** Messages affichés sur la page de connexion après une déconnexion forcée. */
const SESSION_END_MESSAGES: Record<string, string> = {
  token_expired: 'Votre session a expiré. Veuillez vous reconnecter.',
  token_revoked: 'Votre mot de passe a changé. Veuillez vous reconnecter.',
  account_disabled: 'Votre compte est désactivé. Contactez l\'administrateur du salon.',
}

function redirectToLogin() {
  import('@/router').then(({ default: router }) => {
    if (router.currentRoute.value.name !== 'login') {
      void router.push({ name: 'login' })
    }
  })
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const url = String(error.config?.url ?? '')
    const isPublic =
      url.includes('/booking/') || url.includes('/rdv/') || url.includes('/plans')
    const status = error.response?.status
    const errorCode = error.response?.data?.error
    const config = error.config

    if (status === 401 && !isPublic) {
      const authStore = useAuthStore()

      // Jeton expiré : un rafraîchissement, puis on rejoue la requête d'origine.
      if (
        errorCode === 'token_expired' &&
        authStore.token &&
        config &&
        !config.skipAuthRefresh &&
        !config._retried
      ) {
        const refreshed = await authStore.refresh()
        if (refreshed && authStore.token) {
          config._retried = true
          config.headers.Authorization = `Bearer ${authStore.token}`
          return api(config)
        }
      }

      if (authStore.token) {
        authStore.logout(
          SESSION_END_MESSAGES[errorCode ?? ''] ?? 'Votre session a expiré. Veuillez vous reconnecter.',
        )
        redirectToLogin()
      }
    }

    // Salon suspendu ou désactivé par la plateforme : plus aucun accès au back-office.
    if (status === 403 && !isPublic && (errorCode === 'salon_suspended' || errorCode === 'salon_inactive')) {
      const authStore = useAuthStore()
      if (authStore.token) {
        authStore.logout(error.response?.data?.message ?? 'Ce salon n\'est plus accessible.')
        redirectToLogin()
      }
    }

    if (status === 403 && !isPublic) {
      const code = error.response?.data?.code
      if (code === 'subscription_expired') {
        import('@/stores/subscription').then(({ useSubscriptionStore }) => {
          useSubscriptionStore().setBlocked(true)
        })
        import('@/router').then(({ default: router }) => {
          if (router.currentRoute.value.name !== 'settings') {
            void router.push({ name: 'settings', query: { payment: 'required' } })
          }
        })
      }
      if (code === 'subscription_feature_denied') {
        import('@/stores/subscription').then(({ useSubscriptionStore }) => {
          useSubscriptionStore().openUpgradeModal()
        })
      }
    }

    return Promise.reject(error)
  },
)

export function validationErrorsFromBody(
  body: ApiErrorBody | undefined,
): Record<string, string> | null {
  if (!body?.errors) return null

  return Object.fromEntries(
    Object.entries(body.errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? (messages[0] ?? '') : String(messages),
    ]),
  )
}

export class ApiRequestError extends Error {
  fieldErrors: Record<string, string> | null
  status?: number

  constructor(message: string, fieldErrors: Record<string, string> | null = null, status?: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.fieldErrors = fieldErrors
    this.status = status
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.message ?? 'Une erreur est survenue'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Une erreur est survenue'
}

export function extractValidationErrors(error: unknown): Record<string, string> | null {
  if (error instanceof ApiRequestError) return error.fieldErrors
  if (!axios.isAxiosError<ApiErrorBody>(error)) return null
  if (error.response?.status !== 422) return null
  return validationErrorsFromBody(error.response.data)
}

export function toApiRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) return error
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return new ApiRequestError(
      error.response?.data?.message ?? error.message ?? 'Une erreur est survenue',
      validationErrorsFromBody(error.response?.data),
      error.response?.status,
    )
  }
  if (error instanceof Error) return new ApiRequestError(error.message)
  return new ApiRequestError('Une erreur est survenue')
}

export default api
