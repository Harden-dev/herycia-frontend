import type { PaymentMethod, SalonStaffRole } from '@/types'

export function isAdmin(role: string | undefined): boolean {
  return role === 'admin'
}

export function canManagePayments(role: string | undefined): boolean {
  return role === 'admin' || role === 'receptionist'
}

export function canManageTeam(role: string | undefined): boolean {
  return role === 'admin'
}

export function canManageServices(role: string | undefined): boolean {
  return role === 'admin'
}

export const SALON_CITIES = [
  'Abidjan',
  'Bouaké',
  'Yamoussoukro',
  'Daloa',
  'San-Pédro',
  'Korhogo',
  'Man',
  'Gagnoa',
  'Abengourou',
  'Divo',
] as const

export const STAFF_ROLE_LABELS: Record<SalonStaffRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  stylist: 'Coiffeur',
  receptionist: 'Réceptionniste',
}

export const STAFF_ROLE_OPTIONS: { value: SalonStaffRole; label: string }[] = [
  { value: 'stylist', label: STAFF_ROLE_LABELS.stylist },
  { value: 'receptionist', label: STAFF_ROLE_LABELS.receptionist },
  { value: 'manager', label: STAFF_ROLE_LABELS.manager },
  { value: 'admin', label: STAFF_ROLE_LABELS.admin },
]

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show: 'Absent',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  card: 'Carte',
}

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: PAYMENT_METHOD_LABELS.cash },
  { value: 'mobile_money', label: PAYMENT_METHOD_LABELS.mobile_money },
  { value: 'card', label: PAYMENT_METHOD_LABELS.card },
]
