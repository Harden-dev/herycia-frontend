import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type {
  CheckInResult,
  CheckinQr,
  LateChoice,
  PublicQueueEntry,
  QueueAction,
  QueueBoard,
  QueueBoardRow,
  PublicWalkInData,
  WalkInOptions,
  WalkInPayload,
} from '@/types/queue'

/* ---------- Public : arrivée au salon et suivi ---------- */

export interface PublicCheckInPayload {
  key: string
  phone?: string
  tracking_token?: string
}

export async function publicCheckIn(
  slug: string,
  payload: PublicCheckInPayload,
): Promise<ApiResponse<CheckInResult>> {
  const { data } = await api.post<ApiResponse<CheckInResult>>(`checkin/${slug}`, payload)
  return data
}

export async function publicLateChoice(
  slug: string,
  payload: { key: string; tracking_token: string; choice: LateChoice },
): Promise<ApiResponse<CheckInResult>> {
  const { data } = await api.post<ApiResponse<CheckInResult>>(
    `checkin/${slug}/late-choice`,
    payload,
  )
  return data
}

export async function fetchQueuePosition(token: string): Promise<ApiResponse<PublicQueueEntry>> {
  const { data } = await api.get<ApiResponse<PublicQueueEntry>>(`file/${token}`)
  return data
}

/* ---------- Back-office ---------- */

export async function fetchQueueBoard(): Promise<ApiResponse<QueueBoard>> {
  const { data } = await api.get<ApiResponse<QueueBoard>>('v1/queue/board')
  return data
}

export async function staffCheckIn(appointmentId: string): Promise<ApiResponse<CheckInResult>> {
  const { data } = await api.post<ApiResponse<CheckInResult>>('v1/queue/check-in', {
    appointment_id: appointmentId,
  })
  return data
}

export async function staffLateChoice(
  appointmentId: string,
  choice: LateChoice,
): Promise<ApiResponse<CheckInResult>> {
  const { data } = await api.post<ApiResponse<CheckInResult>>('v1/queue/check-in/late-choice', {
    appointment_id: appointmentId,
    choice,
  })
  return data
}

export async function applyQueueAction(
  entryId: string,
  action: QueueAction,
): Promise<ApiResponse<QueueBoardRow>> {
  const { data } = await api.patch<ApiResponse<QueueBoardRow>>(`v1/queue/${entryId}/${action}`)
  return data
}

export async function fetchCheckinQr(): Promise<ApiResponse<CheckinQr>> {
  const { data } = await api.get<ApiResponse<CheckinQr>>('v1/salon/checkin-qr')
  return data
}

export async function regenerateCheckinQr(): Promise<ApiResponse<CheckinQr>> {
  const { data } = await api.post<ApiResponse<CheckinQr>>('v1/salon/checkin-qr/regenerate')
  return data
}

/* ---------- V2 : sans rendez-vous et réaffectation ---------- */

export async function fetchPublicWalkIn(
  slug: string,
  key: string,
  serviceId?: string,
): Promise<ApiResponse<PublicWalkInData>> {
  const { data } = await api.get<ApiResponse<PublicWalkInData>>(`checkin/${slug}/walk-in`, {
    params: { key, service_id: serviceId },
  })
  return data
}

export async function publicWalkIn(
  slug: string,
  payload: WalkInPayload & { key: string },
): Promise<ApiResponse<CheckInResult>> {
  const { data } = await api.post<ApiResponse<CheckInResult>>(`checkin/${slug}/walk-in`, payload)
  return data
}

export async function fetchStaffWalkInOptions(
  serviceId: string,
): Promise<ApiResponse<WalkInOptions>> {
  const { data } = await api.get<ApiResponse<WalkInOptions>>('v1/queue/walk-in-options', {
    params: { service_id: serviceId },
  })
  return data
}

export async function staffWalkIn(payload: WalkInPayload): Promise<ApiResponse<CheckInResult>> {
  const { data } = await api.post<ApiResponse<CheckInResult>>('v1/queue/walk-in', payload)
  return data
}

export async function reassignQueueEntry(
  entryId: string,
  stylistId: string,
): Promise<ApiResponse<QueueBoardRow>> {
  const { data } = await api.patch<ApiResponse<QueueBoardRow>>(`v1/queue/${entryId}/reassign`, {
    stylist_id: stylistId,
  })
  return data
}
