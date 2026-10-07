export type QueueEntryStatus = 'waiting' | 'called' | 'in_service' | 'done' | 'cancelled'
export type QueueEntrySource = 'appointment' | 'late' | 'walk_in'
export type LateChoice = 'reschedule' | 'queue'
export type QueueAction = 'call' | 'start' | 'done' | 'no-show' | 'cancel'

/** Suivi public d'une place dans la file (aucune donnée personnelle hormis le nom). */
export interface PublicQueueEntry {
  tracking_token: string
  tracking_link: string | null
  status: QueueEntryStatus
  source: QueueEntrySource | null
  /** 0 = en cours de prestation */
  position: number | null
  people_ahead: number | null
  estimated_start_at: string | null
  arrived_at: string | null
  called_at: string | null
  client: { name: string | null }
  service: { name: string | null; duration_min: number | null }
  stylist: { name: string | null }
  salon: { name: string | null; slug: string | null }
}

export interface CheckInAppointment {
  tracking_token: string | null
  tracking_link: string | null
  scheduled_at: string | null
  rescheduled_from: string | null
  service: { name: string | null }
  stylist: { name: string | null }
  client: { name: string | null }
}

export type CheckInResult =
  | { status: 'queued'; entry: PublicQueueEntry }
  | {
      status: 'late'
      late_tolerance_minutes: number
      appointment: CheckInAppointment
      options: {
        reschedule: { scheduled_at: string } | null
        queue: { position: number; people_ahead: number; estimated_start_at: string } | null
      }
    }
  | { status: 'rescheduled'; appointment: CheckInAppointment }

export interface QueueBoardRow {
  id: string
  status: QueueEntryStatus
  source: QueueEntrySource | null
  position: number | null
  estimated_start_at: string | null
  arrived_at: string | null
  called_at: string | null
  started_at: string | null
  client: { id: string | null; name: string | null; phone: string | null }
  service: { id: string | null; name: string | null; duration_min: number | null }
  appointment: { id: string; scheduled_at: string | null } | null
}

export interface QueueExpectedAppointment {
  id: string
  scheduled_at: string | null
  status: string
  is_late: boolean
  client: { id: string | null; name: string | null; phone: string | null }
  service: { id: string | null; name: string | null; duration_min: number | null }
}

export interface QueueBoard {
  late_tolerance_minutes: number
  stylists: {
    id: string
    name: string
    queue: QueueBoardRow[]
    expected: QueueExpectedAppointment[]
  }[]
}

export interface CheckinQr {
  checkin_url: string
  qr_code: string
  late_tolerance_minutes: number
}

/* ---------- V2 : clients sans rendez-vous ---------- */

export interface WalkInStylistOption {
  stylist: { id: string; name: string }
  position: number
  people_ahead: number
  estimated_start_at: string
  /** false : la prestation ne tient plus avant la fermeture */
  available: boolean
}

export interface WalkInOptions {
  first_available: {
    stylist: { id: string; name: string }
    position: number
    estimated_start_at: string
  } | null
  stylists: WalkInStylistOption[]
}

export interface WalkInService {
  id: string
  name: string
  duration_min: number
  price: number
}

export interface PublicWalkInData {
  salon: { name: string; slug: string }
  services: WalkInService[]
  options: WalkInOptions | null
}

export interface WalkInPayload {
  service_id: string
  /** Absent : premier coiffeur disponible */
  stylist_id?: string | null
  name: string
  phone: string
}
