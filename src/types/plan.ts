export type SalonPlanCode = 'basic' | 'premium' | 'pro' | 'enterprise'

export const SALON_PLAN_CODES: SalonPlanCode[] = ['basic', 'premium', 'pro', 'enterprise']

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'

export interface PlanFeatureItem {
  key: string
  label: string
  included: boolean
}

export interface PublicPlan {
  id: string
  code: SalonPlanCode
  name: string
  tagline: string | null
  price_fcfa: number
  price_label: string
  max_employees: number | null
  max_employees_label: string
  max_services?: number
  has_online_booking: boolean
  has_analytics: boolean
  features: PlanFeatureItem[]
}

export interface SubscriptionPlanDetail {
  code: SalonPlanCode | string
  name: string
  price_fcfa: number
  max_employees: number | null
  max_services?: number
  has_online_booking: boolean
  has_analytics: boolean
}

export interface SubscriptionUsage {
  active_employees: number
  max_employees: number | null
  max_employees_label: string
  employees_remaining: number | null
}

export interface SubscriptionRecord {
  id: string
  status: SubscriptionStatus | string
  is_trial: boolean
  plan: SubscriptionPlanDetail
  trial_ends_at?: string | null
  ends_at?: string | null
}

export interface SubscriptionDetailData {
  subscription: SubscriptionRecord
  usage: SubscriptionUsage
  features: PlanFeatureItem[]
}

export interface PaystackInitializePlan {
  code: SalonPlanCode | string
  name: string
  price_fcfa: number
}

export interface PaystackInitializeResponse {
  authorization_url: string
  access_code: string
  reference: string
  amount: number
  currency: string
  plan: PaystackInitializePlan
}
