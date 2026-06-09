import { STAFF_ROLE_LABELS } from '@/lib/permissions'
import type { SalonStaffRole } from '@/types'

const PLATFORM_ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  ...STAFF_ROLE_LABELS,
}

export function formatRole(role: string): string {
  return PLATFORM_ROLE_LABELS[role] ?? STAFF_ROLE_LABELS[role as SalonStaffRole] ?? role
}
