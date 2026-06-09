import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { AppointmentListItem, AppointmentStatus } from '@/types'

export interface AppointmentsQuery {
  date?: string
  from?: string
  to?: string
  user_id?: string
}

export async function fetchAppointments(
  query: AppointmentsQuery = {},
): Promise<ApiResponse<AppointmentListItem[]>> {
  const { data } = await api.get<ApiResponse<AppointmentListItem[]>>('v1/appointments', {
    params: query,
  })
  return data
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<ApiResponse<AppointmentListItem>> {
  const { data } = await api.put<ApiResponse<AppointmentListItem>>(
    `v1/appointments/${id}/status`,
    { status },
  )
  return data
}

export async function cancelAppointment(id: string): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`v1/appointments/${id}`)
  return data
}
