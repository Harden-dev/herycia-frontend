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

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const url = String(error.config?.url ?? '')
    const isPublic =
      url.includes('/booking/') || url.includes('/rdv/') || url.includes('/plans')

    if (error.response?.status === 401 && !isPublic) {
      const authStore = useAuthStore()
      if (authStore.token) authStore.logout()
    }

    if (error.response?.status === 403 && !isPublic) {
      const code = error.response.data?.code
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
