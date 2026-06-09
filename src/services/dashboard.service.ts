import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type {
  ActivityLog,
  ClientsStats,
  DashboardOverview,
  QueueDashboardEntry,
  RevenueStats,
} from '@/types/dashboard'

export async function fetchDashboardOverview(
  date?: string,
): Promise<ApiResponse<DashboardOverview>> {
  const { data } = await api.get<ApiResponse<DashboardOverview>>('v1/dashboard/overview', {
    params: date ? { date } : {},
  })
  return data
}

export async function fetchClientsStats(
  period: 'month' | 'year',
): Promise<ApiResponse<ClientsStats>> {
  const { data } = await api.get<ApiResponse<ClientsStats>>('v1/dashboard/clients-stats', {
    params: { period },
  })
  return data
}

export async function fetchRevenueStats(
  period: 'day' | 'week' | 'month' | 'year',
): Promise<ApiResponse<RevenueStats>> {
  const { data } = await api.get<ApiResponse<RevenueStats>>('v1/dashboard/revenue-stats', {
    params: { period },
  })
  return data
}

export async function fetchDashboardActivity(limit = 5): Promise<ApiResponse<ActivityLog[]>> {
  const { data } = await api.get<ApiResponse<ActivityLog[]>>('v1/dashboard/activity', {
    params: { limit },
  })
  return data
}

export async function fetchQueue(limit = 5): Promise<ApiResponse<QueueDashboardEntry[]>> {
  const { data } = await api.get<ApiResponse<QueueDashboardEntry[]>>('v1/queue', {
    params: { limit },
  })
  return data
}
