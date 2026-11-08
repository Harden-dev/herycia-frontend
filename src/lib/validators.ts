import { z } from 'zod'

/* ---------- Noms (règles alignées sur le back, qui fait foi) ---------- */

/** Nom de personne : lettres, espace, - ' ’ . ; commence par une lettre. */
const PERSON_NAME = /^[\p{L}\p{M}][\p{L}\p{M} \-'’.]*$/u
const PERSON_NAME_CHAR = /[\p{L}\p{M} \-'’.]/u
/**
 * Nom de salon ou de prestation : en plus chiffres ASCII et , & ( ) + ; commence par une lettre ou
 * un chiffre. Les chiffres non ASCII (ex. arabes-indiens « ٠٧ ») sont refusés.
 */
const LABEL_NAME = /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9 \-'’.,&()+]*$/u
const LABEL_NAME_CHAR = /[\p{L}\p{M}0-9 \-'’.,&()+]/u
/** Lien, domaine ou suite de 8 chiffres ou plus (avec ou sans séparateurs). */
const HAS_LINK_OR_PHONE =
  /(\b[a-z][a-z0-9+.-]*:\/\/|\bwww\s*\.)|\+?[0-9](?:[\s.-]*[0-9]){7,}|[\p{L}\p{N}_-]+(?:\.|\s+\.\s*)\p{L}{2,}/iu

const NAME_MIN = 2
const NAME_MAX = 100

export const NAME_LINK_OR_PHONE_MESSAGE =
  'Ce nom ne doit contenir ni lien, ni adresse web, ni numéro de téléphone.'

function describeChar(char: string): string {
  if (char === ' ') return 'espace'
  if (char === '\n' || char === '\r') return 'saut de ligne'
  if (char === '\t') return 'tabulation'
  return char
}

/** Caractères refusés, ou le premier caractère s'il ne peut pas commencer un nom. */
function forbiddenChars(value: string, allowedChar: RegExp): string[] {
  const chars = Array.from(value)
  const invalid = chars.filter((c) => !allowedChar.test(c))
  const list = invalid.length > 0 ? invalid : chars.slice(0, 1)
  return [...new Set(list.map(describeChar))]
}

function nameSchema(fullPattern: RegExp, allowedChar: RegExp) {
  return z
    .string()
    .trim()
    .min(NAME_MIN, `Minimum ${NAME_MIN} caractères`)
    .max(NAME_MAX, `Maximum ${NAME_MAX} caractères`)
    .superRefine((value, ctx) => {
      // `.max()` n'interrompt pas superRefine : aucune regex sur une saisie trop longue (ReDoS).
      if (value.length > NAME_MAX) return
      if (HAS_LINK_OR_PHONE.test(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: NAME_LINK_OR_PHONE_MESSAGE })
        return
      }
      if (!fullPattern.test(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Ce nom contient des caractères non autorisés : ${forbiddenChars(value, allowedChar).join(' ')}`,
        })
      }
    })
}

/** Gérant, employé, client, réservation publique, sans rendez-vous. */
export const personName = nameSchema(PERSON_NAME, PERSON_NAME_CHAR)
/** Salon, prestation. */
export const labelName = nameSchema(LABEL_NAME, LABEL_NAME_CHAR)

/* ---------- Téléphone (Côte d'Ivoire) ---------- */

const PHONE_CI_FORMAT = /^225[0-9]{10}$/
const PHONE_CI_PREFIX = /^225(01|05|07|21|25|27)/
const LOCAL_PHONE_LENGTH = 10

/**
 * Ramène `2250707070707`, `+225 07 07 07 07 07`, `00225…` ou `0707070707` à `2250707070707`.
 * Les chiffres en trop sont conservés pour être refusés, jamais tronqués.
 */
export function normalizePhoneCI(raw: string): string {
  let digits = raw.trim().replace(/[\s.\-()]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  else if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === LOCAL_PHONE_LENGTH && digits.startsWith('0')) digits = `225${digits}`
  return digits
}

export const phoneCI = z
  .string()
  .transform(normalizePhoneCI)
  .pipe(
    z
      .string()
      .regex(PHONE_CI_FORMAT, 'Numéro invalide : 10 chiffres attendus (ex : 07 08 11 22 33)')
      .regex(PHONE_CI_PREFIX, 'Le numéro doit commencer par 01, 05, 07, 21, 25 ou 27'),
  )

/** Téléphone facultatif : vide accepté, sinon mêmes règles que `phoneCI`. */
export const optionalPhoneCI = z.string().superRefine((value, ctx) => {
  if (value.trim() === '') return
  const result = phoneCI.safeParse(value)
  if (!result.success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error.issues[0]?.message })
  }
})

/** Numéro facultatif prêt à envoyer : `null` si vide, sinon normalisé. */
export function normalizeOptionalPhoneCI(raw: string): string | null {
  return raw.trim() === '' ? null : normalizePhoneCI(raw)
}

/* ---------- Aide pour les formulaires sans vee-validate ---------- */

/** Premier message d'erreur du schéma, ou `null` si la valeur est valide. */
export function fieldError(schema: z.ZodTypeAny, value: unknown): string | null {
  const result = schema.safeParse(value)
  return result.success ? null : (result.error.issues[0]?.message ?? null)
}

/** Ne garde que les champs en erreur. */
export function collectErrors(checks: Record<string, string | null>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(checks).filter((entry): entry is [string, string] => entry[1] !== null),
  )
}
