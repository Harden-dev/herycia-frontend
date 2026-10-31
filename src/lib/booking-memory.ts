/**
 * Rendez-vous pris depuis ce téléphone, mémorisés localement pour que le client n'ait pas à
 * ressaisir son numéro en scannant le QR d'arrivée du salon.
 */
const STORAGE_KEY = 'herycia_bookings'
const MAX_ENTRIES = 20

export interface RememberedBooking {
  slug: string
  tracking_token: string
  scheduled_at: string
}

function read(): RememberedBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as RememberedBooking[]) : []
  } catch {
    return []
  }
}

function write(items: RememberedBooking[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-MAX_ENTRIES)))
  } catch {
    // Stockage indisponible (navigation privée) : le client saisira son numéro.
  }
}

export function rememberBooking(booking: RememberedBooking) {
  write([...read().filter((b) => b.tracking_token !== booking.tracking_token), booking])
}

/** Rendez-vous du jour pour ce salon, le plus proche de maintenant. */
export function findTodayBooking(slug: string, now = new Date()): RememberedBooking | null {
  const sameDay = (iso: string) => {
    const d = new Date(iso)
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    )
  }

  const candidates = read()
    .filter((b) => b.slug === slug && sameDay(b.scheduled_at))
    .sort(
      (a, b) =>
        Math.abs(new Date(a.scheduled_at).getTime() - now.getTime()) -
        Math.abs(new Date(b.scheduled_at).getTime() - now.getTime()),
    )

  return candidates[0] ?? null
}
