import api from '@/lib/api'
import type { ApiResponse, PaginatedListResponse } from '@/types/api'
import type {
  AdminBillingPayment,
  AdminBillingPaymentsQuery,
  AdminOverviewStats,
  AdminPlan,
  AdminPlansQuery,
  AdminPlatformUser,
  AdminProfile,
  AdminResetPasswordResult,
  AdminSalonListItem,
  AdminSalonsQuery,
  AdminSubscription,
  AdminSubscriptionsQuery,
  AdminUsersQuery,
  CreateAdminPlanPayload,
  SalonsByCityStats,
  UpdateAdminPlanPayload,
  UpdateAdminSalonPayload,
  UpdateAdminSubscriptionPayload,
} from '@/types/admin'

function buildQuery(params: object) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const q = search.toString()
  return q ? `?${q}` : ''
}

export async function fetchAdminMe(): Promise<ApiResponse<AdminProfile>> {
  const { data } = await api.get<ApiResponse<AdminProfile>>('v1/admin/me')
  return data
}

export async function fetchAdminOverview(): Promise<ApiResponse<AdminOverviewStats>> {
  const { data } = await api.get<ApiResponse<AdminOverviewStats>>('v1/admin/stats/overview')
  return data
}

export async function fetchSalonsByCity(): Promise<ApiResponse<SalonsByCityStats>> {
  const { data } = await api.get<ApiResponse<SalonsByCityStats>>('v1/admin/stats/salons-by-city')
  return data
}

export async function fetchAdminSalons(
  query: AdminSalonsQuery = {},
): Promise<PaginatedListResponse<AdminSalonListItem>> {
  const { data } = await api.get<PaginatedListResponse<AdminSalonListItem>>(
    `v1/admin/salons${buildQuery(query)}`,
  )
  return data
}

export async function fetchAdminSalon(id: string): Promise<ApiResponse<AdminSalonListItem>> {
  const { data } = await api.get<ApiResponse<AdminSalonListItem>>(`v1/admin/salons/${id}`)
  return data
}

export async function updateAdminSalon(
  id: string,
  payload: UpdateAdminSalonPayload,
): Promise<ApiResponse<AdminSalonListItem>> {
  const { data } = await api.put<ApiResponse<AdminSalonListItem>>(`v1/admin/salons/${id}`, payload)
  return data
}

export async function suspendAdminSalon(id: string): Promise<ApiResponse<AdminSalonListItem>> {
  const { data } = await api.patch<ApiResponse<AdminSalonListItem>>(`v1/admin/salons/${id}/suspend`)
  return data
}

export async function deactivateAdminSalon(id: string): Promise<ApiResponse<AdminSalonListItem>> {
  const { data } = await api.patch<ApiResponse<AdminSalonListItem>>(
    `v1/admin/salons/${id}/deactivate`,
  )
  return data
}

export async function deleteAdminSalon(id: string): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`v1/admin/salons/${id}`)
  return data
}

export async function fetchAdminPlans(
  query: AdminPlansQuery = {},
): Promise<PaginatedListResponse<AdminPlan>> {
  const { data } = await api.get<PaginatedListResponse<AdminPlan>>(
    `v1/admin/plans${buildQuery(query)}`,
  )
  return data
}

export async function fetchAdminPlan(id: string): Promise<ApiResponse<AdminPlan>> {
  const { data } = await api.get<ApiResponse<AdminPlan>>(`v1/admin/plans/${id}`)
  return data
}

export async function createAdminPlan(
  payload: CreateAdminPlanPayload,
): Promise<ApiResponse<AdminPlan>> {
  const { data } = await api.post<ApiResponse<AdminPlan>>('v1/admin/plans', payload)
  return data
}

export async function updateAdminPlan(
  id: string,
  payload: UpdateAdminPlanPayload,
): Promise<ApiResponse<AdminPlan>> {
  const { data } = await api.put<ApiResponse<AdminPlan>>(`v1/admin/plans/${id}`, payload)
  return data
}

export async function archiveAdminPlan(id: string): Promise<ApiResponse<AdminPlan>> {
  const { data } = await api.patch<ApiResponse<AdminPlan>>(`v1/admin/plans/${id}/archive`)
  return data
}

export async function fetchAdminSubscriptions(
  query: AdminSubscriptionsQuery = {},
): Promise<PaginatedListResponse<AdminSubscription>> {
  const { data } = await api.get<PaginatedListResponse<AdminSubscription>>(
    `v1/admin/subscriptions${buildQuery(query)}`,
  )
  return data
}

export async function fetchAdminSubscription(id: string): Promise<ApiResponse<AdminSubscription>> {
  const { data } = await api.get<ApiResponse<AdminSubscription>>(`v1/admin/subscriptions/${id}`)
  return data
}

export async function updateAdminSubscription(
  id: string,
  payload: UpdateAdminSubscriptionPayload,
): Promise<ApiResponse<AdminSubscription>> {
  const { data } = await api.put<ApiResponse<AdminSubscription>>(
    `v1/admin/subscriptions/${id}`,
    payload,
  )
  return data
}

export async function cancelAdminSubscription(
  id: string,
): Promise<ApiResponse<AdminSubscription>> {
  const { data } = await api.patch<ApiResponse<AdminSubscription>>(
    `v1/admin/subscriptions/${id}/cancel`,
  )
  return data
}

export async function fetchAdminBillingPayments(
  query: AdminBillingPaymentsQuery = {},
): Promise<PaginatedListResponse<AdminBillingPayment>> {
  const { data } = await api.get<PaginatedListResponse<AdminBillingPayment>>(
    `v1/admin/billing-payments${buildQuery(query)}`,
  )
  return data
}

export async function fetchAdminBillingPayment(
  id: string,
): Promise<ApiResponse<AdminBillingPayment>> {
  const { data } = await api.get<ApiResponse<AdminBillingPayment>>(
    `v1/admin/billing-payments/${id}`,
  )
  return data
}

export async function fetchAdminUsers(
  query: AdminUsersQuery = {},
): Promise<PaginatedListResponse<AdminPlatformUser>> {
  const { data } = await api.get<PaginatedListResponse<AdminPlatformUser>>(
    `v1/admin/users${buildQuery(query)}`,
  )
  return data
}

export async function fetchAdminUser(id: string): Promise<ApiResponse<AdminPlatformUser>> {
  const { data } = await api.get<ApiResponse<AdminPlatformUser>>(`v1/admin/users/${id}`)
  return data
}

export async function blockAdminUser(id: string): Promise<ApiResponse<AdminPlatformUser>> {
  const { data } = await api.patch<ApiResponse<AdminPlatformUser>>(`v1/admin/users/${id}/block`)
  return data
}

export async function resetAdminUserPassword(
  id: string,
  newPassword?: string,
): Promise<ApiResponse<AdminResetPasswordResult>> {
  const { data } = await api.patch<ApiResponse<AdminResetPasswordResult>>(
    `v1/admin/users/${id}/reset-password`,
    newPassword ? { new_password: newPassword } : {},
  )
  return data
}
