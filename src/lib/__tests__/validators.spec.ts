import { describe, expect, it } from 'vitest'
import {
  NAME_LINK_OR_PHONE_MESSAGE,
  collectErrors,
  fieldError,
  labelName,
  normalizeOptionalPhoneCI,
  normalizePhoneCI,
  optionalPhoneCI,
  personName,
  phoneCI,
} from '@/lib/validators'

describe('labelName (salon, prestation)', () => {
  it.each([
    'Coiffure - Barbe',
    'Coupe + barbe',
    'Michel Hair',
    'Tresses (enfant), 2 h & soin',
    "L'Élégance",
  ])('accepte « %s »', (value) => {
    expect(fieldError(labelName, value)).toBeNull()
  })

  it('refuse un slash en citant le caractère', () => {
    expect(fieldError(labelName, 'Coiffure/Barbe')).toBe(
      'Ce nom contient des caractères non autorisés : /',
    )
  })

  it('refuse un emoji', () => {
    expect(fieldError(labelName, 'Soin 🎁')).toBe(
      'Ce nom contient des caractères non autorisés : 🎁',
    )
  })

  it.each(['Soin\nvisage', 'Soin\tvisage'])('refuse saut de ligne et tabulation', (value) => {
    expect(fieldError(labelName, value)).toMatch(/^Ce nom contient des caractères non autorisés/)
  })

  it.each(['wave-ci.com', 'evil . example', 'https://x.io', 'www.salon', '07 00 00 00 00'])(
    'refuse un lien, un domaine ou un numéro : « %s »',
    (value) => {
      expect(fieldError(labelName, value)).toBe(NAME_LINK_OR_PHONE_MESSAGE)
    },
  )

  it('applique la longueur après trim', () => {
    expect(fieldError(labelName, '  A  ')).toBe('Minimum 2 caractères')
    expect(fieldError(labelName, 'a'.repeat(101))).toBe('Maximum 100 caractères')
    expect(labelName.parse('  Salon Awa  ')).toBe('Salon Awa')
  })
})

describe('personName (gérant, employé, client)', () => {
  it.each(['Awa Traoré', "N'Guessan Koffi", 'Jean-Marc', 'M. Kouassi', 'Aïcha’s'])(
    'accepte « %s »',
    (value) => {
      expect(fieldError(personName, value)).toBeNull()
    },
  )

  it('refuse les chiffres', () => {
    expect(fieldError(personName, 'Awa 2')).toBe('Ce nom contient des caractères non autorisés : 2')
  })

  it('refuse un nom qui ne commence pas par une lettre', () => {
    expect(fieldError(personName, '-Awa')).toBe('Ce nom contient des caractères non autorisés : -')
  })

  it.each(['wave-ci.com', '07 00 00 00 00'])('refuse « %s »', (value) => {
    expect(fieldError(personName, value)).toBe(NAME_LINK_OR_PHONE_MESSAGE)
  })
})

describe('téléphone CI', () => {
  it.each([
    ['2250707070707', '2250707070707'],
    ['+225 07 07 07 07 07', '2250707070707'],
    ['0707070707', '2250707070707'],
    ['07 07 07 07 07', '2250707070707'],
    ['00225 0101010101', '2250101010101'],
  ])('normalise « %s »', (raw, expected) => {
    expect(normalizePhoneCI(raw)).toBe(expected)
    expect(phoneCI.parse(raw)).toBe(expected)
  })

  it.each(['2250107070707', '2250507070707', '2252107070707', '2252507070707', '2252707070707'])(
    'accepte l’indicatif de %s',
    (value) => {
      expect(fieldError(phoneCI, value)).toBeNull()
    },
  )

  it('refuse les chiffres en trop au lieu de tronquer', () => {
    expect(fieldError(phoneCI, '22507070707070')).toMatch(/^Numéro invalide/)
  })

  it('refuse un indicatif inconnu', () => {
    expect(fieldError(phoneCI, '2250807070707')).toBe(
      'Le numéro doit commencer par 01, 05, 07, 21, 25 ou 27',
    )
  })

  it.each(['07070707', '07a7070707', ''])('refuse un format invalide « %s »', (value) => {
    expect(fieldError(phoneCI, value)).toMatch(/^Numéro invalide/)
  })
})

describe('collectErrors', () => {
  it('ne garde que les champs en erreur', () => {
    expect(collectErrors({ name: null, phone: 'Numéro invalide' })).toEqual({
      phone: 'Numéro invalide',
    })
  })
})

describe('robustesse et alignement sur le back', () => {
  it('refuse vite une saisie de plus de 100 caractères sans lancer les regex (ReDoS)', () => {
    const hostile = `${'a.'.repeat(50_000)}${'1 '.repeat(50_000)}!`
    const start = performance.now()
    expect(fieldError(labelName, hostile)).toBe('Maximum 100 caractères')
    expect(fieldError(personName, hostile)).toBe('Maximum 100 caractères')
    expect(performance.now() - start).toBeLessThan(200)
  })

  it.each(['Salon ٠٧٠٧', '٠٧ Coiffure'])('refuse les chiffres arabes-indiens « %s »', (value) => {
    expect(fieldError(labelName, value)).toMatch(/^Ce nom contient des caractères non autorisés/)
  })

  it('refuse les chiffres arabes-indiens dans un numéro', () => {
    expect(fieldError(phoneCI, '٠٧٠٧٠٧٠٧٠٧')).toMatch(/^Numéro invalide/)
  })
})

describe('optionalPhoneCI', () => {
  it.each(['', '   '])('accepte un champ vide « %s »', (value) => {
    expect(fieldError(optionalPhoneCI, value)).toBeNull()
    expect(normalizeOptionalPhoneCI(value)).toBeNull()
  })

  it('valide et normalise un numéro saisi', () => {
    expect(fieldError(optionalPhoneCI, '07 07 07 07 07')).toBeNull()
    expect(normalizeOptionalPhoneCI('07 07 07 07 07')).toBe('2250707070707')
    expect(fieldError(optionalPhoneCI, '2250807070707')).toBe(
      'Le numéro doit commencer par 01, 05, 07, 21, 25 ou 27',
    )
  })
})
