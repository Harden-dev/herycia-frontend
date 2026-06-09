export type AdminSubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'expired'

export type AdminBillingPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type AdminBillingPaymentMethod =
  | 'wave'
  | 'orange_money'
  | 'mobile_money'
  | 'card'
  | 'cash'

export type AdminUserType = 'owner' | 'employee' | 'super_admin'

export type AdminPlatformRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'stylist'
  | 'receptionist'

export type SalonCity =
  | 'Abidjan'
  | 'Bouaké'
  | 'Yamoussoukro'
  | 'Daloa'
  | 'San-Pédro'
  | 'Korhogo'
  | 'Man'
  | 'Gagnoa'
  | 'Abengourou'
  | 'Divo'

export interface AdminProfile {
  id: string
  name: string
  phone: string
  email: string | null
  role: 'super_admin'
  is_active: boolean
  created_at: string
}

export interface AdminSalonListItem {
  id: string
  name: string
  slug: string
  city: string
  phone: string | null
  whatsapp_number: string | null
  is_active: boolean
  is_suspended: boolean
  plan_name: string | null
  plan_code: string | null
  subscription_status: AdminSubscriptionStatus | null
  subscription_ends_at: string | null
  created_at: string
}

export interface AdminPlan {
  id: string
  name: string
  code: string
  price_fcfa: number
  max_employees: number
  max_services: number
  has_online_booking: boolean
  has_analytics: boolean
  has_multi_branch: boolean
  is_archived: boolean
  created_at?: string
}

export interface AdminSubscription {
  id: string
  salon_id: string
  plan_id: string
  status: AdminSubscriptionStatus
  started_at: string | null
  ends_at: string | null
  trial_ends_at: string | null
  is_trial: boolean
  created_at: string
  salon: {
    id: string
    name: string
    slug: string
    city: string
  }
  plan: {
    id: string
    name: string
    code: string
    price_fcfa: number
  }
}

export interface AdminBillingPayment {
  id: string
  amount: number
  method: AdminBillingPaymentMethod
  status: AdminBillingPaymentStatus
  reference: string | null
  period_start: string | null
  period_end: string | null
  paid_at: string | null
  created_at: string
  salon: { id: string; name: string; city: string }
  plan: { id: string; name: string; code: string }
  subscription?: { id: string; status: AdminSubscriptionStatus }
}

export interface AdminPlatformUser {
  id: string
  name: string
  phone: string
  email: string | null
  role: AdminPlatformRole
  is_active: boolean
  created_at: string
  salon: { id: string; name: string } | null
}

export interface AdminRecentPayment {
  id: string
  amount: number
  method: AdminBillingPaymentMethod
  status: AdminBillingPaymentStatus
  reference: string | null
  paid_at: string | null
  salon: { id: string; name: string; city: string }
  plan: { id: string; name: string; code: string }
}

export interface AdminOverviewStats {
  salons_count: number
  users_count: number
  mrr: number
  new_salons_this_month: number
  expired_subscriptions_count: number
  appointments_count: number
  recent_payments: AdminRecentPayment[]
}

export type SalonsByCityStats = Record<string, number>

export interface UpdateAdminSalonPayload {
  name?: string
  phone?: string
  whatsapp_number?: string
  city?: SalonCity
  address?: string
}

export interface CreateAdminPlanPayload {
  name: string
  code: string
  price_fcfa: number
  max_employees: number
  max_services: number
  has_online_booking: boolean
  has_analytics: boolean
  has_multi_branch: boolean
}

export type UpdateAdminPlanPayload = Partial<CreateAdminPlanPayload>

export interface UpdateAdminSubscriptionPayload {
  plan_id?: string
  status?: AdminSubscriptionStatus
  started_at?: string
  ends_at?: string | null
  trial_ends_at?: string | null
  is_trial?: boolean
}

export interface AdminSalonsQuery {
  page?: number
  per_page?: number
  search?: string
  city?: string
  plan_id?: string
  is_active?: boolean
  is_suspended?: boolean
}

export interface AdminPlansQuery {
  page?: number
  per_page?: number
  include_archived?: boolean
}

export interface AdminSubscriptionsQuery {
  page?: number
  per_page?: number
  search?: string
  plan_id?: string
  status?: AdminSubscriptionStatus
  salon_id?: string
}

export interface AdminBillingPaymentsQuery {
  page?: number
  per_page?: number
  from?: string
  to?: string
  plan_id?: string
  status?: AdminBillingPaymentStatus
  salon_id?: string
}

export interface AdminUsersQuery {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
  user_type?: AdminUserType
}

export interface AdminResetPasswordResult {
  user: { id: string; name: string; role: AdminPlatformRole }
  generated_password?: string
}
