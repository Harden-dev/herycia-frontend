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
