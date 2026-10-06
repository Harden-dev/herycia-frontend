import type { SalonDetail } from '@/types/salon'

export interface SalonSummary {
  id: string
  name: string
  slug: string
  booking_link: string
  logo_url?: string | null
  booking_qr_code?: string | null
  whatsapp_number?: string
  city?: string
  is_active?: boolean
}

export interface SubscriptionSummary {
  id: string
  status: string
  is_trial: boolean
  plan: {
    code: string
    name: string
    price_fcfa: number
    max_employees?: number | null
    max_services?: number
    has_online_booking?: boolean
    has_analytics?: boolean
  }
  trial_ends_at?: string | null
  ends_at?: string | null
}

export interface AuthenticatedUser {
  id: string
  name: string
  email: string | null
  phone: string
  role: string
  is_active: boolean
  salon: SalonSummary | null
  subscription?: SubscriptionSummary | SubscriptionSummary[] | null
  created_at?: string
}

export interface LoginResponseData {
  user: AuthenticatedUser
  access_token: string
  token_type: string
  expires_in: number | string
  expires_at: string
  salon?: SalonSummary
  subscription?: SubscriptionSummary
}

export interface RegisterPayload {
  salon_name: string
  city: string
  whatsapp_number: string
  admin_name: string
  phone: string
  password: string
  password_confirmation: string
  plan_code: string
}

export interface RegisterResponseData extends LoginResponseData {
  salon: SalonSummary
  subscription: SubscriptionSummary
}

export interface MeResponseData {
  user: AuthenticatedUser
  salon: SalonDetail | SalonSummary
  subscription: SubscriptionSummary
}

export interface LoginPayload {
  login: string
  password: string
}

export interface RefreshResponseData {
  access_token: string
  token_type: string
  expires_in: number | string
}

export interface ForgotPasswordResponseData {
  /** Validité du code, en minutes */
  expires_in: number
}

export interface VerifyResetCodeResponseData {
  /** Jeton temporaire autorisant le changement de mot de passe */
  token: string
  /** Validité du jeton, en minutes */
  expires_in: number
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}
