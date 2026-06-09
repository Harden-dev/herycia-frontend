import {
  IconBell,
  IconBrandWhatsapp,
  IconCalendar,
  IconCash,
  IconUserPlus,
} from '@tabler/icons-vue'
import type { Component } from 'vue'
import type { ActivityType } from '@/types/dashboard'

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  appointment: 'Rendez-vous',
  payment: 'Paiement',
  client: 'Client',
  queue: "File d'attente",
  system: 'Système',
}

export const activityIconByType: Record<ActivityType, Component> = {
  appointment: IconCalendar,
  payment: IconCash,
  client: IconUserPlus,
  queue: IconBrandWhatsapp,
  system: IconBell,
}

export const activityStyleByType: Record<ActivityType, string> = {
  appointment: 'bg-primary-50 text-primary-600',
  payment: 'bg-success-50 text-success-600',
  client: 'bg-accent-50 text-accent-600',
  queue: 'bg-warning-50 text-warning-600',
  system: 'bg-secondary text-muted-foreground',
}
