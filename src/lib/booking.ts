export function getBookingPath(slug: string): string {
  return `/booking/${slug}`
}

export function getBookingUrl(slug: string): string {
  const path = getBookingPath(slug)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return path
}

export function getRdvTrackPath(token: string): string {
  return `/rdv/${token}`
}

/** Chemin frontend depuis tracking_link API (ex. /rdv/BSFX8Dks9N) */
export function pathFromTrackingLink(link: string): string | null {
  try {
    const url = link.startsWith('http') ? new URL(link) : new URL(link, 'http://local')
    const match = url.pathname.match(/\/rdv\/([^/]+)/)
    const token = match?.[1]
    return token ? getRdvTrackPath(token) : null
  } catch {
    const match = link.match(/\/rdv\/([^/?#]+)/)
    const token = match?.[1]
    return token ? getRdvTrackPath(token) : null
  }
}

export function slugFromBookingLink(link: string): string | null {
  try {
    const url = link.startsWith('http') ? new URL(link) : new URL(link, 'http://local')
    const match = url.pathname.match(/\/booking\/([^/]+)/)
    return match?.[1] ?? null
  } catch {
    const match = link.match(/\/booking\/([^/?#]+)/)
    return match?.[1] ?? null
  }
}
