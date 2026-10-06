import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type {
  LoginPayload,
  LoginResponseData,
  MeResponseData,
  RegisterPayload,
  RefreshResponseData,
  RegisterResponseData,
} from '@/types/auth'

export async function loginRequest(
  payload: LoginPayload,
): Promise<ApiResponse<LoginResponseData>> {
  const { data } = await api.post<ApiResponse<LoginResponseData>>('v1/auth/login', payload)
  return data
}

export async function registerRequest(
  payload: RegisterPayload,
): Promise<ApiResponse<RegisterResponseData>> {
  const { data } = await api.post<ApiResponse<RegisterResponseData>>('v1/auth/register', payload)
  return data
}

export async function meRequest(): Promise<ApiResponse<MeResponseData>> {
  const { data } = await api.get<ApiResponse<MeResponseData>>('v1/auth/me')
  return data
}

export async function logoutRequest(): Promise<ApiResponse<null>> {
  const { data } = await api.post<ApiResponse<null>>('v1/auth/logout')
  return data
}

/**
 * Renouvelle la session (le jeton peut être expiré, dans la fenêtre de rafraîchissement).
 * `skipAuthRefresh` évite que l'intercepteur ne tente un rafraîchissement en boucle.
 */
export async function refreshRequest(token: string): Promise<ApiResponse<RefreshResponseData>> {
  const { data } = await api.post<ApiResponse<RefreshResponseData>>('v1/auth/refresh', null, {
    headers: { Authorization: `Bearer ${token}` },
    skipAuthRefresh: true,
  })
  return data
}
