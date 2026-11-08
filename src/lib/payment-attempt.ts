/**
 * Tentative de paiement d'abonnement : une clé d'idempotence par salon et par plan, conservée
 * en sessionStorage pour survivre à la redirection vers GeniusPay (retour arrière, rechargement).
 */

/** Durée de vie d'une tentative, alignée sur l'expiration des liens de paiement GeniusPay. */
export const PAYMENT_ATTEMPT_TTL_MS = 30 * 60 * 1000

/** Domaines de paiement autorisés si `VITE_PAYMENT_HOSTS` n'est pas renseignée. */
export const DEFAULT_PAYMENT_HOSTS = ['pay.genius.ci']

const STORAGE_PREFIX = 'manyan_payment_attempt:'
const KEY_FORMAT = /^[A-Za-z0-9_-]{8,128}$/
const RANDOM_BYTES = 16
const HEX_RADIX = 16

export interface PaymentAttempt {
  planCode: string
  key: string
  createdAt: number
}

/** Repli si sessionStorage est indisponible (navigation privée, stockage bloqué). */
const memory = new Map<string, PaymentAttempt>()

function storageKey(salonId: string): string {
  return `${STORAGE_PREFIX}${salonId}`
}

/** `crypto.randomUUID`, sinon 16 octets de `crypto.getRandomValues` en hexadécimal. */
export function generateIdempotencyKey(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_BYTES))
  return Array.from(bytes, (b) => b.toString(HEX_RADIX).padStart(2, '0')).join('')
}

function isAttempt(value: unknown): value is PaymentAttempt {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.planCode === 'string' &&
    typeof v.key === 'string' &&
    KEY_FORMAT.test(v.key) &&
    typeof v.createdAt === 'number'
  )
}

function isAlive(attempt: PaymentAttempt, now: number): boolean {
  return attempt.createdAt <= now && now - attempt.createdAt < PAYMENT_ATTEMPT_TTL_MS
}

function readStored(salonId: string): PaymentAttempt | null {
  try {
    const raw = sessionStorage.getItem(storageKey(salonId))
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return isAttempt(parsed) ? parsed : null
  } catch (e) {
    console.warn('Tentative de paiement illisible, lecture en mémoire.', e)
    return memory.get(salonId) ?? null
  }
}

function writeStored(salonId: string, attempt: PaymentAttempt): void {
  memory.set(salonId, attempt)
  try {
    sessionStorage.setItem(storageKey(salonId), JSON.stringify(attempt))
  } catch (e) {
    console.warn('Tentative de paiement non persistée, conservée en mémoire.', e)
  }
}

export function clearPaymentAttempt(salonId: string): void {
  memory.delete(salonId)
  try {
    sessionStorage.removeItem(storageKey(salonId))
  } catch (e) {
    console.warn('Tentative de paiement non effacée du stockage.', e)
  }
}

/** Clé de la tentative en cours pour ce plan, ou nouvelle clé (autre plan, absente ou expirée). */
export function paymentKeyFor(salonId: string, planCode: string, now = Date.now()): string {
  const current = readStored(salonId)
  if (current && current.planCode === planCode && isAlive(current, now)) return current.key
  const next: PaymentAttempt = { planCode, key: generateIdempotencyKey(), createdAt: now }
  writeStored(salonId, next)
  return next.key
}

export function allowedPaymentHosts(raw: string | undefined = import.meta.env.VITE_PAYMENT_HOSTS): string[] {
  const hosts = (raw ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
  return hosts.length > 0 ? hosts : DEFAULT_PAYMENT_HOSTS
}

/** Lien de paiement en `https:` sur un domaine de la liste blanche (pas de `javascript:`, etc.). */
export function isAllowedPaymentUrl(raw: string, hosts: string[] = allowedPaymentHosts()): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  return url.protocol === 'https:' && hosts.includes(url.hostname.toLowerCase())
}
