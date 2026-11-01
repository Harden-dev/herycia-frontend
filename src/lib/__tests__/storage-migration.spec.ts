import { beforeEach, describe, expect, it } from 'vitest'
import { migrateLegacyStorageKeys } from '@/lib/storage-migration'

describe('migrateLegacyStorageKeys', () => {
  beforeEach(() => localStorage.clear())

  it('reprend les anciennes clés herycia_* sous manyan_* puis les supprime', () => {
    localStorage.setItem('herycia_token', 'jwt-123')
    localStorage.setItem('herycia_bookings', '[]')

    migrateLegacyStorageKeys()

    expect(localStorage.getItem('manyan_token')).toBe('jwt-123')
    expect(localStorage.getItem('manyan_bookings')).toBe('[]')
    expect(localStorage.getItem('herycia_token')).toBeNull()
    expect(localStorage.getItem('herycia_bookings')).toBeNull()
  })

  it('ne remplace jamais une valeur déjà présente sous la nouvelle clé', () => {
    localStorage.setItem('manyan_token', 'nouveau')
    localStorage.setItem('herycia_token', 'ancien')

    migrateLegacyStorageKeys()

    expect(localStorage.getItem('manyan_token')).toBe('nouveau')
    expect(localStorage.getItem('herycia_token')).toBeNull()
  })
})
