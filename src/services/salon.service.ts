import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { SalonDetail, UpdateSalonPayload } from '@/types/salon'

export async function fetchSalon(): Promise<ApiResponse<SalonDetail>> {
  const { data } = await api.get<ApiResponse<SalonDetail>>('v1/salon')
  return data
}

export async function updateSalon(
  payload: UpdateSalonPayload,
): Promise<ApiResponse<SalonDetail>> {
  const { data } = await api.put<ApiResponse<SalonDetail>>('v1/salon', payload)
  return data
}

export async function downloadBookingQr(): Promise<Blob> {
  const { data } = await api.get<Blob>('v1/salon/booking-qr', {
    responseType: 'blob',
  })
  return data
}

export async function uploadSalonLogo(file: File): Promise<ApiResponse<SalonDetail>> {
  const form = new FormData()
  form.append('logo', file, file.name)
  const { data } = await api.post<ApiResponse<SalonDetail>>('v1/salon/logo', form)
  return data
}
