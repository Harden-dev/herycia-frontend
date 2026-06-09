import api from '@/lib/api'
import type { ApiResponse, PaginatedListResponse, PaginationQuery } from '@/types/api'
import type { CreatePaymentPayload, PaymentListItem, PaymentSummary } from '@/types'

export interface PaymentsQuery extends PaginationQuery {
  date?: string
  from?: string
  to?: string
  method?: string
  status?: string
}

export async function fetchPayments(
  query: PaymentsQuery = {},
): Promise<PaginatedListResponse<PaymentListItem>> {
  const { data } = await api.get<PaginatedListResponse<PaymentListItem>>('v1/payments', {
    params: {
      page: query.page ?? 1,
      per_page: query.per_page ?? 15,
      ...(query.date ? { date: query.date } : {}),
      ...(query.from ? { from: query.from } : {}),
      ...(query.to ? { to: query.to } : {}),
      ...(query.method ? { method: query.method } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
  })
  return data
}

export async function fetchPaymentsSummary(): Promise<ApiResponse<PaymentSummary>> {
  const { data } = await api.get<ApiResponse<PaymentSummary>>('v1/payments/summary')
  return data
}

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<ApiResponse<PaymentListItem>> {
  const { data } = await api.post<ApiResponse<PaymentListItem>>('v1/payments', payload)
  return data
}
