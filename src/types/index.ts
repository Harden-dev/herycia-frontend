export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'expired'

export type SalonStaffRole = 'admin' | 'manager' | 'stylist' | 'receptionist'

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type PaymentMethod = 'cash' | 'mobile_money' | 'card'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type QueueStatus = 'waiting' | 'called'

export interface Client {
  id: string
  name: string
  phone: string
  whatsapp_id?: string
  total_visits?: number
  last_visit_at?: string | null
  created_at?: string
}

export interface ClientAppointmentHistory {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  service: { id: string; name: string }
  staff: { id: string; name: string }
  created_at?: string
}

export interface ClientPaymentHistory {
  id: string
  appointment_id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  mobile_money_ref: string | null
  paid_at: string
}

export interface ClientDetail extends Client {
  appointments: ClientAppointmentHistory[]
  payments: ClientPaymentHistory[]
}

export interface SalonService {
  id: string
  name: string
  duration_min: number
  price: number
  is_active: boolean
}

export interface CreateServicePayload {
  name: string
  duration_min: number
  price: number
}

export type UpdateServicePayload = CreateServicePayload

export interface CreateUserPayload {
  name: string
  phone: string
  email: string
  password: string
  password_confirmation: string
  role: SalonStaffRole
}

export interface UpdateUserPayload {
  name: string
  phone: string
  email: string
  role: SalonStaffRole
}

export interface StaffMember {
  id: string
  name: string
  phone: string
  email: string | null
  role: SalonStaffRole
  is_active: boolean
  created_at?: string
}

/** Carte agenda / file d'attente */
export interface Appointment {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  client: { name: string; phone: string }
  employee: { name: string }
  service: { name: string; duration_min: number; price: number }
}

export interface QueueEntry {
  id: string
  position: number
  wait_minutes: number
  status?: QueueStatus
  client: { name: string }
  service: { name: string }
}

export interface AppointmentListItem {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  created_at?: string
  client: { id: string; name: string; phone: string }
  staff: { id: string; name: string }
  service: { id: string; name: string; duration_min: number; price: number }
}

export interface CreatePaymentPayload {
  appointment_id: string
  amount: number
  method: PaymentMethod
  mobile_money_ref?: string
  paid_at?: string
}

export interface PaymentListItem {
  id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  mobile_money_ref: string | null
  paid_at: string
  client?: { id?: string; name: string }
  appointment?: {
    id?: string
    scheduled_at: string
    service?: { name: string }
  }
}

export interface PaymentSummaryPeriod {
  from: string
  to: string
  total: number
  count: number
}

export interface PaymentSummary {
  day: PaymentSummaryPeriod
  week: PaymentSummaryPeriod
  month: PaymentSummaryPeriod
}
