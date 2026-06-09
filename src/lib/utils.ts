import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-CI', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-CI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTimeShort(date: string | Date): string {
  const d = new Date(date)
  const datePart = new Intl.DateTimeFormat('fr-CI', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(d)
  const timePart = new Intl.DateTimeFormat('fr-CI', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
  return `${datePart} - ${timePart}`
}

export function shortId(id: string, length = 8): string {
  return id.replace(/-/g, '').slice(0, length).toUpperCase()
}

export function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' F'
}

export function formatPhone(phone: string): string {
  if (phone.length === 13 && phone.startsWith('225')) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`
  }
  return phone
}

/** yyyy-MM-dd → dd-MM-yyyy */
export function isoToDMY(iso: string | null | undefined): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`
}

/** dd-MM-yyyy → yyyy-MM-dd (API) */
export function dmyToIso(dmy: string): string {
  const parts = dmy.split('-')
  if (parts.length !== 3) return dmy
  const [d, m, y] = parts
  if (!d || !m || !y) return dmy
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

export function todayDMY(): string {
  return isoToDMY(new Date().toISOString().slice(0, 10))
}

/** URL absolue pour logos / médias renvoyés en chemin relatif par l'API */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}
