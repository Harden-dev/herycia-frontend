import type { Component } from 'vue'
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCalendar,
  IconCash,
  IconUsers,
} from '@tabler/icons-vue'
import { formatCFA } from '@/lib/utils'
import type {
  AdminBillingPaymentMethod,
  AdminBillingPaymentStatus,
  AdminOverviewStats,
  AdminPlatformRole,
  AdminSalonListItem,
  AdminSubscriptionStatus,
  AdminUserType,
  SalonsByCityStats,
} from '@/types/admin'

/** Valeur sentinelle pour les filtres Select (reka-ui n'accepte pas value="") */
export const FILTER_ALL = 'all'

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

export const ADMIN_ROLE_LABELS: Record<AdminPlatformRole, string> = {
  super_admin: 'Super admin',
  admin: 'Propriétaire salon',
  manager: 'Manager',
  stylist: 'Styliste',
  receptionist: 'Réceptionniste',
}

export const SUBSCRIPTION_STATUS_LABELS: Record<AdminSubscriptionStatus, string> = {
  trial: 'Essai',
  active: 'Actif',
  past_due: 'Impayé',
  cancelled: 'Annulé',
  expired: 'Expiré',
}

export const BILLING_PAYMENT_STATUS_LABELS: Record<AdminBillingPaymentStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
}

export const BILLING_PAYMENT_METHOD_LABELS: Record<AdminBillingPaymentMethod, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  mobile_money: 'Mobile Money',
  card: 'Carte',
  cash: 'Espèces',
}

export const USER_TYPE_TABS: { label: string; value: AdminUserType | null }[] = [
  { label: 'Tous', value: null },
  { label: 'Propriétaires', value: 'owner' },
  { label: 'Employés', value: 'employee' },
  { label: 'Super admins', value: 'super_admin' },
]

export function salonStatusLabel(salon: Pick<AdminSalonListItem, 'is_active' | 'is_suspended'>) {
  if (salon.is_suspended) return 'Suspendu'
  if (!salon.is_active) return 'Désactivé'
  return 'Actif'
}

export function salonStatusClasses(salon: Pick<AdminSalonListItem, 'is_active' | 'is_suspended'>) {
  if (salon.is_suspended) return 'bg-warning-50 text-warning-800'
  if (!salon.is_active) return 'bg-danger-50 text-danger-800'
  return 'bg-success-50 text-success-800'
}

export function subscriptionStatusClasses(status: AdminSubscriptionStatus) {
  const map: Record<AdminSubscriptionStatus, string> = {
    trial: 'bg-accent-50 text-accent-800',
    active: 'bg-success-50 text-success-800',
    past_due: 'bg-warning-50 text-warning-800',
    cancelled: 'bg-secondary text-muted-foreground',
    expired: 'bg-danger-50 text-danger-800',
  }
  return map[status]
}

export function billingPaymentStatusClasses(status: AdminBillingPaymentStatus) {
  const map: Record<AdminBillingPaymentStatus, string> = {
    pending: 'bg-warning-50 text-warning-800',
    paid: 'bg-success-50 text-success-800',
    failed: 'bg-danger-50 text-danger-800',
    refunded: 'bg-accent-50 text-accent-800',
  }
  return map[status]
}

export interface AdminMetricCardConfig {
  label: string
  value: string | number
  icon: Component
  accent: 'primary' | 'warning' | 'accent' | 'success'
}

export function adminOverviewMetrics(stats: AdminOverviewStats): AdminMetricCardConfig[] {
  return [
    {
      label: 'Salons inscrits',
      value: stats.salons_count,
      icon: IconBuildingStore,
      accent: 'primary',
    },
    {
      label: 'Utilisateurs',
      value: stats.users_count,
      icon: IconUsers,
      accent: 'accent',
    },
    {
      label: 'MRR (FCFA)',
      value: formatCFA(stats.mrr),
      icon: IconCash,
      accent: 'success',
    },
    {
      label: 'Nouveaux salons (mois)',
      value: stats.new_salons_this_month,
      icon: IconCalendar,
      accent: 'primary',
    },
    {
      label: 'Abonnements expirés',
      value: stats.expired_subscriptions_count,
      icon: IconAlertTriangle,
      accent: 'warning',
    },
    {
      label: 'Rendez-vous générés',
      value: stats.appointments_count,
      icon: IconCalendar,
      accent: 'accent',
    },
  ]
}

export function citiesToBarChart(data: SalonsByCityStats) {
  return Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }))
}
