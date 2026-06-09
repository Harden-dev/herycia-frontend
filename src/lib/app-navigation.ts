import type { Component } from 'vue'
import {
  IconCalendar,
  IconCash,
  IconCut,
  IconLayoutDashboard,
  IconSettings,
  IconTimeline,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-vue'
import { canManagePayments, canManageTeam } from '@/lib/permissions'

export interface AppNavItem {
  label: string
  to: string
  icon: Component
  roles: string[] | null
  premium: boolean
  mobilePrimary?: boolean
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: IconLayoutDashboard,
    roles: null,
    premium: false,
    mobilePrimary: true,
  },
  {
    label: 'Activité',
    to: '/activity',
    icon: IconTimeline,
    roles: null,
    premium: true,
  },
  {
    label: 'Agenda',
    to: '/agenda',
    icon: IconCalendar,
    roles: null,
    premium: false,
    mobilePrimary: true,
  },
  {
    label: 'Prestations',
    to: '/services',
    icon: IconCut,
    roles: null,
    premium: false,
  },
  {
    label: 'Clients',
    to: '/clients',
    icon: IconUserCircle,
    roles: null,
    premium: false,
    mobilePrimary: true,
  },
  {
    label: 'Paiements',
    to: '/payments',
    icon: IconCash,
    roles: ['admin', 'receptionist'],
    premium: false,
  },
  {
    label: 'Équipe',
    to: '/users',
    icon: IconUsers,
    roles: ['admin'],
    premium: false,
  },
]

export const APP_SETTINGS_NAV_ITEM: AppNavItem = {
  label: 'Paramètres',
  to: '/settings',
  icon: IconSettings,
  roles: null,
  premium: false,
}

export function filterAppNavItems(
  role: string | undefined,
  canUseAnalytics: boolean,
): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => {
    if (item.premium && !canUseAnalytics) return false
    if (!item.roles) return true
    if (!role) return false
    if (item.to === '/payments') return canManagePayments(role)
    if (item.to === '/users') return canManageTeam(role)
    return item.roles.includes(role)
  })
}

export function mobilePrimaryNavItems(
  role: string | undefined,
  canUseAnalytics: boolean,
): AppNavItem[] {
  return filterAppNavItems(role, canUseAnalytics).filter((item) => item.mobilePrimary)
}

export function mobileMoreNavItems(
  role: string | undefined,
  canUseAnalytics: boolean,
): AppNavItem[] {
  const items = filterAppNavItems(role, canUseAnalytics).filter((item) => !item.mobilePrimary)
  return [...items, APP_SETTINGS_NAV_ITEM]
}
