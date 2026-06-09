import api from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { PublicPlan } from '@/types/plan'

export async function fetchPublicPlans(): Promise<ApiResponse<PublicPlan[]>> {
  const { data } = await api.get<ApiResponse<PublicPlan[]>>('v1/plans')
  return data
}
