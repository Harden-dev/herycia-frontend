import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type {
  CreatePublicBookingPayload,
  PublicBookingCreated,
  PublicBookingProfileResponse,
  PublicBookingTracking,
  PublicSalonBooking,
} from '@/types/booking'

function normalizePublicSalonBooking(
  raw: PublicSalonBooking | PublicBookingProfileResponse,
): PublicSalonBooking {
  if ('salon' in raw && raw.salon) {
    return {
      id: raw.salon.id,
      name: raw.salon.name,
      slug: raw.salon.slug,
      logo_url: raw.salon.logo_url ?? null,
      services: raw.services ?? [],
      employees: raw.employees ?? [],
    }
  }
  return raw as PublicSalonBooking
}

export async function fetchPublicSalon(slug: string): Promise<ApiResponse<PublicSalonBooking>> {
  const { data } = await api.get<
    ApiResponse<PublicSalonBooking | PublicBookingProfileResponse>
  >(`booking/${slug}`)
  if (!data.success || !data.data) return data as ApiResponse<PublicSalonBooking>
  return {
    ...data,
    data: normalizePublicSalonBooking(data.data),
  }
}

export async function createPublicBooking(
  slug: string,
  payload: CreatePublicBookingPayload,
): Promise<ApiResponse<PublicBookingCreated>> {
  const { data } = await api.post<ApiResponse<PublicBookingCreated>>(`booking/${slug}`, payload)
  return data
}

export async function fetchBookingByToken(
  token: string,
): Promise<ApiResponse<PublicBookingTracking>> {
  const { data } = await api.get<ApiResponse<PublicBookingTracking>>(`rdv/${token}`)
  return data
}
