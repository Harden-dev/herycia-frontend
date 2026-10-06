export interface PublicBookingEmployee {
  id: string
  name: string
}

export interface PublicBookingService {
  id: string
  name: string
  duration_min?: number
  price?: number
}

export interface PublicSalonBooking {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  employees: PublicBookingEmployee[]
  services: PublicBookingService[]
}

/** Réponse brute GET booking/{slug} */
export interface PublicBookingProfileResponse {
  salon: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
    city?: string | null
    whatsapp_number?: string | null
    booking_link?: string | null
  }
  services: PublicBookingService[]
  employees: PublicBookingEmployee[]
}

export interface CreatePublicBookingPayload {
  client_name: string
  client_phone: string
  service_id: string
  user_id: string
  date: string
  time: string
}

export interface PublicBookingCreated {
  id: string
  tracking_token: string
  tracking_link: string
  scheduled_at?: string
  status?: string
}

export interface PublicBookingSalonInfo {
  name: string
  logo_url?: string | null
  city?: string | null
  address?: string | null
  phone?: string | null
}

export interface PublicBookingTracking {
  id: string
  tracking_token: string
  tracking_link: string
  scheduled_at: string
  status: string
  /** Plus renvoyé par le suivi public (notes internes au salon) */
  notes?: string | null
  salon: PublicBookingSalonInfo
  service: {
    name: string
    duration_min: number
    price: number
  }
  employee: { name: string }
  client: { name: string }
}
