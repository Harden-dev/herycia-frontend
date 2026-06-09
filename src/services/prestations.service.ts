import api from '@/lib/api'
import type { ApiResponse, PaginatedListResponse, PaginationQuery } from '@/types/api'
import type { CreateServicePayload, SalonService, UpdateServicePayload } from '@/types'

export interface ServicesQuery extends PaginationQuery {
  is_active?: boolean
}

export async function fetchServices(
  query: ServicesQuery = {},
): Promise<PaginatedListResponse<SalonService>> {
  const { data } = await api.get<PaginatedListResponse<SalonService>>('v1/services', {
    params: {
      page: query.page ?? 1,
      per_page: query.per_page ?? 15,
      ...(query.search ? { search: query.search } : {}),
      ...(query.is_active !== undefined ? { is_active: query.is_active ? 1 : 0 } : {}),
    },
  })
  return data
}

export async function createService(
  payload: CreateServicePayload,
): Promise<ApiResponse<SalonService>> {
  const { data } = await api.post<ApiResponse<SalonService>>('v1/services', payload)
  return data
}

export async function updateService(
  id: string,
  payload: UpdateServicePayload,
): Promise<ApiResponse<SalonService>> {
  const { data } = await api.put<ApiResponse<SalonService>>(`v1/services/${id}`, payload)
  return data
}

export async function deleteService(id: string): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`v1/services/${id}`)
  return data
}
