import { SALON_PLAN_CODES, type SalonPlanCode, type SubscriptionRecord } from '@/types/plan'
import type { SubscriptionSummary } from '@/types/auth'

export const SELECTED_PLAN_KEY = 'herycia_selected_plan_code'

type SubscriptionLike =
  | Pick<SubscriptionRecord, 'status' | 'is_trial' | 'trial_ends_at' | 'ends_at' | 'plan'>
  | SubscriptionSummary
  | null
  | undefined

export function isSalonPlanCode(code: string): code is SalonPlanCode {
  return SALON_PLAN_CODES.includes(code as SalonPlanCode)
}

export function normalizePlanCode(
  raw: string | null | undefined,
  allowedCodes?: string[],
): SalonPlanCode {
  const code = (raw ?? '').toLowerCase()
  if (allowedCodes?.includes(code)) return code as SalonPlanCode
  if (isSalonPlanCode(code)) return code
  return 'basic'
}

export function getSelectedPlanCode(
  queryPlan?: string | null,
  storagePlan?: string | null,
  allowedCodes?: string[],
): SalonPlanCode {
  return normalizePlanCode(queryPlan || storagePlan || 'basic', allowedCodes)
}

export function trialDaysLeft(trialEndsAt: string | null | undefined): number {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

export function renewalDaysLeft(endsAt: string | null | undefined): number | null {
  if (!endsAt) return null
  const diff = new Date(endsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

export function isTrial(sub: SubscriptionLike): boolean {
  if (!sub) return false
  return sub.status === 'trial' || Boolean(sub.is_trial)
}

export function isActive(sub: SubscriptionLike): boolean {
  return sub?.status === 'active'
}

export function isTrialExpired(sub: SubscriptionLike): boolean {
  if (!sub) return false
  if (sub.status === 'expired' || sub.status === 'past_due') return true
  if (sub.status === 'trial' && sub.trial_ends_at) {
    return new Date(sub.trial_ends_at) < new Date()
  }
  return false
}

export function hasAnalytics(sub: { plan?: { has_analytics?: boolean } } | null | undefined): boolean {
  return Boolean(sub?.plan?.has_analytics)
}

export function needsPayment(sub: SubscriptionLike): boolean {
  if (!sub) return false
  if (isTrialExpired(sub)) return true
  if (isTrial(sub)) return true
  if (isActive(sub) && sub.ends_at) {
    const days = renewalDaysLeft(sub.ends_at)
    return days !== null && days <= 7
  }
  return false
}

export function isSubscriptionBlocked(sub: SubscriptionLike): boolean {
  return isTrialExpired(sub)
}

export function canPayForPlan(sub: SubscriptionLike, targetCode: string): boolean {
  if (!sub?.plan) return true
  if (isTrial(sub) || isTrialExpired(sub)) return true
  if (!isActive(sub)) return true
  if (sub.plan.code !== targetCode) return true
  const days = renewalDaysLeft(sub.ends_at ?? null)
  return days !== null && days <= 7
}

export type SubscriptionCta =
  | { type: 'pay'; planCode: string; label: string }
  | { type: 'upgrade'; label: string }
  | { type: 'none' }

export function getSubscriptionCta(sub: SubscriptionLike): SubscriptionCta {
  const planCode = sub?.plan?.code
  if (!planCode) return { type: 'none' }

  if (isTrialExpired(sub)) {
    return { type: 'pay', planCode, label: 'Payer pour continuer' }
  }
  if (isTrial(sub)) {
    return { type: 'pay', planCode, label: 'Activer mon abonnement' }
  }
  if (isActive(sub) && sub.plan.code === 'basic') {
    return { type: 'upgrade', label: 'Passer à un plan supérieur' }
  }
  const days = renewalDaysLeft(sub.ends_at ?? null)
  if (isActive(sub) && days !== null && days <= 7) {
    return { type: 'pay', planCode, label: 'Renouveler' }
  }
  return { type: 'none' }
}
