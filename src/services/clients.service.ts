import api from '@/lib/api'
import type { PaginatedListResponse } from '@/types/api'
import type { ApiResponse } from '@/types/api'
import type { Client, ClientDetail } from '@/types'

export interface ClientsQuery {
  page?: number
  per_page?: number
  search?: string
}

export async function fetchClients(
  query: ClientsQuery = {},
): Promise<PaginatedListResponse<Client>> {
  const { data } = await api.get<PaginatedListResponse<Client>>('v1/clients', {
    params: {
      page: query.page ?? 1,
      per_page: query.per_page ?? 15,
      ...(query.search ? { search: query.search } : {}),
    },
  })
  return data
}

export async function fetchClient(id: string): Promise<ApiResponse<ClientDetail>> {
  const { data } = await api.get<ApiResponse<ClientDetail>>(`v1/clients/${id}`)
  return data
}
