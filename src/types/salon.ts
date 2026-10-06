import type { SubscriptionSummary } from '@/types/auth'

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

export interface SalonDetail {
  id: string
  name: string
  slug: string
  phone: string | null
  whatsapp_number: string
  city: SalonCity | string
  address: string | null
  logo_url: string | null
  is_active: boolean
  booking_link: string
  booking_qr_code?: string | null
  /** File d'attente : retard toléré (minutes) avant que le client doive choisir */
  late_tolerance_minutes?: number
  created_at: string
  subscription?: SubscriptionSummary
}

export interface UpdateSalonPayload {
  name?: string
  phone?: string | null
  whatsapp_number?: string
  city?: string
  address?: string | null
  late_tolerance_minutes?: number
}
