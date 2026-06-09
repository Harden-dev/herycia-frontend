import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type {
  PaystackInitializeResponse,
  SalonPlanCode,
  SubscriptionDetailData,
} from '@/types/plan'

export async function fetchSubscriptionDetail(): Promise<ApiResponse<SubscriptionDetailData>> {
  const { data } = await api.get<ApiResponse<SubscriptionDetailData>>('v1/subscription')
  return data
}

export async function initializeSubscriptionPayment(
  planCode: SalonPlanCode | string,
): Promise<ApiResponse<PaystackInitializeResponse>> {
  const { data } = await api.post<ApiResponse<PaystackInitializeResponse>>(
    'v1/subscription/initialize',
    { plan_code: planCode },
  )
  return data
}
