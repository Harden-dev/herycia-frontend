import api from '@/lib/api'
import type { ApiResponse, PaginatedListResponse, PaginationQuery } from '@/types/api'
import type { CreateUserPayload, StaffMember, UpdateUserPayload } from '@/types'

export interface UsersQuery extends PaginationQuery {
  is_active?: boolean
}

export async function fetchUsers(
  query: UsersQuery = {},
): Promise<PaginatedListResponse<StaffMember>> {
  const { data } = await api.get<PaginatedListResponse<StaffMember>>('v1/users', {
    params: {
      page: query.page ?? 1,
      per_page: query.per_page ?? 15,
      ...(query.search ? { search: query.search } : {}),
      ...(query.is_active !== undefined ? { is_active: query.is_active ? 1 : 0 } : {}),
    },
  })
  return data
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<ApiResponse<StaffMember>> {
  const { data } = await api.post<ApiResponse<StaffMember>>('v1/users', payload)
  return data
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<ApiResponse<StaffMember>> {
  const { data } = await api.put<ApiResponse<StaffMember>>(`v1/users/${id}`, payload)
  return data
}

/** Bascule actif / inactif (même endpoint pour les deux). */
export async function toggleUserStatus(id: string): Promise<ApiResponse<StaffMember | null>> {
  const { data } = await api.delete<ApiResponse<StaffMember | null>>(`v1/users/${id}`)
  return data
}
