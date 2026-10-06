import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'

const push = vi.fn()
vi.mock('@/router', () => ({
  default: { currentRoute: { value: { name: 'dashboard' } }, push },
}))

import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data: unknown }

function useFakeServer(handler: Handler) {
  const adapter: AxiosAdapter = async (config) => {
    const { status, data } = handler(config)
    const response: AxiosResponse = { data, status, statusText: '', headers: {}, config }
    if (status >= 400) {
      throw new AxiosError('error', String(status), config, null, response)
    }
    return response
  }
  api.defaults.adapter = adapter
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('intercepteur API — session', () => {
  beforeEach(() => {
    localStorage.clear()
    push.mockClear()
    setActivePinia(createPinia())
    useAuthStore().token = 'old-token'
  })

  it('rafraîchit le jeton expiré puis rejoue la requête', async () => {
    const calls: string[] = []
    useFakeServer((config) => {
      calls.push(`${config.url} ${config.headers.Authorization}`)
      if (config.url === 'v1/auth/refresh') {
        return { status: 200, data: { success: true, data: { access_token: 'new-token' } } }
      }
      if (config.headers.Authorization === 'Bearer old-token') {
        return { status: 401, data: { success: false, error: 'token_expired' } }
      }
      return { status: 200, data: { success: true, data: 'ok' } }
    })

    const response = await api.get('v1/clients')

    expect(response.data.data).toBe('ok')
    expect(useAuthStore().token).toBe('new-token')
    expect(calls).toEqual([
      'v1/clients Bearer old-token',
      'v1/auth/refresh Bearer old-token',
      'v1/clients Bearer new-token',
    ])
  })

  it("n'envoie qu'un seul rafraîchissement pour des requêtes simultanées", async () => {
    let refreshCount = 0
    useFakeServer((config) => {
      if (config.url === 'v1/auth/refresh') {
        refreshCount++
        return { status: 200, data: { success: true, data: { access_token: 'new-token' } } }
      }
      if (config.headers.Authorization === 'Bearer old-token') {
        return { status: 401, data: { success: false, error: 'token_expired' } }
      }
      return { status: 200, data: { success: true } }
    })

    await Promise.all([api.get('v1/clients'), api.get('v1/services'), api.get('v1/appointments')])

    expect(refreshCount).toBe(1)
  })

  it('déconnecte avec un motif quand le compte est désactivé', async () => {
    useFakeServer(() => ({ status: 401, data: { success: false, error: 'account_disabled' } }))

    await expect(api.get('v1/clients')).rejects.toBeInstanceOf(AxiosError)
    await flush()

    const auth = useAuthStore()
    expect(auth.token).toBeNull()
    expect(auth.error).toContain('désactivé')
    expect(push).toHaveBeenCalledWith({ name: 'login' })
  })

  it('déconnecte quand le salon est suspendu', async () => {
    useFakeServer(() => ({
      status: 403,
      data: { success: false, error: 'salon_suspended', message: 'Ce salon est suspendu.' },
    }))

    await expect(api.get('v1/clients')).rejects.toBeInstanceOf(AxiosError)

    const auth = useAuthStore()
    expect(auth.token).toBeNull()
    expect(auth.error).toBe('Ce salon est suspendu.')
  })

  it('déconnecte si le rafraîchissement est refusé', async () => {
    useFakeServer((config) => {
      if (config.url === 'v1/auth/refresh') {
        return { status: 401, data: { success: false, message: 'Session expirée' } }
      }
      return { status: 401, data: { success: false, error: 'token_expired' } }
    })

    await expect(api.get('v1/clients')).rejects.toBeInstanceOf(AxiosError)

    expect(useAuthStore().token).toBeNull()
  })
})
